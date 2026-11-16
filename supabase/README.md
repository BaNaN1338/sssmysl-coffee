# Supabase Edge Functions

Функции проекта:

- `create-order` — принимает заказ с сайта, проверяет цены и отправляет в YTimes.
- `sync-ytimes-menu` — синхронизирует цены и стоп-лист, добавляет новые напитки.
- `order-status` — статус заказа, вебхук YTimes, Realtime и push-уведомления.
- `push-subscribe` — сохраняет push-подписку браузера и привязывает её к заказу.

## Секреты

- `YTIMES_API_KEY`
- `YTIMES_SHOP_GUID`
- `YTIMES_WEBHOOK_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `SYNC_CRON_SECRET`
- `YTIMES_SHOP_GUID_GORKOGO` (опционально)

## Синхронизация

- Основная — Supabase Cron каждые 15 минут с заголовком `x-sync-secret`.
- Резерв — GitHub Actions раз в 6 часов и ручной запуск.
- Новые напитки добавляются автоматически; еда, добавки и мерч — нет.
- Удалённые позиции попадают в `config.ytimesIgnored` и не возвращаются.

## Статусы и push

- `order-status` обновляет `orders` и отправляет Realtime broadcast в `order:<guid>`.
- После вебхука YTimes отправляется push подписчикам из `push_subscriptions`.
- `order-status` должна быть задеплоена с выключенной проверкой JWT.
- `push-subscribe` принимает anon-ключ; тестовое действие — только с JWT администратора.

## Важно

- URL вебхука с секретом лежит в `C:\\Users\\art52\\OneDrive\\Рабочий стол\\SmyslAndroid\\ytimes-webhook.txt`.
