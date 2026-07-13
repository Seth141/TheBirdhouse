"use client";

import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { LiveCameraIcon, ChevronRightIcon } from "@/components/icons";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import { prewarmCameraBridge } from "@/lib/camera/prewarmBridge";
import { playLiveCamSound, warmSoftSounds } from "@/lib/audio/softSounds";
import { cn } from "@/lib/utils/cn";

/**
 * Home entry point only — never opens the HLS stream.
 * Pre-warms the Railway bridge on press so /live-camera is ready sooner.
 */
export function LiveCameraCard() {
  const streamReady = birdhouseCameraConfig.protocol !== "mock";
  const posterSrc =
    birdhouseCameraConfig.snapshotUrl ?? "/artwork/nests/nest-eggs.png";

  const beginWatch = () => {
    warmSoftSounds();
    playLiveCamSound();
    prewarmCameraBridge();
  };

  return (
    <FadeIn delay={0.1}>
      <Link
        href="/live-camera"
        aria-label="Open live camera, full screen"
        onPointerEnter={() => {
          warmSoftSounds();
          // Desktop hover: start waking a moment before click.
          if (streamReady) prewarmCameraBridge();
        }}
        onPointerDown={beginWatch}
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
                  streamReady ? "bg-[#8FA888]" : "bg-[#B9AEA4]"
                )}
                aria-hidden
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="font-heading block text-base font-medium text-[#4F545A]">
                Live Cam
              </span>
              <span className="block text-xs text-[#8A8F94]">
                {streamReady ? "Tap to watch live" : "Preview"}
              </span>
            </span>

            <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#DCE6EC]">
              <Image
                src={posterSrc}
                alt="Thumbnail of the nest inside the birdhouse"
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={posterSrc.startsWith("http")}
              />
            </span>

            <ChevronRightIcon size={18} className="shrink-0 text-[#8A8F94]" />
          </div>

          <div className="hidden lg:block">
            <div className="p-2.5 pb-0">
              <div className="wood-frame">
                <div className="wood-frame-inner relative aspect-[16/10] w-full">
                  <Image
                    src={posterSrc}
                    alt="Thumbnail of the nest inside the birdhouse"
                    fill
                    sizes="380px"
                    className="object-cover"
                    unoptimized={posterSrc.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4F545A]/35 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md",
                        streamReady ? "bg-[#8FA888]/85" : "bg-[#B9AEA4]/85"
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-white"
                        aria-hidden
                      />
                      {streamReady ? "Tap to watch" : "Preview"}
                    </span>
                  </div>
                </div>
              </div>
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
