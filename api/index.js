module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action } = payload;

    const SAMOSALE_KEY = process.env.SAMOSALE_API_KEY || '';
    const SAMOSALE_API_URL = process.env.SAMOSALE_API_URL || 'https://api.samosale.ru/v1/clients/by-phone';
    const YTIMES_KEY = process.env.YTIMES_API_KEY || '';
    const YTIMES_ORDER_URL = process.env.YTIMES_ORDER_URL || '';
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
    const TG_CHAT_ID = process.env.TG_CHAT_ID || '';

    if (action === 'get_loyalty') {
      const cleanPhone = (payload.phone || '').replace(/\D/g, '');
      if (!cleanPhone) return res.status(400).json({ error: 'Укажите телефон' });

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
            return res.status(200).json({
              success: true,
              points: data.bonus_balance ?? data.balance ?? data.points ?? 0,
              cashback: data.cashback_percent ?? data.level_percent ?? 7,
              cardCode: data.card_number ?? data.code ?? cleanPhone
            });
          }
        } catch (apiErr) {}
      }

      return res.status(200).json({
        success: true,
        points: 250,
        cashback: 7,
        cardCode: cleanPhone
      });
    }

    if (action === 'create_order') {
      const { orderNum, guestName, guestPhone, location, pickupTime, total, items } = payload;

      if (YTIMES_KEY && YTIMES_ORDER_URL) {
        try {
          await fetch(YTIMES_ORDER_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${YTIMES_KEY}`,
              'X-API-KEY': YTIMES_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              external_id: String(orderNum),
              client_name: guestName,
              client_phone: guestPhone,
              shop_address: location,
              comment: `Приготовить: ${pickupTime}`,
              total_price: total,
              items: items
            })
          });
        } catch (ytErr) {}
      }

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

      return res.status(200).json({ success: true, orderNum });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
