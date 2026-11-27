"use client";

/**
 * Auth-local submit button with the same pending contract as the shared UI
 * button: `useFormStatus` drives the label and a stable live region announces
 * the changed label when disabling the button drops focus.
 */
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function AuthSubmitButton({
  children,
  pendingLabel,
}: {
  children: ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-cta px-4 py-3 text-sm font-medium text-cta-foreground transition-colors duration-200 ease-[var(--ease-out)] hover:bg-cta-hover disabled:opacity-50 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border-2 border-cta-foreground/40 border-t-cta-foreground animate-spin motion-reduce:animate-none"
            />
            {pendingLabel}
          </span>
        ) : (
          children
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}
