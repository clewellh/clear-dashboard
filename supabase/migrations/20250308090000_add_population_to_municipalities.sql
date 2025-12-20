alter table public.municipalities
add column if not exists population integer;

-- Seed demo town so UI immediately works
update public.municipalities
set population = 13300
where slug = 'new-providence';
