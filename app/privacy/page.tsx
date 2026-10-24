/**
 * Privacy Policy — short, plain English, MVP scope.
 */
import Link from 'next/link';
import { ArrowLeft, Mountain } from 'lucide-react';

export const metadata = { title: 'Privacy Policy | Bhutan Tech Connect' };

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-extrabold tracking-tighter mb-3">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-white/70">
          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              What we collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your name, email address, and role (student or founder).</li>
              <li>Students: profile details (college, course, skills, bio, availability) and your CV (PDF).</li>
              <li>Founders: project postings (title, description, budget, skills).</li>
              <li>If you buy a Premium Shortlist: your payment screenshot and order details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              How we use it
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To match students with projects and founders with students.</li>
              <li>To prepare and deliver paid shortlists.</li>
              <li>To verify profiles and payments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              Who can see your data
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Founders can see completed student profiles and CVs (including contact email).</li>
              <li>Admins can see all profiles for verification and shortlisting.</li>
              <li>Payment screenshots are visible only to you and our admins.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              What we never do
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We never sell your data.</li>
              <li>We never share shortlist contents publicly — only with the founder who paid for it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-extrabold tracking-tight text-white mb-2">
              Deleting your data
            </h2>
            <p>
              Want your profile, CV, or account deleted? Contact us and we will remove it.
              Reach us through the app or at our support email (see the site footer).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
