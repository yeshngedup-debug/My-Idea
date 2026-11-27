"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrustLine } from "./minimal-system";
import {
  FOOTER_START_LINKS,
  FOOTER_UTILITY_LINKS,
  SITE,
  resolvePrimaryCta,
  type NavLink,
} from "./nav";

function FooterColumn({ title, links }: { title: string; links: readonly NavLink[] }) {
  return (
    <div>
      <p className="text-[0.9375rem] font-medium">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MinimalSiteFooter() {
  const pathname = usePathname();
  const primary = resolvePrimaryCta(pathname);

  return (
    <footer className="border-t border-border">
      <div className="content-shell py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
              {SITE.name}
            </p>
            <p className="quiet-note mt-4 max-w-sm">
              Focused, paid project work for Bhutanese students and founders.
            </p>
            <TrustLine className="mt-6">{SITE.trustLine}</TrustLine>
          </div>
          <FooterColumn title="Start" links={FOOTER_START_LINKS} />
          <FooterColumn title="More" links={FOOTER_UTILITY_LINKS} />
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="trust-line">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <Link
            href={primary.href}
            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            {primary.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
