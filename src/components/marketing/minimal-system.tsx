import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PACKAGES } from "@/config/payment";
import { formatNuAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

export type MinimalAction = {
  href: string;
  label: string;
};

export type MinimalStep = {
  title: ReactNode;
  body: ReactNode;
};

export type MinimalFact = {
  term: ReactNode;
  detail: ReactNode;
};

export function PrimaryAction({
  href,
  label,
  className,
}: MinimalAction & { className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg bg-cta px-6 py-3 text-[0.9375rem] font-medium text-cta-foreground transition-colors duration-150 hover:bg-cta-hover",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function TextAction({
  href,
  label,
  className,
}: MinimalAction & { className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center text-[0.9375rem] text-muted-foreground transition-colors duration-150 hover:text-foreground",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function MinimalActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-9 flex flex-wrap items-center gap-x-8 gap-y-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

type MinimalHeroProps = {
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  eyebrow?: ReactNode;
  note?: ReactNode;
  media?: ReactNode;
  className?: string;
};

export function MinimalHero({
  title,
  description,
  actions,
  eyebrow,
  note,
  media,
  className,
}: MinimalHeroProps) {
  return (
    <section className={cn("section-shell", className)}>
      <div className="content-shell">
        {eyebrow ? <p className="index-label mb-5">{eyebrow}</p> : null}
        <h1 className="display-xl max-w-[18ch]">{title}</h1>
        <p className="lead-copy mt-7 max-w-[44rem]">{description}</p>
        {actions}
        {note ? <p className="quiet-note mt-6 max-w-[44rem]">{note}</p> : null}
      </div>
      {media ? (
        <div className="media-shell mt-14">
          <div className="rounded-3xl bg-muted p-2 sm:p-3">{media}</div>
        </div>
      ) : null}
    </section>
  );
}

type MinimalSectionProps = {
  id?: string;
  titleId?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  wide?: boolean;
};

export function MinimalSection({
  id,
  titleId,
  title,
  description,
  children,
  className,
  wide,
}: MinimalSectionProps) {
  const shell = wide ? "media-shell" : "content-shell";

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("section-shell", className)}
    >
      <div className={shell}>
        <h2 id={titleId} className="display-lg max-w-[22ch]">
          {title}
        </h2>
        {description ? (
          <p className="lead-copy mt-6 max-w-[44rem]">{description}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

type MinimalEditorialSectionProps = {
  id?: string;
  titleId?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * A light-gray editorial band. Apple's App Store uses calm alternating bands
 * and large rounded cards; this keeps that rhythm inside the locked palette.
 */
export function MinimalEditorialSection({
  id,
  titleId,
  title,
  description,
  children,
  className,
}: MinimalEditorialSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("section-shell bg-muted", className)}
    >
      <div className="content-shell">
        <h2 id={titleId} className="display-lg max-w-[20ch]">
          {title}
        </h2>
        {description ? (
          <p className="lead-copy mt-6 max-w-[44rem]">{description}</p>
        ) : null}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

export type MinimalEditorialCard = {
  label?: ReactNode;
  title: ReactNode;
  body: ReactNode;
  action?: MinimalAction;
};

export function MinimalEditorialCards({
  items,
  className,
}: {
  items: readonly MinimalEditorialCard[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((item, index) => (
        <article
          key={index}
          className="rounded-3xl border border-border bg-card p-7 sm:p-9"
        >
          <p className="index-label">{item.label ?? String(index + 1).padStart(2, "0")}</p>
          <h3 className="display-md mt-6 max-w-[18ch]">{item.title}</h3>
          <p className="lead-copy mt-4">{item.body}</p>
          {item.action ? (
            <TextAction
              href={item.action.href}
              label={item.action.label}
              className="mt-7"
            />
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function TrustLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("trust-line", className)}>{children}</p>;
}

type MinimalMediaProps = {
  icon: Icon;
  label: string;
  className?: string;
  caption?: ReactNode;
};

/**
 * A quiet icon panel in place of photography. The icon is decorative: the
 * visible label carries the meaning for screen readers and for people who do
 * not read icons the same way.
 */
export function MinimalMedia({
  icon: PanelIcon,
  label,
  className,
  caption,
}: MinimalMediaProps) {
  return (
    <figure className={cn("m-0", className)}>
      <div
        data-media-panel=""
        className="flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-10 text-center sm:min-h-[20rem] lg:min-h-[24rem]"
      >
        <PanelIcon
          data-media-icon=""
          aria-hidden="true"
          size={72}
          weight="light"
          className="text-cta"
        />
        <p className="mt-7 max-w-[24ch] text-[1.0625rem] font-medium leading-[1.5] text-foreground">
          {label}
        </p>
      </div>
      {caption ? (
        <figcaption className="quiet-note mt-4">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function MinimalSteps({
  steps,
  className,
}: {
  steps: readonly MinimalStep[];
  className?: string;
}) {
  return (
    <ol className={cn("m-0 grid gap-3 p-0", className)}>
      {steps.map((step, index) => (
        <li
          key={index}
          className="rounded-3xl border border-border bg-card p-7 sm:p-8"
        >
          <p className="index-label">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-6 text-[1.375rem] font-semibold leading-tight tracking-[-0.02em]">
            {step.title}
          </h3>
          <p className="mt-3 text-[1.0625rem] leading-[1.6] text-muted-foreground">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function MinimalFacts({
  items,
  className,
}: {
  items: readonly MinimalFact[];
  className?: string;
}) {
  return (
    <dl className={cn("m-0 border-t border-border", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="border-b border-border py-5 first:pt-0 md:grid md:grid-cols-[12rem_1fr] md:gap-8"
        >
          <dt className="font-medium">{item.term}</dt>
          <dd className="mt-2 text-muted-foreground md:mt-0">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MinimalCheckList({
  items,
  className,
}: {
  items: readonly ReactNode[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "m-0 list-disc space-y-3 pl-5 text-[1.0625rem] leading-[1.6] text-muted-foreground",
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function MinimalPackage({
  id,
  className,
}: {
  id: keyof typeof PACKAGES;
  className?: string;
}) {
  const pkg = PACKAGES[id];

  return (
    <article
      className={cn("rounded-3xl border border-border bg-card p-7 sm:p-9", className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="display-md max-w-[18ch]">{pkg.name}</h3>
        <p className="text-[1.125rem] font-medium">
          {formatNuAmount(pkg.defaultAmount)}
        </p>
      </div>
      <p className="quiet-note mt-2">
        {pkg.priceRange} · {pkg.minStudents}–{pkg.maxStudents} students
      </p>
      <ul className="m-0 mt-5 list-none space-y-2 p-0 text-[1rem] leading-[1.6] text-muted-foreground">
        {pkg.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}

type MinimalClosingActionProps = {
  title: ReactNode;
  description?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function MinimalClosingAction({
  title,
  description,
  body,
  children,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: MinimalClosingActionProps) {
  const copy = description ?? body;

  return (
    <section className="section-shell bg-muted">
      <div className="content-shell">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display-lg max-w-[20ch]">{title}</h2>
              {copy ? (
                <p className="lead-copy mt-4 max-w-[38rem]">{copy}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {primaryLabel && primaryHref ? (
                <PrimaryAction href={primaryHref} label={primaryLabel} />
              ) : null}
              {secondaryLabel && secondaryHref ? (
                <TextAction href={secondaryHref} label={secondaryLabel} />
              ) : null}
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
