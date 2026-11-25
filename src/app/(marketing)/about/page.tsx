import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { InlineImageText } from "@/components/editorial/inline-image-text";
import { ScaleFadeImage } from "@/components/editorial/scale-fade-image";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { PhotoFeature } from "@/components/marketing/photo-feature";
import { Reveal } from "@/components/ui/motion";
import { ScrubbedTextReveal } from "@/components/motion";
import { LiveContext } from "@/components/data/live-context";
import { LocalBridgeDifferences } from "@/components/brand/local-bridge-differences";
import { PinnedHeadingSection } from "@/components/layout/pinned-heading-section";
import { AnimatedDisclosureList } from "@/components/interactive/animated-disclosure-list";
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

/** BTC palette, applied as a restrained editorial card system. */
const card =
  "rounded-3xl border border-[#b9dede]/12 bg-white shadow-[0_2px_10px_rgba(11,46,46,0.04)]";
const cardBody = "p-6 sm:p-10 lg:p-14";
const band = "px-4 py-16 sm:px-6 md:py-24 lg:px-8";
const wideBand = "px-4 py-32 sm:px-6 md:py-48 lg:px-8";
const sectionHeading =
  "text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#0b2e2e] sm:text-4xl lg:text-5xl";
const accent = "text-[#c2004b]";
const muted = "text-[#356464]";

/** Interactive surfaces share one hover/press treatment and a 44px target. */
const lift =
  "min-h-11 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(11,46,46,0.10)] motion-reduce:transform-none motion-reduce:transition-none";

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
  "inline-flex min-h-11 items-center font-semibold text-[#0b5c5c] underline decoration-[#ff0063] decoration-2 underline-offset-4 transition-colors hover:text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

/**
 * The disclosure component builds button IDs and `aria-controls` values from
 * each item id. Labels contain spaces and an apostrophe, so derive a
 * whitespace-free id that stays valid if the shared copy is edited later.
 */
function contextFactId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const heroPrimary =
  "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#ff0063] px-6 py-3 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";
const heroSecondary =
  "pressable inline-flex min-h-11 items-center justify-center rounded-full border border-[#b9dede]/20 bg-white px-6 py-3 text-sm font-semibold text-[#0b5c5c] transition-colors hover:bg-[#eaf6f6]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

