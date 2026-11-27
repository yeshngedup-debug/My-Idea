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
import { focusRing } from "@/features/auth/components/styles";

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
  "inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors duration-200 ease-[var(--ease-out)] hover:text-foreground motion-reduce:transition-none";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <div>
      <h2 className="text-sm font-medium tracking-normal text-foreground">
        {title}
      </h2>
      <nav aria-label={`${title} navigation`} className="mt-1 flex flex-col items-start">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={cn(linkClass, focusRing)}>
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
 * It closes the page with a quiet hairline and keeps every public destination
 * the marketing footer offered: the public home, the guide pages, pricing,
 * contact, privacy and terms. There is no filled action here — the account
 * screen owns the single filled submit.
 */
export function AuthFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="content-shell py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href={SITE.homeHref}
              className={cn(
                "inline-flex min-h-11 items-center gap-2.5 rounded-lg",
                focusRing,
              )}
            >
              <Logo size="h-6 w-6" />
              <span className="text-sm font-medium text-foreground">
                {SITE.name}
              </span>
            </Link>
            <p className="quiet-note mt-3 max-w-[28ch]">{SITE.tagline}</p>
          </div>

          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
          <FooterColumn title="Explore" links={NAV_LINKS} />
          <FooterColumn title="More" links={MORE_LINKS} />
        </div>

        <p className="quiet-note mt-8">© 2026 {SITE.name}</p>
      </div>
    </footer>
  );
}
