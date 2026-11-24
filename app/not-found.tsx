import Link from "next/link";

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

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col bg-[#f5f2ea] text-[#18251f]"
    >
      <style>{mountFade}</style>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-40">
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-[65ch] lg:border-l lg:border-[#18251f]/15 lg:pl-14">
            <h1 className="legal-mount max-w-[16ch] text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-[#17352b]">
              We couldn&apos;t find that page
            </h1>
            <p className="mt-7 text-base leading-7 text-[#657069] sm:text-lg sm:leading-8">
              The link may have changed.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/public"
                className="pressable inline-flex min-h-12 items-center rounded-full bg-[#17352b] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
              >
                Back to home
              </Link>
              <Link
                href="/faq"
                className="pressable inline-flex min-h-12 items-center rounded-full border border-[#17352b]/20 px-7 py-3 text-sm font-semibold text-[#17352b] transition-colors hover:bg-[#fffefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
              >
                Visit the FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
