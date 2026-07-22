"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import type { Moment } from "@/lib/query/mockData";
import { FavoriteIcon } from "@/components/icons";
import { MomentLightbox } from "@/components/home/MomentLightbox";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils/cn";

export function MomentCard({
  moment,
  size = "md",
}: {
  moment: Moment;
  size?: "sm" | "md" | "fill";
}) {
  const isFavorite = useAppStore((s) => s.isFavorite(moment.id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          // Landscape cards + sage gradient hide object-contain letterboxing.
          "relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#6B8570] via-[#5A7360] to-[#4A5F50] shadow-[0_12px_50px_rgba(80,80,80,0.08)]",
          size === "sm" && "w-36 shrink-0",
          size === "md" && "w-52 shrink-0",
          size === "fill" && "h-full w-full"
        )}
      >
        <Image
          src={moment.imageSrc}
          alt={moment.title}
          fill
          sizes="(min-width: 1024px) 360px, 208px"
          className="object-contain object-center"
        />

        {/* Soft sage fades so crop edges dissolve into the card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(74,95,80,0.55)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-10 bg-gradient-to-b from-[#5A7360]/70 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-[#4A5F50]/85 via-[#4F6655]/45 to-transparent"
        />

        <button
          type="button"
          aria-label={`Enlarge ${moment.title}`}
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-[2]"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-[#3F5244]/95 via-[#4F6655]/80 to-transparent px-3 pb-2.5 pt-8">
          <p className="truncate text-sm font-semibold text-white">{moment.title}</p>
          <p className="truncate text-xs text-white/90">{moment.subtitle}</p>
        </div>

        <button
          type="button"
          aria-label={
            isFavorite
              ? `Remove ${moment.title} from favorites`
              : `Save ${moment.title} to favorites`
          }
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(moment.id);
          }}
          className="absolute right-1.5 top-1.5 z-[4] flex h-7 w-7 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm"
        >
          <FavoriteIcon
            size={15}
            wash="blush"
            className={isFavorite ? "opacity-100" : "opacity-70"}
            style={
              isFavorite
                ? undefined
                : { filter: "grayscale(0.35) brightness(1.15)" }
            }
          />
        </button>
      </motion.div>
      <MomentLightbox
        moment={moment}
        open={lightboxOpen}
        onClose={closeLightbox}
      />
    </>
  );
}
