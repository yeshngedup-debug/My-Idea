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

const chapters = [
  { id: "what-this-platform-is", label: "What this platform is" },
  { id: "your-agreements-are-your-own", label: "Your agreements are your own" },
  { id: "premium-shortlists", label: "Premium Shortlists" },
  { id: "fair-use", label: "Fair use" },
  { id: "questions", label: "Questions" },
] as const;

export default function TermsPage() {
  return (
    <main id="main-content" className="min-w-0 bg-[#f5f2ea] text-[#18251f]">
      <style>{mountFade}</style>

      <header className="border-b border-[#18251f]/15 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-[#17352b] transition-colors hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
          >
            Back to home
          </Link>
          <span className="text-sm font-bold tracking-tight text-[#17352b]">
            Bhutan Tech Connect
          </span>
        </div>
      </header>

      <div className="px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="legal-mount max-w-[14ch] text-[clamp(2.25rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#17352b]">
            Terms of Use
          </h1>
          <p className="mt-7 text-sm font-semibold tracking-[0.02em] text-[#657069]">
            Last updated: October 2026
          </p>
        </div>
      </div>

      <div className="border-t border-[#18251f]/15 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20">
          <nav
            aria-label="On this page"
            className="min-w-0 pt-12 lg:sticky lg:top-12 lg:self-start lg:pt-32"
          >
            <ol className="flex flex-wrap gap-x-5 gap-y-1 border-b border-[#18251f]/10 pb-6 lg:flex-col lg:gap-0 lg:border-b-0 lg:pb-0">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    className="inline-block rounded-sm py-1.5 text-sm font-medium text-[#18251f]/65 transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] lg:py-2.5"
                  >
                    {chapter.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            <div className="max-w-[65ch]">
              <section
                id="what-this-platform-is"
                aria-labelledby="what-this-platform-is-heading"
                className="scroll-mt-24 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="what-this-platform-is-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  What this platform is
                </h2>
                <p className="mt-7 border-t border-[#18251f]/15 pt-7 text-base leading-7 text-[#18251f]/75 sm:text-lg sm:leading-8">
                  Bhutan Tech Connect is a{" "}
                  <strong className="font-semibold text-[#17352b]">
                    matching service
                  </strong>
                  . We connect college students with startup founders and,
                  optionally, provide paid, manually curated shortlists. We are{" "}
                  <strong className="font-semibold text-[#17352b]">
                    not an employer
                  </strong>
                  ,{" "}
                  <strong className="font-semibold text-[#17352b]">
                    not an agent
                  </strong>
                  , and not a party to any work you do.
                </p>
              </section>

              <section
                id="your-agreements-are-your-own"
                aria-labelledby="your-agreements-are-your-own-heading"
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="your-agreements-are-your-own-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  Your agreements are your own
                </h2>
                <ul className="mt-7 list-disc space-y-3 pl-5 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
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
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="premium-shortlists-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  Premium Shortlists
                </h2>
                <ul className="mt-7 list-disc space-y-3 pl-5 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
                  <li>
                    The fee covers research, curation, and ranking. It is not a
                    hiring fee.
                  </li>
                  <li>
                    Shortlists are prepared after payment is confirmed and are
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
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="fair-use-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  Fair use
                </h2>
                <ul className="mt-7 list-disc space-y-3 pl-5 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
                  <li>Be truthful in your profile, CV, and project postings.</li>
                  <li>
                    Do not misuse other users&apos; contact details (no spam, no
                    resale).
                  </li>
                  <li>We may suspend accounts that abuse the platform.</li>
                </ul>
              </section>

              <section
                id="questions"
                aria-labelledby="questions-heading"
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="questions-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  Questions
                </h2>
                <p className="mt-7 border-t border-[#18251f]/15 pt-7 text-base leading-7 text-[#657069] sm:text-lg sm:leading-8">
                  Questions about these terms:{' '}
                  <a
                    href={`mailto:${APP_CONTACT.email}`}
                    className="rounded-sm font-semibold text-[#b23c26] underline decoration-[#b23c26]/30 underline-offset-4 transition-colors hover:decoration-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
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
