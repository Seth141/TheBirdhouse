"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { CameraPlayer } from "@/components/camera/CameraPlayer";
import { CameraStatusBadge } from "@/components/camera/CameraStatusBadge";
import { MomentLightbox } from "@/components/home/MomentLightbox";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import { prewarmCameraBridge } from "@/lib/camera/prewarmBridge";
import { isCameraSleeping } from "@/lib/camera/sleepSchedule";
import type {
  CameraConnectionStatus,
  CameraSnapshot,
  MotionEvent,
} from "@/lib/camera/types";
import { useMotionEvents } from "@/lib/query/hooks";
import { useAppStore } from "@/lib/store/useAppStore";
import { DownloadIcon, ShareIcon, NestIcon } from "@/components/icons";
import { LoadingFeather } from "@/components/motion/LoadingFeather";
import { CameraSleepingState } from "@/components/camera/CameraSleepingState";

type BridgePhase =
  | "ready"
  | "starting"
  | "stopped"
  | "unknown"
  | "unconfigured";

export default function LiveCameraPage() {
  const [status, setStatus] = useState<CameraConnectionStatus>("idle");
  const [bridgePhase, setBridgePhase] = useState<BridgePhase>("starting");
  const [bridgeMessage, setBridgeMessage] = useState("Waking camera…");
  const [controlConfigured, setControlConfigured] = useState(true);
  const [sleeping, setSleeping] = useState(() => isCameraSleeping());
  const [selectedEvent, setSelectedEvent] = useState<MotionEvent | null>(null);
  const captureRef = useRef<(() => Promise<CameraSnapshot>) | null>(null);
  const pushToast = useAppStore((s) => s.pushToast);
  const setSnapshotHandler = useAppStore((s) => s.setSnapshotHandler);
  const { data: motionEvents, isLoading } = useMotionEvents();
  const closeEventPreview = useCallback(() => setSelectedEvent(null), []);

  const handleStatus = useCallback((next: CameraConnectionStatus) => {
    setStatus(next);
  }, []);

  const refreshBridge = useCallback(async (kickWake: boolean) => {
    if (isCameraSleeping()) {
      setSleeping(true);
      setBridgePhase("stopped");
      setBridgeMessage(
        "The birds and camera are sleeping. Check back tomorrow starting 5:00 AM PST."
      );
      return;
    }
    setSleeping(false);

    try {
      if (kickWake) {
        const wakeRes = await fetch("/api/bridge/wake", {
          method: "POST",
          cache: "no-store",
        });
        const wake = (await wakeRes.json()) as {
          phase?: BridgePhase;
          message?: string;
          controlConfigured?: boolean;
        };
        setBridgePhase(wake.phase ?? "starting");
        setBridgeMessage(wake.message ?? "Waking camera…");
        if (typeof wake.controlConfigured === "boolean") {
          setControlConfigured(wake.controlConfigured);
        }
        if (wake.phase === "ready") return;
      }

      const res = await fetch("/api/bridge/status", { cache: "no-store" });
      const data = (await res.json()) as {
        phase?: BridgePhase;
        message?: string;
        controlConfigured?: boolean;
        sleeping?: boolean;
      };
      if (data.sleeping) {
        setSleeping(true);
        setBridgePhase("stopped");
        setBridgeMessage(
          data.message ??
            "The birds and camera are sleeping. Check back tomorrow starting 5:00 AM PST."
        );
        return;
      }
      setBridgePhase(data.phase ?? "unknown");
      setBridgeMessage(data.message ?? "Connecting…");
      if (typeof data.controlConfigured === "boolean") {
        setControlConfigured(data.controlConfigured);
      }
    } catch {
      setBridgePhase("unknown");
      setBridgeMessage("Still connecting…");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollId: number | undefined;

    const stopPolling = () => {
      if (pollId != null) {
        window.clearInterval(pollId);
        pollId = undefined;
      }
    };

    const startDaytimePolling = () => {
      if (cancelled || pollId != null) return;
      prewarmCameraBridge();
      void refreshBridge(true);
      pollId = window.setInterval(() => {
        if (!cancelled && !isCameraSleeping()) {
          void refreshBridge(false);
        }
      }, 2500);
    };

    const syncSleep = () => {
      const asleep = isCameraSleeping();
      setSleeping(asleep);
      if (asleep) {
        setBridgePhase("stopped");
        setBridgeMessage(
          "The birds and camera are sleeping. Check back tomorrow starting 5:00 AM PST."
        );
        stopPolling();
        // Ask the server to shut Railway down if it is still up.
        void fetch("/api/bridge/status", { cache: "no-store" }).catch(
          () => undefined
        );
        return;
      }
      startDaytimePolling();
    };

    syncSleep();
    const sleepId = window.setInterval(syncSleep, 30_000);

    return () => {
      cancelled = true;
      stopPolling();
      window.clearInterval(sleepId);
    };
  }, [refreshBridge]);

  useEffect(() => {
    setSnapshotHandler(async () => {
      if (!captureRef.current) {
        pushToast("Open Live Cam to capture a snapshot.");
        return;
      }
      await captureRef.current();
      pushToast("Snapshot saved to your gallery.");
    });
    return () => setSnapshotHandler(null);
  }, [pushToast, setSnapshotHandler]);

  const handleSnapshot = async () => {
    if (!captureRef.current) {
      pushToast("Camera is still connecting…");
      return;
    }
    await captureRef.current();
    pushToast("Snapshot saved to your gallery.");
  };

  // Overnight sleep always wins — never mount HLS or spend Railway hours.
  const showSleeping = sleeping;
  const showPlayer =
    !showSleeping &&
    (birdhouseCameraConfig.protocol === "mock" || bridgePhase === "ready");

  const waitingCopy = !controlConfigured
    ? "On-demand wake isn’t configured yet. Start wyze-bridge in Railway, or add RAILWAY_API_TOKEN + service/environment IDs on Vercel."
    : bridgeMessage;

  return (
    <AppShell title="Live Camera" subtitle="Watching your birdhouse">
      <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:space-y-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
        <FadeIn>
          <GlassCard padding="sm" className="lg:p-4">
            {showSleeping ? (
              <div className="wood-frame">
                <div className="wood-frame-inner relative aspect-[3/4] overflow-hidden bg-[#1A2433] lg:aspect-video">
                  <CameraSleepingState />
                </div>
              </div>
            ) : showPlayer ? (
              <CameraPlayer
                config={birdhouseCameraConfig}
                variant="full"
                onStatusChange={handleStatus}
                captureRef={captureRef}
              />
            ) : (
              <div className="wood-frame">
                <div className="wood-frame-inner relative flex aspect-[3/4] flex-col items-center justify-center gap-5 bg-[#EEF6FB] px-6 text-center lg:aspect-video">
                  <LoadingFeather
                    label={
                      bridgePhase === "unconfigured"
                        ? "Camera bridge is offline"
                        : waitingCopy
                    }
                  />
                  <button
                    type="button"
                    onClick={() => void refreshBridge(true)}
                    className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#4F545A] transition-colors hover:bg-white/90"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between px-1 pt-3 lg:pt-4">
              <div className="flex items-center gap-2">
                <CameraStatusBadge
                  status={
                    showPlayer
                      ? status
                      : bridgePhase === "starting"
                        ? "connecting"
                        : "offline"
                  }
                />
                <span className="text-xs text-[#8A8F94] lg:text-sm">
                  Wyze Cam V3 · Birdhouse
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSnapshot}
                  aria-label="Capture snapshot"
                  className="glass-card flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
                >
                  <DownloadIcon size={18} wash="sage" />
                </button>
                <button
                  type="button"
                  onClick={() => pushToast("Sharing is coming soon.")}
                  aria-label="Share live view"
                  className="glass-card flex h-9 w-9 items-center justify-center lg:h-10 lg:w-10"
                >
                  <ShareIcon size={18} wash="dustyBlue" />
                </button>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h2 className="font-heading mb-3 px-1 text-lg font-medium text-[#4F545A] lg:mb-4 lg:text-2xl">
            Motion Events
          </h2>
          {isLoading ? (
            <LoadingFeather />
          ) : motionEvents && motionEvents.length > 0 ? (
            <ul className="space-y-2 lg:space-y-3">
              {motionEvents.map((event) => (
                <li key={event.id}>
                  <GlassCard
                    padding="sm"
                    className="flex items-center gap-3 lg:gap-4 lg:p-4"
                  >
                    <button
                      type="button"
                      aria-label={`Enlarge ${event.label}`}
                      onClick={() => setSelectedEvent(event)}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#D6E1D5] ring-1 ring-white/70 lg:h-20 lg:w-20"
                    >
                      <Image
                        src={event.thumbnailSrc}
                        alt={event.label}
                        fill
                        sizes="(min-width: 1024px) 80px, 64px"
                        className="object-cover saturate-125"
                      />
                    </button>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#4F545A] lg:text-base">
                        {event.label}
                      </span>
                      <span className="block text-xs text-[#8A8F94] lg:mt-0.5 lg:text-sm">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </GlassCard>
                </li>
              ))}
            </ul>
          ) : (
            <GlassCard
              padding="lg"
              className="flex flex-col items-center gap-3 text-center lg:py-12"
            >
              <NestIcon size={40} wash="sage" />
              <p className="font-heading text-base font-medium text-[#4F545A] lg:text-lg">
                The nest is quiet
              </p>
              <p className="max-w-[240px] text-sm leading-relaxed text-[#8A8F94] lg:text-base">
                No motion yet today. Soft blossoms wait with you.
              </p>
            </GlassCard>
          )}
        </FadeIn>
      </div>
      {selectedEvent ? (
        <MomentLightbox
          moment={{
            id: selectedEvent.id,
            title: selectedEvent.label,
            subtitle: new Date(selectedEvent.timestamp).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            imageSrc: selectedEvent.thumbnailSrc,
            timestamp: selectedEvent.timestamp,
          }}
          open
          onClose={closeEventPreview}
        />
      ) : null}
    </AppShell>
  );
}
