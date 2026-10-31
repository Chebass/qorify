-- Limpia medios de pago y categorías duplicados (se sembraron varias veces por peticiones simultáneas)
-- y evita que vuelva a ocurrir con restricciones únicas. Los movimientos se reasignan al registro más antiguo.

-- 1) Cuentas: reasignar movimientos a la cuenta más antigua de cada (usuario, nombre) y borrar el resto
with ranked as (
  select id,
         first_value(id) over (partition by user_id, lower(name) order by created_at, id) as keep_id
  from public.accounts
)
update public.transactions t
set account_id = r.keep_id
from ranked r
where t.account_id = r.id and r.id <> r.keep_id;

delete from public.accounts a
using (
  select id,
         first_value(id) over (partition by user_id, lower(name) order by created_at, id) as keep_id
  from public.accounts
) r
where a.id = r.id and r.id <> r.keep_id;

-- 2) Categorías: igual, por (usuario, nombre, tipo)
with ranked as (
  select id,
         first_value(id) over (partition by user_id, lower(name), type order by created_at, id) as keep_id
  from public.categories
)
update public.transactions t
set category_id = r.keep_id
from ranked r
where t.category_id = r.id and r.id <> r.keep_id;

delete from public.categories c
using (
  select id,
         first_value(id) over (partition by user_id, lower(name), type order by created_at, id) as keep_id
  from public.categories
) r
where c.id = r.id and r.id <> r.keep_id;

-- 3) Restricciones únicas (la siembra usa upsert con ignoreDuplicates sobre estas columnas)
alter table public.accounts
  add constraint accounts_user_name_key unique (user_id, name);
alter table public.categories
  add constraint categories_user_name_type_key unique (user_id, name, type);
