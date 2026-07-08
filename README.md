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

The UI never talks to a specific stream implementation — everything goes through the `CameraSource` interface in `src/lib/camera/types.ts`. Three providers exist today:

- `MockCameraSource` — used by default so the app is fully explorable without hardware.
- `HlsCameraSource` — for a Wyze Cam V3 whose RTSP feed is republished as HLS via a proxy (e.g. [go2rtc](https://github.com/AlexxIT/go2rtc), RTSPtoWeb, or MediaMTX).
- `MjpegCameraSource` — for MJPEG-style snapshot-stream bridges.

To point the app at a real stream, set environment variables (e.g. in `.env.local`):

```bash
NEXT_PUBLIC_CAMERA_PROTOCOL=hls
NEXT_PUBLIC_CAMERA_STREAM_URL=https://your-proxy/birdhouse/stream.m3u8
```

`src/lib/camera/createCameraSource.ts` picks the right provider automatically — no component changes required.

## Design Tokens

All colors, typography, spacing, radii, shadows, blur, and motion values live in `src/lib/theme/tokens.ts` and are mirrored into `src/app/globals.css` (`@theme`) so Tailwind utilities and JS/Framer Motion values always agree.

## Data Layer

`src/lib/query/hooks.ts` exposes `useStats`, `useMoments`, `useRecordings`, `useMotionEvents`, `useNatureTip`, and `useNotifications`, all backed by mock data in `mockData.ts` with simulated network delay. Swap the `queryFn` implementations for real `fetch` calls when a backend exists — components are already written against these hooks.

## Accessibility & Performance

- 44×44px minimum touch targets on all interactive controls
- Semantic landmarks, ARIA labels on icon-only buttons, `aria-current`/`aria-pressed`/`aria-expanded` where relevant
- `prefers-reduced-motion` is respected globally (see `globals.css`)
- Images are served through `next/image` with explicit `sizes`
- A minimal offline app-shell service worker (`public/sw.js`) caches the shell and artwork for PWA installs
