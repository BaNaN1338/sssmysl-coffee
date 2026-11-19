// Supabase Edge Function: create-order
// Принимает предзаказ с сайта «Смысл», проверяет цены по актуальному
// конфигу site_settings и отправляет заказ в YTimes (оплата на кассе).

const YTIMES_API = "https://api.ytimes.ru/ex";
const DEFAULT_SHOP_GUID = "d43b6fb9-7176-4e4f-8271-5fbb88f26ba6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Соответствие позиций сайта (id напитка) позициям меню YTimes.
// types — варианты порции по объёму сайта. Для каждого объёма хранятся
// оба GUID: togo («с собой») и in («в зале»). fallback — если точного объёма нет.
const DRINK_MAP = JSON.parse(String.raw`{"s5":{"item":"2e6fb4c6-6fd4-4801-b3c4-ea50d5876efd","types":{"350":{"togo":"1339ef59-5b88-4129-9053-ce3f2530e91b","in":"a5a3e0c8-b637-4bbc-be14-bbc7c7dfb89b"}},"fallback":{"togo":"1339ef59-5b88-4129-9053-ce3f2530e91b","in":"a5a3e0c8-b637-4bbc-be14-bbc7c7dfb89b"}},"s7":{"item":"cc5ff2ff-a2fa-4a0b-aa72-c0f395d2ec98","types":{"350":{"togo":"8bb57e17-e062-4043-81d9-c1653eff2200","in":"072a2d13-61de-446c-af17-ffbba72e839d"}},"fallback":{"togo":"8bb57e17-e062-4043-81d9-c1653eff2200","in":"072a2d13-61de-446c-af17-ffbba72e839d"}},"c6":{"item":"6ddf5045-14f3-419e-936b-04c36041ccf2","types":{"350":{"togo":"86fbcf92-93fb-4254-9845-1e7b97e36b9a","in":"73ddc7e6-d39e-4558-a2c8-ccf0109525e4"}},"fallback":{"togo":"86fbcf92-93fb-4254-9845-1e7b97e36b9a","in":"73ddc7e6-d39e-4558-a2c8-ccf0109525e4"}},"a4":{"item":"21f5f3ec-8657-4397-9e85-91004c942378","types":{"350":{"togo":"9b01ea1b-3d26-4cf2-ab99-cbc4886c7e6c","in":"9926f4ce-884c-44b3-8137-82e611ebdc19"}},"fallback":{"togo":"9b01ea1b-3d26-4cf2-ab99-cbc4886c7e6c","in":"9926f4ce-884c-44b3-8137-82e611ebdc19"}},"s2":{"item":"35af23ad-3799-4f15-8847-01c613da1b33","types":{"350":{"togo":"6e652cf8-aa32-400d-9e33-8c2d62acb997","in":"5cc54687-0ba1-4280-a256-999fb9930771"}},"fallback":{"togo":"6e652cf8-aa32-400d-9e33-8c2d62acb997","in":"5cc54687-0ba1-4280-a256-999fb9930771"}},"a2":{"item":"5f852e2c-7aa0-4581-9058-33dc9f1f8884","types":{"350":{"togo":"64495409-836a-4592-8106-21464c3db37f","in":"9f564be0-364b-49f4-8133-4f18b9d0e26e"}},"fallback":{"togo":"64495409-836a-4592-8106-21464c3db37f","in":"9f564be0-364b-49f4-8133-4f18b9d0e26e"}},"c1":{"item":"5523825b-b55b-4770-a8a1-94f48efefaa3","types":{},"fallback":{"in":"1572b941-f201-48fc-8288-9414fc96fd56","togo":"60898b8c-6a7e-4e1b-89ce-f188a0d08d0e"}},"a5":{"item":"2e1184da-6c48-44bb-ab92-47a1d421436d","types":{"350":{"togo":"3103da10-160a-455b-9fda-72489bbf79e0","in":"68eba6a5-6439-4100-af7d-eab8e909ff41"}},"fallback":{"togo":"3103da10-160a-455b-9fda-72489bbf79e0","in":"68eba6a5-6439-4100-af7d-eab8e909ff41"}},"c8":{"item":"cd1e60be-9859-4a97-8f82-6d67f67c99a9","types":{"250":{"togo":"f02c4fd8-49dd-4608-819a-8fb4170f098c","in":"3100e027-10bb-45fa-bb45-d7814674d1e2"}},"fallback":{"togo":"f02c4fd8-49dd-4608-819a-8fb4170f098c","in":"3100e027-10bb-45fa-bb45-d7814674d1e2"}},"n1":{"item":"9422e6e0-9a62-4b7c-908a-0e2e358f7748","types":{"200":{"togo":"9a052145-8a25-49ec-9d6f-b566d828ef9c","in":"1b4cead7-5f30-4e76-bd62-33fd4a329f48"},"350":{"togo":"335f5202-72c2-455a-8b6b-89db5ee92235","in":"35e32b9f-98e8-4fea-acb3-c3573b35c0f3"}},"fallback":{"togo":"9a052145-8a25-49ec-9d6f-b566d828ef9c","in":"1b4cead7-5f30-4e76-bd62-33fd4a329f48"}},"s8":{"item":"63a6fdb4-d657-4849-b0b5-96e2735be674","types":{"350":{"togo":"a8f89fe0-d108-4fe7-ba6f-aba8f6a0907f","in":"ff040ab5-6aa7-44c8-8d9a-a8f24647e88d"}},"fallback":{"togo":"a8f89fe0-d108-4fe7-ba6f-aba8f6a0907f","in":"ff040ab5-6aa7-44c8-8d9a-a8f24647e88d"}},"c2":{"item":"7d37b392-a4d1-4220-9943-909bb9ff941c","types":{"200":{"togo":"b4a6ee95-bbe5-47fd-aecb-e05c924ca4e7","in":"ad248ab5-ad15-4669-bde4-b3e845eba102"},"350":{"togo":"16d3f85a-8469-4f40-bc30-75740baefc8f","in":"74851858-dd68-4018-b014-27f0346bd612"}},"fallback":{"togo":"b4a6ee95-bbe5-47fd-aecb-e05c924ca4e7","in":"ad248ab5-ad15-4669-bde4-b3e845eba102"}},"a3":{"item":"a15dadd0-3c3f-4798-9da2-1102923f814b","types":{"350":{"togo":"5c9797dc-2bb3-45a2-a69a-c55d808aa974","in":"c6fb9774-e704-4710-a298-5f56f08e484c"}},"fallback":{"togo":"5c9797dc-2bb3-45a2-a69a-c55d808aa974","in":"c6fb9774-e704-4710-a298-5f56f08e484c"}},"t2":{"item":"764b7c8b-c50a-41b9-b0e8-b91b08538612","types":{"400":{"togo":"aa659aff-7ddd-4610-a2dc-780abca9e898","in":"0f9d31a2-89d1-4e58-954f-42d679882e0f"}},"fallback":{"togo":"aa659aff-7ddd-4610-a2dc-780abca9e898","in":"0f9d31a2-89d1-4e58-954f-42d679882e0f"}},"s6":{"item":"0d9652e0-cf06-4536-9a96-c8d91171f082","types":{"350":{"togo":"82e4ad00-4e0d-4a77-ba06-9a1698a3e929","in":"16ad85d0-1d0b-402b-acc4-1922b6dc943c"}},"fallback":{"togo":"82e4ad00-4e0d-4a77-ba06-9a1698a3e929","in":"16ad85d0-1d0b-402b-acc4-1922b6dc943c"}},"c3":{"item":"a198990c-220b-493d-bcdb-5f4ad2ed5dcf","types":{"200":{"togo":"af0d9445-5097-471e-90f7-67b647799347","in":"d27f679b-a46e-46e0-9153-291dd0215231"},"350":{"togo":"e503947f-6f27-4a08-ba22-afdc1bdcadba","in":"51fc170d-7a08-4f4f-884d-945e13755cc5"}},"fallback":{"togo":"af0d9445-5097-471e-90f7-67b647799347","in":"d27f679b-a46e-46e0-9153-291dd0215231"}},"s1":{"item":"93302fda-7119-4d51-ab34-d6fa5ebc0c2b","types":{"350":{"togo":"cf0a31df-83b7-4da7-90c4-4a558acb56a7","in":"6e1060b9-8402-4793-a36e-633bb757fa76"}},"fallback":{"togo":"cf0a31df-83b7-4da7-90c4-4a558acb56a7","in":"6e1060b9-8402-4793-a36e-633bb757fa76"}},"c9":{"item":"e76c3bb1-a23a-4cb2-aa36-f8a2caa01814","types":{"250":{"togo":"7661ed6c-97ca-4644-938f-d0882da43f1d","in":"6523758a-e475-42e3-8a19-c50d0aaa9a74"}},"fallback":{"togo":"7661ed6c-97ca-4644-938f-d0882da43f1d","in":"6523758a-e475-42e3-8a19-c50d0aaa9a74"}},"c4":{"item":"4a4e1c43-501b-47aa-8a0a-3b463f684e6d","types":{"200":{"togo":"ec07e400-e0ca-407d-ba0e-313a5ae3c02f","in":"be1e180e-694b-4715-a391-893463e27128"}},"fallback":{"togo":"ec07e400-e0ca-407d-ba0e-313a5ae3c02f","in":"be1e180e-694b-4715-a391-893463e27128"}},"t1":{"item":"f65a4c2f-ec40-4b68-b48e-563b111c51a5","types":{"200":{"togo":"09f996f8-56fc-4a3a-b657-d60ddfa760f0","in":"1e65d66e-338e-4fd2-952b-958ce90a2524"},"350":{"togo":"59b1de6b-a5ed-4559-824a-ecc2fdaadf2e","in":"ae6cc998-114e-4442-a333-bc7e10a5ea4e"}},"fallback":{"togo":"09f996f8-56fc-4a3a-b657-d60ddfa760f0","in":"1e65d66e-338e-4fd2-952b-958ce90a2524"}},"c5":{"item":"857f4626-8003-4b6b-90ac-812cd993579e","types":{"350":{"togo":"c0c5869d-7bb4-495a-92d7-ab386f280cf6","in":"8b1ad4d7-e113-4148-962f-b6c6b26ea172"}},"fallback":{"togo":"c0c5869d-7bb4-495a-92d7-ab386f280cf6","in":"8b1ad4d7-e113-4148-962f-b6c6b26ea172"}},"n2":{"item":"5c0b7851-9021-4b78-9666-d5f565268150","types":{"200":{"togo":"07702432-7e43-422c-84a8-4695505ebf28","in":"8d9539ca-71e0-437e-92b6-222480a37f8d"},"350":{"togo":"c9a018ce-b682-4072-b4d4-54e58f0705be","in":"82f1aa59-7298-4a05-aab9-d60e20eccb42"}},"fallback":{"togo":"07702432-7e43-422c-84a8-4695505ebf28","in":"8d9539ca-71e0-437e-92b6-222480a37f8d"}},"s3":{"item":"6ec2dcd5-bd40-43d3-bc25-fa4424b337dc","types":{"350":{"togo":"cf65f05c-576d-476f-b624-97ffba29d084","in":"f8e3a91b-8e64-422f-8f16-407c4c99b2bf"}},"fallback":{"togo":"cf65f05c-576d-476f-b624-97ffba29d084","in":"f8e3a91b-8e64-422f-8f16-407c4c99b2bf"}},"c7":{"item":"ff739d63-e61c-483a-b13e-d3dc7552e510","types":{"200":{"togo":"b120f558-6bf4-419d-a129-29d85e4d3657","in":"80056a72-4cd4-4dd9-837b-854a02cfa7fe"},"350":{"togo":"0fa7752f-1e1d-483b-ab19-c492e4c17cfd","in":"4b6eb953-e700-4d19-b032-ac893fdf08e3"}},"fallback":{"togo":"b120f558-6bf4-419d-a129-29d85e4d3657","in":"80056a72-4cd4-4dd9-837b-854a02cfa7fe"}},"a1":{"item":"b4bf07ab-3db4-4fbb-833b-ef9b1501e4eb","types":{"350":{"togo":"57e3647a-7320-47cd-b8d7-1f57742c1602","in":"18266f36-4132-4a10-93c0-21f1539b908f"}},"fallback":{"togo":"57e3647a-7320-47cd-b8d7-1f57742c1602","in":"18266f36-4132-4a10-93c0-21f1539b908f"}},"s4":{"item":"4f658e62-9a4c-4be6-9e45-6f7eef3f104a","types":{"350":{"togo":"62ee9c1d-5224-433a-9ab4-045f7f5b803a","in":"4d57c50f-ef8c-43e2-a31b-3f587a270d4c"}},"fallback":{"togo":"62ee9c1d-5224-433a-9ab4-045f7f5b803a","in":"4d57c50f-ef8c-43e2-a31b-3f587a270d4c"}},"n3":{"item":"80cad0e8-1d9b-4057-bdec-2bdd7e035e78","types":{"350":{"togo":"00963512-c66c-459e-b4a3-7706217cf156","in":"7651a254-5e4f-43da-a92d-596792edd55b"}},"fallback":{"togo":"00963512-c66c-459e-b4a3-7706217cf156","in":"7651a254-5e4f-43da-a92d-596792edd55b"}}}`);

