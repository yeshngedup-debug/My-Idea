import type { ReactNode } from "react";
import Link from "next/link";
import { APP_CONTACT } from "@/config/app";
import { FOUNDER_ACCESS } from "@/components/marketing/nav";
import { cn } from "@/lib/utils";
import {
  authLinkClassName,
  focusRing,
} from "@/features/auth/components/styles";

export type AuthHelpLink = { label: string; href: string };

function isHelpLink(value: AuthHelpLink | ReactNode): value is AuthHelpLink {
  return (
    typeof value === "object" &&
    value !== null &&
    "href" in value &&
    "label" in value &&
    typeof (value as AuthHelpLink).href === "string" &&
    typeof (value as AuthHelpLink).label === "string"
  );
}

/**
 * The help panel that closes every auth route.
 *
 * It answers the two questions a stuck visitor actually has: how to reach a
 * human, and how to get a founder account. `newLink` is the reset-path slot
 * and accepts either a label/href pair or a ready-made node.
 */
export function AuthHelpBand({
  newLink,
  className,
}: {
  newLink?: AuthHelpLink | ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label="Account help"
      className={cn(
        "mt-4 border border-[#b9dede] bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        <div>
          <h2 className="text-[13px] font-semibold text-[#0b2e2e]">Account help</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#356464]">
            Questions about student signup, founder access or a project?{" "}
            <a
              href={`mailto:${APP_CONTACT.email}`}
              className={cn(authLinkClassName, focusRing)}
            >
              {APP_CONTACT.email}
            </a>
            . We read every message and reply as soon as we can.
          </p>
        </div>

        <div>
          <h2 className="text-[13px] font-semibold text-[#0b2e2e]">Founder access</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#356464]">
            Founder accounts are not created through public signup.
          </p>
          <Link
            href={FOUNDER_ACCESS.href}
            className={cn(
              "mt-2 inline-flex min-h-8 items-center rounded-[2px]",
              authLinkClassName,
              focusRing,
            )}
          >
            {FOUNDER_ACCESS.label}
          </Link>
        </div>
      </div>

      {newLink ? (
        <div className="mt-5 border-t border-[#b9dede] pt-4">
          {isHelpLink(newLink) ? (
            <Link
              href={newLink.href}
              className={cn(
                "inline-flex min-h-8 items-center rounded-[2px]",
                authLinkClassName,
                focusRing,
              )}
            >
              {newLink.label}
            </Link>
          ) : (
            newLink
          )}
        </div>
      ) : null}
    </section>
  );
}
