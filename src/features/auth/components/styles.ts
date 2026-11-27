/**
 * Shared presentation tokens for the auth routes.
 *
 * The auth pages are a product flow, not a marketing page: one white work
 * surface, calm hairlines, deep teal as the only accent, and quiet gray text
 * for every secondary action. No magenta, mint washes or decorative rules.
 */

/** Focus treatment for links and controls on the white auth surface. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * One field surface shared by every auth form. The type stays at 16px so a
 * phone never zooms, and the surface is at least 44px tall so it is a
 * comfortable tap target.
 */
export const authInputClassName = [
  "w-full min-w-0 min-h-11 rounded-lg border border-input bg-background px-4 py-3",
  "text-base leading-6 text-foreground placeholder:text-muted-foreground",
  "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
  "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
].join(" ");

/** An invalid field keeps the same surface and darkens its edge. */
export const authInputErrorClassName =
  "border-foreground/50 focus-visible:border-foreground/70 focus-visible:ring-foreground/20";

/** Field labels: short, dark, and never competing with the value. */
export const authLabelClassName =
  "block text-sm font-medium leading-5 text-foreground";

/** Supporting copy under a field. */
export const authHintClassName = "text-[13px] leading-5 text-muted-foreground";

/**
 * The quiet peer action: a text link with a hairline underline. Teal is the
 * only accent; hover moves to the foreground rather than introducing a second
 * color.
 */
export const authLinkClassName = [
  "font-medium text-accent underline decoration-border underline-offset-4",
  "transition-colors duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
  "hover:text-foreground hover:decoration-accent",
].join(" ");
