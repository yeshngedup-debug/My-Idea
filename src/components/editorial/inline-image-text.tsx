import Image from "next/image";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { cn } from "@/lib/utils";

export type InlineImageTextProps = {
  /** Words before the embedded photograph. */
  before: string;
  /** Local asset path, for example "/images/bhutanese-community.jpg". */
  imageSrc: string;
  /** Spoken in the heading's accessible name, never as a duplicate alt. */
  imageAlt: string;
  /** Wikimedia Commons file URL for the mandatory credit line. */
  creditFileUrl: string;
  /** Words after the embedded photograph. */
  after: string;
  /** Override the composed accessible name when the pill sits mid-sentence. */
  accessibleLabel?: string;
  as?: "h2" | "h3";
  id?: string;
  className?: string;
};

/**
 * Server component. Implements the inline typography image: a small circular
 * photograph set inside a large editorial heading.
 *
 * Accessibility: the heading carries one complete aria-label (before + imageAlt
 * + after) and every visual span is aria-hidden, so assistive tech reads a
 * single intact sentence. The image is real `next/image` markup marked
 * decorative with an empty alt, preventing a duplicate announcement.
 */
export function InlineImageText({
  before,
  imageSrc,
  imageAlt,
  creditFileUrl,
  after,
  accessibleLabel,
  as = "h2",
  id,
  className,
}: InlineImageTextProps) {
  const Heading = as;
  const lead = before.trim();
  const tail = after.trim();
  const accessibleText = (
    accessibleLabel ?? `${lead} ${imageAlt.trim()} ${tail}`
  )
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className={cn("max-w-5xl", className)}>
      <Heading
        id={id}
        aria-label={accessibleText}
        className="text-balance text-[clamp(2.25rem,4.6vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#0b2e2e]"
      >
        <span aria-hidden="true">{lead}</span>{" "}
        <span
          aria-hidden="true"
          className="mx-[0.08em] inline-block h-[0.62em] w-[1.85em] overflow-hidden rounded-[2px] bg-[#0b5c5c] align-middle"
        >
          <Image
            src={imageSrc}
            alt=""
            width={160}
            height={72}
            className="h-full w-full object-cover object-[45%_55%]"
          />
        </span>{" "}
        <span aria-hidden="true">{tail}</span>
      </Heading>
      <span className="mt-3 block text-[11px] leading-5 text-[#356464] sm:mt-4">
        <PhotoCredit fileUrl={creditFileUrl} />
      </span>
    </div>
  );
}
