import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CTA_HREFS, CTA_LABELS, SITE } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import { getLiveContext } from "@/lib/data/world-bank";

export const metadata = pageMetadata({
  title: "Paid project work for Bhutanese students",
  description:
    "Founders post a clear brief and budget. Students apply with skills and a CV. Admins verify people by hand — not by algorithm.",
  path: "/public",
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F1A] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const primaryCta =
  `inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#d9950f] motion-reduce:transition-none ${focusRing}`;

const secondaryCta =
  `inline-flex min-h-11 items-center justify-center rounded-full border border-[#1B4D3E]/25 px-6 py-3 text-sm font-semibold text-[#1B4D3E] transition-colors duration-150 hover:bg-[#E8E4DB]/60 motion-reduce:transition-none ${focusRing}`;

const quietLink =
  `inline-flex min-h-11 items-center text-sm font-semibold text-[#1B4D3E] underline decoration-[#1B4D3E]/30 underline-offset-4 transition-colors duration-150 hover:decoration-[#E8A317] motion-reduce:transition-none ${focusRing}`;

/** Pill section label above a heading, adapted from the Paywave section chips. */
const pillLabel =
  "inline-flex items-center rounded-full border border-[#1B4D3E]/10 bg-[#1B4D3E]/5 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1B4D3E]";

/** Every content band is a large white rounded card on the tinted page. */
const card = "rounded-[24px] border border-[#1B4D3E]/10 bg-white";

const subCard = "rounded-[18px] border border-[#1B4D3E]/10 bg-[#F7F4EE]";

const heading =
  "mt-4 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]";

type IconKind = "brief" | "id" | "lock" | "coin" | "mobile";

/** Inline SVG keeps these decorative icons in the Server Component tree. */
function TrustIcon({ kind, size = 22 }: { kind: IconKind; size?: number }) {
  const paths: Record<IconKind, ReactNode> = {
    brief: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>,
    id: <><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><circle cx="8.5" cy="10" r="2" /><path d="M5.5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14.5 9.5h4M14.5 13h4" /></>,
    lock: <><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    coin: <><circle cx="12" cy="12" r="8.5" /><path d="M9 9h6M9 12h6M12 9v7" /></>,
    mobile: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}

const steps = [
  {
    number: "01",
    title: "Post or browse",
    body: "Founders post a scoped project with budget and deadline. Students browse free.",
    hint: "Brief → budget → deadline",
  },
  {
    number: "02",
    title: "Apply or shortlist",
    body: "Students apply with profile and CV. Founders can request a ranked shortlist.",
    hint: "Skills → CV → shortlist",
  },
  {
    number: "03",
    title: "Verify and start",
    body: "Admins verify identity and confirm bank or mBoB payment. Then work begins.",
    hint: "Verified → paid → building",
  },
];

const paths = [
  {
    title: "Students",
    body: "Build a profile, upload a CV, apply to paid projects.",
    cta: CTA_LABELS.signup,
    href: CTA_HREFS.signup,
    icon: "id" as const,
  },
  {
    title: "Founders",
    body: "Post a brief, browse verified students, buy a ranked shortlist when you need one fast.",
    cta: "Ask for founder access",
    href: CTA_HREFS.contact,
    icon: "brief" as const,
  },
];

const trust = [
  {
    icon: "id" as const,
    title: "Human verification",
    body: "Identity, college and CV reviewed by an admin.",
  },
  {
    icon: "lock" as const,
    title: "Private CVs",
    body: "Shared only when the rules allow it.",
  },
  {
    icon: "coin" as const,
    title: "Clear payments",
    body: "Bank transfer or mBoB; an admin confirms the screenshot.",
  },
  {
    icon: "mobile" as const,
    title: "Phone-first",
    body: "Browse, apply and manage on a small screen.",
  },
];

export default async function PublicHomePage() {
  const liveContext = await getLiveContext();
  const youth = liveContext.indicators.find(
    (indicator) => indicator.code === "SL.UEM.1524.ZS"
  );

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#0B1F1A]">
      <SiteHeader />

      <main
        id="main-content"
        className="mx-auto flex max-w-[1240px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:gap-5 lg:px-8"
      >
        {/* Hero — centered copy, one saffron CTA, real brief panel on a soft glow. */}
        <section
          className={`${card} overflow-hidden px-6 py-14 text-center sm:px-10 lg:py-20`}
        >
          <p className={pillLabel}>Bhutan Tech Connect</p>
          <h1 className="mx-auto mt-6 max-w-[18ch] text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Paid project work for{" "}
            <span className="text-[#E8A317]">Bhutanese students.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[60ch] text-base leading-7 text-[#0B1F1A]/65">
            Founders post a clear brief and budget. Students apply with skills
            and a CV. Admins verify people by hand — not by algorithm.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href={CTA_HREFS.signup} className={primaryCta}>
              {CTA_LABELS.signup}
            </Link>
            <Link href={CTA_HREFS.howItWorks} className={quietLink}>
              {CTA_LABELS.seeHow}
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#0B1F1A]/50">
            Free to browse · Payments in Ngultrum · Verified by people
          </p>

          {/* Product truth — a real-looking brief, not a classroom photo. */}
          <div className="relative mx-auto mt-12 max-w-[640px] text-left">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-[#E8A317]/25 via-[#E8E4DB]/50 to-[#1B4D3E]/15 blur-2xl"
            />
            <div
              aria-label="Example open project brief"
              className="relative rounded-[20px] border border-[#1B4D3E]/10 bg-white p-6 shadow-[0_18px_50px_-24px_rgba(11,31,26,0.25)] sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#1B4D3E]/8 px-3 py-1 text-xs font-semibold text-[#1B4D3E]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#1B4D3E]"
                  />
                  Open brief
                </span>
                <span className="text-xs text-[#0B1F1A]/50">Sample</span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">
                Mobile app UI redesign
              </h2>
              <p className="mt-2 text-sm text-[#0B1F1A]/60">
                Nu 2,500–4,000 · 2 weeks · Remote
              </p>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Required skills">
                {["React", "TypeScript", "Figma"].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-[#E8E4DB] bg-[#F7F4EE] px-3 py-1.5 text-xs font-medium text-[#0B1F1A]/75"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#E8E4DB] pt-5">
                <span className="text-xs text-[#0B1F1A]/50">3 students applied</span>
                <span className="inline-flex min-h-9 items-center rounded-full bg-[#1B4D3E] px-4 text-xs font-semibold text-white">
                  Apply
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={`${card} px-6 py-12 sm:px-10 lg:py-16`}>
          <p className={pillLabel}>Three steps</p>
          <h2 className={heading}>From brief to paid work</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className={`${subCard} p-6`}>
                <span className="text-sm font-semibold tabular-nums text-[#1B4D3E]">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#0B1F1A]/70">
                  {step.body}
                </p>
                <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E8E4DB]/60 px-3 py-2 text-xs font-medium text-[#1B4D3E]">
                  <TrustIcon kind="brief" size={14} />
                  {step.hint}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Two paths */}
        <section className={`${card} px-6 py-12 sm:px-10 lg:py-16`}>
          <p className={pillLabel}>Two paths</p>
          <h2 className={heading}>Built for both sides of the table</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {paths.map((path) => (
              <article key={path.title} className={`${subCard} flex flex-col p-7 sm:p-8`}>
                <div
                  aria-hidden="true"
                  className="flex h-24 items-center justify-center rounded-[14px] border border-[#1B4D3E]/10 bg-white text-[#1B4D3E]"
                >
                  <TrustIcon kind={path.icon} size={34} />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.01em]">
                  {path.title}
                </h3>
                <p className="mt-3 max-w-[46ch] text-sm leading-6 text-[#0B1F1A]/70">
                  {path.body}
                </p>
                <Link href={path.href} className={`${secondaryCta} mt-7 self-start`}>
                  {path.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Why this exists */}
        <section className={`${card} px-6 py-12 sm:px-10 lg:py-16`}>
          <p className={pillLabel}>Local context</p>
          <h2 className={heading}>A local bridge for young people</h2>
          <p className="mt-5 max-w-[68ch] text-base leading-7 text-[#0B1F1A]/70">
            Youth unemployment in Bhutan is high. Growth alone is not creating
            enough skilled work close to home. Bhutan Tech Connect is a practical
            matching layer — scoped projects, human verification, payments in
            Ngultrum.
          </p>
          <dl className="mt-9 grid gap-4 sm:grid-cols-3">
            <div className={`${subCard} p-5`}>
              <dt className="text-xs font-medium text-[#0B1F1A]/55">
                Youth unemployment · Bhutan
              </dt>
              <dd className="mt-2 text-2xl font-semibold tabular-nums">
                {youth?.displayValue ?? "—"}
              </dd>
              <dd className="mt-1 text-xs text-[#0B1F1A]/50">
                {youth ? `${youth.year} · ${youth.seriesNote}` : "Source unavailable"}
              </dd>
            </div>
            <div className={`${subCard} p-5`}>
              <dt className="text-xs font-medium text-[#0B1F1A]/55">Payments</dt>
              <dd className="mt-2 text-lg font-semibold">In Nu</dd>
              <dd className="mt-1 text-xs text-[#0B1F1A]/50">Bank transfer or mBoB</dd>
            </div>
            <div className={`${subCard} p-5`}>
              <dt className="text-xs font-medium text-[#0B1F1A]/55">Verification</dt>
              <dd className="mt-2 text-lg font-semibold">By people</dd>
              <dd className="mt-1 text-xs text-[#0B1F1A]/50">Admin-reviewed, every time</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs text-[#0B1F1A]/45">
            National indicator from the World Bank API, World Development
            Indicators. This is context, not a platform result.
          </p>
        </section>

        {/* Trust — verified platform facts, never invented quotes. */}
        <section className={`${card} px-6 py-12 sm:px-10 lg:py-16`}>
          <p className={pillLabel}>Trust</p>
          <h2 className={heading}>Checked by people</h2>
          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((item) => (
              <li key={item.title} className={`${subCard} p-5`}>
                <span className="text-[#1B4D3E]">
                  <TrustIcon kind={item.icon} />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#0B1F1A]/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA — soft-gradient rounded card. */}
        <section className="relative overflow-hidden rounded-[24px] border border-[#1B4D3E]/10 bg-gradient-to-br from-[#E8E4DB] via-[#F7F4EE] to-[#E8A317]/25 px-6 py-14 sm:px-10 lg:py-16">
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={pillLabel}>{CTA_LABELS.closingEyebrow}</p>
              <h2 className={heading}>Start with one paid project</h2>
              <p className="mt-3 text-sm text-[#0B1F1A]/65">
                {SITE.tagline}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={CTA_HREFS.signup} className={primaryCta}>
                {CTA_LABELS.signup}
              </Link>
              <Link href={CTA_HREFS.contact} className={secondaryCta}>
                For founders · Contact
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
