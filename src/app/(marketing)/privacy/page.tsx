/**
 * Privacy Policy — short, plain English, MVP scope.
 */
import Link from "next/link";
import { APP_CONTACT } from "@/config/app";

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Bhutan Tech Connect privacy policy: what we collect, how we use your data, and how to request deletion.',
  alternates: {
    canonical: 'https://bhutantech.bt/privacy',
  },
};

const mountFade = `
  .legal-mount {
    animation: legal-mount-in 240ms cubic-bezier(0.23, 1, 0.32, 1) both;
  }
  @keyframes legal-mount-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .legal-mount { animation: none; }
  }
`;

/** Restrained Paywave-style card system in the BTC palette. */
const card =
  "rounded-3xl border border-[#1B4D3E]/12 bg-white shadow-[0_2px_10px_rgba(11,31,26,0.04)]";
const band = "px-4 py-12 sm:px-6 md:py-20 lg:px-8";
const metaLabel =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[#5A6A61]";
const accent = "text-[#E8A317]";
const bodyCopy = "text-[#0B1F1A]/75";
const quiet = "text-[#5A6A61]";
const mailLink =
  "inline-flex min-h-6 items-center rounded-sm font-semibold text-[#1B4D3E] underline decoration-[#E8A317] decoration-2 underline-offset-4 transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";
const tocLink =
  "inline-block min-h-11 rounded-sm py-2.5 text-sm font-medium text-[#0B1F1A]/70 transition-[color,transform] hover:translate-x-1 hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transform-none motion-reduce:transition-none";

const chapters = [
  { id: "what-we-collect", label: "What we collect" },
  { id: "how-we-use-it", label: "How we use it" },
  { id: "who-can-see-your-data", label: "Who can see your data" },
  { id: "what-we-never-do", label: "What we never do" },
  { id: "deleting-your-data", label: "Deleting your data" },
] as const;

export default function PrivacyPage() {
  return (
    <main
      id="main-content"
      className="w-full max-w-full min-w-0 overflow-x-clip bg-[#F7F4EE] text-[#0B1F1A]"
    >
      <style>{mountFade}</style>

      <header className="border-b border-[#1B4D3E]/12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 py-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-[#1B4D3E] transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE] motion-reduce:transition-none"
          >
            Back to home
          </Link>
          <span className="text-sm font-bold tracking-tight text-[#0B1F1A]">
            Bhutan Tech Connect
          </span>
        </div>
      </header>

      <section className={band}>
        <div className="mx-auto max-w-[1440px]">
          <div className={`${card} px-6 py-20 text-center sm:px-12 sm:py-24`}>
            <span className={metaLabel}>Last updated: November 2026</span>
            <h1 className="legal-mount mx-auto mt-6 w-full max-w-6xl text-balance text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#0B1F1A]">
              Privacy <span className={accent}>Policy</span>
            </h1>
          </div>
        </div>
      </section>

      <div className={band}>
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <nav
            aria-label="On this page"
            className="min-w-0 lg:sticky lg:top-12 lg:self-start"
          >
            <div className={`${card} p-6 sm:p-8`}>
              <ol className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-0">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <a href={`#${chapter.id}`} className={tocLink}>
                      {chapter.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className={`${card} min-w-0 px-6 py-4 sm:px-12 sm:py-6 lg:px-16`}>
            <div className="max-w-[68ch]">
              <section
                id="what-we-collect"
                aria-labelledby="what-we-collect-heading"
                className="scroll-mt-24 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="what-we-collect-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  What we collect
                </h2>
                <ul className={`mt-8 list-disc space-y-4 border-t border-[#1B4D3E]/12 pl-5 pt-8 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  <li>Your name, email address, and role (student or founder).</li>
                  <li>Students: profile details (college, course, year, skills, bio, availability) and your CV (PDF).</li>
                  <li>Founders: project postings (title, description, budget, skills).</li>
                  <li>If you buy a Premium Shortlist: your payment screenshot and order details.</li>
                </ul>
              </section>

              <section
                id="how-we-use-it"
                aria-labelledby="how-we-use-it-heading"
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="how-we-use-it-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  How we use it
                </h2>
                <ul className={`mt-8 list-disc space-y-4 pl-5 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  <li>To match students with projects and founders with students.</li>
                  <li>To prepare and deliver paid shortlists.</li>
                  <li>To verify profiles and payments.</li>
                </ul>
              </section>

              <section
                id="who-can-see-your-data"
                aria-labelledby="who-can-see-your-data-heading"
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="who-can-see-your-data-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  Who can see your data
                </h2>
                <ul className={`mt-8 list-disc space-y-4 pl-5 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  <li>Founders can browse completed student profiles. CV access requires an application to one of their projects or a confirmed paid shortlist. Contact email is shown for project applicants and paid shortlists.</li>
                  <li>Admins can see all profiles for verification and shortlisting.</li>
                  <li>Payment screenshots are visible only to you and our admins.</li>
                </ul>
              </section>

              <section
                id="what-we-never-do"
                aria-labelledby="what-we-never-do-heading"
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="what-we-never-do-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  What we never do
                </h2>
                <ul className={`mt-8 list-disc space-y-4 pl-5 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  <li>We never sell your data.</li>
                  <li>We never share shortlist contents publicly. The paying founder sees the delivered shortlist; admins can access profile data to verify and prepare it.</li>
                </ul>
              </section>

              <section
                id="deleting-your-data"
                aria-labelledby="deleting-your-data-heading"
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="deleting-your-data-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  Deleting your data
                </h2>
                <p className={`mt-8 border-t border-[#1B4D3E]/12 pt-8 text-base leading-7 sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  Want your profile, CV, or account removed? Email us from the address on your account and tell us what you want deleted. We use that address to confirm the request is yours, and we may ask for one more piece of account information before acting. These are operational targets, not a legal guarantee: we aim to acknowledge your request within 5 working days and, where deletion is required, to complete it within 30 days.
                </p>
                <p className={`mt-6 text-base leading-7 sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  We remove the data you ask us to delete from our live services where we can: your profile details, CV, account record, applications, and any project postings you ask us to take down, plus related data held by our service providers. If we cannot remove something, we will tell you what we kept and why. We may keep order and payment records needed to complete a transaction, handle refunds or disputes, and meet accounting or legal obligations. Those records are not used for matching.
                </p>
                <p className={`mt-6 text-base leading-7 sm:text-lg sm:leading-8 ${quiet}`}>
                  Questions or data requests:{' '}
                  <a
                    href={`mailto:${APP_CONTACT.email}`}
                    className={mailLink}
                  >
                    {APP_CONTACT.email}
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
