"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "./_shared";

export type StackedCardItem = {
  key: string;
  number: string;
  title: ReactNode;
  body: ReactNode;
  action?: { href: string; label: string };
};

/**
 * A short stack of real steps. On desktop each card sticks at a slightly lower
 * offset than the one before, so the deck overlaps as the reader scrolls, while
 * a scrubbed tween lifts each incoming card into place. On small screens and
 * under reduced motion the cards are a plain, fully visible ordered list.
 *
 * Cards stay in normal flow, never scale to zero, and keep every link tabbable.
 */
export function StackedCards({
  items,
  className,
  label,
}: {
  items: StackedCardItem[];
  className?: string;
  label?: string;
}) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = root.current;
      if (!list) return;
      const cards = Array.from(
        list.querySelectorAll<HTMLElement>("[data-stacked-card]"),
      );
      if (cards.length < 2) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: list,
              start: "top 72%",
              end: "bottom 35%",
              scrub: 0.4,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                list.setAttribute(
                  "data-stack-progress",
                  self.progress.toFixed(3),
                );
              },
            },
          });

          cards.forEach((card, index) => {
            if (index === 0) return;
            timeline.fromTo(
              card,
              { y: 24, scale: 0.98, opacity: 0.82 },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 1,
                immediateRender: false,
              },
              (index - 1) * 0.9,
            );
          });

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            list.setAttribute("data-stack-progress", "static");
          };
        },
        root,
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  if (items.length === 0) return null;

  return (
    <ol
      ref={root}
      aria-label={label}
      data-stacked-cards=""
      data-stack-progress="static"
      className={cn("relative grid gap-4 pb-6 md:gap-0", className)}
    >
      {items.map((item, index) => (
        <li
          key={item.key}
          data-stacked-card={String(index)}
          style={
            { "--stack-top": `${96 + index * 12}px` } as CSSProperties
          }
        >
          <article className="rounded-[1.25rem] border border-[#18251f]/15 bg-[#fffefa] p-6 sm:p-8">
            <p className="text-sm font-semibold tabular-nums text-[#b23c26]">
              {item.number}
            </p>
            <h3 className="mt-4 text-balance text-xl font-semibold leading-snug tracking-tight text-[#17352b] sm:text-2xl">
              {item.title}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-body-secondary sm:text-base">
              {item.body}
            </p>
            {item.action ? (
              <a
                href={item.action.href}
                className="mt-5 inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-[#b23c26] underline decoration-[#d84f37]/30 underline-offset-4 transition-colors hover:decoration-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]"
              >
                {item.action.label}
              </a>
            ) : null}
          </article>
        </li>
      ))}
    </ol>
  );
}
