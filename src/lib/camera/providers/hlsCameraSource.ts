import type {
  CameraConnectionStatus,
  CameraSnapshot,
  CameraSource,
  CameraSourceConfig,
  CameraStatusListener,
} from "../types";

/**
 * HLS.js-backed live stream, intended for a Wyze Cam V3 exposed through an
 * HLS-producing proxy (e.g. RTSPtoWeb, go2rtc, or a custom bridge that
 * republishes the camera's RTSP feed as `.m3u8`).
 *
 * Kept isolated behind the `CameraSource` interface so `CameraPlayer` never
 * needs to know hls.js exists.
 */
export class HlsCameraSource implements CameraSource {
  readonly config: CameraSourceConfig;
  private status: CameraConnectionStatus = "idle";
  private listeners = new Set<CameraStatusListener>();
  private videoEl: HTMLVideoElement | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hls: any = null;

  constructor(config: CameraSourceConfig) {
    this.config = config;
  }

  private setStatus(status: CameraConnectionStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  async attach(video: HTMLVideoElement | null): Promise<void> {
    if (!video || !this.config.streamUrl) {
      this.setStatus("error");
      return;
    }
    this.videoEl = video;
    this.setStatus("connecting");

    try {
      const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl");
      if (canPlayNative) {
        video.src = this.config.streamUrl;
        video.addEventListener("loadedmetadata", () => this.setStatus("live"));
        video.addEventListener("error", () => this.setStatus("error"));
        return;
      }

      const { default: Hls } = await import("hls.js");
      if (!Hls.isSupported()) {
        this.setStatus("error");
        return;
      }

      this.hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      this.hls.loadSource(this.config.streamUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.setStatus("live");
        video.play().catch(() => undefined);
      });
      this.hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean }) => {
        if (data?.fatal) this.setStatus("error");
      });
    } catch {
      this.setStatus("error");
    }
  }

  detach(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.videoEl) {
      this.videoEl.removeAttribute("src");
      this.videoEl.load();
      this.videoEl = null;
    }
    this.setStatus("idle");
  }

  getStatus(): CameraConnectionStatus {
    return this.status;
  }

  onStatusChange(listener: CameraStatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async captureSnapshot(): Promise<CameraSnapshot> {
    if (this.videoEl) {
      const canvas = document.createElement("canvas");
      canvas.width = this.videoEl.videoWidth || 640;
      canvas.height = this.videoEl.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
        return {
          id: `snap-${Date.now()}`,
          capturedAt: new Date().toISOString(),
          imageSrc: canvas.toDataURL("image/png"),
        };
      }
    }
    return {
      id: `snap-${Date.now()}`,
      capturedAt: new Date().toISOString(),
      imageSrc: this.config.snapshotUrl ?? "",
    };
  }
}
