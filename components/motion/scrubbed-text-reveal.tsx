"use client";

import { useRef } from "react";
import type { ElementType } from "react";
import { gsap, SplitText, useGSAP } from "./_shared";

type ScrubbedTextRevealProps = {
  text: string;
  as?: "p" | "h2" | "h3" | "span";
  className?: string;
};

/**
 * Word-by-word opacity scrub. The server renders the sentence twice: once as
 * screen-reader-only text and once as the visual line. SplitText only touches
 * the visual line, so assistive technology always receives one intact string
 * and the full text is present before JavaScript runs.
 *
 * Under reduced motion the visual line is never split and stays at opacity 1.
 */
export function ScrubbedTextReveal({
  text,
  as = "p",
  className,
}: ScrubbedTextRevealProps) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLSpanElement>(null);
  const Tag = as as ElementType;

  useGSAP(
    () => {
      const el = visual.current;
      const container = root.current;
      if (!el || !container) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // SplitText ships inside the installed gsap package (3.15). Only the
        // decorative copy is split; the sr-only copy is left untouched.
        const split = SplitText.create(el, {
          type: "words",
          tag: "span",
          wordsClass: "scrub-word",
          aria: "none",
        });

        const tween = gsap.fromTo(
          split.words,
          { opacity: 0.1 },
          {
            opacity: 1,
            duration: 1,
            ease: "none",
            stagger: 0.25,
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              end: "bottom 55%",
              scrub: true,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                container.setAttribute(
                  "data-scrub-progress",
                  self.progress.toFixed(3),
                );
              },
              onUpdate: (self) => {
                container.setAttribute(
                  "data-scrub-progress",
                  self.progress.toFixed(3),
                );
              },
            },
          },
        );

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          split.revert();
          container.setAttribute("data-scrub-progress", "static");
        };
      }, root);

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Tag
      ref={root}
      data-scrub-text=""
      data-scrub-progress="static"
      className={className}
    >
      <span className="sr-only">{text}</span>
      <span ref={visual} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
