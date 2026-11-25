import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ListChecks,
  NotePencil,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { Reveal } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { HeroPhotoEntrance } from "@/components/marketing/hero-photo";
import {
  GsapScaleFadeImage,
  HorizontalAccordion,
  type HorizontalAccordionItem,
} from "@/components/marketing/editorial-page-motion";
import { InlineImageText } from "@/components/editorial";
import { ScrubbedTextReveal } from "@/components/motion";
import {
  ChapterProgress,
  PinnedScrollChapter,
  type ChapterLink,
} from "@/components/motion";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";

type Icon = typeof NotePencil;

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "See how founders post scoped projects, students apply to projects, and both sides work from a clear brief.",
  path: "/how-it-works",
});

const MARKET_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg";
const YOUTH_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]";
const primaryCta = `inline-flex min-h-11 items-center justify-center rounded-full bg-[#ff0063] px-6 py-3 text-sm font-semibold text-[#000000] transition-colors duration-150 hover:bg-[#d40054]/85 motion-reduce:transition-none ${focusRing}`;
const quietLink = `inline-flex min-h-11 items-center text-sm font-semibold text-[#0b5c5c] underline decoration-[#0b5c5c]/30 underline-offset-4 transition-colors hover:text-[#0b2e2e] motion-reduce:transition-none ${focusRing}`;
const bandClass =
  "w-full max-w-full overflow-x-hidden px-5 py-32 sm:px-8 md:py-48 lg:px-12";
const headingClass =
  "text-balance text-left text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0b2e2e]";
const bodyClass =
  "max-w-2xl text-base leading-7 text-[#0b2e2e]/75 sm:text-lg sm:leading-8";
const bentoClass = "grid w-full max-w-full grid-cols-12 grid-flow-dense gap-4";
const imageZoom =
  "object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";

function SectionCard({
  id,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(bandClass, className)}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

type Step = {
  number: string;
  Icon: Icon;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    number: "01",
    Icon: NotePencil,
    title: "A founder posts a scoped project",
    body: "The founder sets the scope, a budget range, and a duration. They can also list the skills they need and set a deadline. The brief gives both sides a clear place to start.",
  },
  {
    number: "02",
    Icon: UserCircle,
    title: "A student builds a profile and applies",
    body: "The student can add skills, a short bio, availability, and a PDF CV. A complete profile and CV help founders decide. Then they apply to the projects that fit their strengths.",
  },
  {
    number: "03",
    Icon: ListChecks,
    title: "Both sides work from the brief",
    body: "The brief stays the reference point. Founders can update project and applicant status as the work moves forward.",
  },
];

const journeyItems: HorizontalAccordionItem[] = steps.map((step) => ({
  id: `step-${step.number}`,
  number: step.number,
  title: step.title,
  body: step.body,
}));

const briefColumns = [
  {
    heading: "What the founder writes",
    items: [
      "The scope of the work",
      "A budget range",
      "A duration",
      "Skills and a deadline, when added",
    ],
  },
  {
    heading: "What the student sees",
    items: [
      "The scope and any skills listed",
      "The budget range and any deadline",
      "A brief to apply to; a complete profile and CV help founders decide",
    ],
  },
];

const protections = [
  {
    title: "An admin confirms payment",
    body: "Founders pay Premium Shortlist orders by bank or mBoB transfer, upload a screenshot, and an admin confirms the payment before the order counts as paid.",
  },
  {
    title: "CVs stay private",
    body: "Student CVs live in a private store and open only through short-lived signed links for admins, founders whose project received the application, or founders who shortlisted the student under a confirmed paid order.",
  },
  {
    title: "Founders cannot confirm their own payments",
    body: "After a founder uploads proof, the order moves to submitted and waits for admin review. Application status stays separate: pending, shortlisted, accepted, or rejected.",
  },
];

const guideChapters: ChapterLink[] = [
  { id: "journey", label: "Three steps" },
  { id: "brief", label: "The brief" },
  { id: "place", label: "Built for work here" },
  { id: "care", label: "Both sides protected" },
  { id: "shortlist", label: "After a shortlist" },
];

