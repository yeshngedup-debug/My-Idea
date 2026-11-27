/**
 * Privacy Policy — short, plain English, MVP scope.
 *
 * Editorial layout: paper ground, a sticky ruled contents column, and one
 * measure of body copy. No cards, no shadows.
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
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Bhutan Tech Connect privacy policy: what we collect, how we use your data, and how to request deletion.",
  path: "/privacy",
});

const chapters = [
  { id: "what-we-collect", label: "What we collect" },
  { id: "how-we-use-it", label: "How we use it" },
  { id: "who-can-see-your-data", label: "Who can see your data" },
  { id: "what-we-never-do", label: "What we never do" },
  { id: "deleting-your-data", label: "Deleting your data" },
] as const;

const tocLink = `inline-flex min-h-11 items-baseline gap-2 py-2 text-sm font-medium text-[#356464] transition-colors hover:text-[#0b2e2e] ${focusRing}`;

const bodyCopy =
  "text-[#356464] [&_strong]:font-semibold [&_strong]:text-[#0b2e2e]";

const listCopy = `mt-7 list-disc space-y-3 border-t pl-5 pt-7 text-base leading-7 marker:text-[#c2004b] sm:text-lg sm:leading-8 ${hairline} ${bodyCopy}`;

const chapterHeading =
  "text-[clamp(1.6rem,2.6vw,2.15rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-[#0b2e2e]";

const mailLink = `inline-flex min-h-6 items-center font-semibold text-[#0b5c5c] underline decoration-[#ff0063] decoration-1 underline-offset-4 transition-colors hover:text-[#0b2e2e] ${focusRing}`;

const termsCta = resolveAction(null, "terms");
const contactCta = resolveAction(null, "contactTeam");
const homeCta = resolveAction(null, "backHome");

const chapter = cn("scroll-mt-24 border-t py-12 sm:py-14", hairline);

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        <Band className="border-b border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-12 md:py-16")}>
            <p className="index-label">Legal · Privacy</p>
            <h1 className="display-xl mt-6 max-w-[14ch]">Privacy Policy</h1>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-[#0b2e2e]/12 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#356464]">
                Last updated · November 2026
              </p>
              <p className="max-w-[52ch] text-[15px] leading-7 text-[#356464]">
                What we collect, who can see it, and how to have it deleted.
              </p>
            </div>
          </div>
        </Band>

        <div className={cn(container, gutters, "pb-20 md:pb-28")}>
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:gap-12">
            <nav
              aria-label="On this page"
              className="min-w-0 lg:col-span-3 lg:self-start"
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
                  id="what-we-collect"
                  aria-labelledby="what-we-collect-heading"
                  className={cn("scroll-mt-24 pb-12 pt-2 sm:pb-14")}
                >
                  <h2
                    id="what-we-collect-heading"
                    className={chapterHeading}
                  >
                    What we collect
                  </h2>
                  <ul className={listCopy}>
                    <li>
                      Your name, email address, and role (student or founder).
                    </li>
                    <li>
                      Students: profile details (college, course, year, skills,
                      bio, availability) and your CV (PDF).
                    </li>
                    <li>
                      Founders: project postings (title, description, budget,
                      skills).
                    </li>
                    <li>
                      If you buy a Premium Shortlist: your payment screenshot and
                      order details.
                    </li>
                  </ul>
                </section>

                <section
                  id="how-we-use-it"
                  aria-labelledby="how-we-use-it-heading"
                  className={chapter}
                >
                  <h2 id="how-we-use-it-heading" className={chapterHeading}>
                    How we use it
                  </h2>
                  <ul className={listCopy}>
                    <li>
                      To match students with projects and founders with students.
                    </li>
                    <li>To prepare and deliver paid shortlists.</li>
                    <li>To verify profiles and payments.</li>
                  </ul>
                </section>

                <section
                  id="who-can-see-your-data"
                  aria-labelledby="who-can-see-your-data-heading"
                  className={chapter}
                >
                  <h2
                    id="who-can-see-your-data-heading"
                    className={chapterHeading}
                  >
                    Who can see your data
                  </h2>
                  <ul className={listCopy}>
                    <li>
                      Founders can browse completed student profiles. CV access
                      requires an application to one of their projects or a
                      confirmed paid shortlist. Contact email is shown for project
                      applicants and paid shortlists.
                    </li>
                    <li>
                      Admins can see all profiles for verification and
                      shortlisting.
                    </li>
                    <li>
                      Payment screenshots are visible only to you and our admins.
                    </li>
                  </ul>
                </section>

                <section
                  id="what-we-never-do"
                  aria-labelledby="what-we-never-do-heading"
                  className={chapter}
                >
                  <h2
                    id="what-we-never-do-heading"
                    className={chapterHeading}
                  >
                    What we never do
                  </h2>
                  <ul className={listCopy}>
                    <li>We never sell your data.</li>
                    <li>
                      We never share shortlist contents publicly. The paying
                      founder sees the delivered shortlist; admins can access
                      profile data to verify and prepare it.
                    </li>
                  </ul>
                </section>

                <section
                  id="deleting-your-data"
                  aria-labelledby="deleting-your-data-heading"
                  className={chapter}
                >
                  <h2
                    id="deleting-your-data-heading"
                    className={chapterHeading}
                  >
                    Deleting your data
                  </h2>
                  <p
                    className={cn(
                      "mt-7 border-t pt-7 text-base leading-7 sm:text-lg sm:leading-8",
                      hairline,
                      bodyCopy,
                    )}
                  >
                    Want your profile, CV, or account removed? Email us from the
                    address on your account and tell us what you want deleted. We
                    use that address to confirm the request is yours, and we may
                    ask for one more piece of account information before acting.
                    These are operational targets, not a legal guarantee: we aim
                    to acknowledge your request within 5 working days and, where
                    deletion is required, to complete it within 30 days.
                  </p>
                  <p
                    className={cn(
                      "mt-5 text-base leading-7 sm:text-lg sm:leading-8",
                      bodyCopy,
                    )}
                  >
                    We remove the data you ask us to delete from our live
                    services where we can: your profile details, CV, account
                    record, applications, and any project postings you ask us to
                    take down, plus related data held by our service providers.
                    If we cannot remove something, we will tell you what we kept
                    and why. We may keep order and payment records needed to
                    complete a transaction, handle refunds or disputes, and meet
                    accounting or legal obligations. Those records are not used
                    for matching.
                  </p>
                  <p className="mt-8 border-t border-[#0b2e2e]/12 pt-6 text-[15px] leading-7 text-[#356464]">
                    Questions or data requests:{" "}
                    <a href={`mailto:${APP_CONTACT.email}`} className={mailLink}>
                      {APP_CONTACT.email}
                    </a>
                  </p>
                  <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
                    <RuleLink href={termsCta.href}>{termsCta.label}</RuleLink>
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
