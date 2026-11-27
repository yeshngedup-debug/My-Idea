import { Suspense } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  CheckList,
  MarketButton,
  PackagePanel,
  Photo,
  Section,
  SectionHeading,
  StepCards,
  TrustBar,
  formatNu,
  type ThreeSteps,
} from "@/components/marketing/marketplace";
import { CTA_HREFS, CTA_LABELS, FOUNDER_ACCESS } from "@/components/marketing/nav";
import { PACKAGES, PAYMENT_CONFIGURED } from "@/config/payment";
import { pageMetadata } from "@/lib/metadata";
import { getLiveContext } from "@/lib/data/world-bank";

export const metadata = pageMetadata({
  title: "Paid project work for Bhutanese students",
  description:
    "Founders post a clear brief and budget. Students apply with skills and a CV. Admins verify people by hand — not by algorithm.",
  path: "/public",
});

/** The homepage promises three steps, so the list is typed as exactly three. */
const steps: ThreeSteps = [
  {
    title: "Post a brief or browse projects",
    body: "Founders post the scope, budget in Nu and deadline. Students browse the open projects in their workspace.",
  },
  {
    title: "Apply with a profile and CV",
    body: "Students apply with a complete profile and a PDF CV. One application per project, so nothing is duplicated.",
  },
  {
    title: "Shortlist and agree the work",
    body: "Founders review applicants, shortlist students, and agree the budget and payment in Ngultrum.",
  },
];

const studentPath = [
  {
    title: "Create your student account",
    body: "One account gives you the student workspace and the application tracker.",
  },
  {
    title: "Complete your profile",
    body: "Skills, college, course, year of study and when you are free to work.",
  },
  {
    title: "Upload a PDF CV",
    body: "PDF only, up to 5 MB. It stays private and opens through short-lived signed links.",
  },
  {
    title: "Browse open projects",
    body: "Read the scope, skills, budget range and deadline before you apply.",
  },
  {
    title: "Apply and track the status",
    body: "Follow each application from pending to shortlisted, accepted or rejected.",
  },
] as const;

/** What a founder keeps control of while hiring. */
const founderControls = [
  "A written brief with scope, skills, budget in Nu and deadline",
  "Applicants you can compare side by side, with private CV links",
  "An optional ranked shortlist when you would rather not sort it yourself",
  "Payment confirmed by an admin before a shortlist is released",
] as const;

/**
 * The national figure is context, not a platform result. It is fetched in its
 * own boundary so the marketplace content above it is never held back by a
 * slow or unavailable public statistics API.
 */
