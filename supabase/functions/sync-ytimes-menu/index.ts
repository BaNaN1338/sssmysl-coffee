// Supabase Edge Function: sync-ytimes-menu
// Синхронизирует меню YTimes с сайтом:
// - обновляет цены объёмов и стоп-лист;
// - автоматически добавляет новые напитки из YTimes;
// - не трогает еду, добавки, мерч и служебные группы.
//
// Вызывается из админки (JWT администратора), по Supabase Cron
// (заголовок x-sync-secret) или вручную с service_role ключом.

const YTIMES_API = "https://api.ytimes.ru/ex";
const DEFAULT_SHOP_GUID = "d43b6fb9-7176-4e4f-8271-5fbb88f26ba6";

// Группы, которые не являются напитками для онлайн-меню.
const EXCLUDED_GROUP_RE =
  /добавк|сироп|топпинг|соус|сэндвич|вафл|выпеч|круассан|суп|десерт|еда|новое меню|завтрак|обед|салат|паста|каш|блин|сырник|омлет|тартин|шакшук|ролл|мерч|посуда|зерно|прикасс|комбо|конструктор/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function env(name: string): string {
  return String(Deno.env.get(name) || "").trim();
}

function normalizeLabel(value: unknown): string {
  return String(value || "").replace(/мл\./gi, "мл").replace(/\s+/g, " ").trim();
}

