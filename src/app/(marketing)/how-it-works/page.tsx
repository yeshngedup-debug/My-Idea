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
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { HeroPhotoEntrance } from "@/components/marketing/hero-photo";
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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE]";
const primaryCta = `inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#E8A317]/85 motion-reduce:transition-none ${focusRing}`;
const quietLink = `inline-flex min-h-11 items-center text-sm font-semibold text-[#1B4D3E] underline decoration-[#1B4D3E]/30 underline-offset-4 transition-colors hover:text-[#0B1F1A] motion-reduce:transition-none ${focusRing}`;
const pillClass =
  "inline-flex items-center rounded-full border border-[#1B4D3E]/15 bg-[#E8E4DB]/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1B4D3E]";
const headingClass =
  "text-balance text-center text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0B1F1A]";

/** Saffron marker behind a phrase, with ink text kept readable. */
function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="box-decoration-clone rounded-[4px] bg-[#E8A317] px-1 text-[#0B1F1A]">
      {children}
    </span>
  );
}

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
      className={cn("px-5 py-10 sm:px-8 lg:px-12", className)}
    >
      <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
        {children}
      </div>
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
      <main id="main-content" className="overflow-x-clip bg-[#F7F4EE] text-[#0B1F1A]">
        {/* Hero */}
        <section className="px-5 pt-10 sm:px-8 lg:px-12 lg:pt-14">
          <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <HeroCopyEntrance>
                <p className={pillClass}>How it works</p>
                <h1 className="mt-3 max-w-[20ch] text-balance text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0B1F1A]">
                  Founders post the brief.{" "}
                  <Highlight>Students do the work.</Highlight>
                </h1>
                <p className="mt-6 max-w-[52ch] text-base leading-7 text-[#0B1F1A]/75">
                  Three steps connect a founder&apos;s scoped project with a
                  student ready to build.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href="/signup" className={primaryCta}>
                    Create student account
                  </Link>
                  <Link href="/for-students" className={quietLink}>
                    Explore the student guide
                  </Link>
                </div>
              </HeroCopyEntrance>

              <HeroPhotoEntrance>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-[#E8A317]/25 via-[#E8E4DB]/70 to-[#1B4D3E]/15 blur-2xl"
                  />
                  <figure className="relative isolate aspect-[4/5] overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-white">
                    <Image
                      src="/images/bhutanese-students.jpg"
                      alt="Young Bhutanese people in gho and kira working together at computers"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0B1F1A]/55 to-transparent"
                    />
                    <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                      <PhotoCredit
                        fileUrl={YOUTH_CREDIT}
                        className="text-[#F7F4EE]/80"
                      />
                    </figcaption>
                  </figure>
                </div>
              </HeroPhotoEntrance>
            </div>
          </div>
        </section>

        {/* Chapter wayfinding — palette scoped to BTC tokens. */}
        <ChapterProgress
          chapters={guideChapters}
          className="border-[#1B4D3E]/15 bg-white [&_a]:text-[#0B1F1A] [&_a]:focus-visible:ring-[#1B4D3E] [&_a]:focus-visible:ring-offset-[#F7F4EE] [&_a[aria-current]]:decoration-[#E8A317] [&_[data-chapter-bar]]:bg-[#E8A317]"
        />

        <PinnedScrollChapter
          id="journey"
          labelledBy="journey-heading"
          className="px-5 py-10 sm:px-8 lg:px-12 [&_[data-pinned-title]]:border-[#1B4D3E]/15"
          title={
            <Reveal>
              <div className="rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-8">
                <p className={pillClass}>Three steps</p>
                <h2 id="journey-heading" className={cn(headingClass, "mt-1")}>
                  Three steps, one <Highlight>clear brief</Highlight>
                </h2>
                <p className="mt-6 text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
                  Each step keeps the work focused and the expectations visible
                  to everyone involved.
                </p>
              </div>
            </Reveal>
          }
        >
          <StaggerGroup className="rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-8">
            {steps.map((step, index) => {
              const StepIcon = step.Icon;
              return (
                <StaggerItem key={step.number}>
                  <article
                    className={cn(
                      "grid gap-4 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-8",
                      index === steps.length - 1
                        ? "border-b-0"
                        : "border-b border-[#1B4D3E]/15",
                    )}
                  >
                    <span className="inline-flex h-fit rounded-full bg-[#E8A317]/20 px-2.5 py-1 text-sm font-semibold tabular-nums text-[#0B1F1A]">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#0B1F1A] sm:text-3xl">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
                        {step.body}
                      </p>
                    </div>
                    <StepIcon
                      aria-hidden="true"
                      weight="light"
                      size={30}
                      strokeWidth={1.5}
                      className="hidden text-[#1B4D3E] sm:block"
                    />
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </PinnedScrollChapter>

        <SectionCard id="brief" labelledBy="brief-heading">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className={pillClass}>The brief</p>
            <h2
              id="brief-heading"
              className={cn(headingClass, "mt-1 text-balance")}
            >
              Founders set the brief. <Highlight>Students apply</Highlight> to
              the projects.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
              Founders write the scope and budget before work begins. Skills and
              a deadline can be added.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {briefColumns.map((column, index) => (
              <Reveal
                key={column.heading}
                delay={index * 0.08}
                className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6 sm:p-8"
              >
                <h3 className="text-sm font-semibold text-[#1B4D3E]">
                  {column.heading}
                </h3>
                <ul className="mt-7 space-y-5">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="border-b border-[#1B4D3E]/15 pb-4 text-lg font-medium leading-7 text-[#0B1F1A] sm:text-xl"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <figure>
              <div className="relative isolate aspect-[21/9] w-full overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-[#F7F4EE]">
                <Image
                  src="/images/bhutanese-community.jpg"
                  alt="Bhutanese boys in traditional gho sitting together"
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="text-sm font-medium text-[#0B1F1A]">
                  The people the work is built around
                </span>
                <PhotoCredit
                  fileUrl={PHOTO_CREDITS.dzong}
                  className="text-[#0B1F1A]/70"
                />
              </figcaption>
            </figure>
          </Reveal>
        </SectionCard>

        <SectionCard id="place" labelledBy="place-heading">
          <Reveal>
            <figure className="relative isolate aspect-[16/10] w-full overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-[#F7F4EE] sm:aspect-[21/9]">
              <Image
                src="/images/bhutanese-team.jpg"
                alt="Bhutanese students in kira performing in national dress"
                fill
                sizes="(max-width: 1024px) 100vw, 90vw"
                className="object-cover"
              />
            </figure>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-24">
            <div>
              <p className={pillClass}>Local context</p>
              <h2 id="place-heading" className={cn(headingClass, "mt-1")}>
                Built for work <Highlight>here</Highlight>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
                The platform connects Bhutanese students with startup founders;
                these photographs show Bhutanese places, not platform listings or
                members.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <Link href="/for-students" className={quietLink}>
                See the student path
              </Link>
              <PhotoCredit fileUrl={MARKET_CREDIT} className="text-[#0B1F1A]/70" />
            </div>
          </div>
        </SectionCard>

        <SectionCard id="care" labelledBy="care-heading">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className={pillClass}>Both sides protected</p>
            <h2
              id="care-heading"
              className={cn(headingClass, "mt-1 text-balance")}
            >
              The details that protect <Highlight>both sides</Highlight>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
              A few clear rules keep the process fair and the documents private.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {protections.map((rule, index) => (
              <Reveal
                key={rule.title}
                delay={index * 0.08}
                className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6"
              >
                <span className="inline-flex rounded-full bg-[#E8A317]/20 px-2.5 py-1 text-sm font-semibold tabular-nums text-[#0B1F1A]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-balance text-xl font-semibold leading-snug text-[#0B1F1A]">
                  {rule.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#0B1F1A]/75">
                  {rule.body}
                </p>
              </Reveal>
            ))}
          </div>
        </SectionCard>

        <SectionCard id="shortlist" labelledBy="shortlist-heading">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="lg:self-start">
              <Reveal>
                <p className={pillClass}>After a shortlist</p>
                <h2
                  id="shortlist-heading"
                  className={cn(headingClass, "mt-1")}
                >
                  What happens <Highlight>after a shortlist</Highlight>
                </h2>
                <p className="mt-6 text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
                  The handoff stays explicit so founders and students know where
                  they stand.
                </p>
              </Reveal>
            </div>
            <Reveal direction="right" delay={0.08}>
              <div className="grid gap-4 sm:grid-cols-3">
                {afterShortlist.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6"
                  >
                    <h3 className="text-balance text-lg font-semibold leading-snug text-[#0B1F1A] sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#0B1F1A]/75">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </SectionCard>

        <section aria-label="Keep reading" className="px-5 pb-10 sm:px-8 lg:px-12">
          <Reveal className="mx-auto flex max-w-[1120px] flex-col gap-6 rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-base font-semibold text-[#0B1F1A]">
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

        {/* Final CTA */}
        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <Reveal className="mx-auto max-w-[1120px]">
            <div className="relative isolate overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-gradient-to-br from-[#E8E4DB] via-white to-[#E8A317]/25 px-6 py-14 text-center sm:px-12">
              <p className={pillClass}>Next step</p>
              <h2 className="mt-4 text-balance text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0B1F1A]">
                Start with <Highlight>one clear project</Highlight>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
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
