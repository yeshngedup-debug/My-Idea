import {
  Bank,
  ChartLineUp,
  Files,
  Handshake,
  Info,
  ReadCvLogo,
  ShieldCheck,
  Signpost,
  Storefront,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { LiveContext } from "@/components/data/live-context";
import {
  LOCAL_BRIDGE_DIFFERENCES,
  LOCAL_BRIDGE_HEADLINE,
} from "@/components/brand/local-bridge-differences";
import {
  MinimalActions,
  MinimalClosingAction,
  MinimalFacts,
  MinimalHero,
  MinimalMedia,
  MinimalSection,
  PrimaryAction,
  TextAction,
} from "@/components/marketing/minimal-system";
import { CTA_HREFS, CTA_LABELS } from "@/components/marketing/nav";
import {
  CONTEXT_FACTS,
  CONTEXT_QUOTE,
  LIVE_DATA_SOURCE,
  WORLD_BANK_SOURCE,
  YOUTH_UNEMPLOYMENT,
} from "@/data/landing";
import { getLiveContext } from "@/lib/data/world-bank";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Why Bhutan Tech Connect exists: a practical local bridge between Bhutanese students and startup founders, grounded in the national opportunity context.",
  path: "/about",
});

const verification = [
  {
    term: "Identity and institution details",
    detail: "An admin checks the identity and institution details on the student profile.",
  },
  {
    term: "CV review",
    detail: "The admin reads the uploaded CV.",
  },
  {
    term: "Rank and verified badge",
    detail: "The admin sets the profile rank and applies the verified badge.",
  },
] as const;

const platformIcons = [
  {
    icon: Storefront,
    label: "A written brief from a founder.",
  },
  {
    icon: ReadCvLogo,
    label: "A student profile and CV.",
  },
  {
    icon: Bank,
    label: "Payment in Ngultrum.",
  },
  {
    icon: ShieldCheck,
    label: "Human verification by an admin.",
  },
] as const;

export default async function AboutPage() {
  const liveContext = await getLiveContext();

  return (
    <>
      <MinimalHero
        title="Paid project work for Bhutanese students."
        description="A local bridge between students and founders: paid project work, written down, checked by people."
        actions={
          <MinimalActions>
            <PrimaryAction
              href={CTA_HREFS.home}
              label={CTA_LABELS.explorePlatform}
            />
            <TextAction
              href={CTA_HREFS.howItWorks}
              label={CTA_LABELS.seeHow}
            />
          </MinimalActions>
        }
        media={
          <MinimalMedia
            icon={UsersThree}
            label="A local bridge between students and founders."
          />
        }
      />

      <MinimalSection
        icon={ChartLineUp}
        tone="muted"
        titleId="about-context-heading"
        title="Young people need work close to home"
        description="A practical first step for students and founders, set against the national picture."
        motionKey="context"
      >
        <div className="max-w-[46rem] border-t border-border pt-7">
          <p className="text-[clamp(3.5rem,8vw,6rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            {YOUTH_UNEMPLOYMENT.value}
          </p>
          <h3 className="mt-5 text-[1.375rem] font-semibold tracking-[-0.02em]">
            {YOUTH_UNEMPLOYMENT.label}
          </h3>
          <p className="quiet-note mt-3">
            {YOUTH_UNEMPLOYMENT.note} National figures, not platform results.
          </p>
        </div>

        <div className="mt-12 max-w-[54rem]">
          <MinimalFacts
            items={CONTEXT_FACTS.map((fact) => ({
              term: (
                <span>
                  <span className="tabular-nums">{fact.value}</span> ·{" "}
                  {fact.label}
                </span>
              ),
              detail: fact.note,
            }))}
            motionKey="context-facts"
          />
        </div>

        <blockquote className="mt-12 max-w-[44rem] text-[1.375rem] font-medium leading-[1.45] tracking-[-0.02em]">
          &ldquo;{CONTEXT_QUOTE.text}&rdquo;
          <footer className="quiet-note mt-4 not-italic">
            {CONTEXT_QUOTE.author}
          </footer>
        </blockquote>

        <p className="quiet-note mt-8 max-w-[44rem]">
          Source:{" "}
          <a
            href={WORLD_BANK_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-primary"
          >
            {WORLD_BANK_SOURCE.label}
          </a>
          . National figures, not platform results.
        </p>
      </MinimalSection>

      <MinimalSection
        icon={Info}
        tone="plain"
        titleId="about-official-heading"
        title="Official statistics"
        description="Annual releases and modeled estimates, not real-time data."
        motionKey="official"
      >
        <details className="max-w-[54rem] border-t border-border pt-6">
          <summary className="cursor-pointer font-medium text-primary transition-colors duration-150 hover:text-foreground">
            View the official statistics
          </summary>
          <div className="mt-8">
            <LiveContext initial={liveContext} variant="full" />
          </div>
        </details>
        <p className="quiet-note mt-6 max-w-[54rem]">
          {LIVE_DATA_SOURCE.attribution} The page checks the server every ten
          minutes; the server refreshes the datasets hourly. The “checked at”
          timestamp shows the age of the data.
        </p>
      </MinimalSection>

      <MinimalSection
        icon={Handshake}
        tone="muted"
        titleId="about-bridge-heading"
        title={LOCAL_BRIDGE_HEADLINE}
        description="Students and founders meet around paid project work. The platform holds the brief, the applications and the shortlist."
        motionKey="bridge"
      >
        <div className="max-w-[54rem]">
          <MinimalFacts
            items={LOCAL_BRIDGE_DIFFERENCES.map((item) => ({
              term: item.label,
              detail: item.sentence,
            }))}
            motionKey="bridge-facts"
          />
        </div>
        <MinimalActions>
          <TextAction
            href={CTA_HREFS.howItWorks}
            label={CTA_LABELS.seeHow}
          />
          <TextAction href={CTA_HREFS.faq} label={CTA_LABELS.faq} />
        </MinimalActions>
      </MinimalSection>

      <MinimalSection
        icon={ShieldCheck}
        tone="plain"
        titleId="about-verification-heading"
        title="How we verify students"
        description="A manual check, never an algorithm."
        motionKey="verification"
      >
        <div className="max-w-[54rem]">
          <MinimalFacts items={verification} motionKey="verification-facts" />
        </div>
        <p className="quiet-note mt-8">
          Questions?{" "}
          <a
            href={CTA_HREFS.contact}
            className="text-primary underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground"
          >
            {CTA_LABELS.contactUs}
          </a>
          .
        </p>
      </MinimalSection>

      <MinimalSection
        icon={Files}
        tone="muted"
        titleId="about-icons-heading"
        title="Icons that explain the platform"
        description="The icons on this site describe briefs, profiles, verification and payment. None represent platform members or listings."
        motionKey="icons"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {platformIcons.map((item) => (
            <MinimalMedia
              key={item.label}
              icon={item.icon}
              label={item.label}
              motionKey="icons-panels"
            />
          ))}
        </div>
      </MinimalSection>

      <MinimalClosingAction
        icon={Signpost}
        tone="plain"
        title="See how it all fits together."
        description="Read the public platform, then the process behind it."
        primaryLabel={CTA_LABELS.explorePlatform}
        primaryHref={CTA_HREFS.home}
        secondaryLabel={CTA_LABELS.readProcess}
        secondaryHref={CTA_HREFS.howItWorks}
        motionKey="closing"
      />
    </>
  );
}
