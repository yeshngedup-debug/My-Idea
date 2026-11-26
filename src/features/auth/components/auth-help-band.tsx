import type { ReactNode } from "react";
import {
  Band,
  RuleLink,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { APP_CONTACT } from "@/config/app";
import { CTA_HREFS, FOUNDER_ACCESS } from "@/components/marketing/nav";
import { cn } from "@/lib/utils";

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
 * The single help band for auth routes. `white` keeps the paper ground for
 * reset; `mist` closes the paper-led pages. `newLink` is the reset-path slot
 * and accepts either a label/href pair or a ready-made node.
 */
export function AuthHelpBand({
  variant = "mist",
  newLink,
  className,
}: {
  variant?: "white" | "mist";
  newLink?: AuthHelpLink | ReactNode;
  className?: string;
}) {
  const emailFocusRing = cn(
    "font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 underline-offset-4 transition-colors hover:decoration-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2",
    variant === "white"
      ? "focus-visible:ring-offset-white"
      : "focus-visible:ring-offset-[#eaf6f6]",
  );

  return (
    <Band
      tone={variant === "white" ? "paper" : "mist"}
      className={cn("border-b border-[#0b2e2e]/10", className)}
    >
      <div
        className={cn(
          container,
          gutters,
          "grid grid-cols-1 gap-10 py-8 md:py-10 lg:grid-cols-12 lg:gap-12",
        )}
      >
        <div className="lg:col-span-7">
          <p className="index-label">Account help</p>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-[#356464]">
            Questions about student signup, founder access, or a project?{" "}
            <a href={`mailto:${APP_CONTACT.email}`} className={emailFocusRing}>
              {APP_CONTACT.email}
            </a>
            . We read every message and reply as soon as we can.
          </p>
          {newLink ? (
            <div className="mt-6 border-t border-[#0b2e2e]/12 pt-6">
              {isHelpLink(newLink) ? (
                <RuleLink href={newLink.href}>{newLink.label}</RuleLink>
              ) : (
                newLink
              )}
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="index-label">Founder access</p>
          <p className="mt-4 max-w-[34ch] text-[15px] leading-7 text-[#356464]">
            Founder accounts are not created through public signup.
          </p>
          <RuleLink href={CTA_HREFS.contact} className="mt-5">
            {FOUNDER_ACCESS.label}
          </RuleLink>
        </div>
      </div>
    </Band>
  );
}