const afterShortlist = [
  {
    title: "Admins can prepare a shortlist",
    body: "Admins can review student profiles, set manual ranks, and apply the verified badge when preparing a shortlist.",
  },
  {
    title: "The founder reviews the paid shortlist",
    body: "Once payment is confirmed, the founder can review the shortlist in the workspace after an admin prepares it.",
  },
  {
    title: "Statuses show the next move",
    body: "Founders move applications from pending to shortlisted, then to accepted or rejected. They can reject a pending application directly.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="w-full max-w-full overflow-x-hidden bg-[#eaf6f6] text-[#0b2e2e]"
      >
        {/* Editorial split hero: copy left, one credited photograph right. */}
        <section className="w-full max-w-full overflow-x-hidden px-5 pt-10 sm:px-8 lg:px-12 lg:pt-14">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
              <HeroCopyEntrance>
                <h1 className="w-full max-w-6xl text-balance text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0b2e2e]">
                  Founders post the brief. Students do the work.
                </h1>
                <p className="mt-8 max-w-xl text-base leading-7 text-[#0b2e2e]/75 sm:text-lg sm:leading-8">
                  Three steps connect a founder&apos;s scoped project with a
                  student ready to build.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href="/signup" className={primaryCta}>
                    Create student account
                  </Link>
                  <Link href="/for-students" className={quietLink}>
                    Explore the student guide
                  </Link>
                </div>
              </HeroCopyEntrance>

              <HeroPhotoEntrance>
                <figure className="group relative isolate aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] border border-[#b9dede] bg-[#0b2e2e]">
                  <Image
                    src="/images/bhutanese-students.jpg"
                    alt="Young Bhutanese people in gho and kira working together at computers"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className={cn(
                      "grayscale contrast-[1.15] opacity-90",
                      imageZoom,
                    )}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 50% 10%, transparent 25%, rgb(11 31 26 / 0.78) 100%)",
                    }}
                  />
                  <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                    <PhotoCredit
                      fileUrl={YOUTH_CREDIT}
                      className="text-[#eaf6f6]/90"
                    />
                  </figcaption>
                </figure>
              </HeroPhotoEntrance>
            </div>
          </div>
        </section>

        <section className={bandClass}>
          <div className="mx-auto w-full max-w-6xl">
            <ScrubbedTextReveal
              as="p"
              text="The brief stays the reference point."
              className="max-w-4xl text-balance text-[clamp(1.75rem,3.5vw,3rem)] font-medium leading-tight tracking-[-0.03em] text-[#0b5c5c]"
            />
          </div>
        </section>

        {/* Chapter wayfinding — palette scoped to BTC tokens. */}
        <ChapterProgress
          chapters={guideChapters}
          className="border-[#b9dede]/15 bg-white [&_a]:text-[#000000] [&_a]:focus-visible:ring-[#4d8c8c] [&_a]:focus-visible:ring-offset-[#eaf6f6] [&_a[aria-current]]:decoration-[#ff0063] [&_[data-chapter-bar]]:bg-[#ff0063]"
        />

        <PinnedScrollChapter
          id="journey"
          labelledBy="journey-heading"
          className="w-full max-w-full overflow-x-hidden px-5 py-32 sm:px-8 md:py-48 lg:px-12 [&_[data-pinned-title]]:border-[#b9dede]/15"
          title={
            <Reveal>
              <div className="rounded-[1.25rem] border border-[#b9dede] bg-white p-6 sm:p-8">
                <h2 id="journey-heading" className={headingClass}>
                  Three steps, one clear brief
                </h2>
                <p className="mt-6 text-sm leading-7 text-[#0b2e2e]/75 sm:text-base">
                  Each step keeps the work focused and the expectations visible
                  to everyone involved.
                </p>
              </div>
            </Reveal>
          }
        >
          <HorizontalAccordion
            items={journeyItems}
            label="The three steps"
            className="w-full"
          />
        </PinnedScrollChapter>

        <SectionCard id="brief" labelledBy="brief-heading">
          <div id="brief-heading">
            <InlineImageText
              as="h2"
              before="Founders set the brief."
              imageSrc="/images/bhutanese-community.jpg"
              imageAlt="Bhutanese boys in traditional gho sitting together"
              creditFileUrl={PHOTO_CREDITS.dzong}
              after="Students apply to the projects."
              accessibleLabel="Founders set the brief. Students apply to the projects."
            />
          </div>
          <Reveal className="mx-auto mt-10 max-w-2xl">
            <p className={bodyClass}>
              Founders write the scope and budget before work begins. Skills and
              a deadline can be added.
            </p>
          </Reveal>

          <div className={cn(bentoClass, "mt-14")}>
            {briefColumns.map((column, index) => (
              <Reveal
                key={column.heading}
                delay={index * 0.08}
                className="col-span-12 rounded-[1.25rem] border border-[#b9dede] bg-white p-6 md:col-span-6 sm:p-8"
              >
                <h3 className="text-sm font-semibold text-[#0b5c5c]">
                  {column.heading}
                </h3>
                <ul className="mt-7 space-y-5">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="border-b border-[#b9dede]/15 pb-4 text-lg font-medium leading-7 text-[#0b2e2e] sm:text-xl"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <GsapScaleFadeImage>
              <figure className="group relative isolate aspect-[21/9] w-full overflow-hidden rounded-[1.5rem] bg-[#0b2e2e]">
                <Image
                  src="/images/bhutanese-community.jpg"
                  alt="Bhutanese boys in traditional gho sitting together"
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className={imageZoom}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0b2e2e]/85 via-transparent to-transparent"
                />
                <figcaption className="absolute inset-x-5 bottom-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 sm:inset-x-7 sm:bottom-5">
                  <span className="text-sm font-medium text-[#eaf6f6]">
                    The people the work is built around
                  </span>
                  <PhotoCredit
                    fileUrl={PHOTO_CREDITS.dzong}
                    className="text-[#eaf6f6]/90"
                  />
                </figcaption>
              </figure>
            </GsapScaleFadeImage>
          </Reveal>
        </SectionCard>

        <SectionCard id="place" labelledBy="place-heading">
          <Reveal>
            <GsapScaleFadeImage>
              <figure className="group relative isolate aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-[#0b2e2e] sm:aspect-[21/9]">
                <Image
                  src="/images/bhutanese-team.jpg"
                  alt="Bhutanese students in kira performing in national dress"
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className={imageZoom}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0b2e2e]/85 via-transparent to-transparent"
                />
                <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                  <PhotoCredit
                    fileUrl={MARKET_CREDIT}
                    className="text-[#eaf6f6]/90"
                  />
                </figcaption>
              </figure>
            </GsapScaleFadeImage>
          </Reveal>
          <div className="mt-10 grid w-full grid-cols-12 gap-4 lg:items-end lg:gap-12">
            <div className="col-span-12 lg:col-span-8">
              <h2 id="place-heading" className={headingClass}>
                Built for work here
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#0b2e2e]/75 sm:text-base">
                The platform connects Bhutanese students with startup founders;
                these photographs show Bhutanese places, not platform listings or
                members.
              </p>
            </div>
            <div className="col-span-12 flex flex-col items-start gap-3 lg:col-span-4">
              <Link href="/for-students" className={quietLink}>
                See the student path
              </Link>
              <PhotoCredit fileUrl={MARKET_CREDIT} className="text-[#0b2e2e]/70" />
            </div>
          </div>
        </SectionCard>

        <SectionCard id="care" labelledBy="care-heading">
          <Reveal className="mx-auto max-w-5xl">
            <h2 id="care-heading" className={headingClass}>
              The details that protect both sides
            </h2>
            <p className={cn(bodyClass, "mx-auto mt-6")}>
              A few clear rules keep the process fair and the documents private.
            </p>
          </Reveal>

          <div className={cn(bentoClass, "mt-14")}>
            {protections.map((rule, index) => (
              <Reveal
                key={rule.title}
                delay={index * 0.08}
                className="col-span-12 rounded-[1.25rem] border border-[#b9dede] bg-white p-6 md:col-span-4 sm:p-8"
              >
                <span className="text-sm font-semibold tabular-nums text-[#0b5c5c]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-balance text-xl font-semibold leading-snug text-[#0b2e2e]">
                  {rule.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#0b2e2e]/75">
                  {rule.body}
                </p>
              </Reveal>
            ))}
          </div>
        </SectionCard>

        <SectionCard id="shortlist" labelledBy="shortlist-heading">
          <div className="grid w-full max-w-full grid-cols-12 gap-4 lg:gap-16">
            <div className="col-span-12 lg:col-span-4 lg:self-start">
              <Reveal>
                <h2 id="shortlist-heading" className={headingClass}>
                  What happens after a shortlist
                </h2>
                <p className="mt-6 text-sm leading-7 text-[#0b2e2e]/75 sm:text-base">
                  The handoff stays explicit so founders and students know where
                  they stand.
                </p>
              </Reveal>
            </div>
            <Reveal
              direction="right"
              delay={0.08}
              className="col-span-12 lg:col-span-8"
            >
              <div className="grid w-full grid-cols-12 gap-4">
                {afterShortlist.map((item) => (
                  <div
                    key={item.title}
                    className="col-span-12 rounded-[1.25rem] border border-[#b9dede] bg-white p-6 md:col-span-4 sm:p-8"
                  >
                    <h3 className="text-balance text-lg font-semibold leading-snug text-[#0b2e2e] sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#0b2e2e]/75">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </SectionCard>

        <section
          aria-label="Keep reading"
          className="w-full max-w-full overflow-x-hidden px-5 pb-10 sm:px-8 lg:px-12"
        >
          <Reveal className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-[1.25rem] border border-[#b9dede] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-base font-semibold text-[#0b2e2e]">
              Still have questions?
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <Link href="/faq" className={quietLink}>
                Read the FAQ
              </Link>
              <Link href="/for-founders" className={quietLink}>
                For founders
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Closing band: one saffron action. */}
        <section className="w-full max-w-full overflow-x-hidden px-5 pb-16 sm:px-8 lg:px-12">
          <Reveal className="mx-auto w-full max-w-6xl">
            <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-[#b9dede] bg-white px-6 py-24 text-left sm:px-12">
              <h2 className="text-balance text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0b2e2e]">
                Start with one clear project
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#0b2e2e]/75 sm:text-lg">
                Bring a focused brief and meet students ready to build.
              </p>
              <Link href="/contact" className={cn(primaryCta, "mt-8")}>
                Ask for founder access
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
