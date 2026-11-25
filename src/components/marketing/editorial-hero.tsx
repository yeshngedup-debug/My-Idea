import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { HeroCopyEntrance } from "./hero-motion";
import { HeroPhotoEntrance } from "./hero-photo";
import { cn } from "@/lib/utils";
import {
  CTA_HREFS,
  CTA_LABELS,
  PHOTO_CREDITS,
  type Cta,
  type MarketingImage,
} from "./nav";

export type EditorialHeroProps = {
  /** Section numeral printed before the label, e.g. "01". */
  index: string;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  primaryCta?: Cta;
  secondary?: Cta;
  image: MarketingImage | string;
  imageAlt?: string;
  creditFileUrl?: string;
  /** Tailwind object-position class. Defaults to centre. */
  imagePosition?: string;
  /** Small caption printed above the credit. */
  caption?: string;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const actionClass = `group inline-flex min-h-12 items-center gap-3 rounded-[2px] bg-[#ff0063] px-6 text-[13px] font-semibold tracking-[-0.01em] text-black transition-[transform,background-color] duration-200 hover:bg-[#d40054] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing}`;

const quietClass = `group inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 decoration-1 underline-offset-[6px] transition-colors hover:decoration-[#ff0063] ${focusRing}`;

/**
 * The shared editorial hero for marketing subpages. Same ledger as the home
 * page: copy on paper at left, one photograph plate at right, a hairline
 * baseline under both. No centred wash, no rounded shell.
 */
export function EditorialHero({
  index,
  eyebrow,
  title,
  lead,
  primaryCta,
  secondary,
  image,
  imageAlt,
  creditFileUrl,
  imagePosition,
  caption,
}: EditorialHeroProps) {
  const action = primaryCta ?? {
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

  return (
    <section className="border-b border-[#0b2e2e]/10">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12 lg:pb-16 lg:pt-14">
        <HeroCopyEntrance className="lg:col-span-7 lg:pr-8">
          <p className="index-label">
            {index} · {eyebrow}
          </p>
          <h1 className="display-xl mt-7 max-w-[14ch] text-[#0b2e2e]">
            {title}
          </h1>
          <p className="mt-7 max-w-[46ch] text-lg leading-8 text-[#356464]">
            {lead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link href={action.href} className={actionClass}>
              {action.label}
              <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
            </Link>
            {secondary ? (
              <Link href={secondary.href} className={quietClass}>
                {secondary.label}
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </HeroCopyEntrance>

        <div className="lg:col-span-5">
          <HeroPhotoEntrance>
            <figure>
              <div className="plate relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5] lg:min-h-[420px]">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className={cn(
                    "object-cover",
                    imagePosition ?? "object-center",
                  )}
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[#0b2e2e]/10 pt-2">
                {caption ? (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#356464]">
                    {caption}
                  </span>
                ) : (
                  <span />
                )}
                <PhotoCredit
                  fileUrl={heroImage.fileUrl}
                  className="text-[#356464]"
                />
              </figcaption>
            </figure>
          </HeroPhotoEntrance>
        </div>
      </div>
    </section>
  );
}
