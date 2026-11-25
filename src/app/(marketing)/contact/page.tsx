import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
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

/** Paywave-style centred card system in the BTC palette. */
const card =
  "rounded-3xl border border-[#1B4D3E]/12 bg-white shadow-[0_2px_10px_rgba(11,31,26,0.04)]";
const cardBody = "p-6 sm:p-10 lg:p-14";
const band = "px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9";
const pill =
  "inline-flex min-h-8 items-center justify-center rounded-full border border-[#1B4D3E]/15 bg-[#F7F4EE] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1B4D3E]";
const sectionHeading =
  "text-balance text-center text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#0B1F1A] sm:text-4xl lg:text-5xl";
const accent = "text-[#E8A317]";
const muted = "text-[#5A6A61]";
const primaryCta =
  "pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors hover:bg-[#F2B733] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none";

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
    <div className="min-h-[100dvh] bg-[#F7F4EE] text-[#0B1F1A]">
      <SiteHeader />

      <main id="main-content" className="overflow-x-clip">
        <section className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} relative overflow-hidden`}>
              {/* Decorative corner wedges: pine and saffron. Non-interactive. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-16 w-16 bg-[#1B4D3E] [clip-path:polygon(0_0,100%_0,0_100%)] sm:h-24 sm:w-24"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 bg-[#E8A317] [clip-path:polygon(100%_0,100%_100%,0_100%)] sm:h-24 sm:w-24"
              />

              <HeroCopyEntrance className="relative mx-auto max-w-3xl px-6 pb-8 pt-14 text-center sm:px-10 sm:pt-16">
                <span className={pill}>Email</span>
                <h1 className="mt-6 text-balance text-[clamp(2.25rem,4.6vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[#0B1F1A]">
                  Email the{" "}
                  <span className={accent}>Bhutan Tech Connect team</span>
                </h1>
                <p className={`mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
                  Send a note with questions about student signup, founder
                  access, or a project.
                </p>
                <p className={`mt-3 text-sm leading-6 ${muted}`}>
                  We read every message and reply as soon as we can.
                </p>

                <div className="mx-auto mt-10 flex max-w-2xl justify-center">
                  <a
                    href={generalHref}
                    className="pressable group flex min-h-11 max-w-full flex-col items-center border-b-2 border-[#E8A317] px-2 pb-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#1B4D3E]">
                      <Envelope
                        aria-hidden="true"
                        weight="light"
                        strokeWidth={1.5}
                        className="h-4 w-4"
                      />
                      Write to this address
                    </span>
                    <span className="mt-2 break-words text-[clamp(1.5rem,6vw,3rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-[#0B1F1A] transition-colors group-hover:text-[#1B4D3E] motion-reduce:transition-none">
                      {APP_CONTACT.email}
                    </span>
                  </a>
                </div>
              </HeroCopyEntrance>

              <figure className="relative mx-6 mb-10 isolate aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.5rem] bg-[#28453a] sm:mx-10 sm:mb-14 lg:mx-auto">
                <Image
                  src="/images/bhutanese-community.jpg"
                  alt="Bhutanese boys in traditional gho sitting together"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 28vw"
                  className="object-cover object-[45%_55%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#101d17]/45 to-transparent"
                />
                <figcaption className="absolute inset-x-4 bottom-3">
                  <PhotoCredit
                    fileUrl="https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg"
                    className="text-[#fffefa]/80"
                  />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section aria-labelledby="reach-heading" className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <Reveal className="mx-auto max-w-3xl text-center">
                <span className={pill}>Email</span>
                <h2 id="reach-heading" className={`mt-5 ${sectionHeading}`}>
                  One email address for{" "}
                  <span className={accent}>every question</span>
                </h2>
                <p className={`mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base ${muted}`}>
                  No form to fill in and no ticket queue. Write to us and tell us
                  what you need.
                </p>
              </Reveal>

              <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
                <Reveal>
                  <div className="h-full rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6 sm:p-8">
                    <p className="flex items-center gap-3 text-[#1B4D3E]">
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

                <Reveal direction="right" delay={0.06}>
                  <div className="h-full rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6 sm:p-8">
                    <h3 className="text-balance text-2xl font-semibold leading-tight text-[#0B1F1A] sm:text-3xl">
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
                <figure className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#17352b] sm:aspect-[21/7]">
                  <Image
                    src="/images/bhutanese-team.jpg"
                    alt="Bhutanese students in kira performing in national dress"
                    fill
                    sizes="(max-width: 640px) 100vw, 90vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#17352b]/45 via-transparent to-transparent"
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
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
                <Reveal>
                  <span className={pill}>Founder access</span>
                  <h2
                    id="founders-heading"
                    className="mt-5 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#0B1F1A] sm:text-4xl lg:text-5xl"
                  >
                    Ask an admin to assign{" "}
                    <span className={accent}>founder access</span>
                  </h2>
                  <p className={`mt-6 max-w-md text-sm leading-7 sm:text-base ${muted}`}>
                    Founder accounts are not created through public signup; tell us
                    who you are and what you are building so an admin can arrange
                    access.
                  </p>
                </Reveal>

                <Reveal direction="right" delay={0.08}>
                  <div className="grid h-full gap-10 sm:grid-cols-2">
                    <article className="flex h-full flex-col justify-between gap-10 rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6 sm:p-8">
                      <div>
                        <h3 className="text-balance text-xl font-semibold leading-snug text-[#0B1F1A] sm:text-2xl">
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
                    <article className="flex h-full flex-col justify-between gap-10 rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6 sm:p-8">
                      <div>
                        <h3 className="text-balance text-xl font-semibold leading-snug text-[#0B1F1A] sm:text-2xl">
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
                          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#1B4D3E] underline decoration-[#E8A317] decoration-2 underline-offset-4 transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                        >
                          Visit the public home
                        </Link>
                        <Link
                          href="/how-it-works"
                          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#1B4D3E] underline decoration-[#E8A317] decoration-2 underline-offset-4 transition-colors hover:text-[#0B1F1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
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
                  <div className="relative isolate aspect-[21/9] w-full overflow-hidden rounded-[1.5rem] bg-[#fffefa]">
                    <Image
                      src="/images/bhutanese-students.jpg"
                      alt="Young Bhutanese people working together at computers"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="text-sm font-medium text-[#0B1F1A]">
                      Students building their profiles
                    </span>
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.valley}
                      className="text-[#5A6A61]"
                    />
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        <section aria-labelledby="elsewhere-heading" className={band}>
          <div className="mx-auto max-w-[1440px]">
            <div className={`${card} ${cardBody}`}>
              <Reveal className="mx-auto max-w-3xl text-center">
                <span className={pill}>Helpful pages</span>
                <h2
                  id="elsewhere-heading"
                  className={`mt-5 ${sectionHeading}`}
                >
                  Helpful <span className={accent}>pages</span>
                </h2>
              </Reveal>
              <StaggerGroup className="mx-auto mt-12 grid max-w-4xl gap-0 md:grid-cols-2">
                {helpfulLinks.map((item) => (
                  <StaggerItem key={item.href}>
                    <Link
                      href={item.href}
                      className="flex h-full min-h-11 flex-col rounded-[1.25rem] border border-[#1B4D3E]/10 bg-[#F7F4EE] p-6 transition-colors hover:text-[#1B4D3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A317] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
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

        <section className={band}>
          <div className="mx-auto max-w-[1440px]">
            <Reveal>
              <div className="rounded-3xl border border-[#1B4D3E]/12 bg-[#1B4D3E] px-6 py-14 text-center sm:px-10 sm:py-20">
                <h2 className="text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
                  Prefer to read{" "}
                  <span className={accent}>first?</span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-[1.65] text-[#E8E4DB] sm:text-lg">
                  Common questions are answered on the FAQ page.
                </p>
                <div className="mt-8 flex justify-center">
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
