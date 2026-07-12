'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect } from 'react';
import { Memory } from '@/types/memory';

// Enlarged view of a single note. Click the backdrop, the ✕, or press Esc to
// close. The photo (if any) is shown large; the message is shown big.
export default function Lightbox({
  memory,
  onClose,
}: {
  memory: Memory;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/75 backdrop-blur-sm cursor-zoom-out animate-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`paper relative ${memory.color} rounded-md px-6 pt-10 pb-6 w-full max-w-[760px] max-h-[92vh] overflow-y-auto cursor-default animate-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="washi absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-[2px] rotate-[-2deg]" />

        <button
          onClick={onClose}
          aria-label="閉じる"
          className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 text-[var(--ink)] flex items-center justify-center text-lg leading-none transition-colors"
        >
          ✕
        </button>

        {memory.image && (
          <img
            src={memory.image}
            alt={`${memory.author}さんの写真`}
            className="relative w-full max-h-[64vh] object-contain rounded bg-white/70 p-2 shadow ring-1 ring-black/5 mb-4"
          />
        )}

        {memory.content && (
          <p className="font-hand relative text-[var(--ink)] text-2xl sm:text-3xl leading-relaxed whitespace-pre-wrap break-words">
            {memory.content}
          </p>
        )}

        <div className="font-hand relative text-right text-[var(--ink-soft)] text-xl mt-4">
          — {memory.author}
        </div>
      </div>
    </div>
  );
}