function normalizeTitle(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[«»"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function decodeJwtPayload(token: string): any {
  const part = token.split(".")[1];
  if (!part) return null;
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

async function supabaseFetch(path: string, options: RequestInit = {}): Promise<any> {
  const base = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !key) throw new Error("Нет SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }
  return data;
}

async function ytimesGet(path: string, apiKey: string): Promise<any> {
  const response = await fetch(`${YTIMES_API}${path}`, {
    headers: {
      Accept: "application/json;charset=UTF-8",
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: apiKey,
    },
  });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok || !data?.success) {
    throw new Error(data?.error?.message || `YTimes HTTP ${response.status}`);
  }
  return data;
}

type MenuTypePair = { togo?: string; in?: string };

function buildVolumeData(item: any): {
  volumeOptions: Array<{ label: string; price: number }>;
  types: Record<string, MenuTypePair>;
  fallback: MenuTypePair;
} | null {
  const typesList = Array.isArray(item?.typeList) ? item.typeList : [];
  const togoByLabel = new Map<string, { price: number; guid: string }>();
  const inByLabel = new Map<string, string>();

  for (const type of typesList) {
    const label = normalizeLabel(type?.name);
    if (!label) continue;
    const price = Number(type?.price) || 0;
    if (type?.isTogo) {
      if (price > 0 && !togoByLabel.has(label)) {
        togoByLabel.set(label, { price, guid: String(type?.guid || "") });
      }
    } else if (!inByLabel.has(label)) {
      inByLabel.set(label, String(type?.guid || ""));
    }
  }

  const volumeOptions = [...togoByLabel.entries()].map(([label, data]) => ({
    label,
    price: data.price,
  }));
  if (!volumeOptions.length) return null;

  const types: Record<string, MenuTypePair> = {};
  for (const option of volumeOptions) {
    const pair: MenuTypePair = {
      togo: togoByLabel.get(option.label)?.guid || "",
      in: inByLabel.get(option.label) || "",
    };
    // Точное название объёма — важно для «350 мл горячий / холодный».
    if (pair.togo || pair.in) types[option.label] = pair;
    const numeric = digitsOnly(option.label);
    if (numeric && !types[numeric]) types[numeric] = pair;
  }

  const first = volumeOptions[0];
  return {
    volumeOptions,
    types,
    fallback: {
      togo: togoByLabel.get(first.label)?.guid || "",
      in: inByLabel.get(first.label) || "",
    },
  };
}

function inferCategory(groupName: string, itemName: string): string {
  if (/фирмен|автор/i.test(groupName)) return "signature";
  if (/сезон|осень|зима|весна|лето|летн|праздник|хэллоуин|новогод/i.test(groupName)) return "seasonal";
  if (/чай|ройбуш/i.test(itemName)) return "tea";
  if (/матча|какао|ходзича|лимонад/i.test(itemName)) return "noncoffee";
  if (/кофе/i.test(groupName)) return "coffee";
  if (/напит/i.test(groupName)) return "noncoffee";
  return "signature";
}

function inferArt(name: string): string {
  if (/матча|matcha/i.test(name)) return "matcha";
  if (/какао|шоколад/i.test(name)) return "cocoa";
  if (/чай|ройбуш|ходзича/i.test(name)) return "tea";
  if (/капучино/i.test(name)) return "cappuccino";
  if (/американо|эспрессо|фильтр|пуровер|аэропресс/i.test(name)) return "americano";
  if (/лимонад|тоник/i.test(name)) return "tea";
  return "latte";
}

function applyPrices(drink: any, item: any): void {
  const options = Array.isArray(drink.volumeOptions) ? drink.volumeOptions : [];
  if (!options.length) return;

  const togoTypes = (item.typeList || []).filter(
    (type: any) => type?.isTogo && Number(type?.price) > 0,
  );
  const sourceTypes = togoTypes.length
    ? togoTypes
    : (item.typeList || []).filter((type: any) => Number(type?.price) > 0);

  const priceByLabel = new Map<string, number>();
  for (const type of sourceTypes) {
    const label = normalizeLabel(type?.name);
    if (label && !priceByLabel.has(label)) {
      priceByLabel.set(label, Number(type.price) || 0);
    }
  }

  for (const option of options) {
    const price = priceByLabel.get(normalizeLabel(option.label));
    if (Number.isFinite(price) && Number(price) > 0) {
      option.price = Number(price);
    }
  }

  if (options.length) {
    drink.basePrice = Number(options[0].price) || drink.basePrice;
    drink.defaultVol = options[0].label;
  }
}

function applyStopState(drink: any, stopRow: any): "stopped" | "partial" | "none" {
  const labels = (Array.isArray(drink.volumeOptions) ? drink.volumeOptions : [])
    .map((option: any) => String(option.label));

  if (!stopRow) {
    drink.stopped = false;
    drink.stoppedVolumes = [];
    return "none";
  }
  if (!Array.isArray(stopRow.typeList) || stopRow.typeList.length === 0) {
    drink.stopped = true;
    drink.stoppedVolumes = labels;
    return "stopped";
  }

  const stoppedLabels = new Set(
    stopRow.typeList.map((type: any) => normalizeLabel(type?.name)),
  );
  drink.stoppedVolumes = labels.filter((label: string) =>
    stoppedLabels.has(normalizeLabel(label))
  );
  drink.stopped = labels.length > 0 && drink.stoppedVolumes.length >= labels.length;

  if (drink.stopped) return "stopped";
  if (drink.stoppedVolumes.length > 0) return "partial";
  return "none";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ success: false, code: "METHOD", message: "Метод не поддерживается." }, 405);
  }

  const cronSecret = env("SYNC_CRON_SECRET");
  const incomingCronSecret = request.headers.get("x-sync-secret") || "";
  const isCron = !!cronSecret && incomingCronSecret === cronSecret;

  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const jwt = decodeJwtPayload(bearer);
  const isService = jwt?.role === "service_role";
  const isAdmin = jwt?.app_metadata?.role === "admin";

  if (!isService && !isAdmin && !isCron) {
    return json({ success: false, code: "FORBIDDEN", message: "Нет доступа к синхронизации." }, 403);
  }

  const apiKey = env("YTIMES_API_KEY");
  const shopGuid = env("YTIMES_SHOP_GUID") || DEFAULT_SHOP_GUID;
  if (!apiKey) {
    return json({ success: false, code: "SERVER_CONFIG", message: "Нет ключа YTimes." }, 500);
  }

  try {
    let dryRun = false;
    try {
      const body = await request.clone().json();
      dryRun = body?.dryRun === true;
    } catch {
      dryRun = false;
    }

    const configRows = await supabaseFetch("site_settings?id=eq.1&select=config");
    const config = configRows?.[0]?.config;
    if (!config || !Array.isArray(config.drinks)) {
      return json({ success: false, code: "CONFIG", message: "Меню сайта не найдено." }, 500);
    }
    if (!config.ytimesMap || typeof config.ytimesMap !== "object") {
      return json({ success: false, code: "MAP", message: "В site_settings нет ytimesMap." }, 500);
    }
    if (!Array.isArray(config.ytimesIgnored)) {
      config.ytimesIgnored = [];
    }

    const [menu, stop] = await Promise.all([
      ytimesGet(`/menu/item/list?shopGuid=${encodeURIComponent(shopGuid)}`, apiKey),
      ytimesGet(`/menu/stop/list/item?shopGuid=${encodeURIComponent(shopGuid)}`, apiKey),
    ]);

    const menuByGuid = new Map<string, any>();
    for (const group of menu?.rows || []) {
      for (const item of group?.itemList || []) {
        if (item?.guid) menuByGuid.set(String(item.guid), item);
      }
    }
    const stopByGuid = new Map<string, any>();
    for (const row of stop?.rows || []) {
      if (row?.guid) stopByGuid.set(String(row.guid), row);
    }

    const mappedGuids = new Set<string>();
    for (const mapping of Object.values(config.ytimesMap || {})) {
      if (mapping && typeof mapping === "object" && (mapping as any).item) {
        mappedGuids.add(String((mapping as any).item));
      }
    }

    const usedIds = new Set(config.drinks.map((drink: any) => String(drink.id)));
    const existingTitles = new Set(
      config.drinks.map((drink: any) => normalizeTitle(drink.title)),
    );
    const ignoredGuids = new Set(
      (config.ytimesIgnored || []).map((guid: unknown) => String(guid)),
    );

    let addedDrinks = 0;
    let skippedExisting = 0;
    let skippedIgnored = 0;
    let skippedWithoutTogo = 0;
    const addedTitles: string[] = [];

    // 1. Добавляем новые напитки, которых ещё нет в ytimesMap.
    for (const group of menu?.rows || []) {
      const groupName = String(group?.name || "");
      if (EXCLUDED_GROUP_RE.test(groupName)) continue;
      for (const item of group?.itemList || []) {
        const guid = String(item?.guid || "");
        if (!guid || mappedGuids.has(guid)) continue;
        if (ignoredGuids.has(guid)) {
          skippedIgnored++;
          continue;
        }

        const title = String(item?.name || "").trim();
        if (!title) continue;
        if (existingTitles.has(normalizeTitle(title))) {
          skippedExisting++;
          continue;
        }

        const volumeData = buildVolumeData(item);
        if (!volumeData) {
          skippedWithoutTogo++;
          continue;
        }

        const cleanGuid = guid.replace(/-/g, "");
        let id = "";
        for (const length of [10, 12, 14, 16, 32]) {
          const candidate = `yt-${cleanGuid.slice(0, length)}`;
          if (!usedIds.has(candidate)) {
            id = candidate;
            break;
          }
        }
        if (!id) continue;

        const drink = {
          id,
          category: inferCategory(groupName, title),
          title,
          desc: String(item?.description || "").trim(),
          basePrice: volumeData.volumeOptions[0].price,
          defaultVol: volumeData.volumeOptions[0].label,
          volumeOptions: volumeData.volumeOptions,
          kbzhu: "",
          art: inferArt(title),
          image: item?.imageLink ? String(item.imageLink) : "",
          stopped: false,
          stoppedVolumes: [],
        };

        config.drinks.push(drink);
        config.ytimesMap[id] = {
          item: guid,
          types: volumeData.types,
          fallback: volumeData.fallback,
        };
        usedIds.add(id);
        existingTitles.add(normalizeTitle(title));
        mappedGuids.add(guid);
        addedDrinks++;
        addedTitles.push(title);
      }
    }

    // 2. Обновляем цены и стоп-лист у всех позиций, включая новые.
    let updatedDrinks = 0;
    let stoppedDrinks = 0;
    let partialStops = 0;
    let skippedDrinks = 0;

    for (const drink of config.drinks) {
      const mapping = config.ytimesMap[drink.id];
      if (!mapping || !mapping.item) {
        skippedDrinks++;
        continue;
      }
      const item = menuByGuid.get(String(mapping.item));
      if (!item) {
        skippedDrinks++;
        continue;
      }

      if (!Array.isArray(drink.volumeOptions)) drink.volumeOptions = [];
      if (!drink.volumeOptions.length) {
        const volumeData = buildVolumeData(item);
        if (volumeData) drink.volumeOptions = volumeData.volumeOptions;
      }

      applyPrices(drink, item);
      const stopState = applyStopState(drink, stopByGuid.get(String(mapping.item)));
      if (stopState === "stopped") stoppedDrinks++;
      else if (stopState === "partial") partialStops++;

      updatedDrinks++;
    }

    if (!dryRun) {
      config.menuSyncedAt = new Date().toISOString();
      config.menuSyncSource = "ytimes";
      await supabaseFetch("site_settings?id=eq.1", {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ config }),
      });
    }

    return json({
      success: true,
      dryRun,
      addedDrinks,
      addedTitles: addedTitles.slice(0, 50),
      updatedDrinks,
      stoppedDrinks,
      partialStops,
      skippedDrinks,
      skippedExisting,
      skippedIgnored,
      skippedWithoutTogo,
      syncedAt: dryRun ? new Date().toISOString() : config.menuSyncedAt,
    });
  } catch (error) {
    console.error("sync-ytimes-menu failed", error);
    return json({
      success: false,
      code: "SYNC_ERROR",
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
