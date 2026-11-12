module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action } = payload;

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

      return res.status(200).json({ success: true, orderNum });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
