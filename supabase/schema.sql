-- ZWL Eco Platform - Supabase schema (profiles + RLS + auto-provisioning)

-- 1) Profiles table (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  points integer not null default 0 check (points >= 0),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone not null default now()
);

alter table public.profiles
add column if not exists points integer not null default 0 check (points >= 0);

-- 2) RLS: users can only read/update their own profile
alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Inserts are handled by trigger (keeps app logic simple + avoids RLS insert policy needs)

-- 3) Auto-create profile on signup (trigger on auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, points, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    0,
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 4) Reports (user submits -> admin reviews/resolves)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamp with time zone not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "Reports are insertable by owner" on public.reports;
create policy "Reports are insertable by owner"
on public.reports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Reports are readable by owner" on public.reports;
create policy "Reports are readable by owner"
on public.reports
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Reports are readable by admins" on public.reports;
create policy "Reports are readable by admins"
on public.reports
for select
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Reports are updatable by admins" on public.reports;
create policy "Reports are updatable by admins"
on public.reports
for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 5) Products (admin-managed)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0 and price = trunc(price)),
  image_url text,
  created_at timestamp with time zone not null default now()
);

alter table public.products
drop constraint if exists products_price_check;

alter table public.products
add constraint products_price_check check (price >= 0 and price = trunc(price));

alter table public.products enable row level security;

drop policy if exists "Products are readable by all authenticated" on public.products;
create policy "Products are readable by all authenticated"
on public.products
for select
to authenticated
using (true);

drop policy if exists "Products are writable by admins" on public.products;
create policy "Products are writable by admins"
on public.products
for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 6) Purchases (server-side purchase RPC inserts; users can only read their own rows)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint purchases_user_product_key unique (user_id, product_id)
);

alter table public.purchases enable row level security;

drop policy if exists "Purchases are readable by owner" on public.purchases;
create policy "Purchases are readable by owner"
on public.purchases
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Purchases are readable by admins" on public.purchases;
create policy "Purchases are readable by admins"
on public.purchases
for select
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- No direct client insert/update/delete policy: purchases must go through buy_product().
create or replace function public.buy_product(p_user_id uuid, p_product_id uuid)
returns table (purchase_id uuid, points_remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points integer;
  v_price numeric(12,2);
  v_purchase_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Forbidden.' using errcode = '42501';
  end if;

  if p_product_id is null then
    raise exception 'Invalid product.' using errcode = '22023';
  end if;

  select points
  into v_points
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Profile not found.' using errcode = 'P0001';
  end if;

  select price
  into v_price
  from public.products
  where id = p_product_id;

  if not found then
    raise exception 'Product not found.' using errcode = 'P0001';
  end if;

  if v_price <> trunc(v_price) then
    raise exception 'Product price must be whole points.' using errcode = 'P0001';
  end if;

  if v_points < v_price then
    raise exception 'Not enough points.' using errcode = 'P0001';
  end if;

  insert into public.purchases (user_id, product_id)
  values (p_user_id, p_product_id)
  returning id into v_purchase_id;

  update public.profiles
  set points = points - v_price::integer
  where id = p_user_id
  returning points into v_points;

  return query select v_purchase_id, v_points;
exception
  when unique_violation then
    raise exception 'Product already purchased.' using errcode = '23505';
end;
$$;

revoke all on function public.buy_product(uuid, uuid) from public;
grant execute on function public.buy_product(uuid, uuid) to authenticated;

-- 7) Scan results (user uploads image; admin sets result_text)
create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  result_text text,
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamp with time zone not null default now()
);

alter table public.scan_results
add column if not exists status text not null default 'pending'
check (status in ('pending', 'done'));

alter table public.scan_results enable row level security;

drop policy if exists "Scan results are insertable by owner" on public.scan_results;
create policy "Scan results are insertable by owner"
on public.scan_results
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Scan results are readable by owner" on public.scan_results;
create policy "Scan results are readable by owner"
on public.scan_results
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Scan results are readable by admins" on public.scan_results;
create policy "Scan results are readable by admins"
on public.scan_results
for select
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Scan results are updatable by admins" on public.scan_results;
create policy "Scan results are updatable by admins"
on public.scan_results
for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 8) Locations (admin-managed; readable by all authenticated)
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamp with time zone not null default now()
);

alter table public.locations enable row level security;

drop policy if exists "Locations are readable by all authenticated" on public.locations;
create policy "Locations are readable by all authenticated"
on public.locations
for select
to authenticated
using (true);

drop policy if exists "Locations are writable by admins" on public.locations;
create policy "Locations are writable by admins"
on public.locations
for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 9) Audit logs (admin action trail)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "Audit logs are insertable by admins" on public.audit_logs;
create policy "Audit logs are insertable by admins"
on public.audit_logs
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "Audit logs are readable by admins" on public.audit_logs;
create policy "Audit logs are readable by admins"
on public.audit_logs
for select
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
