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
 * The closing chapter: a full-bleed forest band with one headline and a single
 * solid action. No ambient glow, no second intent.
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
      className="cta-band relative isolate overflow-hidden bg-[#17352b] px-5 py-24 text-[#fffefa] sm:px-8 sm:py-32 lg:px-12 lg:py-40"
    >
      <Reveal className="relative mx-auto max-w-[1180px]">
        {eyebrow ? (
          <p className="mb-4 text-sm font-medium text-[#fffefa]/70">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="max-w-4xl text-balance text-[clamp(2.75rem,6vw,5rem)] font-medium leading-[1.04] tracking-[-0.02em] text-[#fffefa]">
          {title}
        </h2>
        {lead ? (
          <p className="mt-6 max-w-2xl text-balance text-base leading-7 text-[#fffefa]/75 sm:text-lg sm:leading-8">
            {lead}
          </p>
        ) : null}
        {action ? (
          <Link
            href={action.href}
            className="pressable mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#fbbf24] px-6 py-3 text-sm font-medium text-[#17352b] hover:bg-[#e7b648] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fffefa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
          >
            {action.label}
          </Link>
        ) : null}
      </Reveal>
    </section>
  );
}
