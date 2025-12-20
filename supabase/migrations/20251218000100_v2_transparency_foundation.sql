-- V2 Transparency Foundation (scale-first)
-- Adds: population, metrics, coverage/status, town requests, and refresh function

-- 1) Add population (safe if already exists)
alter table public.municipalities
add column if not exists population integer;

-- 2) Raw metrics per town (one row per municipality per run)
create table if not exists public.municipality_metrics (
  id bigserial primary key,
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  as_of_date date not null default current_date,

  -- Example “objective-ish” signals (start small, expand later)
  meeting_docs_posting_lag_days numeric,         -- avg days after meeting until docs posted
  agendas_posted_rate numeric,                   -- 0..1
  minutes_posted_rate numeric,                   -- 0..1

  opra_response_days_avg numeric,
  opra_backlog_count integer,

  no_bid_rate numeric,                           -- 0..1
  vendor_concentration_hhi numeric,              -- 0..1 (proxy: higher = fewer vendors)

  audit_findings_count integer,

  -- any extra derived signals later
  notes text,

  created_at timestamptz not null default now(),

  -- ensure only one “latest row” per town per as-of-date if you want
  unique (municipality_id, as_of_date)
);

-- 3) Coverage / data quality status (powers Confidence)
create table if not exists public.data_sources_status (
  municipality_id uuid primary key references public.municipalities(id) on delete cascade,

  last_updated_at timestamptz not null default now(),

  -- coverage booleans (what we have)
  has_meetings boolean not null default false,
  has_meeting_documents boolean not null default false,
  has_contracts boolean not null default false,
  has_opra_metrics boolean not null default false,
  has_audit_data boolean not null default false,
  has_population boolean not null default false,

  -- counts help explain confidence
  sources_count integer not null default 0,
  metrics_filled_count integer not null default 0,
  metrics_total_count integer not null default 12,

  missing text[] not null default '{}'
);

-- 4) Town requests (so /town never dead-ends)
create table if not exists public.town_requests (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  municipality_slug text not null,
  email text,
  note text
);

-- 5) Ensure town_insights has unique per municipality
alter table public.town_insights
add constraint if not exists town_insights_muni_unique unique (municipality_id);

-- 6) Helper: compute confidence label from coverage (purely deterministic)
create or replace function public.compute_confidence_label(status public.data_sources_status)
returns text
language plpgsql
as $$
declare
  coverage_score int := 0;
begin
  -- add points for each “we have it”
  if status.has_population then coverage_score := coverage_score + 1; end if;
  if status.has_meetings then coverage_score := coverage_score + 1; end if;
  if status.has_meeting_documents then coverage_score := coverage_score + 1; end if;
  if status.has_contracts then coverage_score := coverage_score + 1; end if;
  if status.has_opra_metrics then coverage_score := coverage_score + 1; end if;
  if status.has_audit_data then coverage_score := coverage_score + 1; end if;

  -- bump for sources volume
  if status.sources_count >= 5 then coverage_score := coverage_score + 2;
  elsif status.sources_count >= 2 then coverage_score := coverage_score + 1;
  end if;

  if coverage_score >= 7 then return 'High'; end if;
  if coverage_score >= 4 then return 'Medium'; end if;
  return 'Low';
end;
$$;

-- 7) Core: refresh_town_insight
-- This is the “one button” to update town_insights from raw metrics + status.
create or replace function public.refresh_town_insight(p_municipality_id uuid)
returns void
language plpgsql
as $$
declare
  m public.municipality_metrics;
  s public.data_sources_status;
  computed_score numeric := 0;
  grade text;
  money_lost numeric := 0;
  jobs_lost numeric := 0;
  confidence text := 'Low';
  per_household numeric := null;
  pop int := null;

  -- very simple baseline constants (tune later)
  base_spend_proxy numeric := 20000000; -- placeholder proxy if you don't have spend tables yet
  leakage_multiplier numeric := 0.03;   -- 3% “avoidable waste” starting point (tune later)
  avg_job_cost numeric := 150000;       -- salary+benefits proxy (tune later)
