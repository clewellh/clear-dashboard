-- Bring existing municipalities table in line with canonical schema

alter table public.municipalities
  add column if not exists fips_code text,
  add column if not exists population integer,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists state text not null default 'NJ',
  add column if not exists website_url text,
  add column if not exists opra_email text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_municipalities_name on public.municipalities (name);
