"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

type RevealDirection = "up" | "down" | "left" | "right";

/** Mirrors the --ease-out token in app/globals.css (one curve for all UI motion). */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const FINE_HOVER = "(hover: hover) and (pointer: fine)";

/** Hydration-safe: server starts false and the real value swaps in after mount. */
function useFineHover() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(FINE_HOVER);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(FINE_HOVER).matches,
    () => false,
  );
}

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Under reduced motion, content renders statically instead of starting hidden. */
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

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
}) {
  const reduce = usePrefersReducedMotion();
  const offset = {
    x: direction === "left" ? 18 : direction === "right" ? -18 : 0,
    y: direction === "up" ? 18 : direction === "down" ? -18 : 0,
  };

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.25,
        delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = usePrefersReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
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
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.25, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const fineHover = useFineHover();

  return (
    <motion.div
      className={className}
      tabIndex={-1}
      whileHover={fineHover ? { y: -4 } : undefined}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
