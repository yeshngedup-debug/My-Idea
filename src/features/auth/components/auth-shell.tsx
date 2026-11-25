"use client";

import Image from "next/image";
import {
  Children,
  isValidElement,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { PhotoCredit } from "@/components/ui/photo-credit";
import {
  authMotionStyles,
  displayFont,
  focusRing,
} from "@/features/auth/components/styles";
import styles from "@/styles/auth-shell.module.css";
import pressStyles from "@/styles/pressable.module.css";

/**
 * The card entrance is a first-impression detail. The flag lives in the client
 * module, so a client-side navigation between auth routes does not replay it.
 */
let authEntranceConsumed = false;

/**
 * The task heading belongs to the page; the shell supplies one only when the
 * page has not already supplied its own h1.
 */
function hasPageH1(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === "h1",
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  const Headline = hasPageH1(children) ? "p" : "h1";
  const cardRef = useRef<HTMLDivElement>(null);

  // Runs before paint: on the first mount the CSS animation starts as usual;
  // on later mounts the attribute is removed, so no route-change replay.
  useLayoutEffect(() => {
    if (authEntranceConsumed) {
      cardRef.current?.removeAttribute("data-auth-enter");
      return;
    }
    authEntranceConsumed = true;
  }, []);

  return (
    <main
      id="main-content"
      className={`${styles.canvas} min-h-screen w-full max-w-full overflow-x-clip px-5 py-5 text-[#18251f] sm:px-10 sm:py-9 lg:px-14`}
    >
      <style>{authMotionStyles}</style>

      <header className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 pb-8 sm:gap-4 sm:pb-12">
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
          className={`pressable inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 py-2 text-xs font-medium text-[#56645c] underline decoration-[#17352b]/25 underline-offset-4 hover:bg-white hover:text-[#17352b] sm:px-3 sm:text-sm ${pressStyles.press} ${focusRing}`}
        >
          About the platform
        </Link>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-5 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <section className="relative isolate flex min-h-[210px] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-[#17352b] p-7 text-white sm:min-h-[300px] sm:rounded-[2rem] sm:p-12 lg:min-h-0 lg:p-16">
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

          <div className="w-full max-w-6xl">
            <Headline
              style={displayFont}
              className="w-full text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance"
            >
              Paid project work in Bhutan
            </Headline>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
              Paid project work for students and founders in Bhutan.
            </p>
          </div>

          <PhotoCredit
            fileUrl="https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg"
            className="mt-7 text-white/70 lg:mt-10"
          />
        </section>

        <section className="flex items-center justify-center px-1 py-1 sm:px-2 lg:px-3">
          <div
            ref={cardRef}
            data-auth-card
            data-auth-enter
            className={`${styles.formCard} w-full max-w-md rounded-[1.5rem] px-6 py-9 sm:max-w-lg sm:rounded-[2rem] sm:px-10 sm:py-12 lg:px-14`}
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
