import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import {
  Band,
  RuleLink,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { APP_CONTACT } from "@/config/app";
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
              <RuleLink href="/login" className="mt-5">
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

      {/* The other way in, and the way out when the reset email does not land. */}
      <Band tone="mist" className="border-b border-[#0b2e2e]/10">
        <div
          className={cn(
            container,
            gutters,
            "grid grid-cols-1 gap-10 py-8 md:py-10 lg:grid-cols-12 lg:gap-12",
          )}
        >
          <div className="lg:col-span-7">
            <p className="index-label">Account help</p>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-[#356464]">
              Questions about student signup, founder access, or a project?{" "}
              <a
                href={`mailto:${APP_CONTACT.email}`}
                className="font-semibold text-[#0b2e2e] underline decoration-[#0b2e2e]/25 underline-offset-4 transition-colors hover:decoration-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5c5c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
              >
                {APP_CONTACT.email}
              </a>
              . We read every message and reply as soon as we can.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="index-label">Founder access</p>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-7 text-[#356464]">
              Founder accounts are not created through public signup.
            </p>
            <RuleLink href="/contact" className="mt-5">
              Ask for founder access
            </RuleLink>
          </div>
        </div>
      </Band>
    </AuthShell>
  );
}
