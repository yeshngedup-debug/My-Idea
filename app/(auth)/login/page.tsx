import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { login } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';

const ERRORS: Record<string, string> = {
  missing: 'Email and password are required.',
  invalid: 'Invalid email or password.',
};

const MESSAGES: Record<string, string> = {
  'check-email': 'Account created. Check your inbox to confirm your email, then log in.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0c0b10] text-white px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://picsum.photos/seed/bhutanauth/1920/1080"
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
              Welcome back
            </h1>
            <p className="text-white/50">Log in to access your dashboard</p>
          </div>

          {error && ERRORS[error] && (
            <p role="alert" className="mb-4 rounded-xl bg-red-400/10 border border-red-400/30 text-red-300 text-sm px-4 py-3">
              {ERRORS[error]}
            </p>
          )}
          {message && MESSAGES[message] && (
            <p role="status" className="mb-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm px-4 py-3">
              {MESSAGES[message]}
            </p>
          )}

          <form action={login} className="space-y-5">
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
                placeholder="you@example.com"
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
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-sm"
              />
            </div>
            <SubmitButton pendingLabel="Signing in…">Log in</SubmitButton>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
