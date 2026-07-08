/* eslint-disable @next/next/no-img-element */
import { Memory } from '@/types/memory';

interface StickyNoteProps {
  memory: Memory;
}

export default function StickyNote({ memory }: StickyNoteProps) {
  const rotationStyle = { transform: `rotate(${memory.rotation}deg)` };
  // Nudge the tape rotation opposite the note for a hand-placed look.
  const tapeStyle = { transform: `rotate(${(-memory.rotation * 0.8).toFixed(1)}deg)` };

  return (
    <div
      className={`paper relative w-52 min-h-52 px-4 pt-7 pb-3 flex flex-col ${memory.color}`}
      style={rotationStyle}
    >
      {/* Washi tape holding the note */}
      <div
        className="washi absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-[2px]"
        style={tapeStyle}
      />

      {/* Optional photo, framed like a printed snapshot */}
      {memory.image && (
        <img
          src={memory.image}
          alt={`${memory.author}さんの写真`}
          className="relative w-full h-36 object-cover rounded-[2px] mb-2 bg-white/70 p-1 shadow-sm ring-1 ring-black/5"
        />
      )}

      {/* Message in handwriting */}
      {memory.content && (
        <p className="font-hand relative flex-1 text-[var(--ink)] text-[1.05rem] leading-snug whitespace-pre-wrap break-words">
          {memory.content}
        </p>
      )}

      {/* Signature */}
      <div className="font-hand relative text-right text-[var(--ink-soft)] text-sm mt-2">
        — {memory.author}
      </div>
    </div>
  );
}
