import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { signup } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';

const ERRORS: Record<string, string> = {
  invalid: 'Please fill every field. Password must be at least 6 characters.',
  exists: 'An account with this email already exists. Try logging in.',
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0c0b10] text-white px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://picsum.photos/seed/bhutansignup/1920/1080"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-20 grayscale mix-blend-luminosity contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0b10]/70 via-[#0c0b10]/80 to-[#0c0b10]" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-extrabold text-xl tracking-tight mb-10"
        >
          <Mountain className="w-6 h-6 text-amber-400" /> Bhutan Tech Connect
        </Link>

        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tighter leading-none mb-2">
              Create an account
            </h1>
            <p className="text-white/50">Join the Bhutan tech ecosystem</p>
          </div>

          {error && ERRORS[error] && (
            <p role="alert" className="mb-4 rounded-xl bg-red-400/10 border border-red-400/30 text-red-300 text-sm px-4 py-3">
              {ERRORS[error]}
            </p>
          )}

          <form action={signup} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  aria-required="true"
                  autoComplete="given-name"
                  placeholder="Tashi"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-sm"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  aria-required="true"
                  autoComplete="family-name"
                  placeholder="Dorji"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                aria-required="true"
                autoComplete="email"
                placeholder="tashi@college.bt"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                aria-required="true"
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                aria-describedby="password-hint"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-sm"
              />
              <p id="password-hint" className="text-white/30 text-xs mt-1.5">
                Minimum 6 characters.
              </p>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-white/70 mb-2">
                I am a
              </label>
              <select
                id="role"
                name="role"
                required
                aria-required="true"
                defaultValue="student"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-sm [&>option]:bg-[#13111a]"
              >
                <option value="student">College Student</option>
                <option value="founder">Startup Founder</option>
              </select>
            </div>
            <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
