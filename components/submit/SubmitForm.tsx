'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { getSupabase, isSupabaseConfigured, PHOTO_BUCKET } from '@/lib/supabase';
import { makeStickyStyle } from '@/lib/sticky';
import Confetti from '@/components/common/Confetti';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface Processed {
  dataUrl: string; // for the on-screen preview
  blob: Blob; // for uploading to Storage
}

// Downscale a chosen image to a max dimension and re-encode as JPEG. 1600px /
// 0.82 keeps photos crisp on a projector while staying well under Supabase's
// per-file limit (~0.6-1 MB each). Honors EXIF orientation.
async function processImage(file: File, max = 1600, quality = 0.82): Promise<Processed> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image encode failed'))),
      'image/jpeg',
      quality
    )
  );
  return { dataUrl, blob };
}

export default function SubmitForm() {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [blob, setBlob] = useState<Blob | undefined>(undefined);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processImage(file);
      setPreview(processed.dataUrl);
      setBlob(processed.blob);
    } catch {
      setError('画像を読み込めませんでした。別の写真をお試しください。');
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() && !blob) {
      setError('メッセージを書くか、写真を追加してください。');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError('ボードがまだ設定されていません。主催者にお問い合わせください。');
      return;
    }

    setStatus('sending');
    setError('');

    try {
      // 1. Upload the photo (if any) to public Storage.
      let imageUrl: string | null = null;
      if (blob) {
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, blob, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      // 2. Insert the note. Realtime broadcasts it to every open board.
      const { color, rotation } = makeStickyStyle();
      const { error: insertError } = await supabase.from('memories').insert({
        author: author.trim() || '匿名',
        content: content.trim(),
        image_url: imageUrl,
        color,
        rotation,
      });
      if (insertError) throw insertError;

      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('問題が発生しました。もう一度お試しください。');
    }
  }

  function reset() {
    setContent('');
    setPreview(undefined);
    setBlob(undefined);
    setStatus('idle');
    setError('');
    // Keep the author name so repeat posters don't retype it.
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="text-center text-neutral-600 py-8">
        <p className="font-semibold text-neutral-800 mb-2">未設定です</p>
        <p className="text-sm">
          芳名帳を有効にするには <code>NEXT_PUBLIC_SUPABASE_URL</code> と{' '}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> を設定してください。
        </p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="text-center space-y-6 py-10">
        <Confetti />
        <div className="text-6xl animate-pop">🎉</div>
        <h2 className="font-display text-3xl font-semibold text-[var(--ink)]">ボードに表示されました！</h2>
        <p className="font-hand text-[var(--ink-soft)] text-lg">メッセージありがとうございます。</p>
        <button
          onClick={reset}
          className="font-ui px-6 py-3 rounded-full bg-gradient-to-b from-[#e6ac52] to-[#d0872f] text-white font-semibold shadow-[0_10px_22px_-8px_rgba(208,135,47,0.85)] hover:brightness-105 transition"
        >
          もう一枚追加
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="font-ui block text-sm font-medium text-[var(--ink)] mb-1.5">
          お名前
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="匿名"
          maxLength={40}
          className="font-ui w-full rounded-xl border border-[#e4d6bd] bg-white/70 px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="font-ui block text-sm font-medium text-[var(--ink)] mb-1.5">
          メッセージ
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="お祝いや挨拶を書いてください…"
          rows={4}
          maxLength={280}
          className="font-hand w-full rounded-xl border border-[#e4d6bd] bg-white/70 px-4 py-3 text-[var(--ink)] text-lg resize-none placeholder:text-[var(--ink-soft)]/50 placeholder:font-ui placeholder:text-base focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="font-ui block text-sm font-medium text-[var(--ink)] mb-1.5">
          写真（任意）
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="font-ui block w-full text-sm text-[var(--ink-soft)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--gold)]/15 file:px-4 file:py-2 file:font-medium file:text-[#a4712a] hover:file:bg-[var(--gold)]/25 file:transition"
        />
        {preview && (
          <div className="mt-3 relative">
            <img
              src={preview}
              alt="プレビュー"
              className="w-full max-h-64 object-contain rounded-xl border border-neutral-200"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(undefined);
                setBlob(undefined);
              }}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full"
            >
              削除
            </button>
          </div>
        )}
      </div>

      {error && <p className="font-ui text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="font-ui w-full py-4 rounded-full bg-gradient-to-b from-[#e6ac52] to-[#d0872f] text-white text-lg font-semibold shadow-[0_12px_26px_-8px_rgba(208,135,47,0.85)] hover:brightness-105 active:brightness-95 disabled:opacity-60 transition"
      >
        {status === 'sending' ? '投稿中…' : 'ボードに投稿'}
      </button>
    </form>
  );
}
