// Supabase Edge Function: sync-ytimes-menu
// Синхронизирует цены и стоп-лист YTimes с меню сайта.
// Вызывается вручную из админки (JWT администратора) или по расписанию
// с service_role ключом.

const YTIMES_API = "https://api.ytimes.ru/ex";
const DEFAULT_SHOP_GUID = "d43b6fb9-7176-4e4f-8271-5fbb88f26ba6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  return String(value || "").replace(/мл\./gi, "мл").trim();
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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ success: false, code: "METHOD", message: "Метод не поддерживается." }, 405);
  }

  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const jwt = decodeJwtPayload(bearer);
  const isService = jwt?.role === "service_role";
  const isAdmin = jwt?.app_metadata?.role === "admin";
  if (!isService && !isAdmin) {
    return json({ success: false, code: "FORBIDDEN", message: "Нет доступа к синхронизации." }, 403);
  }

  const apiKey = env("YTIMES_API_KEY");
  const shopGuid = env("YTIMES_SHOP_GUID") || DEFAULT_SHOP_GUID;
  if (!apiKey) {
    return json({ success: false, code: "SERVER_CONFIG", message: "Нет ключа YTimes." }, 500);
  }

  try {
    const configRows = await supabaseFetch("site_settings?id=eq.1&select=config");
    const config = configRows?.[0]?.config;
    if (!config || !Array.isArray(config.drinks)) {
      return json({ success: false, code: "CONFIG", message: "Меню сайта не найдено." }, 500);
    }
    if (!config.ytimesMap || typeof config.ytimesMap !== "object") {
      return json({ success: false, code: "MAP", message: "В site_settings нет ytimesMap." }, 500);
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
      const togoTypes = (item.typeList || []).filter((type: any) => type?.isTogo);
      const sourceTypes = togoTypes.length ? togoTypes : (item.typeList || []);
      const priceByLabel = new Map<string, number>();
      for (const type of sourceTypes) {
        priceByLabel.set(normalizeLabel(type?.name), Number(type?.price) || 0);
      }
      for (const option of drink.volumeOptions) {
        const price = priceByLabel.get(normalizeLabel(option.label));
        if (Number.isFinite(price)) option.price = price;
      }
      if (drink.volumeOptions.length) {
        drink.basePrice = Number(drink.volumeOptions[0].price) || drink.basePrice;
        drink.defaultVol = drink.volumeOptions[0].label;
      }

      const volumeLabels = drink.volumeOptions.map((option: any) => String(option.label));
      const stopRow = stopByGuid.get(String(mapping.item));
      if (!stopRow) {
        drink.stopped = false;
        drink.stoppedVolumes = [];
      } else if (!Array.isArray(stopRow.typeList) || stopRow.typeList.length === 0) {
        drink.stopped = true;
        drink.stoppedVolumes = volumeLabels;
        stoppedDrinks++;
      } else {
        const stoppedLabels = new Set(
          stopRow.typeList.map((type: any) => normalizeLabel(type?.name)),
        );
        drink.stoppedVolumes = volumeLabels.filter((label: string) => stoppedLabels.has(normalizeLabel(label)));
        drink.stopped = volumeLabels.length > 0 && drink.stoppedVolumes.length >= volumeLabels.length;
        if (drink.stopped) {
          stoppedDrinks++;
        } else if (drink.stoppedVolumes.length > 0) {
          partialStops++;
        }
      }

      updatedDrinks++;
    }

    config.menuSyncedAt = new Date().toISOString();
    config.menuSyncSource = "ytimes";
    await supabaseFetch("site_settings?id=eq.1", {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ config }),
    });

    return json({
      success: true,
      updatedDrinks,
      stoppedDrinks,
      partialStops,
      skippedDrinks,
      syncedAt: config.menuSyncedAt,
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