begin
  -- latest metrics row (if any)
  select *
  into m
  from public.municipality_metrics
  where municipality_id = p_municipality_id
  order by as_of_date desc
  limit 1;

  -- status row (required); create if missing
  select *
  into s
  from public.data_sources_status
  where municipality_id = p_municipality_id;

  if not found then
    insert into public.data_sources_status(municipality_id)
    values (p_municipality_id)
    returning * into s;
  end if;

  -- population
  select population into pop from public.municipalities where id = p_municipality_id;
  if pop is not null and pop > 0 then
    s.has_population := true;
  end if;

  -- COMPUTE SCORE (v2-lite):
  -- Start from 100 and subtract penalties for missing/weak signals.
  computed_score := 100;

  -- Penalties based on rates / lags when metrics exist
  if m.municipality_id is not null then
    if m.agendas_posted_rate is not null then
      computed_score := computed_score - ( (1 - greatest(least(m.agendas_posted_rate,1),0)) * 12 );
    else
      computed_score := computed_score - 6;
    end if;

    if m.minutes_posted_rate is not null then
      computed_score := computed_score - ( (1 - greatest(least(m.minutes_posted_rate,1),0)) * 10 );
    else
      computed_score := computed_score - 5;
    end if;

    if m.meeting_docs_posting_lag_days is not null then
      computed_score := computed_score - least(greatest(m.meeting_docs_posting_lag_days,0), 30) * 0.6;
    else
      computed_score := computed_score - 6;
    end if;

    if m.no_bid_rate is not null then
      computed_score := computed_score - greatest(least(m.no_bid_rate,1),0) * 18;
    else
      computed_score := computed_score - 6;
    end if;

    if m.audit_findings_count is not null then
      computed_score := computed_score - least(greatest(m.audit_findings_count,0), 10) * 1.5;
    end if;

    if m.opra_response_days_avg is not null then
      computed_score := computed_score - least(greatest(m.opra_response_days_avg,0), 60) * 0.2;
      s.has_opra_metrics := true;
    end if;
  else
    -- no metrics row at all: keep town visible but reduce score confidence
    computed_score := computed_score - 25;
  end if;

  -- Clamp 0..100
  computed_score := greatest(0, least(100, computed_score));

  -- Grade mapping (same as frontend)
  if computed_score >= 93 then grade := 'A';
  elsif computed_score >= 90 then grade := 'A-';
  elsif computed_score >= 87 then grade := 'B+';
  elsif computed_score >= 83 then grade := 'B';
  elsif computed_score >= 80 then grade := 'B-';
  elsif computed_score >= 77 then grade := 'C+';
  elsif computed_score >= 73 then grade := 'C';
  elsif computed_score >= 70 then grade := 'C-';
  elsif computed_score >= 60 then grade := 'D';
  else grade := 'F';
  end if;

  -- Money lost (v2-lite): make it proportional to worse governance score
  -- worse score => higher multiplier around leakage_multiplier baseline
  money_lost := base_spend_proxy * (leakage_multiplier + ((100 - computed_score) / 100) * 0.05);

  -- Jobs lost: money / job cost
  jobs_lost := money_lost / avg_job_cost;

  -- Per-household framing if population exists
  if pop is not null and pop > 0 then
    -- households ~ pop/2.6
    per_household := money_lost / (pop / 2.6);
  end if;

  -- Update status-derived fields
  s.metrics_filled_count := 0;
  if m.agendas_posted_rate is not null then s.metrics_filled_count := s.metrics_filled_count + 1; end if;
  if m.minutes_posted_rate is not null then s.metrics_filled_count := s.metrics_filled_count + 1; end if;
  if m.meeting_docs_posting_lag_days is not null then s.metrics_filled_count := s.metrics_filled_count + 1; end if;
  if m.no_bid_rate is not null then s.metrics_filled_count := s.metrics_filled_count + 1; end if;
  if m.opra_response_days_avg is not null then s.metrics_filled_count := s.metrics_filled_count + 1; end if;
  if m.audit_findings_count is not null then s.metrics_filled_count := s.metrics_filled_count + 1; end if;

  s.missing := '{}';
  if not s.has_population then s.missing := array_append(s.missing, 'population'); end if;
  if not s.has_contracts then s.missing := array_append(s.missing, 'contracts'); end if;
  if not s.has_opra_metrics then s.missing := array_append(s.missing, 'opra'); end if;
  if not s.has_audit_data then s.missing := array_append(s.missing, 'audits'); end if;

  confidence := public.compute_confidence_label(s);
  s.last_updated_at := now();

  update public.data_sources_status
  set last_updated_at = s.last_updated_at,
      has_meetings = s.has_meetings,
      has_meeting_documents = s.has_meeting_documents,
      has_contracts = s.has_contracts,
      has_opra_metrics = s.has_opra_metrics,
      has_audit_data = s.has_audit_data,
      has_population = s.has_population,
      sources_count = s.sources_count,
      metrics_filled_count = s.metrics_filled_count,
      metrics_total_count = s.metrics_total_count,
      missing = s.missing
  where municipality_id = p_municipality_id;

  -- Upsert town_insights
  insert into public.town_insights (
    municipality_id,
    as_of_date,
    transparency_score,
    transparency_grade,
    corruption_money_lost_usd,
    corruption_jobs_lost_est,
    methodology_summary,
    real_world_examples,
    sources
  )
  values (
    p_municipality_id,
    current_date,
    computed_score,
    grade,
    money_lost,
    jobs_lost,
    'V2-lite: score is computed from objective posting/timeliness/procurement proxies when available. Confidence reflects data coverage.',
    '[]'::jsonb,
    '[]'::jsonb
  )
  on conflict (municipality_id) do update set
    as_of_date = excluded.as_of_date,
    transparency_score = excluded.transparency_score,
    transparency_grade = excluded.transparency_grade,
    corruption_money_lost_usd = excluded.corruption_money_lost_usd,
    corruption_jobs_lost_est = excluded.corruption_jobs_lost_est,
    methodology_summary = excluded.methodology_summary;

end;
$$;

-- 8) RLS / Policies (public read for transparency tool, public insert for town_requests)
alter table public.municipality_metrics enable row level security;
alter table public.data_sources_status enable row level security;
alter table public.town_requests enable row level security;

-- public can read status/metrics (safe; contains no PII)
drop policy if exists "public read municipality_metrics" on public.municipality_metrics;
create policy "public read municipality_metrics"
on public.municipality_metrics for select
to public
using (true);

drop policy if exists "public read data_sources_status" on public.data_sources_status;
create policy "public read data_sources_status"
on public.data_sources_status for select
to public
using (true);

-- Anyone can request a town (email optional)
drop policy if exists "public insert town_requests" on public.town_requests;
create policy "public insert town_requests"
on public.town_requests for insert
to public
with check (true);
