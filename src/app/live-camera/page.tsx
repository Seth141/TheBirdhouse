"use client";

import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { CameraPlayer } from "@/components/camera/CameraPlayer";
import { CameraStatusBadge } from "@/components/camera/CameraStatusBadge";
import { useCameraSource } from "@/lib/camera/useCameraSource";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import { useMotionEvents } from "@/lib/query/hooks";
import { useAppStore } from "@/lib/store/useAppStore";
import { DownloadIcon, ShareIcon, NestIcon } from "@/components/icons";
import { LoadingFeather } from "@/components/motion/LoadingFeather";

export default function LiveCameraPage() {
  const { status, captureSnapshot } = useCameraSource(birdhouseCameraConfig);
  const pushToast = useAppStore((s) => s.pushToast);
  const { data: motionEvents, isLoading } = useMotionEvents();

  const handleSnapshot = async () => {
    await captureSnapshot();
    pushToast("Snapshot saved to your gallery.");
  };

  return (
    <AppShell title="Live Camera" subtitle="Watching your birdhouse">
      <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:space-y-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
        <FadeIn>
          <GlassCard padding="sm" className="lg:p-4">
            <CameraPlayer config={birdhouseCameraConfig} variant="full" />
            <div className="flex items-center justify-between px-1 pt-3 lg:pt-4">
              <div className="flex items-center gap-2">
                <CameraStatusBadge status={status} />
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
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl lg:h-16 lg:w-16 lg:rounded-2xl">
                      <Image src={event.thumbnailSrc} alt="" fill className="object-cover" />
                    </span>
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
    </AppShell>
  );
}
