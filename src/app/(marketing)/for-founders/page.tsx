import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  CheckList,
  FactRow,
  MarketButton,
  PackagePanel,
  Photo,
  Section,
  SectionHeading,
  StepCards,
  TrustBar,
  formatNu,
} from "@/components/marketing/marketplace";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
} from "@/components/marketing/nav";
import { PACKAGES, PAYMENT_CONFIGURED } from "@/config/payment";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "For founders",
  description:
    "Ask for founder access, post a scoped project brief with a budget in Ngultrum, review verified students, and order a ranked shortlist when you need one.",
  path: "/for-founders",
});

const hiringSteps = [
  {
    title: "Post a scoped brief",
    body: "Add the scope, the skills you need, the budget in Nu, the duration and an apply-by date.",
  },
  {
    title: "Review the applicants",
    body: "Compare verified student profiles, skills, colleges and availability. Open CVs under the access rules.",
  },
  {
    title: "Shortlist and agree the work",
    body: "Choose the students, agree the budget in Ngultrum, and keep both sides updated as work moves on.",
  },
] as const;

const controls = [
  "A written brief with scope, skills, budget in Nu and deadline",
  "Applicants side by side, with private CV links that expire",
  "Filters by skill, college and availability when you browse students",
  "Applicant status you control: pending, shortlisted, accepted or rejected",
  "Payment confirmed by an admin before a shortlist is released",
] as const;

const briefFields = [
  { term: "Scope", detail: "What is being built or done, in plain language." },
  { term: "Skills", detail: "The skills the work needs." },
  { term: "Budget", detail: "A minimum and maximum amount in Nu." },
  { term: "Duration", detail: "How long the project should take." },
  { term: "Deadline", detail: "The date applications close." },
  { term: "Work mode", detail: "Remote, onsite, or either." },
] as const;

const orderSteps = [
  "Choose Basic or Full Support from your founder account.",
  "Pay by bank transfer or mBoB and upload the screenshot.",
  "An admin confirms the payment and ranks the students.",
  "The shortlist is released in your founder workspace.",
] as const;

