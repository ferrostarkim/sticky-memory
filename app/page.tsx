import Link from 'next/link';
import CorkBoard from '@/components/board/CorkBoard';
import JoinBanner from '@/components/common/JoinBanner';

export default function Home() {
  return (
    // Main layout wrapper (the live wall / big-screen view)
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center py-8 px-4">
      {/* Header: title, join QR, and a link to the rotating spotlight */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-6 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-neutral-800">Sticky Memory</h1>
          <p className="text-neutral-500 mt-1">
            Live guestbook — messages appear the moment they&apos;re posted.
          </p>
          <Link
            href="/spotlight"
            className="inline-block mt-3 text-amber-700 font-semibold hover:underline"
          >
            Open spotlight view →
          </Link>
        </div>
        <JoinBanner />
      </div>

      {/* The real-time cork board */}
      <CorkBoard />
    </main>
  );
}
