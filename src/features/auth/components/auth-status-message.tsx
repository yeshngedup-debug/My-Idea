import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

export type AuthStatusTone = "success" | "error";

const TONE_STYLES: Record<AuthStatusTone, string> = {
  success: "border-border bg-muted text-foreground",
  error: "border-border bg-muted font-medium text-foreground",
};

/**
 * Auth-local server-result surface. Errors interrupt; confirmations wait for a
 * polite moment. The visible and announced text stay the same, and the ref can
 * be passed to the same element so focus and the live region never diverge.
 */
export function AuthStatusMessage({
  tone = "success",
  children,
  className,
  id,
  tabIndex,
  ref,
}: {
  tone?: AuthStatusTone;
  children: ReactNode;
  className?: string;
  id?: string;
  tabIndex?: number;
  ref?: Ref<HTMLParagraphElement>;
}) {
  const shared = {
    ref,
    id,
    tabIndex,
    className: cn(
      "flex min-h-11 items-start gap-2 rounded-lg border px-4 py-3 text-sm leading-6 transition-[background-color,border-color,color,opacity] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
      TONE_STYLES[tone],
      className,
    ),
  };

  if (tone === "error") {
    return (
      <p {...shared} role="alert" aria-live="assertive" aria-atomic="true">
        {children}
      </p>
    );
  }

  return (
    <p {...shared} role="status" aria-live="polite" aria-atomic="true">
      {children}
    </p>
  );
}
