"use client";

/**
 * Email form for requesting a password-reset link.
 *
 * Validation runs before the native server action so an invalid address never
 * reaches Neon Auth. The server's stable `sent` response is deliberately
 * non-enumerating; this shell only presents that response accessibly.
 */
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { requestPasswordReset } from "@/features/auth/actions";
import { FieldError } from "@/features/auth/components/field-error";
import {
  authInputClassName,
  authInputErrorClassName,
  authLabelClassName,
} from "@/features/auth/components/styles";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm({
  serverError,
  serverMessage,
}: {
  serverError?: string;
  serverMessage?: string;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const emailErrorId = `${uid}-email-error`;
  const statusId = `${uid}-status`;

  const emailRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [emailError, setEmailError] = useState<string>();

  const status = serverError ?? serverMessage;

  useEffect(() => {
    if (status) statusRef.current?.focus();
  }, [status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    if (!email) {
      event.preventDefault();
      setEmailError("Email is required.");
      emailRef.current?.focus();
      return;
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      event.preventDefault();
      setEmailError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    setEmailError(undefined);
    if (emailRef.current && emailRef.current.value !== email) {
      emailRef.current.value = email;
    }
  }

  return (
    <>
      {status && (
        <AuthStatusMessage
          ref={statusRef}
          id={statusId}
          tabIndex={-1}
          tone={serverError ? "error" : "success"}
          className="mb-5 focus-visible:outline-none"
        >
          {status}
        </AuthStatusMessage>
      )}

      <form
        action={requestPasswordReset}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={status ? statusId : undefined}
        className="space-y-4 sm:space-y-5"
      >
        <div>
          <label htmlFor="email" className={cn(authLabelClassName, "mb-1.5")}>
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? emailErrorId : undefined}
            onChange={() => setEmailError(undefined)}
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              authInputClassName,
              emailError && authInputErrorClassName,
            )}
          />
          {emailError && (
            <FieldError id={emailErrorId}>{emailError}</FieldError>
          )}
        </div>

        <AuthSubmitButton pendingLabel="Sending reset link…">
          Send reset link
        </AuthSubmitButton>
      </form>
    </>
  );
}
