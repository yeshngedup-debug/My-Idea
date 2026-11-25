import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/motion";
import type { Cta } from "./nav";

export type CtaBandProps = {
  title: ReactNode;
  /** Preferred API. */
  primaryCta?: Cta;
  /** Legacy alias used by some pages. */
  href?: string;
  label?: string;
  lead?: string;
  eyebrow?: string;
  id?: string;
};

/**
 * The closing chapter: a full-bleed teal band with one headline and a single
 * solid action. 64–80px vertical rhythm, no ambient glow, no second
 * intent competing with the CTA. Ink text keeps contrast on the teal fill.
 */
export function CtaBand({
  title,
  primaryCta,
  href,
  label,
  lead,
  eyebrow,
  id,
}: CtaBandProps) {
  const action = primaryCta ?? (href && label ? { href, label } : null);
  return (
    <section
      id={id}
      className="cta-band relative isolate overflow-hidden bg-[#66bfbf] px-5 py-16 text-[#0b2e2e] sm:px-8 sm:py-20 lg:px-12 lg:py-20"
    >
      <Reveal className="relative mx-auto max-w-[1180px]">
        {eyebrow ? (
          <p className="mb-4 text-xs font-medium text-[#0b5c5c]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="max-w-4xl text-balance text-[clamp(3rem,6.5vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#0b2e2e]">
          {title}
        </h2>
        {lead ? (
          <p className="mt-6 max-w-2xl text-pretty text-base leading-[1.65] text-[#0b2e2e]/80 sm:text-lg">
            {lead}
          </p>
        ) : null}
        {action ? (
          <Link
            href={action.href}
            className="pressable mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-cta px-6 py-3 text-sm font-medium text-cta-foreground hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2e2e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#66bfbf]"
          >
            {action.label}
          </Link>
        ) : null}
      </Reveal>
    </section>
  );
}
