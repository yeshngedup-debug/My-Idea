"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import pressStyles from "@/styles/pressable.module.css";
import {
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  isActivePath,
  resolvePrimaryCta,
} from "./nav";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** Mirrors the --ease-out token in app/globals.css. */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** The slower, structural curve used for section entries and link reveals. */
const EASE_REVEAL: [number, number, number, number] = [0.32, 0.72, 0, 1];

/**
 * Scroll entry shared by the public marketing pages. Fades content up from
 * 16 (4rem) with a soft blur using IntersectionObserver through motion —
 * there is no window scroll listener. Reduced motion renders statically.
 *
 * It lives in this already-client module so page files can remain Server
 * Components and keep their async data fetches and metadata exports.
 */
export function MarketingReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: EASE_REVEAL }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Site chrome: a full-bleed paper masthead, not a floating pill. One white
 * bar, one hairline, a wide-tracked link row, and the single magenta action.
 * The active route is marked by a two-pixel magenta rule that slides between
 * links; it is the only decoration in the bar.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const primaryCta = resolvePrimaryCta(pathname);
  const hidePrimary = primaryCta.href === pathname;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Only the threshold crossing changes state, so scrolling does not re-render.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The overlay owns focus while it is open: move focus in, trap Tab inside,
  // close on Escape, lock scrolling, and make the rest of the page inert.
  useEffect(() => {
    if (!open) return;

    const menuButton = menuButtonRef.current;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuButton;
    const returnFocus = returnFocusRef.current;

    const header = headerRef.current;
    const previousInert = new Map<HTMLElement, boolean>();
    const setInert = (element: HTMLElement | null, value: boolean) => {
      if (!element) return;
      previousInert.set(element, element.hasAttribute("inert"));
      element.toggleAttribute("inert", value);
    };

    Array.from(document.body.children).forEach((child) => {
      if (child instanceof HTMLElement && child !== header) {
        setInert(child, true);
      }
    });
    setInert(barRef.current, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousInert.forEach((wasInert, element) => {
        element.toggleAttribute("inert", wasInert);
      });
      (returnFocus ?? menuButton)?.focus();
    };
  }, [open]);

  // A short menu rise: opacity plus a 6px lift, no scale and no spring.
  const menuHidden = reduce ? { opacity: 0 } : { opacity: 0, y: 8 };
  const menuShown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  const menuTransition = { duration: 0.16, ease: EASE_OUT };

  // Staggered sheet rows: a 40px rise from opacity 0. Reduced motion drops
  // the translate and the delay.
  const rowHidden = reduce ? { opacity: 0 } : { opacity: 0, y: 40 };
  const rowShown = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  const rowTransition = (index: number) => ({
    duration: reduce ? 0 : 0.45,
    delay: reduce ? 0 : 0.08 + index * 0.045,
    ease: EASE_REVEAL,
  });

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white">
      <div
        ref={barRef}
        data-scrolled={scrolled}
        className={cn(
          "border-b transition-colors duration-200 motion-reduce:transition-none",
          scrolled ? "border-[#0b2e2e]/20" : "border-[#0b2e2e]/10",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link
            href={SITE.homeHref}
            className={cn(
              "pressable flex min-h-11 shrink-0 items-center gap-2.5",
              pressStyles.press,
              focusRing,
            )}
          >
            <Logo size="h-7 w-7" />
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#0b2e2e]">
              {SITE.name}
            </span>
          </Link>

          <LayoutGroup id="site-nav">
            <nav
              aria-label="Main navigation"
              className="hidden h-16 items-stretch lg:flex"
            >
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "pressable relative inline-flex items-center px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-150",
                      pressStyles.press,
                      focusRing,
                      active
                        ? "text-[#0b2e2e]"
                        : "text-[#356464] hover:text-[#0b2e2e]",
                    )}
                  >
                    {link.label}
                    {active ? (
                      <motion.span
                        layoutId="site-nav-rule"
                        aria-hidden="true"
                        transition={{
                          duration: reduce ? 0 : 0.2,
                          ease: EASE_OUT,
                        }}
                        className="absolute inset-x-3 bottom-0 h-[2px] bg-[#ff0063]"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href={LOGIN_LINK.href}
              className={cn(
                "pressable hidden min-h-11 items-center px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#356464] transition-colors hover:text-[#0b2e2e] sm:inline-flex",
                pressStyles.press,
                focusRing,
              )}
            >
              {LOGIN_LINK.label}
            </Link>
            {hidePrimary ? null : (
              <Link
                href={primaryCta.href}
                className={cn(
                  "pressable hidden min-h-11 items-center gap-2 rounded-[2px] bg-[#ff0063] px-4 text-[12px] font-semibold tracking-[-0.01em] text-black transition-[transform,background-color] duration-200 hover:bg-[#d40054] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 md:inline-flex",
                  pressStyles.press,
                  focusRing,
                )}
              >
                {primaryCta.label}
                <ArrowRight size={14} weight="bold" aria-hidden="true" />
              </Link>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="marketing-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "pressable inline-flex min-h-11 items-center gap-2 rounded-[2px] px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b2e2e] lg:hidden",
                pressStyles.press,
                focusRing,
              )}
            >
              <span>{open ? "Close" : "Menu"}</span>
              {/* Two rules fold into a cross on open. */}
              <span aria-hidden="true" className="relative block h-3 w-4">
                <span
                  className={cn(
                    "absolute left-0 top-0 block h-px w-4 origin-center bg-[#0b2e2e] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    open ? "translate-y-[5px] rotate-45" : "rotate-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 block h-px w-4 origin-center bg-[#0b2e2e] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    open ? "-translate-y-[6px] -rotate-45" : "rotate-0",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            ref={overlayRef}
            key="mobile-nav"
            id="marketing-mobile-nav"
            initial={menuHidden}
            animate={menuShown}
            exit={menuHidden}
            transition={menuTransition}
            className="fixed inset-0 top-16 z-40 overflow-y-auto bg-white lg:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[760px] flex-col px-5 pb-10 pt-4 sm:px-8"
            >
              {NAV_LINKS.map((link, index) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={rowHidden}
                    animate={rowShown}
                    exit={rowHidden}
                    transition={rowTransition(index)}
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "pressable flex min-h-16 items-baseline gap-4 border-b border-[#0b2e2e]/10 py-4 text-[1.75rem] font-semibold tracking-[-0.035em]",
                        pressStyles.press,
                        focusRing,
                        active ? "text-[#0b2e2e]" : "text-[#356464]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "text-[10px] font-semibold tabular-nums tracking-[0.2em]",
                          active ? "text-[#ff0063]" : "text-[#356464]",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={rowHidden}
                animate={rowShown}
                exit={rowHidden}
                transition={rowTransition(NAV_LINKS.length)}
                className="mt-auto grid gap-3 pt-10"
              >
                <Link
                  href={LOGIN_LINK.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "pressable inline-flex min-h-12 items-center justify-center border border-[#0b2e2e]/20 px-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0b2e2e]",
                    pressStyles.press,
                    focusRing,
                  )}
                >
                  {LOGIN_LINK.label}
                </Link>
                {hidePrimary ? null : (
                  <Link
                    href={primaryCta.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#ff0063] px-4 text-sm font-semibold text-black",
                      pressStyles.press,
                      focusRing,
                    )}
                  >
                    {primaryCta.label}
                    <ArrowRight size={16} weight="bold" aria-hidden="true" />
                  </Link>
                )}
              </motion.div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
