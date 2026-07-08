import Link from 'next/link';
import CorkBoard from '@/components/board/CorkBoard';
import JoinBanner from '@/components/common/JoinBanner';

export default function Home() {
  return (
    <main className="bg-room grain relative min-h-screen flex flex-col items-center py-9 px-4">
      {/* Header: wordmark, tagline, spotlight link, and join card */}
      <div className="relative z-10 w-full max-w-6xl flex flex-wrap items-end justify-between gap-6 mb-7">
        <div className="animate-rise">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-5xl font-semibold text-amber-50 tracking-tight">
              Sticky Memory
            </h1>
            <span className="hidden sm:inline text-amber-200/50 text-sm font-ui">芳名帳</span>
          </div>
          <p className="font-ui text-amber-100/70 mt-2">
            投稿した瞬間に、ボードへ。みんなのメッセージが集まります。
          </p>
          <Link
            href="/spotlight"
            className="group inline-flex items-center gap-1.5 mt-3 text-[var(--gold-soft)] font-ui font-medium hover:text-amber-200 transition-colors"
          >
            スポットライト表示を開く
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="animate-rise" style={{ animationDelay: '120ms' }}>
          <JoinBanner />
        </div>
      </div>

      <div className="relative z-10 animate-rise" style={{ animationDelay: '80ms' }}>
        <CorkBoard />
      </div>
    </main>
  );
}
