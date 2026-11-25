/**
 * Bhutan Tech Connect — canonical design tokens.
 *
 * Warm paper, forest ink, vermilion and amber, paired with editorial Geist
 * type, generous spacing and restrained motion. This module is the single
 * typed source of truth for the visual language. `app/globals.css` mirrors the
 * colour, radius and motion values for Tailwind/CSS; keep the two in sync.
 *
 * The old `designTokens` object and its helpers are kept for additive
 * compatibility (they are currently unused by the app). New work should use
 * the named role constants below.
 */

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

export const colors = {
  /* Surfaces and lines */
  page: "#f5f2ea",
  surface: "#fffefa",
  surfaceMuted: "#eeeae1",
  secondary: "#eae5d9",
  border: "#ded8cb",
  borderHover: "#cfc6b6",
  input: "#ded8cb",

  /* Ink */
  ink: "#18251f",
  /** Quiet ink for metadata and inactive controls on paper; CSS: --color-ink-soft. */
  inkSoft: "#4c5a52",
  textSecondary: "#56645c",
  /** Canonical body-copy roles. 5.57:1 on paper; use instead of opacity greys. */
  body: "#18251f",
  bodySecondary: "#56645c",
  textMuted: "#657069",
  textMutedLegacy: "#748078",
  textDim: "#9da49e",
  onDark: "#fffefa",

  /* Primary action: forest. Headings use the same green. */
  forest: "#17352b",
  forestHover: "#244b3e",
  heroInk: "#101d17",

  /* The single filled CTA role (mirrors --color-cta* in app/globals.css).
     Shares the amber primitive value, but this is the action role, not a
     highlight: one filled action per view, peers stay outline or quiet. */
  cta: "#fbbf24",
  ctaHover: "#e7b648",
  onCta: "#17352b",
  /** Stronger edge for grouped surfaces on cream; mirrors --color-border-strong. */
  borderStrong: "#cfc6b6",

  /* Warm accent: vermilion. The deep tone is for small text and focus rings;
     CSS mirrors it as --color-accent-deep. */
  accent: "#d84f37",
  accentHover: "#b44532",
  smallTextAccent: "#b23c26",
  onAccent: "#fffefa",

  /* Amber highlight. Display and logo tones are the rendered variants. */
  amber: "#fbbf24",
  amberDisplay: "#e7b648",
  amberLogo: "#e0ad3c",

  /* Status */
  success: "#377553",
  successBg: "#e7f2e9",
  successBorder: "#bad8c2",
  successText: "#286341",
  error: "#c24132",
  errorBg: "#fcebea",
  errorBorder: "#f0c4bd",
  errorText: "#9d3328",
  info: "#466e8c",
  infoBg: "#e9f1f5",
  infoBorder: "#c7dce8",
  infoText: "#345a76",
  destructive: "hsl(0 84.2% 60.2%)",

  /* Focus */
  focus: "#d84f37",
} as const;

/** Alias for callers that prefer the longer name. */
export const brandColors = colors;

export type ColorRole = keyof typeof colors;

/** The seven headline roles used in the brand guidelines. */
export const palette = {
  page: colors.page,
  surface: colors.surface,
  ink: colors.ink,
  body: colors.body,
  bodySecondary: colors.bodySecondary,
  primaryAction: colors.forest,
  smallTextAccent: colors.smallTextAccent,
  warmAccent: colors.accent,
  amberHighlight: colors.amber,
  cta: colors.cta,
} as const;

export type PaletteRole = keyof typeof palette;

/* -------------------------------------------------------------------------- */
/* Space and shape                                                            */
/* -------------------------------------------------------------------------- */

/** 4px-based rhythm; rem values match Tailwind utility steps. */
export const spacing = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export type SpacingStep = keyof typeof spacing;

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
} as const;

export type RadiusStep = keyof typeof radii;

/**
 * Two soft, offset elevation steps, mirrored as --shadow-card and
 * --shadow-card-raised in app/globals.css. Use `card` for ordinary groups and
 * `cardRaised` for the one or two cards that carry extra importance.
 */
export const elevation = {
  card: "0 1px 2px rgb(24 37 31 / 0.06), 0 1px 3px rgb(24 37 31 / 0.04)",
  cardRaised: "0 6px 18px rgb(24 37 31 / 0.09), 0 2px 6px rgb(24 37 31 / 0.05)",
} as const;

export type ElevationRole = keyof typeof elevation;

/** WCAG 2.5.8 floor for interactive controls, plus the inline-link floor. */
export const touchTarget = {
  min: "44px",
  inlineMin: "24px",
} as const;

/** Focus appearance used by `focus-visible` utilities across the app. */
export const focus = {
  ringWidth: "2px",
  ringColor: colors.accent,
  ringOffset: "2px",
} as const;

/* -------------------------------------------------------------------------- */
/* Motion — mirrors the custom properties in app/globals.css                  */
/* -------------------------------------------------------------------------- */

export const motion = {
  easing: {
    /** Matches --ease-out in app/globals.css. */
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
    inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
  },
  duration: {
    instant: "100ms",
    fast: "150ms",
    base: "250ms",
    /** Inline on `.bento-cell .bento-zoom` in globals.css. */
    slow: "700ms",
  },
  pressScale: 0.98,
  figureZoom: 1.02,
  bentoZoom: 1.04,
} as const;

