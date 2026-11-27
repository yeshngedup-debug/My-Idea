"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { focusRing, headerActionClass } from "./styles";

/**
 * Site chrome for the public marketing pages.
 *
 * A practical single bar: the mark on the left, the page links in the middle
 * on wide screens, and the account action plus the menu on the right. The
 * account action stays visible on a phone — it is not hidden behind the menu
 * — so the common next step is always one tap away.
 *
 * There is no animation library here. The only motion is a 150ms press and
 * colour change on controls.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const primaryCta = resolvePrimaryCta(pathname);
  const hidePrimary = primaryCta.href === pathname;
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // The overlay owns focus while it is open: move focus in, trap Tab inside,
  // close on Escape, lock scrolling, and make the rest of the page inert.
  useEffect(() => {
    if (!open) return;

    const menuButton = menuButtonRef.current;
    // Safari and Firefox on macOS do not focus a <button> on tap, so the
    // active element can still be <body>. Falling back to the menu button
    // keeps focus on the trigger instead of dropping it to the document start.
    const active = document.activeElement;
    returnFocusRef.current =
      active instanceof HTMLElement && active !== document.body
        ? active
        : menuButton;
    const returnFocus = returnFocusRef.current;

    const header = headerRef.current;
    if (!header) return;
    const previousInert = new Map<HTMLElement, boolean>();
    const setInert = (element: HTMLElement | null, value: boolean) => {
      if (!element) return;
      previousInert.set(element, element.hasAttribute("inert"));
      element.toggleAttribute("inert", value);
    };

    // The header is nested inside the page shell, so inerting every direct
    // body child would inert the header too. Inert siblings outside the
    // header, then the shell content beside it.
    Array.from(document.body.children).forEach((child) => {
      if (child instanceof HTMLElement && !child.contains(header)) {
        setInert(child, true);
      }
    });
    const headerShell = header.parentElement;
    if (headerShell && headerShell !== document.body) {
      Array.from(headerShell.children).forEach((child) => {
        if (child instanceof HTMLElement && child !== header) {
          setInert(child, true);
        }
      });
    }

    // Keep the close trigger operable, but remove the other header links from
    // the page's focus order while the sheet is open.
    barRef.current
      ?.querySelectorAll<HTMLElement>("a[href]")
      .forEach((link) => setInert(link, true));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const overlayFocusables = () =>
      Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      );
    const focusables = () =>
      menuButton ? [menuButton, ...overlayFocusables()] : overlayFocusables();

    overlayFocusables()[0]?.focus();

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

  // The sheet and its trigger only exist below the lg breakpoint. If the
  // viewport grows past it while the sheet is open, close it: otherwise the
  // page would stay inert and unscrollable behind a hidden overlay.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  // A route change closes the mobile sheet. This is a render-time state
  // adjustment, not an effect, so it never triggers a second render pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white">
      <div ref={barRef} className="border-b border-[#b9dede]">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-10">
          <Link
            href={SITE.homeHref}
            className={cn(
              "pressable flex min-h-11 shrink-0 items-center gap-2.5",
              pressStyles.press,
              focusRing,
            )}
          >
            <Logo size="h-7 w-7" />
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-[#0b2e2e] sm:inline">
              {SITE.name}
            </span>
            <span className="sr-only sm:hidden">{SITE.name}</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden lg:flex lg:items-center">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "pressable relative inline-flex min-h-11 items-center px-3 text-[13px] font-semibold transition-colors duration-150",
                    pressStyles.press,
                    focusRing,
                    active
                      ? "text-[#0b2e2e]"
                      : "text-[#356464] hover:text-[#0b2e2e]",
                  )}
                >
                  {link.label}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-1.5 h-[2px] bg-[#0b5c5c]"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={LOGIN_LINK.href}
              className={cn(
                "pressable hidden min-h-11 items-center px-2 text-[13px] font-semibold text-[#356464] transition-colors duration-150 hover:text-[#0b2e2e] sm:inline-flex",
                pressStyles.press,
                focusRing,
              )}
            >
              {LOGIN_LINK.label}
            </Link>

            {hidePrimary ? null : (
              <Link
                href={primaryCta.href}
                className={cn(headerActionClass, pressStyles.press)}
              >
                {primaryCta.label}
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
                "pressable inline-flex min-h-11 items-center gap-2 rounded-[3px] border border-[#b9dede] px-3 text-[12px] font-semibold text-[#0b2e2e] lg:hidden",
                pressStyles.press,
                focusRing,
              )}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span aria-hidden="true" className="relative block h-3 w-4">
                <span
                  className={cn(
                    "absolute left-0 top-0 block h-px w-4 origin-center bg-[#0b2e2e] transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    open ? "translate-y-[5px] rotate-45" : "rotate-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 block h-px w-4 origin-center bg-[#0b2e2e] transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    open ? "-translate-y-[6px] -rotate-45" : "rotate-0",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          ref={overlayRef}
          id="marketing-mobile-nav"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-white lg:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[760px] flex-col px-4 pb-8 pt-2 sm:px-6"
          >
            {NAV_LINKS.map((link, index) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "pressable flex min-h-14 items-center gap-3 border-b border-[#b9dede] py-3 text-[17px] font-semibold tracking-[-0.02em]",
                    pressStyles.press,
                    focusRing,
                    active ? "text-[#0b2e2e]" : "text-[#356464]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "text-[11px] font-semibold tabular-nums tracking-[0.18em]",
                      active ? "text-[#0b5c5c]" : "text-[#4d8c8c]",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-auto grid gap-3 pt-8">
              <Link
                href={LOGIN_LINK.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "pressable inline-flex min-h-12 items-center justify-center rounded-[3px] border border-[#0b5c5c]/45 px-4 text-[13px] font-semibold text-[#0b2e2e]",
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
                    "pressable inline-flex min-h-12 items-center justify-center rounded-[3px] bg-[#0b5c5c] px-4 text-[13px] font-semibold text-white",
                    pressStyles.press,
                    focusRing,
                  )}
                >
                  {primaryCta.label}
                </Link>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
