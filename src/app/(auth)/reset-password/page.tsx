import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import {
  Band,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { pageMetadata } from "@/lib/metadata";
import { RESET_TOKEN_COOKIE } from "@/app/auth/callback/route";
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
              Choose a new password
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg leading-8 text-[#356464]">
              Use 6 to 128 characters. You&apos;ll sign in again after saving.
            </p>

          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <div className="border-t border-[#0b2e2e]/15 pt-6">
              <p className="index-label">New password</p>
              <div className="mt-6">
                <ResetPasswordForm serverError={serverError} />
              </div>
            </div>
          </div>
        </div>
      </Band>

      {/* The reset path keeps its own next step inside the shared help band. */}
      <AuthHelpBand
        variant="white"
        newLink={{ label: "Request a new link", href: "/forgot-password" }}
      />
    </AuthShell>
  );
}
