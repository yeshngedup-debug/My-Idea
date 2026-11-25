import { cn } from "@/lib/utils";

export type SectionRuleProps = {
  /** Plain editorial label. Never a numeric "SECTION 01" style tag. */
  label?: string;
  className?: string;
};

/**
 * Server component. A quiet divider that can carry a short plain-language
 * label. It generates no numbers and no meta-labels of its own.
 */
export function SectionRule({ label, className }: SectionRuleProps) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-[#0b5c5c]/20" />
      {label ? (
        <>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[#c2004b]">
            {label}
          </span>
          <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-[#0b5c5c]/20" />
        </>
      ) : null}
    </div>
  );
}
