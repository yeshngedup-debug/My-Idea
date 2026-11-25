"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import pressStyles from "@/styles/pressable.module.css";
import {
  CTA_HREFS,
  CTA_LABELS,
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  isActivePath,
} from "./nav";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]";

/** Mirrors the --ease-out token in app/globals.css. */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SiteHeader() {
  const pathname = usePathname();
  // Founder pages must not offer a student signup as the primary action.
  // `/contact` already is the founder destination, so its header CTA is hidden
  // instead of self-linking back to the page the reader is on.
  const onContact = pathname === "/contact";
  const founderContext =
    onContact ||
    pathname?.startsWith("/for-founders") ||
    pathname?.startsWith("/founder");
  const primaryHref = founderContext ? CTA_HREFS.contact : CTA_HREFS.signup;
  const primaryLabel = founderContext
    ? "Ask for founder access"
    : CTA_LABELS.signup;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  // Only the threshold crossing changes state, so scrolling does not re-render.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A short menu rise: opacity plus a 6px lift, no scale and no spring.
  // Reduced motion collapses to opacity only.
  const menuHidden = reduce ? { opacity: 0 } : { opacity: 0, y: 6 };
  const menuShown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  const menuTransition = { duration: 0.15, ease: EASE_OUT };

  return (
    <header className="sticky top-0 z-50">
      <div className="site-chrome" data-scrolled={scrolled}>
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-12"
        >
          <Link
            href={SITE.homeHref}
            className={cn("pressable flex shrink-0 items-center gap-2", pressStyles.press, focusRing)}
          >
            <Logo size="h-7 w-7" />
            <span className="text-sm font-medium text-[#17352b] sm:text-base">
              {SITE.name}
            </span>
          </Link>

          <LayoutGroup id="site-nav">
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "pressable relative inline-flex min-h-11 items-center text-sm font-medium",
                    pressStyles.press,
                    focusRing,
                    active ? "text-[#17352b]" : "text-[#5e554a] hover:text-[#17352b]",
                  )}
                >
                  {link.label}
                  {/* One shared hairline moves with the active route. It is a
                      transform-only layout animation, not a new decoration. */}
                  {active ? (
                    <motion.span
                      layoutId="site-nav-hairline"
                      aria-hidden="true"
                      transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
                      className="absolute inset-x-0 bottom-2 h-px bg-[#d84f37]"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
          </LayoutGroup>

          <div className="hidden shrink-0 items-center gap-4 md:flex lg:justify-self-end">
            <Link
              href={LOGIN_LINK.href}
              className={cn(
                "pressable hidden min-h-11 items-center text-sm font-medium text-[#17352b] hover:text-[#b23c26] sm:inline-flex",
                pressStyles.press,
                focusRing,
              )}
            >
              {LOGIN_LINK.label}
            </Link>
            {onContact ? null : (
              <Link
                href={primaryHref}
                className={cn(
                  "pressable inline-flex min-h-11 items-center rounded-lg bg-[#E8A317] px-5 py-2.5 text-sm font-semibold text-[#0B1F1A] hover:bg-[#d9950f]",
                  pressStyles.press,
                  focusRing,
                )}
              >
                {primaryLabel}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={open ? "marketing-mobile-nav" : undefined}
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "pressable inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#18251f]/10 text-[#17352b] lg:hidden",
              pressStyles.press,
              focusRing,
            )}
          >
            {open ? (
              <X aria-hidden="true" size={16} strokeWidth={1.5} />
            ) : (
              <List aria-hidden="true" size={16} strokeWidth={1.5} />
            )}
          </button>
        </nav>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="mobile-nav"
            id="marketing-mobile-nav"
            initial={menuHidden}
            animate={menuShown}
            exit={menuHidden}
            transition={menuTransition}
            style={{ transformOrigin: "top center" }}
            className="absolute inset-x-0 top-full border-b border-[#18251f]/10 bg-[#fffefa] px-5 py-4 sm:px-8 lg:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-[1440px] flex-col"
            >
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "pressable flex min-h-11 items-center border-b border-[#18251f]/10 text-sm font-medium last:border-b-0",
                      pressStyles.press,
                      focusRing,
                      active ? "text-[#17352b]" : "text-[#5e554a]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 grid gap-2 border-t border-[#18251f]/10 pt-4 md:hidden">
                <Link
                  href={LOGIN_LINK.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "pressable inline-flex min-h-11 items-center justify-center rounded-lg border border-[#18251f]/10 px-4 text-sm font-medium text-[#17352b]",
                    pressStyles.press,
                    focusRing,
                  )}
                >
                  {LOGIN_LINK.label}
                </Link>
                {onContact ? null : (
                  <Link
                    href={primaryHref}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-[#E8A317] px-4 text-sm font-semibold text-[#0B1F1A]",
                      pressStyles.press,
                      focusRing,
                    )}
                  >
                    {primaryLabel}
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
