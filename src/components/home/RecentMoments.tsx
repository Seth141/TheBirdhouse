"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { MomentCard } from "@/components/home/MomentCard";
import { ChevronRightIcon } from "@/components/icons";
import { useMoments } from "@/lib/query/hooks";
import { LoadingFeather } from "@/components/motion/LoadingFeather";

export function RecentMoments() {
  const { data: moments, isLoading } = useMoments();

  return (
    <FadeIn delay={0.2}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-heading text-lg font-medium text-[#4F545A]">Recent Moments</h2>
        <Link
          href="/gallery"
          className="flex items-center gap-0.5 text-sm text-[#8A8F94] transition-colors hover:text-[#4F545A]"
        >
          View all
          <ChevronRightIcon size={14} />
        </Link>
      </div>

      {isLoading ? (
        <LoadingFeather />
      ) : (
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {moments?.map((moment) => (
            <MomentCard key={moment.id} moment={moment} />
          ))}
        </div>
      )}
    </FadeIn>
  );
}
