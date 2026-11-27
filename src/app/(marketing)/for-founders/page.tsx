import {
  ClipboardText,
  CurrencyCircleDollar,
  Handshake,
  ListChecks,
  MapPin,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import {
  MinimalActions,
  MinimalCheckList,
  MinimalClosingAction,
  MinimalEditorialCards,
  MinimalEditorialSection,
  MinimalHero,
  MinimalMedia,
  MinimalPackage,
  MinimalSection,
  MinimalSteps,
  PrimaryAction,
  TextAction,
  TrustLine,
} from "@/components/marketing/minimal-system";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
  resolveAction,
  SITE,
} from "@/components/marketing/nav";
import { PAYMENT_CONFIGURED } from "@/config/payment";
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

const briefFields = [
  { term: "Scope", detail: "What is being built or done, in plain language." },
  { term: "Skills", detail: "The skills the work needs." },
  { term: "Budget", detail: "A minimum and maximum amount in Nu." },
  { term: "Duration", detail: "How long the project should take." },
  { term: "Deadline", detail: "The date applications close." },
  { term: "Work mode", detail: "Remote, onsite, or either." },
] as const;

const controls = [
  "A written brief with scope, skills, budget in Nu and deadline",
  "Applicants side by side, with private CV links that expire",
  "Filters by skill, college and availability when you browse students",
  "Applicant status you control: pending, shortlisted, accepted or rejected",
  "Payment confirmed by an admin before a shortlist is released",
] as const;

const orderSteps = [
  "Choose Basic or Full Support from your founder account.",
  "Pay by bank transfer or mBoB and upload the screenshot.",
  "An admin confirms the payment and ranks the students.",
  "The shortlist is released in your founder workspace.",
] as const;

export default function ForFoundersPage() {
  return (
    <>
      <MinimalHero
        eyebrow="For founders"
        title="Post a brief. Find students in Bhutan."
        description="Write the scope and the budget, then review verified students by skill, college and availability. Order a ranked shortlist when you would rather not sort it yourself."
        actions={
          <MinimalActions className="mt-8">
            <PrimaryAction href={FOUNDER_ACCESS.href} label={FOUNDER_ACCESS.label} />
            <TextAction
              href={resolveAction("/for-founders", "pricing").href}
              label={CTA_LABELS.pricing}
            />
            <TextAction
              href={CTA_HREFS.founderPostProject}
              label={CTA_LABELS.postProject}
            />
          </MinimalActions>
        }
        note="Founder accounts are assigned by an admin, not by public signup. Posting a project opens inside your founder account."
        media={
          <MinimalMedia
            icon={ClipboardText}
            label="One written brief, one clear budget, one shortlist when needed."
          />
        }
      />

      <div className="border-y border-border">
        <div className="content-shell py-6">
          <TrustLine>{SITE.trustLine}</TrustLine>
        </div>
      </div>

      <MinimalEditorialSection
        icon={ListChecks}
        titleId="founders-steps-heading"
        title="Three steps from brief to work"
        description="The shortlist is optional. The written brief is not."
        motionKey="steps"
      >
        <MinimalSteps steps={hiringSteps} motionKey="steps-items" />
      </MinimalEditorialSection>

      <MinimalSection
        icon={NotePencil}
        titleId="founders-brief-heading"
        title="A brief that is easy to compare"
        description="Every applicant starts from the same written scope, so you compare people instead of messages."
        motionKey="brief"
      >
        <h3 className="text-[1.375rem] font-semibold tracking-[-0.02em]">
          What you write
        </h3>
        <div className="mt-5">
          <MinimalEditorialCards
            items={briefFields.map((field, index) => ({
              label: String(index + 1).padStart(2, "0"),
              title: field.term,
              body: field.detail,
            }))}
            motionKey="brief-cards"
          />
        </div>
        <h3 className="mt-12 text-[1.375rem] font-semibold tracking-[-0.02em]">
          What you control
        </h3>
        <div className="mt-5">
          <MinimalCheckList items={controls} motionKey="controls" />
        </div>
      </MinimalSection>

      <MinimalEditorialSection
        id="pricing"
        icon={CurrencyCircleDollar}
        titleId="founders-pricing-heading"
        title="Ranked shortlist packages"
        description="When you want a ranked list instead of sorting applicants yourself. Posting a brief and reviewing applicants does not need a package."
      >
        <div data-motion-section="pricing-content" className="max-w-[52rem]">
          <MinimalPackage id="basic" motionKey="pricing-packages" />
          <MinimalPackage id="full" motionKey="pricing-packages" />

          <h3 className="mt-12 text-[1.375rem] font-semibold tracking-[-0.02em]">
            How a shortlist order runs
          </h3>
          <div className="mt-5">
            <MinimalCheckList items={orderSteps} motionKey="order-steps" />
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <h3 className="text-[1.125rem] font-medium">Payment</h3>
            <p className="mt-3 max-w-[44rem] text-[1.0625rem] leading-[1.6] text-muted-foreground">
              Pay by bank transfer or mBoB, upload the screenshot, and an admin
              confirms it before the shortlist is released. You cannot confirm
              your own payment.
            </p>
            {!PAYMENT_CONFIGURED ? (
              <p role="note" className="quiet-note mt-4 max-w-[44rem]">
                Shortlist orders are unavailable right now. Bank and mBoB
                details have not been published yet. The amounts above are the
                intended prices.
              </p>
            ) : null}
          </div>
        </div>
      </MinimalEditorialSection>

      <MinimalSection
        icon={MapPin}
        titleId="founders-local-heading"
        title="Work that stays close to home"
        description="Students can work remotely or on site, around their course and their exams. Budgets are set and discussed in Ngultrum, and the platform is built and run in Bhutan."
        wide
        motionKey="local"
      >
        <MinimalMedia
          icon={MapPin}
          label="Remote or on-site work, with budgets in Ngultrum."
          motionKey="local-panel"
        />
      </MinimalSection>

      <MinimalClosingAction
        icon={Handshake}
        title="Start with one scoped brief."
        description="Tell us who you are and what you are building, and an admin will arrange founder access."
        primaryLabel={FOUNDER_ACCESS.label}
        primaryHref={FOUNDER_ACCESS.href}
        secondaryLabel={CTA_LABELS.howItWorks}
        secondaryHref={CTA_HREFS.howItWorks}
        motionKey="closing"
      />
    </>
  );
}
