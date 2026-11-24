"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollTrigger, useGSAP } from "./_shared";

export type ChapterLink = { id: string; label: string };

/**
 * Wayfinding for a long guide. Every entry is a real in-page link to a real
 * section id, and the active entry is driven by the section currently in view.
 * The hairline tracks scroll only for readers who allow motion; the active
 * state itself is plain text and works for everyone.
 */
export function ChapterProgress({
  chapters,
  className,
}: {
  chapters: ChapterLink[];
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useGSAP(
    () => {
      if (chapters.length === 0) return;

      const sectionIds = chapters.map((chapter) => chapter.id);
      const triggers = sectionIds.flatMap((id) => {
        const section = document.getElementById(id);
        if (!section) return [];
        return [
          ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => {
              if (self.isActive) setActiveId(id);
            },
          }),
        ];
      });

      const first = document.getElementById(sectionIds[0]);
      const last = document.getElementById(sectionIds[sectionIds.length - 1]);
      let progress: ScrollTrigger | undefined;
      if (first && last && bar.current) {
        progress = ScrollTrigger.create({
          trigger: first,
          endTrigger: last,
          start: "top 60%",
          end: "bottom 60%",
          onUpdate: (self) => {
            bar.current!.style.transform = `scaleX(${self.progress.toFixed(3)})`;
          },
        });
      }

      return () => {
        progress?.kill();
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    { scope: root, dependencies: [chapters] },
  );

  if (chapters.length === 0) return null;

  return (
    <nav
      ref={root}
      aria-label="On this page"
      data-chapter-progress=""
      className={cn("border-y border-[#17352b]/15", className)}
    >
      <span
        ref={bar}
        aria-hidden="true"
        data-chapter-bar=""
        className="block h-px w-full origin-left scale-x-0 bg-[#d84f37] motion-reduce:hidden"
      />
      <ol className="mx-auto flex max-w-[1440px] flex-wrap gap-x-6 gap-y-2 px-5 py-4 sm:px-8 lg:px-12">
        {chapters.map((chapter) => {
          const current = activeId === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-sm text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] sm:text-sm",
                  current
                    ? "text-[#17352b] underline decoration-[#d84f37] decoration-2 underline-offset-8"
                    : "text-body-secondary hover:text-[#17352b]",
                )}
              >
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
