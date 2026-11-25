"use client";

import { Mesurer } from "mesurer";

/**
 * Visual inspector for design work. Kept in its own client component so the
 * root layout can stay a Server Component. Only mounted when
 * NEXT_PUBLIC_MESURER_ENABLED=1 (see app/layout.tsx), so normal visitors and
 * production builds never download or render it.
 */
export function MesurerPanel() {
  return (
    <Mesurer
      persistKey="bhutan-tech-connect-mesurer"
      initialState={{ minimized: true, toolbarPosition: { x: 24, y: 24 } }}
      highlightColor="#e7b648"
      guideColor="#17352b"
      arrowColor="#d84f37"
    />
  );
}
