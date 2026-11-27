import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { PACKAGES } from "@/config/payment";
import { formatNuAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  buttonBase,
  marketButtonVariants,
  type MarketButtonVariant,
} from "./styles";

export {
  focusRing,
  focusRingDeep,
  focusRingMist,
  marketButtonVariants,
} from "./styles";
export type { MarketButtonVariant } from "./styles";

/**
 * The shared marketplace kit for the public marketing pages.
 *
 * One practical vocabulary for all four marketing routes: mist page, white
 * surfaces, deep teal structure, and magenta held back for the single
 * high-emphasis action of a view. Components are plain server-renderable
 * markup — no client wrappers, no scroll effects, no entrance animation.
 * Interaction feedback is limited to a 150ms colour/press transition.
 */

/**
 * The one button primitive for every marketing surface. `primary` carries the
 * magenta emphasis and should appear once per view.
 */
export function MarketButton({
  href,
  children,
  variant = "outline",
  className,
  showArrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: MarketButtonVariant;
  className?: string;
  showArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonBase, marketButtonVariants[variant], className)}
    >
      <span className="min-w-0 text-balance">{children}</span>
      {showArrow ? (
        <ArrowRight
          size={14}
          weight="bold"
          aria-hidden="true"
          className="shrink-0"
        />
      ) : null}
    </Link>
  );
}

/**
 * The trust bar. The copy is a single text node so the wording stays exact
 * and screen readers read it as one sentence.
 */
export function TrustBar({
  children,
  className,
  tone = "mist",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "mist" | "white";
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "border-y border-[#b9dede]",
        tone === "mist" ? "bg-[#eaf6f6]" : "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-2.5 sm:px-6 lg:px-10">
        <p className="text-[12px] font-semibold leading-5 text-[#0b2e2e] sm:text-[13px]">
          {children}
        </p>
      </div>
    </div>
  );
}

export type MarketplaceStep = {
  title: string;
  body: string;
};

/** Exactly three steps. Pages that promise three steps declare this type. */
export type ThreeSteps = readonly [
  MarketplaceStep,
  MarketplaceStep,
  MarketplaceStep,
];

/** A numbered step card. Used for the three-step paths and the longer paths. */
export function StepCards({
  steps,
  className,
  columns = 3,
}: {
  steps: readonly MarketplaceStep[];
  className?: string;
  columns?: 2 | 3;
}) {
  return (
    <ol
      className={cn(
        "grid gap-3",
        columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex h-full flex-col rounded-[4px] border border-[#b9dede] bg-white p-4"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#0b5c5c] text-[12px] font-semibold tabular-nums text-white"
          >
            {index + 1}
          </span>
          <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#0b2e2e]">
            {step.title}
          </h3>
          <p className="mt-1.5 text-[13px] leading-6 text-[#356464]">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** The band wrapper. Mist page, white surfaces, deep teal structure bands. */
export function Section({
  children,
  className,
  tone = "white",
  id,
  labelledBy,
  label,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "mist" | "deep";
  id?: string;
  labelledBy?: string;
  label?: string;
}) {
  const tones = {
    white: "bg-white text-[#0b2e2e]",
    mist: "bg-[#eaf6f6] text-[#0b2e2e]",
    deep: "bg-[#0b2e2e] text-white",
  } as const;

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn("w-full max-w-full", tones[tone], className)}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        {children}
      </div>
    </section>
  );
}

/** Section title, optional lead and an optional peer action on the right. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  aside,
  tone = "light",
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  tone?: "light" | "deep";
}) {
  const deep = tone === "deep";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="max-w-[30ch]">
        {eyebrow ? (
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.18em]",
              deep ? "text-[#b9dede]" : "text-[#0b5c5c]",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className={cn(
            "mt-1.5 text-[clamp(1.45rem,4vw,2.1rem)] font-semibold leading-[1.14] tracking-[-0.03em]",
            deep ? "text-white" : "text-[#0b2e2e]",
          )}
        >
          {title}
        </h2>
      </div>
      {lead ? (
        <p
          className={cn(
            "max-w-[54ch] text-[14px] leading-6",
            deep ? "text-[#eaf6f6]/80" : "text-[#356464]",
          )}
        >
          {lead}
        </p>
      ) : null}
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

/**
 * A responsive local photograph. The frame paints pale teal so a slow
 * connection shows brand colour instead of an empty grey box, and the image
 * is always present in the first paint.
 */
export function Photo({
  src,
  alt,
  sizes = "(max-width: 640px) 100vw, 50vw",
  className,
  ratio = "aspect-[4/3]",
  preload = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  ratio?: string;
  preload?: boolean;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-[4px]", className)}>
      <div className={cn("relative overflow-hidden bg-[#b9dede]", ratio)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
        />
      </div>
    </figure>
  );
}

/** Real shortlist package values. Nothing here is hard-coded in a page. */
export function formatNu(amount: number): string {
  return formatNuAmount(amount);
}

export function PackagePanel({
  id,
  className,
}: {
  id: "basic" | "full";
  className?: string;
}) {
  const pkg = PACKAGES[id];
  const features = pkg.features;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[4px] border border-[#b9dede] bg-white p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0b2e2e]">
          {pkg.name}
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#356464]">
          {pkg.priceRange}
        </p>
      </div>
      <p className="mt-2 text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#0b5c5c]">
        {formatNu(pkg.defaultAmount)}
      </p>
      <ul className="mt-4 border-t border-[#b9dede] pt-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 py-1.5 text-[13px] leading-6 text-[#0b2e2e]"
          >
            <CheckCircle
              aria-hidden="true"
              weight="fill"
              size={15}
              className="mt-1 shrink-0 text-[#0b5c5c]"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** A short list of checks with a teal tick. */
export function CheckList({
  items,
  className,
  tone = "light",
}: {
  items: readonly string[];
  className?: string;
  tone?: "light" | "deep";
}) {
  return (
    <ul className={cn("grid gap-2", className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-start gap-2.5 text-[13px] leading-6",
            tone === "deep" ? "text-[#eaf6f6]/85" : "text-[#0b2e2e]",
          )}
        >
          <CheckCircle
            aria-hidden="true"
            weight="fill"
            size={15}
            className={cn(
              "mt-1 shrink-0",
              tone === "deep" ? "text-[#b9dede]" : "text-[#0b5c5c]",
            )}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A labelled fact row, used for brief fields and application statuses. */
export function FactRow({
  term,
  detail,
  className,
}: {
  term: string;
  detail: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 border-b border-[#b9dede] py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4",
        className,
      )}
    >
      <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0b5c5c]">
        {term}
      </dt>
      <dd className="text-[13px] leading-6 text-[#0b2e2e]">{detail}</dd>
    </div>
  );
}
