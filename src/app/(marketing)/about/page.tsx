import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { InlineImageText } from "@/components/editorial/inline-image-text";
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

/** BTC palette, applied as a restrained Paywave-style card system. */
const card =
  "rounded-3xl border border-[#1B4D3E]/12 bg-white shadow-[0_2px_10px_rgba(11,31,26,0.04)]";
const cardBody = "p-6 sm:p-10 lg:p-14";
const band = "px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9";
const pill =
  "inline-flex min-h-8 items-center justify-center rounded-full border border-[#1B4D3E]/15 bg-[#F7F4EE] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1B4D3E]";
const sectionHeading =
  "text-balance text-center text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#0B1F1A] sm:text-4xl lg:text-5xl";
const accent = "text-[#E8A317]";
const muted = "text-[#5A6A61]";

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
  "inline-flex min-h-11 items-center font-semibold text-[#1B4D3E] underline decoration-[#E8A317] decoration-2 underline-offset-4 transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

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
  "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors hover:bg-[#F2B733] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";
const heroSecondary =
  "pressable inline-flex min-h-11 items-center justify-center rounded-full border border-[#1B4D3E]/20 bg-white px-6 py-3 text-sm font-semibold text-[#1B4D3E] transition-colors hover:bg-[#E8E4DB]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

