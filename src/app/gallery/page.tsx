"use client";

import Image from "next/image";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FadeIn } from "@/components/motion/FadeIn";
import { GlassCard } from "@/components/ui/GlassCard";
import { MomentCard } from "@/components/home/MomentCard";
import { LoadingFeather } from "@/components/motion/LoadingFeather";
import { useMoments } from "@/lib/query/hooks";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils/cn";

const filters = ["All", "Favorites"] as const;

export default function GalleryPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { data: moments, isLoading } = useMoments();
  const isFavorite = useAppStore((s) => s.isFavorite);

  const visible = moments?.filter((m) => (filter === "All" ? true : isFavorite(m.id)));

  return (
    <AppShell title="Gallery" subtitle="Every quiet moment, kept safe">
      <FadeIn>
        <div className="mb-5 flex gap-2 px-1 lg:mb-8">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors lg:px-5 lg:py-2 lg:text-base",
                filter === f
                  ? "bg-[#F4E5E7]/70 text-[#4F545A] font-medium"
                  : "text-[#8A8F94] hover:bg-white/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </FadeIn>

      {isLoading ? (
        <LoadingFeather label="Gathering your moments…" />
      ) : visible && visible.length > 0 ? (
        <FadeIn delay={0.08}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {visible.map((moment) => (
              <div key={moment.id} className="aspect-square w-full lg:aspect-[4/5]">
                <MomentCard moment={moment} size="fill" />
              </div>
            ))}
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.08}>
          <GlassCard
            padding="lg"
            className="flex flex-col items-center gap-3 text-center lg:mx-auto lg:max-w-md lg:py-16"
          >
            <span className="relative h-28 w-28 lg:h-36 lg:w-36">
              <Image
                src="/artwork/empty-states/empty-nature.png"
                alt=""
                fill
                className="object-contain"
              />
            </span>
            <p className="font-heading text-base font-medium text-[#4F545A] lg:text-xl">
              {filter === "Favorites" ? "No favorites yet" : "No moments yet"}
            </p>
            <p className="max-w-[220px] text-sm text-[#8A8F94] lg:max-w-[280px] lg:text-base">
              {filter === "Favorites"
                ? "Tap the heart on any moment to keep it close."
                : "Your birdhouse is quiet for now — check back soon."}
            </p>
          </GlassCard>
        </FadeIn>
      )}
    </AppShell>
  );
}
