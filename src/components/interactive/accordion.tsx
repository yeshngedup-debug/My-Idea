import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import styles from "@/styles/pressable.module.css";

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
          className="group border-t border-[#18251f]/15 transition-colors duration-150 ease-[var(--ease-out)] last:border-b hover:bg-[#fffefa] open:bg-[#fffefa]"
        >
          <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-sm px-2 py-3 text-left text-base font-semibold leading-snug tracking-tight text-[#17352b] ${styles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] [&::-webkit-details-marker]:hidden sm:text-lg`}>
            <span>{item.question}</span>
            <CaretRight
              aria-hidden="true"
              weight="bold"
              className="h-5 w-5 shrink-0 text-[#d84f37] transition-transform duration-250 ease-[var(--ease-out)] group-open:rotate-90 motion-reduce:transition-none"
            />
          </summary>
          <div className="px-2 pb-6 pr-10 text-sm leading-7 text-[#18251f]/75 sm:text-base">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default Accordion;
