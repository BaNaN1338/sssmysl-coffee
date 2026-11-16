/* Service worker кофейни «Смысл»: push-уведомления о статусе заказа. */

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        data = {};
    }

    const title = data.title || 'Смысл';
    const options = {
        body: data.body || '',
        icon: 'icon-512.png',
        badge: 'icon-512.png',
        tag: data.tag || 'order-status',
        data: { url: data.url || './' }
    };

    event.waitUntil((async () => {
        // Если страница открыта и видна, её уже обновляет Realtime.
        // Принудительный push (тест) показываем всегда.
        if (!data.force) {
            const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            if (clients.some(client => client.visibilityState === 'visible')) return;
        }
        await self.registration.showNotification(title, options);
    })());
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || './';

    event.waitUntil((async () => {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clients) {
            if ('focus' in client) {
                await client.focus();
                return;
            }
        }
        if (self.clients.openWindow) {
            await self.clients.openWindow(targetUrl);
        }
    })());
});
