"use client";

import { useQuery } from "@tanstack/react-query";
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

const simulateNetwork = <T,>(data: T, delay = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => simulateNetwork(mockStats),
  });
}

export function useMoments() {
  return useQuery({
    queryKey: ["moments"],
    queryFn: () => simulateNetwork(mockMoments),
  });
}

export function useRecordings() {
  return useQuery({
    queryKey: ["recordings"],
    queryFn: () => simulateNetwork(mockRecordings),
  });
}

export function useMotionEvents() {
  return useQuery({
    queryKey: ["motion-events"],
    queryFn: () => simulateNetwork(mockMotionEvents),
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
    queryKey: ["weekly-visits"],
    queryFn: () => simulateNetwork(mockWeeklyVisits),
  });
}

export function useHourlyVisits() {
  return useQuery({
    queryKey: ["hourly-visits"],
    queryFn: () => simulateNetwork(mockHourlyVisits),
  });
}

export function useVisitorShare() {
  return useQuery({
    queryKey: ["visitor-share"],
    queryFn: () => simulateNetwork(mockVisitorShare),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => simulateNetwork(mockNotifications),
  });
}
