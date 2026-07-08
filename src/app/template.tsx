"use client";

import { motion } from "framer-motion";

/**
 * Next.js remounts `template.tsx` on every navigation, which gives every
 * route a calm 700ms fade-in without needing a client-side router wrapper.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
