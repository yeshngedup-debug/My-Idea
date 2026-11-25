import type { CSSProperties } from "react";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";
import { displayFont, focusRing } from "@/features/auth/components/styles";

export const metadata = {
  title: "Create an account",
  description:
    "Create a student account on Bhutan Tech Connect to build your profile and apply to paid startup projects.",
  alternates: {
    canonical: "https://bhutantech.bt/signup",
  },
};

const ERRORS: Record<string, string> = {
  invalid: "Fill in every field. Use at least 6 characters for your password.",
  exists: "An account with this email already exists. Log in instead.",
  "rate-limited":
    "Too many signup attempts. Wait a minute and try again.",
};

/** Unknown codes must still surface a message; a silent signup failure reads as a dead button. */
const GENERIC_ERROR = "We couldn't create your account. Please try again.";

/** Named token exposed as a CSS variable so hover utilities still win. */
const smallAccentStyle = {
  "--link-accent": "#0b5c5c",
} as CSSProperties;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <h2
        style={displayFont}
        className="text-[clamp(1.875rem,2.6vw,2.375rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#0b5c5c] text-balance"
      >
        Create your account
      </h2>

      <div className="mt-5 sm:mt-6">
        <SignupForm serverError={error ? ERRORS[error] ?? GENERIC_ERROR : undefined} />
      </div>

      <p className="mt-6 text-center text-sm leading-6 text-[#356464] sm:mt-7">
        <Link
          href="/contact"
          style={smallAccentStyle}
          className={`pressable inline-flex min-h-11 items-center rounded-sm font-semibold text-[var(--link-accent)] underline decoration-[#b9dede] underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-[var(--ease-out)] hover:text-[#356464] hover:decoration-[#0b5c5c] ${focusRing}`}
        >
          Ask for founder access
        </Link>
        <span aria-hidden="true" className="mx-2 text-[#356464]">
          ·
        </span>
        Already have an account?{" "}
        <Link
          href="/login"
          style={smallAccentStyle}
          className={`pressable inline-flex min-h-11 items-center rounded-sm font-semibold text-[#0b5c5c] underline decoration-[#b9dede] underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-[var(--ease-out)] hover:text-[#356464] hover:decoration-[#0b5c5c] ${focusRing}`}
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
