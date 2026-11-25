import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Server-compatible: hover and focus-within are CSS states, so no client
 * runtime, handler or hook is needed here.
 *
 * A 1px hairline and one background step, shown only on hover or keyboard
 * focus within. The transparent base border reserves the 1px so the surface
 * never shifts. No glow, no gradient, no scale, and the focus ring is kept.
 */
export function HoverHighlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-transparent bg-transparent",
        "transition-[background-color,border-color] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none",
        "hover:border-border hover:bg-muted focus-within:border-border focus-within:bg-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {children}
    </div>
  );
}
