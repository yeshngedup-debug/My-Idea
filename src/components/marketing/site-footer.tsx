import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  UTILITY_LINKS,
} from "./nav";

const linkClass =
  "inline-flex min-h-6 items-center rounded-sm transition-colors duration-150 ease-[var(--ease-out)] hover:text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6] motion-reduce:transition-none";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={cn(
        "border-t border-[#b9dede]/10 px-5 sm:px-8 lg:px-12",
        compact ? "py-8" : "py-14 md:py-20",
      )}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-16">
        <div>
          <Link
            href={SITE.homeHref}
            className={cn("inline-flex items-center gap-2.5 rounded-sm", linkClass)}
          >
            <Logo size="h-6 w-6" />
            <span className="font-medium text-[#0b2e2e]">
              {SITE.name}
            </span>
          </Link>
          {!compact ? (
            <p className="mt-2 text-sm text-[#0b2e2e]/60">{SITE.tagline}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-[#0b2e2e]/65"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            {UTILITY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <Link href={LOGIN_LINK.href} className={linkClass}>
              {LOGIN_LINK.label}
            </Link>
          </nav>
          <p className="text-sm text-[#0b2e2e]/60">© 2026 {SITE.name}</p>
        </div>
      </div>
      {!compact ? (
        <p className="mx-auto mt-6 max-w-[1200px] text-xs leading-5 text-[#0b2e2e]/55">
          Photographs by Doctor 17, Keith Mason and Christopher J. Fynn via
          Wikimedia Commons, under CC BY-SA 4.0 and CC BY-SA 3.0. Images are
          resized for the web. See each photo credit for the original file.
        </p>
      ) : null}
    </footer>
  );
}
