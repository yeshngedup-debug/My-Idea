import Image from "next/image";
import Link from "next/link";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { ScaleFadeImage } from "@/components/editorial/scale-fade-image";
import { Reveal } from "@/components/ui/motion";
import { LiveContext } from "@/components/data/live-context";
import { LocalBridgeDifferences } from "@/components/brand/local-bridge-differences";
import { getLiveContext } from "@/lib/data/world-bank";
import { pageMetadata } from "@/lib/metadata";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CtaBand } from "@/components/marketing/cta-band";
import { ShortlistPreviewCompact } from "@/components/marketing/product-preview/shortlist-preview";
import { CTA_HREFS, CTA_LABELS, PHOTO_CREDITS } from "@/components/marketing/nav";
import {
  CONTEXT_FACTS,
  LIVE_DATA_SOURCE,
  WORLD_BANK_SOURCE,
  YOUTH_UNEMPLOYMENT,
} from "@/data/landing";

export const metadata = pageMetadata({
  title: "Paid project work in Bhutan",
  description:
    "Bhutan Tech Connect connects Bhutanese students and startup founders through focused, paid project work.",
  path: "/public",
});

const sourceLinkClass =
  "font-semibold text-[#b23c26] underline decoration-[#d84f37]/30 underline-offset-4 transition hover:decoration-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]";

