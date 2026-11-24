import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarBlank,
  CheckCircle,
  Clock,
  FileText,
  MagnifyingGlass,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionIntro } from "@/components/marketing/section-intro";
import { CtaBand } from "@/components/marketing/cta-band";
import { PhotoFeature } from "@/components/marketing/photo-feature";
import { ShortlistPreview } from "@/components/marketing/product-preview/shortlist-preview";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { TextReveal } from "@/components/ui/text-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { PACKAGES } from "@/config/payment";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "For founders",
  description:
    "Founder access is assigned by an admin. Post a scoped project, browse student profiles and CVs, and request a manually curated Premium Shortlist.",
  path: "/for-founders",
});

const valley = {
  src: "/images/bhutanese-students.jpg",
  alt: "Young Bhutanese people in gho and kira working together at computers",
  fileUrl:
    "https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg",
};

const dzong = {
  src: "/images/bhutanese-community.jpg",
  alt: "Bhutanese boys in traditional gho sitting together",
  fileUrl:
    "https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg",
};

const accessSteps = [
  {
    number: "01",
    title: "Ask for access",
    text: "Tell us your name and organisation; an admin sets up your account.",
  },
  {
    number: "02",
    title: "Log in and post a brief",
    text: "Log in at /login and describe the work, skills, budget, duration and deadline.",
  },
  {
    number: "03",
    title: "Meet the students",
    text: "Browse profiles, open CVs, and request a shortlist.",
  },
];

const briefFields = [
  {
    icon: CheckCircle,
    label: "Skills",
    text: "The abilities the project needs.",
  },
  {
    icon: Wallet,
    label: "Budget",
    text: "A range you are comfortable paying.",
  },
  {
    icon: Clock,
    label: "Duration",
    text: "How long the work should take.",
  },
  {
    icon: CalendarBlank,
    label: "Deadline",
    text: "A clear date to work toward.",
  },
];

const profileViews = [
  {
    icon: FileText,
    label: "CV links",
    text: "Open a CV when a shortlist order has been confirmed.",
  },
  {
    icon: MagnifyingGlass,
    label: "Search and filters",
    text: "Find students by skill and availability.",
  },
  {
    icon: CheckCircle,
    label: "Completed profiles",
    text: "Founders see profiles that students have finished.",
  },
];

const paymentSteps = [
  {
    number: "01",
    title: "Transfer",
    text: "Pay by bank transfer or mBoB using the details shared with your founder account.",
  },
  {
    number: "02",
    title: "Upload proof",
    text: "Upload a screenshot of the payment in the shortlists area.",
  },
  {
    number: "03",
    title: "Confirmation",
    text: "An admin confirms payment and releases the shortlist; founders cannot confirm their own orders.",
  },
];

const textLink =
  "inline-flex items-center gap-1.5 font-semibold text-[#b23c26] underline decoration-[#d84f37]/30 underline-offset-4 transition hover:decoration-[#d84f37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]";

