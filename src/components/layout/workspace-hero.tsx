import type { ReactNode } from "react";

/**
 * Primary page actions are links supplied by the caller. Their single magenta
 * action gets a nested circular icon well; both layers move on hover while the
 * control presses to 0.98. Scoped to this hero so no other surface is touched.
 */
const heroActionStyles = `
  .workspace-hero-actions > a.bg-cta {
    position: relative;
    padding-right: 3.25rem;
  }
  .workspace-hero-actions > a.bg-cta::before {
    content: "";
    position: absolute;
    right: 0.375rem;
    top: 50%;
    width: 2rem;
    height: 2rem;
    margin-top: -1rem;
    border-radius: 9999px;
    background-color: rgba(0, 0, 0, 0.09);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
    transition: transform 240ms var(--ease-out);
  }
  .workspace-hero-actions > a.bg-cta::after {
    content: "";
    position: absolute;
    right: 1.125rem;
    top: 50%;
    width: 0.4375rem;
    height: 0.4375rem;
    margin-top: -0.3125rem;
    border-top: 1.5px solid #000000;
    border-right: 1.5px solid #000000;
    transform: rotate(45deg);
    transition: transform 240ms var(--ease-out);
  }
  .workspace-hero-actions > a.bg-cta:hover::before {
    transform: translateX(2px) scale(1.04);
  }
  .workspace-hero-actions > a.bg-cta:hover::after {
    transform: translateX(2px) rotate(45deg);
  }
  @media (prefers-reduced-motion: reduce) {
    .workspace-hero-actions > a.bg-cta::before,
    .workspace-hero-actions > a.bg-cta::after {
      transition: none !important;
    }
    .workspace-hero-actions > a.bg-cta::before {
      transform: none !important;
    }
    .workspace-hero-actions > a.bg-cta::after {
      transform: rotate(45deg) !important;
    }
  }
`;

/**
 * Data-first workspace hero: a quiet paper card with one real heading, a short
 * purpose line and its actions. Caller-supplied action links are restyled here
 * so the first stays the single magenta primary on a light card.
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
      className="relative isolate rounded-[2rem] border border-[#b9dede]/80 bg-[#dff0f0]/55 p-1.5 shadow-[0_18px_48px_-38px_rgba(11,92,92,0.42)] sm:p-2"
    >
      <style>{heroActionStyles}</style>
      <div className="relative isolate overflow-hidden rounded-[calc(2rem_-_0.375rem)] bg-white px-6 py-9 text-[#0b2e2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem_-_0.5rem)] sm:px-10 sm:py-12">
        <div className="relative z-10 w-full min-w-0 max-w-3xl">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-[#0b5c5c] text-balance">
            {title}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#356464] sm:text-base">
            {description}
          </p>
          {children && (
            <div className="workspace-hero-actions mt-6 flex flex-wrap items-center gap-2.5 [&>a]:rounded-full! [&>a]:min-h-11 [&>a]:focus-visible:ring-[#66bfbf]! [&>a]:focus-visible:ring-offset-[#ffffff]! [&>a]:transition-[transform,background-color,border-color,color] [&>a]:duration-200 [&>a]:ease-[var(--ease-out)] [&>a]:active:scale-[0.98] [&>a]:motion-reduce:active:scale-100 [&>a.bg-cta]:bg-[#ff0063]! [&>a.bg-cta]:text-[#000000]! [&>a.bg-cta]:hover:bg-[#d40054]! [&>a:not(.bg-cta)]:border-[#66bfbf]! [&>a:not(.bg-cta)]:bg-transparent! [&>a:not(.bg-cta)]:text-[#0b5c5c]! [&>a:not(.bg-cta)]:hover:bg-[#eaf6f6]!">
              {children}
            </div>
          )}
        </div>
        <div className="relative z-10 mt-6 border-t border-[#b9dede]/80 pt-3">
          {/* Dashboard hero carries no photo credit; attribution lives in the
              site footer. */}
        </div>
      </div>
    </section>
  );
}
