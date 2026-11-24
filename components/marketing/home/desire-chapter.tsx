import Image from "next/image";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { PHOTO_CREDITS } from "@/components/marketing/nav";

/**
 * Desire chapter — a static local photograph beside a short heading. The
 * scroll-scrubbed scale and fade were removed: the photograph is the one bright
 * moment on this screen and should not move with the page.
 */
export function DesireChapter() {
  return (
    <section
      aria-labelledby="rooted-heading"
      className="relative overflow-hidden bg-[#f5f2ea] px-5 py-32 sm:px-8 sm:py-40 lg:px-12 lg:py-48"
    >
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="relative z-10">
          <h2
            id="rooted-heading"
            className="max-w-2xl text-4xl font-medium leading-[1.04] tracking-normal text-[#17352b] sm:text-6xl sm:tracking-[-0.02em]"
          >
            Bhutanese students do paid project work.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#5e554a] sm:text-lg sm:leading-8">
            These photographs show Bhutanese places, not platform listings or
            members.
          </p>
        </div>

        <figure className="mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#342d20] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/bhutanese-team.jpg"
              alt="Bhutanese students in kira performing in national dress"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#5e554a]">
            <span className="font-medium text-[#17352b]">
              Bhutanese students in kira
            </span>
            <PhotoCredit fileUrl={PHOTO_CREDITS.market} />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
