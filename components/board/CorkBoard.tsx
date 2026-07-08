'use client';

import StickyNote from '@/components/sticky/StickyNote';
import { useMemories } from '@/lib/useMemories';

export default function CorkBoard() {
  const { memories, connected } = useMemories();

  // Newest notes first so fresh submissions land at the top-left of the wall.
  const ordered = [...memories].reverse();

  return (
    // Wooden outer frame
    <div className="frame-wood w-full max-w-6xl h-[800px] rounded-2xl p-4 sm:p-5 relative">
      {/* Live badge on the frame */}
      <div className="absolute top-1.5 right-6 z-20 flex items-center gap-2 text-amber-50/90 text-sm font-ui">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            connected ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)] animate-pulse' : 'bg-red-400'
          }`}
        />
        {connected ? 'ライブ' : '再接続中…'}
        <span className="opacity-60">·</span>
        <span className="tabular-nums">{memories.length}</span>
      </div>

      {/* Cork surface */}
      <div className="cork grain relative w-full h-full rounded-lg overflow-hidden">
        <div className="relative z-10 w-full h-full p-6 flex flex-wrap gap-x-8 gap-y-10 justify-center items-start content-start overflow-y-auto">
          {ordered.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#5b3d21]">
              <span className="text-4xl">✉️</span>
              <p className="font-hand text-lg">最初のメッセージを待っています…</p>
            </div>
          ) : (
            ordered.map((memory) => (
              <div
                key={memory.id}
                className="animate-pop transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0"
              >
                <StickyNote memory={memory} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
