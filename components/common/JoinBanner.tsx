'use client';

import { useEffect, useState } from 'react';
import QrCode from '@/components/common/QrCode';

interface JoinBannerProps {
  size?: number;
}

// Shows a "scan to add your message" QR pointing at /submit. The absolute URL is
// derived from the browser location so it works on whatever host/IP the display
// is served from at the venue.
export default function JoinBanner({ size = 130 }: JoinBannerProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/submit`);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {url && <QrCode text={url} size={size} />}
      <div className="text-neutral-700">
        <div className="text-sm tracking-wide text-neutral-500">
          スキャンしてメッセージを追加
        </div>
        {url && (
          <div className="font-mono text-sm break-all text-neutral-800">
            {url}
          </div>
        )}
      </div>
    </div>
  );
}
