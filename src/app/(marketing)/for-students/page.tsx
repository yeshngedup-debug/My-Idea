import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Files,
  GraduationCap,
  ListChecks,
  MagnifyingGlass,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { PHOTO_CREDITS } from "@/components/marketing/nav";
import { Reveal } from "@/components/ui/motion";
import { HeroCopyEntrance } from "@/components/marketing/hero-motion";
import { HeroPhotoEntrance } from "@/components/marketing/hero-photo";
import {
  StickySectionHeadings,
  type StickySection,
} from "@/components/layout/sticky-section-headings";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";

type Icon = typeof NotePencil;

export const metadata = pageMetadata({
  title: "For students",
  description:
    "Build a profile, browse paid projects, apply to projects that fit, and track every application in one place.",
  path: "/for-students",
});

const DZONG_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg";
const YOUTH_CREDIT =
  "https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg";

const sections: StickySection[] = [
  { id: "who-heading", label: "Who it's for" },
  { id: "profile-heading", label: "Profile" },
  { id: "rooted-heading", label: "Close to home" },
  { id: "apply-heading", label: "Apply" },
  { id: "pay-heading", label: "Pay" },
];

/** The sticky rail uses theme variables; scope them to this page's palette. */
const stickyVars = {
  "--color-background": "#F7F4EE",
  "--color-foreground": "#0B1F1A",
  "--color-card": "#FFFFFF",
  "--color-border": "#E8E4DB",
  "--color-body-secondary": "#0B1F1A",
  "--color-accent": "#E8A317",
} as CSSProperties;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EE]";
const primaryCta = `inline-flex min-h-11 items-center justify-center rounded-full bg-[#E8A317] px-6 py-3 text-sm font-semibold text-[#0B1F1A] transition-colors duration-150 hover:bg-[#E8A317]/85 motion-reduce:transition-none ${focusRing}`;
const quietLink = `inline-flex min-h-11 items-center text-sm font-semibold text-[#1B4D3E] underline decoration-[#1B4D3E]/30 underline-offset-4 transition-colors hover:text-[#0B1F1A] motion-reduce:transition-none ${focusRing}`;
const pillClass =
  "inline-flex items-center rounded-full border border-[#1B4D3E]/15 bg-[#E8E4DB]/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1B4D3E]";
const headingClass =
  "text-balance text-center text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0B1F1A]";
const bodyClass = "text-center text-sm leading-7 text-[#0B1F1A]/75 sm:text-base";

/** Saffron marker behind a phrase, with ink text kept readable. */
function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="box-decoration-clone rounded-[4px] bg-[#E8A317] px-1 text-[#0B1F1A]">
      {children}
    </span>
  );
}

function SectionCard({
  id,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("px-5 py-10 sm:px-8 lg:px-12", className)}
    >
      <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
        {children}
      </div>
    </section>
  );
}

type Fit = {
  Icon: Icon;
  title: string;
  body: string;
};

const fits: Fit[] = [
  {
    Icon: GraduationCap,
    title: "College students in Bhutan",
    body: "Study, build a profile, and apply around your term.",
  },
  {
    Icon: Briefcase,
    title: "Graduates building a portfolio",
    body: "Use paid projects to show what you can do.",
  },
  {
    Icon: Clock,
    title: "Students with flexible time",
    body: "Set your availability so founders know when you can work.",
  },
];

const profileFields = [
  { label: "Full name", detail: "The name founders see on your profile" },
  { label: "College and course", detail: "Where you study and what you study" },
  { label: "Year of study", detail: "The year you are in now" },
  { label: "Availability", detail: "When you can take on project work" },
  { label: "Your skills", detail: "The skills you can do the work with" },
  { label: "A short bio", detail: "A few lines about you" },
  { label: "A PDF CV", detail: "PDF only, up to 5 MB, stored privately" },
];

type ApplicationStep = {
  Icon: Icon;
  title: string;
  body: string;
};

const applicationSteps: ApplicationStep[] = [
  {
    Icon: MagnifyingGlass,
    title: "Browse open projects",
    body: "Read the scope, skills, budget range, and deadline before you decide.",
  },
  {
    Icon: NotePencil,
    title: "Apply to the ones that fit",
    body: "You can send one application per project. A complete profile and CV help founders decide.",
  },
  {
    Icon: ListChecks,
    title: "Track every application",
    body: "Watch statuses move from pending to shortlisted, accepted, or rejected.",
  },
];

