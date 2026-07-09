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
          className="flex items-center gap-3 transition-transform active:scale-[0.99]"
        >
          <span className="animate-float flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/55">
            <LeafIcon size={20} wash="none" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-medium text-[#4F545A]">
              {tip.title}
            </span>
            <span className="block text-xs leading-snug text-[#8A8F94]">
              {tip.body}
            </span>
          </span>
          <ChevronRightIcon size={16} className="shrink-0 text-[#8A8F94]" />
        </GlassCard>
      </button>
    </FadeIn>
  );
}
