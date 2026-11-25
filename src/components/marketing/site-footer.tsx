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
  "inline-flex min-h-6 items-center rounded-sm transition-colors duration-150 ease-[var(--ease-out)] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] motion-reduce:transition-none";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={cn(
        "border-t border-[#18251f]/10 px-5 sm:px-8 lg:px-12",
        compact ? "py-6" : "py-8",
      )}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={SITE.homeHref}
            className={cn("inline-flex items-center gap-2.5 rounded-sm", linkClass)}
          >
            <Logo size="h-6 w-6" />
            <span className="font-medium text-[#17352b]">
              {SITE.name}
            </span>
          </Link>
          {!compact ? (
            <p className="mt-2 text-sm text-[#56645c]">{SITE.tagline}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-[#5e554a]"
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
          <p className="text-sm text-[#56645c]">© 2026 {SITE.name}</p>
        </div>
      </div>
      {!compact ? (
        <p className="mx-auto mt-6 max-w-[1440px] text-xs leading-5 text-[#56645c]">
          Photographs by Doctor 17, Keith Mason and Christopher J. Fynn via
          Wikimedia Commons, under CC BY-SA 4.0 and CC BY-SA 3.0. Images are
          resized for the web. See each photo credit for the original file.
        </p>
      ) : null}
    </footer>
  );
}
