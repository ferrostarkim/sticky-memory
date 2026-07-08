-- Sticky Memory — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor > New query > paste > Run.

-- 1. Table --------------------------------------------------------------------
create table if not exists public.memories (
  id         uuid primary key default gen_random_uuid(),
  author     text not null default 'Anonymous',
  content    text not null default '',
  image_url  text,
  color      text not null,
  rotation   real not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists memories_created_at_idx
  on public.memories (created_at);

-- 2. Row Level Security -------------------------------------------------------
-- This is a public event guestbook: anyone may read and add a note (no login).
alter table public.memories enable row level security;

create policy "Anyone can read memories"
  on public.memories for select
  using (true);

create policy "Anyone can add a memory"
  on public.memories for insert
  with check (true);

-- 3. Realtime -----------------------------------------------------------------
-- Broadcast inserts to every open board in real time.
alter publication supabase_realtime add table public.memories;

-- 4. Photo storage ------------------------------------------------------------
-- Public bucket for uploaded photos.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Anyone can upload a photo"
  on storage.objects for insert
  with check (bucket_id = 'photos');

create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- (Optional) a couple of welcome notes so the board isn't empty at the start:
-- insert into public.memories (author, content, color, rotation) values
--   ('Host', 'Welcome! Scan the QR to leave a message.', 'bg-yellow-200', -3),
--   ('Host', 'Add a photo too 📸', 'bg-green-200', 2);