export type MotionDuration = keyof typeof motion.duration;

/* -------------------------------------------------------------------------- */
/* Type — Geist via next/font (--font-geist), with size-specific tracking      */
/* -------------------------------------------------------------------------- */

export const fontFamily = {
  sans: "var(--font-geist)",
  sansFallback: "ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, Cambria, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export const tracking = {
  tightest: "-0.09em",
  tighter: "-0.06em",
  tight: "-0.04em",
  heading: "-0.02em",
  normal: "0",
  /** Short labels only. Long uppercase spans should not use these steps. */
  label: "0.08em",
  wide: "0.14em",
  wider: "0.2em",
} as const;

export type TrackingStep = keyof typeof tracking;

/**
 * Measured scale: unitless leading (tight for short headings, 1.65 for long
 * copy), sizes descending by level, tracking in em and zero on body copy.
 * Headings take the weight; labels and supporting text stay regular so they
 * no longer compete at the same mid weight.
 */
export const typeScale = {
  display: {
    size: "clamp(4rem, 9vw, 6rem)",
    lineHeight: "1.1",
    tracking: tracking.tighter,
    weight: 600,
  },
  pageTitle: {
    size: "clamp(3.25rem, 7vw, 6rem)",
    lineHeight: "1.05",
    tracking: tracking.tight,
    weight: 600,
  },
  h1: {
    size: "clamp(2.5rem, 5vw, 4.5rem)",
    lineHeight: "1.08",
    tracking: tracking.tight,
    weight: 600,
  },
  h2: {
    size: "clamp(1.75rem, 3.4vw, 3rem)",
    lineHeight: "1.18",
    tracking: tracking.heading,
    weight: 600,
  },
  h3: {
    size: "1.5rem",
    lineHeight: "1.25",
    tracking: tracking.heading,
    weight: 600,
  },
  body: {
    size: "1rem",
    lineHeight: "1.65",
    tracking: tracking.normal,
    weight: 400,
  },
  small: {
    size: "0.875rem",
    lineHeight: "1.55",
    tracking: tracking.normal,
    weight: 400,
  },
  /** Short, natural-case labels. Keep these rare; the heading does the work. */
  eyebrow: {
    size: "0.75rem",
    lineHeight: "1.3",
    tracking: tracking.label,
    weight: 500,
  },
  microLabel: {
    size: "0.75rem",
    lineHeight: "1.3",
    tracking: tracking.wide,
    weight: 500,
  },
} as const;

export type TypeRole = keyof typeof typeScale;

/* -------------------------------------------------------------------------- */
/* Elevation — values actually used by the app                                */
/* -------------------------------------------------------------------------- */

export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 30,
  chrome: 40,
  header: 50,
  tooltip: 50,
  skipLink: 50,
} as const;

export type ZIndexRole = keyof typeof zIndex;

/* -------------------------------------------------------------------------- */
/* Additive compatibility: original aggregate object and helpers              */
/* -------------------------------------------------------------------------- */

export const designTokens = {
  colors: {
    background: colors.page,
    backgroundSecondary: colors.secondary,
    surface: colors.surface,
    border: colors.border,
    borderHover: colors.borderHover,
    textPrimary: colors.ink,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMutedLegacy,
    textDim: colors.textDim,
    accent: colors.accent,
    accentHover: colors.accentHover,
    accentText: colors.onAccent,
    success: colors.success,
    successBg: colors.successBg,
    successBorder: colors.successBorder,
    successText: colors.successText,
    error: colors.error,
    errorBg: colors.errorBg,
    errorBorder: colors.errorBorder,
    errorText: colors.errorText,
    info: colors.info,
    infoBg: colors.infoBg,
    infoBorder: colors.infoBorder,
    infoText: colors.infoText,
    focus: colors.focus,
  },
  landing: {
    background: colors.page,
    backgroundSecondary: colors.secondary,
    surface: colors.surface,
    border: colors.border,
    borderHover: colors.borderHover,
    textPrimary: colors.ink,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMutedLegacy,
    textDim: colors.textDim,
    primary: colors.forest,
    primaryHover: colors.forestHover,
    primaryText: colors.onDark,
    accent: colors.accent,
    accentHover: colors.accentHover,
    accentText: colors.onAccent,
    hero: colors.forest,
    ink: colors.heroInk,
  },
  typography: {
    fontSans: fontFamily.sans,
    fontSansFallback: fontFamily.sansFallback,
    fontSerif: fontFamily.serif,
    fontMono: fontFamily.mono,
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },
  spacing,
  radius: radii,
  touchTarget,
  focus: {
    ring: `2px solid ${colors.accent}`,
    ringOffset: focus.ringOffset,
  },
} as const;

export type DesignTokens = typeof designTokens;

export function color(path: keyof DesignTokens["colors"]): string {
  return designTokens.colors[path];
}

export function space(path: keyof DesignTokens["spacing"]): string {
  return designTokens.spacing[path];
}

export function radius(path: keyof DesignTokens["radius"]): string {
  return designTokens.radius[path];
}
