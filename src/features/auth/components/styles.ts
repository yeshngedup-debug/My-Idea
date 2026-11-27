/**
 * Shared surfaces for the auth routes.
 *
 * The auth pages are a product flow, not a marketing page: one white work
 * surface, squared edges that match the brand's action language, teal rules,
 * and magenta reserved for the single filled submit action.
 */

/** Focus treatment for links and controls on the white auth surface. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** Focus treatment for links on the deep teal footer. */
export const focusRingOnDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66bfbf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2e2e]";

/**
 * One field surface shared by every auth form: a squared, clearly bounded
 * teal field on paper. The border carries the 3:1 contrast a control needs to
 * read as a field, the type stays at 16px so a phone never zooms, and the
 * surface is at least 44px tall so it is a comfortable tap target.
 */
export const authInputClassName = [
  "w-full min-w-0 min-h-11 rounded-[2px] border border-[#4d8c8c] bg-white px-4 py-3",
  "text-base leading-6 text-[#0b2e2e] placeholder:text-[#356464]",
  "transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none",
  "focus-visible:border-[#0b2e2e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0b5c5c]/25",
].join(" ");

/**
 * An invalid field keeps the same surface and turns the edge to the error
 * role, so the state stays visible while the field is focused.
 */
export const authInputErrorClassName =
  "border-[#c2004b] focus-visible:border-[#c2004b] focus-visible:ring-[#c2004b]/30";

/** Field labels: short, dark, and never competing with the value. */
export const authLabelClassName =
  "block text-[14px] font-semibold leading-5 text-[#0b2e2e]";

/** Supporting copy under a field. */
export const authHintClassName = "text-[13px] leading-5 text-[#356464]";

/**
 * The quiet peer action: a text link with an underline that turns magenta on
 * hover. Magenta stays a marker here, so the filled submit remains the only
 * filled action in the view.
 */
export const authLinkClassName = [
  "font-semibold text-[#0b5c5c] underline decoration-[#b9dede] underline-offset-4",
  "transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none",
  "hover:text-[#0b2e2e] hover:decoration-[#ff0063]",
].join(" ");
