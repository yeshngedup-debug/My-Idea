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
import { SubmitButton } from "@/components/ui/submit-button";

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
          data-auth-message
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            serverError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
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
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? emailErrorId : undefined}
            onChange={() => setEmailError(undefined)}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#d8d1c4] bg-[#f8f6f0] px-4 py-3.5 text-base text-[#18251f] placeholder:text-[#6b655c] transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] focus-visible:border-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]"
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
