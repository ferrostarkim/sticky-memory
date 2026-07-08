'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  text: string;
  size?: number;
}

// Renders a QR code fully client-side (no network needed, works offline at the
// venue). Encodes whatever URL/text is passed in.
export default function QrCode({ text, size = 150 }: QrCodeProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text, { width: size, margin: 1 })
      .then(setSrc)
      .catch((error) => console.error('[qr] failed to render', error));
  }, [text, size]);

  return (
    <div
      className="bg-white rounded-lg p-2 shadow-md"
      style={{ width: size + 16, height: size + 16 }}
    >
      {src ? (
        <img src={src} width={size} height={size} alt="参加用QRコード" />
      ) : (
        <div style={{ width: size, height: size }} />
      )}
    </div>
  );
}
