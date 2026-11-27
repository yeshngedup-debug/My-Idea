"use client";

/**
 * The shared chrome for every auth route.
 *
 * One calm product shell: a slim header that keeps the brand and the other
 * account route one tap away, a single narrow column for the work, and a
 * quiet footer that still reaches every public destination. The marketing
 * header and footer are deliberately not reused here — an account screen
 * should not look like a marketing page.
 *
 * The shell is a Client Component because it reads the current pathname to
 * decide which account link to offer. The pages themselves stay Server
 * Components: they pass their content in as children.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { CTA_HREFS, CTA_LABELS, LOGIN_LINK, SITE } from "@/components/marketing/nav";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { cn } from "@/lib/utils";
import { focusRing } from "@/features/auth/components/styles";

export function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /**
   * One switch link, chosen from the route the visitor is on: signup offers
   * the way back to log in, log in offers the student account, and the two
   * recovery routes send the visitor back to log in.
   */
  const switchLink =
    pathname === "/signup"
      ? { href: LOGIN_LINK.href, label: LOGIN_LINK.label }
      : pathname === "/login"
        ? { href: CTA_HREFS.signup, label: CTA_LABELS.signup }
        : { href: LOGIN_LINK.href, label: LOGIN_LINK.label };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#eaf6f6]">
      <header className="border-b border-[#b9dede] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link
            href={SITE.homeHref}
            className={cn(
              "pressable flex min-h-11 min-w-0 items-center gap-2.5 rounded-[2px]",
              focusRing,
            )}
          >
            <Logo size="h-7 w-7" />
            {/* The wordmark needs ~160px next to the account link, so it only
                appears once the phone is wide enough to hold both without
                wrapping. Below that the mark carries the brand. */}
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-[#0b2e2e] sm:inline">
              {SITE.name}
            </span>
            <span className="sr-only sm:hidden">{SITE.name}</span>
          </Link>

          <nav aria-label="Account" className="flex shrink-0 items-center">
            <Link
              href={switchLink.href}
              className={cn(
                "pressable inline-flex min-h-11 items-center justify-center rounded-[2px] border border-[#0b5c5c]/35 px-3 text-[13px] font-semibold text-[#0b2e2e]",
                "hover:border-[#0b5c5c] hover:bg-[#eaf6f6] motion-reduce:transition-none",
                focusRing,
              )}
            >
              {switchLink.label}
            </Link>
          </nav>
        </div>
      </header>

      {/* The root layout skip link targets this id, so it must exist exactly
          once on every auth page. */}
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-[480px] px-4 pb-14 pt-6 sm:px-8 sm:pb-16 sm:pt-12">
          {children}
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
