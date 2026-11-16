// Supabase Edge Function: push-subscribe
// Сохраняет web-push подписку браузера и привязывает её к заказу.
// Также умеет отправлять тестовое уведомление администратору.

// @ts-ignore — npm-пакет web-push работает в Supabase Edge Runtime.
import webpush from "npm:web-push@3.6.7";

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

function isUuid(value: unknown): boolean {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

function configureWebPush(): boolean {
  const publicKey = env("VAPID_PUBLIC_KEY");
  const privateKey = env("VAPID_PRIVATE_KEY");
  const subject = env("VAPID_SUBJECT") || "mailto:admin@smysl.coffee";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

async function sendToOrder(orderGuid: string, payload: Record<string, unknown>): Promise<number> {
  if (!configureWebPush()) throw new Error("Не настроены VAPID-ключи.");
  const subscriptions = await supabaseFetch(
    `push_subscriptions?order_guid=eq.${encodeURIComponent(orderGuid)}&select=endpoint,p256dh,auth`,
  );
  let sent = 0;
  for (const subscription of subscriptions || []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload),
      );
      sent++;
    } catch (error: any) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        try {
          await supabaseFetch(
            `push_subscriptions?endpoint=eq.${encodeURIComponent(subscription.endpoint)}`,
            { method: "DELETE" },
          );
        } catch {
          // Подписка уже удалена.
        }
      } else {
        console.error("push send failed", error?.statusCode || error);
      }
    }
  }
  return sent;
}

function orderNumberFromRow(order: any): string {
  const match = String(order?.comment || "").match(/Номер заказа:\s*([0-9]+)/i);
  return match ? match[1] : String(order?.id || 0).padStart(4, "0");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ success: false, message: "Метод не поддерживается." }, 405);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Некорректный JSON." }, 400);
  }

  const orderGuid = String(body?.orderGuid || "").trim();
  if (!isUuid(orderGuid)) {
    return json({ success: false, message: "Некорректный orderGuid." }, 400);
  }

  const rows = await supabaseFetch(
    `orders?ytimes_order_guid=eq.${encodeURIComponent(orderGuid)}&select=id,comment&limit=1`,
  );
  const order = Array.isArray(rows) ? rows[0] : null;
  if (!order) {
    return json({ success: false, message: "Заказ не найден." }, 404);
  }

  if (body?.action === "selftest") {
    const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const jwt = decodeJwtPayload(bearer);
    if (jwt?.app_metadata?.role !== "admin") {
      return json({ success: false, message: "Тест доступен только администратору." }, 403);
    }
    try {
      if (!configureWebPush()) {
        return json({ success: false, message: "Не настроены VAPID-ключи." }, 500);
      }
      const ecdh = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveBits"],
      );
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", ecdh.publicKey));
      const authBytes = new Uint8Array(16);
      crypto.getRandomValues(authBytes);
      const b64url = (bytes: Uint8Array) =>
        btoa(String.fromCharCode(...bytes))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/g, "");
      const details: any = webpush.generateRequestDetails(
        {
          endpoint: "https://example.com/push",
          keys: { p256dh: b64url(raw), auth: b64url(authBytes) },
        },
        JSON.stringify({ title: "test" }),
      );
      return json({
        success: true,
        hasAuthorization: !!details?.headers?.Authorization,
        bodyLength: String(details?.body || "").length,
      });
    } catch (error) {
      console.error("push selftest failed", error);
      return json({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      }, 500);
    }
  }

  if (body?.action === "test") {
    const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const jwt = decodeJwtPayload(bearer);
    if (jwt?.app_metadata?.role !== "admin") {
      return json({ success: false, message: "Тест доступен только администратору." }, 403);
    }
    try {
      const number = orderNumberFromRow(order);
      const sent = await sendToOrder(orderGuid, {
        title: `Тест уведомлений · заказ №${number}`,
        body: "Push-уведомления работают.",
        tag: `order-${orderGuid}`,
        url: "./",
        force: true,
      });
      return json({ success: true, sent });
    } catch (error) {
      console.error("push test failed", error);
      return json({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      }, 500);
    }
  }

  const subscription = body?.subscription || {};
  const endpoint = String(subscription.endpoint || "").trim();
  const p256dh = String(subscription.keys?.p256dh || "").trim();
  const auth = String(subscription.keys?.auth || "").trim();
  if (!endpoint || !p256dh || !auth) {
    return json({ success: false, message: "Некорректная подписка." }, 400);
  }

  try {
    await supabaseFetch("push_subscriptions?on_conflict=endpoint", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth,
        order_guid: orderGuid,
        user_agent: String(request.headers.get("user-agent") || "").slice(0, 500),
        updated_at: new Date().toISOString(),
      }),
    });
    return json({ success: true });
  } catch (error) {
    console.error("push subscribe failed", error);
    return json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
