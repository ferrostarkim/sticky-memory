'use client';

import Link from 'next/link';
import Spotlight from '@/components/spotlight/Spotlight';
import JoinBanner from '@/components/common/JoinBanner';
import { useMemories } from '@/lib/useMemories';

// Full-screen rotating display for the projector: two large notes at a time,
// cycling through everything that has been posted.
export default function SpotlightPage() {
  const { memories } = useMemories();

  return (
    <main className="min-h-screen bg-amber-950 flex flex-col relative overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5">
        <h1 className="text-3xl font-bold text-amber-100">Sticky Memory</h1>
        <Link href="/" className="text-amber-200/80 hover:text-amber-100 font-medium">
          ← ボードに戻る
        </Link>
      </header>

      <Spotlight memories={memories} />

      {/* Persistent "scan to join" corner so guests can add at any time */}
      <div className="absolute bottom-6 right-6 bg-white/95 rounded-xl p-3 shadow-xl">
        <JoinBanner size={120} />
      </div>
    </main>
  );
}
