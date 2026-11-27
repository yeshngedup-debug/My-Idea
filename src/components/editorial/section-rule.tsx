import { cn } from "@/lib/utils";

export type SectionRuleProps = {
  /** Plain editorial label. Never a numeric "SECTION 01" style tag. */
  label?: string;
  className?: string;
};

/**
 * Server component. A quiet, natural-case section cue. It does not generate a
 * number, an eyebrow, or a decorative rule.
 */
export function SectionRule({ label, className }: SectionRuleProps) {
  if (!label) return null;

  return (
    <p className={cn("text-sm font-medium text-muted-foreground", className)}>
      {label}
    </p>
  );
}
