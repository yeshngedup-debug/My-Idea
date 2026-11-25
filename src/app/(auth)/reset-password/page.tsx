import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { displayFont } from "@/features/auth/components/styles";
import { RESET_TOKEN_COOKIE } from '@/app/auth/callback/route';

export const metadata: Metadata = {
  title: "Choose a new password — Bhutan Tech Connect",
  description:
    "Choose a new password for your Bhutan Tech Connect account after verifying a reset link.",
};

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
      <h1
        style={displayFont}
        className="text-[clamp(1.875rem,2.6vw,2.375rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#0b5c5c] text-balance"
      >
        Choose a new password
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#356464]">
        Use 6 to 128 characters. You&apos;ll sign in again after saving.
      </p>

      <div className="mt-6">
        <ResetPasswordForm serverError={serverError} />
      </div>
    </AuthShell>
  );
}
