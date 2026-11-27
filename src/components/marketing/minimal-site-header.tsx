"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PrimaryAction } from "./minimal-system";
import {
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  isActivePath,
  resolvePrimaryCta,
} from "./nav";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta";

export function MinimalSiteHeader() {
  const pathname = usePathname();
  const primary = resolvePrimaryCta(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const main = document.querySelector("main");
    const previousOverflow = document.body.style.overflow;

    main?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => firstLinkRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      main?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="content-shell flex h-16 items-center justify-between gap-6">
        <Link
          href={SITE.homeHref}
          className={cn("shrink-0 text-[0.9375rem] font-semibold tracking-[-0.01em]", focusRing)}
        >
          {SITE.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
              className={cn(
                "text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground",
                isActivePath(pathname, link.href) && "text-foreground",
                focusRing,
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link
            href={LOGIN_LINK.href}
            className={cn(
              "hidden text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline",
              focusRing,
            )}
          >
            {LOGIN_LINK.label}
          </Link>
          <PrimaryAction
            href={primary.href}
            label={primary.label}
            className={cn("hidden min-h-9 rounded-lg px-4 py-2 sm:inline-flex", focusRing)}
          />
          <button
            ref={triggerRef}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="marketing-mobile-nav"
            onClick={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-[0.9375rem] font-medium text-foreground transition-colors duration-150 hover:text-cta sm:hidden",
              focusRing,
            )}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="marketing-mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-white px-6 py-8 sm:hidden"
        >
          <nav
            aria-label="Primary mobile"
            className="flex flex-col"
            onClick={() => closeMenu()}
          >
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                className={cn(
                  "border-b border-border py-4 text-[1.375rem] leading-tight tracking-[-0.02em] text-foreground transition-colors duration-150 hover:text-cta",
                  isActivePath(pathname, link.href) && "text-cta",
                  focusRing,
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={LOGIN_LINK.href}
              className={cn(
                "py-4 text-[1.375rem] leading-tight tracking-[-0.02em] text-foreground transition-colors duration-150 hover:text-cta",
                focusRing,
              )}
            >
              {LOGIN_LINK.label}
            </Link>
            <PrimaryAction
              href={primary.href}
              label={primary.label}
              className={cn("mt-6 w-full", focusRing)}
            />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
