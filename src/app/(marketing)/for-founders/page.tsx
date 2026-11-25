import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle,
  ClipboardText,
  FileText,
  LockKey,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CTA_HREFS } from "@/components/marketing/nav";
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

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE]";
const primaryCta = `inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#E8A317]/85 motion-reduce:transition-none ${focusRing}`;
const quietLink = `inline-flex min-h-11 items-center text-sm font-semibold text-[#1B4D3E] underline decoration-[#1B4D3E]/30 underline-offset-4 transition-colors hover:text-[#0B1F1A] motion-reduce:transition-none ${focusRing}`;
const pillClass =
  "inline-flex items-center rounded-full border border-[#1B4D3E]/15 bg-[#E8E4DB]/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1B4D3E]";
const headingClass =
  "text-balance text-center text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0B1F1A]";

/** Saffron marker behind a phrase, with ink text kept readable. */
function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="box-decoration-clone rounded-[4px] bg-[#E8A317] px-1 text-[#0B1F1A]">
      {children}
    </span>
  );
}

function SectionCard({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("px-5 py-10 sm:px-8 lg:px-12", className)}>
      <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
        {children}
      </div>
    </section>
  );
}

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
];

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
];

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
];

export default function ForFoundersPage() {
  return (
    <div className="min-h-[100dvh] bg-[#F7F4EE] text-[#0B1F1A]">
      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="px-5 pt-10 sm:px-8 lg:px-12 lg:pt-14">
          <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <p className={pillClass}>For founders</p>
                <h1 className="mt-3 max-w-[24ch] text-balance text-[clamp(2rem,5.5vw,3rem)] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[clamp(2.5rem,4vw,3.5rem)]">
                  Hire <Highlight>verified student talent</Highlight> for scoped
                  work.
                </h1>
                <p className="mt-6 max-w-[60ch] text-base leading-7 text-[#0B1F1A]/75">
                  Post a clear brief and budget. Browse students by skill and
                  availability. Or buy a ranked shortlist when you need a short
                  list fast — verified by an admin, paid in Ngultrum.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href={CTA_HREFS.contact} className={primaryCta}>
                    {FOUNDER_ACCESS}
                  </Link>
                  <Link href="#pricing" className={quietLink}>
                    See pricing
                  </Link>
                </div>
              </div>

              {/* Sample product panel — visibly a sample, no interactive action. */}
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-[#E8A317]/25 via-[#E8E4DB]/70 to-[#1B4D3E]/15 blur-2xl"
                />
                <div
                  role="group"
                  aria-label="Sample shortlist order panel"
                  className="relative isolate rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#1B4D3E]/10 px-3 py-1 text-xs font-semibold text-[#1B4D3E]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-[#1B4D3E]"
                      />
                      Sample
                    </span>
                    <span className="text-xs text-[#0B1F1A]/55">Example order</span>
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-[#0B1F1A]">
                    Basic shortlist · {basicPrice}
                  </h2>
                  <p className="mt-2 text-sm text-[#0B1F1A]/65">
                    Ranked, verified students for your brief
                  </p>
                  <p className="mt-7 border-t border-[#E8E4DB] pt-5 text-sm font-medium text-[#1B4D3E]">
                    Status: Payment confirmed → Admin ranking
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E8E4DB] pt-5">
                    <span className="text-xs text-[#0B1F1A]/55">
                      Sample view · not a live order
                    </span>
                    <span className="inline-flex min-h-9 items-center rounded-lg border border-[#1B4D3E]/30 px-4 text-xs font-semibold text-[#1B4D3E]/65">
                      Order shortlist
                    </span>
                  </div>
                  {!PAYMENT_CONFIGURED ? (
                    <p className="mt-4 text-xs leading-5 text-[#0B1F1A]/65">
                      Orders are unavailable until the bank and mBoB details are
                      published.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain → solution */}
        <SectionCard>
          <div className="mx-auto max-w-3xl text-center">
            <p className={pillClass}>The problem</p>
            <h2 className={cn(headingClass, "mt-1")}>
              Stop hiring from <Highlight>chat groups</Highlight>
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {pains.map((row) => (
              <div
                key={row.pain}
                className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6"
              >
                <p className="text-base font-medium text-[#0B1F1A]/65">
                  {row.pain}
                </p>
                <p className="mt-4 flex items-start gap-3 text-base font-medium text-[#1B4D3E]">
                  <CheckCircle
                    aria-hidden="true"
                    weight="light"
                    size={20}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0"
                  />
                  {row.solution}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* From brief to shortlist */}
        <SectionCard>
          <div className="mx-auto max-w-3xl text-center">
            <p className={pillClass}>Process</p>
            <h2 className={cn(headingClass, "mt-1")}>
              From brief to <Highlight>shortlist</Highlight>
            </h2>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                key={step.number}
                className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6"
              >
                <span className="inline-flex rounded-full bg-[#E8A317]/20 px-2.5 py-1 text-sm font-semibold tabular-nums text-[#0B1F1A]">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-[#0B1F1A]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#0B1F1A]/70">
                  {step.body}
                </p>
                <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E8E4DB]/60 px-3 py-2 text-xs font-medium text-[#1B4D3E]">
                  <FileText aria-hidden="true" weight="light" size={14} />
                  {step.hint}
                </p>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* Shortlist packages */}
        <section
          id="pricing"
          className="scroll-mt-24 px-5 py-10 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-3xl text-center">
              <p className={pillClass}>Shortlist packages</p>
              <h2 className={cn(headingClass, "mt-1")}>
                Premium <Highlight>shortlists</Highlight>
              </h2>
              <p className="mx-auto mt-4 max-w-[62ch] text-base leading-7 text-[#0B1F1A]/70">
                When you want a ranked list instead of sorting applicants
                yourself.
              </p>
            </div>

            <div
              role="region"
              aria-label="Shortlist packages"
              tabIndex={0}
              className={`mt-10 grid gap-5 md:grid-cols-2 ${focusRing}`}
            >
              <p className="sr-only">
                Premium shortlist packages, prices and what each includes
              </p>

              {/* Basic — quiet card. */}
              <article className="flex h-full flex-col rounded-[24px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6 sm:p-8">
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-[#0B1F1A]">
                  {PACKAGES.basic.name}
                </h3>
                <p className="mt-4 text-3xl font-semibold tabular-nums tracking-[-0.03em] text-[#1B4D3E]">
                  {basicPrice}
                </p>
                <p className="mt-1 text-xs text-[#0B1F1A]/60">
                  Suggested range: {PACKAGES.basic.priceRange}
                </p>
                <p className="mt-6 text-sm leading-6 text-[#0B1F1A]/70">
                  Ranked shortlist from verified students matching the brief
                </p>
                <ul className="mt-6 space-y-3 border-t border-[#1B4D3E]/15 pt-6">
                  {PACKAGES.basic.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-[#0B1F1A]/75"
                    >
                      <CheckCircle
                        aria-hidden="true"
                        weight="light"
                        size={18}
                        strokeWidth={1.6}
                        className="mt-0.5 shrink-0 text-[#1B4D3E]"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>

              {/* Full Support — the one featured card, with a gradient hairline. */}
              <div className="rounded-[24px] bg-gradient-to-br from-[#E8A317] via-[#E8E4DB] to-[#1B4D3E] p-px">
                <article className="flex h-full flex-col rounded-[23px] bg-[#1B4D3E] p-6 text-[#F7F4EE] sm:p-8">
                  <h3 className="text-xl font-semibold tracking-[-0.01em]">
                    {PACKAGES.full.name}
                  </h3>
                  <p className="mt-4 text-3xl font-semibold tabular-nums tracking-[-0.03em] text-[#E8A317]">
                    {fullPrice}
                  </p>
                  <p className="mt-1 text-xs text-[#F7F4EE]/70">
                    Suggested range: {PACKAGES.full.priceRange}
                  </p>
                  <p className="mt-6 text-sm leading-6 text-[#F7F4EE]/85">
                    Ranked shortlist + admin help refining scope and fit
                  </p>
                  <ul className="mt-6 space-y-3 border-t border-[#F7F4EE]/25 pt-6">
                    {PACKAGES.full.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-6 text-[#F7F4EE]/90"
                      >
                        <CheckCircle
                          aria-hidden="true"
                          weight="light"
                          size={18}
                          strokeWidth={1.6}
                          className="mt-0.5 shrink-0 text-[#E8A317]"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-[70ch] text-center text-sm leading-6 text-[#0B1F1A]/70">
              Pay by bank transfer or mBoB. Upload the screenshot. An admin
              confirms payment before the shortlist is released.
            </p>
            {!PAYMENT_CONFIGURED ? (
              <div
                role="note"
                className="mx-auto mt-5 max-w-[70ch] rounded-[16px] border border-[#1B4D3E]/20 bg-[#E8E4DB]/50 px-4 py-3 text-sm leading-6 text-[#1B4D3E]"
              >
                Shortlist orders are unavailable right now. Bank and mBoB
                details have not been published yet. The amounts above are the
                intended prices.
              </div>
            ) : null}
            <div className="mt-9 text-center">
              <Link href={CTA_HREFS.contact} className={primaryCta}>
                {FOUNDER_ACCESS}
              </Link>
            </div>
          </div>
        </section>

        {/* What you control */}
        <SectionCard>
          <div className="mx-auto max-w-3xl text-center">
            <p className={pillClass}>Your workspace</p>
            <h2 className={cn(headingClass, "mt-1")}>
              What you <Highlight>control</Highlight>
            </h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {controls.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6"
                >
                  <span className="mt-0.5 shrink-0 text-[#1B4D3E]">
                    <Icon
                      aria-hidden="true"
                      weight="light"
                      size={24}
                      strokeWidth={1.6}
                    />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0B1F1A]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#0B1F1A]/70">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        {/* Final CTA */}
        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <div className="relative isolate mx-auto max-w-[1120px] overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-gradient-to-br from-[#E8E4DB] via-white to-[#E8A317]/25 px-6 py-14 text-center sm:px-12">
            <p className={pillClass}>Next step</p>
            <h2 className="mt-4 text-balance text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0B1F1A]">
              Post your <Highlight>first brief</Highlight>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[#0B1F1A]/75 sm:text-base">
              Scoped work, verified students, payments in Ngultrum.
            </p>
            <div className="mt-8">
              <Link href={CTA_HREFS.contact} className={primaryCta}>
                {FOUNDER_ACCESS}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Link href={CTA_HREFS.howItWorks} className={quietLink}>
                How it works
              </Link>
              <Link href={CTA_HREFS.contact} className={quietLink}>
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
