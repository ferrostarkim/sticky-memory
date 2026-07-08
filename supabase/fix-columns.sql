-- One-off fix ---------------------------------------------------------------
-- An older `memories` table already existed with only id/image_url/created_at,
-- so `create table if not exists` skipped adding the rest. Add them here.

alter table public.memories
  add column if not exists author   text  not null default 'Anonymous',
  add column if not exists content  text  not null default '',
  add column if not exists color    text  not null default 'bg-yellow-200',
  add column if not exists rotation real  not null default 0;

-- Make sure realtime is on for this table (harmless if already added).
-- alter publication supabase_realtime add table public.memories;

-- Tell PostgREST (the REST/Realtime API layer) to refresh its schema cache now.
notify pgrst, 'reload schema';
