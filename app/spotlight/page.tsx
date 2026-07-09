'use client';

import Link from 'next/link';
import { useState } from 'react';
import Spotlight from '@/components/spotlight/Spotlight';
import JoinBanner from '@/components/common/JoinBanner';
import VerseBanner from '@/components/common/VerseBanner';
import Cross from '@/components/common/Cross';
import { useMemories } from '@/lib/useMemories';

// Full-screen rotating display for the projector: notes arranged on a 3D donut,
// on a bright celebration stage. Switch between two-at-a-time and continuous.
export default function SpotlightPage() {
  const { memories } = useMemories();
  const [mode, setMode] = useState<'pairs' | 'carousel'>('pairs');

  return (
    <main className="bg-stage grain relative min-h-screen flex flex-col overflow-hidden">
      {/* Decorative bokeh lights (soft, cheerful) */}
      <div className="bokeh w-40 h-40 top-[12%] left-[8%] animate-float" />
      <div
        className="bokeh w-24 h-24 top-[22%] right-[14%] animate-float"
        style={{ animationDelay: '2s', background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.85), rgba(168,208,240,0.45) 45%, rgba(168,208,240,0) 72%)' }}
      />
      <div className="bokeh w-16 h-16 top-[60%] left-[16%] animate-float" style={{ animationDelay: '4s' }} />
      <div
        className="bokeh w-28 h-28 bottom-[18%] right-[10%] animate-float"
        style={{ animationDelay: '1s', background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.85), rgba(255,196,178,0.45) 45%, rgba(255,196,178,0) 72%)' }}
      />

      <header className="relative z-20 flex items-center justify-between px-9 py-6">
        <div>
          <p className="flex items-center gap-1.5 font-display italic text-[#c07d24] text-sm leading-none">
            <Cross size={13} />
            Family Guestbook
          </p>
          <h1 className="font-ui text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1">つくばキリストの愛教会</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Auto-rotate toggle */}
          <button
            onClick={() => setMode((m) => (m === 'pairs' ? 'carousel' : 'pairs'))}
            className="font-ui text-sm rounded-full px-4 py-2 border border-[#d8b483] bg-white/60 text-[#8f5f24] hover:bg-white/90 transition-colors shadow-sm"
          >
            {mode === 'carousel' ? '● 自動回転中' : '自動回転'}
          </button>
          <Link
            href="/"
            className="font-ui text-[#b0793a] hover:text-[#8f5f24] font-medium transition-colors"
          >
            ← ボードに戻る
          </Link>
        </div>
      </header>

      <Spotlight memories={memories} mode={mode} />

      {/* Drag hint (carousel only) */}
      {mode === 'carousel' && (
        <div className="absolute bottom-6 left-6 z-20 font-ui text-sm text-[#a4712a]/80 flex items-center gap-1.5">
          <span aria-hidden>🖐️</span> ドラッグで回せます
        </div>
      )}

      {/* Verse banner */}
      <VerseBanner className="relative z-20 pb-4" />

      {/* Persistent join card */}
      <div className="absolute bottom-6 right-6 z-20">
        <JoinBanner size={104} />
      </div>
    </main>
  );
}
