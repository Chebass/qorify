-- Qorify: esquema inicial (Fase 1). RLS activado en TODAS las tablas.

create extension if not exists "pgcrypto";

-- ───────── Tipos ─────────
create type public.tx_type as enum ('income', 'expense', 'transfer');
create type public.account_kind as enum ('cash', 'card', 'yape', 'plin', 'bank', 'other');
create type public.landscape_mode as enum ('auto', 'fixed', 'random');
create type public.landscape_region as enum ('costa', 'sierra', 'selva');

-- ───────── Perfiles ─────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  currency char(3) not null default 'PEN',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  landscape_mode public.landscape_mode not null default 'auto',
  landscape_region public.landscape_region,
  created_at timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────── Medios de pago / cuentas ─────────
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 60),
  kind public.account_kind not null default 'cash',
  currency char(3) not null default 'PEN',
  initial_balance numeric(12, 2) not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index accounts_user_idx on public.accounts (user_id);

-- ───────── Categorías ─────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 40),
  type public.tx_type not null check (type in ('income', 'expense')),
  icon text,
  color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$'),
  parent_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now()
);
create index categories_user_idx on public.categories (user_id);

-- ───────── Movimientos ─────────
-- El monto y la fecha van en claro (para agregar/consultar); la nota se cifra en la app (AES-GCM) antes de guardarse.
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  type public.tx_type not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency char(3) not null default 'PEN',
  occurred_on date not null default current_date,
  account_id uuid not null references public.accounts (id) on delete restrict,
  category_id uuid references public.categories (id) on delete set null,
  note_enc text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index transactions_user_cat_idx on public.transactions (user_id, category_id);

-- ───────── Passkeys (biometría, Fase 1.5) ─────────
create table public.passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  device_label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index passkeys_user_idx on public.passkeys (user_id);

-- ───────── RLS ─────────
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.passkeys enable row level security;

create policy "profiles: propio" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "accounts: propio" on public.accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "categories: propio" on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Un movimiento solo puede referenciar cuentas/categorías del mismo usuario
create policy "transactions: propio" on public.transactions
  for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid())
    and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid()))
  );

-- Passkeys: solo lectura/borrado desde el cliente; el alta y el contador los gestiona el servidor (service_role)
create policy "passkeys: ver propias" on public.passkeys
  for select using (user_id = auth.uid());
create policy "passkeys: borrar propias" on public.passkeys
  for delete using (user_id = auth.uid());
