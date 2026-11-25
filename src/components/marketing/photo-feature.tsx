import type { ReactNode } from "react";
import Image from "next/image";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { PHOTO_CREDITS, type MarketingImage } from "./nav";

export type PhotoFeatureProps = {
  /** Preferred API. Pass a legacy src string with alt/creditFileUrl instead. */
  image?: MarketingImage | string;
  src?: string;
  alt?: string;
  creditFileUrl?: string;
  /** Rendered above the credit inside the figcaption. */
  caption?: ReactNode;
  sizes?: string;
  priority?: boolean;
  /** Figure sizing: background, min-height, aspect ratio, radius. */
  className?: string;
  /** Image object-position or filter classes. */
  imageClassName?: string;
  gradientClassName?: string;
  /** Figcaption placement and layout classes. */
  captionClassName?: string;
  reveal?: boolean;
  revealDirection?: "up" | "down" | "left" | "right";
  delay?: number;
};

/** Reusable local photograph with mandatory attribution. */
export function PhotoFeature({
  image,
  src,
  alt,
  creditFileUrl,
  caption,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className,
  imageClassName,
  gradientClassName,
  captionClassName,
  reveal = true,
  revealDirection = "up",
  delay = 0,
}: PhotoFeatureProps) {
  const photo: MarketingImage =
    typeof image === "string" || !image
      ? {
          src: image ?? src ?? "",
          alt: alt ?? "",
          fileUrl: creditFileUrl ?? PHOTO_CREDITS.valley,
        }
      : image;

  const figure = (
    <figure
      className={cn(
        "relative isolate min-h-80 overflow-hidden rounded-xl bg-[#66bfbf] sm:min-h-0",
        className,
      )}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-[#0b2e2e]/55 to-transparent",
          gradientClassName,
        )}
      />
      <figcaption
        className={cn(
          "absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2 text-[#ffffff] sm:bottom-5 sm:left-5 sm:right-5",
          captionClassName,
        )}
      >
        {caption ? <span className="text-sm font-medium">{caption}</span> : null}
        <PhotoCredit fileUrl={photo.fileUrl} className="text-[#ffffff]/80" />
      </figcaption>
    </figure>
  );

  return reveal ? (
    <Reveal direction={revealDirection} delay={delay}>
      {figure}
    </Reveal>
  ) : (
    figure
  );
}
