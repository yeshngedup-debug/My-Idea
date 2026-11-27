import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import { MarketingReveal } from "@/components/marketing/reveal";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  Action,
  Band,
  LinkArrow,
  RuleLink,
  SectionHead,
  container,
  focusRing,
  gutters,
} from "@/components/marketing/editorial";
import {
  CTA_HREFS,
  CTA_LABELS,
  FOUNDER_ACCESS,
} from "@/components/marketing/nav";
import { InlineImageText } from "@/components/editorial";
import { HeroPhotoEntrance } from "@/components/marketing/hero-photo";
import { APP_CONTACT } from "@/config/app";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description:
    "Questions about student signup, founder access, or a project? Email the Bhutan Tech Connect team.",
  path: "/contact",
});

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

const messageChecklist = [
  "Say whether you are a student, founder, or visitor.",
  "Name the page or feature your question is about.",
  "Share the project or order reference, if you have one.",
] as const;

const helpfulLinks = [
  {
    href: CTA_HREFS.home,
    title: "The public home page",
    note: "A plain-language overview of the platform.",
  },
  {
    href: CTA_HREFS.howItWorks,
    title: CTA_LABELS.howItWorks,
    note: "The three steps from brief to finished work.",
  },
] as const;

/** The address itself, at display scale: the only thing to click. */
const mailClass = cn(
  "group mt-1 inline-flex max-w-full flex-col items-start border-b-2 border-[#ff0063] pb-2 text-left",
  focusRing,
);

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        {/* Split hero: the address is the action, one plate beside it. */}
        <section className="border-b border-[#0b2e2e]/10">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12 lg:pb-16 lg:pt-14">
            <div className="lg:col-span-7 lg:pr-8">
              <p className="index-label">01 · Get in touch</p>
              <h1 className="display-xl mt-7 max-w-[15ch] text-[#0b2e2e]">
                Email the{" "}
                <span className="text-[#0b5c5c]">Bhutan Tech Connect team.</span>
              </h1>
              <p className="mt-7 max-w-[46ch] text-lg leading-8 text-[#356464]">
                Send a note with questions about student signup, founder access,
                or a project. We read every message and reply as soon as we can.
              </p>

              <div className="mt-9 border-t border-[#0b2e2e]/15 pt-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#356464]">
                  <Envelope
                    aria-hidden="true"
                    weight="light"
                    strokeWidth={1.6}
                    className="h-4 w-4 text-[#c2004b]"
                  />
                  Write to this address
                </p>
                <a href={generalHref} className={mailClass}>
                  <span className="break-words text-[clamp(1.5rem,3.6vw,2.5rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-[#0b2e2e] transition-colors group-hover:text-[#0b5c5c]">
                    {APP_CONTACT.email}
                  </span>
                </a>
                <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
                  <Action href={founderHref}>
                    {FOUNDER_ACCESS.label}
                  </Action>
                  <RuleLink href={CTA_HREFS.faq}>{CTA_LABELS.faq}</RuleLink>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <HeroPhotoEntrance>
                <figure>
                  <div className="plate relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5] lg:min-h-[420px]">
                    <Image
                      src="/images/thimphu-city.jpg"
                      alt="Handicraft shops along Norzin Lam road in Thimphu"
                      fill
                      preload
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover object-center"
                    />
                  </div>

                </figure>
              </HeroPhotoEntrance>
            </div>
          </div>
        </section>

        {/* One address, three things to include. */}
        <Band
          tone="mist"
          labelledBy="reach-heading"
          className="border-b border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="02"
                eyebrow="One address"
                id="reach-heading"
                title={
                  <>
                    One email address for{" "}
                    <span className="text-[#0b5c5c]">every question</span>
                  </>
                }
                lead="No form to fill in and no ticket queue. Write to us and tell us what you need."
              />
            </MarketingReveal>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-5">
                <p className="index-label">Include this</p>
                <h3 className="mt-4 text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] text-[#0b2e2e]">
                  Tell us what you need
                </h3>
                <ul className="mt-6 border-t border-[#0b2e2e]/15">
                  {messageChecklist.map((item, index) => (
                    <li
                      key={item}
                      className="grid grid-cols-[2rem_1fr] gap-4 border-b border-[#0b2e2e]/12 py-4"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[11px] font-semibold tabular-nums tracking-[0.16em] text-[#c2004b]"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="max-w-[38ch] text-sm leading-6 text-[#0b2e2e]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 max-w-[40ch] text-xs leading-5 text-[#356464]">
                  We answer questions about the platform, student profiles,
                  projects, and access requests.
                </p>
              </MarketingReveal>

              <MarketingReveal delay={0.08} className="lg:col-span-7">
                <div className="w-full">
                  <figure>
                    <div className="plate relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                      <Image
                        src="/images/thimphu-street.jpg"
                        alt="A main road in central Thimphu"
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </figure>
                </div>
              </MarketingReveal>
            </div>
          </div>
        </Band>

        {/* Founder access: the admin route, written plainly. */}
        <Band labelledBy="founders-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="03"
                eyebrow="Founder access"
                id="founders-heading"
                title={
                  <>
                    Ask an admin to assign{" "}
                    <span className="text-[#0b5c5c]">founder access</span>
                  </>
                }
                lead="Founder accounts are not created through public signup; tell us who you are and what you are building so an admin can arrange access."
              />
            </MarketingReveal>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-6">
                <div className="border-t border-[#0b2e2e]/15 pt-6">
                  <p className="index-label">Send a short note</p>
                  <p className="mt-4 max-w-[42ch] text-[15px] leading-7 text-[#356464]">
                    Include your name, organisation, and a line about the project
                    you have in mind. An admin will reply with the next step.
                  </p>
                  <div className="mt-8">
                    <Action href={founderHref}>
                      {FOUNDER_ACCESS.label}
                    </Action>
                  </div>
                </div>
              </MarketingReveal>

              <MarketingReveal delay={0.08} className="lg:col-span-6">
                <div className="border-t border-[#0b2e2e]/15 pt-6">
                  <p className="index-label">Read first</p>
                  <ul className="mt-4">
                    {helpfulLinks.map((item, index) => (
                      <li
                        key={item.href}
                        className="border-b border-[#0b2e2e]/12 py-5 first:pt-0"
                      >
                        <Link
                          href={item.href}
                          className="group flex items-baseline gap-3 focus-visible:outline-none"
                        >
                          <span
                            aria-hidden="true"
                            className="text-[11px] font-semibold tabular-nums tracking-[0.16em] text-[#c2004b]"
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <span className="flex items-center gap-1.5 text-[1.05rem] font-semibold text-[#0b2e2e] underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors group-hover:decoration-[#ff0063] group-focus-visible:decoration-[#ff0063]">
                              {item.title}
                              <LinkArrow href={item.href} size={14} />
                            </span>
                            <span className="mt-1 block max-w-[42ch] text-sm leading-6 text-[#356464]">
                              {item.note}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </MarketingReveal>
            </div>
          </div>
        </Band>

        {/* Inline typography photograph, then the wide plate. */}
        <Band
          labelledBy="elsewhere-heading"
          className="border-y border-[#0b2e2e]/10 bg-[#eaf6f6]"
        >
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <InlineImageText
                as="h2"
                id="elsewhere-heading"
                before="Helpful"
                imageSrc="/images/bhutanese-students.jpg"
                imageAlt="Two young Bhutanese women tending a water supply"
                accessibleLabel="Helpful pages"
                after="pages"
              />
            </MarketingReveal>

            <MarketingReveal className="mt-12">
              <div className="w-full">
                <figure>
                  <div className="plate relative aspect-[4/3] overflow-hidden sm:aspect-[21/9]">
                    <Image
                      src="/images/thimphu-hills.jpg"
                      alt="Thimphu's main road with the valley hills behind"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover object-center"
                    />
                  </div>
                </figure>
              </div>
            </MarketingReveal>
          </div>
        </Band>

        {/* Closing band. */}
        <Band tone="teal">
          <div
            className={cn(
              container,
              gutters,
              "grid grid-cols-1 items-end gap-10 py-16 md:py-24 lg:grid-cols-12",
            )}
          >
            <MarketingReveal className="lg:col-span-8">
              <p className="index-label text-[#0b2e2e]">Next step</p>
              <h2 className="display-xl mt-6 max-w-[14ch]">
                Prefer to read first?
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                Common questions are answered on the FAQ page.
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href={CTA_HREFS.faq}>{CTA_LABELS.faq}</Action>
              <RuleLink
                href={CTA_HREFS.home}
                className="decoration-[#0b2e2e]/30 hover:decoration-[#0b2e2e]"
              >
                {CTA_LABELS.publicHome}
              </RuleLink>
            </MarketingReveal>
          </div>
        </Band>
      </main>

      <SiteFooter />
    </div>
  );
}