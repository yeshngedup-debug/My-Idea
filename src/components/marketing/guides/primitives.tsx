import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Shared building blocks for the four public guide pages.
 *
 * Palette stays narrow: page #f5f2ea, surface #fffefa, forest #17352b,
 * vermilion #d84f37 for the one signature hairline and focus, amber for dark
 * actions. No third background tone, no gradient text, no decorative badges.
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
        tone === "surface" && "bg-[#fffefa]",
        className,
      )}
    >
      {fullBleed ? children : <div className="mx-auto max-w-[1440px]">{children}</div>}
    </section>
  );
}

const focusLight =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]";
const focusDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fffefa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17352b]";

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
        tone === "dark" && "text-[#b23c26] hover:text-[#17352b]",
        tone === "onDark" && "text-[#fffefa]/80 hover:text-[#fffefa]",
        tone === "light" && "text-[#17352b] hover:text-[#b23c26]",
        tone === "onDark" ? focusDark : focusLight,
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Filled action. Contrast is fixed: forest/white or amber/forest. */
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
          "bg-[#17352b] text-[#fffefa] hover:bg-[#244b3e] focus-visible:ring-[#d84f37] focus-visible:ring-offset-[#f5f2ea]",
        variant === "amber" &&
          "bg-[#fbbf24] text-[#17352b] hover:bg-[#e7b648] focus-visible:ring-[#fffefa] focus-visible:ring-offset-[#17352b]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
