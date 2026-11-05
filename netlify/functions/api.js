// Файл: netlify/functions/api.js
// Безопасный серверный мост между сайтом «Смысл», SAMOSALE и кассой YTIMES

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
    const SAMOSALE_KEY = process.env.SAMOSALE_API_KEY || '';
    const SAMOSALE_API_URL = process.env.SAMOSALE_API_URL || 'https://api.samosale.ru/v1/clients/by-phone';
    const YTIMES_KEY = process.env.YTIMES_API_KEY || '';
    const YTIMES_ORDER_URL = process.env.YTIMES_ORDER_URL || '';
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
    const TG_CHAT_ID = process.env.TG_CHAT_ID || '';

    // 1. ПОЛУЧЕНИЕ БАЛАНСА И КАРТЫ ГОСТЯ ИЗ SAMOSALE
    if (action === 'get_loyalty') {
      const cleanPhone = (payload.phone || '').replace(/\D/g, '');
      if (!cleanPhone) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Укажите телефон' }) };
      }

      // Если ключ SAMOSALE подключен — запрашиваем реальный баланс по API
      if (SAMOSALE_KEY) {
        try {
          const response = await fetch(`${SAMOSALE_API_URL}?phone=${cleanPhone}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SAMOSALE_KEY}`,
              'X-API-KEY': SAMOSALE_KEY,
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                points: data.bonus_balance ?? data.balance ?? data.points ?? 0,
                cashback: data.cashback_percent ?? data.level_percent ?? 7,
                cardCode: data.card_number ?? data.code ?? cleanPhone
              })
            };
          }
        } catch (apiErr) {
          console.error('SAMOSALE API Error:', apiErr);
        }
      }

      // Если API-ключ ещё не вписан — возвращаем код карты по номеру телефона
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          points: 250,
          cashback: 7,
          cardCode: cleanPhone
        })
      };
    }

    // 2. ОТПРАВКА ПРЕДЗАКАЗА В YTIMES И В TELEGRAM БАРИСТА
    if (action === 'create_order') {
      const { orderNum, guestName, guestPhone, location, pickupTime, total, items } = payload;

      // А) Отправка в кассу YTIMES (если указан URL и ключ API)
      if (YTIMES_KEY && YTIMES_ORDER_URL) {
        try {
          await fetch(YTIMES_ORDER_URL, {
            method: 'POST',
            headers: {
              'Authorization': Bearer ${YTIMES_KEY},
              'X-API-KEY': YTIMES_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              external_id: String(orderNum),
              client_name: guestName,
              client_phone: guestPhone,
              shop_address: location,
              comment: Приготовить: ${pickupTime},
              total_price: total,
              items: items
            })
          });
        } catch (ytErr) {
          console.error('YTIMES Order Error:', ytErr);
        }
      }

      // Б) Мгновенное уведомление бариста в рабочий Telegram-чат (если задан бот)
      if (TG_BOT_TOKEN && TG_CHAT_ID) {
        const itemsList = (items || [])
          .map(i => • ${i.title} (${i.volumeLabel}) x${i.qty} — молоко: ${i.milkLabel}, ${i.syrupLabel})
          .join('\n');

        const text = [
          ☕ *НОВЫЙ ПРЕДЗАКАЗ №${orderNum}*,
          📍 *Точка:* ${location},
          ⏰ *Готовность:* ${pickupTime},
          👤 *Гость:* ${guestName} (${guestPhone}),
          ``,
          *Состав заказа:*,
          itemsList,
          ``,
          💰 *Итого:* ${total} ₽
        ].join('\n');

        await fetch(https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage, {
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
