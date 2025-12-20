-- Day 7: RLS with Public Read + Admin Write
-- Tables: public.municipalities, public.np_meetings (if exists), public.app_users
-- NOTE: Do NOT seed a hard-coded admin UUID in migrations.

-- 0) Helper: is current user an admin?
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

-- 1) Helper: promote a user to admin by email (run manually after user exists)
create or replace function public.promote_user_to_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  select id into uid
  from auth.users
  where email = target_email;

  if uid is null then
    raise exception 'No auth user found for email %', target_email;
  end if;

  insert into public.app_users (id, email, role)
  values (uid, target_email, 'admin')
  on conflict (id) do update
    set role = 'admin',
        email = excluded.email;
end;
$$;

revoke all on function public.promote_user_to_admin(text) from public;
grant execute on function public.promote_user_to_admin(text) to service_role;

-- 2) Enable RLS (only on tables that exist)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='municipalities') then
    execute 'alter table public.municipalities enable row level security';
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='np_meetings') then
    execute 'alter table public.np_meetings enable row level security';
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='app_users') then
    execute 'alter table public.app_users enable row level security';
  end if;
end $$;

-- 3) Drop existing policies if they exist (rerunnable)
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

-- 4) Policies (only create them if the table exists)

-- municipalities
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='municipalities') then
    execute $p$
      create policy municipalities_public_read
      on public.municipalities
      for select
      to anon, authenticated
      using (true)
    $p$;

    execute $p$
      create policy municipalities_admin_write
      on public.municipalities
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $p$;
  end if;
end $$;

-- np_meetings
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='np_meetings') then
    execute $p$
      create policy np_meetings_public_read
      on public.np_meetings
      for select
      to anon, authenticated
      using (true)
    $p$;

    execute $p$
      create policy np_meetings_admin_write
      on public.np_meetings
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $p$;
  end if;
end $$;

-- app_users
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='app_users') then
    execute $p$
      create policy app_users_self_read
      on public.app_users
      for select
      to authenticated
      using (id = auth.uid() or public.is_admin())
    $p$;

    execute $p$
      create policy app_users_admin_all
      on public.app_users
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $p$;
  end if;
end $$;
