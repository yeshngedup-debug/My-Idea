import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import {
  Band,
  RuleLink,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { APP_CONTACT } from "@/config/app";
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
  const serverError = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <AuthShell>
      {/* The ledger opening: what this page is, then the form that acts on it. */}
      <Band className="border-b border-[#0b2e2e]/10">
        <div
          className={cn(
            container,
            gutters,
            "grid grid-cols-1 gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-12",
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

            <div className="mt-10 border-t border-[#0b2e2e]/12 pt-6">
              <p className="index-label">Account help</p>
              <p className="mt-4 max-w-[38ch] text-[15px] leading-7 text-[#356464]">
                If the link has expired, request a new one. If it still does not
                arrive, write to{" "}
                <a
                  href={`mailto:${APP_CONTACT.email}`}
                  className="font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 underline-offset-4 transition-colors hover:decoration-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {APP_CONTACT.email}
                </a>
                .
              </p>
              <RuleLink href="/forgot-password" className="mt-5">
                Request a new link
              </RuleLink>
            </div>
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
    </AuthShell>
  );
}
