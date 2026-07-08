'use client';

import Link from 'next/link';
import Spotlight from '@/components/spotlight/Spotlight';
import JoinBanner from '@/components/common/JoinBanner';
import { useMemories } from '@/lib/useMemories';

// Full-screen rotating display for the projector: two large notes at a time,
// arranged on a 3D donut, on a warm theatre stage.
export default function SpotlightPage() {
  const { memories } = useMemories();

  return (
    <main className="bg-stage grain relative min-h-screen flex flex-col overflow-hidden">
      {/* Decorative bokeh lights */}
      <div className="bokeh w-40 h-40 top-[12%] left-[8%] animate-float" />
      <div className="bokeh w-24 h-24 top-[24%] right-[14%] animate-float" style={{ animationDelay: '2s' }} />
      <div className="bokeh w-16 h-16 top-[62%] left-[18%] animate-float" style={{ animationDelay: '4s' }} />
      <div className="bokeh w-28 h-28 bottom-[16%] right-[10%] animate-float" style={{ animationDelay: '1s' }} />

      <header className="relative z-20 flex items-center justify-between px-9 py-6">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-semibold text-amber-50">Sticky Memory</h1>
          <span className="text-amber-200/40 text-xs font-ui">芳名帳</span>
        </div>
        <Link
          href="/"
          className="font-ui text-amber-200/70 hover:text-amber-100 font-medium transition-colors"
        >
          ← ボードに戻る
        </Link>
      </header>

      <Spotlight memories={memories} />

      {/* Persistent join card */}
      <div className="absolute bottom-6 right-6 z-20">
        <JoinBanner size={104} />
      </div>
    </main>
  );
}
