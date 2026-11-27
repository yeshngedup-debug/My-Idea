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
  trustLine:
    "Human verification · Paid in Ngultrum · No bidding wars · Built in Bhutan",
} as const;

import { colors } from "@/lib/design-tokens";

/** Locked palette for the minimal design system. Prefer semantic token classes
 * in markup; this map is for reference and inline styles. */
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
  contact: "Ask for founder access",
  closingEyebrow: "Make your next move",
  explorePlatform: "Explore the platform",
  publicHome: "Visit the public home",
  studentGuide: "Explore the student guide",
  studentPath: "See the student path",
  founderPath: "See the founder path",
  howItWorks: "How it works",
  readProcess: "Read the process",
  pricing: "See pricing",
  browseProjects: "Browse projects",
  postProject: "Post a project",
  myApplications: "Go to my applications",
  faq: "Read the FAQ",
  faqPay: "Read the FAQ about pay",
  askUs: "Ask us something",
  contactTeam: "Contact the team",
  contactUs: "Contact us",
  about: "More about the platform",
  founders: "For founders",
  students: "For students",
  terms: "Read the terms of use",
  privacyPolicy: "Read the privacy policy",
  backHome: "Back to the homepage",
} as const;

export const CTA_HREFS = {
  signup: "/signup",
  login: "/login",
  howItWorks: "/how-it-works",
  contact: "/contact",
  home: SITE.homeHref,
  forStudents: "/for-students",
  forFounders: "/for-founders",
  about: "/about",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  /** In-page anchor on the founder page, where the packages live. */
  pricing: "#pricing",
  /** The same packages, reached from another page. */
  founderPricing: "/for-founders#pricing",
  studentProjects: "/student/projects",
  studentApplications: "/student/applications",
  founderShortlists: "/founder/shortlists",
  /** Founder posting happens inside a founder account. */
  founderPostProject: "/founder/projects/post",
} as const;

/** The single founder-access label and destination, used by header and footer. */
export const FOUNDER_ACCESS: NavLink = {
  label: CTA_LABELS.contact,
  href: CTA_HREFS.contact,
};

/** Footer "Start" column: the routes a visitor most likely wants next. */
export const FOOTER_START_LINKS: readonly NavLink[] = [
  { href: CTA_HREFS.signup, label: CTA_LABELS.signup },
  { href: CTA_HREFS.studentProjects, label: "Browse projects" },
  FOUNDER_ACCESS,
  { href: "/for-founders#pricing", label: CTA_LABELS.pricing },
  { href: CTA_HREFS.founderPostProject, label: CTA_LABELS.postProject },
];

/** Footer "More" column: the utility pages plus sign in. */
export const FOOTER_UTILITY_LINKS: readonly NavLink[] = [
  ...UTILITY_LINKS,
  LOGIN_LINK,
];

export type Cta = {
  href: string;
  label: string;
};

/** Absolute site paths and in-page anchors stay internal; mailto/external URLs do not. */
export function isInternalHref(href: string): boolean {
  if (href.startsWith("#")) return true;
  return href.startsWith("/") && !href.startsWith("//");
}

export type CtaIntent =
  | "audience"
  | "signup"
  | "student"
  | "founder"
  | "founderAccess"
  | "learn"
  | "seeHow"
  | "contact"
  | "login"
  | "explore"
  | "publicHome"
  | "about"
  | "studentGuide"
  | "studentPath"
  | "founderPath"
  | "founders"
  | "students"
  | "readProcess"
  | "pricing"
  | "browseProjects"
  | "postProject"
  | "faq"
  | "faqPay"
  | "askUs"
  | "contactTeam"
  | "contactUs"
  | "terms"
  | "privacyPolicy"
  | "backHome";

function isFounderContext(pathname: string | null): boolean {
  return (
    pathname === FOUNDER_ACCESS.href ||
    pathname?.startsWith("/for-founders") === true ||
    pathname?.startsWith("/founder") === true
  );
}

/**
 * One CTA resolver for every marketing surface. `audience` follows the page's
 * intent; explicit intents let heroes and closing bands name the same action.
 */
export function resolveAction(
  pathname: string | null,
  intent: CtaIntent = "audience",
): Cta {
  switch (intent) {
    case "signup":
    case "student":
      return { href: CTA_HREFS.signup, label: CTA_LABELS.signup };
    case "founder":
    case "founderAccess":
    case "contact":
      return { ...FOUNDER_ACCESS };
    case "learn":
    case "seeHow":
      return { href: CTA_HREFS.howItWorks, label: CTA_LABELS.seeHow };
    case "login":
      return { ...LOGIN_LINK };
    case "explore":
      return { href: CTA_HREFS.home, label: CTA_LABELS.explorePlatform };
    case "publicHome":
      return { href: CTA_HREFS.home, label: CTA_LABELS.publicHome };
    case "about":
      return { href: CTA_HREFS.about, label: CTA_LABELS.about };
    case "studentGuide":
      return { href: CTA_HREFS.forStudents, label: CTA_LABELS.studentGuide };
    case "studentPath":
      return { href: CTA_HREFS.forStudents, label: CTA_LABELS.studentPath };
    case "founderPath":
      return { href: CTA_HREFS.forFounders, label: CTA_LABELS.founderPath };
    case "founders":
      return { href: CTA_HREFS.forFounders, label: CTA_LABELS.founders };
    case "students":
      return { href: CTA_HREFS.forStudents, label: CTA_LABELS.students };
    case "readProcess":
      return { href: CTA_HREFS.howItWorks, label: CTA_LABELS.readProcess };
    case "pricing":
      return { href: CTA_HREFS.pricing, label: CTA_LABELS.pricing };
    case "browseProjects":
      return { href: CTA_HREFS.studentProjects, label: CTA_LABELS.browseProjects };
    case "postProject":
      return {
        href: CTA_HREFS.founderPostProject,
        label: CTA_LABELS.postProject,
      };
    case "faq":
      return { href: CTA_HREFS.faq, label: CTA_LABELS.faq };
    case "faqPay":
      return { href: CTA_HREFS.faq, label: CTA_LABELS.faqPay };
    case "askUs":
      return { href: CTA_HREFS.contact, label: CTA_LABELS.askUs };
    case "contactTeam":
      return { href: CTA_HREFS.contact, label: CTA_LABELS.contactTeam };
    case "contactUs":
      return { href: CTA_HREFS.contact, label: CTA_LABELS.contactUs };
    case "terms":
      return { href: CTA_HREFS.terms, label: CTA_LABELS.terms };
    case "privacyPolicy":
      return { href: CTA_HREFS.privacy, label: CTA_LABELS.privacyPolicy };
    case "backHome":
      return { href: CTA_HREFS.home, label: CTA_LABELS.backHome };
    case "audience":
    default:
      return isFounderContext(pathname)
        ? { ...FOUNDER_ACCESS }
        : { href: CTA_HREFS.signup, label: CTA_LABELS.signup };
  }
}

/** Header and footer always use the audience-aware primary action. */
export function resolvePrimaryCta(pathname: string | null): Cta {
  return resolveAction(pathname, "audience");
}

/** Consistent active-route check. `/public` is the marketing home. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
