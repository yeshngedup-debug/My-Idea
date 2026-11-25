import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
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
      <h1 className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[#17352b]">
        Choose a new password
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Use 6 to 128 characters. You&apos;ll sign in again after saving.
      </p>

      <div className="mt-6">
        <ResetPasswordForm serverError={serverError} />
      </div>
    </AuthShell>
  );
}
