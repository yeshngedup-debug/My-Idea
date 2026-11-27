"use client";

/**
 * One scoped motion layer for every marketing page.
 *
 * Pages stay server components. This component mounts once in the marketing
 * layout and reads only explicit data-motion-* keys, so first paint is plain
 * server HTML and reduced-motion visitors never enter a GSAP timeline.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MarketingMotion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = document.querySelector<HTMLElement>("[data-marketing-root]");
      if (!root) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = root.querySelectorAll<HTMLElement>("[data-motion-section]");

        sections.forEach((section) => {
          const timeline = gsap.timeline({
            defaults: { duration: 0.55, ease: "power2.out" },
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              once: true,
            },
          });

          timeline.fromTo(
            section,
            { opacity: 0.94, y: 12, immediateRender: false },
            { opacity: 1, y: 0, clearProps: "opacity,transform" },
          );

          const panels = section.querySelectorAll<HTMLElement>("[data-motion-panel]");
          if (panels.length > 0) {
            timeline.fromTo(
              panels,
              { opacity: 0.96, scale: 0.985, immediateRender: false },
              {
                opacity: 1,
                scale: 1,
                stagger: 0.08,
                clearProps: "opacity,transform",
              },
              "-=0.35",
            );
          }

          const groups = section.querySelectorAll<HTMLElement>("[data-motion-group]");
          groups.forEach((group) => {
            const items = group.querySelectorAll<HTMLElement>("[data-motion-item]");
            if (items.length === 0) return;

            timeline.fromTo(
              items,
              { opacity: 0.94, y: 8, immediateRender: false },
              {
                opacity: 1,
                y: 0,
                stagger: 0.05,
                clearProps: "opacity,transform",
              },
              "-=0.35",
            );
          });
        });
      });

      return () => media.revert();
    },
    {
      scope: typeof document === "undefined" ? undefined : "[data-marketing-root]",
      dependencies: [pathname],
      revertOnUpdate: true,
    },
  );

  return null;
}
