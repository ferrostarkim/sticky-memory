// Define the data structure for a single sticky note (memory)
export interface Memory {
  id: string;
  author: string;
  content: string;
  color: string;
  rotation: number;
  // Optional photo URL (Supabase Storage public URL)
  image?: string;
  // Creation timestamp (ISO string from the database); used for ordering
  createdAt?: string;
}

// Shape of a row in the Supabase `memories` table.
export interface MemoryRow {
  id: string;
  author: string;
  content: string;
  image_url: string | null;
  color: string;
  rotation: number;
  created_at: string;
}

export function rowToMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    image: row.image_url ?? undefined,
    color: row.color,
    rotation: row.rotation,
    createdAt: row.created_at,
  };
}
