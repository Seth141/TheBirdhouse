import type { MotionEvent, Recording } from "@/lib/camera/types";

/**
 * Placeholder data shaped exactly like the payloads a future API would
 * return. Swap the functions in `hooks.ts` for real `fetch` calls once the
 * backend exists — components never need to change.
 */

export interface DailyStats {
  birdsToday: number;
  eggsLaid: number;
  visitsToday: number;
  totalVisits: number;
}

export const mockStats: DailyStats = {
  birdsToday: 3,
  eggsLaid: 0,
  visitsToday: 5,
  totalVisits: 24,
};

export interface Moment {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  timestamp: string;
}

export const mockMoments: Moment[] = [
  {
    id: "moment-1",
    title: "Morning Flight",
    subtitle: "8:12 AM",
    imageSrc: "/artwork/birds/bluebird-flying.png",
    timestamp: "2026-07-07T08:12:00Z",
  },
  {
    id: "moment-2",
    title: "Three Eggs",
    subtitle: "7:40 AM",
    imageSrc: "/artwork/nests/nest-eggs.png",
    timestamp: "2026-07-07T07:40:00Z",
  },
  {
    id: "moment-3",
    title: "A Quiet Visit",
    subtitle: "6:55 AM",
    imageSrc: "/artwork/birds/bluebird-perched.png",
    timestamp: "2026-07-07T06:55:00Z",
  },
  {
    id: "moment-4",
    title: "Garden Blooms",
    subtitle: "Yesterday",
    imageSrc: "/artwork/flowers/flowers-vase.png",
    timestamp: "2026-07-06T17:20:00Z",
  },
];

export const mockRecordings: Recording[] = mockMoments.map((m, i) => ({
  id: `rec-${i}`,
  title: m.title,
  timestamp: m.timestamp,
  durationSeconds: 24 + i * 8,
  thumbnailSrc: m.imageSrc,
}));

export const mockMotionEvents: MotionEvent[] = mockMoments.map((m, i) => ({
  id: `motion-${i}`,
  timestamp: m.timestamp,
  label: m.title,
  thumbnailSrc: m.imageSrc,
}));

export interface NatureTip {
  id: string;
  title: string;
  body: string;
}

export const mockTip: NatureTip = {
  id: "tip-1",
  title: "Tip of the Day",
  body: "Early mornings are the best time to see new visitors!",
};

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    title: "New visitor",
    body: "A bluebird just landed on the perch.",
    timestamp: "2026-07-07T08:12:00Z",
    read: false,
  },
  {
    id: "notif-2",
    title: "Egg laid",
    body: "A second egg was gently added to the nest.",
    timestamp: "2026-07-07T07:41:00Z",
    read: false,
  },
  {
    id: "notif-3",
    title: "Good morning",
    body: "Your birdhouse camera reconnected and is watching quietly.",
    timestamp: "2026-07-07T06:02:00Z",
    read: false,
  },
];
