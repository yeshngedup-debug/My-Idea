"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger, useGSAP } from "./_shared";

/**
 * Two-column chapter whose title column holds position while the sibling
 * content column scrolls. The pin is created only on desktop and only when the
 * reader has not asked for reduced motion; every other reader gets the plain
 * stacked layout with the full title visible.
 *
 * The pinned node is a column, never the page's h1. Callers pass an h2 with an
 * id so the section keeps its accessible name and the page keeps one h1.
 *
 * `pinOffset` is the distance from the viewport top where the title parks.
 * The default clears the 64px site header. A page that also renders a sticky
 * `ChapterProgress` bar must raise it past that bar, or the bar paints over
 * the parked title.
 *
 * The section carries a scroll margin so an in-page link to it lands below
 * the sticky header and any progress bar instead of under them. The margin
 * reads the progress bar's measured height, so it stays correct however the
 * bar's links wrap.
 */
export function PinnedScrollChapter({
  id,
  labelledBy,
  title,
  children,
  className,
  pinOffset = 96,
}: {
  id?: string;
  labelledBy?: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  pinOffset?: number;
}) {
  const root = useRef<HTMLElement>(null);
  const titleColumn = useRef<HTMLDivElement>(null);
  const contentColumn = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          canPin: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        },
        () => {
          const titleEl = titleColumn.current;
          const contentEl = contentColumn.current;
          if (!titleEl || !contentEl) return;

          const trigger = ScrollTrigger.create({
            id: `pinned-title-${id ?? "section"}`,
            trigger: titleEl,
            start: `top top+=${pinOffset}`,
            // Pin for exactly the extra height the scrolling column has over
            // the title column. Derived at refresh so it survives reflow.
            end: () =>
              "+=" +
              Math.max(
                120,
                contentEl.offsetHeight - titleEl.offsetHeight + 120,
              ),
            pin: titleEl,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              titleEl.dataset.pinActive = String(self.isActive);
            },
            onUpdate: (self) => {
              titleEl.dataset.pinProgress = self.progress.toFixed(3);
            },
          });
          titleEl.dataset.pinProgress = trigger.progress.toFixed(3);
        },
        root,
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [pinOffset] },
  );

  return (
    <section
      ref={root}
      id={id}
      aria-labelledby={labelledBy}
      data-pinned-chapter=""
      className={cn("scroll-mt-chapter", className)}
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div
            ref={titleColumn}
            data-pinned-title=""
            data-pin-progress="static"
            className="self-start lg:border-t lg:border-[#66bfbf]/15 lg:pt-6 lg:pr-6"
          >
            {title}
          </div>
          <div ref={contentColumn} data-pinned-content="">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
