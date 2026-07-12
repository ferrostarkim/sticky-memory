'use client';

import Link from 'next/link';
import { useState } from 'react';
import Spotlight from '@/components/spotlight/Spotlight';
import JoinBanner from '@/components/common/JoinBanner';
import VerseBanner from '@/components/common/VerseBanner';
import Lightbox from '@/components/common/Lightbox';
import { useMemories } from '@/lib/useMemories';
import { Memory } from '@/types/memory';

// Full-screen rotating display for the projector: notes arranged on a 3D donut,
// on a bright celebration stage. Switch between two-at-a-time and continuous.
export default function SpotlightPage() {
  const { memories } = useMemories();
  const [selected, setSelected] = useState<Memory | null>(null);

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
          <p className="font-hand text-[#c07d24] text-sm leading-none">思い出の寄せ書き</p>
          <h1 className="font-ui text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1">クロスミッションクリスチャンスクール</h1>
        </div>
        <Link
          href="/"
          className="font-ui text-[#b0793a] hover:text-[#8f5f24] font-medium transition-colors"
        >
          ← ボードに戻る
        </Link>
      </header>

      <Spotlight memories={memories} mode="carousel" onSelect={setSelected} />

      {/* Drag hint */}
      <div className="absolute bottom-6 left-6 z-20 font-ui text-sm text-[#a4712a]/80 flex items-center gap-1.5">
        <span aria-hidden>🖐️</span> ドラッグで回せます
      </div>

      {/* Verse banner */}
      <VerseBanner className="relative z-20 pb-4" />

      {/* Persistent join card */}
      <div className="absolute bottom-6 right-6 z-20">
        <JoinBanner size={104} />
      </div>

      {selected && <Lightbox memory={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
