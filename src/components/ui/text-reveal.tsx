"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type TextRevealTag = "span" | "h2" | "h3" | "p";

const REDUCED = "(prefers-reduced-motion: reduce)";

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

/** Mirrors the --ease-out token in app/globals.css (one curve for all UI motion). */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const WORD_DURATION = 0.25;
const TOTAL_BUDGET = 0.4;

/**
 * Per-word fade reveal for a short heading. The wrapper carries the intact
 * text as its accessible name and every animated word is hidden from the
 * accessibility tree, so assistive tech announces one uninterrupted string.
 */
export function TextReveal({
  text,
  className,
  as = "span",
}: {
  text: string;
  className?: string;
  as?: TextRevealTag;
}) {
  const reduce = usePrefersReducedMotion();
  // Rendering the intact string on both server and first client pass removes
  // the hydration mismatch; the animated structure mounts only after settle.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const Tag = as;
  const words = text.split(" ");
  const stableClass = className ?? "";

  // Keep the whole stagger inside the timing budget even if the copy grows.
  const stagger = Math.min(
    0.05,
    (TOTAL_BUDGET - WORD_DURATION) / Math.max(words.length - 1, 1),
  );

  if (!mounted || reduce) {
    return <Tag className={stableClass}>{text}</Tag>;
  }

  return (
    <Tag aria-label={text} className={cn(stableClass)}>
      {/* Generic spans cannot be named by aria-label in every browser. This
          keeps the parent heading's accessible name correct when used inline. */}
      {as === "span" ? <span className="sr-only">{text}</span> : null}
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: WORD_DURATION,
            delay: index * stagger,
            ease: EASE_OUT,
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