export default function ForFoundersPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#18251f]">
      <SiteHeader />

      <main id="main-content">
        <PageHero
          title="Post a paid brief for Bhutanese students"
          lead="Post a brief, meet students, build together."
          primaryCta={{ href: "/contact", label: "Ask for founder access" }}
          secondary={{ href: "/how-it-works", label: "See how it works" }}
          image={valley}
          imagePosition="object-[45%_55%]"
        />

        <section
          aria-labelledby="access-heading"
          className="border-y border-[#18251f]/15 bg-[#fffefa] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
              <SectionIntro
                headingId="access-heading"
                title="Three steps to get going"
              />
              <Reveal direction="right" delay={0.08}>
                <p className="max-w-xl text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[#17352b] sm:text-4xl">
                  Access is assigned by an admin.
                </p>
                <StaggerGroup className="mt-10 grid gap-0">
                  {accessSteps.map((step, index) => (
                    <StaggerItem key={step.number}>
                      <div
                        className={
                          index === 0
                            ? "pb-5 sm:pb-6"
                            : "border-t border-[#18251f]/15 py-5 sm:py-6"
                        }
                      >
                        <p className="max-w-xl text-sm leading-7 text-body-secondary sm:text-base">
                          <span className="font-semibold text-[#17352b]">
                            {step.title}.
                          </span>{" "}
                          {step.text}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </Reveal>
            </div>
            <Reveal className="mt-9 border-t border-[#18251f]/15 pt-7">
              <Link href="/contact" className={textLink}>
                Ask for founder access
              </Link>
            </Reveal>
          </div>
        </section>

        <section
          aria-labelledby="brief-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="brief-heading"
              title={<TextReveal text="Start with a clear, scoped brief" />}
              lead="A clear brief helps both sides begin."
            />
            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <PhotoFeature
                image={dzong}
                caption="Young people in gho"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="sm:aspect-[1.5]"
              />
              <Reveal direction="right" delay={0.08}>
                <dl className="grid gap-0">
                  {briefFields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <div
                        key={field.label}
                        className="flex gap-5 border-t border-[#18251f]/15 py-6 first:border-t-0 first:pt-0 sm:py-7"
                      >
                        <Icon
                          aria-hidden="true"
                          weight="light"
                          strokeWidth={1.5}
                          className="mt-0.5 h-6 w-6 shrink-0 text-[#d84f37]"
                        />
                        <div>
                          <dt className="text-lg font-semibold tracking-tight text-[#17352b] sm:text-xl">
                            {field.label}
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-body-secondary">
                            {field.text}
                          </dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="profiles-heading"
          className="bg-[#eae5d9] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="profiles-heading"
              title="Meet the people behind the CVs"
            />
            <Reveal className="mt-10 rounded-[1.75rem] bg-[#fffefa] p-6 sm:p-9 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
                <p className="max-w-2xl text-lg leading-8 text-[#17352b] sm:text-xl sm:leading-9">
                  Search by skill; CVs stay private until a shortlist order is
                  confirmed.
                </p>
                <ul className="grid gap-0">
                  {profileViews.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.label}
                        className="flex gap-4 border-t border-[#18251f]/15 py-4 last:border-b"
                      >
                        <Icon
                          aria-hidden="true"
                          weight="light"
                          strokeWidth={1.5}
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#17352b]/55"
                        />
                        <div>
                          <span className="block text-sm font-semibold text-[#17352b]">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-sm leading-6 text-body-secondary">
                            {item.text}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          aria-labelledby="shortlist-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="shortlist-heading"
              title="A ranked shortlist, prepared by an admin"
              lead="Optional, paid, hand-curated."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-6">
              <Reveal>
                <SpotlightCard className="flex h-full flex-col rounded-[1.5rem] border border-[#18251f]/15 bg-[#fffefa] p-6 sm:p-8">
                  <h3 className="text-2xl font-semibold tracking-tight text-[#17352b]">
                    {PACKAGES.basic.name}
                  </h3>
                  <p className="mt-3 text-sm font-semibold text-[#b23c26]">
                    {PACKAGES.basic.priceRange}
                  </p>
                  <ul className="mt-7 grid gap-3 border-t border-[#18251f]/15 pt-6">
                    {PACKAGES.basic.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-3 text-sm leading-6 text-[#18251f]/70"
                      >
                        <CheckCircle
                          aria-hidden="true"
                          weight="light"
                          strokeWidth={1.5}
                          className="mt-1 h-4 w-4 shrink-0 text-[#17352b]/50"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </Reveal>
              <Reveal delay={0.08} direction="right">
                <SpotlightCard className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#18251f]/15 bg-[#fffefa] p-6 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[#d84f37] sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
                      {PACKAGES.full.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#b23c26]">
                      {PACKAGES.full.priceRange}
                    </p>
                  </div>
                  <ul className="mt-7 grid gap-3 border-t border-[#18251f]/15 pt-6 sm:grid-cols-2 sm:gap-x-8">
                    {PACKAGES.full.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-3 text-sm leading-6 text-[#18251f]/70"
                      >
                        <CheckCircle
                          aria-hidden="true"
                          weight="light"
                          strokeWidth={1.5}
                          className="mt-1 h-4 w-4 shrink-0 text-[#d84f37]"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </Reveal>
            </div>
            <Reveal className="mt-6 border-t border-[#18251f]/15 pt-6">
              <p className="max-w-2xl text-sm leading-6 text-body-secondary">
                Prices are advertised ranges; an admin curates every
                shortlist.
              </p>
            </Reveal>
          </div>
        </section>

        <ShortlistPreview />

        <section
          aria-labelledby="payment-heading"
          className="border-y border-[#18251f]/15 bg-[#fffefa] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              headingId="payment-heading"
              title="Payment is manual"
              lead="No card checkout; every order is checked by a person."
            />
            <StaggerGroup className="mt-10 grid gap-8 border-t border-[#18251f]/15 pt-8 sm:grid-cols-3 sm:gap-6">
              {paymentSteps.map((step) => (
                <StaggerItem key={step.number}>
                  <article>
                    <p className="text-sm font-semibold text-[#b23c26]">
                      {step.number}
                    </p>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#17352b] sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-body-secondary">
                      {step.text}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <Reveal className="mx-auto max-w-[1440px] rounded-[1.75rem] bg-[#eae5d9] px-6 py-8 sm:px-10 sm:py-10">
            <h2 className="max-w-xl text-2xl font-semibold leading-tight text-[#17352b] sm:text-3xl">
              Put the terms in writing
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#56645c]">
              Founders and students agree scope, budget, and deadlines directly
              before work starts. The agreement template is available inside
              the founder workspace.
            </p>
          </Reveal>
        </section>

        <CtaBand
          title="Ready to post your first project?"
          primaryCta={{ href: "/contact", label: "Ask for founder access" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
