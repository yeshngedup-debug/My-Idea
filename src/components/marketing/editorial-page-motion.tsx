"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/_shared";
import { cn } from "@/lib/utils";

/**
 * Horizontal accordion for the how-it-works journey. Each slice is a vertical
 * column that grows in width on mouse hover or keyboard focus; the same slice
 * toggles on click so touch devices keep a working disclosure. The body lives
 * in a real region labelled by its button, and every control is at least 44px.
 * Motion is a width transition only, disabled under reduced motion.
 */
export type HorizontalAccordionItem = {
  id: string;
  number: string;
  title: string;
  body: string;
};

export function HorizontalAccordion({
  items,
  label,
  className,
}: {
  items: readonly HorizontalAccordionItem[];
  label: string;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex w-full max-w-full flex-col gap-3 sm:h-[25rem] sm:flex-row",
        className,
      )}
    >
      {items.map((item) => {
        const open = activeId === item.id;
        const triggerId = `${uid}-${item.id}-trigger`;
        const panelId = `${uid}-${item.id}-panel`;

        return (
          <div
            key={item.id}
            data-open={open}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setActiveId(item.id);
            }}
            onFocus={() => setActiveId(item.id)}
            className={cn(
              "group relative isolate flex min-h-11 flex-[1_1_0%] flex-col justify-end overflow-hidden rounded-[1.25rem] border border-[#b9dede]/15 bg-white transition-[flex-grow,flex-basis] duration-700 ease-out motion-reduce:transition-none",
              "data-[open=true]:flex-[3_1_0%] sm:data-[open=true]:flex-[5_1_0%]",
            )}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setActiveId(open ? null : item.id)}
              className="relative z-10 flex min-h-11 w-full flex-col items-start justify-end gap-2 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4d8c8c] sm:p-6"
            >
              <span className="text-xs font-semibold tabular-nums text-[#0b5c5c]">
                {item.number}
              </span>
              <span className="text-balance text-lg font-semibold leading-snug tracking-tight text-[#0b2e2e] sm:text-xl">
                {item.title}
              </span>
            </button>
            {open ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="relative z-0 px-5 pb-6 sm:px-6"
              >
                <p className="max-w-xl text-sm leading-7 text-[#0b2e2e]/75 sm:text-base">
                  {item.body}
                </p>
              </div>
            ) : (
              <span id={panelId} hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * One scroll-scrubbed photograph in a gallery. GSAP scales the frame from 0.8
 * to 1.0 as it enters, then fades it to 0.2 as it leaves. The whole tween is
 * skipped under reduced motion and torn down through gsap.matchMedia plus the
 * useGSAP scope when the component unmounts.
 */
export function GsapScaleFadeImage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 15%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .fromTo(
              el,
              { scale: 0.8, opacity: 1 },
              { scale: 1, opacity: 1, duration: 1 },
            )
            .to(el, { opacity: 0.2, duration: 1 });

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            gsap.set(el, { clearProps: "opacity,transform" });
          };
        },
        root,
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} data-gsap-scale-fade="" className={cn("w-full", className)}>
      {children}
    </div>
  );
}
