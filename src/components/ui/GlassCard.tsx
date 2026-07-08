import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * Frosted "museum glass" surface — the base container for nearly every
 * card in the app. Kept deliberately simple so glass always looks
 * consistent, per the design spec.
 */
export function GlassCard({
  as: Tag = "div",
  padding = "md",
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <Tag className={cn("glass-card", paddingMap[padding], className)} {...props}>
      {children}
    </Tag>
  );
}
