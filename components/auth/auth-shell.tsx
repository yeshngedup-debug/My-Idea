import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { focusRing } from "@/components/auth/styles";
import styles from "./auth-shell.module.css";
import pressStyles from "../ui/pressable.module.css";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className={`${styles.canvas} min-h-screen w-full max-w-full overflow-x-hidden px-4 py-4 text-[#18251f] sm:px-7 sm:py-7`}
    >
      <header className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 pb-5 sm:gap-4">
        <Link
          href="/"
          className={`pressable inline-flex min-h-11 items-center gap-2.5 rounded-full ${pressStyles.press} ${focusRing}`}
        >
          <Logo size="h-7 w-7" />
          <span className="text-[13px] font-semibold text-[#17352b] sm:text-base">
            Bhutan Tech Connect
          </span>
        </Link>
        <Link
          href="/public"
          className={`pressable inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-semibold text-slate-600 hover:bg-white hover:text-[#17352b] sm:px-3 sm:text-sm ${pressStyles.press} ${focusRing}`}
        >
          About the platform
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-4 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative isolate flex min-h-[210px] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-[#17352b] p-5 text-white sm:min-h-[300px] sm:rounded-[2rem] sm:p-9 lg:min-h-0 lg:p-12">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <Image
              src="/images/bhutanese-students.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-[42%_50%] opacity-70 brightness-80 saturate-125"
            />
            <div className={`absolute inset-0 ${styles.imageWash}`} />
          </div>

          <div>
            <h1 className="max-w-[16ch] text-[clamp(1.75rem,7vw,4.25rem)] font-semibold leading-[1] tracking-[-0.055em]">
              Paid project work in Bhutan
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
              Paid project work for students and founders in Bhutan.
            </p>
          </div>

          <PhotoCredit
            fileUrl="https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg"
            className="mt-5 text-white/70 lg:mt-8"
          />
        </section>

        <section className="flex items-center justify-center px-1 py-1 sm:px-2 lg:px-3">
          <div
            className={`${styles.formCard} w-full max-w-md rounded-[1.5rem] px-6 py-8 sm:max-w-lg sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-12`}
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
