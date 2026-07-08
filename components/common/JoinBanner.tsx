'use client';

import { useEffect, useState } from 'react';
import QrCode from '@/components/common/QrCode';

interface JoinBannerProps {
  size?: number;
}

// A little paper "join" card: QR + short instruction. The absolute URL is
// derived from the browser location so it works on whatever host the display
// is served from.
export default function JoinBanner({ size = 116 }: JoinBannerProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/submit`);
  }, []);

  return (
    <div className="paper bg-[var(--cream)] rounded-lg px-4 py-3 flex items-center gap-4">
      <div className="washi absolute -top-3 left-6 w-12 h-5 rounded-[2px] rotate-[-5deg]" />
      {url && <QrCode text={url} size={size} />}
      <div className="pr-1">
        <div className="font-hand text-[var(--ink)] text-lg leading-tight">
          スキャンして
          <br />
          メッセージを追加
        </div>
        <div className="font-ui text-[10px] text-[var(--ink-soft)] mt-1 uppercase tracking-widest">
          Scan to join
        </div>
      </div>
    </div>
  );
}
