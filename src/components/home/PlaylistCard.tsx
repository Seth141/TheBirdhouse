"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { MusicIcon, ChevronRightIcon } from "@/components/icons";
import { playLiveCamSound, warmSoftSounds } from "@/lib/audio/softSounds";

const SPOTIFY_URL =
  "https://open.spotify.com/track/1f8quOyC5GgsdYzYem5ipJ?si=UDw4vI6cTfWuzVRMyHKx1g";

/**
 * Soft Spotify invite — opens the relax track in a new tab.
 */
export function PlaylistCard() {
  return (
    <FadeIn delay={0.3}>
      <a
        href={SPOTIFY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Relax with this playlist on Spotify"
        className="block w-full text-left"
        onPointerEnter={() => warmSoftSounds()}
        onPointerDown={() => {
          warmSoftSounds();
          playLiveCamSound();
        }}
      >
        <GlassCard
          padding="sm"
          className="flex items-center gap-3 transition-transform active:scale-[0.99] lg:gap-4 lg:p-5 lg:hover:bg-white/30"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCD6E8]/45 lg:h-14 lg:w-14">
            <MusicIcon size={22} wash="lavender" className="lg:scale-110" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-medium text-[#4F545A] lg:text-lg">
              Relax with this playlist
            </span>
          </span>
          <ChevronRightIcon size={16} className="shrink-0 lg:scale-110" />
        </GlassCard>
      </a>
    </FadeIn>
  );
}
