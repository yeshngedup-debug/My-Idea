import Image from "next/image";
import Link from "next/link";
import {
  FactCarousel,
  SiteHeader,
  type FactPortrait,
  type FactSlide,
} from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  CTA_HREFS,
  CTA_LABELS,
  PHOTO_CREDITS,
  SITE,
} from "@/components/marketing/nav";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { PinnedScrollChapter } from "@/components/motion/pinned-scroll-chapter";
import { ScrubbedTextReveal } from "@/components/motion/scrubbed-text-reveal";
import { pageMetadata } from "@/lib/metadata";
import { getLiveContext } from "@/lib/data/world-bank";

export const metadata = pageMetadata({
  title: "Paid project work for Bhutanese students",
  description:
    "Founders post a clear brief and budget. Students apply with skills and a CV. Admins verify people by hand — not by algorithm.",
  path: "/public",
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F1A] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const primaryCta =
  `inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#d9950f] motion-reduce:transition-none ${focusRing}`;

const secondaryCta =
  `inline-flex min-h-11 items-center justify-center rounded-full border border-[#1B4D3E]/30 px-6 py-3 text-sm font-semibold text-[#1B4D3E] transition-colors duration-150 hover:bg-[#E8E4DB]/70 motion-reduce:transition-none ${focusRing}`;

const sectionHeading =
  "w-full max-w-6xl text-balance text-[clamp(2.5rem,4vw,4rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[#0B1F1A]";

const bentoCard =
  "group relative flex flex-col overflow-hidden rounded-[24px] border border-[#1B4D3E]/10 bg-white p-7 sm:p-9";

const hoverZoom =
  "object-cover grayscale contrast-125 opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";

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
    title: "Students",
    body: "Build a profile, upload a CV, apply to paid projects.",
    cta: CTA_LABELS.signup,
    href: CTA_HREFS.signup,
    portrait: {
      src: "/images/bhutanese-students.jpg",
      alt: "Young Bhutanese people in gho and kira working together at computers",
      creditFileUrl: PHOTO_CREDITS.valley,
    },
  },
  {
    title: "Founders",
    body: "Post a brief, browse verified students, buy a ranked shortlist when you need one fast.",
    cta: "Ask for founder access",
    href: CTA_HREFS.contact,
    portrait: {
      src: "/images/bhutanese-team.jpg",
      alt: "Bhutanese students in kira performing in national dress",
      creditFileUrl: PHOTO_CREDITS.market,
    },
  },
] as const satisfies ReadonlyArray<{
  title: string;
  body: string;
  cta: string;
  href: string;
  portrait: FactPortrait;
}>;

const trust = [
  {
    title: "Human verification",
    body: "Identity, college and CV reviewed by an admin.",
  },
  {
    title: "Private CVs",
    body: "Shared only when the rules allow it.",
  },
  {
    title: "Clear payments",
    body: "Bank transfer or mBoB; an admin confirms the screenshot.",
  },
  {
    title: "Phone-first",
    body: "Browse, apply and manage on a small screen.",
  },
];

const portraits = [
  {
    src: "/images/bhutanese-students.jpg",
    alt: "Young Bhutanese people in gho and kira working together at computers",
    creditFileUrl: PHOTO_CREDITS.valley,
  },
  {
    src: "/images/bhutanese-community.jpg",
    alt: "Bhutanese boys in traditional gho sitting together",
    creditFileUrl: PHOTO_CREDITS.dzong,
  },
  {
    src: "/images/bhutanese-team.jpg",
    alt: "Bhutanese students in kira performing in national dress",
    creditFileUrl: PHOTO_CREDITS.market,
  },
] as const satisfies readonly FactPortrait[];

/** Verified product facts only. No names, quotes or invented metrics. */
const factSlides: readonly FactSlide[] = trust.map((item, index) => ({
  title: item.title,
  body: item.body,
  portraits: [
    portraits[index % portraits.length],
    portraits[(index + 1) % portraits.length],
  ],
}));

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

