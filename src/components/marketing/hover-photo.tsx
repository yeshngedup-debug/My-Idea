"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HoverPhotoProps = {
  children: ReactNode;
  className?: string;
  /** Retained for API compatibility. Photograph zoom was removed. */
  hoverScale?: number;
};

/**
 * Photograph wrapper kept for call-site compatibility. The hover zoom, spring
 * and press scale were removed: the photograph is the one bright moment and
 * should stay still. The hoverScale prop is accepted but intentionally unused.
 */
export function HoverPhoto({ children, className }: HoverPhotoProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {children}
    </div>
  );
}
