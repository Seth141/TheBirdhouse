import type { CameraSource, CameraSourceConfig } from "./types";
import { MockCameraSource } from "./providers/mockCameraSource";
import { HlsCameraSource } from "./providers/hlsCameraSource";
import { MjpegCameraSource } from "./providers/mjpegCameraSource";

/**
 * Factory for the active camera implementation. This is the only place in
 * the app that knows every protocol exists — everything else consumes the
 * `CameraSource` interface.
 */
export function createCameraSource(config: CameraSourceConfig): CameraSource {
  switch (config.protocol) {
    case "hls":
      return new HlsCameraSource(config);
    case "mjpeg":
      return new MjpegCameraSource(config);
    case "rtsp-proxy":
      // Wyze RTSP should be republished as HLS (wyze-bridge :8888). Point
      // `streamUrl` at the `.m3u8` and prefer protocol "hls".
      return new HlsCameraSource(config);
    case "mock":
    default:
      return new MockCameraSource(config);
  }
}

function resolveProtocol(): CameraSourceConfig["protocol"] {
  const raw = process.env.NEXT_PUBLIC_CAMERA_PROTOCOL as
    | CameraSourceConfig["protocol"]
    | undefined;
  if (raw === "hls" || raw === "mjpeg" || raw === "rtsp-proxy" || raw === "mock") {
    return raw;
  }
  // Auto-select HLS when a stream URL is present but protocol is unset.
  if (process.env.NEXT_PUBLIC_CAMERA_STREAM_URL) return "hls";
  return "mock";
}

/** Default camera — swap via env vars once wyze-bridge HLS is public. */
export const birdhouseCameraConfig: CameraSourceConfig = {
  id: "birdhouse-main",
  name: "Birdhouse Cam",
  protocol: resolveProtocol(),
  streamUrl: process.env.NEXT_PUBLIC_CAMERA_STREAM_URL,
  snapshotUrl:
    process.env.NEXT_PUBLIC_CAMERA_SNAPSHOT_URL ?? "/artwork/nests/nest-eggs.png",
  // Prefer same-origin /api/camera proxy (no client credentials).
  // Direct upstream + these vars still works if you point STREAM_URL at Railway.
  streamUser: process.env.NEXT_PUBLIC_CAMERA_STREAM_USER,
  streamPassword: process.env.NEXT_PUBLIC_CAMERA_STREAM_PASSWORD,
};
