import type { ReactNode } from "react";
import { MarketingMotion } from "@/components/marketing/marketing-motion";
import { MinimalSiteFooter } from "@/components/marketing/minimal-site-footer";
import { MinimalSiteHeader } from "@/components/marketing/minimal-site-header";

/**
 * Public/marketing shell. The header and footer appear once here, around a
 * single main landmark for the root layout's skip link.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MinimalSiteHeader />
      <main
        id="main-content"
        data-marketing-root=""
        className="w-full max-w-full overflow-x-clip"
      >
        <MarketingMotion />
        {children}
      </main>
      <MinimalSiteFooter />
    </>
  );
}
