'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { Memory } from '@/types/memory';

interface SpotlightProps {
  memories: Memory[];
  // How long each front pair stays before the donut rotates on, in ms.
  intervalMs?: number;
}

// Base card footprint (px); scaled per-card for depth.
const CARD_W = 210;
const CARD_H = 280;

// Lays every memory out on a tilted elliptical ring (a "donut") that is always
// facing the viewer. The two current notes are pulled to large hero slots at
// the front-center; everything else fans out around the ring behind them, then
// the ring rotates two-at-a-time so a new pair comes forward.
export default function Spotlight({ memories, intervalMs = 5000 }: SpotlightProps) {
  const [index, setIndex] = useState(0);
  const [vp, setVp] = useState({ w: 1280, h: 720 });
  const n = memories.length;

  // Track viewport size so the ring scales to whatever screen it's shown on.
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (n <= 2) {
      setIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 2) % n);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [n, intervalMs]);

  if (n === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-amber-100/70 text-2xl">
        最初のメッセージを待っています…
      </div>
    );
  }

  // One or two notes: no ring to form, just show them big and centered.
  if (n <= 2) {
    return (
      <div className="flex-1 flex items-center justify-center gap-12 p-8">
        {memories.map((memory) => (
          <div key={memory.id} style={{ width: CARD_W * 1.25, height: CARD_H * 1.25 }}>
            <Card memory={memory} highlight />
          </div>
        ))}
      </div>
    );
  }

  const step = 360 / n;
  // Rotate the ring so the current pair straddles the front (angle 0).
  const ringRot = index * step + step / 2;

  // Ellipse radii + the two hero slots at the front (bottom) of the ring.
  const Rx = vp.w * 0.32;
  const Ry = vp.h * 0.3;
  const frontGap = Math.min(vp.w * 0.17, 250);
  const frontY = Ry * 0.72;
  const frontScale = 1.3;

  const heroLeft = index;
  const heroRight = (index + 1) % n;

  return (
    <div className="flex-1 relative overflow-hidden">
      {memories.map((memory, i) => {
        const isHero = i === heroLeft || i === heroRight;

        let x: number;
        let y: number;
        let scale: number;
        let opacity: number;
        let zIndex: number;

        if (isHero) {
          // Large, front-and-center hero slots.
          x = i === heroLeft ? -frontGap : frontGap;
          y = frontY;
          scale = frontScale;
          opacity = 1;
          zIndex = 6000 + (i === heroLeft ? 1 : 0);
        } else {
          // Position on the elliptical ring by its angle from the front.
          const phi = ((i * step - ringRot) * Math.PI) / 180;
          const depth = Math.cos(phi); // 1 = toward front, -1 = far back
          const t = (depth + 1) / 2; // 0..1
          x = Rx * Math.sin(phi);
          // Front notes sit low (near the heroes); far-back notes ride up to
          // form the top of the donut. Positive Y is downward.
          y = Ry * depth;
          scale = 0.34 + 0.5 * t;
          opacity = 0.28 + 0.62 * t;
          zIndex = 1000 + Math.round(depth * 1000);
        }

        return (
          <div
            key={memory.id}
            className="absolute left-1/2 top-1/2"
            style={{
              width: CARD_W,
              height: CARD_H,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
              opacity,
              zIndex,
              transition:
                'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.9s ease',
              pointerEvents: 'none',
            }}
          >
            <Card memory={memory} highlight={isHero} />
          </div>
        );
      })}
    </div>
  );
}

function Card({ memory, highlight }: { memory: Memory; highlight: boolean }) {
  return (
    <div
      className={`relative w-full h-full p-4 pt-8 flex flex-col ${memory.color} ${
        highlight ? 'shadow-2xl ring-2 ring-white/70' : 'shadow-xl'
      }`}
    >
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full shadow-lg border-2 border-red-700" />

      {memory.image && (
        <img
          src={memory.image}
          alt={`${memory.author}さんの写真`}
          className="w-full h-40 object-cover rounded mb-2 bg-white/60 border border-black/10"
        />
      )}

      {memory.content && (
        <p className="flex-1 text-gray-800 text-lg font-medium whitespace-pre-wrap break-words leading-snug overflow-hidden">
          {memory.content}
        </p>
      )}

      <div className="text-right text-gray-700 text-base font-semibold italic mt-2">
        - {memory.author}
      </div>
    </div>
  );
}