export default function ForStudentsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="overflow-x-clip bg-[#F7F4EE] text-[#0B1F1A]">
        {/* Hero */}
        <section className="px-5 pt-10 sm:px-8 lg:px-12 lg:pt-14">
          <div className="mx-auto max-w-[1120px] rounded-[24px] border border-[#E8E4DB] bg-white p-6 sm:p-10 lg:p-14">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <HeroCopyEntrance>
                <p className={pillClass}>Student guide</p>
                <h1 className="mt-3 max-w-[18ch] text-balance text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0B1F1A]">
                  Turn your skills into <Highlight>paid work.</Highlight>
                </h1>
                <p className="mt-6 max-w-[52ch] text-base leading-7 text-[#0B1F1A]/75">
                  Build a profile, find a focused project, and get paid for the
                  work you do.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href="/signup" className={primaryCta}>
                    Create student account
                  </Link>
                  <Link href="/how-it-works" className={quietLink}>
                    See how it works
                  </Link>
                </div>
              </HeroCopyEntrance>

              <HeroPhotoEntrance>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-[#E8A317]/25 via-[#E8E4DB]/70 to-[#1B4D3E]/15 blur-2xl"
                  />
                  <figure className="relative isolate aspect-[4/5] overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-white">
                    <Image
                      src="/images/bhutanese-students.jpg"
                      alt="Young Bhutanese people working in groups at a training day in Thimphu"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0B1F1A]/55 to-transparent"
                    />
                    <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                      <PhotoCredit
                        fileUrl={YOUTH_CREDIT}
                        className="text-[#F7F4EE]/80"
                      />
                    </figcaption>
                  </figure>
                </div>
              </HeroPhotoEntrance>
            </div>
          </div>
        </section>

        <div style={stickyVars}>
          <StickySectionHeadings
            title="For students"
            eyebrow="Student guide"
            sections={sections}
            navLabel="Student guide sections"
          >
            <SectionCard labelledBy="who-heading">
              <Reveal className="mx-auto max-w-3xl text-center">
                <p className={pillClass}>Who it&apos;s for</p>
                <h2
                  id="who-heading"
                  data-sticky-section
                  className={headingClass}
                >
                  Built for students ready to <Highlight>begin</Highlight>
                </h2>
                <p className={cn(bodyClass, "mx-auto mt-6 max-w-xl")}>
                  You do not need a long work history. Clear skills and time for
                  focused work are enough to begin.
                </p>
              </Reveal>
              <Reveal className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fits.map((fit, index) => {
                  const FitIcon = fit.Icon;
                  const inner = (
                    <div className="flex h-full flex-col">
                      <FitIcon
                        aria-hidden="true"
                        weight="light"
                        size={24}
                        strokeWidth={1.5}
                        className="text-[#1B4D3E]"
                      />
                      <h3 className="mt-5 text-lg font-semibold text-[#0B1F1A]">
                        {fit.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#0B1F1A]/70">
                        {fit.body}
                      </p>
                    </div>
                  );
                  return index === 0 ? (
                    <div
                      key={fit.title}
                      className="rounded-[24px] bg-gradient-to-br from-[#E8A317] via-[#E8E4DB] to-[#1B4D3E] p-px"
                    >
                      <div className="h-full rounded-[23px] bg-white p-6">
                        {inner}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={fit.title}
                      className="h-full rounded-[24px] border border-[#E8E4DB] bg-white p-6"
                    >
                      {inner}
                    </div>
                  );
                })}
              </Reveal>
            </SectionCard>

            <SectionCard labelledBy="profile-heading">
              <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div className="self-start">
                  <Reveal>
                    <p className={pillClass}>Profile</p>
                    <h2
                      id="profile-heading"
                      data-sticky-section
                      className={headingClass}
                    >
                      Make your profile <Highlight>complete</Highlight>
                    </h2>
                    <p className="mt-6 max-w-sm text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
                      A complete profile and CV help founders decide.
                    </p>
                    <Link href="/signup" className={cn(primaryCta, "mt-8")}>
                      Start your profile
                    </Link>
                  </Reveal>
                </div>

                <Reveal direction="right" delay={0.08}>
                  <div className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6 sm:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#1B4D3E]/15 pb-5">
                      <p className="text-base font-semibold text-[#0B1F1A]">
                        Student profile
                      </p>
                      <p className="text-sm font-semibold text-[#1B4D3E]">
                        Helps founders decide
                      </p>
                    </div>
                    <dl className="divide-y divide-[#1B4D3E]/15">
                      {profileFields.map((field) => (
                        <div
                          key={field.label}
                          className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                        >
                          <dt className="flex items-start gap-2 text-sm font-medium text-[#0B1F1A]">
                            <CheckCircle
                              aria-hidden="true"
                              weight="light"
                              size={18}
                              strokeWidth={1.5}
                              className="mt-0.5 shrink-0 text-[#1B4D3E]"
                            />
                            {field.label}
                          </dt>
                          <dd className="text-sm leading-6 text-[#0B1F1A]/70">
                            {field.detail}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 flex items-start gap-3 border-t border-[#1B4D3E]/15 pt-5 text-sm leading-6 text-[#0B1F1A]/70">
                      <Files
                        aria-hidden="true"
                        weight="light"
                        size={18}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-[#1B4D3E]"
                      />
                      <span>
                        <span className="font-semibold text-[#0B1F1A]">
                          Your CV:
                        </span>{" "}
                        PDF only, up to 5 MB, stored privately.
                      </span>
                    </p>
                  </div>
                </Reveal>
              </div>
            </SectionCard>

            <SectionCard labelledBy="rooted-heading">
              <Reveal className="mx-auto max-w-3xl text-center">
                <p className={pillClass}>Close to home</p>
                <h2
                  id="rooted-heading"
                  data-sticky-section
                  className={headingClass}
                >
                  Start close to <Highlight>home</Highlight>
                </h2>
                <p className={cn(bodyClass, "mx-auto mt-6 max-w-xl")}>
                  Built around Bhutanese students and founders; these photographs
                  show Bhutanese people in community settings, not platform
                  listings or members.
                </p>
              </Reveal>
              <Reveal className="mt-12">
                <figure>
                  <div className="relative isolate aspect-[16/10] w-full overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-[#F7F4EE] sm:aspect-[2/1]">
                    <Image
                      src="/images/bhutanese-community.jpg"
                      alt="Bhutanese boys in traditional gho sitting together"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="text-sm font-medium text-[#0B1F1A]">
                      Work grounded in the local community
                    </span>
                    <PhotoCredit fileUrl={DZONG_CREDIT} className="text-[#0B1F1A]/70" />
                  </figcaption>
                </figure>
              </Reveal>
            </SectionCard>

            <SectionCard labelledBy="apply-heading">
              <Reveal className="mx-auto max-w-3xl text-center">
                <p className={pillClass}>Apply</p>
                <h2
                  id="apply-heading"
                  data-sticky-section
                  className={headingClass}
                >
                  Browse, apply, and <Highlight>track</Highlight>
                </h2>
                <p className={cn(bodyClass, "mx-auto mt-6 max-w-xl")}>
                  Everything you need to browse and apply lives in your student
                  workspace.
                </p>
              </Reveal>
              <Reveal className="mt-12">
                <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {applicationSteps.map((step, index) => {
                    const StepIcon = step.Icon;
                    return (
                      <li
                        key={step.title}
                        className="rounded-[20px] border border-[#E8E4DB] bg-[#F7F4EE]/50 p-6"
                      >
                        <span className="inline-flex rounded-full bg-[#E8A317]/20 px-2.5 py-1 text-sm font-semibold tabular-nums text-[#0B1F1A]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mt-5 flex items-center gap-3 text-xl font-semibold leading-tight text-[#0B1F1A]">
                          <StepIcon
                            aria-hidden="true"
                            weight="light"
                            size={22}
                            strokeWidth={1.5}
                            className="shrink-0 text-[#1B4D3E]"
                          />
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[#0B1F1A]/70">
                          {step.body}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </Reveal>
            </SectionCard>

            <SectionCard labelledBy="pay-heading" className="pb-16">
              <Reveal className="mx-auto max-w-3xl text-center">
                <p className={pillClass}>Pay</p>
                <h2
                  id="pay-heading"
                  data-sticky-section
                  className={headingClass}
                >
                  Projects list a budget <Highlight>up front</Highlight>
                </h2>
                <p className={cn(bodyClass, "mx-auto mt-6 max-w-2xl")}>
                  Every paid project lists its budget range and scope before you
                  apply, and founders update project and applicant status as work
                  progresses.
                </p>
                <Link href="/faq" className={cn(quietLink, "mt-4")}>
                  Read the FAQ about pay
                </Link>
              </Reveal>
              <Reveal className="mt-12">
                <figure>
                  <div className="relative isolate aspect-[16/9] w-full overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-[#F7F4EE]">
                    <Image
                      src="/images/bhutanese-team.jpg"
                      alt="Bhutanese students in kira performing in national dress"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="text-sm font-medium text-[#0B1F1A]">
                      Work grounded in the local community
                    </span>
                    <PhotoCredit
                      fileUrl={PHOTO_CREDITS.market}
                      className="text-[#0B1F1A]/70"
                    />
                  </figcaption>
                </figure>
              </Reveal>
            </SectionCard>
          </StickySectionHeadings>
        </div>

        {/* Final CTA */}
        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <Reveal className="mx-auto max-w-[1120px]">
            <div className="relative isolate overflow-hidden rounded-[24px] border border-[#E8E4DB] bg-gradient-to-br from-[#E8E4DB] via-white to-[#E8A317]/25 px-6 py-14 text-center sm:px-12">
              <p className={pillClass}>Next step</p>
              <h2 className="mt-4 text-balance text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0B1F1A]">
                Your profile is the <Highlight>first step</Highlight>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#0B1F1A]/75 sm:text-base">
                Complete it once, then apply to projects that fit.
              </p>
              <Link href="/signup" className={cn(primaryCta, "mt-8")}>
                Create student account
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
