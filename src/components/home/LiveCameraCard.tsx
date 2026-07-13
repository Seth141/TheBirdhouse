"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { LiveCameraIcon, ChevronRightIcon } from "@/components/icons";
import { CameraPlayer } from "@/components/camera/CameraPlayer";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import type { CameraConnectionStatus } from "@/lib/camera/types";
import { playLiveCamSound, warmSoftSounds } from "@/lib/audio/softSounds";
import { cn } from "@/lib/utils/cn";

const isMock = birdhouseCameraConfig.protocol === "mock";
const posterSrc =
  birdhouseCameraConfig.snapshotUrl ?? "/artwork/nests/nest-eggs.png";

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function LiveCameraCard() {
  const isDesktop = useIsDesktop();
  const [status, setStatus] = useState<CameraConnectionStatus>(
    isMock ? "idle" : "connecting"
  );
  const isLive = isMock ? status === "live" : status === "live" || !isDesktop;

  // Mock still needs a soft "connecting → live" for the pill; drive it lightly.
  useEffect(() => {
    if (!isMock) return;
    const start = setTimeout(() => setStatus("connecting"), 0);
    const t = setTimeout(() => setStatus("live"), 1400);
    return () => {
      clearTimeout(start);
      clearTimeout(t);
    };
  }, []);

  const handleStatus = useCallback((next: CameraConnectionStatus) => {
    setStatus(next);
  }, []);

  return (
    <FadeIn delay={0.1}>
      <Link
        href="/live-camera"
        aria-label="Open live camera, full screen"
        onPointerEnter={() => warmSoftSounds()}
        onPointerDown={() => {
          warmSoftSounds();
          playLiveCamSound();
        }}
      >
        <GlassCard
          padding="none"
          className="overflow-hidden transition-transform active:scale-[0.99] lg:hover:bg-white/30"
        >
          <div className="flex items-center gap-3 p-4 lg:hidden">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/55">
              <LiveCameraIcon size={22} wash="dustyBlue" />
              <span
                className={cn(
                  "absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-white/80",
                  isLive ? "bg-[#8FA888] animate-live-glow" : "bg-[#B9AEA4]"
                )}
                aria-hidden
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="font-heading block text-base font-medium text-[#4F545A]">
                Live Cam
              </span>
              <span className="block text-xs text-[#8A8F94]">
                {isMock
                  ? isLive
                    ? "Watching now"
                    : "Connecting…"
                  : "Tap to watch live"}
              </span>
            </span>

            <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#DCE6EC]">
              <Image
                src={posterSrc}
                alt="Thumbnail of the nest inside the birdhouse"
                fill
                sizes="64px"
                className={cn("object-cover", isLive && "animate-breathe-soft")}
                unoptimized={posterSrc.startsWith("http")}
              />
            </span>

            <ChevronRightIcon size={18} className="shrink-0 text-[#8A8F94]" />
          </div>

          <div className="hidden lg:block">
            <div className="p-2.5 pb-0">
              {isMock || !isDesktop ? (
                <div className="wood-frame">
                  <div className="wood-frame-inner relative aspect-[16/10] w-full">
                    <Image
                      src={posterSrc}
                      alt="Thumbnail of the nest inside the birdhouse"
                      fill
                      sizes="380px"
                      className={cn(
                        "object-cover",
                        isLive && "animate-breathe-soft"
                      )}
                      unoptimized={posterSrc.startsWith("http")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4F545A]/35 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <LivePill isLive={isLive} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <CameraPlayer
                    config={birdhouseCameraConfig}
                    variant="card"
                    showBadge={false}
                    onStatusChange={handleStatus}
                    className="[&_.wood-frame-inner]:aspect-[16/10]"
                  />
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4F545A]/35 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <LivePill isLive={status === "live"} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span>
                <span className="font-heading block text-lg font-medium text-[#4F545A]">
                  Live Cam
                </span>
                <span className="mt-0.5 block text-sm text-[#8A8F94]">
                  Watch the nest in real time
                </span>
              </span>
              <ChevronRightIcon size={18} className="shrink-0 text-[#8A8F94]" />
            </div>
          </div>
        </GlassCard>
      </Link>
    </FadeIn>
  );
}

function LivePill({ isLive }: { isLive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md",
        isLive ? "bg-[#8FA888]/85" : "bg-[#B9AEA4]/85"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-white",
          isLive && "animate-live-glow"
        )}
        aria-hidden
      />
      {isLive ? "Live" : "Connecting…"}
    </span>
  );
}
