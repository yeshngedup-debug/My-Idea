"use client";

import { Children, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "motion/react";

/** Mirrors the --ease-out token in app/globals.css. */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Hydration-safe: server renders the animated branch, client settles after mount. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/**
 * The one restrained entrance on load: hero copy fades and rises 8px on a short
 * 50ms stagger. Mount-only, no loop. Reduced motion collapses to opacity only.
 */
export function HeroCopyEntrance({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: 0.05,
            staggerChildren: reduce ? 0 : 0.05,
          },
        },
      }}
    >
      {Children.map(children, (child, index) =>
        child == null ? null : (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : 8 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: reduce ? 0.2 : 0.4, ease: EASE_OUT },
              },
            }}
          >
            {child}
          </motion.div>
        ),
      )}
    </motion.div>
  );
}

/**
 * Call-site compatibility only: the static photo wrapper now lives in its own
 * server-compatible module so hero images do not pull this client motion module
 * into their hydration path. Import it from `./hero-photo` directly.
 */
export { HeroPhotoEntrance } from "./hero-photo";
