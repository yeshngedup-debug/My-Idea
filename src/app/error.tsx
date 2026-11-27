"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      className="flex min-h-svh flex-col bg-[#eaf6f6] px-5 py-16 text-[#0b2e2e] sm:px-8 sm:py-24"
    >
      <div className="m-auto w-full max-w-xl border-l-2 border-[#b9dede] pl-6 sm:pl-8">
        <p className="text-sm font-semibold text-[#0b5c5c]">Page error</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2rem,8vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
          This page could not load
        </h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-[#356464]">
          The request did not finish. Try the page again, or return to a known
          starting point.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retry}
            className="pressable inline-flex min-h-12 items-center rounded-lg bg-[#ff0063] px-6 py-3 text-sm font-semibold text-[#000000] transition-colors duration-150 hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
          >
            Try again
          </button>
          <Link
            href={recoveryHref}
            className="pressable inline-flex min-h-12 items-center rounded-lg border border-[#4d8c8c] bg-white px-6 py-3 text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 hover:border-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
          >
            {recoveryLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