function GalleryFigure({ portrait }: { portrait: FactPortrait }) {
  return (
    <figure className="group relative isolate aspect-[4/5] overflow-hidden rounded-[20px] bg-[#17352b]">
      <Image
        src={portrait.src}
        alt={portrait.alt}
        fill
        sizes="(max-width: 640px) 100vw, 40vw"
        className={hoverZoom}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 8%, transparent 35%, rgb(11 31 26 / 0.65) 100%)",
        }}
      />
      <figcaption className="absolute inset-x-0 bottom-0 p-4">
        <PhotoCredit fileUrl={portrait.creditFileUrl} className="text-[#F7F4EE]" />
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
    <div className="min-h-screen bg-[#F7F4EE] text-[#0B1F1A]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        <style>{`
          @keyframes btc-facts-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .btc-facts-marquee {
            animation: btc-facts-marquee 42s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .btc-facts-marquee {
              animation: none !important;
              transform: none !important;
            }
          }
        `}</style>

        {/* Hero — editorial split: quiet type on the left, one image on the right. */}
        <section className="mx-auto max-w-[1200px] px-5 pb-32 pt-20 sm:px-8 md:pb-48 md:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-24">
            <div>
              <h1 className="text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0B1F1A]">
                Paid project work for{" "}
                <span className="text-[#E8A317]">Bhutanese students.</span>
              </h1>
              <p className="mt-8 max-w-[52ch] text-lg leading-8 text-[#1B4D3E]">
                Founders post a clear brief and budget. Students apply with skills
                and a CV. Admins verify people by hand — not by algorithm.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href={CTA_HREFS.signup} className={primaryCta}>
                  {CTA_LABELS.signup}
                </Link>
                <Link href={CTA_HREFS.howItWorks} className={secondaryCta}>
                  {CTA_LABELS.seeHow}
                </Link>
              </div>
            </div>
            <div className="group relative isolate aspect-[4/5] overflow-hidden rounded-[28px] bg-[#17352b]">
              <Image
                src="https://picsum.photos/seed/bhutan-work/1920/1080"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className={hoverZoom}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% 15%, transparent 30%, rgb(11 31 26 / 0.7) 100%)",
                }}
              />
            </div>
          </div>
        </section>

        {/* Interest — one gapless twelve-column bento: 7 + 5, then 4 + 4 + 4. */}
        <section className="mx-auto max-w-[1200px] px-5 py-32 sm:px-8 md:py-48">
          <h2 className={sectionHeading}>Built for both sides of the table</h2>
          <div className="mt-14 grid grid-cols-12 grid-flow-dense gap-4">
            {paths.map((path, index) => (
              <article
                key={path.title}
                className={`${bentoCard} col-span-12 min-h-[420px] ${index === 0 ? "lg:col-span-7" : "lg:col-span-5"}`}
              >
                <div className="relative isolate mb-8 h-44 overflow-hidden rounded-[16px] bg-[#E8E4DB] sm:h-52">
                  <Image
                    src={path.portrait.src}
                    alt={path.portrait.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={hoverZoom}
                  />
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B1F1A] sm:text-3xl">
                  {path.title}
                </h3>
                <p className="mt-4 max-w-[46ch] text-base leading-7 text-[#1B4D3E]">
                  {path.body}
                </p>
                <Link href={path.href} className={`${secondaryCta} mt-8 self-start`}>
                  {path.cta}
                </Link>
                <PhotoCredit
                  fileUrl={path.portrait.creditFileUrl}
                  className="mt-5 text-[#0B1F1A]/55"
                />
              </article>
            ))}
          </div>

          <h2 className={`${sectionHeading} mt-28 md:mt-40`}>
            From brief to paid work
          </h2>
          <div className="mt-14 grid grid-cols-12 grid-flow-dense gap-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="col-span-12 flex min-h-[320px] flex-col rounded-[24px] border border-[#1B4D3E]/10 bg-[#E8E4DB]/70 p-7 sm:p-8 lg:col-span-4"
              >
                <span className="text-sm font-semibold tabular-nums text-[#1B4D3E]">
                  {step.number}
                </span>
                <h3 className="mt-12 text-xl font-semibold tracking-[-0.02em] text-[#0B1F1A] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#1B4D3E]">
                  {step.body}
                </p>
                <p className="mt-auto pt-8 text-xs font-medium text-[#1B4D3E]/80">
                  {step.hint}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Local context — pinned title, scrubbed text reveal, scrolling gallery. */}
        <PinnedScrollChapter
          id="local-context"
          labelledBy="local-context-title"
          className="px-5 py-32 sm:px-8 md:py-48"
          title={
            <h2 id="local-context-title" className={sectionHeading}>
              A local bridge{" "}
              <span
                aria-hidden="true"
                className="inline-block h-[0.78em] w-[0.78em] rounded-[0.16em] bg-cover bg-center align-middle"
                style={{
                  backgroundImage:
                    "url('https://picsum.photos/seed/bhutan-bridge/160/160')",
                }}
              />{" "}
              for young people
            </h2>
          }
        >
          <ScrubbedTextReveal
            as="p"
            text={localContext}
            className="max-w-[62ch] text-lg leading-8 text-[#1B4D3E]"
          />
          <div className="mt-12 grid gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:px-0">
            {portraits.map((portrait) => (
              <GalleryFigure key={portrait.src} portrait={portrait} />
            ))}
          </div>
          <div className="mt-12 px-5 sm:px-8 lg:px-0">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[18px] border border-[#1B4D3E]/10 bg-white p-5">
                <dt className="text-xs font-medium text-[#0B1F1A]/55">
                  Youth unemployment · Bhutan
                </dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums">
                  {youth?.displayValue ?? "—"}
                </dd>
                <dd className="mt-1 text-xs text-[#0B1F1A]/55">
                  {youth ? `${youth.year} · ${youth.seriesNote}` : "Source unavailable"}
                </dd>
              </div>
              <div className="rounded-[18px] border border-[#1B4D3E]/10 bg-white p-5">
                <dt className="text-xs font-medium text-[#0B1F1A]/55">Payments</dt>
                <dd className="mt-2 text-lg font-semibold">In Nu</dd>
                <dd className="mt-1 text-xs text-[#0B1F1A]/55">
                  Bank transfer or mBoB
                </dd>
              </div>
              <div className="rounded-[18px] border border-[#1B4D3E]/10 bg-white p-5">
                <dt className="text-xs font-medium text-[#0B1F1A]/55">
                  Verification
                </dt>
                <dd className="mt-2 text-lg font-semibold">By people</dd>
                <dd className="mt-1 text-xs text-[#0B1F1A]/55">
                  Admin-reviewed, every time
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-5 text-[#0B1F1A]/55">
              National indicator from the World Bank API, World Development
              Indicators. This is context, not a platform result.
            </p>
          </div>
        </PinnedScrollChapter>

        {/* Infinite marquee — real platform facts, paused under reduced motion. */}
        <section
          aria-label="Platform facts"
          className="border-y border-[#1B4D3E]/10 bg-[#17352b] py-7"
        >
          <p className="sr-only">
            Platform facts: {marqueeFacts.join(", ")}.
          </p>
          <div aria-hidden="true" className="overflow-hidden">
            <div className="btc-facts-marquee flex w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center gap-12 pr-12">
                  {marqueeFacts.map((fact) => (
                    <span
                      key={`${fact}-${copy}`}
                      className="flex items-center gap-12 whitespace-nowrap text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-[-0.03em] text-[#F7F4EE]"
                    >
                      {fact}
                      <span aria-hidden="true" className="text-[#E8A317]">
                        ·
                      </span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified facts, presented as an overlapping-portrait carousel. */}
        <section
          aria-labelledby="facts-title"
          className="mx-auto max-w-[1200px] px-5 py-32 sm:px-8 md:py-48"
        >
          <h2 id="facts-title" className={sectionHeading}>
            Checked by people
          </h2>
          <div className="mt-14">
            <FactCarousel slides={factSlides} />
          </div>
        </section>

        {/* Final CTA — one high-contrast band, one saffron action. */}
        <section className="bg-[#17352b] px-5 py-32 text-[#F7F4EE] sm:px-8 md:py-48">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E8A317]">
              {CTA_LABELS.closingEyebrow}
            </p>
            <h2 className="mt-6 text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              Start with one paid project
            </h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-8 text-[#F7F4EE]/80">
              {SITE.tagline}
            </p>
            <div className="mt-10">
              <Link
                href={CTA_HREFS.signup}
                className={`${primaryCta} px-8 py-4 text-base`}
              >
                {CTA_LABELS.signup}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
