import type {
  CameraConnectionStatus,
  CameraMediaElement,
  CameraSnapshot,
  CameraSource,
  CameraSourceConfig,
  CameraStatusListener,
} from "../types";

/**
 * HLS.js-backed live stream for a Wyze Cam V3 exposed through wyze-bridge
 * (or go2rtc / MediaMTX) as `.m3u8`.
 *
 * Auth: when wyze-bridge has WB_AUTH enabled, set streamUser / streamPassword
 * (typically user `wb` + WB_API key). Credentials are applied via Basic auth
 * for hls.js XHR and via a credentialed URL for Safari native HLS.
 */
export class HlsCameraSource implements CameraSource {
  readonly config: CameraSourceConfig;
  private status: CameraConnectionStatus = "idle";
  private listeners = new Set<CameraStatusListener>();
  private videoEl: HTMLVideoElement | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hls: any = null;
  private nativeHandlers: {
    onMeta: () => void;
    onError: () => void;
    onPlaying: () => void;
  } | null = null;

  constructor(config: CameraSourceConfig) {
    this.config = config;
  }

  private setStatus(status: CameraConnectionStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  private streamUrlWithCredentials(): string {
    const url = this.config.streamUrl ?? "";
    const user = this.config.streamUser;
    const pass = this.config.streamPassword;
    if (!user || !pass || !url) return url;
    try {
      const parsed = new URL(url);
      parsed.username = user;
      parsed.password = pass;
      return parsed.toString();
    } catch {
      return url;
    }
  }

  private basicAuthHeader(): string | null {
    const user = this.config.streamUser;
    const pass = this.config.streamPassword;
    if (!user || !pass) return null;
    if (typeof btoa === "undefined") return null;
    return `Basic ${btoa(`${user}:${pass}`)}`;
  }

  async attach(media: CameraMediaElement | null): Promise<void> {
    if (!media || !(media instanceof HTMLVideoElement) || !this.config.streamUrl) {
      this.setStatus("error");
      return;
    }

    this.detachMediaOnly();
    this.videoEl = media;
    media.muted = true;
    media.playsInline = true;
    media.setAttribute("playsinline", "");
    media.setAttribute("webkit-playsinline", "");
    media.autoplay = true;
    this.setStatus("connecting");

    const playUrl = this.streamUrlWithCredentials();

    try {
      const canPlayNative = media.canPlayType("application/vnd.apple.mpegurl");
      if (canPlayNative) {
        const onMeta = () => this.setStatus("live");
        const onPlaying = () => this.setStatus("live");
        const onError = () => this.setStatus("error");
        this.nativeHandlers = { onMeta, onError, onPlaying };
        media.addEventListener("loadedmetadata", onMeta);
        media.addEventListener("playing", onPlaying);
        media.addEventListener("error", onError);
        media.src = playUrl;
        media.play().catch(() => undefined);
        return;
      }

      const { default: Hls } = await import("hls.js");
      if (!Hls.isSupported()) {
        this.setStatus("error");
        return;
      }

      const auth = this.basicAuthHeader();
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: auth
          ? (xhr: XMLHttpRequest) => {
              xhr.setRequestHeader("Authorization", auth);
            }
          : undefined,
      });
      this.hls.loadSource(this.config.streamUrl);
      this.hls.attachMedia(media);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.setStatus("live");
        media.play().catch(() => undefined);
      });
      this.hls.on(
        Hls.Events.ERROR,
        (
          _event: unknown,
          data: {
            fatal?: boolean;
            type?: string;
          }
        ) => {
          if (!data?.fatal || !this.hls) return;

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            this.hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            this.hls.recoverMediaError();
            return;
          }
          this.setStatus("error");
        }
      );
    } catch {
      this.setStatus("error");
    }
  }

  private detachMediaOnly(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.videoEl && this.nativeHandlers) {
      this.videoEl.removeEventListener("loadedmetadata", this.nativeHandlers.onMeta);
      this.videoEl.removeEventListener("playing", this.nativeHandlers.onPlaying);
      this.videoEl.removeEventListener("error", this.nativeHandlers.onError);
      this.nativeHandlers = null;
    }
    if (this.videoEl) {
      this.videoEl.removeAttribute("src");
      this.videoEl.load();
      this.videoEl = null;
    }
  }

  detach(): void {
    this.detachMediaOnly();
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
    if (this.videoEl && this.videoEl.videoWidth > 0) {
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
