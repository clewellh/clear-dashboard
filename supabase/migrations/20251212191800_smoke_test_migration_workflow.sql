-- Day 5 smoke test: harmless schema change to confirm migration workflow works end-to-end
alter table public.municipalities
  add column if not exists notes text;
