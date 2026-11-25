import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import {
  MarketingReveal,
  SiteHeader,
} from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  CTA_HREFS,
  CTA_LABELS,
  PHOTO_CREDITS,
  SITE,
} from "@/components/marketing/nav";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { ScrubbedTextReveal } from "@/components/motion/scrubbed-text-reveal";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";
import { getLiveContext } from "@/lib/data/world-bank";

export const metadata = pageMetadata({
  title: "Paid project work for Bhutanese students",
  description:
    "Founders post a clear brief and budget. Students apply with skills and a CV. Admins verify people by hand — not by algorithm.",
  path: "/public",
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** The single filled action: a squared magenta plate with a rule-weight mark. */
const actionClass = `group inline-flex min-h-12 items-center gap-3 rounded-[2px] bg-[#ff0063] px-6 text-[13px] font-semibold tracking-[-0.01em] text-black transition-[transform,background-color] duration-200 hover:bg-[#d40054] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing}`;

/** Quiet peer action: a rule that shortens under the pointer. */
const ruleLinkClass = `group inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 decoration-1 underline-offset-[6px] transition-colors hover:decoration-[#ff0063] ${focusRing}`;

const sectionPad = "px-5 sm:px-8 lg:px-12";
const container = "mx-auto w-full max-w-[1440px]";

function Action({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(actionClass, className)}>
      <span>{children}</span>
      <ArrowUpRight
        size={16}
        weight="bold"
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
      />
    </Link>
  );
}

const steps = [
  {
    number: "01",
    title: "Post or browse",
    body: "Founders post a scoped project with budget and deadline. Students browse free.",
    hint: "Brief → budget → deadline",
  },
  {
    number: "02",
    title: "Apply or shortlist",
    body: "Students apply with profile and CV. Founders can request a ranked shortlist.",
    hint: "Skills → CV → shortlist",
  },
  {
    number: "03",
    title: "Verify and start",
    body: "Admins verify identity and confirm bank or mBoB payment. Then work begins.",
    hint: "Verified → paid → building",
  },
];

const paths = [
  {
    index: "01",
    title: "Students",
    body: "Build a profile, upload a CV, apply to paid projects.",
    cta: CTA_LABELS.signup,
    href: CTA_HREFS.signup,
    src: "/images/bhutanese-students.jpg",
    alt: "Young Bhutanese people in gho and kira working together at computers",
    credit: PHOTO_CREDITS.valley,
  },
  {
    index: "02",
    title: "Founders",
    body: "Post a brief, browse verified students, buy a ranked shortlist when you need one fast.",
    cta: "Ask for founder access",
    href: CTA_HREFS.contact,
    src: "/images/bhutanese-team.jpg",
    alt: "Bhutanese students in kira performing in national dress",
    credit: PHOTO_CREDITS.market,
  },
] as const;

const trust = [
  {
    number: "01",
    title: "Human verification",
    body: "Identity, college and CV reviewed by an admin.",
  },
  {
    number: "02",
    title: "Private CVs",
    body: "Shared only when the rules allow it.",
  },
  {
    number: "03",
    title: "Clear payments",
    body: "Bank transfer or mBoB; an admin confirms the screenshot.",
  },
  {
    number: "04",
    title: "Phone-first",
    body: "Browse, apply and manage on a small screen.",
  },
];

const marqueeFacts = [
  "Neon",
  "Ngultrum",
  "Verified students",
  "Human verification",
  "Bank transfer or mBoB",
  "Built in Bhutan",
] as const;

const localContext =
  "Youth unemployment in Bhutan is high. Growth alone is not creating enough skilled work close to home. Bhutan Tech Connect is a practical matching layer — scoped projects, human verification, payments in Ngultrum.";

const gallery = [
  {
    src: "/images/kira-textile.jpg",
    alt: "A folded Bhutanese woollen textile in natural dyes",
    credit: PHOTO_CREDITS.textile,
    caption: "Textile craft, Thimphu",
    span: "sm:col-span-7",
    ratio: "aspect-[4/3]",
  },
  {
    src: "/images/thimphu-market.webp",
    alt: "A market street in Thimphu, Bhutan",
    credit: PHOTO_CREDITS.market,
    caption: "Market day",
    span: "sm:col-span-5",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/images/bhutanese-community.jpg",
    alt: "Bhutanese boys in traditional gho sitting together",
    credit: PHOTO_CREDITS.dzong,
    caption: "Gho, national dress",
    span: "sm:col-span-5",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/images/punakha-dzong.webp",
    alt: "Punakha Dzong fortress beside a river in Bhutan",
    credit: PHOTO_CREDITS.valley,
    caption: "Punakha Dzong",
    span: "sm:col-span-7",
    ratio: "aspect-[4/3]",
  },
] as const;

function Figure({
  src,
  alt,
  credit,
  caption,
  className,
  ratio = "aspect-[4/3]",
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  credit: string;
  caption?: string;
  className?: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className={className}>
      <div className={cn("plate relative overflow-hidden", ratio)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
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
        <PhotoCredit fileUrl={credit} className="text-[#356464]" />
      </figcaption>
    </figure>
  );
}

export default async function PublicHomePage() {
  const liveContext = await getLiveContext();
  const youth = liveContext.indicators.find(
    (indicator) => indicator.code === "SL.UEM.1524.ZS",
  );

  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        {/* Hero — asymmetric ledger: copy left on paper, one photograph plate
            right that reaches the edge of the grid. No centred wash. */}
        <section className="border-b border-[#0b2e2e]/10">
          <div
            className={cn(
              container,
              sectionPad,
              "grid grid-cols-1 gap-10 pb-12 pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-16",
            )}
          >
            <MarketingReveal className="flex flex-col justify-between lg:col-span-7 lg:pr-6">
              <div>
                <p className="index-label">Bhutan Tech Connect · Thimphu</p>
                <h1 className="display-xl mt-7 max-w-[13ch] text-[#0b2e2e]">
                  Paid project work for{" "}
                  <span className="text-[#0b5c5c]">Bhutanese students.</span>
                </h1>
                <p className="mt-7 max-w-[44ch] text-lg leading-8 text-[#356464]">
                  Founders post a clear brief and budget. Students apply with
                  skills and a CV. Admins verify people by hand — not by
                  algorithm.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
                  <Action href={CTA_HREFS.signup}>{CTA_LABELS.signup}</Action>
                  <Link href={CTA_HREFS.howItWorks} className={ruleLinkClass}>
                    {CTA_LABELS.seeHow}
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <dl className="mt-12 grid grid-cols-1 gap-y-6 border-t border-[#0b2e2e]/12 pt-6 sm:grid-cols-3 sm:gap-x-6">
                {[
                  { term: "Verification", value: "By people" },
                  { term: "Payments", value: "In Ngultrum" },
                  { term: "Built in", value: "Bhutan" },
                ].map((item) => (
                  <div key={item.term} className="sm:border-l sm:border-[#0b2e2e]/12 sm:pl-5 sm:first:border-l-0 sm:first:pl-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#356464]">
                      {item.term}
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-semibold tracking-[-0.01em] text-[#0b2e2e]">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </MarketingReveal>

            <div className="lg:col-span-5">
              <MarketingReveal delay={0.1}>
                <figure>
                  <div className="plate relative aspect-[4/5] overflow-hidden sm:aspect-[5/6] lg:aspect-[4/5] lg:min-h-[540px]">
                    <Image
                      src="/images/thimphu-city.jpg"
                      alt="View across central Thimphu, the capital of Bhutan"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover object-center"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b2e2e]/70 to-transparent"
                    />
                    <p className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b2e2e]">
                      <span aria-hidden="true" className="h-1.5 w-1.5 bg-[#ff0063]" />
                      Thimphu · 27.47° N
                    </p>
                  </div>
                  <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[#0b2e2e]/10 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#356464]">
                      The capital, from above
                    </span>
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.thimphu}
                      className="text-[#356464]"
                    />
                  </figcaption>
                </figure>
              </MarketingReveal>
            </div>
          </div>
        </section>

        {/* Running rule — real platform facts, paused under reduced motion. */}
        <section
          aria-label="Platform facts"
          className="overflow-hidden border-b border-[#0b2e2e]/10 bg-[#66bfbf] py-5"
        >
          <p className="sr-only">Platform facts: {marqueeFacts.join(", ")}.</p>
          <div aria-hidden="true" className="overflow-hidden">
            <div className="btc-marquee flex w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center gap-10 pr-10">
                  {marqueeFacts.map((fact) => (
                    <span
                      key={`${fact}-${copy}`}
                      className="flex items-center gap-10 whitespace-nowrap text-[clamp(1.15rem,2.4vw,2rem)] font-semibold uppercase tracking-[-0.02em] text-[#0b2e2e]"
                    >
                      {fact}
                      <span aria-hidden="true" className="text-[#ff0063]">
                        /
                      </span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two sides — one split ledger, no cards, no double bezels. */}
        <section
          aria-labelledby="audience-heading"
          className={cn(container, sectionPad, "py-20 md:py-28")}
        >
          <MarketingReveal className="grid grid-cols-1 gap-6 border-t border-[#0b2e2e]/12 pt-6 lg:grid-cols-12">
            <p className="index-label lg:col-span-3">Who it is for</p>
            <h2
              id="audience-heading"
              className="display-lg lg:col-span-6 lg:col-start-4"
            >
              Built for both sides of the table
            </h2>
            <p className="max-w-[34ch] text-[15px] leading-7 text-[#356464] lg:col-span-3">
              A student needs paid work that fits a term. A founder needs a
              scoped brief done, verified, and paid in Ngultrum.
            </p>
          </MarketingReveal>

          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-0">
            {paths.map((path, index) => (
              <MarketingReveal
                key={path.title}
                delay={index * 0.08}
                className={cn(
                  "flex flex-col",
                  index === 1 &&
                    "lg:border-l lg:border-[#0b2e2e]/12 lg:pl-12",
                  index === 0 && "lg:pr-12",
                )}
              >
                <div className="flex items-baseline justify-between border-t border-[#0b2e2e]/12 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c2004b]">
                    {path.index}
                  </p>
                  <h3 className="text-[1.65rem] font-semibold tracking-[-0.035em] text-[#0b2e2e]">
                    {path.title}
                  </h3>
                </div>
                <Figure
                  src={path.src}
                  alt={path.alt}
                  credit={path.credit}
                  ratio="aspect-[5/4]"
                  className="mt-6"
                  sizes="(max-width: 1024px) 100vw, 46vw"
                />
                <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#356464]">
                  {path.body}
                </p>
                <Link
                  href={path.href}
                  className={cn(ruleLinkClass, "mt-6 self-start")}
                >
                  {path.cta}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </MarketingReveal>
            ))}
          </div>
        </section>

        {/* How it works — a three-row ledger. Numbers in magenta, hints on the
            right, hairlines between every row. */}
        <section
          aria-labelledby="steps-heading"
          className="border-y border-[#0b2e2e]/10 bg-[#eaf6f6]"
        >
          <div className={cn(container, sectionPad, "py-20 md:py-28")}>
            <MarketingReveal className="grid grid-cols-1 gap-6 border-t border-[#0b2e2e]/12 pt-6 lg:grid-cols-12">
              <p className="index-label lg:col-span-3">From brief to paid</p>
              <h2
                id="steps-heading"
                className="display-lg lg:col-span-6 lg:col-start-4"
              >
                From brief to paid work
              </h2>
              <p className="max-w-[30ch] text-[15px] leading-7 text-[#356464] lg:col-span-3">
                Three steps. No bidding war, no unverified profiles.
              </p>
            </MarketingReveal>

            <ol className="mt-12 border-t border-[#0b2e2e]/15">
              {steps.map((step) => (
                <li
                  key={step.number}
                  className="grid grid-cols-1 gap-3 border-b border-[#0b2e2e]/15 py-7 sm:grid-cols-12 sm:gap-6 sm:py-8"
                >
                  <p className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[#c2004b] sm:col-span-1">
                    {step.number}
                  </p>
                  <h3 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.03em] text-[#0b2e2e] sm:col-span-4">
                    {step.title}
                  </h3>
                  <p className="max-w-[46ch] text-[15px] leading-7 text-[#356464] sm:col-span-5">
                    {step.body}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#356464] sm:col-span-2 sm:text-right">
                    {step.hint}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Local context — deep teal, one statement, one national figure. */}
        <section className="bg-[#0b2e2e] text-[#eaf6f6]">
          <div
            className={cn(
              container,
              sectionPad,
              "grid grid-cols-1 gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-10",
            )}
          >
            <div className="lg:col-span-5">
              <p className="index-label text-[#66bfbf]">Local context</p>
              <h2 className="display-lg mt-6 max-w-[12ch] text-white">
                A local bridge for young people
              </h2>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 border-t border-white/20 pt-6">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#66bfbf]">
                    Youth unemployment · Bhutan
                  </dt>
                  <dd className="mt-2 text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-none tracking-[-0.05em] text-white">
                    {youth?.displayValue ?? "—"}
                  </dd>
                  <dd className="mt-2 text-xs leading-5 text-[#eaf6f6]/70">
                    {youth
                      ? `${youth.year} · ${youth.seriesNote}`
                      : "Source unavailable"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#66bfbf]">
                    Payments
                  </dt>
                  <dd className="mt-2 text-[clamp(1.6rem,2.6vw,2rem)] font-semibold leading-none tracking-[-0.04em] text-white">
                    In Nu
                  </dd>
                  <dd className="mt-2 text-xs leading-5 text-[#eaf6f6]/70">
                    Bank transfer or mBoB
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-xs leading-5 text-[#eaf6f6]/60">
                National indicator from the World Bank API, World Development
                Indicators. This is context, not a platform result.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <ScrubbedTextReveal
                as="p"
                text={localContext}
                className="max-w-[38ch] text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-[1.45] tracking-[-0.015em] text-[#eaf6f6]"
              />
              <div className="mt-12 grid grid-cols-2 gap-4">
                <figure>
                  <div className="plate relative aspect-[4/5] overflow-hidden bg-[#0b5c5c]">
                    <Image
                      src="/images/prayer-flags.jpg"
                      alt="Prayer flags strung across a hillside in Sopsokha, Bhutan"
                      fill
                      sizes="(max-width: 1024px) 45vw, 24vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2.5 border-t border-white/20 pt-2">
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.flags}
                      className="text-[#eaf6f6]/70"
                    />
                  </figcaption>
                </figure>
                <figure className="mt-8">
                  <div className="plate relative aspect-[4/5] overflow-hidden bg-[#0b5c5c]">
                    <Image
                      src="/images/bhutan-archery.jpg"
                      alt="Students practice archery on a field in Bhutan"
                      fill
                      sizes="(max-width: 1024px) 45vw, 24vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2.5 border-t border-white/20 pt-2">
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.archery}
                      className="text-[#eaf6f6]/70"
                    />
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery — four plates in an asymmetric mosaic, each with a real
            caption and a real credit. */}
        <section
          aria-labelledby="place-heading"
          className={cn(container, sectionPad, "py-20 md:py-28")}
        >
          <MarketingReveal className="grid grid-cols-1 gap-6 border-t border-[#0b2e2e]/12 pt-6 lg:grid-cols-12">
            <p className="index-label lg:col-span-3">The place</p>
            <h2
              id="place-heading"
              className="display-lg lg:col-span-6 lg:col-start-4"
            >
              The work happens here
            </h2>
            <p className="max-w-[30ch] text-[15px] leading-7 text-[#356464] lg:col-span-3">
              Bhutanese classrooms, workshops and market streets. The talent is
              already local.
            </p>
          </MarketingReveal>

          <div className="mt-12 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-12">
            {gallery.map((item, index) => (
              <MarketingReveal
                key={item.src}
                delay={index * 0.05}
                className={cn("col-span-1", item.span)}
              >
                <Figure
                  src={item.src}
                  alt={item.alt}
                  credit={item.credit}
                  caption={item.caption}
                  ratio={item.ratio}
                  sizes="(max-width: 640px) 100vw, 55vw"
                />
              </MarketingReveal>
            ))}
          </div>
        </section>

        {/* Verified facts — a four-column ledger, no carousel. */}
        <section
          aria-labelledby="trust-heading"
          className="border-t border-[#0b2e2e]/12 bg-[#eaf6f6]"
        >
          <div className={cn(container, sectionPad, "py-20 md:py-28")}>
            <MarketingReveal className="grid grid-cols-1 gap-6 border-t border-[#0b2e2e]/12 pt-6 lg:grid-cols-12">
              <p className="index-label lg:col-span-3">Checked by people</p>
              <h2
                id="trust-heading"
                className="display-lg lg:col-span-6 lg:col-start-4"
              >
                What is verified, every time
              </h2>
              <p className="max-w-[30ch] text-[15px] leading-7 text-[#356464] lg:col-span-3">
                No algorithmic approval. An admin reads the profile, the college
                and the CV.
              </p>
            </MarketingReveal>

            <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-0 border-t border-[#0b2e2e]/15 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((item) => (
                <li
                  key={item.number}
                  className="border-b border-[#0b2e2e]/15 py-7 sm:border-b-0 sm:py-8"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[#c2004b]">
                      {item.number}
                    </span>
                    <span aria-hidden="true" className="h-px flex-1 bg-[#0b2e2e]/15" />
                  </div>
                  <h3 className="mt-4 text-[1.15rem] font-semibold tracking-[-0.025em] text-[#0b2e2e]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-[28ch] text-sm leading-6 text-[#356464]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing band — one action, one sentence, full teal. */}
        <section className="bg-[#66bfbf] text-[#0b2e2e]">
          <div
            className={cn(
              container,
              sectionPad,
              "grid grid-cols-1 items-end gap-10 py-20 md:py-28 lg:grid-cols-12",
            )}
          >
            <MarketingReveal className="lg:col-span-8">
              <p className="index-label text-[#0b2e2e]">
                {CTA_LABELS.closingEyebrow}
              </p>
              <h2 className="display-xl mt-6 max-w-[16ch]">
                Start with one paid project.
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                {SITE.tagline}
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href={CTA_HREFS.signup}>{CTA_LABELS.signup}</Action>
              <Link
                href={CTA_HREFS.contact}
                className={cn(
                  ruleLinkClass,
                  "decoration-[#0b2e2e]/30 hover:decoration-[#0b2e2e]",
                )}
              >
                Ask for founder access
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
            </MarketingReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
