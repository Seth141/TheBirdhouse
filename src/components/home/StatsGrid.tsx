"use client";

import type { ComponentType } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  BirdIcon,
  EggIcon,
  NestIcon,
  FavoriteIcon,
  type IconProps,
} from "@/components/icons";
import { useStats } from "@/lib/query/hooks";
import { cn } from "@/lib/utils/cn";

const items: {
  key: string;
  label: string;
  Icon: ComponentType<IconProps>;
  wash: IconProps["wash"];
  /** Soft tint washed through each glass tile */
  tint: string;
  value: (s: ReturnType<typeof useStats>["data"]) => number | undefined;
}[] = [
  {
    key: "birds",
    label: "Birds Today",
    Icon: BirdIcon,
    wash: "dustyBlue",
    tint: "rgba(185, 203, 216, 0.14)",
    value: (s) => s?.birdsToday,
  },
  {
    key: "eggs",
    label: "Eggs Laid",
    Icon: EggIcon,
    wash: "sage",
    tint: "rgba(214, 225, 213, 0.16)",
    value: (s) => s?.eggsLaid,
  },
  {
    key: "species",
    label: "Species Seen",
    Icon: NestIcon,
    wash: "sage",
    tint: "rgba(201, 216, 196, 0.15)",
    value: (s) => s?.speciesSeen,
  },
  {
    key: "total",
    label: "Total Visits",
    Icon: FavoriteIcon,
    wash: "blush",
    tint: "rgba(239, 217, 221, 0.14)",
    value: (s) => s?.totalVisits,
  },
];

export function StatsGrid() {
  const { data: stats, isLoading } = useStats();

  return (
    <FadeIn delay={0.15}>
      <section
        aria-label="Yard stats"
        className={cn(
          "relative overflow-hidden rounded-[28px] p-2.5 lg:rounded-[30px] lg:p-3.5",
          // Outer museum glass shell
          "border border-white/55",
          "bg-[linear-gradient(145deg,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0.22)_48%,rgba(255,255,255,0.38)_100%)]",
          "shadow-[0_14px_40px_rgba(80,80,80,0.1),inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(255,255,255,0.2)]",
          "backdrop-blur-[28px] backdrop-saturate-[165%]"
        )}
      >
        {/* Soft sky reflections drifting behind the tiles */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full bg-[#B9CBD8]/35 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-6 h-36 w-36 rounded-full bg-[#D6E1D5]/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />

        <div className="relative grid grid-cols-4 gap-1.5 lg:grid-cols-2 lg:gap-2.5">
          {items.map(({ key, label, Icon, wash, tint, value }) => (
            <div
              key={key}
              className={cn(
                "relative flex flex-col items-center gap-1 overflow-hidden rounded-[18px] px-1.5 py-2.5 text-center",
                "lg:items-start lg:rounded-[22px] lg:px-4 lg:py-4 lg:text-left",
                "border border-white/25",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]",
                "backdrop-blur-md"
              )}
              style={{
                background: `linear-gradient(165deg, rgba(255,255,255,0.22) 0%, ${tint} 55%, rgba(255,255,255,0.12) 100%)`,
              }}
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/25 lg:mb-1 lg:h-9 lg:w-9">
                <Icon size={20} wash={wash} className="lg:scale-110" />
              </span>
              <span className="font-heading relative text-lg font-medium leading-none text-[#4F545A] lg:text-[1.75rem]">
                {isLoading ? "–" : value(stats)}
              </span>
              <span className="relative text-[10px] leading-tight text-[#8A8F94] lg:text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
