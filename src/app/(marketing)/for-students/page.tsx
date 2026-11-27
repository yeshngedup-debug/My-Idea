import { Bank, IdentificationCard, Student } from "@phosphor-icons/react/dist/ssr";
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
import { CTA_HREFS, CTA_LABELS, SITE } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "For students",
  description:
    "Create a student account, complete your profile, upload a CV, browse paid projects, apply, and track every application in one place.",
  path: "/for-students",
});

const studentPath = [
  {
    title: "Create your student account",
    body: "Sign up with your email and a password. The student workspace opens straight after.",
  },
  {
    title: "Complete your profile",
    body: "Name, college, course, year of study, availability, skills and a short bio.",
  },
  {
    title: "Upload a PDF CV",
    body: "PDF only, up to 5 MB. It stays private and opens through short-lived signed links.",
  },
  {
    title: "Browse open projects",
    body: "Read the scope, skills, budget range, deadline and work mode before you decide.",
  },
  {
    title: "Apply and track the status",
    body: "One application per project. Watch it move from pending to shortlisted, accepted or rejected.",
  },
] as const;

const profileFields = [
  { term: "Full name", detail: "The name founders see on your profile." },
  { term: "College and course", detail: "Where you study and what you study." },
  { term: "Year of study", detail: "The year you are in now." },
  { term: "Availability", detail: "When you can take on project work." },
  { term: "Your skills", detail: "The skills you can do the work with." },
  { term: "A short bio", detail: "A few lines about you." },
  { term: "A PDF CV", detail: "PDF only, up to 5 MB, stored privately." },
] as const;

const statusRows = [
  {
    term: "Pending",
    detail: "Your application is with the founder. Nothing is decided yet.",
  },
  {
    term: "Shortlisted",
    detail: "The founder kept your profile and can open your CV under the access rules.",
  },
  {
    term: "Accepted",
    detail: "The founder selected you for the project. Agree the scope and budget in Ngultrum.",
  },
  {
    term: "Rejected",
    detail: "The founder closed the application for this project. Other applications keep running.",
  },
] as const;

const payFacts = [
  "Every paid project lists a budget range before you apply.",
  "Work is agreed between you and the founder in Ngultrum.",
  "Bank transfer or mBoB are the normal payment routes in Bhutan.",
  "No bidding war: you send one application per project, not competing bids.",
] as const;

export default function ForStudentsPage() {
  return (
    <>
      <MinimalHero
        title="Turn your skills into paid project work."
        description="Build a profile once, upload your CV, then browse projects that fit your course and your free time."
        actions={
          <MinimalActions>
            <PrimaryAction href={CTA_HREFS.signup} label={CTA_LABELS.signup} />
            <TextAction href={CTA_HREFS.studentProjects} label={CTA_LABELS.browseProjects} />
          </MinimalActions>
        }
        note="Browsing projects needs a student account. You can log in at any time to continue an application."
        media={
          <MinimalMedia
            icon={Student}
            label="Your profile, CV and applications in one student workspace."
          />
        }
      />

      <div className="content-shell">
        <TrustLine>{SITE.trustLine}</TrustLine>
      </div>

      <MinimalEditorialSection
        id="path"
        titleId="students-path-heading"
        title="Five steps from sign-up to a tracked application"
        description="Everything happens in the student workspace, and you can see where each application stands."
      >
        <MinimalSteps steps={studentPath} />
      </MinimalEditorialSection>

      <MinimalSection
        id="profile"
        titleId="students-profile-heading"
        title="What a complete profile holds"
        description="A complete profile and CV help founders decide. Fill in what you can and finish it later."
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <MinimalFacts items={profileFields} />
            <p className="quiet-note mt-6">
              Your CV is shared only through short-lived signed links, and only with the people
              the access rules allow.
            </p>
          </div>
          <MinimalMedia
            icon={IdentificationCard}
            label="A complete profile tells founders how you fit the brief."
          />
        </div>
        <MinimalActions className="mt-8">
          <PrimaryAction href={CTA_HREFS.signup} label={CTA_LABELS.signup} />
        </MinimalActions>
      </MinimalSection>

      <MinimalEditorialSection
        id="applications"
        titleId="students-status-heading"
        title="You always know where an application stands"
        description="Founders update applicant status as they review. You see the same status in your workspace."
      >
        <MinimalFacts items={statusRows} />
        <MinimalActions className="mt-8">
          <TextAction
            href={CTA_HREFS.studentApplications}
            label={CTA_LABELS.myApplications}
          />
        </MinimalActions>
      </MinimalEditorialSection>

      <MinimalSection
        id="pay"
        titleId="students-pay-heading"
        title="The budget is on the brief before you apply"
        description="You can see what a project pays and how long it should take before you send anything."
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <MinimalCheckList items={payFacts} />
          <MinimalMedia
            icon={Bank}
            label="The budget and payment route are shown before you apply."
          />
        </div>
      </MinimalSection>

      <MinimalClosingAction
        title="Your profile is the first step."
        description="Create the account, complete the profile, then apply to the projects that fit."
        primaryLabel={CTA_LABELS.signup}
        primaryHref={CTA_HREFS.signup}
        secondaryLabel={CTA_LABELS.howItWorks}
        secondaryHref={CTA_HREFS.howItWorks}
      />
    </>
  );
}