export default async function AboutPage() {
  const liveContext = await getLiveContext();

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#0B1F1A]">
      <SiteHeader />

      <main id="main-content">
        <section className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} overflow-hidden`}>
              <HeroCopyEntrance className="mx-auto max-w-3xl px-6 pb-8 pt-12 text-center sm:px-10 sm:pt-14">
                <span className={pill}>Thimphu · Bhutan</span>
                <h1 className="mt-6 text-balance text-[clamp(2.5rem,5.2vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[#0B1F1A]">
                  Paid projects for{" "}
                  <span className={accent}>Bhutanese students</span>
                </h1>
                <p className={`mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
                  A local bridge between students and founders.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/public" className={heroPrimary}>
                    Explore the platform
                  </Link>
                  <Link href="/how-it-works" className={heroSecondary}>
                    See how it works
                  </Link>
                </div>
              </HeroCopyEntrance>

              <figure className="px-6 pb-10 sm:px-10 sm:pb-14">
                <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#E8E4DB]">
                  <Image
                    src={dzong.src}
                    alt={dzong.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="text-sm font-medium text-[#0B1F1A]">
                    Bhutanese boys in gho, sitting together
                  </span>
                  <PhotoCredit
                    fileUrl={dzong.fileUrl}
                    className="text-[#5A6A61]"
                  />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section aria-labelledby="why-heading" className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <span className={pill}>A practical first step</span>
              <div className="mt-5">
                <h2 id="why-heading" className={sectionHeading}>
                  <ScrubbedTextReveal
                    as="span"
                    text="Young people need work close to home"
                    className="[&_span]:!text-[#0B1F1A]"
                  />
                </h2>
                <p className={`mt-4 text-center text-sm leading-6 sm:text-base ${muted}`}>
                  A practical first step for students and founders.
                </p>
              </div>
              <Reveal className="mx-auto mt-10 max-w-xl border-t border-[#1B4D3E]/12 pt-8 text-center">
                <p className="text-[clamp(4.5rem,10vw,8rem)] font-semibold leading-[0.8] tracking-[-0.09em] text-[#0B1F1A]">
                  {YOUTH_UNEMPLOYMENT.value}
                </p>
                <h3 className="mt-6 text-balance text-2xl font-semibold leading-snug tracking-tight text-[#1B4D3E] sm:text-3xl">
                  {YOUTH_UNEMPLOYMENT.label}
                </h3>
              </Reveal>
            </div>
          </div>
        </section>

        <section aria-labelledby="context-heading" className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <PinnedHeadingSection
                split="lg:grid-cols-[0.3fr_0.7fr]"
                heading={
                  <div className="text-center lg:text-left">
                    <GlobeHemisphereWest
                      aria-hidden="true"
                      weight="light"
                      size={16}
                      strokeWidth={1.5}
                      className="mx-auto text-[#E8A317] lg:mx-0"
                    />
                    <span className={pill}>National context</span>
                    <h2 id="context-heading" className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#0B1F1A] sm:text-4xl lg:text-left">
                      The context{" "}
                      <span className={accent}>behind the work</span>
                    </h2>
                  </div>
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
                        <span className="text-2xl font-semibold text-[#0B1F1A] sm:text-3xl">
                          {fact.value}
                        </span>
                        <span
                          role="heading"
                          aria-level={3}
                          className="text-base font-semibold leading-snug text-[#0B1F1A] sm:text-lg"
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

                <figure className="mt-10">
                  <div className="relative isolate aspect-[4/1] overflow-hidden rounded-[1.25rem] border border-[#1B4D3E]/12 bg-[#E8E4DB]">
                    <Image
                      src="/images/thimphu-market.webp"
                      alt="Open sacks of spices and grain at a market stall in Thimphu"
                      fill
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      className="object-cover object-center"
                    />
                  </div>
                  <figcaption className={`mt-2 text-xs leading-5 ${muted}`}>
                    A market stall in Thimphu.
                  </figcaption>
                </figure>

                <Reveal className="mt-12 grid gap-8 border-t border-[#1B4D3E]/12 pt-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                  <blockquote className="border-l-2 border-[#E8A317] pl-6 text-xl leading-relaxed text-[#0B1F1A] sm:text-2xl">
                    &ldquo;{CONTEXT_QUOTE.text}&rdquo;
                  </blockquote>
                  <p className={`self-end text-sm leading-6 ${muted}`}>
                    {CONTEXT_QUOTE.author}
                  </p>
                </Reveal>

                <Reveal className="mt-10 border-t border-[#1B4D3E]/12 pt-6">
                  <p className={`text-xs leading-5 ${muted}`}>
                    Source:{" "}
                    <a
                      href={WORLD_BANK_SOURCE.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-6 items-center font-semibold text-[#1B4D3E] underline decoration-[#E8A317] decoration-2 underline-offset-4 transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
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
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <details>
                <summary className="mx-auto max-w-[1440px] cursor-pointer rounded-full py-2 text-center text-sm font-semibold text-[#1B4D3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  Official statistics
                </summary>
                <LiveContext initial={liveContext} variant="full" />
              </details>
            </div>
          </div>
        </section>

        <section aria-labelledby="bridge-heading" className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <div className="mx-auto max-w-5xl">
                <div className="text-center">
                  <span className={pill}>A practical local bridge</span>
                </div>
                <InlineImageText
                  id="bridge-heading"
                  before="A practical local"
                  imageSrc="/images/bhutanese-community.jpg"
                  imageAlt="Bhutanese students working together"
                  creditFileUrl={PHOTO_CREDITS.dzong}
                  accessibleLabel="A practical local bridge: Bhutanese students working together"
                  after="bridge"
                  className="mt-5"
                />
                <p className={`mx-auto mt-6 max-w-2xl text-center text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
                  Students and founders meet around paid project work. Not an
                  employer or agent.
                </p>
              </div>
              <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                <Reveal>
                  <div className="grid gap-6 text-sm leading-7 text-[#0B1F1A]/75 sm:text-base sm:leading-8">
                    <p className="max-w-xl">
                      Students apply to projects; founders post briefs and agree
                      terms directly.
                    </p>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[#1B4D3E]/12 pt-6">
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
          </div>
        </section>

        <section className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <LocalBridgeDifferences className="!px-0 !py-0" />
            </div>
          </div>
        </section>

        <section aria-labelledby="verify-heading" className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <span className={pill}>A manual check</span>
              <h2 id="verify-heading" className={`mt-5 ${sectionHeading}`}>
                How we <span className={accent}>verify students</span>
              </h2>
              <p className={`mt-4 text-center text-sm leading-6 sm:text-base ${muted}`}>
                A manual check, never an algorithm.
              </p>
              <div className="mt-10 grid gap-8 border-t border-[#1B4D3E]/12 pt-8 sm:grid-cols-3 sm:gap-10">
                <Reveal delay={0}>
                  <div className="h-full rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6">
                    <h3 className="text-base font-semibold text-[#0B1F1A]">
                      Identity and institution details
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      An admin checks the identity and institution details
                      on the student profile.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.05}>
                  <div className="h-full rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6">
                    <h3 className="text-base font-semibold text-[#0B1F1A]">
                      CV review
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      The admin reads the uploaded CV.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="h-full rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6">
                    <h3 className="text-base font-semibold text-[#0B1F1A]">
                      Rank and verified badge
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      The admin sets the profile rank and applies the
                      verified badge.
                    </p>
                  </div>
                </Reveal>
              </div>
              <Reveal className="mt-8">
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
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <span className={pill}>Places, not members</span>
              <h2 id="photos-heading" className={`mt-5 ${sectionHeading}`}>
                Photographs of{" "}
                <span className={accent}>places, not members</span>
              </h2>
              <div className="mt-10">
                <PhotoFeature
                  image={market}
                  caption="Bhutanese students in kira"
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="sm:aspect-[2]"
                />
              </div>
              <Reveal className="mt-6">
                <p className={`mx-auto max-w-2xl text-center text-xs leading-5 ${muted}`}>
                  The credited Wikimedia Commons photographs are by Doctor 17,
                  Keith Mason and Christopher J. Fynn, under CC BY-SA 4.0 and
                  CC BY-SA 3.0. Each photo credit links to the original file.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className="rounded-3xl border border-[#1B4D3E]/12 bg-[#1B4D3E] px-6 py-14 text-center sm:px-10 sm:py-20">
              <h2 className="text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
                See how it all <span className={accent}>fits together</span>
              </h2>
              <div className="mt-8 flex justify-center">
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
