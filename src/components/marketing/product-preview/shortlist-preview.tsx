import Image from "next/image";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { StatusTimeline, ORDER_STEPS } from "@/components/ui/status-timeline";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { ShortlistRow } from "./shortlist-row";
import { SAMPLE_STUDENTS } from "./sample-shortlist-data";

/**
 * A server-compatible miniature of the founder Premium Shortlist result.
 *
 * It reuses the real StatusTimeline, ORDER_STEPS, Badge and row structure, so
 * what a visitor sees is the actual product artifact rather than a decorative
 * stand-in. The data is the local demo seed and the block is labelled Sample.
 */

const sampleNote =
  "Names, colleges, skills and CV labels come from the local demo seed. No real order or CV is shown.";

export function ShortlistPreview({
  className = "",
}: {
  className?: string;
}) {
  return (
    <section
      aria-labelledby="shortlist-preview-heading"
      className={`px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 ${className}`}
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2
            id="shortlist-preview-heading"
            className="text-2xl font-semibold tracking-[-0.03em] text-[#0b5c5c] sm:text-3xl"
          >
            What the shortlist looks like
          </h2>
          <p className="text-xs font-medium text-body-secondary">
            Sample, using local demo data
          </p>
        </div>
        <div aria-hidden="true" className="mt-4 h-px w-12 bg-[#ff0063]" />
        <p className="mt-5 max-w-2xl text-sm leading-6 text-body-secondary">
          An admin confirms payment, finalizes and ranks the shortlist, then
          releases it. This is the founder view after that final step.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-[#0b2e2e]/15 bg-[#eaf6f6] p-5 sm:p-7">
          <p className="mb-3 text-xs font-semibold text-body-secondary">
            Payment confirmation
          </p>
          <StatusTimeline
            steps={ORDER_STEPS}
            status="confirmed"
            label="Sample payment confirmation status"
            compact
          />
          <p className="mt-3 text-xs leading-5 text-body-secondary">
            Order created. Screenshot uploaded. An admin confirms the payment,
            then finalizes and ranks the shortlist before release.
          </p>

          <div className="mt-7 border-t border-[#b9dede] pt-6">
            <h3 className="text-base font-semibold text-[#0b5c5c]">
              Ranked shortlist
            </h3>
            <ol className="mt-4 space-y-3">
              {SAMPLE_STUDENTS.map((student, index) => (
                <ShortlistRow
                  key={student.shortlistId}
                  student={student}
                  rank={index + 1}
                  headingLevel="h4"
                />
              ))}
            </ol>
            <p className="mt-4 text-xs leading-5 text-body-secondary">{sampleNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Compact version for the public marketing page. One highlighted row, the
 * manual payment path in real words, and the existing credited photograph so
 * no photo credit is lost when the generic editorial chapter is replaced.
 */
export function ShortlistPreviewCompact({
  className = "",
}: {
  className?: string;
}) {
  const first = SAMPLE_STUDENTS[0];

  return (
    <section
      aria-labelledby="shortlist-row-preview-heading"
      className={`px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40 ${className}`}
    >
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
        <div className="relative z-10">
          <p className="text-xs font-medium text-body-secondary">Sample</p>
          <h2
            id="shortlist-row-preview-heading"
            className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.04] tracking-[-0.03em] text-[#0b5c5c] sm:text-5xl"
          >
            One row from the shortlist
          </h2>
          <div aria-hidden="true" className="mt-5 h-px w-12 bg-[#ff0063]" />
          <p className="mt-5 max-w-lg text-sm leading-6 text-body-secondary">
            An admin ranks the students by hand. This row is a sample from the
            local demo seed, not a real order.
          </p>

          <ol className="mt-8">
            <ShortlistRow student={first} rank={1} headingLevel="h3" />
          </ol>

          <div className="mt-6 border-t border-[#0b2e2e]/15 pt-5">
            <p className="text-xs font-semibold text-body-secondary">
              Payment confirmation
            </p>
            <p className="mt-2 text-xs leading-5 text-body-secondary">
              Order created, screenshot uploaded, admin confirming, confirmed.
            </p>
            <p className="mt-3 text-xs leading-5 text-body-secondary">{sampleNote}</p>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#0b2e2e] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/bhutanese-team.jpg"
              alt="Bhutanese students in kira performing in national dress"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#356464]">
            <span className="font-medium text-[#0b5c5c]">
              Bhutanese students in kira
            </span>
            <PhotoCredit fileUrl={PHOTO_CREDITS.market} />
          </figcaption>
          <p className="mt-2 text-xs leading-5 text-[#356464]">
            These photographs show Bhutanese places, not platform listings or
            members.
          </p>
        </figure>
      </div>
    </section>
  );
}
