"use client";

import * as React from "react";
import { Check, Copy, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import styles from "@/styles/pressable.module.css";

type CopyStatus = "idle" | "copied" | "error";

export type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

const RESET_DELAY_MS = 2400;

/**
 * Copies text to the clipboard and announces the outcome in local live
 * regions. The visible label stays stable (so its accessible name does not
 * shift mid-interaction); the icon carries the visual result.
 */
export function CopyButton({
  text,
  label = "Copy shortlist text",
  className,
}: CopyButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = React.useState<CopyStatus>("idle");

  React.useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  async function handleClick() {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    // Some browsers do not focus a button on pointer activation, so return
    // focus explicitly once the asynchronous copy has settled.
    buttonRef.current?.focus({ preventScroll: true });

    resetTimerRef.current = setTimeout(() => setStatus("idle"), RESET_DELAY_MS);
  }

  const Icon = status === "copied" ? Check : status === "error" ? WarningCircle : Copy;

  return (
    <span className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={cn(
          `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#ded8cb] bg-[#fffefa] px-5 py-2 text-sm font-semibold text-[#17352b] ${styles.press} hover:border-[#17352b] hover:bg-[#eae5d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]`,
          className,
        )}
      >
        <Icon
          aria-hidden="true"
          weight="bold"
          className={cn(
            "h-4 w-4 shrink-0",
            status === "copied" && "text-[#377553]",
            status === "error" && "text-[#c24132]",
          )}
        />
        {label}
      </button>

      {/* Both regions stay mounted and empty until a result exists, so the
          subsequent text change is announced reliably by assistive tech. */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "copied" ? "Copied to clipboard." : ""}
      </span>
      <span role="alert" aria-atomic="true" className="sr-only">
        {status === "error"
          ? "Could not copy. Please try again or select the text manually."
          : ""}
      </span>
    </span>
  );
}

export default CopyButton;
