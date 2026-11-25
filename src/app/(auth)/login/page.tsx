import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  Band,
  RuleLink,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { APP_CONTACT } from "@/config/app";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Log in",
  description:
    "Log in to your Bhutan Tech Connect account to access your dashboard and manage projects or applications.",
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
            <p className="index-label">Account · Log in</p>
            <h1 className="display-lg mt-7 max-w-[12ch] text-[#0b2e2e]">
              Log in
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg leading-8 text-[#356464]">
              Your student workspace, your applications and your shortlist sit
              behind one sign-in.
            </p>

            <div className="mt-10 border-t border-[#0b2e2e]/12 pt-6">
              <p className="index-label">New here</p>
              <p className="mt-4 max-w-[38ch] text-[15px] leading-7 text-[#356464]">
                A student account needs a name, an email and a password. You
                build the profile after you sign in.
              </p>
              <RuleLink href="/signup" className="mt-5">
                Create a student account
              </RuleLink>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <div className="border-t border-[#0b2e2e]/15 pt-6">
              <p className="index-label">Sign in</p>
              <div className="mt-6">
                <LoginForm
                  serverError={error ? ERRORS[error] ?? GENERIC_ERROR : undefined}
                  serverMessage={message ? MESSAGES[message] : undefined}
                  passwordHelpContactHref={passwordHelpContactHref}
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
