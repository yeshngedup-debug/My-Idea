import { MarketingReveal, SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { EditorialHero } from "@/components/marketing/editorial-hero";
import {
  Action,
  Band,
  Figure,
  LedgerRow,
  RuleLink,
  SectionHead,
  container,
  gutters,
  quietClass,
} from "@/components/marketing/editorial";
import { GsapScaleFadeImage } from "@/components/marketing/editorial-page-motion";
import { InlineImageText } from "@/components/editorial";
import { ScrubbedTextReveal } from "@/components/motion";
import { ChapterProgress, type ChapterLink } from "@/components/motion";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "For students",
  description:
    "Build a profile, browse paid projects, apply to projects that fit, and track every application in one place.",
  path: "/for-students",
});

const chapters: ChapterLink[] = [
  { id: "who", label: "Who it's for" },
  { id: "profile", label: "Profile" },
  { id: "rooted", label: "Close to home" },
  { id: "apply", label: "Apply" },
  { id: "pay", label: "Pay" },
];

const fits = [
  {
    title: "College students in Bhutan",
    body: "Study, build a profile, and apply around your term.",
  },
  {
    title: "Graduates building a portfolio",
    body: "Use paid projects to show what you can do.",
  },
  {
    title: "Students with flexible time",
    body: "Set your availability so founders know when you can work.",
  },
] as const;

const profileFields = [
  { label: "Full name", detail: "The name founders see on your profile" },
  { label: "College and course", detail: "Where you study and what you study" },
  { label: "Year of study", detail: "The year you are in now" },
  { label: "Availability", detail: "When you can take on project work" },
  { label: "Your skills", detail: "The skills you can do the work with" },
  { label: "A short bio", detail: "A few lines about you" },
  { label: "A PDF CV", detail: "PDF only, up to 5 MB, stored privately" },
] as const;

const applicationSteps = [
  {
    title: "Browse open projects",
    body: "Read the scope, skills, budget range, and deadline before you decide.",
  },
  {
    title: "Apply to the ones that fit",
    body: "You can send one application per project. A complete profile and CV help founders decide.",
  },
  {
    title: "Track every application",
    body: "Watch statuses move from pending to shortlisted, accepted, or rejected.",
  },
] as const;

