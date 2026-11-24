import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section heading that stays near the viewport top while a long sibling
 * column scrolls. Plain CSS `position: sticky` on lg+ only; below lg both
 * columns stack normally and the class is inert. No animation runtime.
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
      <div className="lg:sticky lg:top-24 lg:self-start">{heading}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
