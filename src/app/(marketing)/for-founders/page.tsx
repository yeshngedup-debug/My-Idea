import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
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
import { CTA_HREFS, PHOTO_CREDITS } from "@/components/marketing/nav";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { HeroPhotoEntrance } from "@/components/marketing/hero-photo";
import { InlineImageText } from "@/components/editorial";
import { ScrubbedTextReveal } from "@/components/motion";
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
const bandClass =
  "w-full max-w-full overflow-x-hidden px-5 py-32 sm:px-8 md:py-48 lg:px-12";
const headingClass =
  "text-balance text-left text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0B1F1A]";
const bodyClass =
  "max-w-2xl text-base leading-7 text-[#0B1F1A]/75 sm:text-lg sm:leading-8";
const bentoClass = "grid w-full max-w-full grid-cols-12 grid-flow-dense gap-4";
const imageZoom =
  "object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";

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
    <section id={id} className={cn(bandClass, className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
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

      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        {/* Editorial split hero: copy left, one quiet photographic right. */}
        <section className="w-full max-w-full overflow-x-hidden px-5 pt-10 sm:px-8 lg:px-12 lg:pt-14">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
              <HeroCopyEntrance>
                <h1 className="w-full max-w-6xl text-balance text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0B1F1A]">
                  Hire verified student talent for scoped work.
                </h1>
                <p className="mt-8 max-w-xl text-base leading-7 text-[#0B1F1A]/75 sm:text-lg sm:leading-8">
                  Post a clear brief and budget. Browse students by skill and
                  availability. Or buy a ranked shortlist when you need a short
                  list fast — verified by an admin, paid in Ngultrum.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href={CTA_HREFS.contact} className={primaryCta}>
                    {FOUNDER_ACCESS}
                  </Link>
                  <Link href="#pricing" className={quietLink}>
                    See pricing
                  </Link>
                </div>
              </HeroCopyEntrance>

              <HeroPhotoEntrance>
                <figure className="group relative isolate aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] border border-[#E8E4DB] bg-[#0B1F1A]">
                  <Image
                    src="https://picsum.photos/seed/bhutan-startup-founders/1200/1500"
                    alt=""
                    aria-hidden="true"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className={cn(
                      "grayscale contrast-[1.15] opacity-90",
                      imageZoom,
                    )}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 50% 10%, transparent 25%, rgb(11 31 26 / 0.78) 100%)",
                    }}
                  />
                </figure>
              </HeroPhotoEntrance>
            </div>
          </div>
        </section>

        <section className={bandClass}>
          <div className="mx-auto w-full max-w-6xl">
            <ScrubbedTextReveal
              as="p"
              text="Choose Basic or Full Support and upload a payment screenshot. An admin confirms payment, ranks the students and releases the shortlist."
              className="max-w-4xl text-balance text-[clamp(1.75rem,3.5vw,3rem)] font-medium leading-tight tracking-[-0.03em] text-[#1B4D3E]"
            />
          </div>
        </section>

        {/* Pain to solution. */}
        <SectionCard>
          <RevealHeading title="Stop hiring from chat groups" />
          <div className={cn(bentoClass, "mt-14")}>
            {pains.map((row) => (
              <div
                key={row.pain}
                className="col-span-12 rounded-[1.25rem] border border-[#E8E4DB] bg-white p-6 md:col-span-4 sm:p-8"
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

        {/* From brief to shortlist. */}
        <SectionCard>
          <RevealHeading title="From brief to shortlist" />
          <ol className={cn(bentoClass, "mt-14")}>
            {steps.map((step) => (
              <li
                key={step.number}
                className="col-span-12 rounded-[1.25rem] border border-[#E8E4DB] bg-white p-6 md:col-span-6 lg:col-span-3 sm:p-8"
              >
                <span className="text-sm font-semibold tabular-nums text-[#1B4D3E]">
                  {step.number}
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-[#0B1F1A]">
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

        {/* What you control, with one inline typography image. */}
        <SectionCard>
          <InlineImageText
            as="h2"
            before="What you"
            imageSrc="/images/bhutanese-students.jpg"
            imageAlt="Young Bhutanese people working in groups at a training day in Thimphu"
            creditFileUrl={PHOTO_CREDITS.valley}
            after="control"
            accessibleLabel="What you control"
          />
          <div className={cn(bentoClass, "mt-14")}>
            {controls.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="col-span-12 flex gap-4 rounded-[1.25rem] border border-[#E8E4DB] bg-white p-6 md:col-span-6 lg:col-span-3 sm:p-8"
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
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Shortlist packages. Prices and honesty stay in the config. */}
        <section
          id="pricing"
          className="w-full max-w-full overflow-x-hidden scroll-mt-24 px-5 py-32 sm:px-8 md:py-48 lg:px-12"
        >
          <div className="mx-auto w-full max-w-6xl">
            <h2 className={headingClass}>Premium shortlists</h2>
            <p className={cn(bodyClass, "mt-6")}>
              When you want a ranked list instead of sorting applicants yourself.
            </p>

            {/* Sample product panel: visibly a sample, no interactive action. */}
            <div
              role="group"
              aria-label="Sample shortlist order panel"
              className="mt-14 w-full max-w-3xl rounded-[1.25rem] border border-[#E8E4DB] bg-white p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#0B1F1A]">
                Sample shortlist order
              </h3>
              <p className="mt-1 text-xs text-[#0B1F1A]/60">
                Example order · not a live order
              </p>
              <p className="mt-7 border-t border-[#E8E4DB] pt-5 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[#0B1F1A]">
                Basic shortlist · {basicPrice}
              </p>
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

            <div
              role="region"
              aria-label="Shortlist packages"
              tabIndex={0}
              className={cn("mt-14", bentoClass, focusRing)}
            >
              <p className="sr-only">
                Premium shortlist packages, prices and what each includes
              </p>

              {/* Basic: quiet card. */}
              <article className="col-span-12 flex h-full flex-col rounded-[1.25rem] border border-[#E8E4DB] bg-white p-6 md:col-span-6 sm:p-8">
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

              {/* Full Support: the one featured card, with a hairline. */}
              <div className="col-span-12 rounded-[1.25rem] bg-gradient-to-br from-[#E8A317] via-[#E8E4DB] to-[#1B4D3E] p-px md:col-span-6">
                <article className="flex h-full flex-col rounded-[1.24rem] bg-[#1B4D3E] p-6 text-[#F7F4EE] sm:p-8">
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

        {/* Closing band: one saffron action. */}
        <section className="w-full max-w-full overflow-x-hidden px-5 pb-16 sm:px-8 lg:px-12">
          <div className="relative isolate mx-auto w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-[#E8E4DB] bg-white px-6 py-24 text-left sm:px-12">
            <h2 className="text-balance text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0B1F1A]">
              Post your first brief
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#0B1F1A]/75 sm:text-lg">
              Scoped work, verified students, payments in Ngultrum.
            </p>
            <div className="mt-8">
              <Link href={CTA_HREFS.contact} className={primaryCta}>
                {FOUNDER_ACCESS}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
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

/** Real heading, no eyebrow pill. */
function RevealHeading({ title }: { title: string }) {
  return (
    <h2 className={headingClass}>{title}</h2>
  );
}
