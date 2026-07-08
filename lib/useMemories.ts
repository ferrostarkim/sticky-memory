'use client';

import { useEffect, useState } from 'react';
import { Memory, MemoryRow, rowToMemory } from '@/types/memory';
import { getSupabase } from '@/lib/supabase';

// Loads all memories from Supabase and subscribes to live inserts via Supabase
// Realtime. Returns notes oldest -> newest, plus a `connected` flag for the UI.
export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let active = true;

    // 1. Initial snapshot.
    supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (active && data) {
          setMemories((data as MemoryRow[]).map(rowToMemory));
        }
      });

    // 2. Live inserts.
    const channel = supabase
      .channel('memories-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memories' },
        (payload) => {
          const incoming = rowToMemory(payload.new as MemoryRow);
          setMemories((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { memories, connected };
}
