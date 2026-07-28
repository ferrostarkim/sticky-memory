'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CampDiorama from '@/components/camp/CampDiorama';
import CampIntroDive from '@/components/camp/CampIntroDive';
import JoinBanner from '@/components/common/JoinBanner';
import Lightbox from '@/components/common/Lightbox';
import VerseBanner from '@/components/common/VerseBanner';
import { useMemories } from '@/lib/useMemories';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Memory } from '@/types/memory';

interface CampExperienceProps {
  spotlight?: boolean;
}

const DEV_PREVIEW_MEMORIES: Memory[] = [
  { id: 'preview-01', author: 'ゆうな', content: 'みんなで見た海と夕焼け、ずっと忘れないよ。', color: 'bg-yellow-200', rotation: -2 },
  { id: 'preview-02', author: 'しょう', content: 'キャンプファイヤーが最高でした！', color: 'bg-orange-200', rotation: 3 },
  { id: 'preview-03', author: 'あかり', content: '新しい友だちができてうれしかったです。', color: 'bg-pink-200', rotation: -1 },
  { id: 'preview-04', author: 'りく', content: 'またみんなで会瀬に来ようね。', color: 'bg-blue-200', rotation: 2 },
  { id: 'preview-05', author: 'Daniel', content: 'God is good! 素敵な二日間をありがとう。', color: 'bg-green-200', rotation: -3 },
  { id: 'preview-06', author: 'みお', content: '朝の散歩と海の音が気持ちよかった！', color: 'bg-purple-200', rotation: 1 },
  { id: 'preview-07', author: 'はる', content: 'みんなで作ったカレー、おいしかったね。', color: 'bg-yellow-200', rotation: -2 },
  { id: 'preview-08', author: 'Grace', content: '笑顔いっぱいの思い出になりました。', color: 'bg-pink-200', rotation: 2 },
  { id: 'preview-09', author: 'けん', content: '夜空の星がとてもきれいでした。', color: 'bg-blue-200', rotation: -1 },
  { id: 'preview-10', author: 'さな', content: '先生たち、準備してくれてありがとう！', color: 'bg-green-200', rotation: 3 },
  { id: 'preview-11', author: 'Noah', content: 'Cross Mission Camp 2026 ✨', color: 'bg-orange-200', rotation: -3 },
  { id: 'preview-12', author: 'ひなた', content: '次のキャンプも楽しみにしています。', color: 'bg-purple-200', rotation: 1 },
];

/** 島の上に同時に出す枚数。ジオラマ側の PIN_SLOTS と必ず一致させること。 */
const STAGE_SLOTS = 9;

/** 新着を主人公の頭上に見せておく時間 */
const HERALD_MS = 9000;

