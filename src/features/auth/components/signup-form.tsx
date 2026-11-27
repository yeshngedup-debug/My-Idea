"use client";

/**
 * Signup form with first-pass client-side validation using the shared auth rules.
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
import { FieldError } from "@/features/auth/components/field-error";
import {
  authHintClassName,
  authInputClassName,
  authInputErrorClassName,
  authLabelClassName,
} from "@/features/auth/components/styles";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import {
  EMAIL_PATTERN,
  MAX_EMAIL_LENGTH,
  MAX_FULL_NAME_LENGTH,
  MAX_NAME_PART_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/features/auth/schemas";
import { cn } from "@/lib/utils";

type FieldName = "firstName" | "lastName" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;
type FieldValues = Record<FieldName, string>;
type SubmitState = { errors: FieldErrors; submitCount: number };

const FIELD_ORDER: FieldName[] = ["firstName", "lastName", "email", "password"];

const EMPTY_VALUES: FieldValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const INITIAL_SUBMIT_STATE: SubmitState = { errors: {}, submitCount: 0 };

const labelClassName = cn(authLabelClassName, "mb-1.5");

function validate(values: FieldValues): FieldErrors {
  const next: FieldErrors = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = values.email.trim();
  const password = values.password;

  if (!firstName) next.firstName = "First name is required.";
  else if (firstName.length > MAX_NAME_PART_LENGTH)
    next.firstName = `First name must be ${MAX_NAME_PART_LENGTH} characters or fewer.`;

  if (!lastName) next.lastName = "Last name is required.";
  else if (lastName.length > MAX_NAME_PART_LENGTH)
    next.lastName = `Last name must be ${MAX_NAME_PART_LENGTH} characters or fewer.`;
  else if (!next.firstName && fullName.length > MAX_FULL_NAME_LENGTH)
    next.lastName = `First and last names together must be ${MAX_FULL_NAME_LENGTH} characters or fewer.`;

  if (!email) next.email = "Email is required.";
  else if (email.length > MAX_EMAIL_LENGTH) next.email = "Email is too long.";
  else if (!EMAIL_PATTERN.test(email)) next.email = "Enter a valid email address.";

  if (!password) next.password = "Password is required.";
  else if (password.length < MIN_PASSWORD_LENGTH)
    next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  else if (password.length > MAX_PASSWORD_LENGTH)
    next.password = `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;

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
  const serverErrorRef = useRef<HTMLParagraphElement>(null);

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
        <AuthStatusMessage
          ref={serverErrorRef}
          id={serverErrorId}
          tabIndex={-1}
          tone="error"
          className="mb-5 focus-visible:outline-none"
        >
          {serverError}
        </AuthStatusMessage>
      )}

      <form
        action={formAction}
        noValidate
        aria-describedby={serverError ? serverErrorId : undefined}
        className="space-y-4 sm:space-y-5"
      >
        {/* First and last name sit side by side so the whole signup form —
            title, every field and the submit — still fits one phone screen. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
              className={cn(
                authInputClassName,
                errors.firstName && authInputErrorClassName,
              )}
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
              className={cn(
                authInputClassName,
                errors.lastName && authInputErrorClassName,
              )}
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
            className={cn(
              authInputClassName,
              errors.email && authInputErrorClassName,
            )}
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
              placeholder="Your password"
              className={cn(
                authInputClassName,
                errors.password && authInputErrorClassName,
              )}
            />
            <button
              type="button"
              aria-controls="password"
              aria-pressed={showPassword}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowPassword((prev) => !prev)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors duration-200 ease-[var(--ease-out)] hover:bg-muted active:bg-muted motion-reduce:transition-none focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
          <p id={passwordHintId} className={cn("mt-1.5", authHintClassName)}>
            Use 6 to 128 characters.
          </p>
          {errors.password && (
            <FieldError id={passwordErrorId}>{errors.password}</FieldError>
          )}
        </div>
        <AuthSubmitButton pendingLabel="Creating account…">
          Create account
        </AuthSubmitButton>
      </form>
    </>
  );
}
