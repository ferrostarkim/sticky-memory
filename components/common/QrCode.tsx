'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  text: string;
  size?: number;
}

// Renders a QR code fully client-side. Encodes whatever URL/text is passed in.
export default function QrCode({ text, size = 150 }: QrCodeProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: '#4a3a2e', light: '#00000000' },
    })
      .then(setSrc)
      .catch((error) => console.error('[qr] failed to render', error));
  }, [text, size]);

  return (
    <div
      className="rounded-md bg-white/70 ring-1 ring-black/5 p-1.5 shrink-0"
      style={{ width: size + 12, height: size + 12 }}
    >
      {src ? (
        <img src={src} width={size} height={size} alt="参加用QRコード" />
      ) : (
        <div style={{ width: size, height: size }} />
      )}
    </div>
  );
}
