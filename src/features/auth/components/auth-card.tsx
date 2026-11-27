import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one work surface every auth route renders.
 *
 * It carries the page title (the page's single h1), a short lead, and the
 * form. The title sits directly above the fields so a phone shows the title,
 * the inputs and the submit without any scrolling.
 */
export function AuthCard({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border border-[#b9dede] bg-white p-4 shadow-card sm:p-8",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0b5c5c]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0b2e2e] sm:text-[30px]">
        {title}
      </h1>
      {lead ? (
        <p className="mt-2 text-[14px] leading-6 text-[#356464] sm:text-[15px]">
          {lead}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
