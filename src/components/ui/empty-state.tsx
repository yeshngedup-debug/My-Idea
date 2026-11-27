import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
};

const bodyClass = "mt-1.5 max-w-[52ch] text-sm leading-6 text-[#356464]";
const actionClass = "mt-4";

/**
 * Shared zero-state panel for dashboards. It states what is missing and gives
 * one next action when there is somewhere useful to go. Left-aligned and
 * compact so it sits inside a dense section instead of floating as a card.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
  headingLevel: Heading = "h3",
}: StateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[#b9dede] bg-[#ffffff] px-5 py-6",
        className,
      )}
    >
      <Heading className="text-base font-semibold leading-6 text-[#0b5c5c]">
        {title}
      </Heading>
      <p className={bodyClass}>{description}</p>
      {action ? <div className={actionClass}>{action}</div> : null}
    </div>
  );
}

/**
 * Shared failed-load panel. A retry action is required: a failure without a
 * way forward is a dead end.
 */
export function ErrorState({
  title,
  description,
  action,
  className,
  headingLevel: Heading = "h3",
}: Required<Pick<StateProps, "action">> & Omit<StateProps, "action">) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-[#c2004b]/30 bg-[#ff0063]/8 px-5 py-6",
        className,
      )}
    >
      <Heading className="text-base font-semibold leading-6 text-[#c2004b]">
        {title}
      </Heading>
      <p className={bodyClass}>{description}</p>
      <div className={actionClass}>{action}</div>
    </div>
  );
}
