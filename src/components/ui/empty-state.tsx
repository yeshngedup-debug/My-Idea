import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
};

const bodyClass =
  "mx-auto mt-2 max-w-[46ch] text-sm leading-6 text-[#356464]";
const actionClass = "mt-5 flex justify-center";

/**
 * Shared zero-state panel for dashboards. It states what is missing and gives
 * one next action when there is somewhere useful to go.
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
        "rounded-2xl border border-dashed border-[#b9dede] bg-white p-8 text-center sm:p-10",
        className,
      )}
    >
      <Heading className="text-lg font-semibold text-[#0b5c5c]">
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
        "rounded-2xl border border-[#c2004b]/25 bg-[#ff0063]/8 p-8 text-center sm:p-10",
        className,
      )}
    >
      <Heading className="text-lg font-semibold text-[#c2004b]">
        {title}
      </Heading>
      <p className={bodyClass}>{description}</p>
      <div className={actionClass}>{action}</div>
    </div>
  );
}
