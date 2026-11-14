# Supabase Edge Functions

Функции проекта:

- `create-order` — принимает заказ с сайта, проверяет цены и отправляет в YTimes.
- `sync-ytimes-menu` — синхронизирует цены и стоп-лист YTimes с меню сайта.
- `order-status` — статус заказа для гостя и вебхук YTimes.

## Секреты

- `YTIMES_API_KEY`
- `YTIMES_SHOP_GUID`
- `YTIMES_WEBHOOK_SECRET`
- `YTIMES_SHOP_GUID_GORKOGO` (опционально)

## Статусы и Realtime

- После вебхука YTimes `order-status` обновляет строку в `orders` и отправляет
  broadcast в канал Supabase Realtime `order:<guid>`.
- Страница гостя подписана на этот канал и обновляет статус мгновенно.
- Раз в 30 секунд остаётся резервный опрос `order-status` — на случай сбоя Realtime.
- Канал содержит GUID заказа, поэтому посторонние его не видят.
- В админке вкладка «Заказы» показывает последние 50 заказов; доступ закрыт RLS
  (только `app_metadata.role = "admin"`).

## Важно

- `order-status` должна быть задеплоена с **выключенной** проверкой JWT, иначе YTimes не сможет отправить вебхук.
- `sync-ytimes-menu` принимает JWT администратора или service_role ключ.
- URL вебхука с секретом лежит в `C:\Users\art52\OneDrive\Рабочий стол\SmyslAndroid\ytimes-webhook.txt`.
