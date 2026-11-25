/**
 * Shared focus treatment for auth-page text links. Mirrors the `focusRing`
 * constant used by the marketing header, so keyboard focus is visible without
 * changing how the links look at rest. The auth forms now sit on the paper
 * band of the editorial shell, so the ring offset is white.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/**
 * One quiet field surface shared by every auth form: a squared, hairline teal
 * border on paper, matching the editorial rule language used across the
 * marketing site. The surface stays solid so no blur is applied to scrolling
 * content.
 */
export const authInputClassName = [
  "w-full min-w-0 rounded-[2px] border border-[#b9dede] bg-white px-4 py-3.5",
  "text-base text-[#0b2e2e] placeholder:text-[#356464] sm:text-sm",
  "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)]",
  "focus-visible:border-[#0b5c5c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#66bfbf]/25",
].join(" ");
