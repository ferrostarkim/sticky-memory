// Export the guestbook for offline management.
//
//   npm run export
//
// Produces an ./export-data folder with:
//   - memories.json / memories.csv  (raw data)
//   - photos/                       (original uploaded photos)
//   - board.html                    (printable "post-it" board, self-contained)
//
// Reads Supabase credentials from .env.local (same file the app uses).

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ---- credentials ------------------------------------------------------------
function loadEnv(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* file may not exist */
  }
  return env;
}

const fileEnv = loadEnv(join(process.cwd(), '.env.local'));
const URL = fileEnv.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  fileEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error('Missing Supabase credentials. Set them in .env.local first.');
  process.exit(1);
}

// ---- helpers ----------------------------------------------------------------
const OUT = join(process.cwd(), 'export-data');
const PHOTOS = join(OUT, 'photos');

const COLOR_HEX = {
  'bg-amber-100': '#fef3c7', 'bg-rose-100': '#ffe4e6', 'bg-emerald-100': '#d1fae5',
  'bg-sky-100': '#e0f2fe', 'bg-violet-100': '#ede9fe', 'bg-orange-100': '#ffedd5',
  'bg-teal-100': '#ccfbf1', 'bg-lime-100': '#ecfccb',
  'bg-yellow-200': '#fef08a', 'bg-green-200': '#bbf7d0', 'bg-blue-200': '#bfdbfe',
  'bg-pink-200': '#fbcfe8', 'bg-purple-200': '#e9d5ff', 'bg-orange-200': '#fed7aa',
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const csvCell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

const safe = (s) => String(s ?? '').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 24) || 'note';

// ---- main -------------------------------------------------------------------
async function main() {
  const supabase = createClient(URL, KEY);
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`Fetched ${rows.length} memories.`);

  mkdirSync(PHOTOS, { recursive: true });

  // Download photos + collect data-URIs for the self-contained board.
  const enriched = [];
  for (let i = 0; i < rows.length; i++) {
    const m = rows[i];
    let photoFile = '';
    let dataUri = '';
    if (m.image_url) {
      try {
        const res = await fetch(m.image_url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          photoFile = `${String(i + 1).padStart(3, '0')}_${safe(m.author)}.jpg`;
          writeFileSync(join(PHOTOS, photoFile), buf);
          dataUri = `data:image/jpeg;base64,${buf.toString('base64')}`;
        }
      } catch (e) {
        console.warn(`  photo download failed for #${i + 1}:`, e.message);
      }
    }
    enriched.push({ ...m, photo_file: photoFile, _dataUri: dataUri });
    process.stdout.write(`\r  photos: ${i + 1}/${rows.length}`);
  }
  process.stdout.write('\n');

  // 1) JSON (raw)
  const jsonRows = enriched.map(({ _dataUri, ...r }) => r);
  writeFileSync(join(OUT, 'memories.json'), JSON.stringify(jsonRows, null, 2), 'utf8');

  // 2) CSV (raw)
  const header = ['id', 'author', 'content', 'color', 'rotation', 'created_at', 'image_url', 'photo_file'];
  const csv = [
    header.join(','),
    ...enriched.map((m) => header.map((h) => csvCell(m[h])).join(',')),
  ].join('\r\n');
  writeFileSync(join(OUT, 'memories.csv'), '﻿' + csv, 'utf8'); // BOM for Excel

  // 3) board.html (post-it form, self-contained)
  writeFileSync(join(OUT, 'board.html'), buildBoardHtml(enriched), 'utf8');

  console.log(`\nDone → ${OUT}`);
  console.log('  memories.json / memories.csv  (raw data)');
  console.log('  photos/                        (original photos)');
  console.log('  board.html                     (open in a browser, print to PDF)');
}

function buildBoardHtml(rows) {
  const notes = rows
    .map((m) => {
      const tint = COLOR_HEX[m.color] || '#fdf2b8';
      const img = m._dataUri
        ? `<img src="${m._dataUri}" alt="">`
        : '';
      const msg = m.content ? `<p class="msg">${esc(m.content)}</p>` : '';
      return `<div class="note" style="background:${tint};--rot:${Number(m.rotation) || 0}deg">
  <span class="tape"></span>${img}${msg}
  <div class="sig">— ${esc(m.author)}</div>
</div>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>クロスミッションクリスチャンスクール — 芳名帳</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=Zen+Maru+Gothic:wght@500;700&display=swap" rel="stylesheet">
<style>
  :root { --ink:#4a3a2e; --ink-soft:#7b6959; }
  * { box-sizing:border-box; }
  body { margin:0; padding:32px; background:#fbeeda;
    font-family:'Zen Maru Gothic',sans-serif; color:var(--ink); }
  header { text-align:center; margin-bottom:24px; }
  header h1 { font-size:28px; margin:0; }
  header p { color:var(--ink-soft); margin:4px 0 0; }
  .board { display:flex; flex-wrap:wrap; gap:26px; justify-content:center; align-items:flex-start; }
  .note { position:relative; width:210px; min-height:210px; padding:26px 16px 14px;
    transform:rotate(var(--rot)); border-radius:2px;
    box-shadow:0 1px 1px rgba(0,0,0,.06), 0 12px 24px -12px rgba(40,25,10,.5);
    display:flex; flex-direction:column; }
  .note .tape { position:absolute; top:-11px; left:50%; width:60px; height:22px;
    transform:translateX(-50%) rotate(-3deg); border-radius:2px;
    background:linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,.15));
    box-shadow:0 2px 5px rgba(0,0,0,.14); }
  .note img { width:100%; height:140px; object-fit:cover; border-radius:2px;
    margin-bottom:8px; background:#fff; padding:4px; box-shadow:0 1px 2px rgba(0,0,0,.15); }
  .note .msg { font-family:'Klee One',cursive; font-size:16px; line-height:1.4;
    white-space:pre-wrap; word-break:break-word; flex:1; margin:0; }
  .note .sig { font-family:'Klee One',cursive; text-align:right; color:var(--ink-soft);
    font-size:14px; margin-top:8px; }
  @media print { body { background:#fff; } .note { break-inside:avoid; } }
</style></head>
<body>
  <header>
    <h1>クロスミッションクリスチャンスクール — 芳名帳</h1>
    <p>${rows.length} 件のメッセージ</p>
  </header>
  <div class="board">
${notes}
  </div>
</body></html>`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
