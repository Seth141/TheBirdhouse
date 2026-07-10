"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { LeafIcon, ChevronRightIcon } from "@/components/icons";
import { useNatureTip } from "@/lib/query/hooks";
import { playTipSound, warmSoftSounds } from "@/lib/audio/softSounds";

export function TipCard() {
  const { data: tip } = useNatureTip();
  if (!tip) return null;

  return (
    <FadeIn delay={0.25}>
      <button
        type="button"
        onPointerEnter={() => warmSoftSounds()}
        onPointerDown={() => {
          warmSoftSounds();
          playTipSound();
        }}
        className="w-full text-left"
        aria-label={tip.title}
      >
        <GlassCard
          padding="sm"
          className="flex items-center gap-3 transition-transform active:scale-[0.99] lg:gap-4 lg:p-5"
        >
          <span className="animate-float-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/40 lg:h-14 lg:w-14">
            <LeafIcon size={24} wash="sage" className="lg:scale-110" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-medium text-[#4F545A] lg:text-lg">
              {tip.title}
            </span>
            <span className="block text-xs leading-snug text-[#8A8F94] lg:mt-1 lg:text-sm lg:leading-relaxed">
              {tip.body}
            </span>
          </span>
          <ChevronRightIcon size={16} className="shrink-0 lg:scale-110" />
        </GlassCard>
      </button>
    </FadeIn>
  );
}
