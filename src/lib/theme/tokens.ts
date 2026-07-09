/**
 * Sara's Birdhouse — centralized design tokens.
 *
 * This is the single source of truth for the visual language of the app.
 * Values here are mirrored into `globals.css` (`@theme`) so Tailwind
 * utilities and raw TS/JS (Framer Motion, canvas, inline styles) always
 * agree with one another.
 */

export const colors = {
  sky: "#EAF3F8",
  morningBlue: "#EEF6FB",
  warmWhite: "#FCFBF8",
  cream: "#F8F6F2",
  blush: "#F4E5E7",
  dustyRose: "#EFD9DD",
  lavenderMist: "#DCD6E8",
  softSage: "#D6E1D5",
  dustyBlue: "#B9CBD8",
  weatheredWood: "#C9C1B8",
  warmTaupe: "#B9AEA4",
  textPrimary: "#4F545A",
  textSecondary: "#8A8F94",
} as const;

export const gradients = {
  sky: `linear-gradient(180deg, ${colors.sky} 0%, #E3EBE6 34%, #DDE7DC 62%, ${colors.cream} 100%)`,
  glass:
    "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.18) 100%)",
  vignette:
    "radial-gradient(120% 90% at 50% 8%, rgba(255,255,255,0) 45%, rgba(79,84,90,0.06) 100%)",
} as const;

export const typography = {
  heading: "var(--font-heading)",
  body: "var(--font-body)",
  sizes: {
    display: "2.5rem",
    h1: "2rem",
    h2: "1.5rem",
    h3: "1.25rem",
    body: "1rem",
    small: "0.875rem",
    caption: "0.75rem",
  },
  tracking: {
    tight: "-0.01em",
    normal: "0",
    wide: "0.04em",
    wider: "0.08em",
  },
} as const;

export const spacing = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "2.5rem",
  "3xl": "3.5rem",
} as const;

export const radii = {
  sm: "14px",
  md: "20px",
  lg: "26px",
  xl: "30px",
  "2xl": "38px",
  full: "999px",
} as const;

export const shadows = {
  soft: "0 12px 50px rgba(80,80,80,0.08)",
  lifted: "0 20px 60px rgba(80,80,80,0.12)",
  glow: "0 0 0 1px rgba(255,255,255,0.35) inset",
} as const;

export const blur = {
  sm: "12px",
  md: "20px",
  lg: "32px",
} as const;

export const motion = {
  duration: {
    fast: 0.25,
    base: 0.45,
    slow: 0.7,
    cloud: 38,
    breathing: 4.2,
    float: 6,
  },
  easing: {
    soft: [0.22, 1, 0.36, 1] as const,
    gentle: [0.4, 0, 0.2, 1] as const,
  },
} as const;

export const iconSizes = {
  sm: 18,
  md: 24,
  lg: 32,
  xl: 44,
} as const;

export const layout = {
  maxWidth: "480px",
  desktopMaxWidth: "1120px",
  touchTarget: "44px",
  navHeight: "78px",
  headerHeight: "72px",
} as const;

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  radii,
  shadows,
  blur,
  motion,
  iconSizes,
  layout,
} as const;

export type Theme = typeof theme;
export default theme;
