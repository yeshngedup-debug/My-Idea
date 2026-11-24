import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CaretRight, Envelope } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CtaBand } from "@/components/marketing/cta-band";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { Chapter, ActionLink } from "@/components/marketing/guides/primitives";
import { APP_CONTACT } from "@/config/app";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description:
    "Questions about student signup, founder access, or a project? Email the Bhutan Tech Connect team and we will help.",
  path: "/contact",
});

const generalHref = `mailto:${APP_CONTACT.email}`;
const founderHref = `mailto:${APP_CONTACT.email}?subject=${encodeURIComponent(
  "Founder access request",
)}`;

const MARKET_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg";

const helpfulLinks = [
  {
    href: "/faq",
    title: "Frequently asked questions",
    note: "Accounts, profiles, payments and shortlists.",
  },
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
    <div className="min-h-screen bg-[#f5f2ea] text-[#18251f]">
      <SiteHeader />

      <main id="main-content" className="overflow-x-clip">
        <section className="border-b border-[#17352b]/10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
              <HeroCopyEntrance>
                <h1 className="max-w-[14ch] text-balance text-[clamp(2.5rem,4.6vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#17352b]">
                  Email the Bhutan Tech Connect team
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#5e554a] sm:text-lg sm:leading-8">
                  Send a note with questions about student signup, founder
                  access, or a project.
                </p>

                <a
                  href={generalHref}
                  className="group mt-10 inline-flex max-w-full flex-col items-start border-b-2 border-[#b23c26] pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f2ea]"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#b23c26]">
                    <Envelope
                      aria-hidden="true"
                      weight="light"
                      strokeWidth={1.5}
                      className="h-4 w-4"
                    />
                    Write to this address
                  </span>
                  <span className="mt-2 break-all text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.035em] text-[#17352b] group-hover:text-[#b23c26]">
                    {APP_CONTACT.email}
                  </span>
                </a>

                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <ActionLink href={generalHref}>Email the team</ActionLink>
                  <Link
                    href="/faq"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-[#17352b] hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
                  >
                    Read the FAQ
                  </Link>
                </div>
              </HeroCopyEntrance>

              <figure className="relative isolate aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl bg-[#28453a] lg:justify-self-end">
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

        <Chapter labelledBy="reach-heading">
          <Reveal className="mb-16 max-w-3xl">
            <h2
              id="reach-heading"
              className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
            >
              One email address for every question
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#18251f]/70 sm:text-base">
              No form to fill in and no ticket queue. Write to us and tell us
              what you need.
            </p>
          </Reveal>

          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <Reveal>
              <div className="border-t-2 border-[#17352b] pt-8">
                <p className="flex items-center gap-3 text-[#b23c26]">
                  <Envelope
                    aria-hidden="true"
                    weight="light"
                    strokeWidth={1.5}
                    className="h-6 w-6"
                  />
                  <span className="text-xs font-semibold">Email</span>
                </p>
                <p className="mt-4 max-w-lg text-sm leading-6 text-[#56645c]">
                  We answer questions about the platform, student profiles,
                  projects, and access requests.
                </p>
                <ActionLink href={generalHref} className="mt-8">
                  Email the team
                </ActionLink>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.06}>
              <div className="border-t-2 border-[#17352b]/20 pt-8">
                <h3 className="text-balance text-2xl font-semibold leading-tight text-[#17352b] sm:text-3xl">
                  Tell us what you need
                </h3>
                <ul className="mt-8 space-y-5">
                  {[
                    "Say whether you are a student, founder, or visitor.",
                    "Name the page or feature your question is about.",
                    "Share the project or order reference, if you have one.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-[#56645c]">
                      <CaretRight
                        aria-hidden="true"
                        weight="light"
                        strokeWidth={1.5}
                        className="mt-1 h-4 w-4 shrink-0 text-[#b23c26]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-16">
            <figure className="relative isolate aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#17352b] sm:aspect-[21/7]">
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
        </Chapter>

        <Chapter labelledBy="founders-heading" tone="surface">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <Reveal>
              <h2
                id="founders-heading"
                className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
              >
                Ask an admin to assign founder access
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#18251f]/70 sm:text-base">
                Founder accounts are not created through public signup; tell us
                who you are and what you are building, and we will arrange
                access.
              </p>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <div className="grid h-full gap-10 sm:grid-cols-2">
                <article className="flex h-full flex-col justify-between gap-10 border-t border-[#17352b]/15 pt-6">
                  <div>
                    <h3 className="text-balance text-xl font-semibold leading-snug text-[#17352b] sm:text-2xl">
                      Send a short note
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#56645c]">
                      Include your name, organisation, and a line about the
                      project you have in mind.
                    </p>
                  </div>
                  <ActionLink href={founderHref} className="w-fit">
                    Request founder access
                  </ActionLink>
                </article>
                <article className="flex h-full flex-col justify-between gap-10 border-t-2 border-[#b23c26] pt-6">
                  <div>
                    <h3 className="text-balance text-xl font-semibold leading-snug text-[#17352b] sm:text-2xl">
                      Read the overview first
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#56645c]">
                      Read the public overview and the three-step walkthrough
                      before you decide.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <Link
                      href="/public"
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#b23c26] underline decoration-[#b23c26]/40 underline-offset-4 hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
                    >
                      Visit the public home
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#b23c26] underline decoration-[#b23c26]/40 underline-offset-4 hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
                    >
                      See how it works
                    </Link>
                  </div>
                </article>
              </div>
            </Reveal>
          </div>
        </Chapter>

        <Chapter labelledBy="elsewhere-heading">
          <Reveal className="max-w-3xl">
            <h2
              id="elsewhere-heading"
              className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl"
            >
              Helpful pages
            </h2>
          </Reveal>
          <StaggerGroup className="mt-14 grid gap-0 md:grid-cols-3">
            {helpfulLinks.map((item) => (
              <StaggerItem key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col justify-between gap-8 border-t border-[#17352b]/15 py-6 pr-6 transition hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] md:border-r md:pl-6 md:first:pl-0 md:last:border-r-0"
                >
                  <div>
                    <h3 className="text-lg font-semibold leading-snug sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#18251f]/65">
                      {item.note}
                    </p>
                  </div>
                  <CaretRight
                    aria-hidden="true"
                    weight="light"
                    strokeWidth={1.5}
                    className="h-5 w-5 text-[#17352b]/40 transition group-hover:translate-x-1 group-hover:text-[#b23c26]"
                  />
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Chapter>

        <div className="px-5 pb-8 sm:px-8 lg:px-12">
          <Reveal className="mx-auto max-w-[1440px]">
            <CtaBand
              title="Prefer to read first?"
              lead="Common questions are answered on the FAQ page."
              href="/faq"
              label="Read the FAQ"
            />
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
