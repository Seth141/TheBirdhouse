"use client";

import { motion } from "framer-motion";
import { BirdIcon } from "@/components/icons";

/**
 * Loading indicator used everywhere a spinner would normally go —
 * a soft pastel bird drifting gently, never a hard spinner.
 */
export function LoadingFeather({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-[#8A8F94]">
      <motion.div
        animate={{
          y: [0, -7, 0],
          x: [0, 4, -3, 0],
          rotate: [0, 4, -3, 0],
        }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <BirdIcon size={34} wash="dustyBlue" />
      </motion.div>
      {label && <p className="text-xs">{label}</p>}
    </div>
  );
}
