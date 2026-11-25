import * as React from "react";
import { cn } from "@/lib/utils";

export type TooltipProps = {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

/**
 * CSS-only tooltip for a single focusable trigger (normally an icon button).
 * It appears on pointer hover and on keyboard focus-within, never takes focus
 * itself, and is pointer-events-none so it cannot block the trigger.
 *
 * Pass exactly one interactive element as `children`; aria-describedby is
 * merged onto it so screen readers announce the label on focus.
 */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const tooltipId = React.useId();
  const isTop = side === "top";

  const trigger = React.isValidElement<{ "aria-describedby"?: string }>(children)
    ? React.cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], tooltipId]
          .filter(Boolean)
          .join(" "),
      })
    : children;

  return (
    <span className={cn("group relative inline-flex", className)}>
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-[#0b5c5c] px-3 py-2 text-xs font-medium leading-snug text-[#ffffff] opacity-0 shadow-lg transition-opacity duration-150 ease-[var(--ease-out)]",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          // Origin faces the trigger so the tooltip is anchored to it; the
          // opacity-only fade is symmetric and survives reduced motion.
          isTop ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top",
        )}
      >
        {label}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#0b5c5c]",
            isTop ? "top-full -mt-1" : "bottom-full -mb-1",
          )}
        />
      </span>
    </span>
  );
}

export default Tooltip;
