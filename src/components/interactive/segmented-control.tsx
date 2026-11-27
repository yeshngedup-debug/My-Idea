"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentOption = {
  label: string;
  value: string;
};

export type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Optional accessible name for the control group. */
  ariaLabel?: string;
  /**
   * Selection follows arrow/Home/End focus by default. Set false only when a
   * caller needs focus-only movement; Enter/Space always selects.
   */
  selectOnArrow?: boolean;
};

/**
 * Tab-like selector built from real toggle buttons. Every button stays in the
 * natural Tab order; arrow/Home/End move focus and selection together.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  ariaLabel,
  selectOnArrow = true,
}: SegmentedControlProps) {
  const buttonsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  if (options.length === 0) return null;

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = buttonsRef.current.indexOf(event.target as HTMLButtonElement);
    if (current === -1) return;

    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % options.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + options.length) % options.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = options.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const target = buttonsRef.current[next];
    const option = options[next];
    if (!target || !option) return;
    target.focus();
    if (selectOnArrow) onChange(option.value);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-full border border-border bg-muted p-1",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:px-5",
              selected
                ? "bg-cta text-cta-foreground hover:bg-cta-hover"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
