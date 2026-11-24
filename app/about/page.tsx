import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { SectionIntro } from "@/components/marketing/section-intro";
import { InlineImageText } from "@/components/editorial/inline-image-text";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { CtaBand } from "@/components/marketing/cta-band";
import { PhotoFeature } from "@/components/marketing/photo-feature";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { ScrubbedTextReveal } from "@/components/motion";
import { LiveContext } from "@/components/data/live-context";
import { LocalBridgeDifferences } from "@/components/brand/local-bridge-differences";
import { getLiveContext } from "@/lib/data/world-bank";
import { pageMetadata } from "@/lib/metadata";
import {
  CONTEXT_FACTS,
  CONTEXT_QUOTE,
  WORLD_BANK_SOURCE,
  YOUTH_UNEMPLOYMENT,
} from "@/data/landing";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Why Bhutan Tech Connect exists: a practical local bridge between Bhutanese students and startup founders, grounded in the national opportunity context.",
  path: "/about",
});

const dzong = {
  src: "/images/bhutanese-community.jpg",
  alt: "Bhutanese boys in traditional gho sitting together",
  fileUrl:
    "https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg",
};

const valley = {
  src: "/images/bhutanese-students.jpg",
  alt: "Young Bhutanese people in gho and kira working together at computers",
  fileUrl:
    "https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg",
};

const market = {
  src: "/images/bhutanese-team.jpg",
  alt: "Bhutanese students in kira performing in national dress",
  fileUrl:
    "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg",
};

const textLink =
  "inline-flex items-center gap-1.5 font-semibold text-[#b23c26] underline decoration-[#d84f37]/30 underline-offset-4 transition hover:decoration-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]";

const heroPrimary =
  "pressable inline-flex min-h-12 items-center rounded-lg bg-[#17352b] px-6 py-3 text-sm font-medium text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]";
const heroSecondary =
  "pressable inline-flex min-h-12 items-center rounded-lg border border-[#18251f]/15 px-5 py-3 text-sm font-medium text-[#17352b] hover:bg-[#fffefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]";

