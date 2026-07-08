// Random sticky-note appearance, generated on the client when a note is posted
// (there's no server to assign it anymore — everything goes straight to Supabase).
const COLORS = [
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-orange-200',
];

export function makeStickyStyle(): { color: string; rotation: number } {
  return {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    // A tilt between -6 and +6 degrees, rounded to one decimal.
    rotation: Math.round((Math.random() * 12 - 6) * 10) / 10,
  };
}
