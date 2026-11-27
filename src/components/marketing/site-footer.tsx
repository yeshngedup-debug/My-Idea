import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE } from "./nav";
import { footerColumnHeading, footerLinkClass } from "./styles";
import { FooterStartLinks, FooterUtilityLinks } from "./site-footer-links";

/**
 * Site footer for the public marketing pages.
 *
 * Deep teal to close the page, with the same links the header offers plus
 * the two routes a visitor is most likely to want next. No magenta action
 * here: the emphasis belongs to the page, not the chrome.
 *
 * This is a server component. Only the two route-aware link lists live in a
 * client leaf, so the footer markup itself never enters the client bundle.
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="border-t border-[#0b2e2e] bg-[#0b2e2e] px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div
          className={cn(
            "grid gap-8 border-b border-white/15 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10",
            compact ? "py-8" : "py-10 md:py-12",
          )}
        >
          <div>
            <Link
              href={SITE.homeHref}
              className="inline-flex min-h-11 items-center gap-2.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2e2e]"
            >
              <Logo size="h-7 w-7" />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                {SITE.name}
              </span>
            </Link>
            {!compact ? (
              <p className="mt-3 max-w-[32ch] text-[13px] leading-6 text-[#eaf6f6]/80">
                {SITE.tagline}
              </p>
            ) : null}
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b9dede]">
              Thimphu · Bhutan
            </p>
          </div>

          <div>
            <p className={footerColumnHeading}>Explore</p>
            <nav
              aria-label="Footer navigation"
              className="mt-2 flex flex-col items-start"
            >
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className={footerColumnHeading}>Start</p>
            <nav aria-label="Account navigation" className="mt-2 flex flex-col items-start">
              <FooterStartLinks />
            </nav>
          </div>

          <div>
            <p className={footerColumnHeading}>More</p>
            <nav
              aria-label="Utility navigation"
              className="mt-2 flex flex-col items-start"
            >
              <FooterUtilityLinks />
            </nav>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-2 text-xs text-[#eaf6f6]/70",
            compact ? "pt-5" : "py-6",
          )}
        >
          <p>© 2026 {SITE.name}</p>
          <p className="text-[11px] uppercase tracking-[0.16em]">
            Local talent · Real projects · Built in Bhutan
          </p>
        </div>
      </div>
    </footer>
  );
}
