import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { cn } from "@/lib/utils";

/**
 * The shared editorial kit for the public marketing site.
 *
 * One vocabulary: paper or mist ground, hairline rules instead of boxes,
 * wide-tracked index labels, tight display type, and magenta used as a marker
 * (a rule, a numeral, one action). Every section on every marketing page is
 * assembled from these pieces so the site reads as one printed document.
 *
 * No component here is a client component: pages stay Server Components.
 */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const focusRingInverse =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66bfbf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2e2e]";

export const container = "mx-auto w-full max-w-[1440px]";
export const gutters = "px-5 sm:px-8 lg:px-12";

/** The single filled action: a squared magenta plate with a rule-weight mark. */
export const actionClass = `group inline-flex min-h-12 items-center gap-3 rounded-[2px] bg-[#ff0063] px-6 text-[13px] font-semibold tracking-[-0.01em] text-black transition-[transform,background-color] duration-200 hover:bg-[#d40054] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing}`;

/** Quiet peer action on paper: an underline that turns magenta on hover. */
export const quietClass = `group inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 decoration-1 underline-offset-[6px] transition-colors hover:decoration-[#ff0063] ${focusRing}`;

/** The same quiet action on a deep teal band. */
export const quietClassInverse = `group inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[#eaf6f6] underline decoration-[#eaf6f6]/35 decoration-1 underline-offset-[6px] transition-colors hover:decoration-[#66bfbf] ${focusRingInverse}`;

export const hairline = "border-[#0b2e2e]/12";
export const hairlineInverse = "border-white/20";

export function Action({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(actionClass, className)}>
      <span>{children}</span>
      <ArrowUpRight
        size={16}
        weight="bold"
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
      />
    </Link>
  );
}

export function RuleLink({
  href,
  children,
  className,
  inverse = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(inverse ? quietClassInverse : quietClass, className)}
    >
      {children}
      <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
    </Link>
  );
}

export type BandTone = "paper" | "mist" | "deep" | "teal";

/** Ground colours for a full-width band. `paper` is the page default. */
export const bandTone: Record<BandTone, string> = {
  paper: "bg-white text-[#0b2e2e]",
  mist: "bg-[#eaf6f6] text-[#0b2e2e]",
  deep: "bg-[#0b2e2e] text-[#eaf6f6]",
  teal: "bg-[#66bfbf] text-[#0b2e2e]",
};

export function Band({
  tone = "paper",
  children,
  className,
  id,
  labelledBy,
  label,
}: {
  tone?: BandTone;
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
  label?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn("w-full max-w-full", bandTone[tone], className)}
    >
      {children}
    </section>
  );
}

/**
 * The head of a band: index label, display heading, and a short lead. Three
 * ruled columns on wide screens, stacked on a phone.
 */
export function SectionHead({
  index,
  eyebrow,
  title,
  lead,
  id,
  tone = "paper",
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  tone?: BandTone;
}) {
  const inverse = tone === "deep";
  const rule = inverse ? hairlineInverse : hairline;
  const leadColour = inverse ? "text-[#eaf6f6]/70" : "text-[#356464]";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 border-t pt-6 lg:grid-cols-12",
        rule,
      )}
    >
      <p
        className={cn(
          "index-label lg:col-span-3",
          inverse && "text-[#66bfbf]",
        )}
      >
        {index ? `${index} · ${eyebrow}` : eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "display-lg lg:col-span-6 lg:col-start-4",
          inverse && "text-white",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "max-w-[34ch] text-[15px] leading-7 lg:col-span-3",
            leadColour,
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A photograph on a teal mat with a ruled caption line holding the real
 * Commons credit. `inverse` switches the caption rules for dark bands.
 */
export function Figure({
  src,
  alt,
  credit,
  caption,
  className,
  ratio = "aspect-[4/3]",
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority = false,
  inverse = false,
  position,
}: {
  src: string;
  alt: string;
  credit: string;
  caption?: string;
  className?: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  inverse?: boolean;
  position?: string;
}) {
  const rule = inverse ? hairlineInverse : "border-[#0b2e2e]/10";
  const captionColour = inverse ? "text-[#eaf6f6]/70" : "text-[#356464]";

  return (
    <figure className={className}>
      <div className={cn("plate relative overflow-hidden", ratio)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", position ?? "object-center")}
        />
      </div>
      <figcaption
        className={cn(
          "mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-2",
          rule,
        )}
      >
        {caption ? (
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.18em]",
              captionColour,
            )}
          >
            {caption}
          </span>
        ) : (
          <span />
        )}
        <PhotoCredit fileUrl={credit} className={captionColour} />
      </figcaption>
    </figure>
  );
}

/** A numbered ledger row: numeral, title, body, and an optional right-hand note. */
export function LedgerRow({
  index,
  title,
  children,
  hint,
  inverse = false,
}: {
  index: string;
  title: ReactNode;
  children: ReactNode;
  hint?: string;
  inverse?: boolean;
}) {
  const rule = inverse ? hairlineInverse : "border-[#0b2e2e]/15";
  const bodyColour = inverse ? "text-[#eaf6f6]/75" : "text-[#356464]";
  const numeralColour = inverse ? "text-[#66bfbf]" : "text-[#c2004b]";

  return (
    <li
      className={cn(
        "grid grid-cols-1 gap-3 border-b py-7 sm:grid-cols-12 sm:gap-6 sm:py-8",
        rule,
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold tabular-nums tracking-[0.18em] sm:col-span-1",
          numeralColour,
        )}
      >
        {index}
      </p>
      <h3
        className={cn(
          "text-[1.4rem] font-semibold leading-tight tracking-[-0.03em] sm:col-span-4",
          inverse ? "text-white" : "text-[#0b2e2e]",
        )}
      >
        {title}
      </h3>
      <div
        className={cn(
          "max-w-[46ch] text-[15px] leading-7 sm:col-span-5",
          bodyColour,
        )}
      >
        {children}
      </div>
      {hint ? (
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em] sm:col-span-2 sm:text-right",
            bodyColour,
          )}
        >
          {hint}
        </p>
      ) : null}
    </li>
  );
}
