import Link from 'next/link';
import SubmitForm from '@/components/submit/SubmitForm';
import VerseBanner from '@/components/common/VerseBanner';
import { SUBMISSIONS_OPEN } from '@/lib/config';

// Mobile-first page guests reach by scanning the QR code.
// 受付を閉じたあとも、配った QR や貼ったままのリンクからここへ来る人がいる。
// 404 にせず、終わったことと board への行き方を伝える。
export default function SubmitPage() {
  return (
    <main className="bg-warm grain relative min-h-screen flex flex-col items-center px-4 py-9">
      <div className="relative z-10 w-full max-w-md">
        <header className="text-center mb-6 animate-rise">
          <p className="font-hand text-[#c07d24] text-base">思い出の寄せ書き</p>
          <h1 className="font-ui text-3xl font-bold text-[var(--ink)] mt-0.5">クロスミッションクリスチャンスクール</h1>
          <p className="font-hand text-[var(--ink-soft)] text-lg mt-1.5">
            {SUBMISSIONS_OPEN ? 'ボードにメッセージを残そう 🎉' : 'たくさんの思い出をありがとうございました'}
          </p>
        </header>

        {/* Paper form sheet with a strip of tape */}
        <div className="paper bg-[var(--cream)] rounded-xl px-6 py-7 animate-rise" style={{ animationDelay: '90ms' }}>
          <div className="washi absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-[2px] rotate-[-2deg]" />
          <div className="relative">
            {SUBMISSIONS_OPEN ? (
              <SubmitForm />
            ) : (
              <div className="text-center space-y-5 py-4">
                <div className="text-5xl" aria-hidden>🕊</div>
                <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                  受付は終了しました
                </h2>
                <p className="font-hand text-[var(--ink-soft)] text-lg leading-relaxed">
                  みんなの思い出は
                  <br />
                  ボードでいつでも読めます。
                </p>
                <Link
                  href="/"
                  className="font-ui inline-block px-6 py-3 rounded-full bg-gradient-to-b from-[#e6ac52] to-[#d0872f] text-white font-semibold shadow-[0_10px_22px_-8px_rgba(208,135,47,0.85)] hover:brightness-105 transition"
                >
                  ボードを見に行く →
                </Link>
              </div>
            )}
          </div>
        </div>

        {SUBMISSIONS_OPEN && (
          <p className="text-center mt-5 animate-rise" style={{ animationDelay: '150ms' }}>
            <Link
              href="/"
              className="font-ui inline-block text-sm text-[var(--ink-soft)] underline underline-offset-4 hover:text-[var(--ink)] transition"
            >
              投稿せずにボードを見る
            </Link>
          </p>
        )}

        <VerseBanner className="mt-6 px-2 animate-rise" />
      </div>
    </main>
  );
}
