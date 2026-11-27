import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  CheckList,
  FactRow,
  MarketButton,
  Photo,
  Section,
  SectionHeading,
  StepCards,
  TrustBar,
  type ThreeSteps,
} from "@/components/marketing/marketplace";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
} from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "Three steps: a founder posts a scoped project, a student applies with a profile and CV, and both sides work from the same brief.",
  path: "/how-it-works",
});

/**
 * This page promises exactly three steps, so the list is typed as a tuple of
 * three. Adding or removing an entry is a type error, not a silent change.
 */
const steps: ThreeSteps = [
  {
    title: "A founder posts a scoped project",
    body: "The founder writes the scope, a budget range in Nu and a duration, and can add the skills needed and an apply-by date. The brief gives both sides the same starting point.",
  },
  {
    title: "A student applies with a profile and CV",
    body: "The student adds skills, a short bio, availability and a PDF CV. A complete profile and CV help founders decide, then they apply to the projects that fit.",
  },
  {
    title: "Both sides work from the brief",
    body: "The brief stays the reference point. Founders update project and applicant status as the work moves forward, and the student sees the same status.",
  },
];

const briefColumns = [
  {
    heading: "What the founder writes",
    items: [
      "The scope of the work",
      "A budget range in Nu",
      "A duration",
      "The skills needed",
      "An apply-by date",
      "Whether the work is remote or on site",
    ],
  },
  {
    heading: "What the student sees",
    items: [
      "The scope and the skills listed",
      "The budget range and the deadline",
      "A brief to apply to, with one application per project",
      "How the project payment is agreed, in Ngultrum",
    ],
  },
];

const protections = [
  {
    title: "An admin confirms payment",
    body: "Shortlist orders are paid by bank transfer or mBoB. The founder uploads a screenshot and an admin confirms it before the order counts as paid.",
  },
  {
    title: "CVs stay private",
    body: "Student CVs live in a private store and open only through short-lived signed links for admins, founders whose project received the application, or founders who shortlisted the student under a confirmed paid order.",
  },
  {
    title: "Founders cannot confirm their own payments",
    body: "After a founder uploads proof, the order waits for admin review. Application status stays separate: pending, shortlisted, accepted or rejected.",
  },
];

