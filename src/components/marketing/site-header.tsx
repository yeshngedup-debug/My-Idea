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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

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
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div
        data-scrolled={scrolled}
        className={cn(
          "mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 rounded-full border border-[#1B4D3E]/10 bg-white px-3 backdrop-blur-md transition-shadow duration-200 sm:px-4",
          scrolled
            ? "shadow-[0_10px_30px_-18px_rgba(11,31,26,0.35)]"
            : "shadow-[0_2px_14px_-10px_rgba(11,31,26,0.25)]",
        )}
      >
        <nav
          aria-label="Main navigation"
          className="grid w-full grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-4"
        >
          <Link
            href={SITE.homeHref}
            className={cn(
              "pressable flex min-h-11 shrink-0 items-center gap-2",
              pressStyles.press,
              focusRing,
            )}
          >
            <Logo size="h-7 w-7" />
            <span className="text-sm font-medium text-[#0B1F1A] sm:text-base">
              {SITE.name}
            </span>
          </Link>

          <LayoutGroup id="site-nav">
            <div className="hidden items-center gap-5 lg:flex xl:gap-7">
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
                      active
                        ? "text-[#1B4D3E]"
                        : "text-[#0B1F1A]/60 hover:text-[#1B4D3E]",
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
                        className="absolute inset-x-0 bottom-2 h-px bg-[#E8A317]"
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
                "pressable hidden min-h-11 items-center text-sm font-medium text-[#0B1F1A]/70 hover:text-[#1B4D3E] sm:inline-flex",
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
                  "pressable inline-flex min-h-11 items-center rounded-full bg-[#E8A317] px-5 py-2.5 text-sm font-semibold text-[#0B1F1A] hover:bg-[#d9950f]",
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
              "pressable inline-flex min-h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-full border border-[#1B4D3E]/15 text-[#1B4D3E] lg:hidden",
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
            className="absolute inset-x-3 top-full z-40 mt-2 sm:inset-x-6 lg:inset-x-8"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-[1200px] flex-col rounded-[20px] border border-[#1B4D3E]/10 bg-white p-4 shadow-[0_18px_40px_-22px_rgba(11,31,26,0.35)]"
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
                      "pressable flex min-h-11 items-center border-b border-[#1B4D3E]/10 text-sm font-medium last:border-b-0",
                      pressStyles.press,
                      focusRing,
                      active ? "text-[#1B4D3E]" : "text-[#0B1F1A]/70",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 grid gap-2 border-t border-[#1B4D3E]/10 pt-4 md:hidden">
                <Link
                  href={LOGIN_LINK.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "pressable inline-flex min-h-11 items-center justify-center rounded-full border border-[#1B4D3E]/15 px-4 text-sm font-medium text-[#1B4D3E]",
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
                      "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-4 text-sm font-semibold text-[#0B1F1A]",
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
