import { Bank, ReadCvLogo, Storefront } from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import {
  MinimalActions,
  MinimalCheckList,
  MinimalClosingAction,
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
  SITE,
} from "@/components/marketing/nav";
import { PACKAGES, PAYMENT_CONFIGURED } from "@/config/payment";
import { getLiveContext } from "@/lib/data/world-bank";
import { formatNuAmount } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Paid project work for Bhutanese students",
  description:
    "Founders post a clear brief and budget. Students apply with skills and a CV. Admins verify people by hand — not by algorithm.",
  path: "/public",
});

const steps = [
  {
    title: "Post a brief or browse projects",
    body: "Founders post the scope, budget in Nu and deadline. Students browse open projects in their workspace.",
  },
  {
    title: "Apply with a profile and CV",
    body: "Students apply with a complete profile and a PDF CV. One application per project, so nothing is duplicated.",
  },
  {
    title: "Shortlist and agree the work",
    body: "Founders review applicants, shortlist students, and agree the budget and payment in Ngultrum.",
  },
] as const;

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

const founderControls = [
  "A written brief with scope, skills, budget in Nu and deadline",
  "Applicants you can compare side by side, with private CV links",
  "An optional ranked shortlist when you would rather not sort it yourself",
  "Payment confirmed by an admin before a shortlist is released",
] as const;

/** Context loads separately so a slow public API never holds the page back. */
async function LocalContextSection() {
  const liveContext = await getLiveContext();
  const youth = liveContext.indicators.find(
    (indicator) => indicator.code === "SL.UEM.1524.ZS",
  );

  return (
    <MinimalSection titleId="home-context-heading" title="Why this exists">
      <div className="max-w-[52rem] space-y-5">
        <p className="text-[1.0625rem] leading-[1.6] text-foreground">
          Bhutan Tech Connect is a matching layer for local work: scoped briefs, human
          verification and payment in Ngultrum. It does not replace study, and it does not
          promise a job on its own.
        </p>
        {youth ? (
          <p className="text-[1.0625rem] leading-[1.6] text-muted-foreground">
            The latest World Bank figure for youth unemployment in Bhutan is{" "}
            <strong className="font-medium text-foreground">{youth.displayValue}</strong> (
            {youth.year}). That is national context, not a Bhutan Tech Connect result. Source:
            World Bank, World Development Indicators.
          </p>
        ) : (
          <p className="text-[1.0625rem] leading-[1.6] text-muted-foreground">
            The World Bank figure is unavailable right now. The platform does not depend on it.
            Source: World Bank, World Development Indicators.
          </p>
        )}
      </div>
    </MinimalSection>
  );
}

function LocalContextFallback() {
  return (
    <MinimalSection titleId="home-context-fallback-heading" title="Why this exists">
      <p className="max-w-[52rem] text-[1.0625rem] leading-[1.6] text-muted-foreground">
        Bhutan Tech Connect is a matching layer for local work: scoped briefs, human
        verification and payment in Ngultrum. Official national statistics load separately,
        so the rest of the page does not wait for them.
      </p>
    </MinimalSection>
  );
}

export default function PublicHomePage() {
  return (
    <>
      <MinimalHero
        title="Paid project work, built in Bhutan."
        description="Founders post a brief, students apply with a profile and CV, and an admin verifies every person by hand."
        actions={
          <MinimalActions>
            <PrimaryAction href={CTA_HREFS.signup} label={CTA_LABELS.signup} />
            <TextAction href={CTA_HREFS.studentProjects} label={CTA_LABELS.browseProjects} />
            <TextAction href={FOUNDER_ACCESS.href} label={FOUNDER_ACCESS.label} />
          </MinimalActions>
        }
        note="Browsing projects needs a student account. Founder access is set up by an admin."
        media={
          <MinimalMedia
            icon={Storefront}
            label="A clear brief, a verified student, and payment in Ngultrum."
          />
        }
      />

      <div className="content-shell">
        <TrustLine>{SITE.trustLine}</TrustLine>
      </div>

      <MinimalEditorialSection
        id="steps"
        titleId="home-steps-heading"
        title="Three steps from brief to work"
        description="No bidding war and no automatic ranking. A person checks the profile and the project."
      >
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <MinimalSteps steps={steps} className="w-full" />
          <TextAction href={CTA_HREFS.howItWorks} label={CTA_LABELS.seeHow} />
        </div>
      </MinimalEditorialSection>

      <MinimalSection
        id="students"
        titleId="home-students-heading"
        title="A clear path from account to application"
        description="Everything happens in the student workspace, and you can see where each application stands."
      >
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <MinimalSteps steps={studentPath} />
          <div>
            <MinimalMedia
              icon={ReadCvLogo}
              label="One profile and one CV, ready for the right project."
            />
            <p className="quiet-note mt-4">
              Students build the profile once, then apply to projects that fit their course and
              their free time.
            </p>
            <TextAction
              href={CTA_HREFS.forStudents}
              label={CTA_LABELS.studentPath}
              className="mt-6"
            />
          </div>
        </div>
      </MinimalSection>

      <MinimalEditorialSection
        id="founders"
        titleId="home-pricing-heading"
        title="Shortlist packages, priced in Nu"
        description="Posting and reviewing applicants is the normal path. A ranked shortlist is optional and priced separately."
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="space-y-8">
              <MinimalPackage id="basic" />
              <MinimalPackage id="full" />
            </div>
            <p className="mt-8 max-w-[52rem] text-[1rem] leading-[1.6] text-muted-foreground">
              Pay by bank transfer or mBoB, upload the screenshot, and an admin confirms it
              before the shortlist is released.
              {!PAYMENT_CONFIGURED
                ? " Shortlist orders are unavailable right now: the bank and mBoB details have not been published yet, so the amounts above are the intended prices."
                : ""}
            </p>
            <MinimalActions className="mt-6">
              <TextAction href={CTA_HREFS.founderPricing} label={CTA_LABELS.pricing} />
              <TextAction href={CTA_HREFS.founderPostProject} label={CTA_LABELS.postProject} />
            </MinimalActions>
          </div>
          <div>
            <MinimalMedia
              icon={Bank}
              label="Bank transfer or mBoB, confirmed by an admin."
            />
            <h3 className="mt-8 text-[1.375rem] font-semibold tracking-[-0.02em]">
              What a founder controls
            </h3>
            <MinimalCheckList items={founderControls} className="mt-4" />
          </div>
        </div>
      </MinimalEditorialSection>

      <div id="context" className="scroll-mt-chapter">
        <Suspense fallback={<LocalContextFallback />}>
          <LocalContextSection />
        </Suspense>
      </div>

      <MinimalClosingAction
        title="Start with one clear brief."
        description={`Create a student account, or ask about founder access. Shortlist packages start at ${formatNuAmount(PACKAGES.basic.defaultAmount)}.`}
        primaryLabel={CTA_LABELS.students}
        primaryHref={CTA_HREFS.forStudents}
        secondaryLabel={CTA_LABELS.founders}
        secondaryHref={CTA_HREFS.forFounders}
      />
    </>
  );
}
