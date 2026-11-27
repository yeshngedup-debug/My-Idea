import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one work surface every auth route renders.
 *
 * It carries the page's single h1, a short lead, and the form. The heading sits
 * directly above the fields so a phone shows the title, the inputs and the
 * submit without any scrolling.
 */
export function AuthCard({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("border border-border bg-card p-6 sm:p-8", className)}
    >
      <h1 className="display-md text-foreground">{title}</h1>
      {lead ? (
        <p className="lead-copy mt-3 max-w-[42ch]">{lead}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