async function LocalContextSection() {
  const liveContext = await getLiveContext();
  const youth = liveContext.indicators.find(
    (indicator) => indicator.code === "SL.UEM.1524.ZS",
  );

  return (
    <Section id="context" tone="deep" labelledBy="home-context-heading">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <SectionHeading
            id="home-context-heading"
            eyebrow="Why it is built here"
            title="The talent is already local"
            tone="deep"
          />
          <p className="mt-4 max-w-[52ch] text-[14px] leading-7 text-[#eaf6f6]/85">
            Bhutan Tech Connect is a matching layer for local work: scoped
            briefs, human verification and payments in Ngultrum. It does not
            replace study, and it does not promise a job on its own.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-[4px] border border-white/20 bg-[#0b2e2e] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b9dede]">
              Youth unemployment · Bhutan
            </p>
            <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.04em] text-white">
              {youth?.displayValue ?? "—"}
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[#eaf6f6]/70">
              {youth
                ? `${youth.year} · ${youth.seriesNote}`
                : "Source unavailable right now"}
            </p>
            <p className="mt-4 border-t border-white/15 pt-3 text-[11px] leading-5 text-[#eaf6f6]/60">
              National indicator from the World Bank API, World Development
              Indicators. This is context, not a Bhutan Tech Connect result.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** The visible fallback while the public statistics API answers. */
function LocalContextFallback() {
  return (
    <Section id="context" tone="deep" labelledBy="home-context-heading">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <SectionHeading
            id="home-context-heading"
            eyebrow="Why it is built here"
            title="The talent is already local"
            tone="deep"
          />
          <p className="mt-4 max-w-[52ch] text-[14px] leading-7 text-[#eaf6f6]/85">
            Bhutan Tech Connect is a matching layer for local work: scoped
            briefs, human verification and payments in Ngultrum.
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="rounded-[4px] border border-white/20 bg-[#0b2e2e] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b9dede]">
              Youth unemployment · Bhutan
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#eaf6f6]/80">
              Loading the latest national figure from the World Bank API…
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function PublicHomePage() {
  return (
    <div className="min-h-[100dvh] bg-[#eaf6f6] text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Hero — both audiences get their next step before anything else. */}
        <section id="audience" className="bg-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid gap-8 py-7 lg:grid-cols-12 lg:gap-10 lg:py-10">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b5c5c]">
                  Bhutan Tech Connect · Thimphu
                </p>
                <h1 className="mt-2 text-[clamp(1.9rem,7.6vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0b2e2e]">
                  Paid project work for students in Bhutan.
                </h1>
                <p className="mt-3 max-w-[46ch] text-[14px] leading-6 text-[#356464] sm:text-[15px] sm:leading-7">
                  Founders post a brief with the scope, budget and deadline.
                  Students apply with their skills and a CV. An admin checks
                  every profile by hand.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="border-t-2 border-[#0b5c5c] pt-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b5c5c]">
                      For students
                    </h2>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <MarketButton href={CTA_HREFS.signup} variant="primary">
                        {CTA_LABELS.signup}
                      </MarketButton>
                      <MarketButton href={CTA_HREFS.studentProjects}>
                        {CTA_LABELS.browseProjects}
                      </MarketButton>
                    </div>
                    <p className="mt-2.5 text-[12px] leading-5 text-[#356464]">
                      Browsing open projects needs a student account.
                    </p>
                  </div>

                  <div className="border-t-2 border-[#0b5c5c] pt-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b5c5c]">
                      For founders
                    </h2>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <MarketButton href={FOUNDER_ACCESS.href} variant="solid">
                        {FOUNDER_ACCESS.label}
                      </MarketButton>
                      <MarketButton href={CTA_HREFS.founderPricing}>
                        {CTA_LABELS.pricing}
                      </MarketButton>
                      <MarketButton href={CTA_HREFS.founderPostProject}>
                        {CTA_LABELS.postProject}
                      </MarketButton>
                    </div>
                    <p className="mt-2.5 text-[12px] leading-5 text-[#356464]">
                      An admin sets up founder accounts. Posting opens inside
                      your founder account.
                    </p>
                  </div>
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

        <TrustBar id="trust">
          {"Human verification · Paid in Ngultrum · No bidding wars · Built in Bhutan"}
        </TrustBar>

        {/* How it works — exactly three steps, early and compact. */}
        <Section id="steps" labelledBy="home-steps-heading">
          <SectionHeading
            id="home-steps-heading"
            eyebrow="How it works"
            title="Three steps from brief to paid work"
            lead="No bidding war and no automatic ranking. A person checks the profile and the project."
            aside={
              <MarketButton href={CTA_HREFS.howItWorks} variant="quiet">
                {CTA_LABELS.seeHow}
              </MarketButton>
            }
          />
          <div className="mt-5">
            <StepCards steps={steps} />
          </div>
        </Section>

        {/* The student path. */}
        <Section id="place" labelledBy="home-students-heading">
          <SectionHeading
            id="home-students-heading"
            eyebrow="For students"
            title="Your path from account to application"
            lead="Everything happens in the student workspace, and you can see where each application stands."
            aside={
              <MarketButton href={CTA_HREFS.forStudents} variant="quiet">
                {CTA_LABELS.studentPath}
              </MarketButton>
            }
          />
          <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <StepCards steps={studentPath} columns={2} />
            </div>
            <div className="lg:col-span-5">
              <Photo
                src="/images/bhutanese-students.jpg"
                alt="Two young Bhutanese girls tending a water supply"
                ratio="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <p className="mt-3 text-[12px] leading-5 text-[#356464]">
                Bhutanese students and graduates build the profile once, then
                apply to the projects that fit their course and their free
                time.
              </p>
            </div>
          </div>
        </Section>

        {/* Founder pricing, from the real package configuration. */}
        <Section tone="mist" labelledBy="home-pricing-heading">
          <SectionHeading
            id="home-pricing-heading"
            eyebrow="For founders"
            title="Shortlist packages, priced in Nu"
            lead="Posting and reviewing applicants is the normal path. A ranked shortlist is optional and priced separately."
          />
          <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <div className="grid gap-3 sm:grid-cols-2">
                <PackagePanel id="basic" />
                <PackagePanel id="full" />
              </div>
              <p className="mt-4 max-w-[72ch] text-[13px] leading-6 text-[#356464]">
                Pay by bank transfer or mBoB, upload the screenshot, and an
                admin confirms it before the shortlist is released.
                {!PAYMENT_CONFIGURED
                  ? " Shortlist orders are unavailable right now: the bank and mBoB details have not been published yet, so the amounts above are the intended prices."
                  : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <MarketButton href={CTA_HREFS.founderPricing} variant="outline">
                  {CTA_LABELS.pricing}
                </MarketButton>
                <MarketButton href={CTA_HREFS.founderPostProject} variant="outline">
                  {CTA_LABELS.postProject}
                </MarketButton>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Photo
                src="/images/thimphu-bank-clean.webp"
                alt="The Bhutan Post and Bhutan Bank building in central Thimphu"
                ratio="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.02em] text-[#0b2e2e]">
                What a founder controls
              </h3>
              <div className="mt-2">
                <CheckList items={founderControls} />
              </div>
            </div>
          </div>
        </Section>

        <Suspense fallback={<LocalContextFallback />}>
          <LocalContextSection />
        </Suspense>

        {/* Closing strip — deep teal, no magenta: the emphasis already used
            the hero action. */}
        <Section tone="deep">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[clamp(1.35rem,3.6vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-white">
                Start with one clear brief.
              </h2>
              <p className="mt-2 max-w-[52ch] text-[14px] leading-6 text-[#eaf6f6]/80">
                Create a student account, or ask about founder access. Shortlist
                packages start at {formatNu(PACKAGES.basic.defaultAmount)}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <MarketButton href={CTA_HREFS.forStudents} variant="onDeepSolid">
                {CTA_LABELS.students}
              </MarketButton>
              <MarketButton href={CTA_HREFS.forFounders} variant="onDeep">
                {CTA_LABELS.founders}
              </MarketButton>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
