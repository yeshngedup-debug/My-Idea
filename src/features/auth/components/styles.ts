import type { CSSProperties } from "react";

/**
 * Shared focus treatment for auth-page text links. Mirrors the `focusRing`
 * constant used by the marketing header, so keyboard focus is visible without
 * changing how the links look at rest.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]";

/**
 * Display face for auth headings. The root supplies Plus Jakarta Sans as the
 * primary premium grotesk through `--font-display`; Outfit and Geist remain as
 * inherited fallbacks. No font package is bundled here.
 */
export const displayFont: CSSProperties = {
  fontFamily: "var(--font-display, var(--font-outfit, var(--font-geist)))",
};

/**
 * One quiet field surface shared by every auth form: a tall, hairline teal
 * border, an inset top highlight and a soft teal focus halo. The glass wash of
 * the card behind it stays solid so no blur is applied to scrolling content.
 */
export const authInputClassName = [
  "w-full min-w-0 rounded-xl border border-[#b9dede] bg-white px-4 py-3.5",
  "text-base text-[#0b2e2e] placeholder:text-[#356464] sm:text-sm",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
  "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)]",
  "focus-visible:border-[#0b5c5c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#66bfbf]/25",
].join(" ");

/**
 * Motion for the auth screens, kept here so no new CSS file is needed. The
 * shell renders this once for every auth page. Only transform, opacity and
 * colour are animated; every rule is short and is removed entirely under
 * prefers-reduced-motion. Deliberately no layout-property animation, no keyed
 * route transitions and no JS/rAF loops. The single magenta primary action is
 * a nested pill: a black-text label beside a circular icon well that nudges on
 * hover while the whole control presses to 0.98.
 */
export const authMotionStyles = `
  @keyframes auth-card-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  /* One entrance, consumed once per document. The selector also overrides the
     older shell CSS so the timing and distance stay consistent and small. */
  [data-auth-card][data-auth-enter] {
    animation: auth-card-in 200ms var(--ease-out) both !important;
  }

  @keyframes auth-message-in {
    from { opacity: 0; transform: translate3d(0, 4px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  /* Validation and status messages only appear on submit/redirect, so this
     never fires on keystrokes. */
  [data-auth-message] {
    animation: auth-message-in 180ms var(--ease-out) both;
  }

  /* The shared SubmitButton swaps its label for a span only while pending;
     fade that in without touching the button component or its live region. */
  [data-auth-card] button[type="submit"] > span {
    animation: auth-message-in 180ms var(--ease-out) both;
  }

  /* The single magenta primary action. Colour, radius and press feedback are
     retargeted here so the shared, accessible SubmitButton keeps its API and
     pending/live-region behaviour untouched. */
  [data-auth-card] button[type="submit"] {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 48px;
    padding: 0.75rem 3.75rem 0.75rem 1.5rem;
    border-radius: 9999px;
    font-weight: 600;
    letter-spacing: -0.01em;
    background-color: #ff0063 !important;
    color: #000000 !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.24),
      0 12px 26px -20px rgba(255, 0, 99, 0.6);
    transition:
      transform 240ms var(--ease-out),
      background-color 200ms var(--ease-out),
      box-shadow 240ms var(--ease-out) !important;
  }

  [data-auth-card] button[type="submit"]:hover:not(:disabled) {
    background-color: #d40054 !important;
  }

  /* The nested circular icon well: a black-tinted disc that carries a light
     chevron. Both layers move together so the control reads as one object. */
  [data-auth-card] button[type="submit"]::before {
    content: "";
    position: absolute;
    right: 0.375rem;
    top: 50%;
    width: 2.25rem;
    height: 2.25rem;
    margin-top: -1.125rem;
    border-radius: 9999px;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
    transition: transform 240ms var(--ease-out);
  }

  [data-auth-card] button[type="submit"]::after {
    content: "";
    position: absolute;
    right: 1.25rem;
    top: 50%;
    width: 0.5rem;
    height: 0.5rem;
    margin-top: -0.375rem;
    border-top: 1.5px solid #000000;
    border-right: 1.5px solid #000000;
    transform: rotate(45deg);
    transition: transform 240ms var(--ease-out);
  }

  [data-auth-card] button[type="submit"]:hover:not(:disabled)::before {
    transform: translateX(2px) scale(1.04);
  }

  [data-auth-card] button[type="submit"]:hover:not(:disabled)::after {
    transform: translateX(2px) rotate(45deg);
  }

  /* The shared spinner inherits a cream tint; retarget it to ink on magenta. */
  [data-auth-card] button[type="submit"] > span > span[aria-hidden="true"] {
    border-color: rgba(0, 0, 0, 0.35) !important;
    border-top-color: #000000 !important;
  }

  /* Ink reads against magenta; the default bright ring does not. */
  [data-auth-card] button[type="submit"]:focus-visible {
    outline-color: #0b2e2e !important;
  }

  [data-auth-card] button[type="submit"]:active:not(:disabled) {
    transform: scale(0.98) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    [data-auth-card][data-auth-enter],
    [data-auth-message],
    [data-auth-card] button[type="submit"] > span {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    [data-auth-card] button[type="submit"] {
      transition: none !important;
    }
    [data-auth-card] button[type="submit"]::before,
    [data-auth-card] button[type="submit"]::after {
      transition: none !important;
    }
    [data-auth-card] button[type="submit"]::before {
      transform: none !important;
    }
    [data-auth-card] button[type="submit"]::after {
      transform: rotate(45deg) !important;
    }
    [data-auth-card] button[type="submit"]:active:not(:disabled) {
      transform: none !important;
    }
  }
`;