export default function ForStudentsPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#0b2e2e]">
      <SiteHeader />

      <main id="main-content" className="w-full max-w-full overflow-x-clip">
        <EditorialHero
          index="01"
          eyebrow="For students"
          title={
            <>
              Turn your skills into{" "}
              <span className="text-[#0b5c5c]">paid work.</span>
            </>
          }
          lead="Build a profile, find a focused project, and get paid for the work you do."
          primaryCta={{ href: "/signup", label: "Create student account" }}
          secondary={{ href: "/how-it-works", label: "See how it works" }}
          image={{
            src: "/images/bhutanese-students.jpg",
            alt: "Young Bhutanese people working in groups at a training day in Thimphu",
          }}
          imagePosition="object-center"
        />

        {/* One statement, scrubbed in. The workspace holds every step. */}
        <Band tone="mist" className="border-b border-[#0b2e2e]/10">
          <div className={cn(container, gutters, "py-14 md:py-20")}>
            <p className="index-label">The student workspace</p>
            <ScrubbedTextReveal
              as="p"
              text="Everything you need to browse and apply lives in your student workspace."
              className="mt-6 max-w-[24ch] text-[clamp(1.75rem,3.6vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#0b2e2e] md:max-w-[28ch]"
            />
          </div>
        </Band>

        <ChapterProgress
          chapters={chapters}
          className="sticky top-16 z-30 border-[#0b2e2e]/12 bg-white [&_a]:text-[#0b2e2e] [&_a:hover]:text-[#0b5c5c] [&_a]:focus-visible:ring-[#0b5c5c] [&_a]:focus-visible:ring-offset-white [&_a[aria-current]]:text-[#0b5c5c] [&_a[aria-current]]:decoration-[#ff0063] [&_a[aria-current]]:decoration-1 [&_a[aria-current]]:underline-offset-[10px] [&_[data-chapter-bar]]:bg-[#ff0063]"
        />

        {/* Who it's for — three ruled columns, no cards. */}
        <Band id="who" labelledBy="who-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="02"
                eyebrow="Who it's for"
                id="who-heading"
                title="Built for students ready to begin"
                lead="You do not need a long work history. Clear skills and time for focused work are enough to begin."
              />
            </MarketingReveal>

            <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-[#0b2e2e]/15 sm:grid-cols-3">
              {fits.map((fit, index) => (
                <MarketingReveal
                  key={fit.title}
                  delay={index * 0.06}
                  className="border-b border-[#0b2e2e]/15 py-6 sm:border-b-0 sm:py-7"
                >
                  <li>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[#c2004b]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-[#0b2e2e]/15"
                      />
                    </div>
                    <h3 className="mt-4 text-[1.15rem] font-semibold leading-snug tracking-[-0.025em] text-[#0b2e2e]">
                      {fit.title}
                    </h3>
                    <p className="mt-2 max-w-[30ch] text-sm leading-6 text-[#356464]">
                      {fit.body}
                    </p>
                  </li>
                </MarketingReveal>
              ))}
            </ul>
          </div>
        </Band>

        {/* Profile — copy on the left, a ruled record on the right. */}
        <Band
          id="profile"
          tone="mist"
          labelledBy="profile-heading"
          className="border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-5">
                <p className="index-label">03 · Profile</p>
                <h2 id="profile-heading" className="display-lg mt-6 max-w-[13ch]">
                  Make your profile complete
                </h2>
                <p className="mt-6 max-w-[36ch] text-[15px] leading-7 text-[#356464]">
                  A complete profile and CV help founders decide. Fill in what
                  you can, and leave the rest until you are ready.
                </p>
                <div className="mt-9">
                  <Action href="/signup">Start your profile</Action>
                </div>
              </MarketingReveal>

              <MarketingReveal delay={0.08} className="lg:col-span-7">
                <div className="border-t border-[#0b2e2e]/20">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#0b2e2e]/12 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0b2e2e]">
                      Student profile
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c2004b]">
                      Helps founders decide
                    </p>
                  </div>
                  <dl>
                    {profileFields.map((field, index) => (
                      <div
                        key={field.label}
                        className="grid gap-1 border-b border-[#0b2e2e]/12 py-4 sm:grid-cols-[2rem_11rem_1fr] sm:items-baseline sm:gap-6"
                      >
                        <span
                          aria-hidden="true"
                          className="text-[11px] font-semibold tabular-nums tracking-[0.16em] text-[#c2004b]"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <dt className="text-sm font-semibold text-[#0b2e2e]">
                          {field.label}
                        </dt>
                        <dd className="text-sm leading-6 text-[#356464]">
                          {field.detail}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="pt-5 text-sm leading-6 text-[#356464]">
                    <span className="font-semibold text-[#0b2e2e]">
                      Your CV:
                    </span>{" "}
                    PDF only, up to 5 MB, stored privately and shared only
                    through short-lived signed links.
                  </p>
                </div>
              </MarketingReveal>
            </div>
          </div>
        </Band>

        {/* Close to home — inline typography image and one wide plate. */}
        <Band id="rooted" labelledBy="rooted-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <InlineImageText
                as="h2"
                id="rooted-heading"
                before="Start close to"
                imageSrc="/images/thimphu-housing.jpg"
                imageAlt="Public housing in Thimphu"
                after="home"
                accessibleLabel="Start close to home"
              />
            </MarketingReveal>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
              <MarketingReveal className="lg:col-span-5">
                <p className="max-w-[38ch] text-[15px] leading-7 text-[#356464]">
                  Built around Bhutanese students and founders. These
                  photographs show Bhutanese people and places, not platform
                  listings or members.
                </p>
              </MarketingReveal>
              <MarketingReveal delay={0.08} className="lg:col-span-7">
                <RuleLink href="/about">More about the platform</RuleLink>
              </MarketingReveal>
            </div>

            <MarketingReveal className="mt-12">
              <GsapScaleFadeImage>
                <Figure
                  src="/images/thimphu-city.jpg"
                  alt="View across central Thimphu, the capital of Bhutan"
                  ratio="aspect-[16/10] sm:aspect-[21/9]"
                  sizes="(max-width: 1024px) 100vw, 90vw"
                />
              </GsapScaleFadeImage>
            </MarketingReveal>
          </div>
        </Band>

        {/* Apply — a numbered ledger. */}
        <Band
          id="apply"
          tone="mist"
          labelledBy="apply-heading"
          className="border-y border-[#0b2e2e]/10"
        >
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <MarketingReveal>
              <SectionHead
                index="05"
                eyebrow="Apply"
                id="apply-heading"
                title="Browse, apply, and track"
                lead="Everything you need to browse and apply lives in your student workspace."
              />
            </MarketingReveal>

            <ol className="mt-12 border-t border-[#0b2e2e]/15">
              {applicationSteps.map((step, index) => (
                <LedgerRow
                  key={step.title}
                  index={String(index + 1).padStart(2, "0")}
                  title={step.title}
                >
                  {step.body}
                </LedgerRow>
              ))}
            </ol>
          </div>
        </Band>

        {/* Pay — the brief carries the budget. */}
        <Band id="pay" labelledBy="pay-heading">
          <div className={cn(container, gutters, "py-16 md:py-24")}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <MarketingReveal className="lg:col-span-5">
                <p className="index-label">06 · Pay</p>
                <h2 id="pay-heading" className="display-lg mt-6 max-w-[12ch]">
                  Projects list a budget up front
                </h2>
                <p className="mt-6 max-w-[36ch] text-[15px] leading-7 text-[#356464]">
                  Every paid project lists its budget range and scope before you
                  apply, and founders update project and applicant status as work
                  progresses.
                </p>
                <div className="mt-9 border-t border-[#0b2e2e]/12 pt-6">
                  <RuleLink href="/faq">Read the FAQ about pay</RuleLink>
                </div>
              </MarketingReveal>
              <MarketingReveal delay={0.08} className="lg:col-span-7">
                <Figure
                  src="/images/thimphu-bank.jpg"
                  alt="The Bhutan Post and Bhutan Bank building in central Thimphu"
                  ratio="aspect-[16/10]"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </MarketingReveal>
            </div>
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
                Your profile is the first step.
              </h2>
              <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#0b2e2e]">
                Complete it once, then apply to projects that fit.
              </p>
            </MarketingReveal>
            <MarketingReveal
              delay={0.08}
              className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end"
            >
              <Action href="/signup">Create student account</Action>
              <RuleLink
                href="/for-founders"
                className={cn(quietClass, "decoration-[#0b2e2e]/30 hover:decoration-[#0b2e2e]")}
              >
                See the founder path
              </RuleLink>
            </MarketingReveal>
          </div>
        </Band>
      </main>

      <SiteFooter />
    </div>
  );
}