export default async function AboutPage() {
  const liveContext = await getLiveContext();

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#18251f]">
      <SiteHeader />

      <main id="main-content">
        <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-24 lg:pt-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:gap-12">
              <HeroCopyEntrance className="flex flex-col justify-end lg:pb-4">
                <p className="text-sm font-medium text-[#56645c]">
                  Thimphu · Bhutan
                </p>
                <h1 className="mt-5 max-w-[16ch] text-balance text-[clamp(2.5rem,5.2vw,5rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#17352b]">
                  Paid projects for Bhutanese students
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#5e554a] sm:text-lg sm:leading-8">
                  A local bridge between students and founders.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/public" className={heroPrimary}>
                    Explore the platform
                  </Link>
                  <Link href="/how-it-works" className={heroSecondary}>
                    See how it works
                  </Link>
                </div>
              </HeroCopyEntrance>

              <figure className="relative isolate aspect-[4/5] overflow-hidden bg-[#28453a] lg:aspect-auto lg:min-h-[640px]">
                <Image
                  src={dzong.src}
                  alt={dzong.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#101d17]/45 to-transparent"
                />
                <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                  <PhotoCredit
                    fileUrl={dzong.fileUrl}
                    className="text-[#fffefa]/80"
                  />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="why-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <SectionIntro
              headingId="why-heading"
              title={
                <ScrubbedTextReveal
                  as="span"
                  text="Young people need work close to home"
                />
              }
              lead="A practical first step for students and founders."
            />
            <Reveal direction="right" delay={0.08} className="border-t border-[#18251f]/15 pt-8">
              <p className="text-[clamp(4.5rem,10vw,8rem)] font-semibold leading-[0.8] tracking-[-0.09em] text-[#17352b]">
                {YOUTH_UNEMPLOYMENT.value}
              </p>
              <h3 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-[#17352b] sm:text-3xl">
                {YOUTH_UNEMPLOYMENT.label}
              </h3>
            </Reveal>
          </div>
        </section>

        <section
          aria-labelledby="context-heading"
          className="border-y border-[#18251f]/15 bg-[#fffefa] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="context-heading"
              title="The context behind the work"
            />
            <StaggerGroup className="mt-10 max-w-3xl border-t border-[#18251f]/15">
              {CONTEXT_FACTS.map((fact) => (
                <StaggerItem
                  key={fact.label}
                  className="grid gap-2 border-b border-[#18251f]/15 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8"
                >
                  <p className="text-2xl font-semibold text-[#17352b] sm:text-3xl">
                    {fact.value}
                  </p>
                  <div>
                    <h3 className="text-base font-semibold leading-snug text-[#17352b] sm:text-lg">
                      {fact.label}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#56645c]">
                      {fact.note}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>

            <Reveal className="mt-12 grid gap-8 border-t border-[#18251f]/15 pt-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <blockquote className="border-l-2 border-[#d84f37] pl-6 text-xl leading-relaxed text-[#17352b] sm:text-2xl">
                &ldquo;{CONTEXT_QUOTE.text}&rdquo;
              </blockquote>
              <p className="self-end text-sm leading-6 text-[#56645c]">
                {CONTEXT_QUOTE.author}
              </p>
            </Reveal>

            <Reveal className="mt-10 border-t border-[#18251f]/15 pt-6">
              <p className="text-xs leading-5 text-[#56645c]">
                Source:{" "}
                <a
                  href={WORLD_BANK_SOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#b23c26] underline decoration-[#d84f37]/30 underline-offset-4 transition hover:decoration-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]"
                >
                  {WORLD_BANK_SOURCE.label}
                </a>
                . National figures, not platform results.
              </p>
            </Reveal>
          </div>
        </section>

        <details className="bg-[#eae5d9] px-5 sm:px-8 lg:px-12">
          <summary className="mx-auto max-w-[1440px] cursor-pointer py-5 text-sm font-semibold text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eae5d9]">
            Official statistics
          </summary>
          <LiveContext initial={liveContext} variant="full" />
        </details>

        <section
          aria-labelledby="bridge-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto max-w-5xl">
              <InlineImageText
                id="bridge-heading"
                before="A practical local"
                imageSrc="/images/bhutanese-community.jpg"
                imageAlt="Bhutanese students working together"
                creditFileUrl={PHOTO_CREDITS.dzong}
                accessibleLabel="A practical local bridge"
                after="bridge"
              />
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#5e554a] sm:text-lg sm:leading-8">
                Students and founders meet around paid project work. Not an
                employer or agent.
              </p>
            </div>
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <Reveal>
                <div className="grid gap-6 text-sm leading-7 text-[#18251f]/70 sm:text-base sm:leading-8">
                  <p className="max-w-xl">
                    Students apply to projects; founders post briefs and agree
                    terms directly.
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[#18251f]/15 pt-6">
                    <Link href="/how-it-works" className={textLink}>
                      See how it works
                    </Link>
                    <Link href="/faq" className={textLink}>
                      Read the FAQ
                    </Link>
                  </div>
                </div>
              </Reveal>
              <PhotoFeature
                image={valley}
                caption="Built around real work"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="sm:aspect-[16/10]"
              />
            </div>
          </div>
        </section>

        <LocalBridgeDifferences />

        <section
          aria-labelledby="verify-heading"
          className="border-y border-[#18251f]/15 bg-[#fffefa] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="verify-heading"
              title="How we verify students"
              lead="A manual check, never an algorithm."
            />
            <Reveal className="mt-10 grid gap-8 border-t border-[#18251f]/15 pt-8 sm:grid-cols-3 sm:gap-10">
              <div>
                <h3 className="text-base font-semibold text-[#17352b]">
                  Identity and institution details
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#56645c]">
                  An admin checks the identity and institution details
                  on the student profile.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#17352b]">
                  CV review
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#56645c]">
                  The admin reads the uploaded CV.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#17352b]">
                  Rank and verified badge
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#56645c]">
                  The admin sets the profile rank and applies the
                  verified badge.
                </p>
              </div>
            </Reveal>
            <Reveal className="mt-8">
              <p className="text-xs leading-5 text-[#56645c]">
                Questions?{" "}
                <Link href="/contact" className={textLink}>
                  Contact us
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>

        <section
          aria-labelledby="photos-heading"
          className="bg-[#eae5d9] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="photos-heading"
              title="Photographs of places, not members"
            />
            <div className="mt-10">
              <PhotoFeature
                image={market}
                caption="Bhutanese students in kira"
                sizes="(max-width: 768px) 100vw, 90vw"
                className="sm:aspect-[2]"
              />
            </div>
            <Reveal className="mt-6">
              <p className="max-w-2xl text-xs leading-5 text-[#56645c]">
                Photographs by Doctor 17, Keith Mason and Christopher J. Fynn
                via Wikimedia Commons, under CC BY-SA 4.0 and CC BY-SA 3.0.
                Each photo credit links to the original file.
              </p>
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="See how it all fits together"
          primaryCta={{ href: "/public", label: "Explore the public platform" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
