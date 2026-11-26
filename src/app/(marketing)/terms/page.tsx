/**
 * Terms of Use — short, plain English, MVP scope.
 *
 * Same editorial document layout as the privacy page: ruled contents column,
 * one measure of copy, hairlines between chapters.
 */
import { APP_CONTACT } from "@/config/app";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  Band,
  RuleLink,
  container,
  focusRing,
  gutters,
  hairline,
} from "@/components/marketing/editorial";
import { resolveAction } from "@/components/marketing/nav";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Terms of Use",
  description:
    "Bhutan Tech Connect terms of use: matching service terms, Premium Shortlist policy, fair use, and contact.",
  alternates: {
    canonical: "https://bhutantech.bt/terms",
  },
};

const chapters = [
  { id: "what-this-platform-is", label: "What this platform is" },
  { id: "your-agreements-are-your-own", label: "Your agreements are your own" },
  { id: "premium-shortlists", label: "Premium Shortlists" },
  { id: "fair-use", label: "Fair use" },
  { id: "questions", label: "Questions" },
] as const;

const tocLink = `inline-flex min-h-11 items-baseline gap-2 py-2 text-sm font-medium text-[#356464] transition-colors hover:text-[#0b2e2e] ${focusRing}`;

const bodyCopy =
  "text-[#356464] [&_strong]:font-semibold [&_strong]:text-[#0b2e2e]";

const listCopy = `mt-7 list-disc space-y-3 border-t pl-5 pt-7 text-base leading-7 marker:text-[#c2004b] sm:text-lg sm:leading-8 ${hairline} ${bodyCopy}`;

const chapterHeading =
  "text-[clamp(1.6rem,2.6vw,2.15rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-[#0b2e2e]";

const mailLink = `inline-flex min-h-6 items-center font-semibold text-[#0b5c5c] underline decoration-[#ff0063] decoration-1 underline-offset-4 transition-colors hover:text-[#0b2e2e] ${focusRing}`;

const privacyCta = resolveAction(null, "privacyPolicy");
const contactCta = resolveAction(null, "contactTeam");
const homeCta = resolveAction(null, "backHome");

const chapter = cn("scroll-mt-24 border-t py-12 sm:py-14", hairline);

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        <Band className="border-b border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-12 md:py-16")}>
            <p className="index-label">Legal · Terms</p>
            <h1 className="display-xl mt-6 max-w-[14ch]">Terms of Use</h1>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-[#0b2e2e]/12 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#356464]">
                Last updated · November 2026
              </p>
              <p className="max-w-[52ch] text-[15px] leading-7 text-[#356464]">
                A matching service, not an employer. Your agreements stay yours.
              </p>
            </div>
          </div>
        </Band>

        <div className={cn(container, gutters, "pb-20 md:pb-28")}>
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:gap-12">
            <nav
              aria-label="On this page"
              className="min-w-0 lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
            >
              <p className="border-b border-[#0b2e2e]/15 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0b5c5c]">
                Contents
              </p>
              <ol className="mt-3 flex flex-wrap gap-x-5 lg:flex-col lg:gap-0">
                {chapters.map((item, index) => (
                  <li key={item.id} className="lg:border-b lg:border-[#0b2e2e]/10">
                    <a href={`#${item.id}`} className={tocLink}>
                      <span className="text-[10px] font-semibold tabular-nums tracking-[0.16em] text-[#c2004b]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="min-w-0 lg:col-span-8 lg:col-start-5">
              <div className="max-w-[68ch]">
                <section
                  id="what-this-platform-is"
                  aria-labelledby="what-this-platform-is-heading"
                  className="scroll-mt-24 pb-12 pt-2 sm:pb-14"
                >
                  <h2
                    id="what-this-platform-is-heading"
                    className={chapterHeading}
                  >
                    What this platform is
                  </h2>
                  <p
                    className={cn(
                      "mt-7 border-t pt-7 text-base leading-7 sm:text-lg sm:leading-8",
                      hairline,
                      bodyCopy,
                    )}
                  >
                    Bhutan Tech Connect is a{" "}
                    <strong className="font-semibold text-[#0b2e2e]">
                      matching service
                    </strong>
                    . We connect college students with startup founders and,
                    optionally, provide paid, manually curated shortlists. We are{" "}
                    <strong className="font-semibold text-[#0b2e2e]">
                      not an employer
                    </strong>
                    ,{" "}
                    <strong className="font-semibold text-[#0b2e2e]">
                      not an agent
                    </strong>
                    , and not a party to any work you do.
                  </p>
                </section>

                <section
                  id="your-agreements-are-your-own"
                  aria-labelledby="your-agreements-are-your-own-heading"
                  className={chapter}
                >
                  <h2
                    id="your-agreements-are-your-own-heading"
                    className={chapterHeading}
                  >
                    Your agreements are your own
                  </h2>
                  <ul className={listCopy}>
                    <li>
                      Students and founders arrange scope, timeline, and payment
                      directly with each other.
                    </li>
                    <li>
                      We recommend a simple written agreement before work starts
                      (a template is provided in the founder dashboard).
                    </li>
                    <li>
                      We are not responsible for payment disputes, work quality,
                      or either party&apos;s conduct.
                    </li>
                  </ul>
                </section>

                <section
                  id="premium-shortlists"
                  aria-labelledby="premium-shortlists-heading"
                  className={chapter}
                >
                  <h2
                    id="premium-shortlists-heading"
                    className={chapterHeading}
                  >
                    Premium Shortlists
                  </h2>
                  <ul className={listCopy}>
                    <li>
                      The fee covers research, curation, and ranking. It is not a
                      hiring fee.
                    </li>
                    <li>
                      Shortlists are delivered after payment is confirmed and are
                      non-refundable once delivered.
                    </li>
                    <li>
                      Shortlist contents are for hiring evaluation only and must
                      not be redistributed or published.
                    </li>
                  </ul>
                </section>

                <section
                  id="fair-use"
                  aria-labelledby="fair-use-heading"
                  className={chapter}
                >
                  <h2 id="fair-use-heading" className={chapterHeading}>
                    Fair use
                  </h2>
                  <ul className={listCopy}>
                    <li>
                      Be truthful in your profile, CV, and project postings.
                    </li>
                    <li>
                      Do not misuse other users&apos; contact details (no spam, no
                      resale).
                    </li>
                    <li>Report abuse using the contact address below.</li>
                  </ul>
                </section>

                <section
                  id="questions"
                  aria-labelledby="questions-heading"
                  className={chapter}
                >
                  <h2 id="questions-heading" className={chapterHeading}>
                    Questions
                  </h2>
                  <p
                    className={cn(
                      "mt-7 border-t pt-7 text-base leading-7 sm:text-lg sm:leading-8",
                      hairline,
                      bodyCopy,
                    )}
                  >
                    Questions about these terms:{" "}
                    <a href={`mailto:${APP_CONTACT.email}`} className={mailLink}>
                      {APP_CONTACT.email}
                    </a>
                  </p>
                  <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
                    <RuleLink href={privacyCta.href}>
                      {privacyCta.label}
                    </RuleLink>
                    <RuleLink href={contactCta.href}>
                      {contactCta.label}
                    </RuleLink>
                    <RuleLink href={homeCta.href}>{homeCta.label}</RuleLink>
                  </div>
                </section>
              </div>
            </article>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
