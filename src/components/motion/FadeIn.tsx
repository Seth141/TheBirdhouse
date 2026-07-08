"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}

/** Standard fade + rise entrance used for cards and sections. */
export function FadeIn({ children, delay = 0, className, as = "div" }: FadeInProps) {
  const transition = { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const };

  if (as === "li") {
    return (
      <motion.li
        className={className}
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={transition}
      >
        {children}
      </motion.li>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
