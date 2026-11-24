"use client";

/**
 * Client-side validation shell for the signup form.
 *
 * The form keeps its native `action={signup}` semantics; `onSubmit` only
 * prevents submission when our accessible validation fails. Field errors are
 * announced via role="alert" and associated with their inputs through
 * aria-describedby, and focus moves to the first invalid field using a ref.
 */
import { useCallback, useId, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

type FieldName = "firstName" | "lastName" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["firstName", "lastName", "email", "password"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function SignupForm({ serverError }: { serverError?: string }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const firstNameErrorId = `${uid}-firstName-error`;
  const lastNameErrorId = `${uid}-lastName-error`;
  const emailErrorId = `${uid}-email-error`;
  const passwordErrorId = `${uid}-password-error`;
  const passwordHintId = "password-hint";
  const serverErrorId = `${uid}-server-error`;

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Focus the server-provided error summary on mount (?error=...). React's
  // autoFocus only focuses form elements, so a callback ref is used on this
  // focusable role="alert" container.
  const focusServerError = useCallback((node: HTMLDivElement | null) => {
    node?.focus();
  }, []);

  function clearError(field: FieldName) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: FieldErrors = {};
    if (!firstName) next.firstName = "First name is required.";
    if (!lastName) next.lastName = "Last name is required.";
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

    if (Object.keys(next).length === 0) {
      setErrors({});
      return; // let the server action handle the submission and redirect
    }

    event.preventDefault(); // blocks the form action in React 19
    setErrors(next);

    const refs: Record<FieldName, RefObject<HTMLInputElement | null>> = {
      firstName: firstNameRef,
      lastName: lastNameRef,
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

      <form
        action={signup}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={serverError ? serverErrorId : undefined}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-semibold text-[#17352b]"
            >
              First name
            </label>
            <input
              ref={firstNameRef}
              id="firstName"
              name="firstName"
              type="text"
              required
              aria-required="true"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={errors.firstName ? firstNameErrorId : undefined}
              onChange={() => clearError("firstName")}
              autoComplete="given-name"
              placeholder="Tashi"
              className="w-full rounded-xl border border-[#d8d1c4] bg-[#f8f6f0] px-4 py-3.5 text-base text-[#18251f] placeholder:text-[#6b655c] transition-[border-color,box-shadow] sm:text-sm duration-150 ease-[var(--ease-out)] focus-visible:border-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]/20"
            />
            {errors.firstName && (
              <p
                id={firstNameErrorId}
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-700"
              >
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-semibold text-[#17352b]"
            >
              Last name
            </label>
            <input
              ref={lastNameRef}
              id="lastName"
              name="lastName"
              type="text"
              required
              aria-required="true"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={errors.lastName ? lastNameErrorId : undefined}
              onChange={() => clearError("lastName")}
              autoComplete="family-name"
              placeholder="Dorji"
              className="w-full rounded-xl border border-[#d8d1c4] bg-[#f8f6f0] px-4 py-3.5 text-base text-[#18251f] placeholder:text-[#6b655c] transition-[border-color,box-shadow] sm:text-sm duration-150 ease-[var(--ease-out)] focus-visible:border-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]/20"
            />
            {errors.lastName && (
              <p
                id={lastNameErrorId}
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-700"
              >
                {errors.lastName}
              </p>
            )}
          </div>
        </div>
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
            className="mb-2 block text-sm font-semibold text-slate-700"
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
            minLength={MIN_PASSWORD_LENGTH}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password
                ? `${passwordHintId} ${passwordErrorId}`
                : passwordHintId
            }
            onChange={() => clearError("password")}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-[#d8d1c4] bg-[#f8f6f0] px-4 py-3 text-base text-[#18251f] placeholder:text-[#6b655c] transition-[border-color,box-shadow] sm:text-sm duration-150 ease-[var(--ease-out)] focus-visible:border-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]/20"
          />
          <p id={passwordHintId} className="mt-1.5 text-xs text-[#56645c]">
            Minimum 6 characters.
          </p>
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
        <SubmitButton pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </>
  );
}