const afterShortlist = [
  {
    title: "Admins can prepare a shortlist",
    body: "Admins review student profiles, set manual ranks and apply the verified badge when preparing a shortlist.",
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
    <div className="min-h-[100dvh] bg-[#eaf6f6] text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Hero — the three actions a visitor can take right now. */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid gap-8 py-7 lg:grid-cols-12 lg:gap-10 lg:py-10">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b5c5c]">
                  How it works
                </p>
                <h1 className="mt-2 text-[clamp(1.9rem,7.6vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0b2e2e]">
                  Three steps connect a brief to the work.
                </h1>
                <p className="mt-3 max-w-[46ch] text-[14px] leading-6 text-[#356464] sm:text-[15px] sm:leading-7">
                  A founder posts a scoped project with a budget. A student
                  applies with a profile and a CV. Both sides then work from
                  the same written brief.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <MarketButton href={CTA_HREFS.signup} variant="primary">
                    {CTA_LABELS.signup}
                  </MarketButton>
                  <MarketButton href={CTA_HREFS.studentProjects} variant="outline">
                    {CTA_LABELS.browseProjects}
                  </MarketButton>
                  <MarketButton href={FOUNDER_ACCESS.href} variant="outline">
                    {FOUNDER_ACCESS.label}
                  </MarketButton>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Photo
                  src="/images/thimphu-city-clean.webp"
                  alt="Handicraft shops along Norzin Lam road in Thimphu"
                  ratio="aspect-[16/10] lg:aspect-[4/5]"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  preload
                />
              </div>
            </div>
          </div>
        </section>

        <TrustBar>
          {"Human verification · Paid in Ngultrum · No bidding wars · Built in Bhutan"}
        </TrustBar>

        {/* The three steps — early and compact. */}
        <Section labelledBy="how-steps-heading">
          <SectionHeading
            id="how-steps-heading"
            eyebrow="The process"
            title="Three steps, one clear brief"
            lead="Each step keeps the scope, the budget and the deadline visible to everyone involved."
          />
          <div className="mt-5">
            <StepCards steps={steps} />
          </div>
        </Section>

        {/* The brief, from both sides. */}
        <Section tone="mist" labelledBy="how-brief-heading">
          <SectionHeading
            id="how-brief-heading"
            eyebrow="The brief"
            title="Founders set the brief. Students apply to the brief."
            lead="Two views of the same written project, so nobody works from a vague message."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {briefColumns.map((column) => (
              <div
                key={column.heading}
                className="rounded-[4px] border border-[#b9dede] bg-white p-4 sm:p-5"
              >
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
                  {column.heading}
                </h3>
                <ul className="mt-2">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="border-b border-[#b9dede] py-2.5 text-[13px] leading-6 text-[#0b2e2e] last:border-b-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Application status. */}
        <Section labelledBy="how-status-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <SectionHeading
                id="how-status-heading"
                eyebrow="Application status"
                title="You always know where an application stands"
                lead="The same four statuses are used by the student and the founder."
              />
              <div className="mt-5">
                <CheckList
                  items={[
                    "Pending: the application is with the founder.",
                    "Shortlisted: the founder kept the profile and can open the CV.",
                    "Accepted: the student was selected for the project.",
                    "Rejected: the application was closed for that project.",
                  ]}
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[4px] border border-[#b9dede] bg-white p-4 sm:p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
                  Who does what
                </h3>
                <dl className="mt-2">
                  <FactRow
                    term="Founder"
                    detail="Posts the brief, reviews applicants, updates applicant status, and agrees the work and the budget in Ngultrum."
                  />
                  <FactRow
                    term="Student"
                    detail="Completes the profile, uploads a PDF CV, browses open projects, applies, and follows each application status."
                  />
                  <FactRow
                    term="Admin"
                    detail="Checks identities, colleges and CVs by hand, and confirms payment before a shortlist is released."
                  />
                </dl>
              </div>
            </div>
          </div>
        </Section>

        {/* Protections. */}
        <Section tone="mist" labelledBy="how-care-heading">
          <SectionHeading
            id="how-care-heading"
            eyebrow="Both sides protected"
            title="The rules that keep the process fair"
            lead="A few clear rules keep the documents private and the payment honest."
          />
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {protections.map((rule) => (
              <li
                key={rule.title}
                className="rounded-[4px] border border-[#b9dede] bg-white p-4"
              >
                <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#0b2e2e]">
                  {rule.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-6 text-[#356464]">
                  {rule.body}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {/* After a shortlist. */}
        <Section labelledBy="how-after-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <SectionHeading
                id="how-after-heading"
                eyebrow="After a shortlist"
                title="What happens once a shortlist is ready"
                lead="The handoff stays explicit so founders and students know where they stand."
              />
              <ul className="mt-5 grid gap-3">
                {afterShortlist.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-[4px] border border-[#b9dede] bg-white p-4"
                  >
                    <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#0b2e2e]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-[#356464]">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6">
              <Photo
                src="/images/thimphu-hills.jpg"
                alt="Thimphu's main road with the valley hills behind"
                ratio="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <p className="mt-3 text-[12px] leading-5 text-[#356464]">
                Bhutan Tech Connect connects Bhutanese students with startup
                founders. These photographs show Bhutanese places, not platform
                listings or members.
              </p>
            </div>
          </div>
        </Section>

        {/* Closing. */}
        <Section tone="deep">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[clamp(1.35rem,3.6vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-white">
                Start with one paid project.
              </h2>
              <p className="mt-2 max-w-[52ch] text-[14px] leading-6 text-[#eaf6f6]/80">
                Create a student account, or ask about founder access.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <MarketButton href={CTA_HREFS.signup} variant="onDeepSolid">
                {CTA_LABELS.signup}
              </MarketButton>
              <MarketButton href={CTA_HREFS.contact} variant="onDeep">
                {CTA_LABELS.contact}
              </MarketButton>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
