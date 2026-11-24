"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Mirrors --ease-out in app/globals.css. 250ms sits inside the 200-250ms budget.
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.25;

/**
 * One quiet entrance for a single block: opacity only, once, on view.
 * No blur, no travel, no stagger. Under reduced motion the content renders
 * already visible with no animation attached.
 */
export function FadeContent({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Start offset in seconds. Defaults to 0. */
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
