import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LOGIN_LINK } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import {
  authLinkClassName,
  focusRing,
} from "@/features/auth/components/styles";
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
    <>
      <AuthCard
        eyebrow="Account recovery"
        title="Reset your password"
        lead="Enter your email and we'll send a secure reset link if an account exists for that address."
      >
        <ForgotPasswordForm
          serverError={error}
          serverMessage={sent}
        />

        <p className="mt-5 text-[14px] leading-6 text-[#356464]">
          Remembered your password?{" "}
          <Link
            href={LOGIN_LINK.href}
            className={cn(
              "pressable inline-flex min-h-6 items-center rounded-sm",
              authLinkClassName,
              focusRing,
            )}
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>

      {/* Help and the other way in. */}
      <AuthHelpBand />
    </>
  );
}
