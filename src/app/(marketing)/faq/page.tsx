import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
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
import { InlineImageText } from "@/components/editorial";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { GsapScaleFadeImage } from "@/components/marketing/editorial-page-motion";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { ChapterProgress, type ChapterLink } from "@/components/motion";
import { ScrubbedTextReveal } from "@/components/motion";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

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
  questions: Question[];
};

/** Inline link inside body copy: a hairline underline that turns magenta. */
const INLINE_LINK_CLASS =
  "font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 decoration-1 underline-offset-[5px] transition-colors hover:decoration-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const chapters: ChapterLink[] = [
  { id: "getting-started", label: "The basics" },
  { id: "profiles-and-projects", label: "Profiles and projects" },
  { id: "shortlists-and-payments", label: "Shortlists and payments" },
];

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
            <Link href="/signup" className={INLINE_LINK_CLASS}>
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
            Founder accounts are assigned by an admin, not through public
            signup; email us through the{" "}
            <Link href="/contact" className={INLINE_LINK_CLASS}>
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
            <Link href="/contact" className={INLINE_LINK_CLASS}>
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
            Manually: an admin opens the uploaded screenshot to confirm or
            reject the order, a confirmation requires a screenshot, and founders
            cannot confirm their own payment.
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
    })),
  ),
};

export default async function FaqPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        <EditorialHero
          index="01"
          eyebrow="Answers, plainly"
          title={
            <>
              Frequently asked{" "}
              <span className="text-[#0b5c5c]">questions.</span>
            </>
          }
          lead="Bhutanese students and startup founders, covered across accounts, projects, applications and paid shortlists."
          primaryCta={{ href: "/how-it-works", label: "See how it works" }}
          secondary={{ href: "/contact", label: "Ask us something" }}
          image={{
            src: "/images/bhutanese-team.jpg",
            alt: "Bhutanese students in kira performing in national dress",
            fileUrl: PHOTO_CREDITS.market,
          }}
          caption="Built for the people and places here"
          imagePosition="object-center"
        />

        {/* One statement, scrubbed in. */}
        <Band tone="mist" className="border-b border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-14 md:py-20")}>
            <p className="index-label">Eleven answers</p>
            <ScrubbedTextReveal
              as="p"
              text="Every answer here is a rule the platform actually follows."
              className="mt-6 max-w-[24ch] text-[clamp(1.75rem,3.6vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#0b2e2e] md:max-w-[28ch]"
            />
          </div>
        </Band>

        <ChapterProgress
          chapters={chapters}
          className="sticky top-16 z-30 border-[#0b2e2e]/12 bg-white [&_a]:text-[#0b2e2e] [&_a:hover]:text-[#0b5c5c] [&_a]:focus-visible:ring-[#0b5c5c] [&_a]:focus-visible:ring-offset-white [&_a[aria-current]]:text-[#0b5c5c] [&_a[aria-current]]:decoration-[#ff0063] [&_a[aria-current]]:decoration-1 [&_a[aria-current]]:underline-offset-[10px] [&_[data-chapter-bar]]:bg-[#ff0063]"
        />

        {clusters.map((cluster, clusterIndex) => (
          <Band
            key={cluster.id}
            id={cluster.id}
            tone={clusterIndex % 2 === 1 ? "mist" : "paper"}
            labelledBy={`${cluster.id}-heading`}
            className={cn(
              "scroll-mt-24",
              clusterIndex % 2 === 1 && "border-y border-[#0b2e2e]/10",
            )}
          >
            <div className={cn(container, gutters, "py-20 md:py-28")}>
              <MarketingReveal>
                <SectionHead
                  index={String(clusterIndex + 2).padStart(2, "0")}
                  eyebrow={cluster.title}
                  id={`${cluster.id}-heading`}
                  title={cluster.title}
                  lead={cluster.lead}
                />
              </MarketingReveal>

              <div className="mt-12 border-t border-[#0b2e2e]/15">
                {cluster.questions.map((question, index) => (
                  <MarketingReveal key={question.q} delay={index * 0.04}>
                    <details className="group border-b border-[#0b2e2e]/15">
                      <summary
                        className={cn(
                          "grid cursor-pointer list-none grid-cols-[2rem_1fr_auto] items-start gap-4 py-6 sm:gap-6 [&::-webkit-details-marker]:hidden",
                          focusRing,
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="pt-1 text-[11px] font-semibold tabular-nums tracking-[0.16em] text-[#c2004b]"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="max-w-[46ch] text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-[#0b2e2e] transition-colors group-hover:text-[#0b5c5c] sm:text-[1.15rem]">
                          {question.q}
                        </span>
                        <Plus
                          aria-hidden="true"
                          weight="light"
                          strokeWidth={1.6}
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#c2004b] transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                        />
                      </summary>
                      <div className="pb-7 pl-0 pr-8 text-[15px] leading-7 text-[#356464] sm:pl-[3.5rem]">
                        <div className="max-w-[62ch]">{question.a}</div>
                      </div>
                    </details>
                  </MarketingReveal>
                ))}
              </div>
            </div>
          </Band>
        ))}

        {/* Inline typography photograph: one intact accessible heading. */}
        <Band labelledBy="faq-themes-heading" className="border-t border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-20 md:py-28")}>
            <MarketingReveal>
              <InlineImageText
                as="h2"
                id="faq-themes-heading"
                before="Answers built around"
                imageSrc="/images/bhutanese-students.jpg"
                imageAlt="Bhutanese students working together"
                creditFileUrl={PHOTO_CREDITS.valley}
                accessibleLabel="Answers built around real work: Bhutanese students working together"
                after="real work"
              />
            </MarketingReveal>

            <MarketingReveal className="mt-14">
              <GsapScaleFadeImage>
                <figure>
                  <div className="plate relative aspect-[4/3] overflow-hidden sm:aspect-[21/9]">
                    <Image
                      src="/images/thimphu-city.jpg"
                      alt="Thimphu, the capital of Bhutan, seen across the valley"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover object-center"
                    />
                  </div>
                  <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[#0b2e2e]/10 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#356464]">
                      Thimphu, Bhutan
                    </span>
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.thimphu}
                      className="text-[#356464]"
                    />
                  </figcaption>
                </figure>
              </GsapScaleFadeImage>
            </MarketingReveal>
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
                Still have a question?
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                Write to us and we will point you in the right direction.
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href="/contact">Contact the team</Action>
              <RuleLink
                href="/how-it-works"
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
