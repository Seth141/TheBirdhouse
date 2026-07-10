"use client";

import type { ComponentType } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { BirdIcon, EggIcon, NestIcon, FavoriteIcon, type IconProps } from "@/components/icons";
import { useStats } from "@/lib/query/hooks";

const items: {
  key: string;
  label: string;
  Icon: ComponentType<IconProps>;
  wash: IconProps["wash"];
  value: (s: ReturnType<typeof useStats>["data"]) => number | undefined;
}[] = [
  { key: "birds", label: "Birds Today", Icon: BirdIcon, wash: "dustyBlue", value: (s) => s?.birdsToday },
  { key: "eggs", label: "Eggs Laid", Icon: EggIcon, wash: "sage", value: (s) => s?.eggsLaid },
  { key: "visits", label: "Visits Today", Icon: NestIcon, wash: "sage", value: (s) => s?.visitsToday },
  { key: "total", label: "Total Visits", Icon: FavoriteIcon, wash: "blush", value: (s) => s?.totalVisits },
];

export function StatsGrid() {
  const { data: stats, isLoading } = useStats();

  return (
    <FadeIn delay={0.15}>
      <GlassCard
        padding="sm"
        className="grid grid-cols-4 gap-1 lg:grid-cols-2 lg:gap-3 lg:p-5"
      >
        {items.map(({ key, label, Icon, wash, value }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1.5 py-2 text-center lg:items-start lg:rounded-[22px] lg:bg-white/35 lg:px-4 lg:py-4 lg:text-left"
          >
            <Icon size={22} wash={wash} className="lg:mb-1" />
            <span className="font-heading text-lg font-medium leading-none text-[#4F545A] lg:text-[1.75rem]">
              {isLoading ? "–" : value(stats)}
            </span>
            <span className="text-[10px] leading-tight text-[#8A8F94] lg:text-xs">
              {label}
            </span>
          </div>
        ))}
      </GlassCard>
    </FadeIn>
  );
}
