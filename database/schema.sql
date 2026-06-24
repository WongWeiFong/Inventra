create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default '📦',
  created_at timestamptz not null default now()
);

create table if not exists storage_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default '📍',
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  name text not null,
  category_id uuid null references categories(id) on delete set null,
  storage_location_id uuid null references storage_locations(id) on delete set null,
  quantity integer not null default 0,
  unit text null,
  low_stock_threshold integer not null default 3,
  expiry_date date null,
  image_url text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  item_name text not null,
  quantity integer not null default 1,
  unit text null,
  category_id uuid null references categories(id) on delete set null,
  is_checked boolean not null default false,
  is_auto_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on items;
create trigger items_set_updated_at
before update on items
for each row execute function set_updated_at();

drop trigger if exists shopping_list_set_updated_at on shopping_list;
create trigger shopping_list_set_updated_at
before update on shopping_list
for each row execute function set_updated_at();

create index if not exists items_name_idx on items using btree (name);
create index if not exists items_expiry_date_idx on items using btree (expiry_date);
create index if not exists shopping_list_checked_idx on shopping_list using btree (is_checked);