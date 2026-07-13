# Sara's Birdhouse 🩷

A premium, mobile-first Progressive Web App for peacefully watching a backyard birdhouse — built to feel like a watercolor nature journal, not a security dashboard.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` design tokens)
- **Framer Motion** for calm, deliberate animation
- **Zustand** for lightweight client UI state (favorites, toasts, notification read state)
- **TanStack Query** as the data layer, pre-wired with mock data and ready to swap for real endpoints
- **hls.js** for live camera streaming
- Fonts: **Cormorant Garamond** (headings) + **Inter** (body), via `next/font/google`

No generic UI kits (Bootstrap/MUI/Chakra/Ant/Bulma) — every component, icon, and illustration is handcrafted for this app.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint
```

## Project Structure

```text
src/
  app/                    Routes: home, /live-camera, /gallery, /settings
  components/
    background/           SkyBackground (clouds, paper grain, vignette)
    camera/                CameraPlayer + status/offline UI
    home/                  Hero, LiveCameraCard, StatsGrid, RecentMoments, TipCard
    icons/                 Hand-painted SVG icon system
    layout/                Header, BottomNav, AppShell, menu/notification drawers
    motion/                FadeIn, LoadingFeather (drifting-feather loader)
    ui/                    GlassCard, IconButton, Switch, ToastLayer
  lib/
    camera/                Camera abstraction (types, providers, factory, hook)
    query/                 TanStack Query provider, mock data, hooks
    store/                 Zustand app store
    theme/                 Centralized design tokens (tokens.ts)
    utils/                 Small shared helpers

public/
  artwork/                 Watercolor illustrations, organized by subject
  icons/                   Static SVG icon asset library
  manifest.webmanifest, sw.js
```

## Camera Integration (Wyze Cam V3)

Browsers cannot play the private RTSP URL used by the inference service. The app
plays **HLS** from [docker-wyze-bridge](https://github.com/mrlt8/docker-wyze-bridge)
via a **same-origin Next.js proxy** (`/api/camera/...`) so CORS and Basic auth
work reliably in the browser.

| Port | Purpose | Public? |
|------|---------|---------|
| `8888` | HLS (`.m3u8`) upstream for the proxy | **Yes** |
| `5000` | Bridge WebUI / dashboard | Optional |
| `8554` | RTSP for inference on Railway private network | **No** |

Set in `.env.local` (and Vercel):

```bash
NEXT_PUBLIC_CAMERA_PROTOCOL=hls
NEXT_PUBLIC_CAMERA_STREAM_URL=/api/camera/bird/stream.m3u8

CAMERA_UPSTREAM_BASE=https://your-bridge.up.railway.app
CAMERA_STREAM_USER=wb
CAMERA_STREAM_PASSWORD=your-wb-api-key
```

Restart `npm run dev` after changing env vars.

## Design Tokens

All colors, typography, spacing, radii, shadows, blur, and motion values live in `src/lib/theme/tokens.ts` and are mirrored into `src/app/globals.css` (`@theme`) so Tailwind utilities and JS/Framer Motion values always agree.

## Data Layer

`src/lib/query/hooks.ts` exposes `useStats`, `useMoments`, `useRecordings`, `useMotionEvents`, `useNatureTip`, `useNotifications`, and `useSpeciesGallery`.

When `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, hooks read from Supabase (`observations` / `species`) with Realtime invalidation. Without those env vars, the app falls back to mock data so the UI stays explorable.

Backend pipeline (RTSP → detect → classify → Supabase) lives in `inference-service/`. Schema + RLS live in `supabase/migrations/`.

## Backend (Supabase + Railway)

1. Run `supabase/migrations/20260713000000_init.sql` in the Supabase SQL editor (see `supabase/README.md`).
2. Deploy [docker-wyze-bridge](https://github.com/mrlt8/docker-wyze-bridge) on Railway (manual — Phase 2).
3. Deploy `inference-service/` as a second Railway service; point `RTSP_URL` at the private bridge URL and set the Supabase **service role** key.
4. Set frontend env from `.env.example` and redeploy on Vercel.

## Accessibility & Performance

- 44×44px minimum touch targets on all interactive controls
- Semantic landmarks, ARIA labels on icon-only buttons, `aria-current`/`aria-pressed`/`aria-expanded` where relevant
- `prefers-reduced-motion` is respected globally (see `globals.css`)
- Images are served through `next/image` with explicit `sizes`
- A minimal offline app-shell service worker (`public/sw.js`) caches the shell and artwork for PWA installs
