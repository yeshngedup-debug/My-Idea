import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export type SectionIntroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Id for the h2, so a section can point aria-labelledby at it. */
  headingId?: string;
  className?: string;
};

/** Stacked section heading. Never renders a split header. */
export function SectionIntro({
  eyebrow,
  title,
  lead,
  headingId,
  className,
}: SectionIntroProps) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-sm font-medium text-[#356464]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={headingId}
        className="mt-3 text-balance text-4xl font-medium leading-[1.04] tracking-normal text-[#0b5c5c] sm:text-6xl sm:tracking-[-0.02em]"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#356464] sm:text-base">
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}