export default function ForFoundersPage() {
  return (
    <div className="min-h-[100dvh] bg-[#eaf6f6] text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Hero — the three founder actions are above the fold. */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid gap-8 py-7 lg:grid-cols-12 lg:gap-10 lg:py-10">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b5c5c]">
                  For founders
                </p>
                <h1 className="mt-2 text-[clamp(1.9rem,7.6vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0b2e2e]">
                  Post a clear brief. Hire students in Bhutan.
                </h1>
                <p className="mt-3 max-w-[46ch] text-[14px] leading-6 text-[#356464] sm:text-[15px] sm:leading-7">
                  Write the scope and the budget, then review verified students
                  by skill, college and availability. Order a ranked shortlist
                  when you would rather not sort it yourself.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <MarketButton href={FOUNDER_ACCESS.href} variant="primary">
                    {FOUNDER_ACCESS.label}
                  </MarketButton>
                  <MarketButton href={CTA_HREFS.pricing} variant="outline">
                    {CTA_LABELS.pricing}
                  </MarketButton>
                  <MarketButton href={CTA_HREFS.founderPostProject} variant="solid">
                    {CTA_LABELS.postProject}
                  </MarketButton>
                </div>
                <p className="mt-2.5 text-[12px] leading-5 text-[#356464]">
                  Founder accounts are set up by an admin, not by public signup.
                  Posting a project opens inside your founder account.
                </p>
              </div>

              <div className="lg:col-span-5">
                <Photo
                  src="/images/thimphu-bank-clean.webp"
                  alt="The Bhutan Post and Bhutan Bank building in central Thimphu"
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

        {/* How hiring works. */}
        <Section labelledBy="founders-steps-heading">
          <SectionHeading
            id="founders-steps-heading"
            eyebrow="How hiring works"
            title="Three steps from brief to a student on the job"
            lead="The shortlist is optional. The written brief is not."
            aside={
              <MarketButton href={CTA_HREFS.howItWorks} variant="quiet">
                {CTA_LABELS.seeHow}
              </MarketButton>
            }
          />
          <div className="mt-5">
            <StepCards steps={hiringSteps} />
          </div>
        </Section>

        {/* Brief fields and controls. */}
        <Section tone="mist" labelledBy="founders-brief-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <SectionHeading
                id="founders-brief-heading"
                eyebrow="The brief"
                title="What a project brief tells the student"
                lead="Every applicant starts from the same written scope, so you compare people instead of messages."
              />
              <div className="mt-5 rounded-[4px] border border-[#b9dede] bg-white p-4 sm:p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
                  What you write
                </h3>
                <dl className="mt-2">
                  {briefFields.map((field) => (
                    <FactRow
                      key={field.term}
                      term={field.term}
                      detail={field.detail}
                    />
                  ))}
                </dl>
              </div>
            </div>

            <div className="lg:col-span-5">
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#0b2e2e]">
                What you control
              </h3>
              <div className="mt-3">
                <CheckList items={controls} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <MarketButton
                  href={CTA_HREFS.founderPostProject}
                  variant="outline"
                >
                  {CTA_LABELS.postProject}
                </MarketButton>
              </div>
            </div>
          </div>
        </Section>

        {/* Pricing — real package values, in-page anchor target. */}
        <Section id="pricing" labelledBy="founders-pricing-heading">
          <SectionHeading
            id="founders-pricing-heading"
            eyebrow="Pricing"
            title="Ranked shortlist packages"
            lead="When you want a ranked list instead of sorting applicants yourself. Posting a brief and reviewing applicants does not need a package."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PackagePanel id="basic" />
            <PackagePanel id="full" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#0b2e2e]">
                How a shortlist order runs
              </h3>
              <div className="mt-3">
                <CheckList items={orderSteps} />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-[4px] border border-[#b9dede] bg-[#eaf6f6] p-4">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
                  Payment
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[#0b2e2e]">
                  Pay by bank transfer or mBoB, upload the screenshot, and an
                  admin confirms it before the shortlist is released. You
                  cannot confirm your own payment.
                </p>
                <p className="mt-3 border-t border-[#b9dede] pt-3 text-[13px] font-semibold text-[#0b2e2e]">
                  Basic {formatNu(PACKAGES.basic.defaultAmount)} · Full Support{" "}
                  {formatNu(PACKAGES.full.defaultAmount)}
                </p>
                {!PAYMENT_CONFIGURED ? (
                  <p
                    role="note"
                    className="mt-3 border-l-2 border-[#c2004b] bg-white px-3 py-2 text-[12px] leading-5 text-[#0b2e2e]"
                  >
                    Shortlist orders are unavailable right now. Bank and mBoB
                    details have not been published yet. The amounts above are
                    the intended prices.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <MarketButton href={FOUNDER_ACCESS.href} variant="outline">
              {FOUNDER_ACCESS.label}
            </MarketButton>
            <MarketButton href={CTA_HREFS.founderPostProject} variant="outline">
              {CTA_LABELS.postProject}
            </MarketButton>
          </div>
        </Section>

        {/* Local context photo band. */}
        <Section tone="deep">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
            <div className="lg:col-span-6">
              <h2 className="text-[clamp(1.35rem,3.6vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-white">
                Work that stays close to home.
              </h2>
              <p className="mt-2 max-w-[52ch] text-[14px] leading-6 text-[#eaf6f6]/80">
                Students can work remotely or on site, around their course and
                their exams. Budgets are set and discussed in Ngultrum, and the
                platform is built and run in Bhutan.
              </p>
            </div>
            <div className="lg:col-span-6">
              <Photo
                src="/images/thimphu-street.jpg"
                alt="A main road in central Thimphu"
                ratio="aspect-[16/10]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </Section>

        {/* Closing. */}
        <Section tone="deep" className="border-t border-white/15">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[clamp(1.35rem,3.6vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-white">
                Start with one scoped brief.
              </h2>
              <p className="mt-2 max-w-[52ch] text-[14px] leading-6 text-[#eaf6f6]/80">
                Tell us who you are and what you are building, and an admin
                will arrange founder access.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <MarketButton href={FOUNDER_ACCESS.href} variant="onDeepSolid">
                {FOUNDER_ACCESS.label}
              </MarketButton>
              <MarketButton href={CTA_HREFS.howItWorks} variant="onDeep">
                {CTA_LABELS.howItWorks}
              </MarketButton>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
