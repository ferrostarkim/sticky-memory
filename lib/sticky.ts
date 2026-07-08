// Random sticky-note appearance, generated on the client when a note is posted
// (there's no server to assign it anymore — everything goes straight to Supabase).
const COLORS = [
  'bg-amber-100',
  'bg-rose-100',
  'bg-emerald-100',
  'bg-sky-100',
  'bg-violet-100',
  'bg-orange-100',
  'bg-teal-100',
  'bg-lime-100',
];

export function makeStickyStyle(): { color: string; rotation: number } {
  return {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    // A tilt between -6 and +6 degrees, rounded to one decimal.
    rotation: Math.round((Math.random() * 12 - 6) * 10) / 10,
  };
}
