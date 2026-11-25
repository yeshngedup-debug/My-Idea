import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Shared building blocks for the four public guide pages.
 *
 * Palette stays narrow: mist page, white surface, teal structure, magenta for
 * the single primary action and focus, ink for text. No third background tone,
 * no gradient text, no decorative badges.
 */

export function Chapter({
  id,
  labelledBy,
  label,
  tone = "page",
  fullBleed = false,
  className,
  children,
}: {
  id?: string;
  labelledBy?: string;
  label?: string;
  tone?: "page" | "surface";
  /** Let media reach the viewport edges. Text stays inset by the caller. */
  fullBleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn(
        "py-20 md:py-24",
        !fullBleed && "px-5 sm:px-8 lg:px-12",
        tone === "surface" && "bg-[#ffffff]",
        className,
      )}
    >
      {fullBleed ? children : <div className="mx-auto max-w-[1440px]">{children}</div>}
    </section>
  );
}

const focusLight =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]";
const focusDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffffff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b5c5c]";

/** Quiet inline link; no pill, no badge, no arrow. */
export function TextLink({
  href,
  children,
  tone = "light",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark" | "onDark";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center text-sm font-medium transition-colors",
        tone === "dark" && "text-[#c2004b] hover:text-[#0b5c5c]",
        tone === "onDark" && "text-[#ffffff]/80 hover:text-[#ffffff]",
        tone === "light" && "text-[#0b5c5c] hover:text-[#c2004b]",
        tone === "onDark" ? focusDark : focusLight,
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** One magenta primary, one quiet teal peer. Both keep a 44px target. */
export function ActionLink({
  href,
  children,
  variant = "forest",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "forest" | "amber";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "pressable inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg px-6 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "forest" &&
          "bg-[#ff0063] text-[#000000] hover:bg-[#d40054] focus-visible:ring-[#ff0063] focus-visible:ring-offset-[#eaf6f6]",
        variant === "amber" &&
          "border border-[#b9dede] bg-[#eaf6f6] text-[#0b2e2e] hover:bg-[#66bfbf] focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-[#ffffff]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
