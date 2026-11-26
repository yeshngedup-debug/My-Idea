"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  UTILITY_LINKS,
  resolvePrimaryCta,
  type NavLink,
} from "./nav";

const linkClass =
  "inline-flex min-h-6 items-center text-sm text-[#356464] transition-colors duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

const startLinkClass =
  "group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const arrowClass =
  "transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0";

const columnHeading =
  "text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0b5c5c]";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const primaryCta = resolvePrimaryCta(pathname);
  const utilityLinks: NavLink[] = [...UTILITY_LINKS, LOGIN_LINK];
  const startLinks: NavLink[] = [
    { href: CTA_HREFS.signup, label: CTA_LABELS.signup },
    FOUNDER_ACCESS,
  ];

  return (
    <footer className="border-t border-[#0b2e2e]/12 bg-white px-5 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div
          className={cn(
            "grid gap-10 border-b border-[#0b2e2e]/10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12",
            compact ? "py-10" : "py-16 md:py-20",
          )}
        >
          <div>
            <Link
              href={SITE.homeHref}
              className={cn(
                "inline-flex min-h-11 items-center gap-2.5 text-[#0b2e2e]",
                linkClass,
              )}
            >
              <Logo size="h-7 w-7" />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                {SITE.name}
              </span>
            </Link>
            {!compact ? (
              <p className="mt-4 max-w-[30ch] text-sm leading-6 text-[#356464]">
                {SITE.tagline}
              </p>
            ) : null}
            <p className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#356464]">
              <span aria-hidden="true" className="h-px w-6 bg-[#ff0063]" />
              Thimphu · Bhutan
            </p>
          </div>

          <div>
            <p className={columnHeading}>Explore</p>
            <nav
              aria-label="Footer navigation"
              className="mt-4 flex flex-col items-start gap-2.5"
            >
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className={columnHeading}>More</p>
            <nav
              aria-label="Utility navigation"
              className="mt-4 flex flex-col items-start gap-2.5"
            >
              {utilityLinks
                .filter((link) => link.href !== pathname)
                .map((link) => (
                  <Link key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                ))}
            </nav>
          </div>

          <div>
            <p className={columnHeading}>Start</p>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              {startLinks
                .filter((link) => link.href !== pathname)
                .map((link) => {
                  const primary = link.href === primaryCta.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        primary ? startLinkClass : linkClass,
                        "gap-1.5",
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowRight
                        size={14}
                        weight="bold"
                        aria-hidden="true"
                        className={arrowClass}
                      />
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>

        {!compact ? (
          <p
            aria-hidden="true"
            className="mt-10 select-none text-[clamp(1.75rem,7.4vw,7rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-[#0b2e2e]"
          >
            Bhutan Tech
            <br />
            Connect<span className="text-[#66bfbf]">.</span>
          </p>
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-3 border-t border-[#0b2e2e]/10 text-xs text-[#356464]",
            compact
              ? "mt-8 pt-6"
              : "mt-10 pt-6 pb-10 sm:flex-row sm:items-baseline sm:justify-between",
          )}
        >
          <p>© 2026 {SITE.name}</p>
          <p className="text-[10px] uppercase tracking-[0.18em]">
            Local talent · Real projects · Built in Bhutan
          </p>
        </div>
      </div>
    </footer>
  );
}
