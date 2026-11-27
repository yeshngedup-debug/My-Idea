import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { LOGIN_LINK } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import { RESET_TOKEN_COOKIE } from "@/app/auth/callback/route";
import {
  authLinkClassName,
  focusRing,
} from "@/features/auth/components/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Choose a new password",
  description:
    "Choose a new password for your Bhutan Tech Connect account after verifying a reset link.",
  path: "/reset-password",
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Use 6 to 128 characters and make sure both entries match.",
  "rate-limited": "Too many attempts. Try again in a moment.",
};

/** Unknown codes must still surface a message; a silent reset failure reads as a dead button. */
const GENERIC_ERROR = "We couldn't save your new password. Try again.";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // The short-lived httpOnly token from the auth callback proves this form was
  // reached from a recovery link rather than an ordinary login.
  const cookieStore = await cookies();
  if (!cookieStore.get(RESET_TOKEN_COOKIE)?.value) {
    redirect("/forgot-password?error=session");
  }

  const { error } = await searchParams;
  const serverError = error ? ERROR_MESSAGES[error] ?? GENERIC_ERROR : undefined;

  return (
    <>
      <AuthCard
        title="Choose a new password"
        lead="Use 6 to 128 characters. You'll sign in again after saving."
      >
        <ResetPasswordForm serverError={serverError} />

        <p className="quiet-note mt-5">
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

      {/* The reset path keeps its own next step inside the shared help band. */}
      <AuthHelpBand
        newLink={{ label: "Request a new link", href: "/forgot-password" }}
      />
    </>
  );
}