// Добавки YTimes, которые можно передать в supplementList.
const MILK_SUPPLEMENTS: Record<string, string> = {
  "Кокосовое": "cde50612-5f20-4228-9013-d31e63a86a62",
  "Банановое": "29030cad-626c-4f8a-ad3b-d218e7b495f5",
  "Миндальное": "ed862fd5-49d6-4a02-8e9a-90b889c6799a",
  "Овсяное": "89ba4d02-15cb-4840-9eb4-c8ca69407078",
};

const SYRUP_SUPPLEMENTS: Record<string, string> = {
  "Солёная карамель": "e0ff97dc-6f5a-4a69-a9c4-949441be930b",
  "Ваниль": "5646e6f9-8497-47eb-bb1b-41081368a788",
  "Лесной орех": "0c088a17-a327-46e6-b281-9b4917f7d438",
  "Лаванда": "0c088a17-a327-46e6-b281-9b4917f7d438",
};

class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function env(name: string): string {
  return String(Deno.env.get(name) || "").trim();
}

function shopGuidForLocation(locationId: string): string | null {
  if (locationId === "1") return env("YTIMES_SHOP_GUID") || DEFAULT_SHOP_GUID;
  if (locationId === "2") return env("YTIMES_SHOP_GUID_GORKOGO") || null;
  return null;
}

