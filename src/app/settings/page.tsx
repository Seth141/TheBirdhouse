"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/Switch";
import { FadeIn } from "@/components/motion/FadeIn";
import { CameraStatusBadge } from "@/components/camera/CameraStatusBadge";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import {
  LIVE_CAM_CHIRPS,
  getLiveCamChirpId,
  previewLiveCamChirp,
  setLiveCamChirpId,
  warmSoftSounds,
  type LiveCamChirpId,
} from "@/lib/audio/softSounds";
import {
  NotificationIcon,
  CameraIcon,
  LeafIcon,
  FlowerIcon,
  BirdhouseIcon,
  LiveCameraIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";

function SettingsRow({
  icon,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#4F545A]">{title}</span>
        {description && (
          <span className="block text-xs text-[#8A8F94]">{description}</span>
        )}
      </span>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  const streamConfigured =
    birdhouseCameraConfig.protocol !== "mock" &&
    Boolean(birdhouseCameraConfig.streamUrl);
  const status = streamConfigured ? "live" : "idle";
  const [motionAlerts, setMotionAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [liveCamChirp, setLiveCamChirp] = useState<LiveCamChirpId>("bright-peep");

  useEffect(() => {
    setLiveCamChirp(getLiveCamChirpId());
  }, []);

  const chooseChirp = (id: LiveCamChirpId) => {
    warmSoftSounds();
    setLiveCamChirp(id);
    setLiveCamChirpId(id);
    previewLiveCamChirp(id);
  };

  return (
    <AppShell title="Settings" subtitle="Tend to your birdhouse experience">
      <div className="space-y-5 lg:mx-auto lg:grid lg:max-w-4xl lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <FadeIn>
          <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[#8A8F94] lg:text-[0.7rem]">
            Camera
          </h2>
          <GlassCard padding="sm" className="divide-y divide-white/40 lg:p-5">
            <SettingsRow
              icon={<CameraIcon size={20} wash="taupe" />}
              title="Birdhouse Cam"
              description={
                streamConfigured
                  ? `${birdhouseCameraConfig.protocol.toUpperCase()} · stream configured`
                  : `${birdhouseCameraConfig.protocol.toUpperCase()} · Wyze Cam V3`
              }
              control={<CameraStatusBadge status={status} />}
            />
          </GlassCard>

          <h2 className="mb-2 mt-5 px-1 text-xs font-medium uppercase tracking-wider text-[#8A8F94] lg:text-[0.7rem]">
            Live Cam chirp
          </h2>
          <GlassCard padding="sm" className="lg:p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50">
                <LiveCameraIcon size={20} wash="dustyBlue" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[#4F545A]">
                  Tap to preview, choose one
                </span>
                <span className="block text-xs text-[#8A8F94]">
                  Plays when you open Live Cam
                </span>
              </span>
            </div>
            <ul className="space-y-2">
              {LIVE_CAM_CHIRPS.map((option) => {
                const selected = liveCamChirp === option.id;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => chooseChirp(option.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "bg-[#D6E1D5]/70 ring-1 ring-[#8FA896]/45"
                          : "bg-white/35 hover:bg-white/55"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          selected
                            ? "border-[#6F8F7A] bg-[#6F8F7A]"
                            : "border-[#B9AEA4] bg-white/70"
                        )}
                        aria-hidden
                      >
                        {selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#4F545A]">
                          {option.name}
                        </span>
                        <span className="block text-xs text-[#8A8F94]">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[#8A8F94] lg:text-[0.7rem]">
            Notifications
          </h2>
          <GlassCard padding="sm" className="divide-y divide-white/40 lg:p-5">
            <SettingsRow
              icon={<NotificationIcon size={20} wash="blush" />}
              title="Motion alerts"
              description="Gently notify me when a bird visits"
              control={<Switch checked={motionAlerts} onChange={setMotionAlerts} label="Motion alerts" />}
            />
            <SettingsRow
              icon={<LeafIcon size={20} wash="sage" />}
              title="Daily digest"
              description="A quiet morning summary"
              control={<Switch checked={dailyDigest} onChange={setDailyDigest} label="Daily digest" />}
            />
            <SettingsRow
              icon={<FlowerIcon size={20} wash="blush" />}
              title="Notification sound"
              description="A soft chime, never jarring"
              control={<Switch checked={sound} onChange={setSound} label="Notification sound" />}
            />
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[#8A8F94] lg:text-[0.7rem]">
            Accessibility
          </h2>
          <GlassCard padding="sm" className="divide-y divide-white/40 lg:p-5">
            <SettingsRow
              icon={<BirdhouseIcon size={20} wash="taupe" />}
              title="Reduce motion"
              description="Turn off drifting clouds and floating icons"
              control={<Switch checked={reducedMotion} onChange={setReducedMotion} label="Reduce motion" />}
            />
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.15}>
          <GlassCard padding="lg" className="text-center lg:flex lg:h-full lg:flex-col lg:items-center lg:justify-center lg:p-8">
            <p className="font-heading text-base font-medium text-[#4F545A] lg:text-xl">
              Sara&apos;s Birdhouse
            </p>
            <p className="mt-1 text-xs text-[#8A8F94] lg:mt-2 lg:text-sm">
              Version 1.0 · Made with quiet care
            </p>
          </GlassCard>
        </FadeIn>
      </div>
    </AppShell>
  );
}
