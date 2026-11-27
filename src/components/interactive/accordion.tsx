import type { ReactNode } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  question: string;
  answer: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

/**
 * Disclosure list built on native <details>/<summary>: no JavaScript, no ARIA
 * state to maintain. The browser exposes the open/closed state, while the
 * question and answer stay as real, readable text. The caret is decorative
 * (aria-hidden) and only reinforces the state visually.
 */
export function Accordion({ items, className }: AccordionProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      {items.map((item, index) => (
        <details
          key={`${item.question}-${index}`}
          className="group border-t border-border transition-colors duration-150 last:border-b hover:bg-card open:bg-card motion-reduce:transition-none"
        >
          <summary
            className={cn(
              "flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-sm px-2 py-3 text-left text-base font-semibold leading-snug text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none [&::-webkit-details-marker]:hidden sm:text-lg",
            )}
          >
            <span>{item.question}</span>
            <CaretRight
              aria-hidden="true"
              weight="light"
              className="h-5 w-5 shrink-0 text-muted-foreground group-open:hidden"
            />
            <CaretDown
              aria-hidden="true"
              weight="light"
              className="hidden h-5 w-5 shrink-0 text-muted-foreground group-open:block"
            />
          </summary>
          <div className="px-2 pb-6 pr-10 text-sm leading-7 text-muted-foreground sm:text-base">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default Accordion;
