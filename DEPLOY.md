# Deploying Sticky Memory (free: Supabase + Vercel)

This app is a public, real-time guestbook. Data, realtime, and photo storage are
handled by **Supabase** (free tier); the site is hosted on **Vercel** (free tier).
No always-on laptop is needed — once deployed, the URL works from anywhere.

---

## 1. Create the Supabase project (~3 min)

1. Go to <https://supabase.com> → sign in → **New project**. Pick a name and a
   database password (you won't need the password for this app). Wait for it to
   finish provisioning.
2. In the project, open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates
   the `memories` table, security policies, realtime, and the `photos` storage
   bucket.
3. Click **Connect** (top bar) — or open **Project Settings → API Keys** — and
   copy two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **publishable** key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 2. Run it locally (optional, to test first)

```bash
cp .env.example .env.local     # then paste your two values into .env.local
npm install
npm run dev
```

Open <http://localhost:3000> (board) and <http://localhost:3000/submit> (form).
Because it talks to the cloud Supabase, a note you post on your phone's browser
appears on the board instantly. (Local dev already works across the internet
for data — only the *URL in the QR code* is local until you deploy.)

## 3. Deploy to Vercel (~3 min)

1. Push this repo to GitHub.
2. Go to <https://vercel.com> → **Add New… → Project** → import the repo.
3. Under **Environment Variables**, add the same two variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**. You'll get a public URL like
   `https://sticky-memory-xxxx.vercel.app`.

## 4. At the event

- **Big screen / projector:** open the Vercel URL — `/` (wall) or `/spotlight`
  (rotating donut). The QR code shown on screen automatically points to
  `<your-vercel-url>/submit`.
- **Guests:** scan the QR with any phone (any network — it's on the internet),
  add a photo + message, and it pops onto the board live.

No HTTPS/camera issues: photos use the file/camera picker, which works over the
Vercel HTTPS URL out of the box.

---

## How the pieces fit

| Concern        | Handled by                                             |
| -------------- | ------------------------------------------------------ |
| Hosting / pages| Vercel (Next.js)                                       |
| Data (notes)   | Supabase Postgres `memories` table                     |
| Real-time      | Supabase Realtime (`postgres_changes` on `memories`)   |
| Photos         | Supabase Storage public bucket `photos`                |
| QR / submit URL| Derived from the page origin ([`JoinBanner`](components/common/JoinBanner.tsx)) |

## Free-tier notes

- Supabase free projects **pause after ~1 week of inactivity** — just open the
  dashboard to resume before your event.
- Free limits (500 MB DB, 1 GB storage) are far more than a typical event needs.
  Photos are downscaled to ~1000px JPEG (~100–200 KB each) before upload.
