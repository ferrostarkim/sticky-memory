'use client';

import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { COMPACT_QUERY, useMediaQuery } from '@/lib/useMediaQuery';
import { Memory } from '@/types/memory';

interface CampDioramaProps {
  memories: Memory[];
  spotlight: boolean;
  shifting?: boolean;
  /** 届いたばかりの 1 枚。主人公の頭上に出す。 */
  herald?: Memory | null;
  onSelect: (memory: Memory) => void;
  /** 指で払って輪を回したとき。正で次へ、負で前へ。 */
  onRotate?: (step: number) => void;
}

/** 主人公のせりふ。届くたびに順番に選ぶ。 */
const HERALD_LINES = [
  'おおー！ だれかがメッセージをくれたよ！ ハレルヤ！',
  'あたらしい思い出がとどいたよ。ハレルヤ！',
  'わあ、うれしいね！ ありがとう、ハレルヤ！',
];

/**
 * 承認済みディオラマ画像の実寸。ピン座標はこの比率が前提。
 * 画像を差し替えるときは DIORAMA_PROMPT_KO.md の構図制約を守ること。
 */
const ART_WIDTH = 2752;
const ART_HEIGHT = 1536;
/** 2752px の WebP でも 127KB しかないため、解像度違いは用意しない。
    srcset を付けると小さい方が選ばれて眠い絵になることがある。 */
const ART_SRC = '/diorama/camp-island.webp';

/**
 * 中央ステージ 6 枠。運動場の手前に弧を描いて並べる。
 * 座標は画像に対する % で、ポストイットの「足元」を指す。
 * 画像を差し替えて構図が変わったら、ここを測り直すこと。
 */
/**
 * 島を囲む輪。手前の運動場から右へ回り、砂浜と海の上を通って奥へ抜ける。
 * 左奥はロッジ・木・テントで埋まっているので通していない。
 * 先頭が消えて末尾に現れることで、輪として回っているように見せる。
 */
const PIN_SLOTS: Array<{ x: number; y: number; tilt: number }> = [
  { x: 24, y: 61.8, tilt: -3 },
  { x: 34.3, y: 68.1, tilt: 1.6 },
  { x: 44.5, y: 71.7, tilt: -1.4 },
  { x: 54.8, y: 73.5, tilt: 2.4 },
  { x: 65, y: 72.1, tilt: -2 },
  { x: 75, y: 65.4, tilt: 1.8 },
  { x: 80, y: 52, tilt: -2.2 },
  { x: 74, y: 38.5, tilt: 1.4 },
  { x: 62, y: 29, tilt: -1.6 },
];

/** 主人公の頭の上。新着はまずここに出る。実測値。 */
const HERALD_ANCHOR = { x: 48.2, y: 38.5 };
/** ふきだしの位置 */
const BUBBLE_ANCHOR = { x: 56, y: 44 };

/** 1 枠ぶん送るのに必要な指の移動量 (画面幅に対する比) */
const DRAG_SPAN_RATIO = 0.13;
/** 指を離したあとの減速の強さ (大きいほど早く止まる) */
const FRICTION = 5.5;
/** 枠にすっと吸い付く強さ */
const SETTLE_STIFFNESS = 11;
/** これ以下の速さになったら枠に寄せにいく */
const SETTLE_VELOCITY = 0.35;

/**
 * 縦画面用の輪。同じ輪から 1 つおきに 5 点を取る。
 * 幅 390px のステージに 9 枚の輪は物理的に入らない。
 * 4 点目は右上の札が隣と角で触れないよう、少しだけ上へ逃がしてある。
 */
const PIN_SLOTS_COMPACT = [
  PIN_SLOTS[0],
  PIN_SLOTS[2],
  PIN_SLOTS[4],
  { ...PIN_SLOTS[6], y: 46.5 },
  PIN_SLOTS[8],
];

/** 輪の両端の外側。ここへ出ていき、ここから入ってくる。 */
function slotAt(position: number, slots: typeof PIN_SLOTS) {
  const last = slots.length - 1;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  if (position <= 0) {
    // 先頭より手前は、slot0 → slot1 の向きを逆に伸ばして画面外へ
    const a = slots[0];
    const b = slots[1];
    const t = -position;
    return {
      x: lerp(a.x, a.x - (b.x - a.x), t),
      y: lerp(a.y, a.y - (b.y - a.y), t),
      tilt: a.tilt,
      fade: Math.max(0, 1 - t),
    };
  }
  if (position >= last) {
    const a = slots[last];
    const b = slots[last - 1];
    const t = position - last;
    return {
      x: lerp(a.x, a.x - (b.x - a.x), t),
      y: lerp(a.y, a.y - (b.y - a.y), t),
      tilt: a.tilt,
      fade: Math.max(0, 1 - t),
    };
  }
  const i = Math.floor(position);
  const t = position - i;
  const a = slots[i];
  const b = slots[i + 1];
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), tilt: lerp(a.tilt, b.tilt, t), fade: 1 };
}

