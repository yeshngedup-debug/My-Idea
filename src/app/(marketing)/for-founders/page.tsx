import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import {
  ClipboardText,
  LockKey,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { MarketingReveal, SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { EditorialHero } from "@/components/marketing/editorial-hero";
import {
  Action,
  Band,
  RuleLink,
  SectionHead,
  container,
  focusRing,
  gutters,
} from "@/components/marketing/editorial";
import { CTA_HREFS, PHOTO_CREDITS } from "@/components/marketing/nav";
import { StackedCards, type StackedCardItem } from "@/components/motion";
import { InlineImageText } from "@/components/editorial";
import { ScrubbedTextReveal } from "@/components/motion";
import { ChapterProgress, type ChapterLink } from "@/components/motion";
import { PACKAGES, PAYMENT_CONFIGURED } from "@/config/payment";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "For founders",
  description:
    "Post a scoped project brief, browse verified student talent, and request a ranked shortlist. Verified by an admin, paid in Ngultrum.",
  path: "/for-founders",
});

/** One label per intent, repeated verbatim across the page. */
const FOUNDER_ACCESS = "Ask for founder access";

const chapters: ChapterLink[] = [
  { id: "hiring", label: "Hiring" },
  { id: "steps", label: "The steps" },
  { id: "controls", label: "Your controls" },
  { id: "pricing", label: "Pricing" },
];

/** Prices come from the payment config; no other amounts are hard-coded. */
function nuAmount(amount: number) {
  return `Nu ${amount.toLocaleString("en-US")}`;
}

const basicPrice = nuAmount(PACKAGES.basic.defaultAmount);
const fullPrice = nuAmount(PACKAGES.full.defaultAmount);

const pains = [
  {
    pain: 'Vague "anyone free?" messages',
    solution:
      "A scoped brief with skills, budget, deadline and remote or onsite work",
  },
  {
    pain: "Unknown quality",
    solution: "Admin-verified profiles and CVs",
  },
  {
    pain: "No shortlist discipline",
    solution: "Ranked shortlist packages with payment proof",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Post a project",
    body: "Add a title, scope, skills, budget in Nu, duration and an apply-by date.",
    hint: "Brief, in Nu, with a date",
  },
  {
    number: "02",
    title: "Get applications",
    body: "Students apply with a profile and CV.",
    hint: "Profile + CV",
  },
  {
    number: "03",
    title: "Browse talent",
    body: "Filter by skill, college and availability.",
    hint: "Skill · college · availability",
  },
  {
    number: "04",
    title: "Order a shortlist — optional",
    body: "Choose Basic or Full Support and upload a payment screenshot. An admin confirms payment, ranks the students and releases the shortlist.",
    hint: "Payment proof → admin ranking",
  },
] as const;

/** The same four steps, handed to the reduced-motion-aware stacked-card deck. */
const stackedSteps: StackedCardItem[] = steps.map((step) => ({
  key: step.number,
  number: step.number,
  title: step.title,
  body: (
    <>
      <span className="block">{step.body}</span>
      <span className="mt-4 block border-t border-[#0b2e2e]/12 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#356464]">
        {step.hint}
      </span>
    </>
  ),
}));

const controls = [
  {
    icon: ClipboardText,
    title: "Clear scope",
    body: "Skills, budget, deadline and where the work happens.",
  },
  {
    icon: UsersThree,
    title: "Visible applicants",
    body: "See who applied and compare their profiles.",
  },
  {
    icon: LockKey,
    title: "Private CVs",
    body: "CVs open only under defined access rules.",
  },
  {
    icon: Wallet,
    title: "Nu payments",
    body: "Bank transfer or mBoB, confirmed by an admin.",
  },
] as const;

