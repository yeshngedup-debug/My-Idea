/**
 * Terms of Use — short, plain English, MVP scope.
 */
import Link from "next/link";
import { APP_CONTACT } from "@/config/app";

export const metadata = {
  title: 'Terms of Use',
  description:
    'Bhutan Tech Connect terms of use: matching service terms, Premium Shortlist policy, fair use, and contact.',
  alternates: {
    canonical: 'https://bhutantech.bt/terms',
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
  { id: "what-this-platform-is", label: "What this platform is" },
  { id: "your-agreements-are-your-own", label: "Your agreements are your own" },
  { id: "premium-shortlists", label: "Premium Shortlists" },
  { id: "fair-use", label: "Fair use" },
  { id: "questions", label: "Questions" },
] as const;

export default function TermsPage() {
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
              Terms of <span className={accent}>Use</span>
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
                id="what-this-platform-is"
                aria-labelledby="what-this-platform-is-heading"
                className="scroll-mt-24 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="what-this-platform-is-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  What this platform is
                </h2>
                <p className={`mt-8 border-t border-[#1B4D3E]/12 pt-8 text-base leading-7 sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  Bhutan Tech Connect is a{" "}
                  <strong className="font-semibold text-[#0B1F1A]">
                    matching service
                  </strong>
                  . We connect college students with startup founders and,
                  optionally, provide paid, manually curated shortlists. We are{" "}
                  <strong className="font-semibold text-[#0B1F1A]">
                    not an employer
                  </strong>
                  ,{" "}
                  <strong className="font-semibold text-[#0B1F1A]">
                    not an agent
                  </strong>
                  , and not a party to any work you do.
                </p>
              </section>

              <section
                id="your-agreements-are-your-own"
                aria-labelledby="your-agreements-are-your-own-heading"
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="your-agreements-are-your-own-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  Your agreements are your own
                </h2>
                <ul className={`mt-8 list-disc space-y-4 pl-5 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
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
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="premium-shortlists-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  Premium Shortlists
                </h2>
                <ul className={`mt-8 list-disc space-y-4 pl-5 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
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
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="fair-use-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  Fair use
                </h2>
                <ul className={`mt-8 list-disc space-y-4 pl-5 text-base leading-7 marker:text-[#E8A317] sm:text-lg sm:leading-8 ${bodyCopy}`}>
                  <li>Be truthful in your profile, CV, and project postings.</li>
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
                className="scroll-mt-24 border-t border-[#1B4D3E]/12 py-16 sm:py-20 lg:py-24"
              >
                <h2
                  id="questions-heading"
                  className="legal-mount text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0B1F1A]"
                >
                  Questions
                </h2>
                <p className={`mt-8 border-t border-[#1B4D3E]/12 pt-8 text-base leading-7 sm:text-lg sm:leading-8 ${quiet}`}>
                  Questions about these terms:{' '}
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
