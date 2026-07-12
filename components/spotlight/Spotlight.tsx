'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { Memory } from '@/types/memory';

// Rotation feel
const AUTO_SPEED = 14; // degrees / second when idle
const DRAG_SENS = 0.3; // degrees of rotation per pixel dragged
const MAX_FLING = 320; // cap the fling velocity (deg/s)
const RESUME_DELAY = 3500; // ms of no touch before auto-rotation resumes
const EASE = 3; // how quickly velocity eases toward its target

interface SpotlightProps {
  memories: Memory[];
  // How long each front pair stays before the donut rotates on, in ms.
  intervalMs?: number;
  // 'pairs': two heroes snap to the front and rotate two-at-a-time.
  // 'carousel': the whole donut rotates continuously and smoothly.
  mode?: 'pairs' | 'carousel';
  // Called when a note is tapped/clicked (as opposed to dragged).
  onSelect?: (memory: Memory) => void;
}

// Base card footprint (px); scaled per-card for depth.
const CARD_W = 210;
const CARD_H = 280;

// Lays every memory out on a tilted elliptical ring (a "donut") that is always
// facing the viewer. The two current notes are pulled to large hero slots at
// the front-center; everything else fans out around the ring behind them, then
// the ring rotates two-at-a-time so a new pair comes forward.
export default function Spotlight({
  memories,
  intervalMs = 5000,
  mode = 'pairs',
  onSelect,
}: SpotlightProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const [vp, setVp] = useState({ w: 1280, h: 720 });
  const n = memories.length;

  // Drag/inertia state (refs so the rAF loop and pointer handlers share it
  // without triggering re-renders).
  const phaseRef = useRef(0);
  const velocityRef = useRef(AUTO_SPEED); // deg/s
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastTouchRef = useRef(0); // performance.now() of last user interaction
  // Tap detection (to tell a click-to-enlarge apart from a drag-to-rotate).
  const downXRef = useRef(0);
  const downYRef = useRef(0);
  const tappedIdRef = useRef<string | null>(null);

  // Track viewport size so the ring scales to whatever screen it's shown on.
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Pairs mode: step two-at-a-time on an interval.
  useEffect(() => {
    if (mode !== 'pairs' || n <= 2) {
      setIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 2) % n);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [mode, n, intervalMs]);

  // Carousel mode: a single rAF loop drives rotation. When idle it eases toward
  // the constant auto-speed; a drag overrides it, then momentum coasts and,
  // after a short pause, auto-rotation resumes.
  useEffect(() => {
    if (mode !== 'carousel' || n <= 2) return;
    velocityRef.current = AUTO_SPEED;
    lastTouchRef.current = 0; // start auto-rotating immediately
    let raf = 0;
    let last: number | null = null;
    const tick = (t: number) => {
      if (last !== null && !draggingRef.current) {
        const dt = Math.min(0.05, (t - last) / 1000);
        const idle = performance.now() - lastTouchRef.current;
        // Target speed: 0 right after a touch (let it settle), auto-speed once idle.
        const target = idle > RESUME_DELAY ? AUTO_SPEED : 0;
        velocityRef.current += (target - velocityRef.current) * Math.min(1, dt * EASE);
        phaseRef.current = (phaseRef.current + velocityRef.current * dt) % 360;
        setPhase(phaseRef.current);
      }
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, n]);

  const carouselActive = mode === 'carousel' && n > 2;

  const onPointerDown = (e: React.PointerEvent) => {
    // Record where the press started + which note it landed on, for tap detection.
    downXRef.current = e.clientX;
    downYRef.current = e.clientY;
    const el = (e.target as HTMLElement)?.closest?.('[data-memory-id]') as HTMLElement | null;
    tappedIdRef.current = el?.dataset.memoryId ?? null;

    if (!carouselActive) return;
    draggingRef.current = true;
    velocityRef.current = 0;
    lastXRef.current = e.clientX;
    lastMoveTimeRef.current = performance.now();
    lastTouchRef.current = performance.now();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore (e.g. synthetic events)
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!carouselActive || !draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - lastXRef.current;
    const dt = Math.max(1, now - lastMoveTimeRef.current) / 1000;
    const dPhase = dx * DRAG_SENS;
    phaseRef.current = (phaseRef.current + dPhase) % 360;
    setPhase(phaseRef.current);
    // Track velocity for a natural release fling.
    velocityRef.current = Math.max(-MAX_FLING, Math.min(MAX_FLING, dPhase / dt));
    lastXRef.current = e.clientX;
    lastMoveTimeRef.current = now;
    lastTouchRef.current = now;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      lastTouchRef.current = performance.now();
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
    // A press that barely moved is a tap → enlarge the note that was pressed.
    const dist = Math.hypot(e.clientX - downXRef.current, e.clientY - downYRef.current);
    if (dist < 8 && tappedIdRef.current && onSelect) {
      const m = memories.find((mm) => mm.id === tappedIdRef.current);
      if (m) onSelect(m);
    }
    tappedIdRef.current = null;
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      lastTouchRef.current = performance.now();
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
    tappedIdRef.current = null;
  };

  if (n === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--ink-soft)] text-2xl font-hand">
        最初のメッセージを待っています…
      </div>
    );
  }

  // One or two notes: no ring to form, just show them big and centered.
  if (n <= 2) {
    return (
      <div className="flex-1 flex items-center justify-center gap-12 p-8">
        {memories.map((memory) => (
          <div
            key={memory.id}
            style={{ width: CARD_W * 1.25, height: CARD_H * 1.25, cursor: 'zoom-in' }}
            onClick={() => onSelect?.(memory)}
          >
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
  const carousel = mode === 'carousel';

  return (
    <div
      className={`flex-1 relative overflow-hidden select-none ${
        carouselActive ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={carouselActive ? { touchAction: 'none' } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {memories.map((memory, i) => {
        let x: number;
        let y: number;
        let scale: number;
        let opacity: number;
        let zIndex: number;
        let highlight: boolean;

        if (carousel) {
          // Continuous ring: everything rides the ellipse; whatever is at the
          // front grows largest.
          const phi = ((i * step + phase) * Math.PI) / 180;
          const depth = Math.cos(phi);
          const t = (depth + 1) / 2;
          x = Rx * Math.sin(phi);
          y = Ry * depth;
          scale = 0.42 + 0.9 * Math.pow(t, 1.4);
          opacity = 0.25 + 0.7 * t;
          zIndex = 1000 + Math.round(depth * 1000);
          highlight = depth > 0.82;
        } else if (i === heroLeft || i === heroRight) {
          // Large, front-and-center hero slots.
          x = i === heroLeft ? -frontGap : frontGap;
          y = frontY;
          scale = frontScale;
          opacity = 1;
          zIndex = 6000 + (i === heroLeft ? 1 : 0);
          highlight = true;
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
          highlight = false;
        }

        return (
          <div
            key={memory.id}
            data-memory-id={memory.id}
            className="absolute left-1/2 top-1/2"
            style={{
              width: CARD_W,
              height: CARD_H,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
              opacity,
              zIndex,
              // No CSS transition in carousel mode — rAF drives every frame.
              transition: carousel
                ? 'none'
                : 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.9s ease',
              // Cards receive pointer events so taps land; the container still
              // gets them via bubbling (and pointer capture) for dragging.
              pointerEvents: 'auto',
              touchAction: carousel ? 'none' : undefined,
              cursor: 'zoom-in',
            }}
          >
            <Card memory={memory} highlight={highlight} />
          </div>
        );
      })}
    </div>
  );
}

function Card({ memory, highlight }: { memory: Memory; highlight: boolean }) {
  return (
    <div
      className={`paper relative w-full h-full px-5 pt-9 pb-4 flex flex-col ${memory.color} ${
        highlight ? 'ring-2 ring-[var(--gold)]/45 shadow-[0_30px_60px_-22px_rgba(120,80,30,0.45)]' : ''
      }`}
    >
      <div className="washi absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-7 rounded-[2px] rotate-[-3deg]" />

      {memory.image && (
        <img
          src={memory.image}
          alt={`${memory.author}さんの写真`}
          className="relative w-full h-40 object-cover rounded-[2px] mb-3 bg-white/70 p-1.5 shadow-sm ring-1 ring-black/5"
        />
      )}

      {memory.content && (
        <p className="font-hand relative flex-1 text-[var(--ink)] text-2xl leading-snug whitespace-pre-wrap break-words overflow-hidden">
          {memory.content}
        </p>
      )}

      <div className="font-hand relative text-right text-[var(--ink-soft)] text-xl mt-3">
        — {memory.author}
      </div>
    </div>
  );
}
