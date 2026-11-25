import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { InlineImageText } from "@/components/editorial/inline-image-text";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { ActionLink } from "@/components/marketing/guides/primitives";
import { APP_CONTACT } from "@/config/app";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description:
    "Questions about student signup, founder access, or a project? Email the Bhutan Tech Connect team.",
  path: "/contact",
});

/** Editorial card system in the BTC palette. */
const card =
  "rounded-3xl border border-[#b9dede]/12 bg-white shadow-[0_2px_10px_rgba(11,46,46,0.04)]";
const cardBody = "p-6 sm:p-10 lg:p-14";
const band = "px-4 py-16 sm:px-6 md:py-24 lg:px-8";
const wideBand = "px-4 py-32 sm:px-6 md:py-48 lg:px-8";
const sectionHeading =
  "text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#0b2e2e] sm:text-4xl lg:text-5xl";
const accent = "text-[#c2004b]";
const muted = "text-[#356464]";
const primaryCta =
  "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#ff0063] px-6 py-3 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

/** One hover/press treatment for every clickable card. */
const lift =
  "min-h-11 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(11,46,46,0.10)] motion-reduce:transform-none motion-reduce:transition-none";

const generalBody = [
  "Role (student, founder, or visitor):",
  "Page or feature:",
  "Project or order reference (if any):",
].join("\r\n");
const founderBody = ["Name:", "Organisation:", "Project idea:"].join("\r\n");

const generalHref = `mailto:${APP_CONTACT.email}?subject=${encodeURIComponent(
  "Question about Bhutan Tech Connect",
)}&body=${encodeURIComponent(generalBody)}`;
const founderHref = `mailto:${APP_CONTACT.email}?subject=${encodeURIComponent(
  "Founder access request",
)}&body=${encodeURIComponent(founderBody)}`;

const MARKET_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg";

