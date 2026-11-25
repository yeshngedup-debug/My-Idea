"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import styles from "@/styles/sticky-section-headings.module.css";

/** The site header is h-16 in `components/marketing/site-header.tsx`. */
const SITE_HEADER_HEIGHT = 64;
const ACTIVE_OFFSET_GAP = 8;
const FALLBACK_STICKY_HEIGHT = 96;

export type StickySection = {
  id: string;
  label: string;
};

export type StickySectionHeadingsProps = {
  /** Short page title pinned in the first sticky row. */
  title: string;
  /** Optional small label above the title. */
  eyebrow?: string;
  /** Ordered section metadata. Each id must match a descendant element id. */
  sections: readonly StickySection[];
  /** Accessible name for the section navigation. */
  navLabel?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Pure helper so active-section logic can be tested without a browser. `tops`
 * is the document-space top of each section, in the same order as `sections`.
 */
export function resolveActiveSectionId(
  sections: readonly StickySection[],
  tops: readonly number[],
  offset: number,
): string | null {
  if (sections.length === 0) return null;

  let activeIndex = 0;
  for (let index = 0; index < sections.length; index += 1) {
    if (tops[index] <= offset) activeIndex = index;
  }

  return sections[activeIndex]?.id ?? null;
}

/**
 * Two-layer sticky heading for long, sectioned editorial pages: a compact page
 * title and a section index stay below the site header while the body scrolls.
 *
 * Give each scroll target `id={section.id}` and `data-sticky-section`. The
 * stylesheet adds anchor scroll margin so in-page links land below both sticky
 * rows. Motion is limited to colour, opacity and a small caret rotation, with
 * an explicit reduced-motion fallback.
 */
export function StickySectionHeadings({
  title,
  eyebrow,
  sections,
  navLabel = "On this page",
  className,
  children,
}: StickySectionHeadingsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  const measureActiveSection = useCallback(() => {
    const root = rootRef.current;
    if (!root || sections.length === 0) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>("[id]"));
    const findSectionTop = (id: string) => {
      const element = elements.find((candidate) => candidate.id === id);
      return element
        ? element.getBoundingClientRect().top + window.scrollY
        : Number.POSITIVE_INFINITY;
    };

    const stickyHeight =
      stickyRef.current?.getBoundingClientRect().height ??
      FALLBACK_STICKY_HEIGHT;
    const offset =
      SITE_HEADER_HEIGHT + stickyHeight + ACTIVE_OFFSET_GAP;
    const tops = sections.map((section) => findSectionTop(section.id));
    const nextActiveId = resolveActiveSectionId(sections, tops, offset);

    setActiveId((currentId) =>
      currentId === nextActiveId ? currentId : nextActiveId,
    );
  }, [sections]);

  useEffect(() => {
    const scheduleMeasure = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        measureActiveSection();
      });
    };

    scheduleMeasure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [measureActiveSection]);

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <div
        ref={stickyRef}
        className="sticky top-16 z-30 border-y border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-body-secondary)]">
                {eyebrow}
              </p>
            ) : null}
            <p className="truncate text-xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-2xl">
              {title}
            </p>
          </div>

          {sections.length > 0 ? (
            <nav aria-label={navLabel} className="min-w-0">
              <ol className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {sections.map((section) => {
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id} className="shrink-0">
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "group inline-flex min-h-11 items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-[var(--color-body-secondary)] transition-[background-color,border-color,color] duration-250 ease-[var(--ease-out)] hover:border-[var(--color-border)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] motion-reduce:transition-none motion-reduce:active:scale-100",
                          isActive &&
                            "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)]",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] opacity-0 transition-opacity duration-250 ease-[var(--ease-out)] group-hover:opacity-40 motion-reduce:transition-none",
                            isActive && "opacity-100",
                          )}
                        />
                        <span>{section.label}</span>
                        <CaretRight
                          aria-hidden="true"
                          weight="bold"
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-[var(--color-accent)] opacity-0 transition-[transform,opacity] duration-250 ease-[var(--ease-out)] group-hover:rotate-90 group-hover:opacity-60 motion-reduce:transition-none",
                            isActive && "rotate-90 opacity-100",
                          )}
                        />
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

export default StickySectionHeadings;
