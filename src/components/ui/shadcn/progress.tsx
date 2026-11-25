import * as React from "react"

import { cn } from "@/lib/utils"

export type ProgressProps = React.ComponentProps<"div"> & {
  /** Current value. Omit for an indeterminate bar. */
  value?: number
  /** Lower bound. Default 0. */
  min?: number
  /** Upper bound. Default 100. */
  max?: number
  /** Visible label; also used as the bar's accessible name. */
  label?: string
  /** Override the displayed value text, e.g. "3 of 5 steps". */
  valueLabel?: string
  /** Show the value as text beside the label. Default true. */
  showValue?: boolean
}

function Progress({
  className,
  value,
  min = 0,
  max = 100,
  label,
  valueLabel,
  showValue = true,
  children,
  ref,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-valuetext": ariaValueText,
  ...props
}: ProgressProps) {
  const upper = max > min ? max : min + 1
  const current =
    value === undefined ? undefined : Math.min(upper, Math.max(min, value))
  const percent =
    current === undefined ? 0 : ((current - min) / (upper - min)) * 100
  const displayValue = valueLabel ?? `${Math.round(percent)}%`

  return (
    <div ref={ref} data-slot="progress" className={cn("w-full", className)} {...props}>
      {label || showValue || children ? (
        <div className="mb-2 flex items-baseline gap-3 text-xs">
          {label ? <span className="font-medium text-foreground">{label}</span> : null}
          {children}
          {showValue ? (
            <span className="ml-auto tabular-nums text-body-secondary">{displayValue}</span>
          ) : null}
        </div>
      ) : null}
      <div
        data-slot="progress-track"
        role="progressbar"
        aria-describedby={ariaDescribedBy}
        aria-valuemin={min}
        aria-valuemax={upper}
        aria-valuenow={current}
        aria-valuetext={current === undefined ? undefined : ariaValueText ?? displayValue}
        aria-label={ariaLabel ?? label}
        aria-labelledby={ariaLabelledBy}
        className="h-2 w-full overflow-hidden rounded-full bg-[#18251f]/10"
      >
        {current !== undefined ? (
          <div
            data-slot="progress-indicator"
            className="h-full rounded-full bg-[#17352b]"
            style={{ width: `${percent}%` }}
          />
        ) : null}
      </div>
    </div>
  )
}

Progress.displayName = "Progress"

export { Progress }
