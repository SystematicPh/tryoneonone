create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  total_points numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.point_settings (
  id integer primary key,
  amount_per_point numeric(12,2) not null default 100,
  points_per_amount numeric(12,2) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.point_settings (id, amount_per_point, points_per_amount)
values (1, 100, 1)
on conflict (id) do nothing;

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid references public.profiles(id) on delete set null,
  amount_spent numeric(12,2) not null,
  points_awarded numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_emoji text not null default '🎁',
  points_cost numeric(12,2) not null,
  stock integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete restrict,
  reward_name_snapshot text not null,
  points_spent numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'claimed', 'cancelled')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists point_settings_updated_at on public.point_settings;
create trigger point_settings_updated_at
before update on public.point_settings
for each row
execute function public.set_updated_at();

drop trigger if exists rewards_updated_at on public.rewards;
create trigger rewards_updated_at
before update on public.rewards
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'New Customer'),
    'customer'
  )
  on conflict (id) do update
  set username = excluded.username,
      full_name = excluded.full_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.add_purchase_points(
  purchase_amount numeric,
  target_username text,
  acting_admin_id uuid,
  notes_input text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_profile public.profiles%rowtype;
  admin_profile public.profiles%rowtype;
  settings_row public.point_settings%rowtype;
  earned_points numeric(12,2);
begin
  select * into target_profile
  from public.profiles
  where username = lower(trim(target_username));

  if target_profile.id is null then
    raise exception 'User not found';
  end if;

  select * into admin_profile
  from public.profiles
  where id = acting_admin_id;

  if admin_profile.role <> 'admin' then
    raise exception 'Only admins can add points';
  end if;

  select * into settings_row
  from public.point_settings
  where id = 1;

  earned_points := round((purchase_amount / settings_row.amount_per_point) * settings_row.points_per_amount, 2);

  insert into public.point_transactions (
    user_id,
    admin_id,
    amount_spent,
    points_awarded,
    notes
  )
  values (
    target_profile.id,
    acting_admin_id,
    purchase_amount,
    earned_points,
    notes_input
  );

  update public.profiles
  set total_points = total_points + earned_points
  where id = target_profile.id;

  return json_build_object(
    'ok', true,
    'username', target_profile.username,
    'purchase_amount', purchase_amount,
    'earned_points', earned_points
  );
end;
$$;

create or replace function public.claim_reward(reward_id_input uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  current_profile public.profiles%rowtype;
  reward_row public.rewards%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into current_profile
  from public.profiles
  where id = current_user_id;

  select * into reward_row
  from public.rewards
  where id = reward_id_input and is_active = true;

  if reward_row.id is null then
    raise exception 'Reward not found';
  end if;

  if current_profile.total_points < reward_row.points_cost then
    raise exception 'Not enough points';
  end if;

  if reward_row.stock is not null and reward_row.stock <= 0 then
    raise exception 'Reward is out of stock';
  end if;

  update public.profiles
  set total_points = total_points - reward_row.points_cost
  where id = current_user_id;

  insert into public.reward_redemptions (
    user_id,
    reward_id,
    reward_name_snapshot,
    points_spent
  )
  values (
    current_user_id,
    reward_row.id,
    reward_row.title,
    reward_row.points_cost
  );

  if reward_row.stock is not null then
    update public.rewards
    set stock = stock - 1
    where id = reward_row.id;
  end if;

  return json_build_object(
    'ok', true,
    'reward_title', reward_row.title,
    'points_spent', reward_row.points_cost
  );
end;
$$;

create or replace view public.leaderboard as
select
  row_number() over (order by total_points desc, created_at asc) as rank_number,
  username,
  full_name,
  total_points
from public.profiles
where role = 'customer'
order by total_points desc, created_at asc;

alter table public.profiles enable row level security;
alter table public.point_settings enable row level security;
alter table public.point_transactions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "rewards readable by authenticated users" on public.rewards;
create policy "rewards readable by authenticated users"
on public.rewards
for select
to authenticated
using (true);

drop policy if exists "point settings readable by authenticated users" on public.point_settings;
create policy "point settings readable by authenticated users"
on public.point_settings
for select
to authenticated
using (true);

drop policy if exists "users see own point transactions" on public.point_transactions;
create policy "users see own point transactions"
on public.point_transactions
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

drop policy if exists "users see own redemptions" on public.reward_redemptions;
create policy "users see own redemptions"
on public.reward_redemptions
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.leaderboard to authenticated, service_role;
grant execute on function public.add_purchase_points(numeric, text, uuid, text) to authenticated, service_role;
grant execute on function public.claim_reward(uuid) to authenticated, service_role;

insert into public.rewards (title, description, image_emoji, points_cost, stock, is_active)
select *
from (
  values
    ('Free Softdrinks', 'Perfect pang partner sa next mong bili sa store.', '🥤', 10::numeric, 50, true),
    ('Snack Pack', 'Sulit combo reward para sa loyal customers.', '🍪', 20::numeric, 30, true),
    ('Store Voucher', 'Discount voucher for your next checkout.', '🎟️', 35::numeric, 20, true)
) as seed(title, description, image_emoji, points_cost, stock, is_active)
where not exists (
  select 1
  from public.rewards existing
  where existing.title = seed.title
);

-- After running this SQL, create your first admin manually in Supabase Auth,
-- then run the line below and replace the username:
-- update public.profiles set role = 'admin' where username = 'youradminusername';
