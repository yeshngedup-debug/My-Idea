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

const chapters = [
  { id: "what-we-collect", label: "What we collect" },
  { id: "how-we-use-it", label: "How we use it" },
  { id: "who-can-see-your-data", label: "Who can see your data" },
  { id: "what-we-never-do", label: "What we never do" },
  { id: "deleting-your-data", label: "Deleting your data" },
] as const;

export default function PrivacyPage() {
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
            Privacy Policy
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
                id="what-we-collect"
                aria-labelledby="what-we-collect-heading"
                className="scroll-mt-24 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="what-we-collect-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  What we collect
                </h2>
                <ul className="mt-7 list-disc space-y-3 border-t border-[#18251f]/15 pl-5 pt-7 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
                  <li>Your name, email address, and role (student or founder).</li>
                  <li>Students: profile details (college, course, skills, bio, availability) and your CV (PDF).</li>
                  <li>Founders: project postings (title, description, budget, skills).</li>
                  <li>If you buy a Premium Shortlist: your payment screenshot and order details.</li>
                </ul>
              </section>

              <section
                id="how-we-use-it"
                aria-labelledby="how-we-use-it-heading"
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="how-we-use-it-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  How we use it
                </h2>
                <ul className="mt-7 list-disc space-y-3 pl-5 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
                  <li>To match students with projects and founders with students.</li>
                  <li>To prepare and deliver paid shortlists.</li>
                  <li>To verify profiles and payments.</li>
                </ul>
              </section>

              <section
                id="who-can-see-your-data"
                aria-labelledby="who-can-see-your-data-heading"
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="who-can-see-your-data-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  Who can see your data
                </h2>
                <ul className="mt-7 list-disc space-y-3 pl-5 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
                  <li>Founders can see completed student profiles and CVs (including contact email).</li>
                  <li>Admins can see all profiles for verification and shortlisting.</li>
                  <li>Payment screenshots are visible only to you and our admins.</li>
                </ul>
              </section>

              <section
                id="what-we-never-do"
                aria-labelledby="what-we-never-do-heading"
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="what-we-never-do-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  What we never do
                </h2>
                <ul className="mt-7 list-disc space-y-3 pl-5 text-base leading-7 text-[#18251f]/75 marker:text-[#b23c26] sm:text-lg sm:leading-8">
                  <li>We never sell your data.</li>
                  <li>We never share shortlist contents publicly. Only the founder who paid for it sees them.</li>
                </ul>
              </section>

              <section
                id="deleting-your-data"
                aria-labelledby="deleting-your-data-heading"
                className="scroll-mt-24 border-t border-[#18251f]/10 py-12 sm:py-16 lg:py-20"
              >
                <h2
                  id="deleting-your-data-heading"
                  className="legal-mount text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#17352b] sm:text-3xl"
                >
                  Deleting your data
                </h2>
                <p className="mt-7 border-t border-[#18251f]/15 pt-7 text-base leading-7 text-[#18251f]/75 sm:text-lg sm:leading-8">
                  Want your profile, CV, or account deleted? We will remove it on request.
                </p>
                <p className="mt-5 text-base leading-7 text-[#657069] sm:text-lg sm:leading-8">
                  Questions or data requests:{' '}
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
