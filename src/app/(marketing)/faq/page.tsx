import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { isValidElement, type ReactNode } from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { ScrubbedTextReveal } from "@/components/motion";
import {
  StickySectionHeadings,
  type StickySection,
} from "@/components/layout/sticky-section-headings";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "Answers about student signup, founder access, profiles, applications, CV privacy, and how Premium Shortlist payments work.",
  path: "/faq",
});

/** Restrained editorial card system in the BTC palette. */
const card =
  "rounded-3xl border border-[#1B4D3E]/12 bg-white shadow-[0_2px_10px_rgba(11,31,26,0.04)]";
const cardBody = "p-6 sm:p-10 lg:p-14";
const band = "px-4 py-16 sm:px-6 md:py-24 lg:px-8";
const wideBand = "px-4 py-32 sm:px-6 md:py-48 lg:px-8";
const sectionHeading =
  "text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#0B1F1A] sm:text-4xl lg:text-5xl";
const accent = "text-[#E8A317]";
const muted = "text-[#5A6A61]";
const primaryCta =
  "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors hover:bg-[#F2B733] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

type Question = { q: string; a: ReactNode };

type Cluster = {
  id: string;
  title: string;
  lead: string;
  questions: Question[];
};

const MARKET_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg";

const INLINE_LINK_CLASS =
  "inline-flex min-h-6 items-center font-semibold text-[#1B4D3E] underline decoration-[#E8A317] decoration-2 underline-offset-4 transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

const clusters: Cluster[] = [
  {
    id: "getting-started",
    title: "The basics",
    lead: "Who the platform serves, and how each side gets in.",
    questions: [
      {
        q: "Who is this for?",
        a: (
          <>
            Bhutanese college students and startup founders: students build a
            profile and CV, then apply to paid projects, while founders post
            focused projects, browse student profiles, and can request a curated
            shortlist.
          </>
        ),
      },
      {
        q: "Is student signup free?",
        a: (
          <>
            Yes. Create a student account at{" "}
            <Link
              href="/signup"
              className={INLINE_LINK_CLASS}
            >
              /signup
            </Link>{" "}
            with no payment step; building your profile, browsing projects, and
            applying are free, and the Premium Shortlist is an optional paid
            founder feature.
          </>
        ),
      },
      {
        q: "How do founders get access?",
        a: (
          <>
            Founder accounts are assigned by an admin, not through
            public signup; email us through the{" "}
            <Link
              href="/contact"
              className={INLINE_LINK_CLASS}
            >
              contact page
            </Link>{" "}
            with your name and organisation, and we will arrange access; then{" "}
            <Link href="/login" className={INLINE_LINK_CLASS}>
              log in
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    id: "profiles-and-projects",
    title: "Profiles and projects",
    lead: "How profiles become findable, and how work begins.",
    questions: [
      {
        q: "What makes a profile visible to founders?",
        a: (
          <>
            Founders browse profiles that show a name, college and skills. Every
            listed student has an uploaded CV. A bio and availability help them
            judge fit. Admins set the rank and verified badge.
          </>
        ),
      },
      {
        q: "How are students verified?",
        a: (
          <>
            An admin sets the rank and verified badge by hand in the admin
            workspace. The platform does not calculate either value; questions
            can go to the{" "}
            <Link
              href="/contact"
              className={INLINE_LINK_CLASS}
            >
              contact page
            </Link>
            .
          </>
        ),
      },
      {
        q: "How do applications work?",
        a: (
          <>
            Browse and apply through{" "}
            <Link href="/student/projects" className={INLINE_LINK_CLASS}>
              your projects
            </Link>
            , track{" "}
            <Link href="/student/applications" className={INLINE_LINK_CLASS}>
              your applications
            </Link>
            , and note that founders can update an applicant&apos;s status on
            their own projects.
          </>
        ),
      },
      {
        q: "Can anyone see a student's CV or contact details?",
        a: (
          <>
            CVs are not public: they sit in a private bucket served through
            role-checked links. Founders can open one when a student has applied
            to one of their projects, or for a student on their shortlist after
            an admin confirms a paid order. Admins can open any CV. Contact
            details appear in a confirmed shortlist. Files are never publicly
            listed.
          </>
        ),
      },
    ],
  },
  {
    id: "shortlists-and-payments",
    title: "Shortlists, payments and launch",
    lead: "What happens after a founder decides to go further.",
    questions: [
      {
        q: "How does the Premium Shortlist payment work?",
        a: (
          <>
            On{" "}
            <Link href="/founder/shortlists" className={INLINE_LINK_CLASS}>
              the shortlist page
            </Link>
            , choose a package. New orders pause until the bank and mBoB details
            are published; then pay by bank transfer or mBoB, upload a payment
            screenshot, and wait for an admin to review it. Orders without a
            screenshot cannot be confirmed.
          </>
        ),
      },
      {
        q: "When does the shortlist become available?",
        a: (
          <>
            Only after an admin confirms the payment. Founders cannot confirm
            their own order. The ranked shortlist appears once an admin
            finalizes it, with CV links for students who uploaded one.
          </>
        ),
      },
      {
        q: "How are payments verified?",
        a: (
          <>
            Manually: an admin opens the uploaded screenshot to confirm
            or reject the order, a confirmation requires a screenshot, and
            founders cannot confirm their own payment.
          </>
        ),
      },
      {
        q: "What happens to demo accounts before launch?",
        a: (
          <>
            Demo accounts are for local and E2E testing only. Legacy
            @btc-test.com users are deleted by a hardening migration; current
            seeded users use @btc-e2e.test and must be removed before launch.
          </>
        ),
      },
    ],
  },
];

const stickySections: readonly StickySection[] = clusters.map(({ id, title }) => ({
  id,
  label: title,
}));

function plainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return plainText(node.props.children);
  }
  return "";
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: clusters.flatMap((cluster) =>
    cluster.questions.map((question) => ({
      "@type": "Question",
      name: question.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: plainText(question.a),
      },
    }))
  ),
};

