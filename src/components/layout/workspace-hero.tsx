import type { ReactNode } from "react";
import { PhotoCredit } from "@/components/ui/photo-credit";

/**
 * Data-first workspace hero: a quiet paper card with one real heading, a short
 * purpose line and its actions. Caller-supplied action links are restyled here
 * so the first stays the single saffron primary on a light card.
 */
export function WorkspaceHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={eyebrow}
      className="relative isolate overflow-hidden rounded-[24px] border border-[#b9dede] bg-[#ffffff] px-6 py-9 text-[#0b2e2e] shadow-[0_1px_2px_rgba(24,37,31,.05)] sm:px-10 sm:py-12"
    >
      <div className="relative z-10 w-full min-w-0 max-w-3xl">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0b5c5c] text-balance">
          {title}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-[#356464] sm:text-base">
          {description}
        </p>
        {children && (
          <div className="mt-5 flex flex-wrap items-center gap-2.5 [&>a]:rounded-full! [&>a]:focus-visible:ring-[#66bfbf]! [&>a]:focus-visible:ring-offset-[#ffffff]! [&>a]:motion-safe:active:scale-[0.98] [&>a]:motion-reduce:active:scale-100 [&>a.bg-cta]:bg-[#ff0063]! [&>a.bg-cta]:text-[#000000]! [&>a.bg-cta]:hover:bg-[#d40054]! [&>a:not(.bg-cta)]:border-[#66bfbf]! [&>a:not(.bg-cta)]:bg-transparent! [&>a:not(.bg-cta)]:text-[#0b5c5c]! [&>a:not(.bg-cta)]:hover:bg-[#eaf6f6]!">
            {children}
          </div>
        )}
      </div>
      <div className="relative z-10 mt-6 border-t border-[#b9dede] pt-3">
        <PhotoCredit
          fileUrl="https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg"
          className="text-[#356464]"
        />
      </div>
    </section>
  );
}
