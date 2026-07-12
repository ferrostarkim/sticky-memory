import Link from 'next/link';
import CorkBoard from '@/components/board/CorkBoard';
import JoinBanner from '@/components/common/JoinBanner';
import VerseBanner from '@/components/common/VerseBanner';

export default function Home() {
  return (
    <main className="bg-room grain relative min-h-screen flex flex-col items-center py-9 px-4">
      {/* Header: wordmark, tagline, spotlight link, and join card */}
      <div className="relative z-10 w-full max-w-6xl flex flex-wrap items-end justify-between gap-6 mb-7">
        <div className="animate-rise">
          <p className="font-hand text-[#c07d24] text-lg mb-0.5">思い出の寄せ書き</p>
          <h1 className="font-ui text-4xl sm:text-5xl font-bold text-[var(--ink)] tracking-tight">
            クロスミッションクリスチャンスクール
          </h1>
          <p className="font-ui text-[var(--ink-soft)] mt-2">
            投稿した瞬間に、ボードへ。みんなのメッセージが集まります。
          </p>
          <Link
            href="/spotlight"
            className="group inline-flex items-center gap-1.5 mt-3 text-[#c07d24] font-ui font-medium hover:text-[#a4641a] transition-colors"
          >
            スポットライト表示を開く
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="animate-rise" style={{ animationDelay: '120ms' }}>
          <JoinBanner />
        </div>
      </div>

      <VerseBanner className="relative z-10 mb-4 animate-rise" />

      <div className="relative z-10 animate-rise" style={{ animationDelay: '80ms' }}>
        <CorkBoard />
      </div>
    </main>
  );
}