/** Split an existing cluster title so one phrase carries the saffron accent. */
function AccentTitle({ title }: { title: string }) {
  const words = title.split(" ");
  const last = words[words.length - 1];
  return (
    <>
      {words.slice(0, -1).join(" ")}{" "}
      <span className={accent}>{last}</span>
    </>
  );
}

export default async function FaqPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <div className="min-h-[100dvh] bg-[#F7F4EE] text-[#0B1F1A]">
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />

      <main
        id="main-content"
        className="w-full max-w-full overflow-x-clip"
      >
        {/* Editorial split heading with one credited local photograph. */}
        <section aria-labelledby="faq-heading" className={wideBand}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-12 grid-flow-dense gap-4">
              <HeroCopyEntrance className="col-span-12 flex flex-col justify-center px-2 py-6 md:col-span-7 md:px-8 lg:pr-16">
                <h1
                  id="faq-heading"
                  className="w-full max-w-6xl text-balance text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#0B1F1A]"
                >
                  <ScrubbedTextReveal
                    as="span"
                    text="Frequently asked"
                    className="[&_span]:!text-[#0B1F1A]"
                  />{" "}
                  <span className={accent}>questions</span>
                </h1>
                <p className={`mt-10 max-w-xl text-lg leading-8 sm:text-xl ${muted}`}>
                  Bhutanese students and startup founders, covered across
                  accounts, projects, applications and paid shortlists.
                </p>
                <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href="/how-it-works" className={primaryCta}>
                    See how it works
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-[#1B4D3E] transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                  >
                    Ask us something
                  </Link>
                </div>
              </HeroCopyEntrance>

              <figure className="col-span-12 md:col-span-5">
                <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#0B1F1A]">
                  <Image
                    src="/images/bhutanese-team.jpg"
                    alt="Bhutanese students in kira performing in national dress"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 38vw"
                    className="object-cover object-center grayscale contrast-[1.15] opacity-85"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 55% 40%, rgba(11,31,26,0.04) 0%, rgba(11,31,26,0.8) 100%)",
                    }}
                  />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="text-sm font-medium text-[#0B1F1A]">
                    Built for the people and places here
                  </span>
                  <PhotoCredit fileUrl={MARKET_CREDIT} className="text-[#5A6A61]" />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <StickySectionHeadings
          title="Frequently asked questions"
          eyebrow="Answers by topic"
          sections={stickySections}
          navLabel="FAQ topics"
        >
          {clusters.map((cluster) => (
            <section
              key={cluster.id}
              aria-labelledby={`${cluster.id}-heading`}
              className={band}
            >
              <div className="mx-auto w-full max-w-[1440px]">
                <div className={`${card} ${cardBody}`}>
                  <div id={cluster.id} data-sticky-section>
                    <h2
                      id={`${cluster.id}-heading`}
                      className={`${sectionHeading} text-left`}
                    >
                      <AccentTitle title={cluster.title} />
                    </h2>
                    <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${muted}`}>
                      <ScrubbedTextReveal
                        as="span"
                        text={cluster.lead}
                        className="[&_span]:!text-[#5A6A61]"
                      />
                    </p>
                    {/*
                     * The native <details> state stays the single source of
                     * truth. Each row is a 12-column slice; the question holds
                     * five columns and the answer opens into the remaining
                     * seven on desktop. Hover and focus only mark the row.
                     */}
                    <StaggerGroup className="mx-auto mt-12 grid max-w-5xl gap-3">
                      {cluster.questions.map((question) => (
                        <StaggerItem key={question.q}>
                          <details className="group grid grid-cols-12 gap-x-4 rounded-[1.25rem] border border-[#1B4D3E]/10 border-l-2 border-l-transparent bg-white py-6 transition-[background-color,border-color] hover:bg-[#F7F4EE]/70 focus-within:bg-[#F7F4EE]/70 group-hover:border-l-[#E8A317] group-focus-within:border-l-[#E8A317] motion-reduce:transition-none md:gap-x-8">
                            <summary className="col-span-12 flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 rounded-sm px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-4 focus-visible:ring-offset-white [&::-webkit-details-marker]:hidden sm:px-6 md:col-span-5">
                              <span className="text-lg font-semibold leading-snug text-[#0B1F1A] sm:text-xl">
                                {question.q}
                              </span>
                              <Plus
                                aria-hidden="true"
                                weight="light"
                                strokeWidth={1.5}
                                className="mt-1 h-5 w-5 shrink-0 text-[#E8A317] transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                              />
                            </summary>
                            <div className="col-span-12 mt-5 max-w-2xl px-5 pr-8 text-sm leading-7 text-[#0B1F1A]/75 sm:px-6 sm:text-base md:col-span-7 md:mt-0 md:border-l md:border-[#1B4D3E]/12 md:pl-8 md:pr-4">
                              {question.a}
                            </div>
                          </details>
                        </StaggerItem>
                      ))}
                    </StaggerGroup>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </StickySectionHeadings>

        <section aria-label="Photograph" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} overflow-hidden`}>
              <Reveal>
                <figure className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#E8E4DB] sm:aspect-[21/9]">
                  <Image
                    src="/images/bhutanese-team.jpg"
                    alt="Bhutanese students in kira performing in national dress"
                    fill
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#1B4D3E]/85 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-5 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-8 sm:bottom-7">
                    <span className="text-lg font-semibold text-white sm:text-xl">
                      Built for the people and places here
                    </span>
                    <PhotoCredit fileUrl={MARKET_CREDIT} className="text-white/85" />
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={wideBand}>
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <div className="rounded-3xl border border-[#1B4D3E]/12 bg-[#1B4D3E] px-6 py-20 text-center sm:px-10 sm:py-28">
                <h2 className="text-balance text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
                  Still have a <span className={accent}>question?</span>
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-[1.65] text-[#E8E4DB] sm:text-lg">
                  Write to us and we will point you in the right direction.
                </p>
                <div className="mt-10 flex justify-center">
                  <Link href="/contact" className={primaryCta}>
                    Contact the team
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