export default function CampExperience({ spotlight = false }: CampExperienceProps) {
  const { memories, connected } = useMemories();
  const [selected, setSelected] = useState<Memory | null>(null);
  const [stageOffset, setStageOffset] = useState(0);
  const [shifting, setShifting] = useState(false);
  const [queuePaused, setQueuePaused] = useState(false);
  const [herald, setHerald] = useState<Memory | null>(null);
  const [manualHold, setManualHold] = useState(false);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shiftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heraldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownIds = useRef<Set<string> | null>(null);
  const previewing = process.env.NODE_ENV === 'development' && !isSupabaseConfigured;
  const [rehearsal, setRehearsal] = useState<Memory[]>([]);
  const displayMemories = useMemo(
    () => (previewing ? [...DEV_PREVIEW_MEMORIES, ...rehearsal] : memories),
    [previewing, rehearsal, memories]
  );

  // 開発時に ?herald=1 を付けると、新着が届く様子を確認できる。
  // Supabase を繋がずに主人公の反応を見たいとき用。
  useEffect(() => {
    if (!previewing) return;
    if (new URLSearchParams(location.search).get('herald') !== '1') return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setRehearsal((current) => [
        ...current,
        {
          id: `rehearsal-${n}`,
          author: `テスト${n}`,
          content: `届いたばかりのメッセージ ${n} 通目です。`,
          color: ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200'][n % 3],
          rotation: 0,
        },
      ]);
    }, 6000);
    return () => clearInterval(id);
  }, [previewing]);

  // 新着はまず主人公の頭上に出す。次の投稿が来たら通常の輪に加わる。
  useEffect(() => {
    if (!displayMemories.length) return;
    const timer = setTimeout(() => {
      const known = knownIds.current;
      if (known === null) {
        // 初回に読み込んだぶんは「新着」ではない
        knownIds.current = new Set(displayMemories.map((m) => m.id));
        return;
      }
      const fresh = displayMemories.filter((m) => !known.has(m.id));
      if (!fresh.length) return;
      fresh.forEach((m) => known.add(m.id));
      setHerald(fresh[fresh.length - 1]);
    }, 0);
    return () => clearTimeout(timer);
  }, [displayMemories]);

  // 一定時間で頭上から降ろす
  useEffect(() => {
    if (!herald) return;
    heraldTimer.current = setTimeout(() => setHerald(null), HERALD_MS);
    return () => {
      if (heraldTimer.current) clearTimeout(heraldTimer.current);
    };
  }, [herald]);

  const visibleMemories = useMemo(() => displayMemories.slice(-36), [displayMemories]);
  // 頭上に出ている 1 枚は輪から外す。二重に出さないため。
  const rotating = useMemo(
    () => (herald ? visibleMemories.filter((m) => m.id !== herald.id) : visibleMemories),
    [visibleMemories, herald]
  );
  const normalizedOffset = rotating.length
    ? ((stageOffset % rotating.length) + rotating.length) % rotating.length
    : 0;
  const stageMemories = useMemo(() => {
    const count = Math.min(STAGE_SLOTS, rotating.length);
    return Array.from(
      { length: count },
      (_, index) => rotating[(normalizedOffset + index) % rotating.length]
    );
  }, [normalizedOffset, rotating]);
  const queuedMemories = useMemo(() => {
    if (rotating.length <= STAGE_SLOTS) return [];
    return Array.from(
      { length: rotating.length - STAGE_SLOTS },
      (_, index) =>
        rotating[(normalizedOffset + STAGE_SLOTS + index) % rotating.length]
    );
  }, [normalizedOffset, rotating]);

  /** step が正なら次へ、負なら前へ。手で回すときは即座に動かす。 */
  const rotate = useCallback(
    (step: number, animate = true) => {
      if (rotating.length <= STAGE_SLOTS) return;
      if (!animate) {
        // 手で回している間に自動送りが割り込むと操作を奪われる
        setManualHold(true);
        setStageOffset((current) => current + step);
        return;
      }
      if (shifting) return;
      setShifting(true);
      shiftTimer.current = setTimeout(() => {
        setStageOffset((current) => current + step);
        setShifting(false);
        shiftTimer.current = null;
      }, 680);
    },
    [shifting, rotating.length]
  );

  const shiftQueue = useCallback(() => rotate(1), [rotate]);

  // 手で回したあとはしばらく自動送りを止める
  useEffect(() => {
    if (!manualHold) return;
    manualTimer.current = setTimeout(() => setManualHold(false), 6000);
    return () => {
      if (manualTimer.current) clearTimeout(manualTimer.current);
    };
  }, [manualHold, stageOffset]);

  useEffect(() => {
    if (queuePaused || manualHold || selected || rotating.length <= STAGE_SLOTS) return;
    const interval = setInterval(shiftQueue, 5200);
    return () => clearInterval(interval);
  }, [queuePaused, manualHold, selected, shiftQueue, rotating.length]);

  useEffect(
    () => () => {
      if (shiftTimer.current) clearTimeout(shiftTimer.current);
      if (heraldTimer.current) clearTimeout(heraldTimer.current);
      if (manualTimer.current) clearTimeout(manualTimer.current);
    },
    []
  );

  return (
    <main className={`camp-shell ${spotlight ? 'camp-shell-spotlight' : ''}`}>
      <div className="camp-sky" aria-hidden />
      <CampDiorama
        memories={stageMemories}
        spotlight={spotlight}
        shifting={shifting}
        herald={herald}
        onSelect={setSelected}
        onRotate={(step) => rotate(step, false)}
      />
      {!spotlight && (
        <MemoryRibbon
          memories={queuedMemories}
          totalCount={visibleMemories.length}
          shifting={shifting}
          paused={queuePaused || Boolean(selected)}
          onShift={shiftQueue}
          onPauseChange={setQueuePaused}
          onSelect={setSelected}
        />
      )}

      <header className="camp-header">
        <div className="camp-brand">
          <p className="camp-kicker">CROSS MISSION CAMP 2026</p>
          <h1>
            <span>クロスミッション</span>
            <strong>キャンプの思い出</strong>
          </h1>
          <p className="camp-location">会瀬青少年の家 · 日立市</p>
        </div>

        <div className="camp-header-actions">
          <div className="camp-live" data-connected={connected}>
            <span aria-hidden />
            {previewing ? 'PREVIEW' : connected ? 'LIVE' : '再接続中'}
            <b>{displayMemories.length}</b>
            <small>MEMORIES</small>
          </div>
          <Link
            href={spotlight ? '/' : '/spotlight'}
            className="camp-link-button"
          >
            {spotlight ? 'ボードに戻る' : '投影モード'}
            <span aria-hidden>{spotlight ? '↙' : '↗'}</span>
          </Link>
        </div>
      </header>

      {!spotlight && (
        <>
          <div className="camp-instructions">
            <span className="camp-instructions-icon" aria-hidden>✉</span>
            <div>
              <b>手紙をタップすると大きく開きます</b>
              <span>下のリストから全員の思い出が読めます</span>
            </div>
          </div>

          <div className="camp-join-desktop">
            <JoinBanner size={96} />
          </div>

          <Link href="/submit" className="camp-mobile-submit">
            <span aria-hidden>＋</span>
            思い出を追加
          </Link>
        </>
      )}

      {spotlight && (
        <div className="camp-spotlight-footer">
          <VerseBanner />
          <div className="camp-join-compact">
            <JoinBanner size={84} />
          </div>
        </div>
      )}

      <div className="camp-edge camp-edge-left" aria-hidden />
      <div className="camp-edge camp-edge-right" aria-hidden />

      {!spotlight && <CampIntroDive />}

      {selected && <Lightbox memory={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

const RIBBON_COLORS: Record<string, string> = {
  'bg-yellow-200': '#f5d995',
  'bg-pink-200': '#e8b7b7',
  'bg-blue-200': '#a9ced0',
  'bg-green-200': '#b9d2a2',
  'bg-purple-200': '#c9b4d6',
  'bg-orange-200': '#e8bd92',
};

function MemoryRibbon({
  memories,
  totalCount,
  shifting,
  paused,
  onShift,
  onPauseChange,
  onSelect,
}: {
  memories: Memory[];
  totalCount: number;
  shifting: boolean;
  paused: boolean;
  onShift: () => void;
  onPauseChange: (paused: boolean) => void;
  onSelect: (memory: Memory) => void;
}) {
  return (
    <section
      className="camp-memory-ribbon"
      data-shifting={shifting}
      data-paused={paused}
      aria-label="キャンプの思い出待ちリスト"
      onPointerEnter={() => onPauseChange(true)}
      onPointerLeave={() => onPauseChange(false)}
      onPointerDown={() => onPauseChange(true)}
      onPointerUp={() => onPauseChange(false)}
      onPointerCancel={() => onPauseChange(false)}
      onFocus={() => onPauseChange(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onPauseChange(false);
        }
      }}
    >
      <div className="camp-memory-ribbon-title">
        <span>MEMORY QUEUE</span>
        <strong>次の思い出</strong>
        <small>舞台 {STAGE_SLOTS} / 全{totalCount}</small>
        <button type="button" onClick={onShift} disabled={shifting || memories.length === 0}>
          {paused ? '再開して送る' : '次へ送る'} <b>→</b>
        </button>
      </div>
      <div className="camp-memory-ribbon-track" aria-live="polite">
        {memories.map((memory) => (
          <button
            key={memory.id}
            type="button"
            className="camp-ribbon-note"
            style={{ backgroundColor: RIBBON_COLORS[memory.color] ?? '#f5d995' }}
            onClick={() => onSelect(memory)}
          >
            {memory.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={memory.image} alt="" />
            )}
            <span>{memory.content || '写真の思い出'}</span>
            <small>— {memory.author}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
