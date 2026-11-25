import * as React from "react"

import { cn } from "@/lib/utils"

export type AlertVariant = "default" | "success" | "warning" | "error"

export type AlertProps = React.ComponentProps<"div"> & {
  /** Semantic tone of the callout. Success is announced politely; others assertively. */
  variant?: AlertVariant
  /** Optional leading icon. Always rendered as decorative (aria-hidden). */
  icon?: React.ReactNode
}

/** Quiet, toned-down semantic tints drawn from the project's status tokens. */
const variantStyles: Record<AlertVariant, string> = {
  default: "border-[#b9dede] bg-card text-foreground",
  success: "border-[#b9dede] bg-[#eaf6f6] text-[#0b5c5c]",
  warning: "border-[#c2004b]/20 bg-[#ffffff] text-[#c2004b]",
  error: "border-[#ff0063] bg-[#ff0063]/8 text-[#c2004b]",
}

function Alert({
  className,
  variant = "default",
  icon,
  role,
  children,
  ref,
  ...props
}: AlertProps) {
  return (
    <div
      ref={ref}
      data-slot="alert"
      role={role ?? (variant === "success" ? "status" : "alert")}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          data-slot="alert-icon"
          className="mt-0.5 shrink-0 [&_svg]:h-4 [&_svg]:w-4"
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
    </div>
  )
}

function AlertTitle({ className, ref, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn("text-sm font-medium leading-snug", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ref, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn("text-sm leading-relaxed opacity-80", className)}
      {...props}
    />
  )
}

Alert.displayName = "Alert"
AlertTitle.displayName = "AlertTitle"
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
