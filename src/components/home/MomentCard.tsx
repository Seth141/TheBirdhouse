"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Moment } from "@/lib/query/mockData";
import { FavoriteIcon } from "@/components/icons";
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

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-card relative overflow-hidden",
        size === "sm" && "h-32 w-28 shrink-0",
        size === "md" && "h-40 w-32 shrink-0",
        size === "fill" && "h-full w-full"
      )}
    >
      <Image
        src={moment.imageSrc}
        alt={moment.title}
        fill
        sizes="(min-width: 1024px) 280px, 140px"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent p-2">
        <p className="truncate text-xs font-medium text-white">{moment.title}</p>
        <p className="truncate text-[10px] text-white/80">{moment.subtitle}</p>
      </div>
      <button
        type="button"
        aria-label={isFavorite ? `Remove ${moment.title} from favorites` : `Save ${moment.title} to favorites`}
        aria-pressed={isFavorite}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(moment.id);
        }}
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm"
      >
        <FavoriteIcon
          size={14}
          wash="none"
          className={isFavorite ? "text-[#C98A93]" : "text-white"}
          style={isFavorite ? { fill: "#C98A93" } : undefined}
        />
      </button>
    </motion.div>
  );
}
