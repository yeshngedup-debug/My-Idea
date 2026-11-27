import type { Metadata } from "next";
import { APP_CONTACT } from "@/config/app";
import { MinimalClosingAction, MinimalSection } from "@/components/marketing/minimal-system";
import { CTA_HREFS, CTA_LABELS } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Bhutan Tech Connect privacy policy: what we collect, how we use your data, and how to request deletion.",
  path: "/privacy",
});

const chapters = [
  {
    id: "what-we-collect",
    title: "What we collect",
    paragraphs: [
      "We collect the details you give us when you create an account: your name, email address, college, course, year of study, availability, skills and a short bio. Students may upload a CV. Founders provide project briefs and payment details when they order a shortlist.",
      "We also keep basic records of account access and activity so the service works and stays safe.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    paragraphs: [
      "We use your information to verify accounts, show relevant projects and applicants, deliver the shortlist service, and answer questions about your account.",
      "We do not sell personal information.",
    ],
  },
  {
    id: "who-can-see-your-data",
    title: "Who can see your data",
    paragraphs: [
      "Founders see the applicant details included in a shortlist. Students see the project details needed to apply. Administrators can access account and project information to verify people, review applications and support the service.",
      "Your CV stays private. It opens through a time-limited link from a shortlist, not from a public profile.",
    ],
  },
  {
    id: "what-we-never-do",
    title: "What we never do",
    paragraphs: [
      "We do not post public salaries, publish applicant lists, or sell access to student data. We do not use automated ranking to decide who is verified.",
    ],
  },
  {
    id: "retention-and-deletion",
    title: "Retention and deletion",
    paragraphs: [
      "We keep account and project records while your account is active and for as long as we need them to deliver the service, meet legal obligations, and resolve disputes.",
      "You can ask us to delete your account and personal data. We will remove it unless we are required to keep specific records.",
    ],
  },
  {
    id: "cookies-and-analytics",
    title: "Cookies and analytics",
    paragraphs: [
      "We use essential cookies to keep you signed in and to keep the site secure. We do not use advertising trackers.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      "If this policy changes, we will update the date below and explain the change where it matters.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [
      `For privacy questions or a deletion request, email ${APP_CONTACT.email}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="content-shell py-16 md:py-24">
        <div className="max-w-[880px]">
          <h1 className="display-lg text-foreground">Privacy Policy</h1>
          <p className="lead-copy mt-6">
            Short, plain English. This policy covers the MVP scope of Bhutan Tech Connect.
          </p>
          <p className="quiet-note mt-5">Last updated: 10 March 2026</p>
        </div>
      </section>

      <div className="hairline" />

      {chapters.map((chapter) => (
        <MinimalSection key={chapter.id} id={chapter.id} title={chapter.title}>
          <div className="space-y-5">
            {chapter.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-[17px] leading-[1.6] text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </MinimalSection>
      ))}

      <MinimalClosingAction
        title="Questions about your data?"
        body="Email us and we will help you with access or deletion."
        primaryLabel="Contact us"
        primaryHref={CTA_HREFS.contact}
        secondaryLabel={CTA_LABELS.browseProjects}
        secondaryHref={CTA_HREFS.studentProjects}
      />
    </>
  );
}
