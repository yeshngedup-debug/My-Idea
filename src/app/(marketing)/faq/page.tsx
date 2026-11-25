import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { isValidElement, type ReactNode } from "react";
import {
  IdentificationCard,
  ListChecks,
  Plus,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CtaBand } from "@/components/marketing/cta-band";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { Chapter } from "@/components/marketing/guides/primitives";
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

type Question = { q: string; a: ReactNode };

type Cluster = {
  id: string;
  title: string;
  lead: string;
  Icon: typeof UsersThree;
  questions: Question[];
};

const MARKET_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg";

const INLINE_LINK_CLASS =
  "inline-flex min-h-6 items-center font-semibold text-[#b23c26] underline decoration-[#b23c26]/40 underline-offset-4 transition hover:decoration-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]";

const clusters: Cluster[] = [
  {
    id: "getting-started",
    title: "The basics",
    lead: "Who the platform serves, and how each side gets in.",
    Icon: UsersThree,
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
    Icon: IdentificationCard,
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
    Icon: ListChecks,
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

export default async function FaqPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <div className="min-h-[100dvh] bg-[#f5f2ea] text-[#18251f]">
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />

      <main id="main-content" className="overflow-x-clip">
        <section className="border-b border-[#17352b]/10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
              <HeroCopyEntrance>
                <h1 className="max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#17352b]">
                  Frequently asked questions
                </h1>
                <p className="mt-8 max-w-xl text-base leading-7 text-[#5e554a] sm:text-lg sm:leading-8">
                  Bhutanese students and startup founders, covered across
                  accounts, projects, applications and paid shortlists.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link
                    href="/how-it-works"
                    className="pressable inline-flex min-h-12 items-center rounded-lg bg-[#17352b] px-6 py-3 text-sm font-medium text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
                  >
                    See how it works
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
                  >
                    Ask us something
                  </Link>
                </div>
              </HeroCopyEntrance>
            </div>
          </div>
        </section>

        <StickySectionHeadings
          title="Frequently asked questions"
          eyebrow="Answers by topic"
          sections={stickySections}
          navLabel="FAQ topics"
        >
          {clusters.map((cluster) => {
            const ClusterIcon = cluster.Icon;
            return (
              <Chapter key={cluster.id} labelledBy={`${cluster.id}-heading`}>
                <div id={cluster.id} data-sticky-section>
                  <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:gap-12">
                    <div className="max-w-3xl">
                      <ClusterIcon
                        aria-hidden="true"
                        weight="light"
                        size={16}
                        strokeWidth={1.5}
                        className="text-[#b23c26]"
                      />
                      <h2
                        id={`${cluster.id}-heading`}
                        className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
                      >
                        {cluster.title}
                      </h2>
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-xl text-sm leading-7 text-[#18251f]/70 sm:text-base">
                        {cluster.lead}
                      </p>
                      <StaggerGroup className="mt-10 grid gap-x-16">
                        {cluster.questions.map((question) => (
                          <StaggerItem key={question.q}>
                            <details className="group grid gap-x-10 border-t border-[#17352b]/15 py-8 transition-colors hover:bg-[#fffefa] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                              <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f2ea] [&::-webkit-details-marker]:hidden">
                                <span className="text-lg font-semibold leading-snug text-[#17352b] sm:text-xl">
                                  {question.q}
                                </span>
                                <Plus
                                  aria-hidden="true"
                                  weight="light"
                                  strokeWidth={1.5}
                                  className="mt-1 h-5 w-5 shrink-0 text-[#b23c26] transition-transform duration-300 group-open:rotate-45"
                                />
                              </summary>
                              <div className="mt-5 max-w-2xl pr-8 text-sm leading-7 text-[#18251f]/70 sm:text-base lg:mt-0 lg:pr-12">
                                {question.a}
                              </div>
                            </details>
                          </StaggerItem>
                        ))}
                      </StaggerGroup>
                    </div>
                  </div>
                </div>
              </Chapter>
            );
          })}
        </StickySectionHeadings>

        <Chapter className="py-24 md:py-32" label="Photograph">
          <Reveal className="mx-auto max-w-[1440px]">
            <figure className="relative isolate aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#fffefa] sm:aspect-[21/9]">
              <Image
                src="/images/bhutanese-team.jpg"
                alt="Bhutanese students in kira performing in national dress"
                fill
                sizes="(max-width: 768px) 100vw, 90vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#17352b]/85 via-transparent to-transparent"
              />
              <figcaption className="absolute inset-x-5 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-8 sm:bottom-7">
                <span className="text-lg font-semibold text-white sm:text-xl">
                  Built for the people and places here
                </span>
                <PhotoCredit fileUrl={MARKET_CREDIT} className="text-white/85" />
              </figcaption>
            </figure>
          </Reveal>
        </Chapter>

        <div className="px-5 pb-8 sm:px-8 lg:px-12">
          <Reveal className="mx-auto max-w-[1440px]">
            <CtaBand
              title="Still have a question?"
              lead="Write to us and we will point you in the right direction."
              href="/contact"
              label="Contact the team"
            />
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
