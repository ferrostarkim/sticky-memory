'use client';

import { useMemo } from 'react';

// A lightweight, dependency-free confetti burst. Renders a fixed full-screen
// overlay of falling paper pieces. Mount it when you want the celebration.
const PALETTE = ['#f6c453', '#ef8f6e', '#e8738f', '#7cc4e8', '#8bd3a0', '#b79ce6', '#f2a65a'];

export default function Confetti({ count = 80 }: { count?: number }) {
  // Compute piece styles once. Randomness here is fine — this only renders
  // client-side after a user action, so there's no hydration mismatch.
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 2.6 + Math.random() * 2.2;
        const color = PALETTE[i % PALETTE.length];
        const size = 7 + Math.random() * 8;
        const round = Math.random() > 0.6;
        const drift = (Math.random() * 2 - 1) * 14;
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
