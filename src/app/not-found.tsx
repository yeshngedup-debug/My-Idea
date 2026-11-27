import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col bg-[#eaf6f6] px-5 py-16 text-[#0b2e2e] sm:px-8 sm:py-24"
    >
      <div className="m-auto w-full max-w-xl border-l-2 border-[#b9dede] pl-6 sm:pl-8">
        <p className="text-sm font-semibold text-[#0b5c5c]">404</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2rem,8vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-[#356464]">
          The link may have changed. Return to the marketplace or read the
          frequently asked questions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/public"
            className="pressable inline-flex min-h-12 items-center rounded-lg bg-[#ff0063] px-6 py-3 text-sm font-semibold text-[#000000] transition-colors duration-150 hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
          >
            Back to home
          </Link>
          <Link
            href="/faq"
            className="pressable inline-flex min-h-12 items-center rounded-lg border border-[#4d8c8c] bg-white px-6 py-3 text-sm font-semibold text-[#0b5c5c] transition-colors duration-150 hover:border-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
          >
            Visit the FAQ
          </Link>
        </div>
      </div>
    </main>
  );
}