export default async function HomePage() {
  const liveContext = await getLiveContext();
  const youth = liveContext.indicators.find(
    (item) => item.code === "SL.UEM.1524.ZS",
  );

  return (
    <main
      id="main-content"
      className="overflow-x-clip w-full max-w-full bg-[#f5f2ea] text-[#18251f]"
    >
      <SiteHeader />

      {/* ATTENTION — cinematic center: full-bleed photograph, one neutral
          radial wash for the copy, a two-line headline and two clear actions. */}
      <section
        id="home"
        aria-labelledby="home-heading"
        className="relative isolate min-h-[88vh] overflow-hidden bg-[#0d1813] px-5 pb-20 pt-24 sm:px-8 sm:pb-24 sm:pt-28 lg:px-12"
      >
        <figure className="absolute inset-0 m-0">
          <Image
            src="/images/bhutanese-students.jpg"
            alt="Young Bhutanese people in gho and kira working together at computers"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_38%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 72% 62% at 50% 42%, rgba(13,24,19,0.93) 0%, rgba(13,24,19,0.74) 48%, rgba(13,24,19,0) 100%)",
            }}
          />
        </figure>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center text-center">
          <h1
            id="home-heading"
            className="max-w-6xl text-balance text-[clamp(1.75rem,7vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[#f5f2ea] sm:text-[clamp(3rem,5vw,5.5rem)] sm:leading-[0.98] sm:tracking-[-0.045em]"
          >
            Students find paid projects. Founders post the brief.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#f5f2ea]/85 sm:mt-7 sm:text-lg sm:leading-8">
            Local students and founders, connected through focused, paid
            project work.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={CTA_HREFS.signup}
              className="pressable inline-flex min-h-12 items-center justify-center rounded-lg bg-[#fbbf24] px-7 py-3 text-sm font-medium text-[#17352b] hover:bg-[#fcd34d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1813]"
            >
              {CTA_LABELS.signup}
            </Link>
            <Link
              href={CTA_HREFS.howItWorks}
              className="pressable inline-flex min-h-12 items-center justify-center rounded-lg border border-[#f5f2ea]/70 px-6 py-3 text-sm font-semibold text-[#f5f2ea] hover:bg-[#f5f2ea] hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1813]"
            >
              {CTA_LABELS.seeHow}
            </Link>
          </div>

          <p className="mt-8 text-[11px] leading-4 text-[#f5f2ea]/75">
            <PhotoCredit fileUrl={PHOTO_CREDITS.valley} />
          </p>
        </div>
      </section>

      {/* INTEREST — gapless bento: one headline, one sentence, four cells */}
      <section
        id="how-it-works"
        aria-labelledby="journey-heading"
        className="px-5 py-20 sm:px-8 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-[1440px]">
          <Reveal className="mb-12 max-w-3xl">
            <h2
              id="journey-heading"
              className="text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#17352b] sm:text-6xl"
            >
              From a brief to work you can show
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Keep the first collaboration focused, useful, and clear for
              everyone involved.
            </p>
          </Reveal>

          <div className="grid grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
            {/* Large photograph: 2 x 2 = 4 units */}
            <ScaleFadeImage className="min-h-[300px] sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-[540px]">
              <figure className="relative isolate h-full min-h-[300px] overflow-hidden rounded-[1.75rem] bg-[#17352b] lg:min-h-[540px]">
                <Image
                  src="/images/bhutanese-community.jpg"
                  alt="Bhutanese boys in traditional gho sitting together"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-[50%_45%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#101d17]/80 via-transparent to-transparent"
                />
                <figcaption className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7">
                  <PhotoCredit
                    fileUrl={PHOTO_CREDITS.dzong}
                    className="text-white/75"
                  />
                </figcaption>
              </figure>
            </ScaleFadeImage>

            {/* One sentence: 2 x 1 = 2 units */}
            <article className="flex min-h-[240px] items-end rounded-[1.75rem] bg-[#fffefa] p-6 sm:col-span-2 lg:col-span-2 lg:p-8">
              <p className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-[#17352b] sm:text-3xl">
                Founders set a clear brief and budget, students apply with the
                right skills, and both sides learn by doing.
              </p>
            </article>

            {/* Verified figure: 1 x 1 = 1 unit */}
            <article className="flex min-h-[240px] flex-col justify-between rounded-[1.75rem] bg-[#17352b] p-6 text-white lg:col-span-1 lg:p-7">
              <p className="text-[clamp(3.5rem,6vw,5rem)] font-semibold leading-[0.82] tracking-[-0.08em] text-[#fbbf24]">
                {YOUTH_UNEMPLOYMENT.value}
              </p>
              <div>
                <h3 className="text-base font-semibold leading-snug">
                  {YOUTH_UNEMPLOYMENT.label}
                </h3>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  World Bank, April 2026. A national indicator, not a platform
                  result.
                </p>
                <a
                  href={WORLD_BANK_SOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-xs font-semibold text-amber-300 underline decoration-white/35 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
                >
                  World Bank update
                </a>
              </div>
            </article>

            {/* One sentence + CTA: 1 x 1 = 1 unit. Light surface keeps amber
                the only filled accent on this screen. */}
            <article className="flex min-h-[240px] flex-col justify-between rounded-[1.75rem] border border-[#18251f]/10 bg-[#fffefa] p-6 text-[#17352b] lg:col-span-1 lg:p-7">
              <p className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                Students build a profile and apply; founders set the scope.
              </p>
              <div className="mt-6">
                <p className="text-xs leading-5 text-[#5e554a]">
                  Founder access is assigned by an admin.
                </p>
                <Link
                  href={CTA_HREFS.signup}
                  className="mt-4 inline-flex items-center rounded-sm text-sm font-medium text-[#17352b] underline decoration-[#18251f]/30 underline-offset-4 hover:decoration-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]"
                >
                  {CTA_LABELS.signup}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* INTEREST — verified figures, oversized and unadorned */}
      <section
        id="bhutan"
        aria-labelledby="bhutan-heading"
        className="bg-[#17352b] px-5 py-20 text-white sm:px-8 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <h2
              id="bhutan-heading"
              className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl"
            >
              The national context for young people
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              The World Bank&apos;s April 2026 update projects continued growth
              but warns that job creation is not keeping pace, particularly for
              young people.
            </p>
          </Reveal>

          <Reveal className="mt-16 border-t border-white/15 pt-10">
            <dl className="max-w-4xl">
              {CONTEXT_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-2 border-b border-white/15 py-6 sm:grid-cols-[8rem_12rem_1fr] sm:items-baseline sm:gap-8"
                >
                  <dt className="text-2xl font-semibold text-[#e7b648] sm:text-3xl">
                    {fact.value}
                  </dt>
                  <dd className="text-sm leading-6 text-white sm:text-base">
                    {fact.label}
                  </dd>
                  <p className="text-xs leading-5 text-white/70">{fact.note}</p>
                </div>
              ))}
            </dl>
            <p className="mt-12 text-xs leading-5 text-white/60">
              Source:{" "}
              <a
                href={WORLD_BANK_SOURCE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-300 underline decoration-white/35 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]"
              >
                {WORLD_BANK_SOURCE.label}
              </a>
              . National indicators, not platform results.
            </p>
          </Reveal>
        </div>
      </section>

      {/* INTEREST — live statistics panel, the two-numbers note, source links */}
      <details className="bg-[#fffefa] px-5 sm:px-8 lg:px-12">
        <summary className="mx-auto max-w-[1440px] cursor-pointer py-5 text-sm font-semibold text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]">
          Official statistics
        </summary>
        <LiveContext initial={liveContext} variant="compact" />
      </details>
      <section aria-labelledby="why-two-numbers" className="bg-[#fffefa] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <h2
            id="why-two-numbers"
            className="text-lg font-semibold tracking-normal text-[#17352b]"
          >
            Why two numbers?
          </h2>
          <p className="mt-2 max-w-4xl text-xs leading-5 text-[#18251f]/65">
            {youth ? (
              <>
                The press release reports {YOUTH_UNEMPLOYMENT.value} while the
                API series is a modeled ILO estimate of {youth.displayValue} for{" "}
                {youth.year}
                {youth.relatedObservation
                  ? `, and ${youth.relatedObservation.displayValue} for ${youth.relatedObservation.year}`
                  : ""}{". "}
                These are different series, and the reason for the difference
                is not established here.{" "}
                <a
                  href={WORLD_BANK_SOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sourceLinkClass}
                >
                  Press release
                </a>{" "}
                ·{" "}
                <a
                  href={youth.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sourceLinkClass}
                >
                  API series
                </a>
              </>
            ) : (
              <>
                The press release reports {YOUTH_UNEMPLOYMENT.value}. The reason
                for the difference from the API series is not established here.{" "}
                <a
                  href={WORLD_BANK_SOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sourceLinkClass}
                >
                  Press release
                </a>
              </>
            )}{" "}
            ·{" "}
            <a
              href={LIVE_DATA_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className={sourceLinkClass}
            >
              {LIVE_DATA_SOURCE.label}
            </a>
          </p>
        </div>
      </section>

      {/* BRAND — the quiet differentiator chapter, echoed from /about */}
      <LocalBridgeDifferences compact />

      {/* PRODUCT — one real shortlist row, labelled as a sample */}
      <ShortlistPreviewCompact />

      {/* ACTION — high-contrast closing CTA + clean footer */}
      <CtaBand
        eyebrow=""
        title="Start with one paid project"
        primaryCta={{ href: CTA_HREFS.signup, label: CTA_LABELS.signup }}
      />

      <SiteFooter />
    </main>
  );
}
