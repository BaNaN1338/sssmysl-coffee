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

## Важно

- `order-status` должна быть задеплоена с **выключенной** проверкой JWT, иначе YTimes не сможет отправить вебхук.
- `sync-ytimes-menu` принимает JWT администратора или service_role ключ.
- URL вебхука с секретом лежит в `C:\Users\art52\OneDrive\Рабочий стол\SmyslAndroid\ytimes-webhook.txt`.
