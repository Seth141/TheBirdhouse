import type {
  CameraConnectionStatus,
  CameraSnapshot,
  CameraSource,
  CameraSourceConfig,
  CameraStatusListener,
} from "../types";

/**
 * MJPEG sources are typically served as a single long-lived `<img>` request
 * (`multipart/x-mixed-replace`). We drive an offscreen `<img>` and paint
 * frames onto the provided `<video>`'s poster/canvas surface via CSS,
 * since `<video>` cannot natively consume MJPEG streams in most browsers.
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

  attach(): void {
    if (!this.config.streamUrl) {
      this.setStatus("error");
      return;
    }
    this.setStatus("connecting");
    this.img = new Image();
    this.img.onload = () => this.setStatus("live");
    this.img.onerror = () => this.setStatus("error");
    this.img.src = this.config.streamUrl;
  }

  detach(): void {
    if (this.img) {
      this.img.onload = null;
      this.img.onerror = null;
      this.img.src = "";
      this.img = null;
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
    return {
      id: `snap-${Date.now()}`,
      capturedAt: new Date().toISOString(),
      imageSrc: this.config.snapshotUrl ?? this.config.streamUrl ?? "",
    };
  }

  /** Exposed for the MJPEG-specific renderer to mount the live `<img>`. */
  getElement(): HTMLImageElement | null {
    return this.img;
  }
}
