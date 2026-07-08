"use client";

import { motion } from "framer-motion";
import { FeatherIcon } from "@/components/icons";

/**
 * Loading indicator used everywhere a spinner would normally go — a
 * feather drifting side to side and slowly rotating, per the "never use
 * spinning loaders" directive.
 */
export function LoadingFeather({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-[#8A8F94]">
      <motion.div
        animate={{
          y: [0, -8, 0],
          x: [0, 6, -4, 0],
          rotate: [0, 8, -6, 0],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <FeatherIcon size={30} wash="dustyBlue" />
      </motion.div>
      {label && <p className="text-xs">{label}</p>}
    </div>
  );
}
