import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { HeroCopyEntrance } from "./hero-motion";
import { HeroPhotoEntrance } from "./hero-photo";
import { cn } from "@/lib/utils";
import { CTA_HREFS, CTA_LABELS, PHOTO_CREDITS, type Cta, type MarketingImage } from "./nav";

export type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead: string;
  /** Preferred API. */
  primaryCta?: Cta;
  /** Legacy alias used by some pages. */
  primary?: Cta;
  secondary?: Cta;
  image: MarketingImage | string;
  imageAlt?: string;
  creditFileUrl?: string;
  /** Tailwind object-position class, e.g. "object-top". Default is 45% 55%. */
  imagePosition?: string;
  /**
   * Opt-in centered architecture. Default false keeps the asymmetric hero for
   * every existing page. Additive prop only.
   */
  cinematic?: boolean;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* One filled CTA, one quiet outline peer. They no longer read as two equal
   dark buttons in the same row. */
const primaryClass =
  "pressable inline-flex min-h-12 items-center justify-center rounded-md bg-cta px-6 py-3 text-sm font-medium text-cta-foreground hover:bg-cta-hover";
const secondaryClass =
  "pressable inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-card px-5 py-3 text-sm font-medium text-primary hover:bg-secondary";

/** Asymmetric editorial hero: copy on the left, one of the three local photos on the right. */
export function PageHero({
  eyebrow,
  title,
  lead,
  primaryCta,
  primary,
  secondary,
  image,
  imageAlt,
  creditFileUrl,
  imagePosition,
  cinematic = false,
}: PageHeroProps) {
  const action = primaryCta ?? primary ?? {
    href: CTA_HREFS.signup,
    label: CTA_LABELS.signup,
  };
  const heroImage: MarketingImage =
    typeof image === "string"
      ? {
          src: image,
          alt: imageAlt ?? "",
          fileUrl: creditFileUrl ?? PHOTO_CREDITS.valley,
        }
      : image;

  if (cinematic) {
    const secondAction: Cta | null =
      secondary ??
      (action.href !== CTA_HREFS.howItWorks
        ? { href: CTA_HREFS.howItWorks, label: CTA_LABELS.seeHow }
        : null);

    return (
      <section className="relative isolate overflow-hidden bg-[#f5f2ea] pt-16 sm:pt-20 lg:pt-20">
        <div className="px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl text-center">
            <HeroCopyEntrance>
              {eyebrow ? (
                <p className="mb-4 text-xs font-medium text-ink-soft">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mx-auto max-w-6xl text-balance text-[clamp(3rem,6vw,6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#17352b]">
                {title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-[1.65] text-body-secondary sm:text-lg">
                {lead}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href={action.href} className={cn(primaryClass, focusRing)}>
                  {action.label}
                </Link>
                {secondAction ? (
                  <Link
                    href={secondAction.href}
                    className={cn(secondaryClass, focusRing)}
                  >
                    {secondAction.label}
                  </Link>
                ) : null}
              </div>
            </HeroCopyEntrance>
          </div>
        </div>

        {/* Full-bleed photograph. A short bottom scrim keeps the credit legible;
            no radial wash, no color grade. */}
        <div className="relative mt-12 sm:mt-16">
          <HeroPhotoEntrance>
            <figure className="relative isolate h-[46vh] min-h-[340px] w-full overflow-hidden bg-[#17352b] sm:h-[58vh] sm:min-h-[460px]">
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                priority
                sizes="100vw"
                className={cn("object-cover", imagePosition ?? "object-[45%_55%]")}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#101d17]/55 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8">
                <PhotoCredit fileUrl={heroImage.fileUrl} className="text-[#fffefa]/80" />
              </figcaption>
            </figure>
          </HeroPhotoEntrance>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 text-xs text-ink-soft">
          <span>Thimphu · Bhutan</span>
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <HeroCopyEntrance className="py-2">
            {eyebrow ? (
              <p className="mb-4 text-xs font-medium text-ink-soft">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="max-w-6xl text-balance text-[clamp(2rem,7vw,3rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[#17352b] sm:text-[clamp(3.25rem,5.5vw,5.25rem)] sm:leading-[1.02] sm:tracking-[-0.04em]">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-[1.65] text-body-secondary sm:text-lg">
              {lead}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={action.href} className={cn(primaryClass, focusRing)}>
                {action.label}
              </Link>
              {secondary ? (
                <Link href={secondary.href} className={cn(secondaryClass, focusRing)}>
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </HeroCopyEntrance>

          <HeroPhotoEntrance>
            <figure className="relative isolate min-h-80 overflow-hidden rounded-xl bg-[#28453a] sm:aspect-[1.28] sm:min-h-0">
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={cn("object-cover", imagePosition ?? "object-[45%_55%]")}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#101d17]/55 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-5 right-5 sm:left-7">
                <PhotoCredit fileUrl={heroImage.fileUrl} className="text-[#fffefa]/80" />
              </figcaption>
            </figure>
          </HeroPhotoEntrance>
        </div>
      </div>
    </section>
  );
}
