/**
 * Bhutan Tech Connect — canonical design tokens.
 *
 * The visual system is intentionally quiet: white pages, light gray surfaces,
 * near-black type, medium gray supporting copy, and one deep teal accent used
 * only for the most important action in a view. `app/globals.css` mirrors these
 * values for Tailwind and CSS; keep the two in sync.
 */

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

export const colors = {
  /* Surfaces and lines */
  page: "#ffffff",
  surface: "#ffffff",
  surfaceMuted: "#f5f5f7",
  secondary: "#f5f5f7",
  border: "#d2d2d7",
  borderHover: "#d2d2d7",
  input: "#d2d2d7",

  /* Ink */
  ink: "#1d1d1f",
  /** Quiet ink for metadata and inactive controls. */
  inkSoft: "#6e6e73",
  textSecondary: "#6e6e73",
  body: "#1d1d1f",
  bodySecondary: "#6e6e73",
  textMuted: "#6e6e73",
  textMutedLegacy: "#6e6e73",
  textDim: "#6e6e73",
  onDark: "#ffffff",

  /* Deep teal carries structure and the single primary action. */
  forest: "#0b5c5c",
  forestHover: "#0b5c5c",
  heroInk: "#1d1d1f",

  /* The one filled CTA role. White text meets AA on deep teal. */
  cta: "#0b5c5c",
  ctaHover: "#0b5c5c",
  onCta: "#ffffff",
  borderStrong: "#d2d2d7",

  accent: "#0b5c5c",
  accentHover: "#0b5c5c",
  smallTextAccent: "#0b5c5c",
  onAccent: "#ffffff",

  /* Legacy aliases retained for call-site compatibility. */
  amber: "#0b5c5c",
  amberDisplay: "#0b5c5c",
  amberLogo: "#0b5c5c",

  /* Status roles stay quiet and semantic. */
  success: "#0b5c5c",
  successBg: "#f5f5f7",
  successBorder: "#d2d2d7",
  successText: "#0b5c5c",
  error: "#b42318",
  errorBg: "#f5f5f7",
  errorBorder: "#d2d2d7",
  errorText: "#b42318",
  info: "#1d1d1f",
  infoBg: "#f5f5f7",
  infoBorder: "#d2d2d7",
  infoText: "#1d1d1f",
  destructive: "#b42318",

  focus: "#0b5c5c",

  brand: "#0b5c5c",
  mist: "#f5f5f7",
  magenta: "#0b5c5c",
  brandText: "#0b5c5c",
  accentText: "#0b5c5c",
  onMagenta: "#ffffff",
  magentaHover: "#0b5c5c",
  borderInput: "#d2d2d7",
} as const;

/** Alias for callers that prefer the longer name. */
export const brandColors = colors;

export type ColorRole = keyof typeof colors;

/** Headline roles used across product and marketing surfaces. */
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

/** Restrained elevation for the few surfaces that need separation. */
export const elevation = {
  card: "0 1px 2px rgb(29 29 31 / 0.035)",
  cardRaised: "0 8px 30px rgb(29 29 31 / 0.06)",
} as const;

export type ElevationRole = keyof typeof elevation;

export const touchTarget = {
  min: "44px",
  inlineMin: "24px",
} as const;

export const focus = {
  ringWidth: "2px",
  ringColor: colors.smallTextAccent,
  ringOffset: "2px",
} as const;

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

export const motion = {
  easing: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
    inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
  },
  duration: {
    instant: "100ms",
    fast: "150ms",
    base: "200ms",
  },
  pressScale: 1,
} as const;

export type MotionDuration = keyof typeof motion.duration;

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

export const fontFamily = {
  sans: "var(--font-geist)",
  sansFallback: "ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, Cambria, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export const tracking = {
  tightest: "-0.05em",
  tighter: "-0.045em",
  tight: "-0.04em",
  heading: "-0.03em",
  normal: "0",
  label: "0",
  wide: "0.04em",
  wider: "0.08em",
} as const;

export type TrackingStep = keyof typeof tracking;

export const typeScale = {
  display: {
    size: "clamp(2.75rem, 7vw, 5.25rem)",
    lineHeight: "1.04",
    tracking: tracking.tighter,
    weight: 600,
  },
  pageTitle: {
    size: "clamp(2.5rem, 5vw, 4rem)",
    lineHeight: "1.08",
    tracking: tracking.tight,
    weight: 600,
  },
  h1: {
    size: "clamp(2.25rem, 4.5vw, 3.5rem)",
    lineHeight: "1.08",
    tracking: tracking.tight,
    weight: 600,
  },
  h2: {
    size: "clamp(1.875rem, 3vw, 2.75rem)",
    lineHeight: "1.14",
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
    size: "1.0625rem",
    lineHeight: "1.6",
    tracking: tracking.normal,
    weight: 400,
  },
  small: {
    size: "0.875rem",
    lineHeight: "1.55",
    tracking: tracking.normal,
    weight: 400,
  },
  eyebrow: {
    size: "0.875rem",
    lineHeight: "1.4",
    tracking: tracking.normal,
    weight: 500,
  },
  microLabel: {
    size: "0.8125rem",
    lineHeight: "1.4",
    tracking: tracking.normal,
    weight: 500,
  },
} as const;

export type TypeRole = keyof typeof typeScale;

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
/* Additive compatibility                                                     */
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
    ring: `2px solid ${colors.smallTextAccent}`,
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
