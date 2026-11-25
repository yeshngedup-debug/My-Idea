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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE]";

const primaryCta =
  `inline-flex min-h-11 items-center justify-center rounded-xl bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#d9950f] motion-reduce:transition-none ${focusRing}`;

const secondaryCta =
  `inline-flex min-h-11 items-center justify-center rounded-xl border border-[#1B4D3E] px-6 py-3 text-sm font-semibold text-[#1B4D3E] transition-colors duration-150 hover:bg-[#E8E4DB] motion-reduce:transition-none ${focusRing}`;

const sectionLabel =
  "text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1B4D3E]";

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
  },
  {
    title: "Founders",
    body: "Post a brief, browse verified students, buy a ranked shortlist when you need one fast.",
    cta: "Ask for founder access",
    href: CTA_HREFS.contact,
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

      <main id="main-content">
        {/* Above the fold */}
        <section className="border-b border-[#1B4D3E]/10 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1120px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className={sectionLabel}>Bhutan Tech Connect</p>
              <h1 className="mt-5 max-w-[15ch] text-[clamp(2.75rem,5.2vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
                Paid project work for Bhutanese students.
              </h1>
              <p className="mt-6 max-w-[62ch] text-base leading-7 text-[#0B1F1A]/75">
                Founders post a clear brief and budget. Students apply with skills
                and a CV. Admins verify people by hand — not by algorithm.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href={CTA_HREFS.signup} className={primaryCta}>
                  {CTA_LABELS.signup}
                </Link>
                <Link href={CTA_HREFS.howItWorks} className={secondaryCta}>
                  {CTA_LABELS.seeHow}
                </Link>
              </div>
              <p className="mt-6 text-sm text-[#0B1F1A]/55">
                Free to browse · Payments in Ngultrum · Verified by people
              </p>
            </div>

            {/* Product truth — a real-looking brief, not a classroom photo. */}
            <div
              aria-label="Example open project brief"
              className="rounded-2xl border border-[#E8E4DB] bg-white/60 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#1B4D3E]/8 px-3 py-1 text-xs font-semibold text-[#1B4D3E]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#1B4D3E]" />
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
                <span className="inline-flex min-h-9 items-center rounded-lg bg-[#E8A317] px-4 text-xs font-semibold text-[#0B1F1A]">
                  Apply
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            <p className={sectionLabel}>Three steps</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              From brief to paid work
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-2xl border border-[#E8E4DB] bg-white/40 p-6"
                >
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
          </div>
        </section>

        {/* Two paths */}
        <section className="border-y border-[#1B4D3E]/10 bg-white/35 px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              Built for both sides of the table
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {paths.map((path) => (
                <article
                  key={path.title}
                  className="flex flex-col rounded-2xl border border-[#E8E4DB] bg-[#F7F4EE] p-7 sm:p-8"
                >
                  <h3 className="text-xl font-semibold tracking-[-0.01em]">
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
          </div>
        </section>

        {/* Why this exists */}
        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            <p className={sectionLabel}>Local context</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              A local bridge for young people
            </h2>
            <p className="mt-5 max-w-[68ch] text-base leading-7 text-[#0B1F1A]/75">
              Youth unemployment in Bhutan is high. Growth alone is not creating
              enough skilled work close to home. Bhutan Tech Connect is a practical
              matching layer — scoped projects, human verification, payments in
              Ngultrum.
            </p>
            <dl className="mt-10 grid gap-6 border-t border-[#E8E4DB] pt-8 sm:grid-cols-3">
              <div>
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
              <div>
                <dt className="text-xs font-medium text-[#0B1F1A]/55">Payments</dt>
                <dd className="mt-2 text-lg font-semibold">In Nu</dd>
                <dd className="mt-1 text-xs text-[#0B1F1A]/50">Bank transfer or mBoB</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#0B1F1A]/55">Verification</dt>
                <dd className="mt-2 text-lg font-semibold">By people</dd>
                <dd className="mt-1 text-xs text-[#0B1F1A]/50">Admin-reviewed, every time</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-[#0B1F1A]/45">
              National indicator from the World Bank API, World Development
              Indicators. This is context, not a platform result.
            </p>
          </div>
        </section>

        {/* Trust */}
        <section className="border-t border-[#1B4D3E]/10 bg-white/35 px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              Checked by people
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-[#1B4D3E]">
                    <TrustIcon kind={item.icon} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#0B1F1A]/70">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#1B4D3E] px-5 py-20 text-[#F7F4EE] sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
                Start with one paid project
              </h2>
              <p className="mt-3 text-sm text-[#F7F4EE]/75">
                {SITE.tagline}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={CTA_HREFS.signup}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#d9950f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F4EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4D3E] motion-reduce:transition-none"
              >
                {CTA_LABELS.signup}
              </Link>
              <Link
                href={CTA_HREFS.contact}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#F7F4EE]/40 px-6 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-[#F7F4EE]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F4EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4D3E] motion-reduce:transition-none"
              >
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
