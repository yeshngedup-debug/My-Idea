import { cn } from "@/lib/utils";

/**
 * The single brand-differentiation chapter. A plain two-column list with one
 * vermilion hairline as its only accent. No cards, no glow, no gradient.
 * Server-compatible: no hooks and no client directive. The copy lives here so
 * /about and its compact echo on /public stay in sync.
 */

export type LocalBridgeDifference = {
  label: string;
  sentence: string;
};

export const LOCAL_BRIDGE_HEADLINE = "A local bridge, checked by people";

export const LOCAL_BRIDGE_DIFFERENCES: readonly LocalBridgeDifference[] = [
  {
    label: "Browsing",
    sentence:
      "Students browse projects for free, with no credits to buy and no paywalled filters.",
  },
  {
    label: "Shortlist",
    sentence:
      "An admin ranks the shortlist and shows each student's name, skills, college, contact, and CV links.",
  },
  {
    label: "Payment",
    sentence:
      "Founders pay by bank transfer or mBoB in Ngultrum, upload the screenshot, and an admin confirms the payment; the confirmation stays on the order.",
  },
  {
    label: "Verification",
    sentence:
      "An admin checks each student's identity, institution, and CV by hand, never an algorithm.",
  },
  {
    label: "Photographs",
    sentence:
      "We use photographs of people in gho and kira, credited to their Wikimedia Commons files.",
  },
  {
    label: "On a phone",
    sentence: "Students and founders browse, apply, and get paid on a phone.",
  },
] as const;

export function LocalBridgeDifferences({
  id = "local-bridge-differences",
  compact = false,
  className,
}: {
  id?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={cn(
        "px-5 text-[#18251f] sm:px-8 lg:px-12",
        compact ? "py-12 sm:py-16" : "py-16 sm:py-20 lg:py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-[1440px]">
        <h2
          id={`${id}-heading`}
          className={cn(
            "text-balance font-semibold leading-tight tracking-[-0.03em] text-[#17352b]",
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl",
          )}
        >
          {LOCAL_BRIDGE_HEADLINE}
        </h2>
        <div aria-hidden="true" className="mt-6 h-0.5 w-10 bg-[#d84f37]" />
        <dl
          className={cn(
            "grid gap-x-12 sm:grid-cols-2",
            compact ? "mt-6 gap-y-6" : "mt-9 gap-y-9",
          )}
        >
          {LOCAL_BRIDGE_DIFFERENCES.map((item) => (
            <div key={item.label}>
              <dt className="text-sm font-semibold text-[#17352b]">
                {item.label}
              </dt>
              <dd
                className={cn(
                  "mt-1 leading-6 text-[#18251f]/70",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {item.sentence}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
