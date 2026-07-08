'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { getSupabase, isSupabaseConfigured, PHOTO_BUCKET } from '@/lib/supabase';
import { makeStickyStyle } from '@/lib/sticky';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface Processed {
  dataUrl: string; // for the on-screen preview
  blob: Blob; // for uploading to Storage
}

// Downscale a chosen image to a max dimension and re-encode as JPEG so uploads
// stay small and fast. Honors EXIF orientation.
async function processImage(file: File, max = 1000, quality = 0.72): Promise<Processed> {
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
      setError('Could not read that image. Try another photo.');
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() && !blob) {
      setError('Please write a message or add a photo.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError('The board is not configured yet. Please contact the host.');
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
        author: author.trim() || 'Anonymous',
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
      setError('Something went wrong. Please try again.');
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
        <p className="font-semibold text-neutral-800 mb-2">Not configured</p>
        <p className="text-sm">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to enable the guestbook.
        </p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="text-center space-y-6 py-10">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-neutral-800">It&apos;s on the board!</h2>
        <p className="text-neutral-600">Thanks for sharing your message.</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full bg-amber-600 text-white font-semibold shadow hover:bg-amber-700 transition"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">
          Your name
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Anonymous"
          maxLength={40}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">
          Message
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a congratulations or hello…"
          rows={4}
          maxLength={280}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">
          Photo (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-semibold file:text-amber-800"
        />
        {preview && (
          <div className="mt-3 relative">
            <img
              src={preview}
              alt="Preview"
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
              Remove
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-4 rounded-full bg-amber-600 text-white text-lg font-semibold shadow-lg hover:bg-amber-700 disabled:opacity-60 transition"
      >
        {status === 'sending' ? 'Posting…' : 'Post to the board'}
      </button>
    </form>
  );
}
