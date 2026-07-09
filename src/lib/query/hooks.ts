"use client";

import { useQuery } from "@tanstack/react-query";
import {
  mockHourlyVisits,
  mockMoments,
  mockMotionEvents,
  mockNotifications,
  mockRecordings,
  mockStats,
  mockTip,
  mockVisitorShare,
  mockWeeklyVisits,
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

export function useNatureTip() {
  return useQuery({
    queryKey: ["tip"],
    queryFn: () => simulateNetwork(mockTip),
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
