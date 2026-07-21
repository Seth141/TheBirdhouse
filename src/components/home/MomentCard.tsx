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
          "glass-card relative aspect-square overflow-hidden rounded-[20px]",
          size === "sm" && "w-28 shrink-0",
          size === "md" && "w-32 shrink-0",
          size === "fill" && "h-full w-full"
        )}
      >
        <button
          type="button"
          aria-label={`Enlarge ${moment.title}`}
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 text-left"
        >
          <Image
            src={moment.imageSrc}
            alt={moment.title}
            fill
            sizes="(min-width: 1024px) 280px, 140px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#5F7264]/95 px-3 py-2 backdrop-blur-sm">
            <p className="truncate text-xs font-medium text-white">{moment.title}</p>
            <p className="truncate text-[10px] text-white/80">{moment.subtitle}</p>
          </div>
        </button>
        <button
          type="button"
          aria-label={isFavorite ? `Remove ${moment.title} from favorites` : `Save ${moment.title} to favorites`}
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(moment.id);
          }}
          className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm"
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
