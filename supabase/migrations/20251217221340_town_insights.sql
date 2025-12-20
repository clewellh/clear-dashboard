-- 1) Table
create table if not exists public.town_insights (
  id uuid primary key default gen_random_uuid(),

  municipality_id uuid not null references public.municipalities(id) on delete cascade,

  as_of_date date not null default current_date,

  -- Core dashboard metrics
  transparency_score int not null check (transparency_score >= 0 and transparency_score <= 100),
  transparency_grade text not null, -- store "A", "B", etc. so UI is simple

  corruption_money_lost_usd numeric(14,2) not null default 0, -- e.g. 1250000.00
  corruption_jobs_lost_est numeric(12,2) not null default 0, -- allow fractional estimate

  -- What it means in real terms (precomputed strings so UI is 60-sec readable)
  real_world_examples jsonb not null default '[]'::jsonb,
  -- Example array:
  -- [
  --   {"label":"Teachers (avg loaded cost)", "usd_per_unit": 120000, "equivalent_units": 10.4, "note":"~$120k/yr"},
  --   {"label":"Road resurfacing (per mile)", "usd_per_unit": 350000, "equivalent_units": 3.6, "note":"ballpark"}
  -- ]

  -- Transparency + corruption methodology (links + explanation)
  methodology_summary text not null default '',
  sources jsonb not null default '[]'::jsonb,
  -- Example array:
  -- [
  --   {"title":"2024 Municipal Budget", "url":"https://...", "type":"budget"},
  --   {"title":"OPRA Request Log", "url":"https://...", "type":"records"}
  -- ]

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Updated-at trigger (only if you already have a generic trigger function, skip this and tell me)
-- If you already created a trigger function earlier, reuse it. If not, we’ll keep it simple for now.

-- 3) RLS: match existing pattern (public read, admin write)
alter table public.town_insights enable row level security;

drop policy if exists "Public read town_insights" on public.town_insights;
create policy "Public read town_insights"
on public.town_insights
for select
to anon, authenticated
using (true);

drop policy if exists "Admin write town_insights" on public.town_insights;
create policy "Admin write town_insights"
on public.town_insights
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
