import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { displayFont, focusRing } from "@/features/auth/components/styles";
import { APP_CONTACT } from "@/config/app";

export const metadata = {
  title: "Log in",
  description:
    "Log in to your Bhutan Tech Connect account to access your dashboard and manage projects or applications.",
  alternates: {
    canonical: "https://bhutantech.bt/login",
  },
};

const ERRORS: Record<string, string> = {
  missing: "Enter your email and password.",
  invalid: "Check your email and password and try again.",
  "rate-limited": "Try again in a moment.",
  "profile-sync":
    "We couldn't confirm your account details. Try logging in again.",
};

/** Unknown codes must still surface a message; a silent login failure reads as a dead button. */
const GENERIC_ERROR = "We couldn't log you in. Try again.";

const MESSAGES: Record<string, string> = {
  "check-email":
    "Account created. Check your inbox to confirm your email, then log in.",
  "password-updated": "Password updated. Sign in with your new password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  // Self-service reset is the primary path. The mailto remains as a fallback
  // when the reset email does not arrive; it is built here so the contact
  // address is resolved on the server, not in the browser bundle.
  const passwordHelpContactHref = `mailto:${APP_CONTACT.email}?subject=${encodeURIComponent("Password help request")}`;

  return (
    <AuthShell>
      <h1
        style={displayFont}
        className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#17352b]"
      >
        Log in
      </h1>

      <div className="mt-6">
        <LoginForm
          serverError={error ? ERRORS[error] ?? GENERIC_ERROR : undefined}
          serverMessage={message ? MESSAGES[message] : undefined}
          passwordHelpContactHref={passwordHelpContactHref}
        />
      </div>

      <p className="mt-7 text-center text-sm leading-6 text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className={`pressable inline-flex min-h-11 items-center rounded-sm font-semibold text-[#17352b] underline decoration-[#d84f37] underline-offset-4 hover:text-[#b23c26] ${focusRing}`}
        >
          Create a student account
        </Link>
      </p>
    </AuthShell>
  );
}
