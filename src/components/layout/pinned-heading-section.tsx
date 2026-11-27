import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section heading and content in a two-column layout.
 *
 * The heading stays in normal document flow. It is not pinned while the
 * sibling column scrolls, which keeps the reading order stable and avoids a
 * scroll-driven layout system.
 */
export function PinnedHeadingSection({
  heading,
  children,
  split = "lg:grid-cols-[0.25fr_0.75fr]",
  className,
}: {
  heading: ReactNode;
  children: ReactNode;
  split?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-8 lg:gap-12", split, className)}>
      <div className="self-start">{heading}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
