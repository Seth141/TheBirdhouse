/**
 * Camera abstraction layer.
 *
 * The UI never talks to a specific camera implementation directly — it only
 * ever depends on the `CameraSource` interface below. This lets us swap a
 * Wyze Cam V3 HLS/RTSP proxy, an MJPEG bridge, or a local mock in and out
 * without touching a single component.
 */

export type StreamProtocol = "hls" | "mjpeg" | "rtsp-proxy" | "mock";

export type CameraConnectionStatus =
  | "idle"
  | "connecting"
  | "live"
  | "offline"
  | "error";

export interface CameraSourceConfig {
  id: string;
  name: string;
  protocol: StreamProtocol;
  /** Stream URL — .m3u8 for HLS, http snapshot loop for MJPEG, etc. */
  streamUrl?: string;
  /** Still-frame endpoint used for snapshot capture / poster art. */
  snapshotUrl?: string;
}

export interface MotionEvent {
  id: string;
  timestamp: string;
  label: string;
  thumbnailSrc: string;
}

export interface Recording {
  id: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
  thumbnailSrc: string;
  videoUrl?: string;
}

export interface CameraSnapshot {
  id: string;
  capturedAt: string;
  imageSrc: string;
}

export type CameraStatusListener = (status: CameraConnectionStatus) => void;

/**
 * Every concrete stream implementation (HLS, MJPEG, RTSP-via-proxy, or the
 * local mock used for design/demo purposes) implements this contract.
 */
export interface CameraSource {
  readonly config: CameraSourceConfig;
  attach(video: HTMLVideoElement | null): Promise<void> | void;
  detach(): void;
  getStatus(): CameraConnectionStatus;
  onStatusChange(listener: CameraStatusListener): () => void;
  captureSnapshot(): Promise<CameraSnapshot>;
}
