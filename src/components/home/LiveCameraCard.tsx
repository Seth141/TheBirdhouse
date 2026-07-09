"use client";

import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { LiveCameraIcon, ChevronRightIcon } from "@/components/icons";
import { useCameraSource } from "@/lib/camera/useCameraSource";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import { playLiveCamSound, warmSoftSounds } from "@/lib/audio/softSounds";
import { cn } from "@/lib/utils/cn";

export function LiveCameraCard() {
  const { status } = useCameraSource(birdhouseCameraConfig);
  const isLive = status === "live";

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
              <LiveCameraIcon size={20} wash="none" />
              <span
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full ring-2 ring-white/80",
                  isLive ? "bg-[#8FA888]" : "bg-[#B9AEA4]"
                )}
                aria-hidden
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="font-heading block text-base font-medium text-[#4F545A]">
                Live Cam
              </span>
              <span className="block text-xs text-[#8A8F94]">
                {isLive ? "Watching now" : "Connecting…"}
              </span>
            </span>

            <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#DCE6EC]">
              <Image
                src="/artwork/nests/nest-eggs.png"
                alt="Thumbnail of the nest inside the birdhouse"
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>

            <ChevronRightIcon size={18} className="shrink-0 text-[#8A8F94]" />
          </div>

          <div className="hidden lg:block">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DCE6EC]">
              <Image
                src="/artwork/nests/nest-eggs.png"
                alt="Thumbnail of the nest inside the birdhouse"
                fill
                sizes="380px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4F545A]/35 via-transparent to-transparent" />
              <span
                className={cn(
                  "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md",
                  isLive ? "bg-[#8FA888]/85" : "bg-[#B9AEA4]/85"
                )}
              >
                {isLive ? "Live" : "Connecting…"}
              </span>
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
