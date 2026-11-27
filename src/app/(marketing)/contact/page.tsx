import { Envelope } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MinimalActions,
  MinimalCheckList,
  MinimalClosingAction,
  MinimalFacts,
  MinimalHero,
  MinimalMedia,
  MinimalSection,
  PrimaryAction,
  TextAction,
} from "@/components/marketing/minimal-system";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
} from "@/components/marketing/nav";
import { APP_CONTACT } from "@/config/app";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description:
    "Questions about student signup, founder access, or a project? Email the Bhutan Tech Connect team.",
  path: "/contact",
});

const generalBody = [
  "Role (student, founder, or visitor):",
  "Page or feature:",
  "Project or order reference (if any):",
].join("\r\n");
const founderBody = ["Name:", "Organisation:", "Project idea:"].join("\r\n");

const generalHref = `mailto:${APP_CONTACT.email}?subject=${encodeURIComponent(
  "Question about Bhutan Tech Connect",
)}&body=${encodeURIComponent(generalBody)}`;
const founderHref = `mailto:${APP_CONTACT.email}?subject=${encodeURIComponent(
  "Founder access request",
)}&body=${encodeURIComponent(founderBody)}`;

const messageChecklist = [
  "Say whether you are a student, founder, or visitor.",
  "Name the page or feature your question is about.",
  "Share the project or order reference, if you have one.",
] as const;

const helpfulLinks = [
  {
    href: CTA_HREFS.home,
    title: "The public home page",
    note: "A plain-language overview of the platform.",
  },
  {
    href: CTA_HREFS.howItWorks,
    title: CTA_LABELS.howItWorks,
    note: "The three steps from brief to finished work.",
  },
] as const;

const inlineLink =
  "text-primary underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground";

export default function ContactPage() {
  return (
    <>
      <MinimalHero
        title="Email the Bhutan Tech Connect team."
        description="Questions about student signup, founder access, or a project? We read every message and reply as soon as we can."
        actions={
          <MinimalActions>
            <PrimaryAction
              href={generalHref}
              label={CTA_LABELS.contactUs}
            />
            <TextAction href={founderHref} label={FOUNDER_ACCESS.label} />
          </MinimalActions>
        }
        note={
          <>
            Write to{" "}
            <a href={generalHref} className={inlineLink}>
              {APP_CONTACT.email}
            </a>
            .
          </>
        }
        media={
          <MinimalMedia
            icon={Envelope}
            label="One email address for student questions, founder access and platform help."
          />
        }
      />

      <MinimalSection
        titleId="contact-include-heading"
        title="Tell us what you need"
        description="One email address for every question. No form and no ticket queue."
      >
        <div className="max-w-[46rem]">
          <MinimalCheckList items={messageChecklist} />
          <p className="quiet-note mt-8">
            We answer questions about the platform, student profiles, projects,
            and access requests.
          </p>
        </div>
      </MinimalSection>

      <MinimalSection
        titleId="contact-founders-heading"
        title="Founder access is assigned by an admin"
        description="Founder accounts are not created through public signup. Tell us who you are and what you are building."
      >
        <div className="max-w-[46rem]">
          <p className="text-[1.0625rem] leading-[1.6] text-muted-foreground">
            Include your name, organisation, and a line about the project you
            have in mind. An admin will reply with the next step.
          </p>
          <MinimalActions>
            <PrimaryAction
              href={founderHref}
              label={FOUNDER_ACCESS.label}
            />
            <TextAction href={CTA_HREFS.faq} label={CTA_LABELS.faq} />
          </MinimalActions>
        </div>
      </MinimalSection>

      <MinimalSection
        titleId="contact-pages-heading"
        title="Read first"
        description="A few pages answer common questions before you write."
      >
        <div className="max-w-[54rem]">
          <MinimalFacts
            items={helpfulLinks.map((item) => ({
              term: (
                <Link href={item.href} className={inlineLink}>
                  {item.title}
                </Link>
              ),
              detail: item.note,
            }))}
          />
        </div>
      </MinimalSection>

      <MinimalClosingAction
        title="Prefer to read first?"
        description="Common questions are answered on the FAQ page."
        primaryLabel={CTA_LABELS.faq}
        primaryHref={CTA_HREFS.faq}
        secondaryLabel={CTA_LABELS.publicHome}
        secondaryHref={CTA_HREFS.home}
      />
    </>
  );
}
