import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { SignupForm } from "@/features/auth/components/signup-form";
import {
  Band,
  RuleLink,
  container,
  gutters,
} from "@/components/marketing/editorial";
import { LOGIN_LINK } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Create an account",
  description:
    "Create a student account on Bhutan Tech Connect to build your profile and apply to paid startup projects.",
  path: "/signup",
});

const ERRORS: Record<string, string> = {
  invalid: "Fill in every field. Use 6 to 128 characters for your password.",
  exists: "An account with this email already exists. Log in instead.",
  "rate-limited":
    "Too many signup attempts. Wait a minute and try again.",
};

/** Unknown codes must still surface a message; a silent signup failure reads as a dead button. */
const GENERIC_ERROR = "We couldn't create your account. Please try again.";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
            <p className="index-label">Account · Create</p>
            <h1 className="display-lg mt-7 max-w-[14ch] text-[#0b2e2e]">
              Create your account
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg leading-8 text-[#356464]">
              A student account needs a name, an email and a password. The
              profile you build afterwards is what an admin checks and a founder
              reads.
            </p>

            <div className="mt-10 border-t border-[#0b2e2e]/12 pt-6">
              <p className="index-label">Already registered</p>
              <p className="mt-4 max-w-[38ch] text-[15px] leading-7 text-[#356464]">
                If your account is already set up, sign in with the same email
                address.
              </p>
              <RuleLink href={LOGIN_LINK.href} className="mt-5">
                {LOGIN_LINK.label}
              </RuleLink>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <div className="border-t border-[#0b2e2e]/15 pt-6">
              <p className="index-label">Your details</p>
              <div className="mt-6">
                <SignupForm
                  serverError={error ? ERRORS[error] ?? GENERIC_ERROR : undefined}
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
