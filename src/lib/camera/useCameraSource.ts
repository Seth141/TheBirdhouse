"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createCameraSource } from "./createCameraSource";
import type {
  CameraConnectionStatus,
  CameraSnapshot,
  CameraSourceConfig,
} from "./types";

/**
 * Mounts a `CameraSource` for the lifetime of the calling component,
 * exposing connection status and a ref to bind to a `<video>` element.
 */
export function useCameraSource(config: CameraSourceConfig) {
  const [status, setStatus] = useState<CameraConnectionStatus>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceRef = useRef(createCameraSource(config));

  useEffect(() => {
    const source = sourceRef.current;
    const unsubscribe = source.onStatusChange(setStatus);
    source.attach(videoRef.current);
    return () => {
      unsubscribe();
      source.detach();
    };
  }, [config.id, config.protocol, config.streamUrl]);

  const captureSnapshot = useCallback((): Promise<CameraSnapshot> => {
    return sourceRef.current.captureSnapshot();
  }, []);

  return { status, videoRef, captureSnapshot };
}
