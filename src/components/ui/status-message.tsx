import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "error" | "info";

const TONE_STYLES: Record<StatusTone, string> = {
  success: "border-border/30 bg-secondary text-accent",
  error: "border-destructive/25 bg-cta/8 text-destructive",
  info: "border-border/25 bg-card text-accent",
};

/**
 * One action-result surface for auth and dashboard feedback. Errors interrupt;
 * success and progress wait for a polite moment. Keep the visible text and the
 * announced text the same — do not add an aria-label that overrides it. Pass
 * id, tabIndex and ref when the message must also be the focus target, so
 * focus and the live region stay on the same element.
 */
export function StatusMessage({
  tone = "info",
  children,
  className,
  id,
  tabIndex,
  ref,
}: {
  tone?: StatusTone;
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
      "flex min-h-11 items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-6",
      TONE_STYLES[tone],
      className,
    ),
  };

  // The role and live politeness never change on a mounted node: each branch
  // returns its own fixed live region, so assistive tech sees one stable surface.
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
