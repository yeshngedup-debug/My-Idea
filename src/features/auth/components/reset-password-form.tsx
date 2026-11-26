"use client";

/**
 * New-password form for a reset-token backed recovery session.
 *
 * Both fields are validated before the native server action runs, with the
 * same length rule the action enforces. Errors are announced and focus moves
 * to the first invalid field.
 */
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { resetPassword } from "@/features/auth/actions";
import { FieldError } from "@/features/auth/components/field-error";
import { authInputClassName } from "@/features/auth/components/styles";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/features/auth/schemas";

type FieldName = "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["password", "confirmPassword"];

export function ResetPasswordForm({ serverError }: { serverError?: string }) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const passwordErrorId = `${uid}-password-error`;
  const confirmErrorId = `${uid}-confirm-error`;
  const serverErrorId = `${uid}-server-error`;

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const serverErrorRef = useRef<HTMLParagraphElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (serverError) serverErrorRef.current?.focus();
  }, [serverError]);

  function clearError(field: FieldName) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    const next: FieldErrors = {};
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      next.password = `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`;
    }
    if (confirmPassword !== password) {
      next.confirmPassword = "Both password entries must match.";
    }

    if (Object.keys(next).length === 0) {
      setErrors({});
      return; // let the server action handle the submission and redirect
    }

    event.preventDefault(); // blocks the form action in React 19
    setErrors(next);

    const refs: Record<FieldName, RefObject<HTMLInputElement | null>> = {
      password: passwordRef,
      confirmPassword: confirmRef,
    };
    const firstInvalid = FIELD_ORDER.find((field) => next[field]);
    if (firstInvalid) refs[firstInvalid].current?.focus();
  }

  return (
    <>
      {serverError && (
        <StatusMessage
          ref={serverErrorRef}
          id={serverErrorId}
          tabIndex={-1}
          tone="error"
          className="mb-5 rounded-[2px] focus-visible:outline-none"
        >
          {serverError}
        </StatusMessage>
      )}

      <form
        action={resetPassword}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={serverError ? serverErrorId : undefined}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-[#0b5c5c]"
          >
            New password
          </label>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            onChange={() => clearError("password")}
            autoComplete="new-password"
            placeholder="Enter a new password"
            className={authInputClassName}
          />
          {errors.password && (
            <FieldError id={passwordErrorId}>{errors.password}</FieldError>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold text-[#0b5c5c]"
          >
            Confirm new password
          </label>
          <input
            ref={confirmRef}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={errors.confirmPassword ? confirmErrorId : undefined}
            onChange={() => clearError("confirmPassword")}
            autoComplete="new-password"
            placeholder="Enter the new password again"
            className={authInputClassName}
          />
          {errors.confirmPassword && (
            <FieldError id={confirmErrorId}>{errors.confirmPassword}</FieldError>
          )}
        </div>

        <SubmitButton pendingLabel="Saving new password…">Save new password</SubmitButton>
      </form>
    </>
  );
}