const NOTE_COLORS: Record<string, string> = {
  'bg-yellow-200': '#f5d995',
  'bg-pink-200': '#e8b7b7',
  'bg-blue-200': '#a9ced0',
  'bg-green-200': '#b9d2a2',
  'bg-purple-200': '#c9b4d6',
  'bg-orange-200': '#e8bd92',
};

export default function CampDiorama({
  memories,
  spotlight,
  shifting = false,
  herald = null,
  onSelect,
  onRotate,
}: CampDioramaProps) {
  const root = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  /** 輪の連続位置。0 が定位置で、1 進むと 1 枠ぶん送られる。 */
  const [spin, setSpinState] = useState(0);
  // 状態更新関数の中で副作用を起こすと StrictMode で二重に走るので、
  // 現在値は ref で保持して読み出す。
  const spinRef = useRef(0);
  const setSpin = useCallback((value: number) => {
    spinRef.current = value;
    setSpinState(value);
  }, []);
  /** 縦画面では輪を中央へ寄せて、端の札が画面から切れないようにする */
  const compact = useMediaQuery(COMPACT_QUERY);
  const drag = useRef<{
    id: number;
    x: number;
    lastX: number;
    lastAt: number;
    velocity: number;
  } | null>(null);
  const motion = useRef<{ spin: number; velocity: number; raf: number } | null>(null);
  /** pointermove は rAF より速く飛んでくるので、フレームごとにまとめて反映する */
  const pendingDelta = useRef(0);
  const moveRaf = useRef(0);
  const newestId = memories.at(-1)?.id;
  // せりふは届いた枚数で切り替える。同じ文が続かないように。
  const heraldLine = herald
    ? HERALD_LINES[
        Math.abs(
          herald.id.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
        ) % HERALD_LINES.length
      ]
    : '';

  useEffect(() => {
    const element = root.current;
    if (!element || spotlight) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      // 輪を回している最中に視差まで動くと、画面全体が揺れて引っかかって見える
      if (drag.current) return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        setParallax({
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        });
      });
    };
    const handleReset = () => setParallax({ x: 0, y: 0 });

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('blur', handleReset);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('blur', handleReset);
    };
  }, [spotlight]);

  /** 1 枠ぶん送り切ったら親に伝え、その分を戻して位置を保つ */
  const commit = useCallback(
    (value: number) => {
      let next = value;
      while (next >= 1) {
        onRotate?.(1);
        next -= 1;
      }
      while (next <= -1) {
        onRotate?.(-1);
        next += 1;
      }
      return next;
    },
    [onRotate]
  );

  /** 指を離したあと、惰性で滑らせてから枠に吸い付かせる */
  const glide = useCallback(
    (initialSpin: number, initialVelocity: number) => {
      if (motion.current) cancelAnimationFrame(motion.current.raf);
      const state = { spin: initialSpin, velocity: initialVelocity, raf: 0 };
      motion.current = state;
      const started = performance.now();
      let last = started;

      /** 途中で止まっても半端な位置に置き去りにしない */
      const snap = () => {
        if (motion.current !== state) return;
        cancelAnimationFrame(state.raf);
        clearTimeout(deadline);
        motion.current = null;
        setSpin(commit(Math.round(state.spin)));
      };
      const deadline = setTimeout(snap, 1800);

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        // フレームが極端に遅い環境では惰性を諦めて枠に寄せる
        if (now - started > 1500) {
          snap();
          return;
        }

        if (Math.abs(state.velocity) > SETTLE_VELOCITY) {
          state.spin += state.velocity * dt;
          state.velocity *= Math.exp(-FRICTION * dt);
        } else {
          // いちばん近い枠へ寄せる
          const target = Math.round(state.spin);
          state.spin += (target - state.spin) * (1 - Math.exp(-SETTLE_STIFFNESS * dt));
          state.velocity = 0;
          if (Math.abs(target - state.spin) < 0.001) {
            state.spin = target;
          }
        }

        state.spin = commit(state.spin);
        setSpin(state.spin);

        if (state.velocity === 0 && Math.abs(state.spin) < 0.0005) {
          clearTimeout(deadline);
          motion.current = null;
          setSpin(0);
          return;
        }
        state.raf = requestAnimationFrame(tick);
      };
      state.raf = requestAnimationFrame(tick);
    },
    [commit, setSpin]
  );

  // 指で横に払うと輪が回る。指の動きにそのまま追従させる。
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (spotlight || !onRotate) return;
    // ポストイットを押したときは選択が優先
    if ((event.target as HTMLElement).closest('.camp-memory-note')) return;
    if (motion.current) {
      cancelAnimationFrame(motion.current.raf);
      motion.current = null;
    }
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      lastX: event.clientX,
      lastAt: performance.now(),
      velocity: 0,
    };
    setDragging(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // 捕捉できなくても pointermove は拾えるので続行する
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId || !onRotate) return;
    const width = event.currentTarget.clientWidth || 1;
    const span = width * DRAG_SPAN_RATIO;
    const now = performance.now();
    const dx = event.clientX - state.lastX;
    const dt = Math.max(1, now - state.lastAt) / 1000;

    // 左に払うと次の 1 枚が手前に来る
    const delta = -dx / span;
    state.velocity = delta / dt;
    state.lastX = event.clientX;
    state.lastAt = now;

    // pointermove は 1 フレームに何度も飛んでくる。
    // そのたびに描画すると引っかかるので、フレームごとにまとめる。
    pendingDelta.current += delta;
    if (!moveRaf.current) {
      moveRaf.current = requestAnimationFrame(() => {
        moveRaf.current = 0;
        const d = pendingDelta.current;
        pendingDelta.current = 0;
        setSpin(commit(spinRef.current + d));
      });
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    // まだ反映していない移動ぶんを確定してから滑らせる
    if (moveRaf.current) {
      cancelAnimationFrame(moveRaf.current);
      moveRaf.current = 0;
    }
    if (pendingDelta.current) {
      setSpin(commit(spinRef.current + pendingDelta.current));
      pendingDelta.current = 0;
    }
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // 捕捉していなければ解放も不要
    }
    // 直前の速度をそのまま引き継いで滑らせる
    glide(spinRef.current, Math.max(-14, Math.min(14, state.velocity)));
  };

  useEffect(
    () => () => {
      if (motion.current) cancelAnimationFrame(motion.current.raf);
    },
    []
  );

  return (
    <div
      ref={root}
      className="camp-canvas camp-diorama"
      data-shifting={shifting}
      data-spotlight={spotlight}
      data-dragging={dragging}
      data-spinning={spin !== 0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={
        {
          '--diorama-px': parallax.x,
          '--diorama-py': parallax.y,
        } as CSSProperties
      }
      aria-label="会瀬のキャンプ場ジオラマ"
    >
      <div className="camp-diorama-stage">
        {/* 島ごとゆっくり上下に浮かせる層。ピンも一緒に動く必要があるので
            画像とピンをまとめてこの中に入れる。 */}
        <div className="camp-diorama-float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="camp-diorama-art"
            src={ART_SRC}
            alt=""
            width={ART_WIDTH}
            height={ART_HEIGHT}
            fetchPriority="high"
            draggable={false}
          />

          {/* 静止画の上に重ねる環境アニメーション。位置は画像に対する %。 */}
          <div className="camp-diorama-fx" aria-hidden>
            <span className="camp-fx-sea" />
            <span className="camp-fx-fire" />
            <span className="camp-fx-motes" />
          </div>


          <div className="camp-diorama-pins">
          {memories.map((memory, index) => {
            // 指の動きに合わせて枠と枠のあいだも連続で動かす。
            // 縦画面は 5 枠の輪を使い、中央へ 14% 寄せて端の札の見切れを防ぐ。
            const raw = slotAt(index - spin, compact ? PIN_SLOTS_COMPACT : PIN_SLOTS);
            const slot = compact ? { ...raw, x: 50 + (raw.x - 50) * 0.86 } : raw;
            const color = NOTE_COLORS[memory.color] ?? '#f5d995';
            const newest = memory.id === newestId;

            return (
              <div
                key={memory.id}
                className="camp-diorama-pin"
                /* 位置は CSS 変数で渡す。こうすると縦画面用の格子を
                   メディアクエリ側だけで上書きできる。 */
                style={
                  {
                    '--pin-x': `${slot.x}%`,
                    '--pin-y': `${slot.y}%`,
                    '--note-tilt': `${slot.tilt}deg`,
                    opacity: slot.fade,
                    // 手前 (下) にあるものほど前に描く
                    zIndex: Math.round(slot.y),
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className={`camp-memory-note camp-memory-slot-${index} ${
                    newest ? 'camp-memory-note-new' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onSelect(memory)}
                  aria-label={`${memory.author}さんの思い出を開く`}
                >
                  {memory.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={memory.image} alt="" />
                  )}
                  <span>{memory.content || '写真の思い出'}</span>
                  <small>— {memory.author}</small>
                </button>
                <span className="camp-diorama-pin-stem" aria-hidden />
              </div>
            );
          })}
          </div>

          {/* 届いたばかりの 1 枚は主人公の頭上に。次が来ると輪に加わる。 */}
          {herald && (
            <div className="camp-herald">
              <div
                className="camp-herald-note"
                style={
                  {
                    '--pin-x': `${HERALD_ANCHOR.x}%`,
                    '--pin-y': `${HERALD_ANCHOR.y}%`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="camp-memory-note"
                  style={{ backgroundColor: NOTE_COLORS[herald.color] ?? '#f5d995' }}
                  onClick={() => onSelect(herald)}
                  aria-label={`${herald.author}さんの新しい思い出を開く`}
                >
                  {herald.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={herald.image} alt="" />
                  )}
                  <span>{herald.content || '写真の思い出'}</span>
                  <small>— {herald.author}</small>
                </button>
                <span className="camp-herald-beam" aria-hidden />
              </div>

              <p
                className="camp-herald-bubble"
                style={
                  {
                    '--pin-x': `${BUBBLE_ANCHOR.x}%`,
                    '--pin-y': `${BUBBLE_ANCHOR.y}%`,
                  } as CSSProperties
                }
                role="status"
                aria-live="polite"
              >
                {heraldLine}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

