import Image from "next/image";
import type { ReactNode } from "react";
import { PhotoCredit } from "@/components/ui/photo-credit";

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={eyebrow}
      className="relative isolate overflow-hidden rounded-2xl border border-primary/10 bg-primary px-6 py-8 text-card sm:px-9 sm:py-10"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/images/bhutanese-community.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 1100px"
          className="object-cover object-center opacity-35 brightness-[0.65] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10241c] via-[#10241c]/90 to-[#10241c]/70" />
      </div>
      <div className="relative z-10 min-w-0 max-w-3xl">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-primary-foreground text-balance">
          {title}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75 sm:text-base">
          <span className="font-medium text-amber-200/90">{eyebrow} ·</span>{" "}
          {description}
        </p>
        {children && (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">{children}</div>
        )}
      </div>
      <div className="relative z-10 mt-8 border-t border-primary-foreground/15 pt-3 sm:absolute sm:bottom-5 sm:right-6 sm:mt-0 sm:border-0 sm:pt-0">
        <PhotoCredit
          fileUrl="https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg"
          className="text-primary-foreground/70"
        />
      </div>
    </section>
  );
}
