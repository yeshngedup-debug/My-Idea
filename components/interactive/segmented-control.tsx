"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "../ui/pressable.module.css";

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
};

/**
 * Tab-like selector built from real toggle buttons. Every button stays in the
 * natural Tab order; arrow/Home/End keys are an optional focus shortcut only,
 * and selection still happens with Enter/Space (native button behaviour).
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  ariaLabel,
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
    buttonsRef.current[next]?.focus();
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-full border border-[#ded8cb] bg-[#eae5d9]/70 p-1",
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
              `inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${styles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] sm:px-5`,
              selected
                ? "bg-[#17352b] text-[#fffefa] hover:bg-[#244b3e]"
                : "text-[#17352b] hover:bg-[#fffefa]",
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
