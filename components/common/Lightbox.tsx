'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect } from 'react';
import { Memory } from '@/types/memory';

// Enlarged view of a single note. Click the backdrop, the ✕, or press Esc to
// close. The photo (if any) is shown large; the message is shown big.
//
// onPrev / onNext を渡すと、札の左右に送りボタンが出る。閉じて開き直さずに
// そのまま次の思い出へ移れる。渡さなければボタンは出ない (CorkBoard 用)。
export default function Lightbox({
  memory,
  onClose,
  onPrev,
  onNext,
  position,
}: {
  memory: Memory;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** 「12 / 69」の表示用。1 始まり。 */
  position?: { index: number; total: number };
}) {
  const canStep = Boolean(onPrev && onNext);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // キーボードでも送れるようにする。マウスを動かさずに読み進められる。
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  // 送りボタンは背景と同じ層に置くので、押しても閉じないよう伝播を止める
  const step = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  const arrow =
    'absolute top-1/2 -translate-y-1/2 z-20 grid place-items-center ' +
    'w-11 h-11 sm:w-14 sm:h-14 rounded-full ' +
    'bg-white/85 hover:bg-white text-[var(--ink)] shadow-lg ring-1 ring-black/10 ' +
    'text-2xl sm:text-3xl leading-none transition ' +
    'active:scale-95 cursor-pointer';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/75 backdrop-blur-sm cursor-zoom-out animate-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* 札と送りボタンをまとめる。ボタンは札の左右に置きたいので、
          札と同じ幅の器を基準にする。狭い画面では札に少し重ねる。 */}
      <div className="relative w-full max-w-[760px]">
        {canStep && (
          <button
            onClick={step(onPrev)}
            aria-label="前の思い出"
            className={`${arrow} left-1 sm:-left-16`}
          >
            ‹
          </button>
        )}

        <div
          className={`paper relative ${memory.color} rounded-md px-6 pt-10 pb-6 w-full max-h-[92vh] overflow-y-auto cursor-default animate-pop`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="washi absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-[2px] rotate-[-2deg]" />

          {position && position.total > 1 && (
            <div className="font-ui absolute top-3.5 left-4 z-10 text-xs tracking-widest text-[var(--ink-soft)]">
              {position.index} / {position.total}
            </div>
          )}

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

        {canStep && (
          <button
            onClick={step(onNext)}
            aria-label="次の思い出"
            className={`${arrow} right-1 sm:-right-16`}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
