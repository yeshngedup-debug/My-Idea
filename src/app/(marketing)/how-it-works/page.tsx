import Image from "next/image";
import {
  ListChecks,
  NotePencil,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CtaBand } from "@/components/marketing/cta-band";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { GuideHero } from "@/components/marketing/guides/guide-hero";
import {
  ChapterProgress,
  PinnedScrollChapter,
  type ChapterLink,
} from "@/components/motion";
import { Chapter, TextLink } from "@/components/marketing/guides/primitives";
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
      <main id="main-content" className="overflow-x-clip bg-[#f5f2ea] text-[#18251f]">
        <GuideHero
          title={
            <>
              Founders post the brief.{" "}
              <span className="text-[#b23c26]">Students do the work.</span>
            </>
          }
          lead="Three steps connect a founder's scoped project with a student ready to build."
          primary={{ href: "/signup", label: "Create student account" }}
          secondary={{ href: "/for-students", label: "Explore the student guide" }}
          image="/images/bhutanese-students.jpg"
          imageAlt="Young Bhutanese people in gho and kira working together at computers"
          creditFileUrl="https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg"
        />

        <ChapterProgress chapters={guideChapters} className="bg-[#fffefa]" />

        <PinnedScrollChapter
          id="journey"
          labelledBy="journey-heading"
          className="px-5 py-20 sm:px-8 md:py-24 lg:px-12"
          title={
            <Reveal>
              <h2
                id="journey-heading"
                className="max-w-lg text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
              >
                Three steps, one clear brief
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-6 text-[#56645c] sm:text-base">
                Each step keeps the work focused and the expectations visible
                to everyone involved.
              </p>
            </Reveal>
          }
        >
          <StaggerGroup className="border-t border-[#17352b]/15">
            {steps.map((step) => {
              const StepIcon = step.Icon;
              return (
                <StaggerItem key={step.number}>
                  <article className="grid gap-4 border-b border-[#17352b]/15 py-10 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-8 sm:py-14">
                    <span className="text-2xl font-semibold tracking-[-0.04em] text-[#b23c26] sm:text-3xl">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#17352b] sm:text-3xl">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#56645c] sm:text-base">
                        {step.body}
                      </p>
                    </div>
                    <StepIcon
                      aria-hidden="true"
                      weight="light"
                      size={30}
                      strokeWidth={1.5}
                      className="hidden text-[#56645c] sm:block"
                    />
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </PinnedScrollChapter>

        <Chapter id="brief" labelledBy="brief-heading">
          <Reveal className="max-w-3xl">
            <h2
              id="brief-heading"
              className="max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
            >
              Founders set the brief. Students apply to the projects.
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#56645c] sm:text-base">
              Founders write the scope and budget before work begins. Skills and
              a deadline can be added.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-12 border-t border-[#17352b]/15 pt-10 sm:grid-cols-2 sm:gap-0">
            {briefColumns.map((column, index) => (
              <Reveal
                key={column.heading}
                delay={index * 0.08}
                className={cn(
                  "sm:px-10",
                  index === 0 && "sm:border-r sm:border-[#17352b]/15 sm:pl-0",
                  index === briefColumns.length - 1 && "sm:pr-0",
                )}
              >
                <h3 className="text-sm font-semibold text-[#b23c26]">
                  {column.heading}
                </h3>
                <ul className="mt-7 space-y-5">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="border-b border-[#17352b]/15 pb-4 text-lg font-medium leading-7 text-[#17352b] sm:text-xl"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Chapter>

        <Chapter id="place" fullBleed labelledBy="place-heading">
          <Reveal>
            <figure className="relative isolate aspect-[16/10] w-full overflow-hidden bg-[#fffefa] sm:aspect-[21/9]">
              <Image
                src="/images/bhutanese-team.jpg"
                alt="Bhutanese students in kira performing in national dress"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </figure>
          </Reveal>
          <div className="mx-auto max-w-[1440px] px-5 pt-10 sm:px-8 sm:pt-12 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-24">
              <div>
                <h2
                  id="place-heading"
                  className="max-w-md text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl"
                >
                  Built for work here
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-[#56645c] sm:text-base">
                  The platform connects Bhutanese students with startup founders;
                  these photographs show Bhutanese places, not platform listings or
                  members.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <TextLink href="/for-students">See the student path</TextLink>
                <PhotoCredit fileUrl={MARKET_CREDIT} className="text-[#56645c]" />
              </div>
            </div>
          </div>
        </Chapter>

        <Chapter id="care" tone="surface" labelledBy="care-heading">
          <Reveal className="max-w-2xl">
            <h2
              id="care-heading"
              className="max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
            >
              The details that protect both sides
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#56645c] sm:text-base">
              A few clear rules keep the process fair and the documents private.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-0">
            {protections.map((rule, index) => (
              <Reveal
                key={rule.title}
                delay={index * 0.08}
                className={cn(
                  "sm:border-l sm:border-[#17352b]/15 sm:pl-8",
                  index === 0 && "sm:border-l-0 sm:pl-0",
                )}
              >
                <span className="text-sm font-semibold tracking-[-0.02em] text-[#b23c26]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-balance text-xl font-semibold leading-snug text-[#17352b]">
                  {rule.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#56645c]">
                  {rule.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Chapter>

        <Chapter id="shortlist" labelledBy="shortlist-heading">
          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <h2
                  id="shortlist-heading"
                  className="max-w-sm text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl"
                >
                  What happens after a shortlist
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-7 text-[#56645c] sm:text-base">
                  The handoff stays explicit so founders and students know where
                  they stand.
                </p>
              </Reveal>
            </div>
            <Reveal direction="right" delay={0.08}>
              <div className="grid gap-0 sm:grid-cols-3 sm:border-t sm:border-[#17352b]/15">
                {afterShortlist.map((item, index) => (
                  <div
                    key={item.title}
                    className={
                      index === 0
                        ? "py-7 sm:border-l-0 sm:pl-0 sm:py-8"
                        : "border-t border-[#17352b]/15 py-7 sm:border-l sm:border-t-0 sm:py-8 sm:pl-7"
                    }
                  >
                    <h3 className="text-balance text-lg font-semibold leading-snug text-[#17352b] sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#56645c]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Chapter>

        <section aria-label="Keep reading" className="px-5 pb-8 sm:px-8 lg:px-12">
          <Reveal className="mx-auto flex max-w-[1440px] flex-col gap-6 border-t border-[#17352b]/15 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold text-[#17352b]">
              Still have questions?
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              <TextLink href="/faq">Read the FAQ</TextLink>
              <TextLink href="/for-founders">For founders</TextLink>
            </div>
          </Reveal>
        </section>

        <CtaBand
          title="Start with one clear project"
          lead="Bring a focused brief and meet students ready to build."
          href="/contact"
          label="Ask for founder access"
        />
      </main>
      <SiteFooter />
    </>
  );
}
