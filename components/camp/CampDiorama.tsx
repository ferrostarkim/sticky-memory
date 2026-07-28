'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';
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

/** 指で払って回すときの、1 枚ぶんに相当する移動量 (画面比) */
const DRAG_STEP_RATIO = 0.11;

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
  const drag = useRef<{ id: number; x: number; carried: number } | null>(null);
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

  // 指で横に払うと輪が回る。一定量ごとに 1 枚送る。
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (spotlight || !onRotate) return;
    // ポストイットを押したときは選択が優先
    if ((event.target as HTMLElement).closest('.camp-memory-note')) return;
    drag.current = { id: event.pointerId, x: event.clientX, carried: 0 };
    setDragging(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // 捕捉できなくても、pointermove は拾えるので続行する
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId || !onRotate) return;
    const width = event.currentTarget.clientWidth || 1;
    state.carried += event.clientX - state.x;
    state.x = event.clientX;
    const stepPx = width * DRAG_STEP_RATIO;
    while (Math.abs(state.carried) >= stepPx) {
      // 左に払うと次の 1 枚が手前に来る
      const step = state.carried > 0 ? -1 : 1;
      state.carried -= step > 0 ? -stepPx : stepPx;
      onRotate(step);
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // 捕捉していなければ解放も不要
    }
  };

  return (
    <div
      ref={root}
      className="camp-canvas camp-diorama"
      data-shifting={shifting}
      data-spotlight={spotlight}
      data-dragging={dragging}
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
            const slot = PIN_SLOTS[index % PIN_SLOTS.length];
            const color = NOTE_COLORS[memory.color] ?? '#f5d995';
            const newest = memory.id === newestId;

            return (
              <div
                key={memory.id}
                className="camp-diorama-pin"
                /* 位置は CSS 変数で渡す。こうすると縦画面用の 2 段組みを
                   メディアクエリ側だけで上書きできる。 */
                style={
                  {
                    '--pin-x': `${slot.x}%`,
                    '--pin-y': `${slot.y}%`,
                    '--note-tilt': `${slot.tilt}deg`,
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

