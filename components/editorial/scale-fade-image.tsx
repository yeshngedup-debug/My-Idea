"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Restrained scroll entrance for one real photograph. The image starts at
 * opacity 0.9 and scale 0.98 and settles to its natural size; it never fades
 * out, never parallaxes and never runs under reduced motion. Motion is the
 * only runtime, and only transform and opacity are animated.
 */
export function ScaleFadeImage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} data-scale-fade="">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-scale-fade=""
      className={className}
      initial={{ opacity: 0.9, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