export default async function AboutPage() {
  const liveContext = await getLiveContext();

  return (
    <div className="min-h-screen bg-[#eaf6f6] text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Editorial split: one large heading on the left, one credited
            photograph on the right, with deliberate space between them. */}
        <section aria-labelledby="about-heading" className={wideBand}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-12 grid-flow-dense gap-4">
              <HeroCopyEntrance className="col-span-12 flex flex-col justify-center px-2 py-6 md:col-span-7 md:px-8 lg:pr-16">
                <h1
                  id="about-heading"
                  className="w-full max-w-6xl text-balance text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#0b2e2e]"
                >
                  <ScrubbedTextReveal
                    as="span"
                    text="Paid projects for"
                    className="[&_span]:!text-[#0b2e2e]"
                  />{" "}
                  <span className={accent}>Bhutanese students</span>
                </h1>
                <p className={`mt-10 max-w-xl text-lg leading-8 sm:text-xl ${muted}`}>
                  A local bridge between students and founders.
                </p>
                <div className="mt-12 flex flex-wrap items-center gap-3">
                  <Link href="/public" className={heroPrimary}>
                    Explore the platform
                  </Link>
                  <Link href="/how-it-works" className={heroSecondary}>
                    See how it works
                  </Link>
                </div>
              </HeroCopyEntrance>

              <figure className="col-span-12 md:col-span-5">
                <ScaleFadeImage className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#0b2e2e]">
                  <Image
                    src={dzong.src}
                    alt={dzong.alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 38vw"
                    className="object-cover object-center grayscale contrast-[1.15] opacity-85"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 45% 35%, rgba(11,46,46,0.05) 0%, rgba(11,46,46,0.78) 100%)",
                    }}
                  />
                </ScaleFadeImage>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="text-sm font-medium text-[#0b2e2e]">
                    Bhutanese boys in gho, sitting together
                  </span>
                  <PhotoCredit
                    fileUrl={dzong.fileUrl}
                    className="text-[#356464]"
                  />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section aria-labelledby="why-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <h2 id="why-heading" className={sectionHeading}>
                <ScrubbedTextReveal
                  as="span"
                  text="Young people need work close to home"
                  className="[&_span]:!text-[#0b2e2e]"
                />
              </h2>
              <p className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
                A practical first step for students and founders.
              </p>
              <Reveal className="mx-auto mt-16 max-w-xl border-t border-[#b9dede]/12 pt-10 text-center">
                <p className="text-[clamp(4.5rem,10vw,8rem)] font-semibold leading-[0.8] tracking-[-0.09em] text-[#0b2e2e]">
                  {YOUTH_UNEMPLOYMENT.value}
                </p>
                <h3 className="mt-6 text-balance text-2xl font-semibold leading-snug tracking-tight text-[#0b5c5c] sm:text-3xl">
                  {YOUTH_UNEMPLOYMENT.label}
                </h3>
              </Reveal>
            </div>
          </div>
        </section>

        <section aria-labelledby="context-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <PinnedHeadingSection
                split="lg:grid-cols-[0.3fr_0.7fr]"
                heading={
                  <h2
                    id="context-heading"
                    className="text-balance text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#0b2e2e] sm:text-4xl lg:text-left"
                  >
                    The context{" "}
                    <span className={accent}>behind the work</span>
                  </h2>
                }
              >
                <AnimatedDisclosureList
                  label="National context indicators"
                  defaultValue={contextFactId(CONTEXT_FACTS[0].label)}
                  className="mt-2 max-w-3xl lg:mt-0"
                  items={CONTEXT_FACTS.map((fact) => ({
                    id: contextFactId(fact.label),
                    trigger: (
                      <span className="grid gap-2 py-1 sm:grid-cols-[8rem_1fr] sm:gap-8">
                        <span className="text-2xl font-semibold text-[#0b2e2e] sm:text-3xl">
                          {fact.value}
                        </span>
                        <span
                          role="heading"
                          aria-level={3}
                          className="text-base font-semibold leading-snug text-[#0b2e2e] sm:text-lg"
                        >
                          {fact.label}
                        </span>
                      </span>
                    ),
                    children: (
                      <p className={`text-xs leading-5 ${muted}`}>{fact.note}</p>
                    ),
                  }))}
                />

                <figure className="mt-12">
                  <ScaleFadeImage className="relative isolate aspect-[4/1] overflow-hidden rounded-[1.25rem] border border-[#b9dede]/12 bg-[#eaf6f6]">
                    <Image
                      src="/images/thimphu-market.webp"
                      alt="Open sacks of spices and grain at a market stall in Thimphu"
                      fill
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      className="object-cover object-center"
                    />
                  </ScaleFadeImage>
                  <figcaption className={`mt-2 text-xs leading-5 ${muted}`}>
                    A market stall in Thimphu.
                  </figcaption>
                </figure>

                <Reveal className="mt-16 grid gap-8 border-t border-[#b9dede]/12 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                  <blockquote className="border-l-2 border-[#ff0063] pl-6 text-xl leading-relaxed text-[#0b2e2e] sm:text-2xl">
                    &ldquo;{CONTEXT_QUOTE.text}&rdquo;
                  </blockquote>
                  <p className={`self-end text-sm leading-6 ${muted}`}>
                    {CONTEXT_QUOTE.author}
                  </p>
                </Reveal>

                <Reveal className="mt-12 border-t border-[#b9dede]/12 pt-6">
                  <p className={`text-xs leading-5 ${muted}`}>
                    Source:{" "}
                    <a
                      href={WORLD_BANK_SOURCE.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-6 items-center font-semibold text-[#0b5c5c] underline decoration-[#ff0063] decoration-2 underline-offset-4 transition-colors hover:text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                    >
                      {WORLD_BANK_SOURCE.label}
                    </a>
                    . National figures, not platform results.
                  </p>
                </Reveal>
              </PinnedHeadingSection>
            </div>
          </div>
        </section>

        <section className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <details>
                <summary className="mx-auto max-w-[1440px] min-h-11 cursor-pointer rounded-full py-2 text-center text-sm font-semibold text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  Official statistics
                </summary>
                <LiveContext initial={liveContext} variant="full" />
              </details>
            </div>
          </div>
        </section>

        <section aria-labelledby="bridge-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              {/* Gapless 12-column mosaic: 7 + 5. */}
              <div className="grid grid-cols-12 grid-flow-dense gap-4">
                <div className="col-span-12 md:col-span-7">
                  <InlineImageText
                    id="bridge-heading"
                    before="A practical local"
                    imageSrc="/images/bhutanese-community.jpg"
                    imageAlt="Bhutanese students working together"
                    creditFileUrl={PHOTO_CREDITS.dzong}
                    accessibleLabel="A practical local bridge: Bhutanese students working together"
                    after="bridge"
                  />
                  <p className={`mt-8 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
                    Students and founders meet around paid project work. Not an
                    employer or agent.
                  </p>
                  <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#b9dede]/12 pt-8">
                    <Link href="/how-it-works" className={textLink}>
                      See how it works
                    </Link>
                    <Link href="/faq" className={textLink}>
                      Read the FAQ
                    </Link>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <ScaleFadeImage>
                    <PhotoFeature
                      image={valley}
                      caption="Built around real work"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className={`sm:aspect-[16/10] ${lift}`}
                      reveal={false}
                    />
                  </ScaleFadeImage>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <LocalBridgeDifferences className="!px-0 !py-0" />
            </div>
          </div>
        </section>

        <section aria-labelledby="verify-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <h2 id="verify-heading" className={`${sectionHeading} text-left`}>
                How we <span className={accent}>verify students</span>
              </h2>
              <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
                A manual check, never an algorithm.
              </p>
              {/* Gapless 12-column mosaic: 6 + 3 + 3. */}
              <div className="mt-12 grid grid-cols-12 grid-flow-dense gap-4 border-t border-[#b9dede]/12 pt-10">
                <Reveal delay={0} className="col-span-12 sm:col-span-6">
                  <div className={`h-full rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 ${lift}`}>
                    <h3 className="text-base font-semibold text-[#0b2e2e]">
                      Identity and institution details
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      An admin checks the identity and institution details
                      on the student profile.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.05} className="col-span-12 sm:col-span-3">
                  <div className={`h-full rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 ${lift}`}>
                    <h3 className="text-base font-semibold text-[#0b2e2e]">
                      CV review
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      The admin reads the uploaded CV.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.1} className="col-span-12 sm:col-span-3">
                  <div className={`h-full rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 ${lift}`}>
                    <h3 className="text-base font-semibold text-[#0b2e2e]">
                      Rank and verified badge
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      The admin sets the profile rank and applies the
                      verified badge.
                    </p>
                  </div>
                </Reveal>
              </div>
              <Reveal className="mt-10">
                <p className={`text-center text-xs leading-5 ${muted}`}>
                  Questions?{" "}
                  <Link href="/contact" className={textLink}>
                    Contact us
                  </Link>
                  .
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section aria-labelledby="photos-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <h2 id="photos-heading" className={`${sectionHeading} text-left`}>
                Photographs of{" "}
                <span className={accent}>places, not members</span>
              </h2>
              <div className="mt-12">
                <ScaleFadeImage>
                  <PhotoFeature
                    image={market}
                    caption="Bhutanese students in kira"
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className={`sm:aspect-[2] ${lift}`}
                    reveal={false}
                  />
                </ScaleFadeImage>
              </div>
              <Reveal className="mt-8">
                <p className={`mx-auto max-w-2xl text-center text-xs leading-5 ${muted}`}>
                  The credited Wikimedia Commons photographs are by Doctor 17,
                  Keith Mason and Christopher J. Fynn, under CC BY-SA 4.0 and
                  CC BY-SA 3.0. Each photo credit links to the original file.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={wideBand}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="rounded-3xl border border-[#b9dede]/12 bg-[#66bfbf] px-6 py-20 text-center sm:px-10 sm:py-28">
              <h2 className="text-balance text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#0b2e2e]">
                See how it all <span className={accent}>fits together</span>
              </h2>
              <div className="mt-10 flex justify-center">
                <Link href="/public" className={heroPrimary}>
                  Explore the public platform
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
