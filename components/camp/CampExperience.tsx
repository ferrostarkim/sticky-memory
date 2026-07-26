'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import JoinBanner from '@/components/common/JoinBanner';
import Lightbox from '@/components/common/Lightbox';
import VerseBanner from '@/components/common/VerseBanner';
import { useMemories } from '@/lib/useMemories';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Memory } from '@/types/memory';

const CampCanvas = dynamic(() => import('@/components/camp/CampCanvas'), {
  ssr: false,
  loading: () => (
    <div className="camp-loading" role="status" aria-live="polite">
      <span className="camp-loading-flame" aria-hidden />
      <span>キャンプ場を準備しています…</span>
    </div>
  ),
});

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

export default function CampExperience({ spotlight = false }: CampExperienceProps) {
  const { memories, connected } = useMemories();
  const [selected, setSelected] = useState<Memory | null>(null);
  const previewing = process.env.NODE_ENV === 'development' && !isSupabaseConfigured;
  const displayMemories = previewing ? DEV_PREVIEW_MEMORIES : memories;
  const visibleMemories = useMemo(() => displayMemories.slice(-36), [displayMemories]);

  return (
    <main className={`camp-shell ${spotlight ? 'camp-shell-spotlight' : ''}`}>
      <div className="camp-sky" aria-hidden />
      <CampCanvas
        memories={visibleMemories}
        spotlight={spotlight}
        onSelect={setSelected}
      />
      {!spotlight && (
        <MemoryRibbon memories={visibleMemories} onSelect={setSelected} />
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
            <span className="camp-instructions-icon" aria-hidden>↔</span>
            <div>
              <b>ドラッグしてキャンプ場を見渡す</b>
              <span>手紙をタップすると大きく開きます</span>
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
  onSelect,
}: {
  memories: Memory[];
  onSelect: (memory: Memory) => void;
}) {
  return (
    <section className="camp-memory-ribbon" aria-label="キャンプの思い出一覧">
      <div className="camp-memory-ribbon-title">
        <span>みんなの</span>
        <strong>思い出を読む</strong>
        <small>横にスワイプ →</small>
      </div>
      <div className="camp-memory-ribbon-track">
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
