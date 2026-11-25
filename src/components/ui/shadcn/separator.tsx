import * as React from "react"

import { cn } from "@/lib/utils"

export type SeparatorProps = React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  /** Presentational separators are removed from the accessibility tree. */
  decorative?: boolean
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = false,
  role,
  ref,
  ...props
}: SeparatorProps) {
  return (
    <div
      ref={ref}
      data-slot="separator"
      role={role ?? (decorative ? "none" : "separator")}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-[#0b2e2e]/10",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  )
}

Separator.displayName = "Separator"

export { Separator }
