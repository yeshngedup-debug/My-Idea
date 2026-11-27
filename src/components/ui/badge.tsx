import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Quiet status labels. Natural case, one weight, square edges and no uppercase
 * tracking games: the surrounding heading carries the emphasis. `className`
 * overrides win so call sites can still tint a badge for a specific status.
 */
export type BadgeVariant = "default" | "outline" | "secondary"

export function Badge({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: BadgeVariant
}) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "border-border-strong bg-secondary text-primary",
    outline: "border-border-strong bg-card text-body-secondary",
    secondary: "border-primary bg-primary text-primary-foreground",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-normal leading-normal tracking-normal",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
