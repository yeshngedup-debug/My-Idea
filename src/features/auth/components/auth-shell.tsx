import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Thin editorial shell for auth pages. Uses the shared SiteHeader and
 * SiteFooter so auth pages match the marketing site chrome. The page content
 * is responsible for its own editorial layout (SectionHead, Band, etc.).
 *
 * It stays a Server Component: SiteHeader is already a client boundary, so
 * the auth pages keep their server-rendered markup.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <SiteHeader />
      <main id="main-content" className="w-full max-w-full flex-1 overflow-x-clip">
        {children}
      </main>
      <SiteFooter compact />
    </div>
  );
}
