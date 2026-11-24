"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** Matches the --ease-out token in app/globals.css. */
const HOUSE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.18, ease: HOUSE_EASE }}
    >
      {children}
    </MotionConfig>
  );
}
