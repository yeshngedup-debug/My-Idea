"use client";

/**
 * Signup form with authoritative client-side validation.
 *
 * Validation runs inside the form action (`useActionState`), so the server
 * action is never called for an invalid submission. Values are held in state
 * because React resets the form after an action; this keeps a failed
 * validation pass from clearing what the visitor typed. Field errors are
 * announced with role="alert", linked through aria-describedby, and focus
 * moves to the first invalid field.
 */
import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { signup } from "@/features/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type FieldName = "firstName" | "lastName" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;
type FieldValues = Record<FieldName, string>;
type SubmitState = { errors: FieldErrors; submitCount: number };

const FIELD_ORDER: FieldName[] = ["firstName", "lastName", "email", "password"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 80;
const MAX_FULL_NAME_LENGTH = 80;

const EMPTY_VALUES: FieldValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const INITIAL_SUBMIT_STATE: SubmitState = { errors: {}, submitCount: 0 };

const inputClassName =
  "w-full min-w-0 rounded-xl border border-[#b9dede] bg-white px-4 py-3.5 text-base text-[#0b2e2e] placeholder:text-[#356464] transition-[border-color,box-shadow] sm:text-sm duration-150 ease-[var(--ease-out)] focus-visible:border-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063]/20";

const labelClassName = "mb-2 block text-sm font-semibold text-[#0b5c5c]";

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

function validate(values: FieldValues): FieldErrors {
  const next: FieldErrors = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = values.email.trim();
  const password = values.password;

  if (!firstName) next.firstName = "First name is required.";
  else if (firstName.length > MAX_NAME_LENGTH)
    next.firstName = `First name must be ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!lastName) next.lastName = "Last name is required.";
  else if (lastName.length > MAX_NAME_LENGTH)
    next.lastName = `Last name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  else if (!next.firstName && fullName.length > MAX_FULL_NAME_LENGTH)
    next.lastName = `First and last names together must be ${MAX_FULL_NAME_LENGTH} characters or fewer.`;

  if (!email) next.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email)) next.email = "Enter a valid email address.";

  if (!password) next.password = "Password is required.";
  else if (password.length < MIN_PASSWORD_LENGTH)
    next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

  return next;
}

export function SignupForm({ serverError }: { serverError?: string }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const firstNameErrorId = `${uid}-firstName-error`;
  const lastNameErrorId = `${uid}-lastName-error`;
  const emailErrorId = `${uid}-email-error`;
  const passwordErrorId = `${uid}-password-error`;
  const passwordHintId = `${uid}-password-hint`;
  const serverErrorId = `${uid}-server-error`;

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const serverErrorRef = useRef<HTMLDivElement>(null);

  const fieldRefs = useMemo(
    () => ({
      firstName: firstNameRef,
      lastName: lastNameRef,
      email: emailRef,
      password: passwordRef,
    }),
    []
  ) as Record<FieldName, RefObject<HTMLInputElement | null>>;

  const [values, setValues] = useState<FieldValues>(EMPTY_VALUES);
  const [clearedErrors, setClearedErrors] = useState<
    Partial<Record<FieldName, true>>
  >({});
  const [showPassword, setShowPassword] = useState(false);

  async function submitAction(
    prevState: SubmitState,
    formData: FormData
  ): Promise<SubmitState> {
    const nextValues: FieldValues = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };
    setValues(nextValues);
    setClearedErrors({});

    const nextErrors = validate(nextValues);
    if (Object.keys(nextErrors).length === 0) {
      await signup(formData);
    }

    return { errors: nextErrors, submitCount: prevState.submitCount + 1 };
  }

  const [submitState, formAction] = useActionState(
    submitAction,
    INITIAL_SUBMIT_STATE
  );

  useEffect(() => {
    if (serverError) serverErrorRef.current?.focus();
  }, [serverError]);

  useEffect(() => {
    if (submitState.submitCount === 0) return;
    const firstInvalid = FIELD_ORDER.find((field) => submitState.errors[field]);
    if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
  }, [submitState, fieldRefs]);

  const errors: FieldErrors = {};
  for (const field of FIELD_ORDER) {
    if (submitState.errors[field] && !clearedErrors[field]) {
      errors[field] = submitState.errors[field];
    }
  }

  function setField(field: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setClearedErrors((prev) => ({ ...prev, [field]: true }));
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
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <form
        action={formAction}
        noValidate
        aria-describedby={serverError ? serverErrorId : undefined}
        className="space-y-4 sm:space-y-5"
      >
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div>
            <label htmlFor="firstName" className={labelClassName}>
              First name
            </label>
            <input
              ref={firstNameRef}
              id="firstName"
              name="firstName"
              type="text"
              value={values.firstName}
              required
              aria-required="true"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={errors.firstName ? firstNameErrorId : undefined}
              onChange={(event) => setField("firstName", event.target.value)}
              autoComplete="given-name"
              placeholder="Tashi"
              className={inputClassName}
            />
            {errors.firstName && (
              <FieldError id={firstNameErrorId}>{errors.firstName}</FieldError>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className={labelClassName}>
              Last name
            </label>
            <input
              ref={lastNameRef}
              id="lastName"
              name="lastName"
              type="text"
              value={values.lastName}
              required
              aria-required="true"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={errors.lastName ? lastNameErrorId : undefined}
              onChange={(event) => setField("lastName", event.target.value)}
              autoComplete="family-name"
              placeholder="Dorji"
              className={inputClassName}
            />
            {errors.lastName && (
              <FieldError id={lastNameErrorId}>{errors.lastName}</FieldError>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            value={values.email}
            required
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
            onChange={(event) => setField("email", event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
          />
          {errors.email && (
            <FieldError id={emailErrorId}>{errors.email}</FieldError>
          )}
        </div>
        <div>
          <label htmlFor="password" className={labelClassName}>
            Password
          </label>
          <div className="flex items-stretch gap-2">
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              required
              aria-required="true"
              minLength={MIN_PASSWORD_LENGTH}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={
                errors.password
                  ? `${passwordHintId} ${passwordErrorId}`
                  : passwordHintId
              }
              onChange={(event) => setField("password", event.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className={inputClassName}
            />
            <button
              type="button"
              aria-controls="password"
              aria-pressed={showPassword}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowPassword((prev) => !prev)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-[#b9dede] bg-white px-3 text-sm font-medium text-[#0b5c5c] transition-[border-color,background-color] duration-150 ease-[var(--ease-out)] hover:bg-[#eaf6f6] focus-visible:border-[#ff0063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063]/20"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
          <p id={passwordHintId} className="mt-1.5 text-xs text-[#356464]">
            Minimum 6 characters.
          </p>
          {errors.password && (
            <FieldError id={passwordErrorId}>{errors.password}</FieldError>
          )}
        </div>
        <SubmitButton pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </>
  );
}
