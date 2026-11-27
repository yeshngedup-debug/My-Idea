/**
 * Shared marketing class tokens.
 *
 * Kept in a plain module (no JSX, no React imports) so both the server-render
 * marketplace kit and the client site header can use the same button and
 * focus-ring vocabulary without pulling either one into the other's bundle.
 */

/** Focus ring on white and mist surfaces. Deep magenta reads clearly on both. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const focusRingMist =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]";

/** On deep teal the ring is magenta so it separates from the surface. */
export const focusRingDeep =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2e2e]";

export const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] border px-4 py-2 text-[13px] font-semibold leading-5 tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

export type MarketButtonVariant =
  /** The one high-emphasis action of a view. Black text on magenta. */
  | "primary"
  /** Solid teal: a real action that is not the view's emphasis. */
  | "solid"
  /** White surface with a teal edge: a peer action. */
  | "outline"
  /** Text-only peer action. */
  | "quiet"
  /** Outline action on a deep teal band. */
  | "onDeep"
  /** Solid white action on a deep teal band. */
  | "onDeepSolid";

export const marketButtonVariants: Record<MarketButtonVariant, string> = {
  primary: `border-[#ff0063] bg-[#ff0063] text-black hover:border-[#d40054] hover:bg-[#d40054] ${focusRing}`,
  solid: `border-[#0b5c5c] bg-[#0b5c5c] text-white hover:border-[#0b2e2e] hover:bg-[#0b2e2e] ${focusRing}`,
  outline: `border-[#0b5c5c]/45 bg-white text-[#0b2e2e] hover:border-[#0b5c5c] hover:bg-[#eaf6f6] ${focusRing}`,
  quiet: `border-transparent text-[#0b2e2e] underline decoration-[#0b5c5c]/40 underline-offset-4 hover:decoration-[#ff0063] ${focusRing}`,
  onDeep: `border-white/45 bg-transparent text-white hover:border-white hover:bg-white/10 ${focusRingDeep}`,
  onDeepSolid: `border-white bg-white text-[#0b2e2e] hover:border-[#eaf6f6] hover:bg-[#eaf6f6] ${focusRingDeep}`,
};

/** The compact header action: a 44px target that never pushes the logo out. */
export const headerActionClass = `inline-flex min-h-11 items-center justify-center rounded-[3px] border border-[#0b5c5c] bg-[#0b5c5c] px-3.5 text-[12px] font-semibold leading-5 text-white transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#0b2e2e] hover:bg-[#0b2e2e] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing}`;

/** Footer links sit on deep teal: quiet until hovered, 44px tall, magenta ring. */
export const footerLinkClass =
  "inline-flex min-h-11 items-center text-[13px] text-[#eaf6f6]/80 transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2e2e] motion-reduce:transition-none";

/** The small uppercase label above each footer column. */
export const footerColumnHeading =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b9dede]";
