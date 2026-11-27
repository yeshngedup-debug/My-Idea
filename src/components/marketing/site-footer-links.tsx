"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { footerLinkClass } from "./styles";
import {
  FOOTER_START_LINKS,
  FOOTER_UTILITY_LINKS,
  resolvePrimaryCta,
} from "./nav";

/**
 * The two footer columns that depend on the current route.
 *
 * The footer itself stays a server component. Only these link lists cross the
 * client boundary: the "Start" column marks the audience-aware primary action,
 * and the "More" column hides the page the visitor is already on.
 */

/** "Start": one link is the primary action for the current audience. */
export function FooterStartLinks() {
  const pathname = usePathname();
  const primaryCta = resolvePrimaryCta(pathname);

  return (
    <>
      {FOOTER_START_LINKS.map((link) => {
        const primary = link.href === primaryCta.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              footerLinkClass,
              primary &&
                "font-semibold text-white underline decoration-[#b9dede]/60 decoration-1 underline-offset-4",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

/** "More": the utility links, without the page the visitor is already on. */
export function FooterUtilityLinks() {
  const pathname = usePathname();

  return (
    <>
      {FOOTER_UTILITY_LINKS.filter((link) => link.href !== pathname).map(
        (link) => (
          <Link
            key={link.href}
            href={link.href}
            className={footerLinkClass}
          >
            {link.label}
          </Link>
        ),
      )}
    </>
  );
}
