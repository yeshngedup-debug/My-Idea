import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
  LOGIN_LINK,
  NAV_LINKS,
  SITE,
  UTILITY_LINKS,
} from "@/components/marketing/nav";
import { cn } from "@/lib/utils";
import { focusRingOnDark } from "@/features/auth/components/styles";

type FooterLink = { href: string; label: string };

/** The account routes and the two ways into the product. */
const ACCOUNT_LINKS: readonly FooterLink[] = [
  { href: LOGIN_LINK.href, label: LOGIN_LINK.label },
  { href: CTA_HREFS.signup, label: CTA_LABELS.signup },
  { href: CTA_HREFS.studentProjects, label: "Browse projects" },
  { href: CTA_HREFS.founderPostProject, label: "Post a project" },
  FOUNDER_ACCESS,
];

/** Pricing, contact and the legal pages stay one tap from every auth route. */
const MORE_LINKS: readonly FooterLink[] = [
  { href: "/for-founders#pricing", label: CTA_LABELS.pricing },
  ...UTILITY_LINKS,
];

const linkClass =
  "inline-flex min-h-11 items-center text-[13px] text-[#eaf6f6]/80 transition-colors duration-150 ease-[var(--ease-out)] hover:text-white motion-reduce:transition-none";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b9dede]">
        {title}
      </h2>
      <nav aria-label={`${title} navigation`} className="mt-1 flex flex-col items-start">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={cn(linkClass, focusRingOnDark)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/**
 * The footer for the auth routes.
 *
 * It closes the page in deep teal and keeps every public destination the
 * marketing footer offered: the public home, the guide pages, pricing,
 * contact, privacy and terms. There is no filled action here — the account
 * screen owns the single magenta submit.
 */
export function AuthFooter() {
  return (
    <footer className="border-t border-[#0b2e2e] bg-[#0b2e2e]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href={SITE.homeHref}
              className={cn(
                "inline-flex min-h-11 items-center gap-2.5 rounded-[2px]",
                focusRingOnDark,
              )}
            >
              {/* The mark is teal on teal, so it sits on a paper chip. */}
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] bg-white p-1.5">
                <Logo size="h-6 w-6" />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-3 max-w-[28ch] text-[13px] leading-6 text-[#eaf6f6]/75">
              {SITE.tagline}
            </p>
          </div>

          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
          <FooterColumn title="Explore" links={NAV_LINKS} />
          <FooterColumn title="More" links={MORE_LINKS} />
        </div>

        <p className="mt-8 text-[12px] text-[#eaf6f6]/70">
          © 2026 {SITE.name}
        </p>
      </div>
    </footer>
  );
}
