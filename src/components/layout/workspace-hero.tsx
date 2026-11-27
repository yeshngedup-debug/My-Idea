import type { ReactNode } from "react";

/**
 * Data-first workspace header: one real heading, a short purpose line and the
 * view's own actions.
 *
 * The first filled (`bg-cta`) action stays the single magenta primary on the
 * page; every peer is normalised to a quiet outline. The previous decorative
 * hero tray, hover transforms and scoped stylesheet are gone — this is a
 * heading band, not a card.
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
    <section aria-label={eyebrow} className="border-b border-[#b9dede] pb-6">
      <p className="text-xs font-medium text-[#356464]">{eyebrow}</p>
      <h1 className="mt-1.5 text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0b2e2e] text-balance">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#356464]">
        {description}
      </p>
      {children ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center [&>a]:justify-center [&>a]:gap-2 [&>a]:rounded-md [&>a]:px-4 [&>a]:py-2.5 [&>a]:text-sm [&>a]:font-semibold [&>a]:transition-colors [&>a]:duration-150 [&>a]:ease-[var(--ease-out)] [&>a]:motion-reduce:transition-none [&>a]:focus-visible:outline-none [&>a]:focus-visible:ring-2 [&>a]:focus-visible:ring-[#c2004b] [&>a]:focus-visible:ring-offset-2 [&>a.bg-cta]:bg-[#ff0063] [&>a.bg-cta]:text-[#000000] [&>a.bg-cta]:hover:bg-[#d40054] [&>a:not(.bg-cta)]:border [&>a:not(.bg-cta)]:border-[#4d8c8c] [&>a:not(.bg-cta)]:bg-[#ffffff] [&>a:not(.bg-cta)]:text-[#0b5c5c] [&>a:not(.bg-cta)]:hover:bg-[#eaf6f6]">
          {children}
        </div>
      ) : null}
    </section>
  );
}
