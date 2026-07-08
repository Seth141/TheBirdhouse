"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

interface IconButtonProps extends NativeButtonProps {
  children: ReactNode;
  badge?: number;
  size?: number;
  /** `inset` — soft button inside a glass pill; `glass` — standalone frosted circle */
  surface?: "glass" | "inset";
}

/**
 * Circular frosted-glass button used throughout the chrome (notifications,
 * menu, expand, share). Always meets the 44x44 minimum touch target even
 * when the visual glyph is smaller.
 */
export function IconButton({
  children,
  badge,
  size = 44,
  surface = "glass",
  className,
  ...props
}: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex items-center justify-center text-[#4F545A]",
        surface === "inset" ? "glass-pill-action" : "glass-card",
        className
      )}
      style={{ width: size, height: size, borderRadius: 999 }}
      {...props}
    >
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EFD9DD] px-1 text-[10px] font-medium text-[#4F545A] shadow-sm">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </motion.button>
  );
}
