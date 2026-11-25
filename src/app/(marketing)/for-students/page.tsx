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
import { GsapScaleFadeImage } from "@/components/marketing/editorial-page-motion";
import { InlineImageText } from "@/components/editorial";
import { ScrubbedTextReveal } from "@/components/motion";
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
  "--color-background": "#eaf6f6",
  "--color-foreground": "#0b2e2e",
  "--color-card": "#FFFFFF",
  "--color-border": "#b9dede",
  "--color-body-secondary": "#0b2e2e",
  "--color-accent": "#ff0063",
} as CSSProperties;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d8c8c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]";
const primaryCta = `inline-flex min-h-11 items-center justify-center rounded-full bg-[#ff0063] px-6 py-3 text-sm font-semibold text-[#000000] transition-colors duration-150 hover:bg-[#d40054]/85 motion-reduce:transition-none ${focusRing}`;
const quietLink = `inline-flex min-h-11 items-center text-sm font-semibold text-[#0b5c5c] underline decoration-[#0b5c5c]/30 underline-offset-4 transition-colors hover:text-[#0b2e2e] motion-reduce:transition-none ${focusRing}`;
const bandClass =
  "w-full max-w-full overflow-x-hidden px-5 py-32 sm:px-8 md:py-48 lg:px-12";
const headingClass =
  "text-balance text-left text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0b2e2e]";
const bodyClass =
  "max-w-2xl text-base leading-7 text-[#0b2e2e]/75 sm:text-lg sm:leading-8";
const bentoClass =
  "grid w-full max-w-full grid-cols-12 grid-flow-dense gap-4";
