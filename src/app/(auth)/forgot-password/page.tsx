import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { displayFont } from "@/features/auth/components/styles";

export const metadata: Metadata = {
  title: "Reset password — Bhutan Tech Connect",
  description:
    "Request a secure password reset link for your Bhutan Tech Connect account.",
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a valid email address.",
  "rate-limited": "Too many requests. Try again in a moment.",
  session: "That reset link has expired. Request a new one.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const query = await searchParams;
  const error = query.error ? ERROR_MESSAGES[query.error] : undefined;
  const sent =
    query.sent === "1"
      ? "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder."
      : undefined;

  return (
    <AuthShell>
      <h1
        style={displayFont}
        className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0b5c5c]"
      >
        Reset your password
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#356464]">
        Enter your email and we&apos;ll send a secure reset link if an account
        exists for that address.
      </p>

      <div className="mt-6">
        <ForgotPasswordForm serverError={error} serverMessage={sent} />
      </div>

      <p className="mt-7 text-center text-sm leading-6 text-[#356464]">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="pressable inline-flex min-h-11 items-center rounded-sm font-semibold text-[#0b5c5c] underline decoration-[#ff0063] underline-offset-4 hover:text-[#c2004b]"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
