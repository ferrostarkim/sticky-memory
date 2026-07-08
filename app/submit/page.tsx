import SubmitForm from '@/components/submit/SubmitForm';

// Mobile-first page guests reach by scanning the QR code.
export default function SubmitPage() {
  return (
    <main className="bg-warm grain relative min-h-screen flex flex-col items-center px-4 py-9">
      <div className="relative z-10 w-full max-w-md">
        <header className="text-center mb-6 animate-rise">
          <p className="font-display italic text-[#c07d24] text-base">Family Guestbook</p>
          <h1 className="font-ui text-3xl font-bold text-[var(--ink)] mt-0.5">つくば愛クリスト教会</h1>
          <p className="font-hand text-[var(--ink-soft)] text-lg mt-1.5">
            ボードにメッセージを残そう 🎉
          </p>
        </header>

        {/* Paper form sheet with a strip of tape */}
        <div className="paper bg-[var(--cream)] rounded-xl px-6 py-7 animate-rise" style={{ animationDelay: '90ms' }}>
          <div className="washi absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-[2px] rotate-[-2deg]" />
          <div className="relative">
            <SubmitForm />
          </div>
        </div>
      </div>
    </main>
  );
}
