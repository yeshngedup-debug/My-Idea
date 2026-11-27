import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroPhotoEntrance } from "./hero-photo";
import { actionClass, LinkArrow, quietClass } from "./editorial";
import { cn } from "@/lib/utils";
import {
  resolveAction,
  type Cta,
  type CtaIntent,
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
  /** Intent used when no explicit primary CTA is supplied. */
  intent?: CtaIntent;
  image: MarketingImage | string;
  imageAlt?: string;
  /** Tailwind object-position class. Defaults to centre. */
  imagePosition?: string;
};

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
  intent,
  image,
  imageAlt,
  imagePosition,
}: EditorialHeroProps) {
  const action = primaryCta ?? resolveAction(null, intent);
  const heroImage: MarketingImage =
    typeof image === "string"
      ? {
          src: image,
          alt: imageAlt ?? "",
        }
      : image;

  return (
    <section className="border-b border-[#0b2e2e]/10">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12 lg:pb-16 lg:pt-14">
        <div className="lg:col-span-7 lg:pr-8">
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
              <LinkArrow href={action.href} size={16} />
            </Link>
            {secondary ? (
              <Link href={secondary.href} className={quietClass}>
                {secondary.label}
                <LinkArrow href={secondary.href} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroPhotoEntrance>
            <figure>
              <div className="plate relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5] lg:min-h-[420px]">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className={cn(
                    "object-cover",
                    imagePosition ?? "object-center",
                  )}
                />
              </div>
            </figure>
          </HeroPhotoEntrance>
        </div>
      </div>
    </section>
  );
}
