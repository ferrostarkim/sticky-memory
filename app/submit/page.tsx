import SubmitForm from '@/components/submit/SubmitForm';

// Mobile-first page guests reach by scanning the QR code.
export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-800">Sticky Memory</h1>
          <p className="text-neutral-500 mt-1">
            ボードにメッセージを残そう 🎉
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <SubmitForm />
        </div>
      </div>
    </main>
  );
}