function isUuid(value: unknown): boolean {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type MenuTypePair = { togo?: string; in?: string };

function resolveMenuType(pair: MenuTypePair | string | undefined, orderType: string): string {
  if (typeof pair === "string") return pair;
  if (!pair) return "";
  return orderType === "IN"
    ? (pair.in || pair.togo || "")
    : (pair.togo || pair.in || "");
}

function pickMenuType(
  types: Record<string, MenuTypePair | string>,
  volumeLabel: string,
  fallback: MenuTypePair | string,
  orderType: string,
): string {
  // Точное совпадение названия объёма важно для вариантов
  // «350 мл горячий» и «350 мл холодный» у одного напитка.
  if (types[volumeLabel]) {
    return resolveMenuType(types[volumeLabel], orderType);
  }
  const requested = Number(String(volumeLabel).replace(/[^\d]/g, ""));
  let chosen: MenuTypePair | string | undefined = fallback;
  if (Number.isFinite(requested)) {
    if (types[String(requested)]) {
      chosen = types[String(requested)];
    } else {
      const keys = Object.keys(types).map(Number).filter(Number.isFinite);
      if (keys.length) {
        let best = keys[0];
        for (const key of keys) {
          if (Math.abs(key - requested) < Math.abs(best - requested)) best = key;
        }
        chosen = types[String(best)] || fallback;
      }
    }
  }
  return resolveMenuType(chosen, orderType);
}

function moscowNow(): Date {
  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}

function isOrderingOpenNow(): boolean {
  const hour = moscowNow().getUTCHours();
  return hour >= 8 && hour < 20;
}

function getBusinessDayStartIso(): string {
  const msk = moscowNow();
  let year = msk.getUTCFullYear();
  let month = msk.getUTCMonth();
  let day = msk.getUTCDate();

  // Нумерация заказов сбрасывается в 22:00 МСК.
  if (msk.getUTCHours() < 22) {
    const previous = new Date(Date.UTC(year, month, day, 12, 0, 0));
    previous.setUTCDate(previous.getUTCDate() - 1);
    year = previous.getUTCFullYear();
    month = previous.getUTCMonth();
    day = previous.getUTCDate();
  }

  const startMs = Date.UTC(year, month, day, 22, 0, 0) - 3 * 60 * 60 * 1000;
  return new Date(startMs).toISOString();
}

async function getNextDailyOrderNumber(): Promise<string | null> {
  try {
    const start = getBusinessDayStartIso();
    const end = new Date(Date.parse(start) + 24 * 60 * 60 * 1000).toISOString();
    const rows = await supabaseFetch(
      `orders?select=id&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&status=neq.failed`,
    );
    const count = Array.isArray(rows) ? rows.length : 0;
    return String(count + 1).padStart(4, "0");
  } catch (error) {
    console.error("Failed to count daily orders", error);
    return null;
  }
}

function formatPickupTimeComment(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw || /как можно скорее/i.test(raw)) return "(Сделать как можно скорее)";
  if (/^Сделать через/i.test(raw)) return `(${raw.replace(/[–—]/g, "-")})`;
  const cleaned = raw
    .replace(/^Через\s*/i, "")
    .replace(/[–—]/g, "-")
    .replace(/\s*мин\.?\s*$/i, " минут")
    .trim();
  return cleaned ? `(Сделать через ${cleaned})` : "(Сделать как можно скорее)";
}

