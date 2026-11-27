import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { LoginForm } from "@/features/auth/components/login-form";
import { APP_CONTACT } from "@/config/app";
import { CTA_HREFS, CTA_LABELS } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import {
  authLinkClassName,
  focusRing,
} from "@/features/auth/components/styles";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Log in",
  description:
    "Log in to your Bhutan Tech Connect account to open your dashboard and manage your profile, projects or applications.",
  path: "/login",
});

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
    <>
      <AuthCard
        title="Log in"
        lead="Your student workspace, your applications and your shortlist sit behind one sign-in."
      >
        <LoginForm
          serverError={error ? ERRORS[error] ?? GENERIC_ERROR : undefined}
          serverMessage={message ? MESSAGES[message] : undefined}
          passwordHelpContactHref={passwordHelpContactHref}
        />

        <p className="quiet-note mt-5">
          New to Bhutan Tech Connect?{" "}
          <Link
            href={CTA_HREFS.signup}
            className={cn(
              "pressable inline-flex min-h-6 items-center rounded-sm",
              authLinkClassName,
              focusRing,
            )}
          >
            {CTA_LABELS.signup}
          </Link>
        </p>
      </AuthCard>

      {/* Help and the other way in. */}
      <AuthHelpBand />
    </>
  );
}
