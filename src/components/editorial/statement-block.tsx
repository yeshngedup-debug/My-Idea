import { cn } from "@/lib/utils";

export type StatementBlockProps = {
  /** One short sentence. Keep it to 12 words or fewer by design. */
  statement: string;
  /** Optional single supporting line. Do not stack paragraphs here. */
  support?: string;
  align?: "left" | "center";
  /** Override the chapter padding or width from the call site. */
  className?: string;
};

/**
 * Server component. A single oversized statement for a cinematic chapter with
 * `py-32 md:py-48` breathing room. No eyebrow, no index, no extra copy.
 */
export function StatementBlock({
  statement,
  support,
  align = "left",
  className,
}: StatementBlockProps) {
  const centered = align === "center";

  return (
    <section
      className={cn(
        "px-5 py-32 sm:px-8 md:py-48 lg:px-12",
        centered ? "text-center" : "text-left",
        className,
      )}
    >
      <div className={cn("mx-auto", centered ? "max-w-5xl" : "max-w-6xl")}>
        <span
          aria-hidden="true"
          className={cn("mb-8 block h-px w-10 bg-[#b23c26]", centered && "mx-auto")}
        />
        <h2 className="text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#17352b]">
          {statement}
        </h2>
        {support ? (
          <p
            className={cn(
              "mt-8 max-w-2xl text-balance text-base leading-7 text-[#17352b]/70 sm:text-lg sm:leading-8",
              centered && "mx-auto",
            )}
          >
            {support}
          </p>
        ) : null}
      </div>
    </section>
  );
}
