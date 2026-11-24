import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { focusRing } from "@/components/auth/styles";

export const metadata = {
  title: "Log in",
  description:
    "Log in to your Bhutan Tech Connect account to access your dashboard and manage projects or applications.",
  alternates: {
    canonical: "https://bhutantech.bt/login",
  },
};

const ERRORS: Record<string, string> = {
  missing: "Enter your email and password.",
  invalid: "Check your email and password and try again.",
  "rate-limited":
    "Too many login attempts. Wait a minute and try again.",
};

const MESSAGES: Record<string, string> = {
  "check-email":
    "Account created. Check your inbox to confirm your email, then log in.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <AuthShell>
      <h2 className="text-[clamp(1.75rem,2.4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[#17352b]">
        Log in
      </h2>

      <div className="mt-6">
        <LoginForm
          serverError={error ? ERRORS[error] : undefined}
          serverMessage={message ? MESSAGES[message] : undefined}
        />
      </div>

      <p className="mt-7 text-center text-sm leading-6 text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className={`pressable rounded-sm font-semibold text-[#17352b] underline decoration-[#d84f37] underline-offset-4 hover:text-[#b23c26] ${focusRing}`}
        >
          Create a student account
        </Link>
      </p>
    </AuthShell>
  );
}
