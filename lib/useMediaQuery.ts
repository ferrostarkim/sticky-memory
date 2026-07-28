'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * メディアクエリの現在値を返す。
 *
 * useEffect + setState でも書けるが、それだと「反映が 1 フレーム遅れる」うえ、
 * 反映を requestAnimationFrame に逃がすと、タブが背面にある・省電力などで
 * rAF が止まっている間ずっと初期値のままになる。縦画面の判定がこれで落ちると
 * スマホなのに横画面用の 9 枠が出てしまう。
 *
 * useSyncExternalStore なら描画時に同期で読むので、その隙間が生まれない。
 *
 * サーバー側には画面幅がないので serverValue を返す。クライアントで異なれば
 * ハイドレーション直後に一度だけ正しい値へ描き直される。
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}

/** 縦画面 (スマホ) かどうか。この値で舞台の枠数と輪の形が変わる。 */
export const COMPACT_QUERY = '(max-width: 760px)';
