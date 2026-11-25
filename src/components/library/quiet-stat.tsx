import { cn } from "@/lib/utils";

/**
 * A typographic figure, not a card. No border, no panel, no sparkline, no
 * icon and no counter. Server-compatible: no hooks and no client directive.
 */
export function QuietStat({
  value,
  label,
  note,
  className,
}: {
  value: string;
  label: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-2xl font-medium leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <p className="text-sm leading-snug text-muted-foreground">{label}</p>
      {note ? (
        <p className="text-xs leading-snug text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}
