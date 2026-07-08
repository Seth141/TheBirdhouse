import type { SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  /** Soft pastel wash rendered behind the glyph, evoking a brushed watercolor dab. */
  wash?: "sage" | "blush" | "dustyBlue" | "taupe" | "lavender" | "none";
  className?: string;
}

const washColors: Record<NonNullable<IconProps["wash"]>, string> = {
  sage: "#D6E1D5",
  blush: "#F4E5E7",
  dustyBlue: "#B9CBD8",
  taupe: "#E4DCD2",
  lavender: "#DCD6E8",
  none: "transparent",
};

/**
 * Shared chrome for the hand-painted icon set: a soft blurred wash of
 * pastel pigment sits behind a warm-ink line glyph, so every icon reads as
 * "brushed" rather than machine-drawn, matching the botanical artwork.
 */
export function IconBase({
  size = 24,
  wash = "none",
  className,
  children,
  viewBox = "0 0 24 24",
  ...props
}: IconProps) {
  const washFill = washColors[wash];
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
      {wash !== "none" && (
        <ellipse
          cx="12"
          cy="13"
          rx="10.5"
          ry="9.5"
          fill={washFill}
          opacity="0.55"
          style={{ filter: "blur(2.5px)" }}
        />
      )}
      <g
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}
