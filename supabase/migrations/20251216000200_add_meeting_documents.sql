-- public.meeting_documents: links to agenda/minutes/packet/etc for a meeting
-- Requires: public.meetings(uid uuid primary key)

-- If you already created a text-based meeting_uid before, drop and recreate cleanly
drop table if exists public.meeting_documents cascade;

create table public.meeting_documents (
  id uuid primary key default gen_random_uuid(),

  -- FK to meetings.uid (UUID)
  meeting_uid uuid not null references public.meetings(uid) on delete cascade,

  doc_type text not null
    check (doc_type in ('agenda','minutes','packet','video','other')),

  title text null,
  url text not null,

  created_at timestamptz not null default now()
);

create index if not exists idx_meeting_documents_meeting_uid
  on public.meeting_documents (meeting_uid);

-- RLS: public read, admin write
alter table public.meeting_documents enable row level security;

drop policy if exists public_read_meeting_documents on public.meeting_documents;
create policy public_read_meeting_documents
  on public.meeting_documents
  for select
  to anon, authenticated
  using (true);

drop policy if exists admin_write_meeting_documents on public.meeting_documents;
create policy admin_write_meeting_documents
  on public.meeting_documents
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
