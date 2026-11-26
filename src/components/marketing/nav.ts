/**
 * Shared constants for the public marketing pages.
 *
 * Every public page imports from here so labels and routes stay identical
 * across the header, footer, heroes and CTA bands.
 */

export const SITE = {
  name: "Bhutan Tech Connect",
  tagline: "Local talent. Real projects. Built in Bhutan.",
  homeHref: "/public",
} as const;

import { colors } from "@/lib/design-tokens";

/** Locked palette from the marketing design contract. Use the literal Tailwind
 * arbitrary values in class names; this map is for reference and inline styles. */
export const PALETTE = {
  page: colors.page,
  surface: colors.surface,
  forest: colors.forest,
  forestHover: colors.forestHover,
  vermilion: colors.accent,
  amber: colors.amber,
  amberDeep: colors.amberDisplay,
  ink: colors.ink,
} as const;

export type NavLink = {
  label: string;
  href: string;
};

/** Primary desktop and mobile navigation. Order is fixed across all pages. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "For students", href: "/for-students" },
  { label: "For founders", href: "/for-founders" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

/** Utility links shown in the footer. */
export const UTILITY_LINKS: readonly NavLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export const LOGIN_LINK: NavLink = { label: "Log in", href: "/login" };

/** One label per intent. Never invent a second label for the same action. */
export const CTA_LABELS = {
  signup: "Create student account",
  login: "Log in",
  seeHow: "See how it works",
  contact: "Contact us",
  closingEyebrow: "Make your next move",
} as const;

export const CTA_HREFS = {
  signup: "/signup",
  login: "/login",
  howItWorks: "/how-it-works",
  contact: "/contact",
} as const;

export type MarketingImage = {
  src: string;
  alt: string;
};

export type Cta = {
  href: string;
  label: string;
};

/** Consistent active-route check. `/public` is the marketing home. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
