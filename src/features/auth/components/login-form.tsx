"use client";

/**
 * Client-side validation shell for the login form.
 *
 * The form still posts directly to the `login` server action via the native
 * `action` prop, so progressive enhancement, `useFormStatus` pending state and
 * the server action's redirect are unchanged. `onSubmit` only intercepts the
 * submission when our own accessible validation fails; in that case it calls
 * preventDefault (which React honours by NOT invoking the action), sets the
 * field errors and moves focus to the first invalid field via a ref.
 */
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import Link from "next/link";
import { login } from "@/features/auth/actions";
import { authInputClassName, focusRing } from "@/features/auth/components/styles";
import { SubmitButton } from "@/components/ui/submit-button";

type FieldName = "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["email", "password"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Local: identical accessible markup for every inline error. The fade comes
 *  from `data-auth-message` in the shell CSS, with no per-keystroke state. */
function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      role="alert"
      data-auth-message
      className="mt-1.5 text-xs font-medium text-red-700"
    >
      {children}
    </p>
  );
}

export function LoginForm({
  serverError,
  serverMessage,
  passwordHelpContactHref,
}: {
  serverError?: string;
  serverMessage?: string;
  /** Server-built mailto fallback so the contact env var is never read in the browser. */
  passwordHelpContactHref: string;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const emailErrorId = `${uid}-email-error`;
  const passwordErrorId = `${uid}-password-error`;
  const serverErrorId = `${uid}-server-error`;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const serverErrorRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Server actions redirect back to this route with ?error=..., which can be a
  // client-side navigation. Focus the alert whenever the message changes, not
  // only on mount, so repeat failures are announced to keyboard and screen
  // reader users.
  useEffect(() => {
    if (serverError) serverErrorRef.current?.focus();
  }, [serverError]);

  function clearError(field: FieldName) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: FieldErrors = {};
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";

    if (Object.keys(next).length === 0) {
      setErrors({});
      // Submit exactly what we validated. The input is uncontrolled, so write
      // the trimmed value back before the action builds its FormData.
      if (emailRef.current && emailRef.current.value !== email) {
        emailRef.current.value = email;
      }
      return; // let the server action handle the submission and redirect
    }

    event.preventDefault(); // blocks the form action in React 19
    setErrors(next);

    const refs: Record<FieldName, RefObject<HTMLInputElement | null>> = {
      email: emailRef,
      password: passwordRef,
    };
    const firstInvalid = FIELD_ORDER.find((field) => next[field]);
    if (firstInvalid) refs[firstInvalid].current?.focus();
  }

  return (
    <>
      {serverError && (
        <div
          ref={serverErrorRef}
          id={serverErrorId}
          role="alert"
          tabIndex={-1}
          data-auth-message
          className="mb-5 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          {serverError}
        </div>
      )}
      {serverMessage && (
        <p
          role="status"
          data-auth-message
          className="mb-5 rounded-2xl border border-[#b9dede]/80 bg-[#eaf6f6]/80 px-4 py-3 text-sm text-[#0b5c5c] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
        >
          {serverMessage}
        </p>
      )}

      <form
        action={login}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={serverError ? serverErrorId : undefined}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[#0b5c5c]"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
            onChange={() => clearError("email")}
            autoComplete="email"
            placeholder="you@example.com"
            className={authInputClassName}
          />
          {errors.email && (
            <FieldError id={emailErrorId}>{errors.email}</FieldError>
          )}
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#0b5c5c]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className={`pressable inline-flex min-h-6 items-center rounded-sm text-xs font-medium text-[#0b5c5c] underline decoration-[#b9dede] underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-[var(--ease-out)] hover:text-[#356464] hover:decoration-[#0b5c5c] ${focusRing}`}
            >
              Forgot password?
            </Link>
          </div>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            required
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            onChange={() => clearError("password")}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={authInputClassName}
          />
          {errors.password && (
            <FieldError id={passwordErrorId}>{errors.password}</FieldError>
          )}
          <p className="mt-2 text-xs leading-5 text-[#356464]">
            Didn&apos;t get a reset email?{" "}
            <a
              href={passwordHelpContactHref}
              className={`pressable inline-flex min-h-6 items-center rounded-sm font-medium text-[#0b5c5c] underline decoration-[#b9dede] underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-[var(--ease-out)] hover:text-[#356464] hover:decoration-[#0b5c5c] ${focusRing}`}
            >
              Contact us
            </a>
          </p>
        </div>
        <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
      </form>
    </>
  );
}