export default function ForFoundersPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        <EditorialHero
          index="01"
          eyebrow="For founders"
          title={
            <>
              Hire verified student talent for{" "}
              <span className="text-[#0b5c5c]">scoped work.</span>
            </>
          }
          lead="Post a clear brief and budget. Browse students by skill and availability. Or buy a ranked shortlist when you need a short list fast — verified by an admin, paid in Ngultrum."
          primaryCta={{ href: CTA_HREFS.contact, label: FOUNDER_ACCESS }}
          secondary={{ href: "#pricing", label: "See pricing" }}
          image={{
            src: "/images/bhutanese-team.jpg",
            alt: "Bhutanese students in kira performing in national dress",
            fileUrl: PHOTO_CREDITS.market,
          }}
          caption="Bhutanese students"
          imagePosition="object-center"
        />

        {/* One statement, scrubbed in. Shortlists are reviewed, not automated. */}
        <Band tone="mist" className="border-b border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-14 md:py-20")}>
            <p className="index-label">Shortlist support</p>
            <ScrubbedTextReveal
              as="p"
              text="An admin confirms payment, ranks the students and releases the shortlist."
              className="mt-6 max-w-[24ch] text-[clamp(1.75rem,3.6vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#0b2e2e] md:max-w-[28ch]"
            />
          </div>
        </Band>

        <ChapterProgress
          chapters={chapters}
          className="sticky top-16 z-30 border-[#0b2e2e]/12 bg-white [&_a]:text-[#0b2e2e] [&_a:hover]:text-[#0b5c5c] [&_a]:focus-visible:ring-[#0b5c5c] [&_a]:focus-visible:ring-offset-white [&_a[aria-current]]:text-[#0b5c5c] [&_a[aria-current]]:decoration-[#ff0063] [&_a[aria-current]]:decoration-1 [&_a[aria-current]]:underline-offset-[10px] [&_[data-chapter-bar]]:bg-[#ff0063]"
        />

        {/* Pain to solution — three ruled columns. */}
        <Band id="hiring" labelledBy="hiring-heading">
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="02"
                eyebrow="Hiring"
                id="hiring-heading"
                title="Stop hiring from chat groups"
                lead="A written brief gives every applicant the same starting point, and gives you something to compare against."
              />
            </MarketingReveal>

            <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-[#0b2e2e]/15 sm:grid-cols-3">
              {pains.map((row, index) => (
                <MarketingReveal
                  key={row.pain}
                  delay={index * 0.06}
                  className="border-b border-[#0b2e2e]/15 py-7 sm:border-b-0 sm:py-8"
                >
                  <li>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[#c2004b]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-[#0b2e2e]/15"
                      />
                    </div>
                    <p className="mt-4 text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-[#356464]">
                      {row.pain}
                    </p>
                    <h3 className="mt-3 text-[1.15rem] font-semibold leading-snug tracking-[-0.025em] text-[#0b2e2e]">
                      {row.solution}
                    </h3>
                  </li>
                </MarketingReveal>
              ))}
            </ul>
          </div>
        </Band>

        {/* From brief to shortlist — stacked cards, plain list fallback. */}
        <Band
          id="steps"
          tone="mist"
          labelledBy="steps-heading"
          className="border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="03"
                eyebrow="The steps"
                id="steps-heading"
                title="From brief to shortlist"
                lead="Four steps, each one written down. The shortlist is optional; the brief is not."
              />
            </MarketingReveal>

            <MarketingReveal className="mt-12">
              <StackedCards
                items={stackedSteps}
                label="From brief to shortlist"
                className="mx-auto max-w-4xl"
              />
            </MarketingReveal>
          </div>
        </Band>

        {/* What you control — inline typography image and a ruled grid. */}
        <Band id="controls" labelledBy="controls-heading">
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <InlineImageText
                as="h2"
                id="controls-heading"
                before="What you"
                imageSrc="/images/bhutanese-students.jpg"
                imageAlt="Young Bhutanese people working in groups at a training day in Thimphu"
                creditFileUrl={PHOTO_CREDITS.valley}
                after="control"
                accessibleLabel="What you control"
              />
            </MarketingReveal>

            <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-[#0b2e2e]/15 md:grid-cols-2">
              {controls.map((item, index) => {
                const Icon = item.icon;
                return (
                  <MarketingReveal
                    key={item.title}
                    delay={index * 0.06}
                    className="border-b border-[#0b2e2e]/15 py-7"
                  >
                    <li className="grid grid-cols-[2rem_1fr] gap-4">
                      <span className="mt-0.5 text-[#0b5c5c]">
                        <Icon
                          aria-hidden="true"
                          weight="light"
                          size={22}
                          strokeWidth={1.6}
                        />
                      </span>
                      <div>
                        <h3 className="text-[1.15rem] font-semibold leading-snug tracking-[-0.025em] text-[#0b2e2e]">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 max-w-[34ch] text-sm leading-6 text-[#356464]">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  </MarketingReveal>
                );
              })}
            </ul>
          </div>
        </Band>

        {/* Shortlist packages. Prices and honesty stay in the config. */}
        <Band
          id="pricing"
          tone="mist"
          labelledBy="pricing-heading"
          className="scroll-mt-24 border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <SectionHead
                index="05"
                eyebrow="Pricing"
                id="pricing-heading"
                title="Premium shortlists"
                lead="When you want a ranked list instead of sorting applicants yourself."
              />
            </MarketingReveal>

            {/* Sample product panel: visibly a sample, no interactive action. */}
            <MarketingReveal className="mt-12">
              <div
                role="group"
                aria-label="Sample shortlist order"
                className="w-full max-w-3xl border border-[#0b2e2e]/15 bg-white p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#0b2e2e]/12 pb-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0b2e2e]">
                    Sample shortlist order
                  </h3>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c2004b]">
                    Example order · not a live order
                  </p>
                </div>
                <p className="mt-6 text-[2rem] font-semibold tabular-nums tracking-[-0.03em] text-[#0b2e2e]">
                  Basic shortlist · {basicPrice}
                </p>
                <p className="mt-2 text-sm text-[#356464]">
                  Ranked, verified students for your brief
                </p>
                <p className="mt-6 border-t border-[#0b2e2e]/12 pt-4 text-sm font-medium text-[#0b5c5c]">
                  Status: Payment confirmed → Admin ranking
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#0b2e2e]/12 pt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#356464]">
                    Sample view · not a live order
                  </span>
                  <span className="inline-flex min-h-9 items-center border border-[#0b2e2e]/20 px-4 text-xs font-semibold text-[#0b2e2e]/60">
                    Order shortlist
                  </span>
                </div>
                {!PAYMENT_CONFIGURED ? (
                  <p className="mt-4 text-xs leading-5 text-[#356464]">
                    Orders are unavailable until the bank and mBoB details are
                    published.
                  </p>
                ) : null}
              </div>
            </MarketingReveal>

            <div
              role="region"
              aria-label="Shortlist packages"
              tabIndex={0}
              className={cn(
                "mt-12 grid grid-cols-1 gap-6 md:grid-cols-2",
                focusRing,
              )}
            >
              <p className="sr-only">
                Premium shortlist packages, prices and what each includes
              </p>

              {/* Basic. */}
              <article className="flex h-full flex-col border border-[#0b2e2e]/15 bg-white p-6 sm:p-8">
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-[#0b2e2e]">
                  {PACKAGES.basic.name}
                </h3>
                <p className="mt-4 text-[2.25rem] font-semibold tabular-nums tracking-[-0.035em] text-[#0b5c5c]">
                  {basicPrice}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#356464]">
                  Suggested range: {PACKAGES.basic.priceRange}
                </p>
                <p className="mt-6 text-sm leading-6 text-[#356464]">
                  Ranked shortlist from verified students matching the brief
                </p>
                <ul className="mt-6 border-t border-[#0b2e2e]/12 pt-4">
                  {PACKAGES.basic.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 border-b border-[#0b2e2e]/10 py-3 text-sm leading-6 text-[#0b2e2e] last:border-b-0"
                    >
                      <CheckCircle
                        aria-hidden="true"
                        weight="bold"
                        size={16}
                        className="mt-1 shrink-0 text-[#c2004b]"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>

              {/* Full Support: the one filled panel. */}
              <article className="flex h-full flex-col bg-[#66bfbf] p-6 text-[#0b2e2e] sm:p-8">
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.025em]">
                  {PACKAGES.full.name}
                </h3>
                <p className="mt-4 text-[2.25rem] font-semibold tabular-nums tracking-[-0.035em]">
                  {fullPrice}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0b2e2e]/70">
                  Suggested range: {PACKAGES.full.priceRange}
                </p>
                <p className="mt-6 text-sm leading-6">
                  Ranked shortlist + admin help refining scope and fit
                </p>
                <ul className="mt-6 border-t border-[#0b2e2e]/25 pt-4">
                  {PACKAGES.full.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 border-b border-[#0b2e2e]/15 py-3 text-sm leading-6 last:border-b-0"
                    >
                      <CheckCircle
                        aria-hidden="true"
                        weight="bold"
                        size={16}
                        className="mt-1 shrink-0 text-[#0b2e2e]"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <p className="mt-8 max-w-[70ch] text-sm leading-6 text-[#356464]">
              Pay by bank transfer or mBoB. Upload the screenshot. An admin
              confirms payment before the shortlist is released.
            </p>
            {!PAYMENT_CONFIGURED ? (
              <div
                role="note"
                className="mt-5 max-w-[70ch] border-l-2 border-[#ff0063] bg-white px-4 py-3 text-sm leading-6 text-[#0b5c5c]"
              >
                Shortlist orders are unavailable right now. Bank and mBoB
                details have not been published yet. The amounts above are the
                intended prices.
              </div>
            ) : null}
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Action href={CTA_HREFS.contact}>{FOUNDER_ACCESS}</Action>
              <RuleLink href="/how-it-works">How it works</RuleLink>
            </div>
          </div>
        </Band>

        {/* Closing band. */}
        <Band tone="teal">
          <div
            className={cn(
              container,
              gutters,
              "grid grid-cols-1 items-end gap-10 py-20 md:py-28 lg:grid-cols-12",
            )}
          >
            <MarketingReveal className="lg:col-span-8">
              <p className="index-label text-[#0b2e2e]">Next step</p>
              <h2 className="display-xl mt-6 max-w-[14ch]">
                Post your first brief.
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                Scoped work, verified students, payments in Ngultrum.
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href={CTA_HREFS.contact}>{FOUNDER_ACCESS}</Action>
              <RuleLink
                href={CTA_HREFS.howItWorks}
                className="decoration-[#0b2e2e]/30 hover:decoration-[#0b2e2e]"
              >
                Read the process
              </RuleLink>
            </MarketingReveal>
          </div>
        </Band>
      </main>

      <SiteFooter />
    </div>
  );
}
