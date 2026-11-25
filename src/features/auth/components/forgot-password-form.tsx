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
import { authInputClassName } from "@/features/auth/components/styles";
import { SubmitButton } from "@/components/ui/submit-button";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Local: identical accessible markup for every inline error. The message is
 *  static text, so there is no per-keystroke state to manage. */
function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-xs font-medium text-red-700"
    >
      {children}
    </p>
  );
}

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
  const statusRef = useRef<HTMLDivElement>(null);
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
        <div
          ref={statusRef}
          id={statusId}
          role={serverError ? "alert" : "status"}
          tabIndex={-1}
          className={`mb-5 rounded-[2px] border px-4 py-3 text-sm ${
            serverError
              ? "border-red-200/80 bg-red-50/80 text-red-700"
              : "border-[#b9dede]/80 bg-[#eaf6f6]/80 text-[#0b5c5c]"
          }`}
        >
          {status}
        </div>
      )}

      <form
        action={requestPasswordReset}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={status ? statusId : undefined}
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
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? emailErrorId : undefined}
            onChange={() => setEmailError(undefined)}
            autoComplete="email"
            placeholder="you@example.com"
            className={authInputClassName}
          />
          {emailError && (
            <FieldError id={emailErrorId}>{emailError}</FieldError>
          )}
        </div>

        <SubmitButton pendingLabel="Sending reset link…">Send reset link</SubmitButton>
      </form>
    </>
  );
}
