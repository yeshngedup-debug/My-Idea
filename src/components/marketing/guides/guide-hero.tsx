import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { HeroPhotoEntrance } from "@/components/marketing/hero-photo";
import { PhotoCredit } from "@/components/ui/photo-credit";
import type { Cta } from "@/components/marketing/nav";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]";

/**
 * Editorial hero shared by the four public guide pages. Two-line headline, one
 * short lead, one primary action and one quiet text link, one local photograph.
 */
export function GuideHero({
  title,
  lead,
  primary,
  secondary,
  image,
  imageAlt,
  creditFileUrl,
  reverse = false,
}: {
  title: ReactNode;
  lead: string;
  primary: Cta;
  secondary: Cta;
  image: string;
  imageAlt: string;
  creditFileUrl: string;
  reverse?: boolean;
}) {
  return (
    <section className="px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24 lg:px-12 lg:pb-40 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
          <HeroCopyEntrance className={cn(reverse && "lg:order-2")}>
            <h1 className="max-w-6xl text-balance text-[clamp(1.75rem,7vw,2.75rem)] font-medium leading-[1.06] tracking-[-0.03em] text-[#0b5c5c] sm:text-[clamp(3rem,5vw,5.5rem)] sm:leading-[1.02] sm:tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-[#356464] sm:text-lg sm:leading-8">
              {lead}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={primary.href}
                className={cn(
                  "pressable inline-flex min-h-12 items-center rounded-lg bg-[#ff0063] px-6 py-3 text-sm font-medium text-[#000000] hover:bg-[#d40054]",
                  focusRing,
                )}
              >
                {primary.label}
              </Link>
              <Link
                href={secondary.href}
                className={cn(
                  "inline-flex min-h-11 items-center text-sm font-medium text-[#0b5c5c] hover:text-[#c2004b] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none",
                  focusRing,
                )}
              >
                {secondary.label}
              </Link>
            </div>
          </HeroCopyEntrance>

          <div className={cn(reverse && "lg:order-1")}>
            <HeroPhotoEntrance>
              <figure className="relative isolate aspect-[4/5] overflow-hidden rounded-xl bg-[#ffffff]">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0b2e2e]/55 to-transparent"
                />
                <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                  <PhotoCredit fileUrl={creditFileUrl} className="text-[#ffffff]/80" />
                </figcaption>
              </figure>
            </HeroPhotoEntrance>
          </div>
        </div>
      </div>
    </section>
  );
}
