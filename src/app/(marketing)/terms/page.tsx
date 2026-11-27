import type { Metadata } from "next";
import { APP_CONTACT } from "@/config/app";
import { MinimalClosingAction, MinimalSection } from "@/components/marketing/minimal-system";
import { resolveAction } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Bhutan Tech Connect terms of use: matching service terms, Premium Shortlist policy, fair use, and contact.",
  path: "/terms",
});

const privacyCta = resolveAction(null, "privacyPolicy");
const contactCta = resolveAction(null, "contactTeam");
const homeCta = resolveAction(null, "backHome");

export default function TermsPage() {
  return (
    <>
      <section className="content-shell py-16 md:py-24">
        <div className="max-w-[880px]">
          <h1 className="display-lg text-foreground">Terms of Use</h1>
          <p className="lead-copy mt-6">
            Bhutan Tech Connect is a matching service, not an employer. Your agreements stay yours.
          </p>
          <p className="quiet-note mt-5">Last updated: November 2026</p>
        </div>
      </section>

      <div className="hairline" />

      <MinimalSection id="what-this-platform-is" title="What this platform is">
        <p className="text-[17px] leading-[1.6] text-foreground">
          Bhutan Tech Connect is a matching service. We connect college students with startup
          founders and, optionally, provide paid, manually curated shortlists. We are not an
          employer, not an agent, and not a party to any work you do.
        </p>
      </MinimalSection>

      <MinimalSection id="your-agreements-are-your-own" title="Your agreements are your own">
        <ul className="space-y-3 text-[17px] leading-[1.6] text-foreground">
          <li>Students and founders arrange scope, timeline, and payment directly with each other.</li>
          <li>
            We recommend a simple written agreement before work starts. A template is provided in
            the founder dashboard.
          </li>
          <li>We are not responsible for payment disputes, work quality, or either party&apos;s conduct.</li>
        </ul>
      </MinimalSection>

      <MinimalSection id="premium-shortlists" title="Premium Shortlists">
        <ul className="space-y-3 text-[17px] leading-[1.6] text-foreground">
          <li>The fee covers research, curation, and ranking. It is not a hiring fee.</li>
          <li>Shortlists are delivered after payment is confirmed and are non-refundable once delivered.</li>
          <li>
            Shortlist contents are for hiring evaluation only and must not be redistributed or
            published.
          </li>
        </ul>
      </MinimalSection>

      <MinimalSection id="fair-use" title="Fair use">
        <ul className="space-y-3 text-[17px] leading-[1.6] text-foreground">
          <li>Be truthful in your profile, CV, and project postings.</li>
          <li>Do not misuse other users&apos; contact details. No spam or resale.</li>
          <li>Report abuse using the contact address below.</li>
        </ul>
      </MinimalSection>

      <MinimalSection id="questions" title="Questions">
        <p className="text-[17px] leading-[1.6] text-foreground">
          Questions about these terms? Email{" "}
          <a className="text-cta underline underline-offset-4 hover:text-cta-hover" href={`mailto:${APP_CONTACT.email}`}>
            {APP_CONTACT.email}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <a className="text-cta underline underline-offset-4 hover:text-cta-hover" href={privacyCta.href}>
            {privacyCta.label}
          </a>
          <a className="text-cta underline underline-offset-4 hover:text-cta-hover" href={contactCta.href}>
            {contactCta.label}
          </a>
          <a className="text-cta underline underline-offset-4 hover:text-cta-hover" href={homeCta.href}>
            {homeCta.label}
          </a>
        </div>
      </MinimalSection>

      <MinimalClosingAction
        title={contactCta.label}
        body="Questions about the terms or a project? Email the team."
        primaryLabel={contactCta.label}
        primaryHref={contactCta.href}
        secondaryLabel={homeCta.label}
        secondaryHref={homeCta.href}
      />
    </>
  );
}
