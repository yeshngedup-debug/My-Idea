import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Span vocabulary. Each span is a typed slice of a 12-column, two-row desktop
 * grid. Curated combinations in BENTO_LAYOUTS cover exactly 24 grid units, so
 * `grid-flow-dense` can never leave a dead cell.
 */
export type BentoSpan = "feature" | "half" | "wide" | "support" | "quarter" | "full";

export type BentoCell = {
  key: string;
  span: BentoSpan;
  children: ReactNode;
  className?: string;
  /** Optional accessible name when a cell is largely visual. */
  ariaLabel?: string;
};

/**
 * Mathematically interlocking layouts (12 cols x 2 rows = 24 units):
 *   trio:    8x2 + 4 + 4            = 24
 *   quartet: 6x2 + 3 + 3 + 6        = 24
 *   quintet: 6x2 + 3 + 3 + 3 + 3    = 24
 */
export const BENTO_LAYOUTS = {
  trio: ["feature", "support", "support"],
  quartet: ["half", "quarter", "quarter", "wide"],
  quintet: ["half", "quarter", "quarter", "quarter", "quarter"],
} as const satisfies Record<string, readonly BentoSpan[]>;

const SPAN_CLASSES: Record<BentoSpan, string> = {
  feature: "md:col-span-8 md:row-span-2",
  half: "md:col-span-6 md:row-span-2",
  wide: "md:col-span-6",
  support: "md:col-span-4",
  quarter: "md:col-span-3",
  full: "md:col-span-12",
};

/** Area in 12x2 grid units; used only for a dev-time density assertion. */
const SPAN_UNITS: Record<BentoSpan, number> = {
  feature: 16,
  half: 12,
  wide: 6,
  support: 4,
  quarter: 3,
  full: 12,
};

export type BentoGridProps = {
  cells: readonly BentoCell[];
  className?: string;
};

/** Server-compatible gapless bento. No hooks, no client boundary. */
export function BentoGrid({ cells, className }: BentoGridProps) {
  if (process.env.NODE_ENV === "development") {
    const units = cells.reduce((sum, cell) => sum + SPAN_UNITS[cell.span], 0);
    if (cells.length >= 3 && cells.length <= 5 && units !== 24) {
      console.warn(
        `BentoGrid: spans cover ${units}/24 grid units; use a BENTO_LAYOUTS preset to avoid an empty cell.`,
      );
    }
  }

  return (
    <div
      className={cn(
        "bento-grid grid grid-cols-1 gap-3 md:grid-cols-12 md:auto-rows-[minmax(11rem,auto)]",
        className,
      )}
    >
      {cells.map((cell) => (
        <div
          key={cell.key}
          role={cell.ariaLabel ? "group" : undefined}
          aria-label={cell.ariaLabel}
          className={cn(
            "bento-cell relative flex min-h-44 flex-col overflow-hidden rounded-xl border border-[#0b2e2e]/10 bg-[#ffffff] p-6",
            SPAN_CLASSES[cell.span],
            cell.className,
          )}
        >
          {cell.children}
        </div>
      ))}
    </div>
  );
}
