/** Fire-and-forget wake so the bridge starts before /live-camera mounts. */
export function prewarmCameraBridge(): void {
  if (typeof window === "undefined") return;
  void fetch("/api/bridge/wake", {
    method: "POST",
    cache: "no-store",
    keepalive: true,
  }).catch(() => undefined);
}
