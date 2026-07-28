'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 最初に一度だけ流すイントロ。空からキャンプ場の島へ降りてくる 4 秒の映像を
 * 再生し、終わり際に静止画のボードへクロスフェードする。
 *
 * 映像の最終フレームは背景画像と同じ構図で生成してあるが、完全な画素一致では
 * ないので、最後の 0.45 秒を重ねて差を隠す。
 *
 * 映像はジオラマ画像とぴったり重なる必要がある。CSS の値を写すと本体側の
 * 変更で簡単にずれるため、実際の位置を実測して合わせる。
 */

const SKIP_KEY = 'camp-intro-seen';
const FADE_MS = 450;
/** 再生終了より少し前に重ね始める */
const CROSSFADE_LEAD = 0.45;
/** 何かが詰まってもボードを隠したままにしない (映像 4 秒 + 余裕) */
const WATCHDOG_MS = 6500;
/** 再生位置がこの時間だけ進まなければ、止まったとみなして畳む */
const STALL_MS = 1200;

type Phase = 'idle' | 'playing' | 'fading' | 'done';

export default function CampIntroDive() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [frame, setFrame] = useState<DOMRect | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const finish = useCallback(() => {
    setPhase((current) => {
      if (current === 'done') return current;
      try {
        sessionStorage.setItem(SKIP_KEY, '1');
      } catch {
        // プライベートモードなどで保存できなくても再生自体は成立する
      }
      return 'done';
    });
  }, []);

  const startFade = useCallback(() => {
    setPhase((current) => (current === 'playing' ? 'fading' : current));
    timers.current.push(setTimeout(finish, FADE_MS));
  }, [finish]);

  // 判定はレイアウトが確定した次のフレームで行う。
  // 効果の中で即座に setState すると描画が連鎖するうえ、
  // ジオラマの位置もまだ確定していない。
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      // ?intro=1 を付けると何度でも見られる。確認用。
      const forced = new URLSearchParams(location.search).get('intro') === '1';
      let seen = false;
      try {
        seen = !forced && sessionStorage.getItem(SKIP_KEY) === '1';
      } catch {
        seen = false;
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const compact = window.matchMedia('(max-width: 760px)').matches;
      const target = document.querySelector('.camp-diorama-stage');

      // 再訪・動きを抑える設定・スマホでは流さない。
      // キャンプ場から QR で開く状況を考えると、通信量を使わせたくない。
      if (seen || reduced || compact || !target) {
        setPhase('done');
        return;
      }
      setFrame(target.getBoundingClientRect());
      setPhase('playing');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // 表示中はジオラマ画像 (ステージ) と同じ矩形に追従させる
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'fading') return;
    const target = document.querySelector('.camp-diorama-stage');
    if (!target) return;
    const measure = () => setFrame(target.getBoundingClientRect());
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const captured = timers.current;
    captured.push(setTimeout(finish, WATCHDOG_MS));

    const video = videoRef.current;
    if (!video) return;
    // 自動再生はミュートが条件。拒否されたら黙って畳む。
    video.play().catch(finish);

    // 省電力設定などで再生が進まなくなることがある。
    // 止まった画を見せ続けるより、静止画のボードを出したほうがよい。
    let lastTime = -1;
    let stalledFor = 0;
    const poll = setInterval(() => {
      if (video.currentTime === lastTime) {
        stalledFor += 300;
        if (stalledFor >= STALL_MS) finish();
      } else {
        lastTime = video.currentTime;
        stalledFor = 0;
      }
    }, 300);

    return () => {
      clearInterval(poll);
      captured.forEach(clearTimeout);
      captured.length = 0;
    };
  }, [phase, finish]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  if (phase === 'done' || phase === 'idle') return null;

  return (
    <div
      className="camp-intro"
      data-phase={phase}
      onClick={startFade}
      role="presentation"
    >
      <div
        className="camp-intro-frame"
        style={
          frame
            ? {
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
              }
            : { inset: 0 }
        }
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={(event) => {
            const el = event.currentTarget;
            if (el.duration && el.currentTime >= el.duration - CROSSFADE_LEAD) {
              startFade();
            }
          }}
          onEnded={startFade}
          /* stalled は通常のバッファリング中にも飛ぶので終了判定に使わない。
             詰まった場合は WATCHDOG_MS 側で畳む。 */
          onError={finish}
        >
          <source src="/diorama/intro-dive.webm" type="video/webm" />
          <source src="/diorama/intro-dive.mp4" type="video/mp4" />
        </video>
      </div>
      <span className="camp-intro-skip">タップでスキップ</span>
    </div>
  );
}
