"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mountFade = `
  .legal-mount {
    animation: legal-mount-in 240ms cubic-bezier(0.23, 1, 0.32, 1) both;
  }
  @keyframes legal-mount-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .legal-mount { animation: none; }
  }
`;

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();
  const area = pathname?.match(/^\/(founder|student|admin)(?:\/|$)/)?.[1];
  const recoveryHref = area ? `/${area}` : "/public";
  const recoveryLabel = area
    ? `Back to ${area} workspace`
    : "Back to home";

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col bg-[#eaf6f6] text-[#0b2e2e]"
    >
      <style>{mountFade}</style>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-40">
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-[65ch] lg:border-l lg:border-[#0b2e2e]/15 lg:pl-14">
            <h1 className="legal-mount max-w-[16ch] text-[clamp(1.875rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-[#0b5c5c]">
              This page could not load
            </h1>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={retry}
                className="pressable inline-flex min-h-12 items-center rounded-lg bg-[#ff0063] px-7 py-3 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
              >
                Try again
              </button>
              <Link
                href={recoveryHref}
                className="pressable inline-flex min-h-12 items-center rounded-lg border border-[#0b5c5c]/20 px-7 py-3 text-sm font-semibold text-[#0b5c5c] transition-colors hover:bg-[#ffffff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
              >
                {recoveryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
