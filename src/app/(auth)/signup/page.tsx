import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHelpBand } from "@/features/auth/components/auth-help-band";
import { SignupForm } from "@/features/auth/components/signup-form";
import { LOGIN_LINK } from "@/components/marketing/nav";
import { pageMetadata } from "@/lib/metadata";
import {
  authLinkClassName,
  focusRing,
} from "@/features/auth/components/styles";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Create a student account",
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
    <>
      <AuthCard
        eyebrow="Student account"
        title="Create a student account"
        lead="A student account needs a name, an email and a password. The profile you build afterwards is what an admin checks and a founder reads."
      >
        <SignupForm
          serverError={error ? ERRORS[error] ?? GENERIC_ERROR : undefined}
        />

        <p className="mt-5 text-[14px] leading-6 text-[#356464]">
          Already have an account?{" "}
          <Link
            href={LOGIN_LINK.href}
            className={cn(
              "pressable inline-flex min-h-6 items-center rounded-sm",
              authLinkClassName,
              focusRing,
            )}
          >
            {LOGIN_LINK.label}
          </Link>
        </p>
      </AuthCard>

      {/* Help and the other way in. */}
      <AuthHelpBand />
    </>
  );
}
