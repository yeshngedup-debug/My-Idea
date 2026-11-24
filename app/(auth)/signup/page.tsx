import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { focusRing } from "@/components/auth/styles";

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

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <h2 className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[#17352b]">
        Create your account
      </h2>

      <div className="mt-6">
        <SignupForm serverError={error ? ERRORS[error] : undefined} />
      </div>

      <p className="mt-7 text-center text-sm leading-6 text-slate-600">
        <Link
          href="/contact"
          className={`pressable rounded-sm font-semibold text-[#b23c26] underline decoration-[#b44532]/40 underline-offset-4 hover:text-[#d84f37] ${focusRing}`}
        >
          Ask for founder access
        </Link>
        <span aria-hidden="true" className="mx-2 text-slate-400">
          ·
        </span>
        Already have an account?{" "}
        <Link
          href="/login"
          className={`pressable rounded-sm font-semibold text-[#17352b] underline decoration-[#d84f37] underline-offset-4 hover:text-[#b23c26] ${focusRing}`}
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
