"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FadeIn } from "@/components/motion/FadeIn";
import { GlassCard } from "@/components/ui/GlassCard";
import { MomentCard } from "@/components/home/MomentCard";
import { LoadingFeather } from "@/components/motion/LoadingFeather";
import { useMoments, useSpeciesGallery } from "@/lib/query/hooks";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils/cn";

const filters = ["All", "Species", "Favorites"] as const;

function formatFirstSeen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GalleryPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { data: moments, isLoading: momentsLoading } = useMoments();
  const { data: species, isLoading: speciesLoading } = useSpeciesGallery();
  const isFavorite = useAppStore((s) => s.isFavorite);

  const visibleMoments = useMemo(
    () => moments?.filter((m) => (filter === "Favorites" ? isFavorite(m.id) : true)),
    [moments, filter, isFavorite]
  );

  const isLoading =
    filter === "Species" ? speciesLoading : momentsLoading;

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
      ) : filter === "Species" ? (
        species && species.length > 0 ? (
          <FadeIn delay={0.08}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {species.map((s) => (
                <GlassCard key={s.id} padding="sm" className="overflow-hidden lg:p-3">
                  <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white/40">
                    {s.coverImageUrl ? (
                      <Image
                        src={s.coverImageUrl}
                        alt={s.commonName}
                        fill
                        sizes="(min-width: 1024px) 320px, 50vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="px-1 pb-1">
                    <p className="font-heading text-lg font-medium text-[#4F545A]">
                      {s.commonName}
                    </p>
                    {s.scientificName ? (
                      <p className="text-xs italic text-[#8A8F94]">{s.scientificName}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-[#8A8F94]">
                      {s.totalSightings} sighting{s.totalSightings === 1 ? "" : "s"}
                      {" · "}First seen {formatFirstSeen(s.firstSeenAt)}
                    </p>
                    {s.recentImages.length > 1 ? (
                      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                        {s.recentImages.slice(0, 5).map((src, i) => (
                          <span
                            key={`${s.id}-${i}`}
                            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        ) : (
          <EmptyState
            title="No species yet"
            body="Once the camera logs a visitor, species will gather here."
          />
        )
      ) : visibleMoments && visibleMoments.length > 0 ? (
        <FadeIn delay={0.08}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {visibleMoments.map((moment) => (
              <div key={moment.id} className="aspect-square w-full lg:aspect-[4/5]">
                <MomentCard moment={moment} size="fill" />
              </div>
            ))}
          </div>
        </FadeIn>
      ) : (
        <EmptyState
          title={filter === "Favorites" ? "No favorites yet" : "No moments yet"}
          body={
            filter === "Favorites"
              ? "Tap the heart on any moment to keep it close."
              : "Your birdhouse is quiet for now — check back soon."
          }
        />
      )}
    </AppShell>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
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
          {title}
        </p>
        <p className="max-w-[220px] text-sm text-[#8A8F94] lg:max-w-[280px] lg:text-base">
          {body}
        </p>
      </GlassCard>
    </FadeIn>
  );
}
