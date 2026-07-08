'use client';

import StickyNote from '@/components/sticky/StickyNote';
import { useMemories } from '@/lib/useMemories';

export default function CorkBoard() {
  const { memories, connected } = useMemories();

  // Newest notes first so fresh submissions land at the top-left of the wall.
  const ordered = [...memories].reverse();

  return (
    // Outer frame for the cork board
    <div className="w-full max-w-6xl h-[800px] bg-amber-900 rounded-xl shadow-2xl p-8 relative overflow-hidden border-8 border-amber-950">
      {/* Live connection + count badge */}
      <div className="absolute top-3 right-5 z-10 flex items-center gap-2 text-amber-100/90 text-sm font-medium">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}
        />
        {connected ? 'ライブ' : '再接続中…'} · {memories.length}
      </div>

      {/* Inner cork texture area containing the notes */}
      <div className="w-full h-full bg-amber-800/50 rounded-lg p-6 flex flex-wrap gap-8 justify-center items-start content-start overflow-y-auto">
        {ordered.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-amber-100/70 text-lg">
            最初のメッセージを待っています…
          </div>
        ) : (
          ordered.map((memory) => (
            <div key={memory.id} className="animate-pop">
              <StickyNote memory={memory} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
