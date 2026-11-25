"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight, List, X } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { PhotoCredit } from "@/components/ui/photo-credit";
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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

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
          "mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 rounded-full border border-white/70 bg-white/75 px-3 shadow-[0_2px_14px_-10px_rgba(11,46,46,0.25)] backdrop-blur-xl ring-1 ring-[#4d8c8c]/5 transition-[background-color,box-shadow] duration-200 sm:px-4 motion-reduce:transition-none",
          scrolled
            ? "bg-white/90 shadow-[0_14px_36px_-20px_rgba(11,46,46,0.45)]"
            : "bg-white/75",
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
            <span className="text-sm font-medium text-[#0b2e2e] sm:text-base">
              {SITE.name}
            </span>
          </Link>

          <LayoutGroup id="site-nav">
            <div className="hidden items-center gap-4 lg:flex xl:gap-5">
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
                        ? "text-[#0b5c5c]"
                        : "text-[#0b2e2e]/60 hover:text-[#0b5c5c]",
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
                        className="absolute inset-x-0 bottom-2 h-px bg-[#ff0063]"
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
                "pressable hidden min-h-11 items-center text-sm font-medium text-[#0b2e2e]/70 hover:text-[#0b5c5c] sm:inline-flex",
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
                  "pressable inline-flex min-h-11 items-center rounded-full bg-[#ff0063] px-5 py-2.5 text-sm font-semibold text-[#000000] hover:bg-[#d40054]",
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
              "pressable inline-flex min-h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-full border border-[#b9dede]/15 text-[#0b5c5c] lg:hidden",
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
              className="mx-auto flex max-w-[1200px] flex-col rounded-[20px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_40px_-22px_rgba(11,46,46,0.35)] backdrop-blur-xl"
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
                      "pressable flex min-h-11 items-center border-b border-[#b9dede]/10 text-sm font-medium last:border-b-0",
                      pressStyles.press,
                      focusRing,
                      active ? "text-[#0b5c5c]" : "text-[#0b2e2e]/70",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 grid gap-2 border-t border-[#b9dede]/10 pt-4 md:hidden">
                <Link
                  href={LOGIN_LINK.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "pressable inline-flex min-h-11 items-center justify-center rounded-full border border-[#b9dede]/15 px-4 text-sm font-medium text-[#0b5c5c]",
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
                      "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#ff0063] px-4 text-sm font-semibold text-[#000000]",
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

export type FactPortrait = {
  src: string;
  alt: string;
  creditFileUrl: string;
};

export type FactSlide = {
  title: string;
  body: string;
  portraits: readonly FactPortrait[];
};

/**
 * Small client island for the marketing home. It lives in this client module so
 * `public/page.tsx` can stay a Server Component: that page needs the live World
 * Bank context fetched on the server, and a `"use client"` directive there
 * would break both the fetch and its metadata export.
 *
 * Only verified platform facts are passed in; there are no names or quotes.
 * Every portrait keeps its Wikimedia Commons attribution.
 */
export function FactCarousel({
  slides,
  label = "Verified platform facts",
}: {
  slides: readonly FactSlide[];
  label?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const count = slides.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  if (count === 0) return null;
  const slide = slides[index] ?? slides[0];

  const arrowClass = cn(
    "pressable inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#b9dede]/20 text-[#0b5c5c] transition-colors duration-150 hover:bg-[#eaf6f6]/70 motion-reduce:transition-none",
    pressStyles.press,
    focusRing,
  );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="mx-auto max-w-[1200px]"
    >
      {/* One stable live region: it is not keyed, so every slide change is
          announced instead of removing the region with the outgoing slide. */}
      <span aria-live="polite" className="sr-only">
        Fact {index + 1} of {count}: {slide.title}. {slide.body}
      </span>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={index}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }}
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-20">
            <div className="relative mx-auto h-64 w-full max-w-[340px]">
              {slide.portraits.map((portrait, portraitIndex) => (
                <div
                  key={`${slide.title}-${portrait.src}`}
                  className={cn(
                    "group absolute overflow-hidden rounded-full border-4 border-[#eaf6f6] bg-[#66bfbf] shadow-[0_18px_40px_-24px_rgba(11,46,46,0.45)]",
                    portraitIndex === 0
                      ? "left-0 top-0 h-40 w-40 sm:h-44 sm:w-44"
                      : "bottom-0 right-0 h-44 w-44 sm:h-52 sm:w-52",
                  )}
                >
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    fill
                    sizes="208px"
                    className="object-cover grayscale contrast-125 opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-[#0b2e2e] sm:text-4xl">
                {slide.title}
              </h3>
              <p className="mt-5 max-w-[48ch] text-lg leading-8 text-[#0b5c5c]">
                {slide.body}
              </p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-1">
                {slide.portraits.map((portrait) => (
                  <PhotoCredit
                    key={`${slide.title}-credit-${portrait.src}`}
                    fileUrl={portrait.creditFileUrl}
                    className="text-[#0b2e2e]/60"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-[#b9dede]/10 pt-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous fact"
            className={arrowClass}
          >
            <CaretLeft aria-hidden="true" size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next fact"
            className={arrowClass}
          >
            <CaretRight aria-hidden="true" size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          {slides.map((item, dotIndex) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Show fact ${dotIndex + 1}: ${item.title}`}
              aria-current={dotIndex === index ? "true" : undefined}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                pressStyles.press,
                focusRing,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors duration-150 motion-reduce:transition-none",
                  dotIndex === index ? "bg-[#66bfbf]" : "bg-[#66bfbf]/25",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
