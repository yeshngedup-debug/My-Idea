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
import { useCallback, useId, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

type FieldName = "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["email", "password"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({
  serverError,
  serverMessage,
}: {
  serverError?: string;
  serverMessage?: string;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const emailErrorId = `${uid}-email-error`;
  const passwordErrorId = `${uid}-password-error`;
  const serverErrorId = `${uid}-server-error`;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // A callback ref (stable identity) focuses the server error summary on mount
  // only when the ?error= query parameter produced a message. React's
  // autoFocus does not programmatically focus non-form elements, so a ref is
  // the reliable option for this role="alert" container.
  const focusServerError = useCallback((node: HTMLDivElement | null) => {
    node?.focus();
  }, []);

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
          ref={focusServerError}
          id={serverErrorId}
          role="alert"
          tabIndex={-1}
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}
      {serverMessage && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
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
            className="mb-2 block text-sm font-semibold text-[#17352b]"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
            onChange={() => clearError("email")}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#d8d1c4] bg-[#f8f6f0] px-4 py-3.5 text-base text-[#18251f] placeholder:text-[#6b655c] transition-[border-color,box-shadow] sm:text-sm duration-150 ease-[var(--ease-out)] focus-visible:border-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]/20"
          />
          {errors.email && (
            <p
              id={emailErrorId}
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-700"
            >
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-[#17352b]"
          >
            Password
          </label>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            required
            aria-required="true"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            onChange={() => clearError("password")}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-[#d8d1c4] bg-[#f8f6f0] px-4 py-3.5 text-base text-[#18251f] placeholder:text-[#6b655c] transition-[border-color,box-shadow] sm:text-sm duration-150 ease-[var(--ease-out)] focus-visible:border-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]/20"
          />
          {errors.password && (
            <p
              id={passwordErrorId}
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-700"
            >
              {errors.password}
            </p>
          )}
        </div>
        <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
      </form>
    </>
  );
}
