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
} from "@/components/marketing/marketplace";
import { CTA_HREFS, CTA_LABELS } from "@/components/marketing/nav";
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
    <div className="min-h-[100dvh] bg-[#eaf6f6] text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Hero — the two student actions are above the fold. */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid gap-8 py-7 lg:grid-cols-12 lg:gap-10 lg:py-10">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b5c5c]">
                  For students
                </p>
                <h1 className="mt-2 text-[clamp(1.9rem,7.6vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0b2e2e]">
                  Turn your skills into paid project work.
                </h1>
                <p className="mt-3 max-w-[46ch] text-[14px] leading-6 text-[#356464] sm:text-[15px] sm:leading-7">
                  Build a profile once, upload your CV, then browse the open
                  projects and apply to the ones that fit your course and your
                  free time.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <MarketButton href={CTA_HREFS.signup} variant="primary">
                    {CTA_LABELS.signup}
                  </MarketButton>
                  <MarketButton href={CTA_HREFS.studentProjects} variant="outline">
                    {CTA_LABELS.browseProjects}
                  </MarketButton>
                </div>
                <p className="mt-2.5 text-[12px] leading-5 text-[#356464]">
                  Browsing open projects needs a student account. You can log in
                  at any time to continue an application.
                </p>
              </div>

              <div className="lg:col-span-5">
                <Photo
                  src="/images/bhutanese-students.jpg"
                  alt="Two young Bhutanese girls tending a water supply"
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

        {/* The concrete path. */}
        <Section labelledBy="students-path-heading">
          <SectionHeading
            id="students-path-heading"
            eyebrow="Your path"
            title="Five steps from sign-up to a tracked application"
            lead="Everything happens in the student workspace, and you can see where each application stands."
          />
          <div className="mt-5">
            <StepCards steps={studentPath} columns={2} />
          </div>
        </Section>

        {/* Profile fields. */}
        <Section tone="mist" labelledBy="students-profile-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <SectionHeading
                id="students-profile-heading"
                eyebrow="Your profile"
                title="What a complete profile holds"
                lead="A complete profile and CV help founders decide. Fill in what you can and finish it later."
              />
              <div className="mt-5">
                <MarketButton href={CTA_HREFS.signup} variant="outline">
                  {CTA_LABELS.signup}
                </MarketButton>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[4px] border border-[#b9dede] bg-white p-4 sm:p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
                  Student profile
                </h3>
                <dl className="mt-2">
                  {profileFields.map((field) => (
                    <FactRow
                      key={field.term}
                      term={field.term}
                      detail={field.detail}
                    />
                  ))}
                </dl>
                <p className="mt-3 text-[12px] leading-5 text-[#356464]">
                  Your CV is shared only through short-lived signed links, and
                  only with the people the access rules allow.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Application statuses. */}
        <Section labelledBy="students-status-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <SectionHeading
                id="students-status-heading"
                eyebrow="Track your applications"
                title="You always know where an application stands"
                lead="Founders update applicant status as they review. You see the same status in your workspace."
              />
              <div className="mt-5">
                <MarketButton
                  href={CTA_HREFS.studentApplications}
                  variant="outline"
                >
                  {CTA_LABELS.myApplications}
                </MarketButton>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[4px] border border-[#b9dede] bg-white p-4 sm:p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
                  Application status
                </h3>
                <dl className="mt-2">
                  {statusRows.map((row) => (
                    <FactRow
                      key={row.term}
                      term={row.term}
                      detail={row.detail}
                    />
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Section>

        {/* Pay. */}
        <Section tone="mist" labelledBy="students-pay-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <SectionHeading
                id="students-pay-heading"
                eyebrow="Pay"
                title="The budget is on the brief before you apply"
                lead="You can see what a project pays and how long it should take before you send anything."
              />
              <div className="mt-4">
                <CheckList items={payFacts} />
              </div>
            </div>
            <div className="lg:col-span-6">
              <Photo
                src="/images/thimphu-bank-clean.webp"
                alt="The Bhutan Post and Bhutan Bank building in central Thimphu"
                ratio="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <p className="mt-3 text-[12px] leading-5 text-[#356464]">
                Bhutanese banking, local payment routes, and work that can be
                done from a classroom, a hostel or a co-working desk.
              </p>
            </div>
          </div>
        </Section>

        {/* Closing. */}
        <Section tone="deep">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[clamp(1.35rem,3.6vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-white">
                Your profile is the first step.
              </h2>
              <p className="mt-2 max-w-[52ch] text-[14px] leading-6 text-[#eaf6f6]/80">
                Create the account, complete the profile, then apply to the
                projects that fit.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <MarketButton href={CTA_HREFS.signup} variant="onDeepSolid">
                {CTA_LABELS.signup}
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
