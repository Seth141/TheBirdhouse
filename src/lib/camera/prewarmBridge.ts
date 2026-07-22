import { isCameraSleeping } from "@/lib/camera/sleepSchedule";

/** Fire-and-forget wake so the bridge starts before /live-camera mounts. */
export function prewarmCameraBridge(): void {
  if (typeof window === "undefined") return;
  // Overnight: never poke Railway — keeps the sleep window from waking spend.
  if (isCameraSleeping()) return;
  void fetch("/api/bridge/wake", {
    method: "POST",
    cache: "no-store",
    keepalive: true,
  }).catch(() => undefined);
}
