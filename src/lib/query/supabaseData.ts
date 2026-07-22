import type {
  AppNotification,
  DailyStats,
  HourlyVisit,
  Moment,
  VisitorShare,
  WeeklyVisit,
} from "@/lib/query/mockData";
import type { MotionEvent, Recording } from "@/lib/camera/types";
import type { ObservationWithSpecies, SpeciesRow } from "@/lib/supabase/database.types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

const VISITOR_COLORS = ["#B9CBD8", "#D6E1D5", "#DCD6E8", "#EFD9DD", "#C9D8E4", "#DDE7DC"];
const UNKNOWN_BIRD_ARTWORK = "/artwork/birds/bluebird-flying.png";

function startOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatMomentSubtitle(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startToday = startOfLocalDay(now);
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  if (date >= startToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (date >= startYesterday) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function displayName(obs: ObservationWithSpecies): string {
  return obs.species?.common_name || obs.detected_label || "Bird";
}

export function observationToMoment(obs: ObservationWithSpecies): Moment {
  return {
    id: obs.id,
    title: displayName(obs),
    subtitle: formatMomentSubtitle(obs.observed_at),
    imageSrc: obs.image_url ?? UNKNOWN_BIRD_ARTWORK,
    timestamp: obs.observed_at,
  };
}

export function observationToRecording(obs: ObservationWithSpecies): Recording {
  return {
    id: obs.id,
    title: displayName(obs),
    timestamp: obs.observed_at,
    durationSeconds: 0,
    thumbnailSrc: obs.image_url ?? UNKNOWN_BIRD_ARTWORK,
  };
}

export function observationToMotionEvent(obs: ObservationWithSpecies): MotionEvent {
  return {
    id: obs.id,
    timestamp: obs.observed_at,
    label: displayName(obs),
    thumbnailSrc: obs.image_url ?? UNKNOWN_BIRD_ARTWORK,
  };
}

export function observationToNotification(obs: ObservationWithSpecies): AppNotification {
  const name = displayName(obs);
  return {
    id: obs.id,
    title: "New visitor",
    body: `${name} visited the birdhouse.`,
    timestamp: obs.observed_at,
    read: false,
  };
}

async function fetchObservations(
  limit = 48,
  imagesOnly = false
): Promise<ObservationWithSpecies[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("observations")
    .select(
      "id, species_id, detected_label, confidence, image_url, image_path, is_recognized, bbox, verified, observed_at, created_at, species:species_id ( id, common_name, scientific_name, total_sightings, first_seen_at )"
    )
    .order("observed_at", { ascending: false })
    .limit(limit);

  if (imagesOnly) {
    query = query
      .eq("is_recognized", true)
      .not("image_url", "is", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ObservationWithSpecies[];
}

async function fetchSpecies(): Promise<SpeciesRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("species")
    .select("*")
    .order("total_sightings", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMoments(): Promise<Moment[]> {
  const rows = await fetchObservations(6, true);
  return rows.map(observationToMoment);
}

export async function getRecordings(): Promise<Recording[]> {
  const rows = await fetchObservations(6, true);
  return rows.map(observationToRecording);
}

export async function getMotionEvents(): Promise<MotionEvent[]> {
  const rows = await fetchObservations(6);
  return rows.map(observationToMotionEvent);
}

export async function getNotifications(): Promise<AppNotification[]> {
  const rows = await fetchObservations(20);
  return rows.map(observationToNotification);
}

export async function getStats(): Promise<DailyStats> {
  const supabase = getSupabase();
  if (!supabase) {
    return { birdsToday: 0, eggsLaid: 0, speciesSeen: 0, totalVisits: 0 };
  }

  const dayStart = startOfLocalDay().toISOString();

  const [todayRes, speciesRes, totalRes] = await Promise.all([
    supabase
      .from("observations")
      .select("id", { count: "exact", head: true })
      .gte("observed_at", dayStart),
    supabase.from("species").select("id", { count: "exact", head: true }),
    supabase.from("observations").select("id", { count: "exact", head: true }),
  ]);

  if (todayRes.error) throw todayRes.error;
  if (speciesRes.error) throw speciesRes.error;
  if (totalRes.error) throw totalRes.error;

  return {
    birdsToday: todayRes.count ?? 0,
    eggsLaid: 0,
    speciesSeen: speciesRes.count ?? 0,
    totalVisits: totalRes.count ?? 0,
  };
}

export async function getWeeklyVisits(): Promise<WeeklyVisit[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const start = startOfLocalDay();
  start.setDate(start.getDate() - 6);

  const { data, error } = await supabase
    .from("observations")
    .select("observed_at")
    .gte("observed_at", start.toISOString())
    .order("observed_at", { ascending: true });

  if (error) throw error;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  const counts = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    counts.set(days[d.getDay()], 0);
  }

  for (const row of data ?? []) {
    const d = new Date(row.observed_at);
    const key = days[d.getDay()];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const ordered: WeeklyVisit[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const day = days[d.getDay()];
    ordered.push({ day, visits: counts.get(day) ?? 0 });
  }
  return ordered;
}

export async function getHourlyVisits(): Promise<HourlyVisit[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const dayStart = startOfLocalDay().toISOString();
  const { data, error } = await supabase
    .from("observations")
    .select("observed_at")
    .gte("observed_at", dayStart);

  if (error) throw error;

  const buckets: { hour: string; hourNum: number; visits: number }[] = [
    { hour: "6a", hourNum: 6, visits: 0 },
    { hour: "8a", hourNum: 8, visits: 0 },
    { hour: "10a", hourNum: 10, visits: 0 },
    { hour: "12p", hourNum: 12, visits: 0 },
    { hour: "2p", hourNum: 14, visits: 0 },
    { hour: "4p", hourNum: 16, visits: 0 },
    { hour: "6p", hourNum: 18, visits: 0 },
  ];

  for (const row of data ?? []) {
    const h = new Date(row.observed_at).getHours();
    // Snap into nearest displayed bucket (2-hour windows centered on labels).
    let best = buckets[0];
    let bestDist = Infinity;
    for (const b of buckets) {
      const dist = Math.abs(h - b.hourNum);
      if (dist < bestDist) {
        bestDist = dist;
        best = b;
      }
    }
    best.visits += 1;
  }

  return buckets.map(({ hour, visits }) => ({ hour, visits }));
}

export async function getVisitorShare(): Promise<VisitorShare[]> {
  const species = await fetchSpecies();
  if (species.length === 0) return [];

  const top = species.slice(0, 4);
  const allTotal =
    species.reduce((s, r) => s + (r.total_sightings || 0), 0) || 1;

  const shares: VisitorShare[] = top.map((s, i) => ({
    label: s.common_name,
    value: Math.round(((s.total_sightings || 0) / allTotal) * 100),
    color: VISITOR_COLORS[i % VISITOR_COLORS.length],
  }));

  const used = shares.reduce((s, r) => s + r.value, 0);
  if (species.length > 4 && used < 100) {
    shares.push({
      label: "Other",
      value: Math.max(0, 100 - used),
      color: VISITOR_COLORS[4 % VISITOR_COLORS.length],
    });
  } else if (used !== 100 && shares.length > 0) {
    shares[0].value += 100 - used;
  }

  return shares;
}

export interface SpeciesGalleryItem {
  id: string;
  commonName: string;
  scientificName: string | null;
  totalSightings: number;
  firstSeenAt: string | null;
  coverImageUrl: string | null;
  recentImages: string[];
}

export async function getSpeciesGallery(): Promise<SpeciesGalleryItem[]> {
  const [species, observations] = await Promise.all([
    fetchSpecies(),
    fetchObservations(6, true),
  ]);

  return species.map((s) => {
    const photos = observations
      .filter((o) => o.species_id === s.id)
      .map((o) => o.image_url)
      .filter((url): url is string => url !== null);
    return {
      id: s.id,
      commonName: s.common_name,
      scientificName: s.scientific_name,
      totalSightings: s.total_sightings,
      firstSeenAt: s.first_seen_at,
      coverImageUrl: photos[0] ?? null,
      recentImages: photos.slice(0, 6),
    };
  });
}

export { isSupabaseConfigured, fetchObservations };
