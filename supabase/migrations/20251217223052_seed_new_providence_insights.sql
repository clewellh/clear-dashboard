-- Ensure municipality exists
insert into public.municipalities (name, county, slug)
values ('New Providence', 'Union', 'new-providence')
on conflict (slug) do update
set name = excluded.name,
    county = excluded.county;

-- Ensure one insight row exists (upsert by municipality_id)
with m as (
  select id from public.municipalities where slug = 'new-providence' limit 1
)
insert into public.town_insights (
  municipality_id,
  as_of_date,
  transparency_score,
  transparency_grade,
  corruption_money_lost_usd,
  corruption_jobs_lost_est,
  real_world_examples,
  methodology_summary,
  sources
)
select
  m.id,
  current_date,
  78,
  'B',
  1250000.00,
  8.5,
  '[
    {"label":"Teachers (avg loaded cost)", "usd_per_unit":120000, "equivalent_units":10.4, "note":"ballpark fully-loaded annual cost"},
    {"label":"Road resurfacing (per mile)", "usd_per_unit":350000, "equivalent_units":3.6, "note":"typical municipal range varies"},
    {"label":"After-school seats", "usd_per_unit":2500, "equivalent_units":500, "note":"program-dependent"}
  ]'::jsonb,
  'Prototype estimate for demo: combines (a) transparency risk factors and (b) procurement/overspend proxies. Replace with objective NJ-wide formula once pipeline is wired.',
  '[
    {"title":"Municipal budget (placeholder)", "url":"https://example.com/budget.pdf", "type":"budget"},
    {"title":"Contracts list (placeholder)", "url":"https://example.com/contracts", "type":"procurement"},
    {"title":"OPRA log (placeholder)", "url":"https://example.com/opra", "type":"records"}
  ]'::jsonb
from m
on conflict (municipality_id) do update
set
  as_of_date = excluded.as_of_date,
  transparency_score = excluded.transparency_score,
  transparency_grade = excluded.transparency_grade,
  corruption_money_lost_usd = excluded.corruption_money_lost_usd,
  corruption_jobs_lost_est = excluded.corruption_jobs_lost_est,
  real_world_examples = excluded.real_world_examples,
  methodology_summary = excluded.methodology_summary,
  sources = excluded.sources;
