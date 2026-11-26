import type { Metadata } from "next";
import Image from "next/image";
import { MarketingReveal, SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { EditorialHero } from "@/components/marketing/editorial-hero";
import {
  Action,
  Band,
  Figure,
  RuleLink,
  SectionHead,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { InlineImageText } from "@/components/editorial";
import { GsapScaleFadeImage } from "@/components/marketing/editorial-page-motion";
import { LiveContext } from "@/components/data/live-context";
import { AnimatedDisclosureList } from "@/components/interactive/animated-disclosure-list";
import {
  LOCAL_BRIDGE_DIFFERENCES,
  LOCAL_BRIDGE_HEADLINE,
} from "@/components/brand/local-bridge-differences";
import {
  CTA_HREFS,
  CTA_LABELS,
  resolveAction,
} from "@/components/marketing/nav";
import { getLiveContext } from "@/lib/data/world-bank";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
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

const exploreCta = resolveAction("/about", "explore");
const seeHowCta = resolveAction("/about", "seeHow");
const faqCta = resolveAction("/about", "faq");
const processCta = resolveAction("/about", "readProcess");

const verification = [
  {
    title: "Identity and institution details",
    body: "An admin checks the identity and institution details on the student profile.",
  },
  {
    title: "CV review",
    body: "The admin reads the uploaded CV.",
  },
  {
    title: "Rank and verified badge",
    body: "The admin sets the profile rank and applies the verified badge.",
  },
] as const;

export default async function AboutPage() {
  const liveContext = await getLiveContext();

  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        <EditorialHero
          index="01"
          eyebrow="Why this exists"
          title={
            <>
              Paid projects for{" "}
              <span className="text-[#0b5c5c]">Bhutanese students.</span>
            </>
          }
          lead="A local bridge between students and founders: paid project work, written down, checked by people."
          intent="explore"
          secondary={seeHowCta}
          image={{
            src: "/images/bhutanese-students.jpg",
            alt: "Two young Bhutanese women tending a water supply",
          }}
          imagePosition="object-center"
        />

        {/* National context. The one figure on the page, labelled as national. */}
        <Band
          tone="mist"
          labelledBy="why-heading"
          className="border-b border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="02"
                eyebrow="National context"
                id="why-heading"
                title="Young people need work close to home"
                lead="A practical first step for students and founders, set against the national picture."
              />
            </MarketingReveal>

            <MarketingReveal className="mt-12">
              <div className="grid grid-cols-1 items-baseline gap-x-10 gap-y-6 border-t border-[#0b2e2e]/15 pt-8 lg:grid-cols-12">
                <p className="text-[clamp(4rem,9vw,7.5rem)] font-semibold leading-[0.82] tracking-[-0.06em] text-[#0b2e2e] lg:col-span-5">
                  {YOUTH_UNEMPLOYMENT.value}
                </p>
                <h3 className="max-w-[22ch] text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] text-[#0b5c5c] lg:col-span-4">
                  {YOUTH_UNEMPLOYMENT.label}
                </h3>
                <p className="max-w-[34ch] text-sm leading-6 text-[#356464] lg:col-span-3">
                  {YOUTH_UNEMPLOYMENT.note} National figures, not platform
                  results.
                </p>
              </div>
            </MarketingReveal>
          </div>
        </Band>

        {/* The context behind the work: facts as disclosures, one quote, one plate. */}
        <Band labelledBy="context-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="03"
                eyebrow="The context"
                id="context-heading"
                title={
                  <>
                    The context behind{" "}
                    <span className="text-[#0b5c5c]">the work</span>
                  </>
                }
                lead="Three national indicators. Open any row to read the note behind the figure."
              />
            </MarketingReveal>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-7">
                <AnimatedDisclosureList
                  label="National context indicators"
                  defaultValue={CONTEXT_FACTS[0].id}
                  className="max-w-3xl"
                  items={CONTEXT_FACTS.map((fact) => ({
                    id: fact.id,
                    trigger: (
                      <span className="grid gap-2 py-1 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-8">
                        <span className="text-[1.75rem] font-semibold tabular-nums tracking-[-0.04em] text-[#0b2e2e] sm:text-[2rem]">
                          {fact.value}
                        </span>
                        <span className="text-base font-semibold leading-snug text-[#0b2e2e]">
                          {fact.label}
                        </span>
                      </span>
                    ),
                    children: (
                      <p className="text-sm leading-6 text-[#356464]">
                        {fact.note}
                      </p>
                    ),
                  }))}
                />
                <p className="mt-6 border-t border-[#0b2e2e]/12 pt-4 text-xs leading-5 text-[#356464]">
                  Source:{" "}
                  <a
                    href={WORLD_BANK_SOURCE.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 underline-offset-4 transition-colors hover:decoration-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {WORLD_BANK_SOURCE.label}
                  </a>
                  . National figures, not platform results.
                </p>
              </MarketingReveal>

              <MarketingReveal
                delay={0.08}
                className="flex flex-col justify-between lg:col-span-5 lg:border-l lg:border-[#0b2e2e]/12 lg:pl-10"
              >
                <blockquote className="border-l-2 border-[#ff0063] pl-6 text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-[#0b2e2e]">
                  &ldquo;{CONTEXT_QUOTE.text}&rdquo;
                </blockquote>
                <p className="mt-6 text-sm leading-6 text-[#356464]">
                  {CONTEXT_QUOTE.author}
                </p>
              </MarketingReveal>
            </div>

            <MarketingReveal className="mt-12">
              <GsapScaleFadeImage>
                <figure>
                  <div className="plate relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
                    <Image
                      src="/images/thimphu-city.jpg"
                      alt="Handicraft shops along Norzin Lam road in Thimphu"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover object-center"
                    />
                  </div>
                </figure>
              </GsapScaleFadeImage>
            </MarketingReveal>
          </div>
        </Band>

        {/* Official statistics, folded away until asked for. */}
        <Band
          tone="mist"
          className="border-y border-[#0b2e2e]/10"
          label="Official statistics"
        >
          <div className={cn(container, gutters, "py-14 md:py-16")}>
            <details className="border-t border-[#0b2e2e]/15 pt-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]">
                <span aria-hidden="true" className="h-px w-8 bg-[#ff0063]" />
                Official statistics · World Bank API
              </summary>
              <div className="mt-6">
                <LiveContext initial={liveContext} variant="full" />
              </div>
            </details>
          </div>
        </Band>

        {/* The bridge: inline typography image, one plate, a ruled list. */}
        <Band labelledBy="bridge-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <InlineImageText
                as="h2"
                id="bridge-heading"
                before="A practical local"
                imageSrc="/images/thimphu-street.jpg"
                imageAlt="A main road in Thimphu"
                accessibleLabel="A practical local bridge: a main road in Thimphu"
                after="bridge"
              />
            </MarketingReveal>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-5">
                <p className="max-w-[36ch] text-[15px] leading-7 text-[#356464]">
                  Students and founders meet around paid project work. Not an
                  employer or agent: the platform holds the brief, the
                  applications and the shortlist.
                </p>
                <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-[#0b2e2e]/12 pt-6">
                  <RuleLink href={seeHowCta.href}>{seeHowCta.label}</RuleLink>
                  <RuleLink href={faqCta.href}>{faqCta.label}</RuleLink>
                </div>
              </MarketingReveal>
              <MarketingReveal delay={0.08} className="lg:col-span-7">
                <Figure
                  src="/images/bhutanese-students.jpg"
                  alt="Two young Bhutanese women tending a water supply"
                  ratio="aspect-[16/10]"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </MarketingReveal>
            </div>

            <MarketingReveal className="mt-14">
              <div className="grid grid-cols-1 gap-6 border-t border-[#0b2e2e]/15 pt-6 lg:grid-cols-12">
                <h3 className="display-lg max-w-[14ch] text-[#0b2e2e] lg:col-span-4">
                  {LOCAL_BRIDGE_HEADLINE}
                </h3>
                <dl className="grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:col-span-8">
                  {LOCAL_BRIDGE_DIFFERENCES.map((item, index) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[2rem_1fr] gap-3 border-b border-[#0b2e2e]/12 py-5"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[11px] font-semibold tabular-nums tracking-[0.16em] text-[#c2004b]"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#356464]">
                          {item.label}
                        </dt>
                        <dd className="mt-1.5 max-w-[38ch] text-sm leading-6 text-[#0b2e2e]">
                          {item.sentence}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </MarketingReveal>
          </div>
        </Band>

        {/* Verification: three ruled steps, no algorithm. */}
        <Band
          tone="mist"
          labelledBy="verify-heading"
          className="border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="04"
                eyebrow="Verification"
                id="verify-heading"
                title={
                  <>
                    How we{" "}
                    <span className="text-[#0b5c5c]">verify students</span>
                  </>
                }
                lead="A manual check, never an algorithm."
              />
            </MarketingReveal>

            <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-[#0b2e2e]/15 sm:grid-cols-3">
              {verification.map((item, index) => (
                <li
                  key={item.title}
                  className="border-b border-[#0b2e2e]/15 py-6 sm:border-b-0 sm:py-7"
                >
                  <MarketingReveal delay={index * 0.06}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[#c2004b]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-[#0b2e2e]/15"
                      />
                    </div>
                    <h3 className="mt-4 text-[1.15rem] font-semibold leading-snug tracking-[-0.025em] text-[#0b2e2e]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-[32ch] text-sm leading-6 text-[#356464]">
                      {item.body}
                    </p>
                  </MarketingReveal>
                </li>
              ))}
            </ul>

            <p className="mt-10 border-t border-[#0b2e2e]/12 pt-4 text-xs leading-5 text-[#356464]">
              Questions?{" "}
              <a
                href={CTA_HREFS.contact}
                className="font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 underline-offset-4 transition-colors hover:decoration-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
              >
                {CTA_LABELS.contactUs}
              </a>
              .
            </p>
          </div>
        </Band>

        {/* Photographs of Bhutan, not members. */}
        <Band labelledBy="photos-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="05"
                eyebrow="Photographs"
                id="photos-heading"
                title={
                  <>
                    Photographs of{" "}
                    <span className="text-[#0b5c5c]">Bhutan, not members</span>
                  </>
                }
                lead="Every photograph on this site shows Bhutanese people and places. None are platform listings or members."
              />
            </MarketingReveal>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  src: "/images/thimphu-hills.jpg",
                  alt: "Thimphu's main road with the valley hills behind",
                },
                {
                  src: "/images/thimphu-bank.jpg",
                  alt: "The Bhutan Post and Bhutan Bank building in central Thimphu",
                },
                {
                  src: "/images/thimphu-housing.jpg",
                  alt: "Public housing in Thimphu",
                },
              ].map((photo, index) => (
                <MarketingReveal key={photo.src} delay={index * 0.06}>
                  <Figure
                    src={photo.src}
                    alt={photo.alt}
                    ratio="aspect-[4/3]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </MarketingReveal>
              ))}
            </div>
          </div>
        </Band>

        {/* Closing band. */}
        <Band tone="teal">
          <div
            className={cn(
              container,
              gutters,
              "grid grid-cols-1 items-end gap-10 py-16 md:py-24 lg:grid-cols-12",
            )}
          >
            <MarketingReveal className="lg:col-span-8">
              <p className="index-label text-[#0b2e2e]">Next step</p>
              <h2 className="display-xl mt-6 max-w-[15ch]">
                See how it all fits together.
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                Read the public platform, then the process behind it.
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href={exploreCta.href}>{exploreCta.label}</Action>
              <RuleLink
                href={processCta.href}
                className="decoration-[#0b2e2e]/30 hover:decoration-[#0b2e2e]"
              >
                {processCta.label}
              </RuleLink>
            </MarketingReveal>
          </div>
        </Band>
      </main>

      <SiteFooter />
    </div>
  );
}
