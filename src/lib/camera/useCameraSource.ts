"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createCameraSource } from "./createCameraSource";
import type {
  CameraConnectionStatus,
  CameraMediaElement,
  CameraSnapshot,
  CameraSource,
  CameraSourceConfig,
} from "./types";

/**
 * Mounts a `CameraSource` for the lifetime of the calling component,
 * exposing connection status and a callback ref to bind to a media element.
 *
 * Attach runs when the media element is set (not only on mount) so HLS/MJPEG
 * can bind even when the player mounts the element after the first paint.
 */
export function useCameraSource(config: CameraSourceConfig) {
  const [status, setStatus] = useState<CameraConnectionStatus>("idle");
  const [mediaEl, setMediaEl] = useState<CameraMediaElement | null>(null);
  const sourceRef = useRef<CameraSource | null>(null);
  const configKey = `${config.id}|${config.protocol}|${config.streamUrl ?? ""}|${config.streamUser ?? ""}|${config.streamPassword ?? ""}`;

  // Recreate the source when stream identity changes.
  useEffect(() => {
    sourceRef.current?.detach();
    const source = createCameraSource(config);
    sourceRef.current = source;
    const unsubscribe = source.onStatusChange(setStatus);
    // Defer initial status so we don't sync-setState inside the effect body.
    queueMicrotask(() => setStatus(source.getStatus()));
    return () => {
      unsubscribe();
      source.detach();
      sourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identity via configKey
  }, [configKey]);

  // Bind once we have both a source and a mounted media element.
  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;

    if (config.protocol === "mock") {
      void source.attach(null);
      return;
    }

    if (!mediaEl) return;
    void source.attach(mediaEl);
  }, [mediaEl, configKey, config.protocol]);

  const mediaRef = useCallback((node: CameraMediaElement | null) => {
    setMediaEl(node);
  }, []);

  const captureSnapshot = useCallback((): Promise<CameraSnapshot> => {
    if (!sourceRef.current) {
      return Promise.resolve({
        id: `snap-${Date.now()}`,
        capturedAt: new Date().toISOString(),
        imageSrc: config.snapshotUrl ?? "",
      });
    }
    return sourceRef.current.captureSnapshot();
  }, [config.snapshotUrl]);

  return { status, mediaRef, captureSnapshot };
}
