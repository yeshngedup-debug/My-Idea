import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "@/styles/editorial.module.css";

export type EditorialImageProps = {
  /** Local asset path, for example "/images/bhutanese-students.jpg". */
  src: string;
  /** Accessible description of the photograph. */
  alt: string;
  /** Crop contract. Defaults to wide. */
  ratio?: "wide" | "portrait" | "square";
  priority?: boolean;
  /** Sizing or spacing utilities applied to the figure. */
  className?: string;
};

const RATIO_CLASS: Record<NonNullable<EditorialImageProps["ratio"]>, string> = {
  wide: "aspect-[16/9]",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
};

/**
 * Server component. A locally hosted photograph with a fixed crop and a dark
 * wash for caption legibility. The zoom is CSS only, gated to fine pointers
 * and disabled under prefers-reduced-motion.
 *
 * @example
 * <EditorialImage
 *   src="/images/bhutanese-students.jpg"
 *   alt="Young Bhutanese people working together at computers"
 *   ratio="portrait"
 * />
 */
export function EditorialImage({
  src,
  alt,
  ratio = "wide",
  priority = false,
  className,
}: EditorialImageProps) {
  return (
    <figure
      className={cn(
        styles.frame,
        "group relative isolate overflow-hidden rounded-[1.5rem] bg-[#0b5c5c]",
        RATIO_CLASS[ratio],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40rem"
        className={cn(styles.zoom, "object-cover object-[45%_55%]")}
      />
      {/* Linear wash anchors the caption; the radial vignette keeps the frame
          atmospheric without a flat black scrim. Both are decorative only. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0b5c5c]/95 via-[#0b5c5c]/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 8%, transparent 38%, rgb(23 53 43 / 0.45) 100%)",
        }}
      />
    </figure>
  );
}