const helpfulLinks = [
  {
    href: "/public",
    title: "The public home page",
    note: "A plain-language overview of the platform.",
  },
  {
    href: "/how-it-works",
    title: "How it works",
    note: "The three steps from brief to finished work.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] bg-[#eaf6f6] text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Editorial split: the address is the action, the photograph carries
            the place. One saffron CTA lives in the closing band only. */}
        <section aria-labelledby="contact-heading" className={wideBand}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-12 grid-flow-dense gap-4">
              <HeroCopyEntrance className="col-span-12 flex flex-col justify-center px-2 py-6 md:col-span-7 md:px-8 lg:pr-16">
                <h1
                  id="contact-heading"
                  className="w-full max-w-6xl text-balance text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#0b2e2e]"
                >
                  Email the{" "}
                  <span className={accent}>Bhutan Tech Connect team</span>
                </h1>
                <p className={`mt-10 max-w-xl text-lg leading-8 sm:text-xl ${muted}`}>
                  Send a note with questions about student signup, founder
                  access, or a project.
                </p>
                <p className={`mt-4 text-sm leading-6 ${muted}`}>
                  We read every message and reply as soon as we can.
                </p>

                <div className="mt-12 flex max-w-2xl">
                  <a
                    href={generalHref}
                    className="pressable group flex min-h-11 max-w-full flex-col items-start border-b-2 border-[#ff0063] px-2 pb-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#0b5c5c]">
                      <Envelope
                        aria-hidden="true"
                        weight="light"
                        strokeWidth={1.5}
                        className="h-4 w-4"
                      />
                      Write to this address
                    </span>
                    <span className="mt-2 break-words text-[clamp(1.5rem,4vw,2.75rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-[#0b2e2e] transition-colors group-hover:text-[#0b5c5c] motion-reduce:transition-none">
                      {APP_CONTACT.email}
                    </span>
                  </a>
                </div>
              </HeroCopyEntrance>

              <figure className="col-span-12 md:col-span-5">
                <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#0b2e2e]">
                  <Image
                    src="/images/bhutanese-community.jpg"
                    alt="Bhutanese boys in traditional gho sitting together"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 38vw"
                    className="object-cover object-[45%_55%] grayscale contrast-[1.15] opacity-85"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 45% 35%, rgba(11,46,46,0.05) 0%, rgba(11,46,46,0.78) 100%)",
                    }}
                  />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="text-sm font-medium text-[#0b2e2e]">
                    Bhutanese boys in gho, sitting together
                  </span>
                  <PhotoCredit
                    fileUrl="https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg"
                    className="text-[#356464]"
                  />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section aria-labelledby="reach-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <Reveal className="max-w-4xl">
                <h2 id="reach-heading" className={`${sectionHeading} text-left`}>
                  One email address for{" "}
                  <span className={accent}>every question</span>
                </h2>
                <p className={`mt-6 max-w-xl text-base leading-7 sm:text-lg ${muted}`}>
                  No form to fill in and no ticket queue. Write to us and tell us
                  what you need.
                </p>
              </Reveal>

              {/* Gapless 12-column mosaic: 5 + 7. */}
              <div className="mt-12 grid grid-cols-12 grid-flow-dense gap-4">
                <Reveal className="col-span-12 md:col-span-5">
                  <div className={`h-full rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 sm:p-8 ${lift}`}>
                    <p className="flex items-center gap-3 text-[#0b5c5c]">
                      <Envelope
                        aria-hidden="true"
                        weight="light"
                        strokeWidth={1.5}
                        className="h-6 w-6"
                      />
                      <span className="text-xs font-semibold">Email</span>
                    </p>
                    <p className={`mt-4 max-w-lg text-sm leading-6 ${muted}`}>
                      We answer questions about the platform, student profiles,
                      projects, and access requests.
                    </p>
                  </div>
                </Reveal>

                <Reveal direction="right" delay={0.06} className="col-span-12 md:col-span-7">
                  <div className={`h-full rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 sm:p-8 ${lift}`}>
                    <h3 className="text-balance text-2xl font-semibold leading-tight text-[#0b2e2e] sm:text-3xl">
                      Tell us what you need
                    </h3>
                    <ul className="mt-8 space-y-5">
                      {[
                        "Say whether you are a student, founder, or visitor.",
                        "Name the page or feature your question is about.",
                        "Share the project or order reference, if you have one.",
                      ].map((item) => (
                        <li key={item} className={`text-sm leading-6 ${muted}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>

              <Reveal className="mt-14">
                <figure className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#66bfbf] sm:aspect-[21/7]">
                  <Image
                    src="/images/bhutanese-team.jpg"
                    alt="Bhutanese students in kira performing in national dress"
                    fill
                    sizes="(max-width: 640px) 100vw, 90vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0b5c5c]/45 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-8 sm:bottom-6">
                    <PhotoCredit fileUrl={MARKET_CREDIT} className="text-white/85" />
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        <section aria-labelledby="founders-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              {/* Gapless 12-column mosaic: 7 + 5. */}
              <div className="grid grid-cols-12 grid-flow-dense gap-4">
                <Reveal className="col-span-12 md:col-span-7">
                  <h2
                    id="founders-heading"
                    className={`${sectionHeading} text-left`}
                  >
                    Ask an admin to assign{" "}
                    <span className={accent}>founder access</span>
                  </h2>
                  <p className={`mt-6 max-w-md text-base leading-7 sm:text-lg ${muted}`}>
                    Founder accounts are not created through public signup; tell us
                    who you are and what you are building so an admin can arrange
                    access.
                  </p>
                </Reveal>

                <Reveal direction="right" delay={0.08} className="col-span-12 md:col-span-5">
                  <div className="grid h-full gap-4 sm:grid-cols-2">
                    <article className={`flex h-full flex-col justify-between gap-10 rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 sm:p-8 ${lift}`}>
                      <div>
                        <h3 className="text-balance text-xl font-semibold leading-snug text-[#0b2e2e] sm:text-2xl">
                          Send a short note
                        </h3>
                        <p className={`mt-4 text-sm leading-6 ${muted}`}>
                          Include your name, organisation, and a line about the
                          project you have in mind.
                        </p>
                      </div>
                      <ActionLink href={founderHref} className="w-fit">
                        Request founder access
                      </ActionLink>
                    </article>
                    <article className={`flex h-full flex-col justify-between gap-10 rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 sm:p-8 ${lift}`}>
                      <div>
                        <h3 className="text-balance text-xl font-semibold leading-snug text-[#0b2e2e] sm:text-2xl">
                          Read the overview first
                        </h3>
                        <p className={`mt-4 text-sm leading-6 ${muted}`}>
                          Read the public overview and the three-step walkthrough
                          before you decide.
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2">
                        <Link
                          href="/public"
                          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#0b5c5c] underline decoration-[#ff0063] decoration-2 underline-offset-4 transition-colors hover:text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                        >
                          Visit the public home
                        </Link>
                        <Link
                          href="/how-it-works"
                          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#0b5c5c] underline decoration-[#ff0063] decoration-2 underline-offset-4 transition-colors hover:text-[#0b2e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                        >
                          See how it works
                        </Link>
                      </div>
                    </article>
                  </div>
                </Reveal>
              </div>

              <Reveal className="mt-14">
                <figure>
                  <div className="relative isolate aspect-[21/9] w-full overflow-hidden rounded-[1.5rem] bg-[#ffffff]">
                    <Image
                      src="/images/bhutanese-students.jpg"
                      alt="Young Bhutanese people working together at computers"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="text-sm font-medium text-[#0b2e2e]">
                      Students building their profiles
                    </span>
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.valley}
                      className="text-[#356464]"
                    />
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        <section aria-labelledby="elsewhere-heading" className={band}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              {/* Inline typography photograph: one intact accessible heading. */}
              <InlineImageText
                id="elsewhere-heading"
                before="Helpful"
                imageSrc="/images/bhutanese-community.jpg"
                imageAlt="Bhutanese boys in traditional gho sitting together"
                creditFileUrl={PHOTO_CREDITS.dzong}
                accessibleLabel="Helpful pages"
                after="pages"
              />
              <StaggerGroup className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
                {helpfulLinks.map((item) => (
                  <StaggerItem key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex h-full min-h-11 flex-col rounded-[1.25rem] border border-[#b9dede]/10 bg-[#eaf6f6] p-6 hover:text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${lift}`}
                    >
                      <h3 className="text-lg font-semibold leading-snug sm:text-xl">
                        {item.title}
                      </h3>
                      <p className={`mt-2 text-sm leading-6 ${muted}`}>
                        {item.note}
                      </p>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </section>

        <section className={wideBand}>
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <div className="rounded-3xl border border-[#b9dede]/12 bg-[#66bfbf] px-6 py-20 text-center sm:px-10 sm:py-28">
                <h2 className="text-balance text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#0b2e2e]">
                  Prefer to read{" "}
                  <span className={accent}>first?</span>
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-[1.65] text-[#0b2e2e]/80 sm:text-lg">
                  Common questions are answered on the FAQ page.
                </p>
                <div className="mt-10 flex justify-center">
                  <Link href="/faq" className={primaryCta}>
                    Read the FAQ
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