const imageZoom =
  "object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";

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
      className={cn(bandClass, className)}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
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
      <main
        id="main-content"
        className="w-full max-w-full overflow-x-hidden bg-[#eaf6f6] text-[#0b2e2e]"
      >
        {/* Editorial split hero: copy left, one credited photograph right. */}
        <section className="w-full max-w-full overflow-x-hidden px-5 pt-10 sm:px-8 lg:px-12 lg:pt-14">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
              <HeroCopyEntrance>
                <h1 className="w-full max-w-6xl text-balance text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0b2e2e]">
                  Turn your skills into paid work.
                </h1>
                <p className="mt-8 max-w-xl text-base leading-7 text-[#0b2e2e]/75 sm:text-lg sm:leading-8">
                  Build a profile, find a focused project, and get paid for the
                  work you do.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href="/signup" className={primaryCta}>
                    Create student account
                  </Link>
                  <Link href="/how-it-works" className={quietLink}>
                    See how it works
                  </Link>
                </div>
              </HeroCopyEntrance>

              <HeroPhotoEntrance>
                <figure className="group relative isolate aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] border border-[#b9dede] bg-[#0b2e2e]">
                  <Image
                    src="/images/bhutanese-students.jpg"
                    alt="Young Bhutanese people working in groups at a training day in Thimphu"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className={cn(
                      "grayscale contrast-[1.15] opacity-90",
                      imageZoom,
                    )}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 50% 10%, transparent 25%, rgb(11 31 26 / 0.78) 100%)",
                    }}
                  />
                  <figcaption className="absolute inset-x-5 bottom-4 sm:inset-x-7 sm:bottom-5">
                    <PhotoCredit
                      fileUrl={YOUTH_CREDIT}
                      className="text-[#eaf6f6]/90"
                    />
                  </figcaption>
                </figure>
              </HeroPhotoEntrance>
            </div>
          </div>
        </section>

        {/* One scrubbed statement, away from the hero. */}
        <section className={bandClass}>
          <div className="mx-auto w-full max-w-6xl">
            <ScrubbedTextReveal
              as="p"
              text="Everything you need to browse and apply lives in your student workspace."
              className="max-w-4xl text-balance text-[clamp(1.75rem,3.5vw,3rem)] font-medium leading-tight tracking-[-0.03em] text-[#0b5c5c]"
            />
          </div>
        </section>

        <div style={stickyVars}>
          <StickySectionHeadings
            title="For students"
            sections={sections}
            navLabel="Student guide sections"
          >
            <SectionCard labelledBy="who-heading">
              <Reveal className="mx-auto max-w-5xl">
                <h2 id="who-heading" data-sticky-section className={headingClass}>
                  Built for students ready to begin
                </h2>
                <p className={cn(bodyClass, "mt-6")}>
                  You do not need a long work history. Clear skills and time for
                  focused work are enough to begin.
                </p>
              </Reveal>
              <div className={cn(bentoClass, "mt-14")}>
                {fits.map((fit) => {
                  const FitIcon = fit.Icon;
                  return (
                    <article
                      key={fit.title}
                      className="col-span-12 rounded-[1.25rem] border border-[#b9dede] bg-white p-6 md:col-span-6 lg:col-span-4 sm:p-8"
                    >
                      <FitIcon
                        aria-hidden="true"
                        weight="light"
                        size={24}
                        strokeWidth={1.5}
                        className="text-[#0b5c5c]"
                      />
                      <h3 className="mt-6 text-lg font-semibold text-[#0b2e2e]">
                        {fit.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#0b2e2e]/70">
                        {fit.body}
                      </p>
                    </article>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard labelledBy="profile-heading">
              <div className="grid w-full max-w-full grid-cols-12 gap-4">
                <Reveal className="col-span-12 lg:col-span-5">
                  <h2
                    id="profile-heading"
                    data-sticky-section
                    className={headingClass}
                  >
                    Make your profile complete
                  </h2>
                  <p className={cn(bodyClass, "mt-6")}>
                    A complete profile and CV help founders decide.
                  </p>
                  <Link href="/signup" className={cn(primaryCta, "mt-8")}>
                    Start your profile
                  </Link>
                </Reveal>

                <Reveal
                  direction="right"
                  delay={0.08}
                  className="col-span-12 lg:col-span-7"
                >
                  <div className="rounded-[1.25rem] border border-[#b9dede] bg-white p-6 sm:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#b9dede]/15 pb-5">
                      <p className="text-base font-semibold text-[#0b2e2e]">
                        Student profile
                      </p>
                      <p className="text-sm font-semibold text-[#0b5c5c]">
                        Helps founders decide
                      </p>
                    </div>
                    <dl className="divide-y divide-[#0b5c5c]/15">
                      {profileFields.map((field) => (
                        <div
                          key={field.label}
                          className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                        >
                          <dt className="flex items-start gap-2 text-sm font-medium text-[#0b2e2e]">
                            <CheckCircle
                              aria-hidden="true"
                              weight="light"
                              size={18}
                              strokeWidth={1.5}
                              className="mt-0.5 shrink-0 text-[#0b5c5c]"
                            />
                            {field.label}
                          </dt>
                          <dd className="text-sm leading-6 text-[#0b2e2e]/70">
                            {field.detail}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 flex items-start gap-3 border-t border-[#b9dede]/15 pt-5 text-sm leading-6 text-[#0b2e2e]/70">
                      <Files
                        aria-hidden="true"
                        weight="light"
                        size={18}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-[#0b5c5c]"
                      />
                      <span>
                        <span className="font-semibold text-[#0b2e2e]">
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
              <div id="rooted-heading" data-sticky-section>
                <InlineImageText
                  as="h2"
                  before="Start close to"
                  imageSrc="/images/bhutanese-community.jpg"
                  imageAlt="Bhutanese boys in traditional gho sitting together"
                  creditFileUrl={DZONG_CREDIT}
                  after="home"
                  accessibleLabel="Start close to home"
                />
              </div>
              <Reveal className="mx-auto mt-10 max-w-2xl">
                <p className={bodyClass}>
                  Built around Bhutanese students and founders; these photographs
                  show Bhutanese people in community settings, not platform
                  listings or members.
                </p>
              </Reveal>
              <Reveal className="mt-14">
                <GsapScaleFadeImage>
                  <figure className="group relative isolate aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-[#0b2e2e] sm:aspect-[2/1]">
                    <Image
                      src="/images/bhutanese-community.jpg"
                      alt="Bhutanese boys in traditional gho sitting together"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className={imageZoom}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0b2e2e]/85 via-transparent to-transparent"
                    />
                    <figcaption className="absolute inset-x-5 bottom-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 sm:inset-x-7 sm:bottom-5">
                      <span className="text-sm font-medium text-[#eaf6f6]">
                        Work grounded in the local community
                      </span>
                      <PhotoCredit
                        fileUrl={DZONG_CREDIT}
                        className="text-[#eaf6f6]/90"
                      />
                    </figcaption>
                  </figure>
                </GsapScaleFadeImage>
              </Reveal>
            </SectionCard>

            <SectionCard labelledBy="apply-heading">
              <Reveal className="mx-auto max-w-5xl">
                <h2
                  id="apply-heading"
                  data-sticky-section
                  className={headingClass}
                >
                  Browse, apply, and track
                </h2>
                <p className={cn(bodyClass, "mt-6")}>
                  Everything you need to browse and apply lives in your student
                  workspace.
                </p>
              </Reveal>
              <div className={cn(bentoClass, "mt-14")}>
                {applicationSteps.map((step, index) => {
                  const StepIcon = step.Icon;
                  return (
                    <article
                      key={step.title}
                      className="col-span-12 rounded-[1.25rem] border border-[#b9dede] bg-white p-6 md:col-span-6 lg:col-span-4 sm:p-8"
                    >
                      <span className="text-sm font-semibold tabular-nums text-[#0b5c5c]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-6 flex items-center gap-3 text-xl font-semibold leading-tight text-[#0b2e2e]">
                        <StepIcon
                          aria-hidden="true"
                          weight="light"
                          size={22}
                          strokeWidth={1.5}
                          className="shrink-0 text-[#0b5c5c]"
                        />
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#0b2e2e]/70">
                        {step.body}
                      </p>
                    </article>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard labelledBy="pay-heading">
              <Reveal className="mx-auto max-w-5xl">
                <h2 id="pay-heading" data-sticky-section className={headingClass}>
                  Projects list a budget up front
                </h2>
                <p className={cn(bodyClass, "mt-6")}>
                  Every paid project lists its budget range and scope before you
                  apply, and founders update project and applicant status as work
                  progresses.
                </p>
                <Link href="/faq" className={cn(quietLink, "mt-4")}>
                  Read the FAQ about pay
                </Link>
              </Reveal>
              <Reveal className="mt-14">
                <GsapScaleFadeImage>
                  <figure className="group relative isolate aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-[#0b2e2e]">
                    <Image
                      src="/images/bhutanese-team.jpg"
                      alt="Bhutanese students in kira performing in national dress"
                      fill
                      sizes="(max-width: 1024px) 100vw, 90vw"
                      className={imageZoom}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0b2e2e]/85 via-transparent to-transparent"
                    />
                    <figcaption className="absolute inset-x-5 bottom-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 sm:inset-x-7 sm:bottom-5">
                      <span className="text-sm font-medium text-[#eaf6f6]">
                        Work grounded in the local community
                      </span>
                      <PhotoCredit
                        fileUrl={PHOTO_CREDITS.market}
                        className="text-[#eaf6f6]/90"
                      />
                    </figcaption>
                  </figure>
                </GsapScaleFadeImage>
              </Reveal>
            </SectionCard>
          </StickySectionHeadings>
        </div>

        {/* Closing band: one saffron action. */}
        <section className="w-full max-w-full overflow-x-hidden px-5 pb-16 sm:px-8 lg:px-12">
          <Reveal className="mx-auto w-full max-w-6xl">
            <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-[#b9dede] bg-white px-6 py-24 text-left sm:px-12">
              <h2 className="text-balance text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0b2e2e]">
                Your profile is the first step
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#0b2e2e]/75 sm:text-lg">
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
