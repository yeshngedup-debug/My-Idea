import type { ReactNode } from "react";

/**
 * Two-column step chapter. The heading column stays in view while the steps
 * scroll beside it on large screens. This is plain CSS `position: sticky`, so
 * it needs no animation runtime and is inert below `lg` and under reduced
 * motion preferences.
 */
export function PinnedStepChapter({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
      <div className="lg:sticky lg:top-24 lg:self-start lg:border-t lg:border-[#b9dede]/15 lg:pt-6 lg:pr-6">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
