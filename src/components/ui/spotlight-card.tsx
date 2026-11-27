import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Quiet card surface. The decorative cursor-following glow was removed: the
 * card keeps a hairline border and a visible focus ring, and the content is
 * the only thing that carries colour. The `tint` prop remains for API
 * compatibility with existing callers.
 */
export function SpotlightCard({
  children,
  className,
  tint,
}: {
  children: ReactNode;
  className?: string;
  tint?: string;
}) {
  void tint;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-border/12 bg-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      {children}
    </div>
  );
}
