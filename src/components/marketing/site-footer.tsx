import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  UTILITY_LINKS,
} from "./nav";

const linkClass =
  "inline-flex min-h-6 items-center text-sm text-[#356464] transition-colors duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

const columnHeading =
  "text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0b5c5c]";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
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
              {UTILITY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
              <Link href={LOGIN_LINK.href} className={linkClass}>
                {LOGIN_LINK.label}
              </Link>
            </nav>
          </div>

          <div>
            <p className={columnHeading}>Start</p>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              <Link
                href="/signup"
                className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Create student account
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                />
              </Link>
              <Link href="/contact" className={linkClass}>
                Ask for founder access
              </Link>
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
            compact ? "mt-8 pt-6" : "mt-10 pt-6 sm:flex-row sm:items-baseline sm:justify-between",
          )}
        >
          <p>© 2026 {SITE.name}</p>
          <p className="text-[10px] uppercase tracking-[0.18em]">
            Local talent · Real projects · Built in Bhutan
          </p>
        </div>

        {!compact ? (
          <p className="mt-4 max-w-[92ch] pb-10 text-xs leading-5 text-[#356464]">
            Photographs by Doctor 17, Keith Mason, Christopher J. Fynn, Bernard
            Gagnon and Glacierfanclub via Wikimedia Commons, under CC BY-SA 4.0
            and CC BY-SA 3.0. Images are resized for the web. See each photo
            credit for the original file.
          </p>
        ) : null}
      </div>
    </footer>
  );
}
