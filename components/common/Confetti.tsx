'use client';

import { useMemo } from 'react';

// A lightweight, dependency-free confetti burst. Renders a fixed full-screen
// overlay of falling paper pieces. Mount it when you want the celebration.
const PALETTE = ['#f6c453', '#ef8f6e', '#e8738f', '#7cc4e8', '#8bd3a0', '#b79ce6', '#f2a65a'];

function seededFraction(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export default function Confetti({ count = 80 }: { count?: number }) {
  // Deterministic variation keeps render output pure under React 19.
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = seededFraction(i + 1) * 100;
        const delay = seededFraction(i + 101) * 0.6;
        const duration = 2.6 + seededFraction(i + 211) * 2.2;
        const color = PALETTE[i % PALETTE.length];
        const size = 7 + seededFraction(i + 307) * 8;
        const round = seededFraction(i + 401) > 0.6;
        const drift = (seededFraction(i + 503) * 2 - 1) * 14;
        return { left, delay, duration, color, size, round, drift, i };
      }),
    [count]
  );

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: p.round ? '9999px' : '1px',
            marginLeft: p.drift,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
