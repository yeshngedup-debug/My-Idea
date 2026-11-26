"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two-column chapter whose title column holds position while the sibling
 * content column scrolls.
 *
 * The hold is plain CSS `position: sticky`, not a scripted pin. Sticky is
 * bounded by the title's own grid area, so the title can never outlive the
 * chapter and paint over the section below it. It is applied only on desktop
 * and only when the reader has not asked for reduced motion; every other
 * reader gets the plain stacked layout with the full title visible.
 *
 * The held node is a column, never the page's h1. Callers pass an h2 with an
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
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-pinned-chapter=""
      className={cn("scroll-mt-chapter", className)}
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div
            data-pinned-title=""
            style={{ top: pinOffset }}
            className="self-start motion-safe:lg:sticky lg:border-t lg:border-[#66bfbf]/15 lg:pt-6 lg:pr-6"
          >
            {title}
          </div>
          <div data-pinned-content="">{children}</div>
        </div>
      </div>
    </section>
  );
}
