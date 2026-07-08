-- DECISIVE RESET -------------------------------------------------------------
-- The existing (empty) `memories` table had the wrong columns, and
-- `create table if not exists` / `alter table` did not fix it. This drops and
-- recreates the table with the exact schema, policies, and realtime the app
-- needs. Safe because the table holds no data.
--
-- Run this in the Supabase dashboard for project "sticky-memory":
--   SQL Editor > New query > paste ALL of this > Run.
-- You should see "Success. No rows returned".

drop table if exists public.memories cascade;

create table public.memories (
  id         uuid primary key default gen_random_uuid(),
  author     text not null default 'Anonymous',
  content    text not null default '',
  image_url  text,
  color      text not null default 'bg-yellow-200',
  rotation   real not null default 0,
  created_at timestamptz not null default now()
);

create index memories_created_at_idx on public.memories (created_at);

-- Row Level Security: public event guestbook (anyone may read + add).
alter table public.memories enable row level security;

create policy "Anyone can read memories"
  on public.memories for select using (true);

create policy "Anyone can add a memory"
  on public.memories for insert with check (true);

-- Realtime broadcast of inserts.
alter publication supabase_realtime add table public.memories;

-- Refresh the API layer's schema cache immediately.
notify pgrst, 'reload schema';
