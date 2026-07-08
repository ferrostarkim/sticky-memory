/* eslint-disable @next/next/no-img-element */
import { Memory } from '@/types/memory';

interface StickyNoteProps {
  memory: Memory;
}

export default function StickyNote({ memory }: StickyNoteProps) {
  // Apply dynamic rotation using inline styles
  const rotationStyle = { transform: `rotate(${memory.rotation}deg)` };

  return (
    <div
      className={`relative w-52 min-h-52 p-3 pt-6 shadow-lg flex flex-col ${memory.color}`}
      style={rotationStyle}
    >
      {/* Pin element at the top center */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-md border border-red-700"></div>

      {/* Optional uploaded photo */}
      {memory.image && (
        <img
          src={memory.image}
          alt={`${memory.author}さんの写真`}
          className="w-full h-36 object-cover rounded-sm mb-2 border border-black/10 bg-white"
        />
      )}

      {/* Main message content */}
      {memory.content && (
        <p className="flex-1 text-gray-800 font-medium whitespace-pre-wrap break-words leading-snug">
          {memory.content}
        </p>
      )}

      {/* Author signature */}
      <div className="text-right text-gray-600 text-sm font-semibold italic mt-2">
        - {memory.author}
      </div>
    </div>
  );
}
