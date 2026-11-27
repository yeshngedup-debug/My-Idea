import {
  Handshake,
  ListChecks,
  LockKey,
  NotePencil,
  Path,
  ShieldCheck,
  Signpost,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import {
  MinimalActions,
  MinimalCheckList,
  MinimalClosingAction,
  MinimalEditorialSection,
  MinimalFacts,
  MinimalHero,
  MinimalMedia,
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
  SITE,
} from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description:
    "Three steps: a founder posts a scoped project, a student applies with a profile and CV, and both sides work from the same brief.",
  path: "/how-it-works",
});

/**
 * The promise is three steps. Keep this tuple at three so the public page
 * cannot grow a fourth step by accident.
 */
const steps = [
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
] as const;

const briefFacts = [
  { term: "Scope", detail: "What the founder wants built or done, in plain language." },
  { term: "Budget", detail: "A range in Nu, agreed before the work starts." },
  { term: "Duration", detail: "How long the project should take." },
  { term: "Skills", detail: "The skills needed for the work." },
  { term: "Deadline", detail: "The apply-by date." },
  { term: "Work mode", detail: "Remote, on site, or either." },
] as const;

const statuses = [
  "Pending: the application is with the founder.",
  "Shortlisted: the founder kept the profile and can open the CV.",
  "Accepted: the student was selected for the project.",
  "Rejected: the application was closed for that project.",
] as const;

const roles = [
  {
    term: "Founder",
    detail:
      "Posts the brief, reviews applicants, updates applicant status, and agrees the work and the budget in Ngultrum.",
  },
  {
    term: "Student",
    detail:
      "Completes the profile, uploads a PDF CV, browses open projects, applies, and follows each application status.",
  },
  {
    term: "Admin",
    detail:
      "Checks identities, colleges and CVs by hand, and confirms payment before a shortlist is released.",
  },
] as const;

const protections = [
  {
    term: "Payment is confirmed by an admin",
    detail:
      "Shortlist orders are paid by bank transfer or mBoB. The founder uploads a screenshot and an admin confirms it before the order counts as paid.",
  },
  {
    term: "CVs stay private",
    detail:
      "Student CVs live in a private store and open only through short-lived signed links for admins, founders whose project received the application, or founders who shortlisted the student under a confirmed paid order.",
  },
  {
    term: "Founders cannot confirm their own payments",
    detail:
      "After a founder uploads proof, the order waits for admin review. Application status stays separate: pending, shortlisted, accepted or rejected.",
  },
] as const;

const afterShortlist = [
  {
    term: "Admins prepare the shortlist",
    detail:
      "Admins review student profiles, set manual ranks and apply the verified badge when preparing a shortlist.",
  },
  {
    term: "Founders review the paid shortlist",
    detail:
      "Once payment is confirmed, the founder can review the shortlist in the workspace after an admin prepares it.",
  },
  {
    term: "Statuses show the next move",
    detail:
      "Founders move applications from pending to shortlisted, then to accepted or rejected. They can reject a pending application directly.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <MinimalHero
        eyebrow="How it works"
        title="Three steps connect a brief to the work."
        description="A founder posts a scoped project with a budget. A student applies with a profile and a CV. Both sides then work from the same written brief."
        actions={
          <MinimalActions>
            <PrimaryAction href={CTA_HREFS.signup} label={CTA_LABELS.signup} />
            <TextAction
              href={CTA_HREFS.studentProjects}
              label={CTA_LABELS.browseProjects}
            />
            <TextAction href={FOUNDER_ACCESS.href} label={FOUNDER_ACCESS.label} />
          </MinimalActions>
        }
        media={
          <MinimalMedia
            icon={Path}
            label="Brief, application and shortlist stay tied to one written project."
          />
        }
      />

      <div className="border-y border-border">
        <div className="content-shell py-6">
          <TrustLine>{SITE.trustLine}</TrustLine>
        </div>
      </div>

      <MinimalEditorialSection
        icon={Path}
        titleId="how-steps-heading"
        title="Three steps, one clear brief"
        description="Each step keeps the scope, the budget and the deadline visible to everyone involved."
        motionKey="steps"
      >
        <MinimalSteps steps={steps} />
      </MinimalEditorialSection>

      <MinimalSection
        icon={NotePencil}
        titleId="how-brief-heading"
        title="Founders set the brief. Students apply to the brief."
        description="Two views of the same written project, so nobody works from a vague message."
        motionKey="brief"
      >
        <MinimalFacts items={briefFacts} motionKey="brief-facts" />
      </MinimalSection>

      <MinimalEditorialSection
        icon={ListChecks}
        titleId="how-status-heading"
        title="You always know where an application stands"
        description="The same four statuses are used by the student and the founder."
        motionKey="status"
      >
        <h3 className="text-[1.375rem] font-semibold tracking-[-0.02em]">
          Application status
        </h3>
        <div className="mt-5">
          <MinimalCheckList items={statuses} motionKey="status-list" />
        </div>
        <h3 className="mt-12 text-[1.375rem] font-semibold tracking-[-0.02em]">
          Who does what
        </h3>
        <div className="mt-5 max-w-[54rem]">
          <MinimalFacts items={roles} motionKey="role-facts" />
        </div>
      </MinimalEditorialSection>

      <MinimalSection
        icon={LockKey}
        titleId="how-care-heading"
        title="The rules that keep the process fair"
        description="A few clear rules keep the documents private and the payment honest."
        motionKey="care"
      >
        <div className="max-w-[54rem]">
          <MinimalFacts items={protections} motionKey="care-facts" />
        </div>
      </MinimalSection>

      <MinimalSection
        icon={Handshake}
        tone="muted"
        titleId="how-after-heading"
        title="What happens once a shortlist is ready"
        description="The handoff stays explicit so founders and students know where they stand."
        motionKey="after"
      >
        <div className="max-w-[54rem]">
          <MinimalFacts items={afterShortlist} motionKey="after-facts" />
        </div>
        <div className="mt-12 max-w-[52rem]">
          <MinimalMedia
            icon={ShieldCheck}
            label="Clear documents and payment rules keep the process fair."
            caption="These icons describe the platform workflow. They do not represent platform members or listings."
            motionKey="after-panel"
          />
        </div>
      </MinimalSection>

      <MinimalClosingAction
        icon={Signpost}
        tone="plain"
        title="Start with one paid project."
        description="Create a student account, or ask about founder access."
        primaryLabel={CTA_LABELS.signup}
        primaryHref={CTA_HREFS.signup}
        secondaryLabel={FOUNDER_ACCESS.label}
        secondaryHref={FOUNDER_ACCESS.href}
        motionKey="closing"
      />
    </>
  );
}
