"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/Switch";
import { FadeIn } from "@/components/motion/FadeIn";
import { CameraStatusBadge } from "@/components/camera/CameraStatusBadge";
import { birdhouseCameraConfig } from "@/lib/camera/createCameraSource";
import {
  NotificationIcon,
  CameraIcon,
  LeafIcon,
  FlowerIcon,
  BirdhouseIcon,
} from "@/components/icons";

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
