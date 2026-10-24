/**
 * Terms of Use — short, plain English, MVP scope.
 */
import Link from 'next/link';
import { ArrowLeft, Mountain } from 'lucide-react';

export const metadata = { title: 'Terms of Use | Bhutan Tech Connect' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0c0b10] text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg px-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight mb-6">
          <Mountain className="w-5 h-5 text-amber-400" /> Bhutan Tech Connect
        </div>

        <h1 className="text-4xl font-extrabold tracking-tighter mb-3">Terms of Use</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-white/70">
          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              What this platform is
            </h2>
            <p>
              Bhutan Tech Connect is a <strong className="text-white">matching service</strong>. We
              connect college students with startup founders and, optionally, provide paid,
              manually curated shortlists. We are <strong className="text-white">not an employer</strong>,{' '}
              <strong className="text-white">not an agent</strong>, and not a party to any work you do.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              Your agreements are your own
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Students and founders arrange scope, timeline, and payment directly with each other.
              </li>
              <li>
                We recommend a simple written agreement before work starts (a template is provided
                in the founder dashboard).
              </li>
              <li>
                We are not responsible for payment disputes, work quality, or either party's conduct.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              Premium Shortlists
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The fee covers research, curation, and ranking — it is not a hiring fee.</li>
              <li>Shortlists are prepared after payment is confirmed and are non-refundable once delivered.</li>
              <li>Shortlist contents are for hiring evaluation only and must not be redistributed or published.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              Fair use
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Be truthful in your profile, CV, and project postings.</li>
              <li>Do not misuse other users' contact details (no spam, no resale).</li>
              <li>We may suspend accounts that abuse the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              Questions
            </h2>
            <p>Reach us through the app or at our support email (see the site footer).</p>
          </section>
        </div>
      </div>
    </main>
  );
}
