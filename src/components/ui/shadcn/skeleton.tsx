import * as React from "react"

import { cn } from "@/lib/utils"

export type SkeletonProps = React.ComponentProps<"div">

/**
 * Still, neutral placeholder for loading content: no pulse, no shimmer, no
 * gradient. Hide it from assistive tech; the containing region should carry
 * `role="status"` (or `aria-busy`) with a short loading label.
 */
function Skeleton({ className, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-md bg-secondary", className)}
      {...props}
    />
  )
}

Skeleton.displayName = "Skeleton"

export { Skeleton }
