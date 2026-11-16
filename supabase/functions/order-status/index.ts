// Supabase Edge Function: order-status
// 1) Публичный статус заказа для сайта: POST { orderGuid }
// 2) Вебхук YTimes: POST { eventId, guid, status, statusMessage }?secret=...
// Для вебхука функцию нужно задеплоить с выключенной проверкой JWT.

// @ts-ignore — npm-пакет web-push работает в Supabase Edge Runtime.
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function text(value: string, status = 200): Response {
  return new Response(value, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
  });
}

function env(name: string): string {
  return String(Deno.env.get(name) || "").trim();
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
  const raw = await response.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }
  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }
  return data;
}

function orderNumberFromRow(order: any): string {
  const match = String(order?.comment || "").match(/Номер заказа:\s*([0-9]+)/i);
  return match ? match[1] : String(order?.id || 0).padStart(4, "0");
}

async function sendOrderPush(
  guid: string,
  status: string,
  statusMessage: string,
): Promise<void> {
  const publicKey = env("VAPID_PUBLIC_KEY");
  const privateKey = env("VAPID_PRIVATE_KEY");
  const subject = env("VAPID_SUBJECT") || "mailto:admin@smysl.coffee";
  if (!publicKey || !privateKey) return;

  const orderRows = await supabaseFetch(
    `orders?ytimes_order_guid=eq.${encodeURIComponent(guid)}&select=id,comment&limit=1`,
  );
  const order = Array.isArray(orderRows) ? orderRows[0] : null;
  if (!order) return;

  const subscriptions = await supabaseFetch(
    `push_subscriptions?order_guid=eq.${encodeURIComponent(guid)}&select=endpoint,p256dh,auth`,
  );
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) return;

  const number = orderNumberFromRow(order);
  const title = status === "accepted"
    ? `Заказ №${number} принят`
    : status === "cancelled"
      ? `Заказ №${number} отклонён`
      : `Заказ №${number}: новый статус`;
  const body = status === "accepted"
    ? "Можно оплачивать на кассе."
    : status === "cancelled"
      ? (statusMessage || "Кассир отклонил заказ.")
      : (statusMessage || "Статус заказа обновился.");

  webpush.setVapidDetails(subject, publicKey, privateKey);

  await Promise.allSettled(subscriptions.map(async (subscription: any) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({
          title,
          body,
          tag: `order-${guid}`,
          url: "./",
          force: false,
        }),
      );
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
  }));
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

  const url = new URL(request.url);
  const webhookSecret = env("YTIMES_WEBHOOK_SECRET");
  const incomingSecret = url.searchParams.get("secret") ||
    request.headers.get("x-webhook-secret") ||
    "";

  // Ветка вебхука YTimes: статус принятия заказа кассиром.
  if (body && body.guid && body.status && !body.orderGuid) {
    if (!webhookSecret || incomingSecret !== webhookSecret) {
      return text("Forbidden", 403);
    }
    const guid = String(body.guid);
    const rawStatus = String(body.status).toUpperCase();
    const status = rawStatus === "ACCEPTED"
      ? "accepted"
      : rawStatus === "CANCELLED"
        ? "cancelled"
        : "updated";
    const statusMessage = String(body.statusMessage || "").slice(0, 500);

    try {
      await supabaseFetch(`orders?ytimes_order_guid=eq.${encodeURIComponent(guid)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status,
          ytimes_status: rawStatus,
          status_message: statusMessage,
        }),
      });

      // Мгновенно отправляем статус открытой странице гостя через Realtime.
      // Канал содержит GUID заказа, поэтому посторонние его не видят.
      try {
        const base = env("SUPABASE_URL");
        const key = env("SUPABASE_SERVICE_ROLE_KEY");
        if (base && key) {
          await fetch(`${base}/realtime/v1/api/broadcast`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              messages: [{
                topic: `order:${guid}`,
                event: "status",
                payload: { status, ytimesStatus: rawStatus, message: statusMessage },
              }],
            }),
          });
        }
      } catch (broadcastError) {
        // Если Realtime недоступен, гость всё равно получит статус опросом.
        console.error("Realtime broadcast failed", broadcastError);
      }

      // Push-уведомление, если гость его включил.
      try {
        await sendOrderPush(guid, status, statusMessage);
      } catch (pushError) {
        // Push не должен ломать обработку вебхука.
        console.error("Order push failed", pushError);
      }

      return text("OK");
    } catch (error) {
      console.error("Order webhook failed", error);
      return text("Error", 500);
    }
  }

  // Публичный запрос статуса по GUID заказа (GUID неугадываемый).
  const orderGuid = String(body?.orderGuid || "").trim();
  if (!orderGuid) {
    return json({ success: false, message: "Нет orderGuid." }, 400);
  }
  try {
    const rows = await supabaseFetch(
      `orders?ytimes_order_guid=eq.${encodeURIComponent(orderGuid)}&select=status,ytimes_status,status_message&limit=1`,
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return json({ success: true, found: false, status: "unknown" });
    return json({
      success: true,
      found: true,
      status: row.status,
      ytimesStatus: row.ytimes_status,
      message: row.status_message || "",
    });
  } catch (error) {
    console.error("Order status failed", error);
    return json({ success: false, message: "Не удалось получить статус." }, 500);
  }
});
