import Image from "next/image";
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
import { CtaBand } from "@/components/marketing/cta-band";
import { PhotoCredit } from "@/components/ui/photo-credit";
import { Reveal } from "@/components/ui/motion";
import { GuideHero } from "@/components/marketing/guides/guide-hero";
import {
  Chapter,
  TextLink,
  ActionLink,
} from "@/components/marketing/guides/primitives";
import {
  StickySectionHeadings,
  type StickySection,
} from "@/components/layout/sticky-section-headings";
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

const sections: StickySection[] = [
  { id: "who-heading", label: "Who it's for" },
  { id: "profile-heading", label: "Profile" },
  { id: "rooted-heading", label: "Close to home" },
  { id: "apply-heading", label: "Apply" },
  { id: "pay-heading", label: "Pay" },
];

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
        className="overflow-x-clip bg-[#f5f2ea] text-[#18251f]"
      >
        <GuideHero
          title={
            <>
              Turn your skills into{" "}
              <span className="text-[#b23c26]">paid work.</span>
            </>
          }
          lead="Build a profile, find a focused project, and get paid for the work you do."
          primary={{ href: "/signup", label: "Create student account" }}
          secondary={{ href: "/how-it-works", label: "See how it works" }}
          image="/images/bhutanese-students.jpg"
          imageAlt="Young Bhutanese people working in groups at a training day in Thimphu"
          creditFileUrl="https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg"
          reverse
        />

        <StickySectionHeadings
          title="For students"
          eyebrow="Student guide"
          sections={sections}
          navLabel="Student guide sections"
        >
        <Chapter labelledBy="who-heading">
          <Reveal className="max-w-3xl">
            <h2
              id="who-heading"
              data-sticky-section
              className="max-w-2xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
            >
              Built for students ready to begin
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#56645c] sm:text-base">
              You do not need a long work history. Clear skills and time for
              focused work are enough to begin.
            </p>
          </Reveal>
          <ul className="mt-12 max-w-2xl space-y-8">
            {fits.map((fit) => {
              const FitIcon = fit.Icon;
              return (
                <li key={fit.title} className="flex gap-5">
                  <FitIcon
                    aria-hidden="true"
                    weight="light"
                    size={24}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-[#56645c]"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-[#17352b]">
                      {fit.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#56645c]">
                      {fit.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Chapter>

        <Chapter labelledBy="profile-heading">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="self-start">
              <Reveal>
                <h2
                  id="profile-heading"
                  data-sticky-section
                  className="max-w-2xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl lg:text-6xl"
                >
                  Make your profile complete
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-7 text-[#56645c] sm:text-base">
                  A complete profile and CV help founders decide.
                </p>
                <ActionLink href="/signup" className="mt-8">
                  Start your profile
                </ActionLink>
              </Reveal>
            </div>

            <Reveal direction="right" delay={0.08}>
              <div className="rounded-2xl border border-[#17352b]/15 bg-[#fffefa] p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#17352b]/10 pb-5">
                  <p className="text-base font-semibold text-[#17352b]">
                    Student profile
                  </p>
                  <p className="text-sm font-semibold text-[#b23c26]">
                    Helps founders decide
                  </p>
                </div>
                <dl className="divide-y divide-[#17352b]/10">
                  {profileFields.map((field) => (
                    <div
                      key={field.label}
                      className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                    >
                      <dt className="flex items-start gap-2 text-sm font-medium text-[#17352b]">
                        <CheckCircle
                          aria-hidden="true"
                          weight="light"
                          size={18}
                          strokeWidth={1.5}
                          className="mt-0.5 shrink-0 text-[#b23c26]"
                        />
                        {field.label}
                      </dt>
                      <dd className="text-sm leading-6 text-[#56645c]">
                        {field.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-start gap-3 border-t border-[#17352b]/10 pt-5 text-sm leading-6 text-[#56645c]">
                  <Files
                    aria-hidden="true"
                    weight="light"
                    size={18}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-[#b23c26]"
                  />
                  <span>
                    <span className="font-semibold text-[#17352b]">
                      Your CV:
                    </span>{" "}
                    PDF only, up to 5 MB, stored privately.
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </Chapter>

        <Chapter labelledBy="rooted-heading">
          <Reveal className="max-w-3xl">
            <h2
              id="rooted-heading"
              data-sticky-section
              className="max-w-sm text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl"
            >
              Start close to home
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#56645c] sm:text-base">
              Built around Bhutanese students and founders; these photographs
              show Bhutanese people in community settings, not platform listings
              or members.
            </p>
          </Reveal>
          <Reveal className="mt-12">
            <figure className="relative isolate aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-[#fffefa] sm:aspect-[2/1]">
              <Image
                src="/images/bhutanese-community.jpg"
                alt="Bhutanese boys in traditional gho sitting together"
                fill
                sizes="(max-width: 1024px) 100vw, 90vw"
                className="object-cover"
              />
            </figure>
            <div className="mt-4 flex justify-end">
              <PhotoCredit fileUrl={DZONG_CREDIT} className="text-[#56645c]" />
            </div>
          </Reveal>
        </Chapter>

        <Chapter labelledBy="apply-heading" tone="surface">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="self-start">
              <Reveal>
                <h2
                  id="apply-heading"
                  data-sticky-section
                  className="max-w-sm text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#17352b] sm:text-5xl"
                >
                  Browse, apply, and track
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-7 text-[#56645c] sm:text-base">
                  Everything you need to browse and apply lives in your student
                  workspace.
                </p>
              </Reveal>
            </div>
            <ol className="space-y-10">
              {applicationSteps.map((step, index) => {
                const StepIcon = step.Icon;
                return (
                  <li
                    key={step.title}
                    className="grid gap-3 sm:grid-cols-[5rem_1fr] sm:gap-8"
                  >
                    <span className="text-4xl font-semibold tracking-[-0.05em] text-[#b23c26] tabular-nums sm:text-5xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-3 text-2xl font-semibold leading-tight text-[#17352b] sm:text-3xl">
                        <StepIcon
                          aria-hidden="true"
                          weight="light"
                          size={22}
                          strokeWidth={1.5}
                          className="shrink-0 text-[#56645c]"
                        />
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-base leading-7 text-[#56645c]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Chapter>

        <Chapter labelledBy="pay-heading">
          <Reveal className="max-w-3xl">
            <h2
              id="pay-heading"
              data-sticky-section
              className="max-w-3xl text-balance text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[#17352b]"
            >
              Projects list a budget up front
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#56645c] sm:text-base">
              Every paid project lists its budget range and scope before you
              apply, and founders update project and applicant status as work
              progresses.
            </p>
            <TextLink href="/faq" className="mt-6">
              Read the FAQ about pay
            </TextLink>
          </Reveal>
        </Chapter>
        </StickySectionHeadings>

        <CtaBand
          title="Your profile is the first step"
          lead="Complete it once, then apply to projects that fit."
          href="/signup"
          label="Create student account"
        />
      </main>
      <SiteFooter />
    </>
  );
}
