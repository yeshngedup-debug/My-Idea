import type { CSSProperties } from "react";

/**
 * Shared focus treatment for auth-page text links. Mirrors the `focusRing`
 * constant used by the marketing header, so keyboard focus is visible without
 * changing how the links look at rest.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]";

/**
 * Display face for auth headings. Read from the inherited `--font-outfit`
 * variable when the root supplies it, with the inherited body face as the
 * graceful fallback. No font package is bundled here.
 */
export const displayFont: CSSProperties = {
  fontFamily: "var(--font-outfit, var(--font-geist))",
};

/**
 * Motion for the auth screens, kept here so no new CSS file is needed. The
 * shell renders this once for every auth page. Only transform and opacity are
 * animated; every rule stays under 220ms and is removed entirely under
 * prefers-reduced-motion. Deliberately no layout-property animation, no keyed
 * route transitions and no JS/rAF loops.
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

  /* The single saffron primary action. Colour and press feedback are
     retargeted here so the shared, accessible SubmitButton keeps its API and
     pending/live-region behaviour untouched. */
  [data-auth-card] button[type="submit"] {
    background-color: #e8a317 !important;
    color: #0b1f1a !important;
    transition:
      transform 160ms var(--ease-out),
      background-color 150ms var(--ease-out) !important;
  }

  [data-auth-card] button[type="submit"]:hover:not(:disabled) {
    background-color: #d9950f !important;
  }

  /* Forest reads against saffron; the default vermilion ring does not. */
  [data-auth-card] button[type="submit"]:focus-visible {
    outline-color: #17352b !important;
  }

  [data-auth-card] button[type="submit"]:active {
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
    [data-auth-card] button[type="submit"]:active {
      transform: none !important;
    }
  }
`;
