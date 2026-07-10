"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { LeafIcon } from "@/components/icons";

/**
 * Quiet, journal-style toast surface — used for things like snapshot
 * confirmations. Deliberately understated: no color-coded severity, no
 * sharp motion.
 */
export function ToastLayer() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => dismissToast(toasts[0].id), 2600);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4F545A]"
          >
            <LeafIcon size={18} wash="sage" />
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
