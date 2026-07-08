import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public project URL + publishable (anon) key. Both are safe to expose in the
// browser — the database is protected by Row Level Security policies, not by
// hiding the key. Supports the new `sb_publishable_...` key as well as the
// legacy `anon` JWT key.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

// Lazily create a singleton client. Returns null when env vars are missing so
// the app can render a helpful "not configured" message instead of crashing.
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

// Name of the public Storage bucket that holds uploaded photos.
export const PHOTO_BUCKET = 'photos';
