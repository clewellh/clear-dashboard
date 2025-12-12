-- Base schema for CLEAR

-- Municipalities: core unit for transparency scores, calendars, etc.
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  county text,
  state text not null default 'NJ',
  website_url text,
  opra_email text,
  population integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- App users: profile info linked to Supabase auth.users
create table if not exists public.app_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('admin','staff','organizer','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index for looking up municipalities by name
create index if not exists idx_municipalities_name on public.municipalities (name);

-- Helpful index for app_users by email
create index if not exists idx_app_users_email on public.app_users (email);
