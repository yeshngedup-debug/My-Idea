import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import {
  Band,
  RuleLink,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { LOGIN_LINK } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Reset password",
  description:
    "Request a secure password reset link for your Bhutan Tech Connect account.",
  path: "/forgot-password",
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a valid email address.",
  "rate-limited": "Too many requests. Try again in a moment.",
  session: "That reset link has expired. Request a new one.",
};

/** Unknown codes must still surface a message; a silent reset request reads as a dead button. */
const GENERIC_ERROR = "We couldn't send a reset link. Try again.";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const query = await searchParams;
  const error = query.error ? ERROR_MESSAGES[query.error] ?? GENERIC_ERROR : undefined;
  const sent =
    query.sent === "1"
      ? "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder."
      : undefined;

  return (
    <AuthShell>
      {/* The ledger opening: what this page is, then the form that acts on it. */}
      <Band className="border-b border-[#0b2e2e]/10">
        <div
          className={cn(
            container,
            gutters,
            "grid grid-cols-1 gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-12",
          )}
        >
          <div className="lg:col-span-6 lg:pr-8">
            <p className="index-label">Account · Reset</p>
            <h1 className="display-lg mt-7 max-w-[14ch] text-[#0b2e2e]">
              Reset your password
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg leading-8 text-[#356464]">
              Enter your email and we&apos;ll send a secure reset link if an
              account exists for that address.
            </p>

            <div className="mt-10 border-t border-[#0b2e2e]/12 pt-6">
              <p className="index-label">Remembered it</p>
              <p className="mt-4 max-w-[38ch] text-[15px] leading-7 text-[#356464]">
                If your password is still working, go straight back to sign in.
              </p>
              <RuleLink href={LOGIN_LINK.href} className="mt-5">
                Back to sign in
              </RuleLink>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <div className="border-t border-[#0b2e2e]/15 pt-6">
              <p className="index-label">Your email</p>
              <div className="mt-6">
                <ForgotPasswordForm
                  serverError={error}
                  serverMessage={sent}
                />
              </div>
            </div>
          </div>
        </div>
      </Band>

      {/* Help and the other way in. */}
      <AuthHelpBand />
    </AuthShell>
  );
}
