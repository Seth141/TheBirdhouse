"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mockHourlyVisits,
  mockMoments,
  mockMotionEvents,
  mockNotifications,
  mockRecordings,
  mockStats,
  mockVisitorShare,
  mockWeeklyVisits,
  type NatureTip,
} from "./mockData";
import {
  getHourlyVisits,
  getMoments,
  getMotionEvents,
  getNotifications,
  getRecordings,
  getSpeciesGallery,
  getStats,
  getVisitorShare,
  getWeeklyVisits,
  isSupabaseConfigured,
  type SpeciesGalleryItem,
} from "./supabaseData";
import { getSupabase } from "@/lib/supabase/client";

const simulateNetwork = <T,>(data: T, delay = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

const useLive = isSupabaseConfigured();

/** Invalidate observation-derived queries when Realtime inserts arrive. */
export function useObservationsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!useLive) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("observations-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "observations" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["stats"] });
          void queryClient.invalidateQueries({ queryKey: ["moments"] });
          void queryClient.invalidateQueries({ queryKey: ["recordings"] });
          void queryClient.invalidateQueries({ queryKey: ["motion-events"] });
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });
          void queryClient.invalidateQueries({ queryKey: ["weekly-visits"] });
          void queryClient.invalidateQueries({ queryKey: ["hourly-visits"] });
          void queryClient.invalidateQueries({ queryKey: ["visitor-share"] });
          void queryClient.invalidateQueries({ queryKey: ["species"] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useStats() {
  return useQuery({
    queryKey: ["stats", useLive ? "live" : "mock"],
    queryFn: () => (useLive ? getStats() : simulateNetwork(mockStats)),
  });
}

export function useMoments() {
  return useQuery({
    queryKey: ["moments", useLive ? "live" : "mock"],
    queryFn: () => (useLive ? getMoments() : simulateNetwork(mockMoments)),
  });
}

export function useRecordings() {
  return useQuery({
    queryKey: ["recordings", useLive ? "live" : "mock"],
    queryFn: () => (useLive ? getRecordings() : simulateNetwork(mockRecordings)),
  });
}

export function useMotionEvents() {
  return useQuery({
    queryKey: ["motion-events", useLive ? "live" : "mock"],
    queryFn: () =>
      useLive ? getMotionEvents() : simulateNetwork(mockMotionEvents),
  });
}

/** Fresh OpenAI tip on every call — used if anything still imports this hook. */
export function useNatureTip() {
  return useQuery({
    queryKey: ["tip", "openai"],
    queryFn: async (): Promise<NatureTip> => {
      const res = await fetch(`/api/tip?t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok) throw new Error("Could not load tip");
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useWeeklyVisits() {
  return useQuery({
    queryKey: ["weekly-visits", useLive ? "live" : "mock"],
    queryFn: () =>
      useLive ? getWeeklyVisits() : simulateNetwork(mockWeeklyVisits),
  });
}

export function useHourlyVisits() {
  return useQuery({
    queryKey: ["hourly-visits", useLive ? "live" : "mock"],
    queryFn: () =>
      useLive ? getHourlyVisits() : simulateNetwork(mockHourlyVisits),
  });
}

export function useVisitorShare() {
  return useQuery({
    queryKey: ["visitor-share", useLive ? "live" : "mock"],
    queryFn: () =>
      useLive ? getVisitorShare() : simulateNetwork(mockVisitorShare),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications", useLive ? "live" : "mock"],
    queryFn: () =>
      useLive ? getNotifications() : simulateNetwork(mockNotifications),
  });
}

export function useSpeciesGallery() {
  return useQuery({
    queryKey: ["species", useLive ? "live" : "mock"],
    queryFn: async (): Promise<SpeciesGalleryItem[]> => {
      if (!useLive) {
        // Derive a lightweight mock species list from moments.
        const byTitle = new Map<string, SpeciesGalleryItem>();
        for (const m of mockMoments) {
          const existing = byTitle.get(m.title);
          if (existing) {
            existing.totalSightings += 1;
            existing.recentImages.push(m.imageSrc);
          } else {
            byTitle.set(m.title, {
              id: m.id,
              commonName: m.title,
              scientificName: null,
              totalSightings: 1,
              firstSeenAt: m.timestamp,
              coverImageUrl: m.imageSrc,
              recentImages: [m.imageSrc],
            });
          }
        }
        return simulateNetwork([...byTitle.values()]);
      }
      return getSpeciesGallery();
    },
  });
}
