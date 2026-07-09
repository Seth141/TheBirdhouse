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

export interface WeeklyVisit {
  day: string;
  visits: number;
}

/** Soft weekly rhythm for desktop insight charts. */
export const mockWeeklyVisits: WeeklyVisit[] = [
  { day: "Mon", visits: 3 },
  { day: "Tue", visits: 5 },
  { day: "Wed", visits: 2 },
  { day: "Thu", visits: 7 },
  { day: "Fri", visits: 4 },
  { day: "Sat", visits: 8 },
  { day: "Sun", visits: 5 },
];

export interface HourlyVisit {
  hour: string;
  visits: number;
}

export const mockHourlyVisits: HourlyVisit[] = [
  { hour: "6a", visits: 2 },
  { hour: "8a", visits: 6 },
  { hour: "10a", visits: 4 },
  { hour: "12p", visits: 3 },
  { hour: "2p", visits: 2 },
  { hour: "4p", visits: 5 },
  { hour: "6p", visits: 3 },
];

export interface VisitorShare {
  label: string;
  value: number;
  color: string;
}

export const mockVisitorShare: VisitorShare[] = [
  { label: "Bluebirds", value: 42, color: "#B9CBD8" },
  { label: "Sparrows", value: 28, color: "#D6E1D5" },
  { label: "Finches", value: 18, color: "#DCD6E8" },
  { label: "Other", value: 12, color: "#EFD9DD" },
];

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
