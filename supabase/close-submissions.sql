-- 投稿の受付を閉じる (読み取りはそのまま) -------------------------------------
--
-- 画面から入口を消すだけでは書き込みは止まらない。公開キーはブラウザに
-- 配ってあるので、API を直接叩けば insert できてしまう。実際に止めるのは
-- ここ、RLS の insert ポリシーを外すこと。
--
-- 保存済みの思い出は消えない。select のポリシーは残すので、ボードは
-- これまでどおり全部読める。
--
-- 実行方法:
--   Supabase ダッシュボード > SQL Editor > New query > 全部貼って Run

-- 1) いまの状態を確認 -----------------------------------------------------
-- 実行前にこれだけ流して、消す対象があることを確かめてもよい。
select schemaname, tablename, policyname, cmd
from pg_policies
where (schemaname = 'public'  and tablename = 'memories')
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;

-- 2) 書き込みを止める -----------------------------------------------------
-- メッセージの追加
drop policy if exists "Anyone can add a memory" on public.memories;

-- 写真のアップロード
drop policy if exists "Anyone can upload a photo" on storage.objects;

-- 3) 確認 -----------------------------------------------------------------
-- 残るのは select の 2 本だけになるはず:
--   public.memories  | Anyone can read memories | SELECT
--   storage.objects  | Anyone can view photos   | SELECT
select schemaname, tablename, policyname, cmd
from pg_policies
where (schemaname = 'public'  and tablename = 'memories')
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;


-- ============================================================================
-- また受け付けたくなったら、以下を実行して lib/config.ts の
-- SUBMISSIONS_OPEN を true に戻して再デプロイする。
-- ============================================================================
--
-- create policy "Anyone can add a memory"
--   on public.memories for insert
--   with check (true);
--
-- create policy "Anyone can upload a photo"
--   on storage.objects for insert
--   with check (bucket_id = 'photos');
