import {
  CurrencyCircleDollar,
  Files,
  Lifebuoy,
  Question as QuestionIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { isValidElement } from "react";
import {
  MinimalActions,
  MinimalClosingAction,
  MinimalHero,
  MinimalMedia,
  MinimalSection,
  PrimaryAction,
  TextAction,
} from "@/components/marketing/minimal-system";
import { CTA_HREFS, CTA_LABELS } from "@/components/marketing/nav";
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
  questions: Question[];
};

const inlineLink =
  "text-primary underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground";

const clusters: readonly Cluster[] = [
  {
    id: "getting-started",
    title: "The basics",
    lead: "Who the platform serves, and how each side gets in.",
    questions: [
      {
        q: "Who is this for?",
        a: (
          <>
            Bhutanese college students and startup founders. Students build a
            profile and CV, then apply to paid projects. Founders post focused
            projects, browse student profiles, and can request a curated
            shortlist.
          </>
        ),
      },
      {
        q: "Is student signup free?",
        a: (
          <>
            Yes. Create a student account at{" "}
            <Link href={CTA_HREFS.signup} className={inlineLink}>
              /signup
            </Link>{" "}
            with no payment step. Building your profile, browsing projects, and
            applying are free. The Premium Shortlist is an optional paid founder
            feature.
          </>
        ),
      },
      {
        q: "How do founders get access?",
        a: (
          <>
            Founder accounts are assigned by an admin, not through public
            signup. Email us through the{" "}
            <Link href={CTA_HREFS.contact} className={inlineLink}>
              contact page
            </Link>{" "}
            with your name and organisation, then{" "}
            <Link href={CTA_HREFS.login} className={inlineLink}>
              log in
            </Link>{" "}
            once access is arranged.
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
            workspace. The platform does not calculate either value. Questions
            can go to the{" "}
            <Link href={CTA_HREFS.contact} className={inlineLink}>
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
            <Link href={CTA_HREFS.studentProjects} className={inlineLink}>
              your projects
            </Link>
            , and track{" "}
            <Link href={CTA_HREFS.studentApplications} className={inlineLink}>
              your applications
            </Link>
            . Founders can update an applicant&apos;s status on their own
            projects.
          </>
        ),
      },
      {
        q: "Can anyone see a student's CV or contact details?",
        a: (
          <>
            CVs are not public. They sit in a private bucket served through
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
            <Link href={CTA_HREFS.founderShortlists} className={inlineLink}>
              the shortlist page
            </Link>
            , choose a package. New orders pause until the bank and mBoB details
            are published. Then pay by bank transfer or mBoB, upload a payment
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
            Manually. An admin opens the uploaded screenshot to confirm or
            reject the order. A confirmation requires a screenshot, and founders
            cannot confirm their own payment.
          </>
        ),
      },
      {
        q: "Can I use a demo account?",
        a: (
          <>
            Student accounts are open through public signup. Founder access is
            assigned by an admin through the{" "}
            <Link href={CTA_HREFS.contact} className={inlineLink}>
              contact page
            </Link>
            . Demo and test accounts are not part of the public workspace;
            contact the team if you need access.
          </>
        ),
      },
    ],
  },
];

const clusterIcons = [QuestionIcon, Files, CurrencyCircleDollar] as const;

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
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <MinimalHero
        title="Frequently asked questions."
        description="Accounts, projects, applications, and paid shortlists, answered plainly."
        actions={
          <MinimalActions>
            <PrimaryAction href={CTA_HREFS.contact} label={CTA_LABELS.askUs} />
            <TextAction
              href={CTA_HREFS.howItWorks}
              label={CTA_LABELS.seeHow}
            />
          </MinimalActions>
        }
        media={
          <MinimalMedia
            icon={QuestionIcon}
            label="Plain answers about accounts, applications and paid shortlists."
          />
        }
      />

      {clusters.map((cluster, index) => (
        <MinimalSection
          key={cluster.id}
          id={cluster.id}
          icon={clusterIcons[index]}
          tone={index % 2 === 0 ? "muted" : "plain"}
          titleId={`${cluster.id}-heading`}
          title={cluster.title}
          description={cluster.lead}
          motionKey={`cluster-${cluster.id}`}
        >
          <div
            data-motion-group="questions"
            className="max-w-[54rem] border-t border-border"
          >
            {cluster.questions.map((question) => (
              <details
                key={question.q}
                data-motion-item=""
                className="group border-b border-border"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-[1.125rem] font-medium leading-snug tracking-[-0.01em] transition-colors duration-150 hover:text-primary">
                  <span className="max-w-[46rem]">{question.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <div className="max-w-[52rem] pb-7 pr-8 text-[1.0625rem] leading-[1.6] text-muted-foreground">
                  {question.a}
                </div>
              </details>
            ))}
          </div>
        </MinimalSection>
      ))}

      <MinimalClosingAction
        icon={Lifebuoy}
        tone="plain"
        title="Still have a question?"
        description="Write to us and we will point you in the right direction."
        primaryLabel={CTA_LABELS.contactTeam}
        primaryHref={CTA_HREFS.contact}
        secondaryLabel={CTA_LABELS.readProcess}
        secondaryHref={CTA_HREFS.howItWorks}
        motionKey="closing"
      />
    </>
  );
}
