-- Create meetings table (source of truth for calendar events)

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.meetings (
  uid uuid primary key default gen_random_uuid(),

  municipality text not null,
  body_name text,
  title text,
  meeting_date date not null,

  agenda_url text,
  source_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meetings_meeting_date on public.meetings(meeting_date);
create index if not exists idx_meetings_municipality on public.meetings(municipality);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_meetings_set_updated_at on public.meetings;
create trigger trg_meetings_set_updated_at
before update on public.meetings
for each row execute function public.set_updated_at();
