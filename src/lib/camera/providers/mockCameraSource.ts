import type {
  CameraConnectionStatus,
  CameraSnapshot,
  CameraSource,
  CameraSourceConfig,
  CameraStatusListener,
} from "../types";

/**
 * A gentle, deterministic "camera" used whenever no real stream URL is
 * configured (local development, design review, or while a Wyze Cam V3
 * proxy is being provisioned). It simulates the connecting → live
 * lifecycle so the surrounding UI can be built and tested against real
 * state transitions without a physical camera attached.
 */
export class MockCameraSource implements CameraSource {
  readonly config: CameraSourceConfig;
  private status: CameraConnectionStatus = "idle";
  private listeners = new Set<CameraStatusListener>();
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: CameraSourceConfig) {
    this.config = config;
  }

  private setStatus(status: CameraConnectionStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  attach(): void {
    this.setStatus("connecting");
    this.connectTimer = setTimeout(() => {
      this.setStatus("live");
    }, 1400);
  }

  detach(): void {
    if (this.connectTimer) clearTimeout(this.connectTimer);
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
      imageSrc: this.config.snapshotUrl ?? "/artwork/nests/nest-eggs.png",
    };
  }
}
