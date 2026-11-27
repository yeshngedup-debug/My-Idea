import type { ReactNode } from "react";

/**
 * The product uses CSS-only interaction feedback. This provider remains as a
 * stable root-layout seam but adds no animation runtime or hidden state.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
