import type { ReactNode } from "react";

/**
 * Server-compatible wrapper for the hero photograph. The photograph is the one
 * bright moment and stays still, so there is no animation and no browser API
 * here. Keeping it in its own module (separate from the `use client` copy
 * entrance) means the figure and its next/image stay in the server-rendered
 * tree instead of becoming a hydrated client boundary on every hero.
 */
export function HeroPhotoEntrance({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