function normalizePhone(raw: unknown): { phoneCode: string | null; phone: string | null; display: string | null } {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return { phoneCode: null, phone: null, display: null };
  if (digits.length === 11 && digits.startsWith("8")) {
    return { phoneCode: "+7", phone: digits.slice(1), display: `+7 ${digits.slice(1)}` };
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return { phoneCode: "+7", phone: digits.slice(1), display: `+7 ${digits.slice(1)}` };
  }
  if (digits.length === 10) {
    return { phoneCode: "+7", phone: digits, display: `+7 ${digits}` };
  }
  return { phoneCode: null, phone: digits, display: digits };
}

async function supabaseFetch(path: string, options: RequestInit = {}): Promise<any> {
  const base = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !key) throw new HttpError(500, "SERVER_CONFIG", "Сервер не настроен: нет ключей Supabase.");

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
    const message = typeof data === "string" ? data : JSON.stringify(data);
    throw new HttpError(500, "SUPABASE_ERROR", `Ошибка базы заказов: ${message}`);
  }
  return data;
}

async function updateOrder(orderId: number | null, patch: Record<string, unknown>): Promise<void> {
  if (!orderId) return;
  try {
    await supabaseFetch(`orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
  } catch (error) {
    console.error("Failed to update order", orderId, error);
  }
}

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ success: false, code: "METHOD", message: "Метод не поддерживается." }, 405);
  }

  const apiKey = env("YTIMES_API_KEY");
  if (!apiKey) {
    throw new HttpError(500, "SERVER_CONFIG", "Сервер не настроен: нет ключа YTimes.");
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "BAD_JSON", "Некорректный запрос.");
  }

  const dryRun = body.dryRun === true;

  const configRows = await supabaseFetch("site_settings?id=eq.1&select=config");
  const config = configRows?.[0]?.config;
  if (!config || !Array.isArray(config.drinks) || !Array.isArray(config.volumes)) {
    throw new HttpError(500, "CONFIG", "Меню сайта временно недоступно.");
  }

  const locations = Array.isArray(config.locations) ? config.locations : [];
  const requestedLocationId = String(body.locationId ?? config.selectedLocationId ?? "1");
  const location = locations.find((item: any) => String(item.id) === requestedLocationId) || locations[0];
  if (!location) throw new HttpError(400, "LOCATION", "Не выбрана кофейня.");

  const shopGuid = shopGuidForLocation(String(location.id));
  if (!shopGuid) {
    throw new HttpError(
      409,
      "SHOP_NOT_CONNECTED",
      `Онлайн-заказ для точки «${location.shortName || location.address}» пока недоступен. Выберите «Рожда» или оформите заказ на кассе.`,
    );
  }

  const cart = Array.isArray(body.items) ? body.items : [];
  if (cart.length === 0) throw new HttpError(400, "EMPTY_CART", "Корзина пуста.");
  if (cart.length > 30) throw new HttpError(400, "TOO_MANY_ITEMS", "Слишком много позиций в заказе.");

  if (!dryRun && !isOrderingOpenNow()) {
    throw new HttpError(
      403,
      "ORDER_CLOSED",
      "После 20:00 по МСК онлайн-заказы не принимаются. Пожалуйста, оформите заказ на кассе.",
    );
  }

  const requestedOrderType = String(body.orderType || "TOGO").toUpperCase();
  if (requestedOrderType !== "TOGO" && requestedOrderType !== "IN") {
    throw new HttpError(400, "ORDER_TYPE", "Неверный тип заказа: выберите «Здесь» или «С собой».");
  }
  const orderType = requestedOrderType;
  const guestComment = String(body.comment || "").trim().slice(0, 500);
  if (!dryRun && body.consent !== true) {
    throw new HttpError(
      400,
      "CONSENT_REQUIRED",
      "Подтвердите согласие на обработку персональных данных.",
    );
  }

  const commentLines: string[] = [];
  const itemList: any[] = [];
  let computedTotal = 0;

  for (let index = 0; index < cart.length; index++) {
    const item = cart[index] || {};
    const drinkId = String(item.drinkId || "");
    const drink = config.drinks.find((row: any) => String(row.id) === drinkId);
    if (!drink) {
      throw new HttpError(422, "UNKNOWN_ITEM", `Позиция «${item.title || "?"}» больше не доступна. Обновите меню.`);
    }
    if (drink.stopped) {
      throw new HttpError(409, "STOPPED", `«${drink.title}» сейчас нет в наличии.`);
    }

    const mapping = (config.ytimesMap && config.ytimesMap[drinkId]) || DRINK_MAP[drinkId];
    if (!mapping) {
      throw new HttpError(422, "NOT_MAPPED", `«${drink.title}» пока недоступен для онлайн-заказа.`);
    }

    const volumeLabel = String(item.volumeLabel || "");
    const fallbackVolumes = Array.isArray(config.volumes) ? config.volumes : [];
    const volumeOptions = (Array.isArray(drink.volumeOptions) && drink.volumeOptions.length > 0)
      ? drink.volumeOptions.map((row: any) => ({
        label: String(row.label || ""),
        price: Number(row.price) || 0,
      }))
      : fallbackVolumes.map((row: any) => ({
        label: String(row.label || ""),
        price: Number(drink.basePrice || 0) + Number(row.addPrice || 0),
      }));
    const volume = volumeOptions.find((row: any) => row.label === volumeLabel) || volumeOptions[0] ||
      { label: volumeLabel, price: Number(drink.basePrice) || 0 };
    const orderVolumeLabel = volume.label || volumeLabel;
    const stoppedVolumes = Array.isArray(drink.stoppedVolumes)
      ? drink.stoppedVolumes.map((value: unknown) => String(value))
      : [];
    if (stoppedVolumes.includes(String(orderVolumeLabel))) {
      throw new HttpError(
        409,
        "STOPPED_VOLUME",
        `«${drink.title}» (${orderVolumeLabel}) сейчас нет в наличии.`,
      );
    }
    const isLeafTea = !!drink.isLeafTea;
    const milkLabel = isLeafTea ? "" : String(item.milkLabel || "");
    const syrupLabel = isLeafTea ? "" : String(item.syrupLabel || "");
    const milk = isLeafTea ? null : (config.milks || []).find((row: any) => String(row.label) === milkLabel);
    const syrup = isLeafTea ? null : (config.syrups || []).find((row: any) => String(row.label) === syrupLabel);
    const quantity = Math.max(1, Math.min(20, Number.parseInt(String(item.qty || 1), 10) || 1));

    const regularUnit = Number(volume.price || 0) +
      (isLeafTea ? 0 : Number(milk?.addPrice || 0) + Number(syrup?.addPrice || 0));
    const unitPrice = config.happyHourActive
      ? Math.round(regularUnit * (1 - Number(config.discountPercent || 0) / 100))
      : Math.round(regularUnit);

    computedTotal += unitPrice * quantity;

    const supplementList: Record<string, number> = {};
    if (!isLeafTea) {
      const milkGuid = MILK_SUPPLEMENTS[milkLabel];
      if (milkGuid) supplementList[milkGuid] = 1;
      const syrupGuid = SYRUP_SUPPLEMENTS[syrupLabel];
      if (syrupGuid) supplementList[syrupGuid] = 1;
    }

    const ytimesItem: Record<string, unknown> = {
      menuItemGuid: mapping.item,
      menuTypeGuid: pickMenuType(mapping.types || {}, orderVolumeLabel, mapping.fallback, orderType),
      priceWithDiscount: unitPrice,
      quantity,
    };
    if (Object.keys(supplementList).length > 0) {
      ytimesItem.supplementList = supplementList;
    }
    itemList.push(ytimesItem);

    const options: string[] = [];
    if (orderVolumeLabel) options.push(orderVolumeLabel);
    if (isLeafTea) {
      options.push(`сорт: ${item.milkLabel || item.teaVariety || "на выбор"}`);
    } else {
      if (milkLabel) options.push(`молоко: ${milkLabel}`);
      if (syrupLabel) options.push(`сироп: ${syrupLabel}`);
    }
    commentLines.push(`${index + 1}) ${drink.title}${options.length ? ` (${options.join(", ")})` : ""} × ${quantity}`);
  }

  const clientTotal = Number(body.total);
  if (Number.isFinite(clientTotal) && Math.abs(clientTotal - computedTotal) > 0.5) {
    throw new HttpError(409, "PRICE_CHANGED", "Цены обновились. Обновите страницу и попробуйте ещё раз.");
  }

  const name = String(body.guestName || "").trim().slice(0, 80) || "Гость";
  const phone = normalizePhone(body.guestPhone);
  const pickupTimeRaw = String(body.pickupTime || config.pickupTime || "как можно скорее").slice(0, 80);
  const pickupTimeComment = formatPickupTimeComment(pickupTimeRaw);
  const orderGuid = isUuid(body.orderGuid) ? String(body.orderGuid) : crypto.randomUUID();

  let orderRowId: number | null = null;
  let orderNumber = "";

  if (dryRun) {
    orderNumber = (await getNextDailyOrderNumber()) || "0000";
  } else {
    let existingOrderNumber = "";
    try {
      // При повторной отправке используем тот же номер заказа.
      const existing = await supabaseFetch(
        `orders?ytimes_order_guid=eq.${encodeURIComponent(orderGuid)}&select=id,comment,order_number&limit=1`,
      );
      if (Array.isArray(existing) && existing[0]?.id) {
        orderRowId = existing[0].id;
        const storedNumber = String(existing[0].order_number || "").trim();
        const match = String(existing[0].comment || "").match(/Номер заказа:\s*([0-9]+)/i);
        if (storedNumber) existingOrderNumber = storedNumber;
        else if (match) existingOrderNumber = match[1];
      }
    } catch (error) {
      console.error("Failed to find existing order", error);
    }

    // Считаем номер до вставки текущего заказа, иначе он посчитает сам себя.
    const dailyOrderNumber = (!existingOrderNumber && !orderRowId)
      ? await getNextDailyOrderNumber()
      : null;

    if (!orderRowId) {
      try {
        const inserted = await supabaseFetch("orders", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            status: "sending",
            ytimes_order_guid: orderGuid,
            ytimes_status: null,
            shop_guid: shopGuid,
            customer_name: name,
            customer_phone: phone.display,
            consent: true,
            consent_at: new Date().toISOString(),
            order_number: dailyOrderNumber || null,
            comment: "",
            guest_comment: guestComment,
            items_summary: commentLines.join("; ").slice(0, 2000),
            total: computedTotal,
            items: itemList,
            payment_status: "unpaid",
            payment_url: null,
            raw_request: null,
            raw_response: null,
          }),
        });
        orderRowId = Array.isArray(inserted) ? inserted[0]?.id ?? null : null;
      } catch (error) {
        console.error("Failed to save order before sending to YTimes", error);
      }
    }

    if (existingOrderNumber) {
      orderNumber = existingOrderNumber;
    } else if (dailyOrderNumber) {
      orderNumber = dailyOrderNumber;
    } else if (orderRowId) {
      orderNumber = String(orderRowId).padStart(4, "0");
    } else {
      orderNumber = String(Math.floor(1000 + Math.random() * 9000));
    }
  }

  // На чеке YTimes печатается именно comment, поэтому оставляем номер заказа,
  // состав, время и комментарий гостя. Имя, телефон и итог в комментарий
  // не дублируем — они есть в карточке заказа и в orders.
  const comment = [
    `Номер заказа: ${orderNumber}`,
    `Состав: ${commentLines.join("; ")}`,
    `Время: ${pickupTimeComment}`,
    guestComment ? `Комментарий гостя: ${guestComment}` : "",
  ].filter(Boolean).join(" • ").slice(0, 2000);

  const ytimesPayload = {
    guid: orderGuid,
    shopGuid,
    type: orderType,
    client: {
      name,
      cardNumber: null,
      phoneCode: phone.phoneCode,
      phone: phone.phone,
      email: null,
    },
    itemList,
    comment,
    paidValue: null,
    printFiscalCheck: false,
    printFiscalCheckEmail: null,
  };

  // Диагностический режим: проверить сопоставление и цены без создания заказа.
  if (dryRun) {
    return json({
      success: true,
      dryRun: true,
      total: computedTotal,
      orderNumber,
      shopGuid,
      ytimesPayload,
    });
  }

  await updateOrder(orderRowId, {
    comment,
    guest_comment: guestComment,
    items_summary: commentLines.join("; ").slice(0, 2000),
    order_number: orderNumber,
    raw_request: ytimesPayload,
  });

  let ytimesResponse: Response;
  try {
    ytimesResponse = await fetch(`${YTIMES_API}/order/save`, {
      method: "POST",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: apiKey,
      },
      body: JSON.stringify(ytimesPayload),
    });
  } catch (error) {
    await updateOrder(orderRowId, {
      status: "failed",
      ytimes_status: "NETWORK",
      raw_response: { error: String(error) },
    });
    throw new HttpError(502, "YTIMES_NETWORK", "Касса недоступна. Попробуйте ещё раз или оплатите на кассе.");
  }

  const ytimesText = await ytimesResponse.text();
  let ytimesData: any = null;
  if (ytimesText) {
    try {
      ytimesData = JSON.parse(ytimesText);
    } catch {
      ytimesData = { raw: ytimesText.slice(0, 2000) };
    }
  }

  if (!ytimesResponse.ok || !ytimesData?.success) {
    const message = ytimesData?.error?.message || `YTimes HTTP ${ytimesResponse.status}`;
    await updateOrder(orderRowId, {
      status: "failed",
      ytimes_status: "ERROR",
      raw_response: ytimesData || { status: ytimesResponse.status, body: ytimesText.slice(0, 2000) },
    });
    throw new HttpError(502, "YTIMES_ERROR", `Касса не приняла заказ: ${message}`);
  }

  const created = Array.isArray(ytimesData.rows) ? ytimesData.rows[0] || {} : {};
  const ytimesStatus = String(created.status || "CREATED");
  await updateOrder(orderRowId, {
    status: "created",
    ytimes_status: ytimesStatus,
    order_number: orderNumber,
    raw_response: ytimesData,
  });

  return json({
    success: true,
    orderGuid: created.guid || orderGuid,
    status: ytimesStatus,
    total: computedTotal,
    orderNumber,
    message: `Заказ №${orderNumber} отправлен на кассу. Назовите этот номер заказа на кассе, чтобы оплатить и получить заказ.`,
  });
}

Deno.serve(async (request) => {
  try {
    return await handleRequest(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ success: false, code: error.code, message: error.message }, error.status);
    }
    console.error("Unexpected create-order error", error);
    return json(
      { success: false, code: "INTERNAL", message: "Внутренняя ошибка. Попробуйте ещё раз." },
      500,
    );
  }
});
