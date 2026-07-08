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
      // A Wyze Cam V3's RTSP feed should be republished as HLS by a proxy
      // (go2rtc / RTSPtoWeb / MediaMTX). Once that endpoint exists, point
      // `streamUrl` at the generated `.m3u8` and switch protocol to "hls".
      return new HlsCameraSource(config);
    case "mock":
    default:
      return new MockCameraSource(config);
  }
}

/** Default camera — swap via env vars once the Wyze Cam V3 proxy is live. */
export const birdhouseCameraConfig: CameraSourceConfig = {
  id: "birdhouse-main",
  name: "Birdhouse Cam",
  protocol:
    (process.env.NEXT_PUBLIC_CAMERA_PROTOCOL as CameraSourceConfig["protocol"]) ??
    "mock",
  streamUrl: process.env.NEXT_PUBLIC_CAMERA_STREAM_URL,
  snapshotUrl: "/artwork/nests/nest-eggs.png",
};
