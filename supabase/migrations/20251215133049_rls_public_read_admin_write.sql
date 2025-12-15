-- Day 7: RLS with Public Read + Admin Write
-- Tables: public.municipalities, public.np_meetings, public.app_users
-- Admin UID: b983b947-f5f8-44db-a7cb-de961374efa9

-- 0) Helper function: "is the current user an admin?"
-- SECURITY DEFINER so it can read app_users even when RLS is on.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users au
    where au.id = auth.uid()
      and au.role = 'admin'
  );
$$;

-- 1) Seed/Upsert your admin row in app_users
-- Pulls email from auth.users if available.
insert into public.app_users (id, email, role)
values (
  'b983b947-f5f8-44db-a7cb-de961374efa9'::uuid,
  (select email from auth.users where id = 'b983b947-f5f8-44db-a7cb-de961374efa9'::uuid),
  'admin'
)
on conflict (id) do update
set role = 'admin',
    email = excluded.email;

-- 2) Enable RLS
alter table public.municipalities enable row level security;
alter table public.np_meetings enable row level security;
alter table public.app_users enable row level security;

-- 3) Drop existing policies if they exist (so migration is rerunnable in dev)
do $$
begin
  -- municipalities
  if exists (select 1 from pg_policies where schemaname='public' and tablename='municipalities' and policyname='municipalities_public_read') then
    execute 'drop policy municipalities_public_read on public.municipalities';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='municipalities' and policyname='municipalities_admin_write') then
    execute 'drop policy municipalities_admin_write on public.municipalities';
  end if;

  -- np_meetings
  if exists (select 1 from pg_policies where schemaname='public' and tablename='np_meetings' and policyname='np_meetings_public_read') then
    execute 'drop policy np_meetings_public_read on public.np_meetings';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='np_meetings' and policyname='np_meetings_admin_write') then
    execute 'drop policy np_meetings_admin_write on public.np_meetings';
  end if;

  -- app_users
  if exists (select 1 from pg_policies where schemaname='public' and tablename='app_users' and policyname='app_users_self_read') then
    execute 'drop policy app_users_self_read on public.app_users';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='app_users' and policyname='app_users_admin_all') then
    execute 'drop policy app_users_admin_all on public.app_users';
  end if;
end $$;

-- 4) POLICIES

-- municipalities: PUBLIC READ
create policy municipalities_public_read
on public.municipalities
for select
to anon, authenticated
using (true);

-- municipalities: ADMIN WRITE (insert/update/delete)
create policy municipalities_admin_write
on public.municipalities
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- np_meetings: PUBLIC READ (calendar stays public)
create policy np_meetings_public_read
on public.np_meetings
for select
to anon, authenticated
using (true);

-- np_meetings: ADMIN WRITE
create policy np_meetings_admin_write
on public.np_meetings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- app_users: user can read their own profile; admins can read all
create policy app_users_self_read
on public.app_users
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

-- app_users: admins can insert/update/delete any profile rows
create policy app_users_admin_all
on public.app_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
