// Файл: netlify/functions/api.js
// Серверный мост между сайтом «Смысл» и Telegram-чатом бариста.

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { action } = payload;

    // Секретные ключи берутся из настроек Netlify (Environment Variables)
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
    const TG_CHAT_ID = process.env.TG_CHAT_ID || '';

    if (action === 'create_order') {
      const { orderNum, guestName, guestPhone, location, pickupTime, total, items } = payload;

      if (TG_BOT_TOKEN && TG_CHAT_ID) {
        const itemsList = (items || [])
          .map(i => `• ${i.title} (${i.volumeLabel}) x${i.qty} — молоко: ${i.milkLabel}, ${i.syrupLabel}`)
          .join('\n');

        const text = [
          `☕ *НОВЫЙ ПРЕДЗАКАЗ №${orderNum}*`,
          `📍 *Точка:* ${location}`,
          `⏰ *Готовность:* ${pickupTime}`,
          `👤 *Гость:* ${guestName} (${guestPhone})`,
          ``,
          `*Состав заказа:*`,
          itemsList,
          ``,
          `💰 *Итого:* ${total} ₽`
        ].join('\n');

        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: text,
            parse_mode: 'Markdown'
          })
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, orderNum })
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
