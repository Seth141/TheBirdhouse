import type { SVGProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type IconWash =
  | "sage"
  | "blush"
  | "dustyBlue"
  | "taupe"
  | "lavender"
  | "none";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
  /** Soft pastel pigment family — always a step darker than the sage sky. */
  wash?: IconWash;
  className?: string;
}

/**
 * Pigment families sit darker than the sage garden background (#DDE7DC / #D6E1D5)
 * so every glyph reads clearly without going black.
 */
export const pastel = {
  sage: { soft: "#A7B8A6", mid: "#7E9180", deep: "#5F7264" },
  blush: { soft: "#D2B4B8", mid: "#B07E86", deep: "#8A5A62" },
  dustyBlue: { soft: "#8FA9B8", mid: "#6D8A9A", deep: "#516F7E" },
  taupe: { soft: "#B5A89C", mid: "#8F8276", deep: "#6C6157" },
  lavender: { soft: "#B3A9C6", mid: "#8B80A6", deep: "#6A6084" },
  cream: { soft: "#F3EEE6", mid: "#E5DED3", deep: "#C9C0B4" },
} as const;

const washToFamily: Record<Exclude<IconWash, "none">, keyof typeof pastel> = {
  sage: "sage",
  blush: "blush",
  dustyBlue: "dustyBlue",
  taupe: "taupe",
  lavender: "lavender",
};

export type PastelTone = { soft: string; mid: string; deep: string };

export function IconBase({
  size = 24,
  wash = "sage",
  className,
  children,
  viewBox = "0 0 24 24",
  ...props
}: IconProps & { children: (colors: PastelTone) => ReactNode }) {
  const family =
    wash === "none" ? pastel.taupe : pastel[washToFamily[wash]];

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {children(family)}
    </svg>
  );
}
