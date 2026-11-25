import Link from "next/link";
import { MarketingReveal, SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { EditorialHero } from "@/components/marketing/editorial-hero";
import {
  Action,
  Band,
  Figure,
  LedgerRow,
  RuleLink,
  SectionHead,
  container,
  gutters,
  quietClass,
} from "@/components/marketing/editorial";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { HorizontalAccordion } from "@/components/marketing/editorial-page-motion";
import { ScrubbedTextReveal } from "@/components/motion";
import { ChapterProgress, type ChapterLink } from "@/components/motion";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "See how founders post scoped projects, students apply to projects, and both sides work from a clear brief.",
  path: "/how-it-works",
});

const steps = [
  {
    id: "step-01",
    number: "01",
    title: "A founder posts a scoped project",
    body: "The founder sets the scope, a budget range, and a duration. They can also list the skills they need and set a deadline. The brief gives both sides a clear place to start.",
  },
  {
    id: "step-02",
    number: "02",
    title: "A student builds a profile and applies",
    body: "The student can add skills, a short bio, availability, and a PDF CV. A complete profile and CV help founders decide. Then they apply to the projects that fit their strengths.",
  },
  {
    id: "step-03",
    number: "03",
    title: "Both sides work from the brief",
    body: "The brief stays the reference point. Founders can update project and applicant status as the work moves forward.",
  },
] as const;

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
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        <EditorialHero
          index="01"
          eyebrow="How it works"
          title={
            <>
              Founders post the brief.{" "}
              <span className="text-[#0b5c5c]">Students do the work.</span>
            </>
          }
          lead="Three steps connect a founder's scoped project with a student ready to build. No bidding war, no unverified profiles."
          primaryCta={{ href: "/signup", label: "Create student account" }}
          secondary={{ href: "/for-students", label: "Explore the student guide" }}
          image={{
            src: "/images/bhutanese-students.jpg",
            alt: "Young Bhutanese people in gho and kira working together at computers",
            fileUrl: PHOTO_CREDITS.valley,
          }}
          caption="Students at work"
          imagePosition="object-center"
        />

        {/* One statement, scrubbed in. The brief is the spine of the product. */}
        <Band tone="mist" className="border-b border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-14 md:py-20")}>
            <p className="index-label">The principle</p>
            <ScrubbedTextReveal
              as="p"
              text="The brief stays the reference point. Scope, budget and deadline are written down before anyone starts."
              className="mt-6 max-w-[26ch] text-[clamp(1.75rem,3.6vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#0b2e2e] md:max-w-[30ch]"
            />
          </div>
        </Band>

        <ChapterProgress
          chapters={guideChapters}
          className="sticky top-16 z-30 border-[#0b2e2e]/12 bg-white [&_a]:text-[#0b2e2e] [&_a:hover]:text-[#0b5c5c] [&_a]:focus-visible:ring-[#0b5c5c] [&_a]:focus-visible:ring-offset-white [&_a[aria-current]]:text-[#0b5c5c] [&_a[aria-current]]:decoration-[#ff0063] [&_a[aria-current]]:decoration-1 [&_a[aria-current]]:underline-offset-[10px] [&_[data-chapter-bar]]:bg-[#ff0063]"
        />

        {/* Three steps — horizontal accordion on a ruled frame. */}
        <Band id="journey" labelledBy="journey-heading">
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="02"
                eyebrow="Three steps"
                id="journey-heading"
                title="Three steps, one clear brief"
                lead="Each step keeps the work focused and the expectations visible to everyone involved."
              />
            </MarketingReveal>

            <MarketingReveal className="mt-12">
              <HorizontalAccordion items={steps} label="The three steps" />
            </MarketingReveal>
          </div>
        </Band>

        {/* The brief — two ruled columns and a wide plate. */}
        <Band
          id="brief"
          tone="mist"
          labelledBy="brief-heading"
          className="border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="03"
                eyebrow="The brief"
                id="brief-heading"
                title="Founders set the brief. Students apply to the projects."
                lead="Scope and budget are written before work begins. Skills and a deadline can be added."
              />
            </MarketingReveal>

            <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
              {briefColumns.map((column, index) => (
                <MarketingReveal key={column.heading} delay={index * 0.08}>
                  <h3 className="flex items-baseline gap-3 border-b border-[#0b2e2e]/20 pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0b5c5c]">
                    <span
                      aria-hidden="true"
                      className="tabular-nums text-[#c2004b]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {column.heading}
                  </h3>
                  <ul className="mt-2">
                    {column.items.map((item) => (
                      <li
                        key={item}
                        className="border-b border-[#0b2e2e]/10 py-4 text-[1.05rem] font-medium leading-7 tracking-[-0.015em] text-[#0b2e2e] sm:text-[1.15rem]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </MarketingReveal>
              ))}
            </div>

            <MarketingReveal className="mt-14">
              <Figure
                src="/images/bhutanese-community.jpg"
                alt="Bhutanese boys in traditional gho sitting together"
                credit={PHOTO_CREDITS.dzong}
                caption="The people the work is built around"
                ratio="aspect-[16/10] sm:aspect-[21/9]"
                sizes="(max-width: 1024px) 100vw, 90vw"
              />
            </MarketingReveal>
          </div>
        </Band>

        {/* The place. */}
        <Band id="place" labelledBy="place-heading">
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-7">
                <Figure
                  src="/images/thimphu-city.jpg"
                  alt="View across central Thimphu, the capital of Bhutan"
                  credit={PHOTO_CREDITS.thimphu}
                  caption="Thimphu, the capital"
                  ratio="aspect-[16/10]"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </MarketingReveal>
              <MarketingReveal
                delay={0.08}
                className="flex flex-col justify-between lg:col-span-5 lg:pl-4"
              >
                <div>
                  <p className="index-label">04 · The place</p>
                  <h2
                    id="place-heading"
                    className="display-lg mt-6 max-w-[12ch]"
                  >
                    Built for work here
                  </h2>
                  <p className="mt-6 max-w-[38ch] text-[15px] leading-7 text-[#356464]">
                    The platform connects Bhutanese students with startup
                    founders. These photographs show Bhutanese places, not
                    platform listings or members.
                  </p>
                </div>
                <div className="mt-10 border-t border-[#0b2e2e]/12 pt-6">
                  <RuleLink href="/for-students">See the student path</RuleLink>
                </div>
              </MarketingReveal>
            </div>
          </div>
        </Band>

        {/* Protections — three ruled columns. */}
        <Band
          id="care"
          tone="mist"
          labelledBy="care-heading"
          className="border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="05"
                eyebrow="Both sides protected"
                id="care-heading"
                title="The details that protect both sides"
                lead="A few clear rules keep the process fair and the documents private."
              />
            </MarketingReveal>

            <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-[#0b2e2e]/15 sm:grid-cols-3">
              {protections.map((rule, index) => (
                <MarketingReveal
                  key={rule.title}
                  delay={index * 0.06}
                  className="border-b border-[#0b2e2e]/15 py-7 sm:border-b-0 sm:py-8"
                >
                  <li>
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
                      {rule.title}
                    </h3>
                    <p className="mt-2 max-w-[34ch] text-sm leading-6 text-[#356464]">
                      {rule.body}
                    </p>
                  </li>
                </MarketingReveal>
              ))}
            </ul>
          </div>
        </Band>

        {/* After a shortlist — a numbered ledger. */}
        <Band id="shortlist" labelledBy="shortlist-heading">
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="06"
                eyebrow="After a shortlist"
                id="shortlist-heading"
                title="What happens after a shortlist"
                lead="The handoff stays explicit so founders and students know where they stand."
              />
            </MarketingReveal>

            <ol className="mt-12 border-t border-[#0b2e2e]/15">
              {afterShortlist.map((item, index) => (
                <LedgerRow
                  key={item.title}
                  index={String(index + 1).padStart(2, "0")}
                  title={item.title}
                >
                  {item.body}
                </LedgerRow>
              ))}
            </ol>

            <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-[#0b2e2e]/12 pt-6">
              <Link href="/faq" className={quietClass}>
                Read the FAQ
              </Link>
              <Link href="/for-founders" className={quietClass}>
                For founders
              </Link>
              <Link href="/for-students" className={quietClass}>
                For students
              </Link>
            </div>
          </div>
        </Band>

        {/* Closing band. */}
        <Band tone="teal">
          <div
            className={cn(
              container,
              gutters,
              "grid grid-cols-1 items-end gap-10 py-20 md:py-28 lg:grid-cols-12",
            )}
          >
            <MarketingReveal className="lg:col-span-8">
              <p className="index-label text-[#0b2e2e]">Make your next move</p>
              <h2 className="display-xl mt-6 max-w-[15ch]">
                Start with one paid project.
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                Create a student account, or ask about founder access.
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href="/signup">Create student account</Action>
              <RuleLink
                href="/contact"
                className="decoration-[#0b2e2e]/30 hover:decoration-[#0b2e2e]"
              >
                Ask for founder access
              </RuleLink>
            </MarketingReveal>
          </div>
        </Band>
      </main>

      <SiteFooter />
    </div>
  );
}
