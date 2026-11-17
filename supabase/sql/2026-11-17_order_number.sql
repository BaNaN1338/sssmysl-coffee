-- Номер заказа сайта хранится отдельно от комментария YTimes.
-- Нужен, чтобы на чеке печатался только состав/время/комментарий гостя,
-- а админка и push-уведомления по-прежнему знали номер заказа.
alter table public.orders add column if not exists order_number text;

-- Заполняем номер для старых заказов, где он был в комментарии.
update public.orders
set order_number = substring(comment from 'Номер заказа:\s*([0-9]+)')
where order_number is null
  and comment ~ 'Номер заказа:\s*[0-9]+';
