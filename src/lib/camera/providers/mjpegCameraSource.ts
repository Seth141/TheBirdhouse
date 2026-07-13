import type {
  CameraConnectionStatus,
  CameraMediaElement,
  CameraSnapshot,
  CameraSource,
  CameraSourceConfig,
  CameraStatusListener,
} from "../types";

/**
 * MJPEG sources are a long-lived `<img>` request (`multipart/x-mixed-replace`).
 * `CameraPlayer` mounts an `<img>` and passes it to `attach`.
 */
export class MjpegCameraSource implements CameraSource {
  readonly config: CameraSourceConfig;
  private status: CameraConnectionStatus = "idle";
  private listeners = new Set<CameraStatusListener>();
  private img: HTMLImageElement | null = null;

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

  attach(media: CameraMediaElement | null): void {
    if (!media || !(media instanceof HTMLImageElement) || !this.config.streamUrl) {
      this.setStatus("error");
      return;
    }

    this.clearImage();
    this.img = media;
    this.setStatus("connecting");

    media.onload = () => this.setStatus("live");
    media.onerror = () => this.setStatus("error");
    media.src = this.streamUrlWithCredentials();
  }

  private clearImage(): void {
    if (this.img) {
      this.img.onload = null;
      this.img.onerror = null;
      this.img.removeAttribute("src");
      this.img = null;
    }
  }

  detach(): void {
    this.clearImage();
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
    return {
      id: `snap-${Date.now()}`,
      capturedAt: new Date().toISOString(),
      imageSrc: this.config.snapshotUrl ?? this.config.streamUrl ?? "",
    };
  }
}
