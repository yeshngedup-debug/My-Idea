/**
 * Student Profile — server component.
 * Loads the student's own profile row (never an id from the URL) and mints a
 * fresh signed URL for the CV on every render. Table access goes through typed
 * Neon helpers; identity and private files come from the auth/storage helpers.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { signCv } from '@/lib/storage';
import { getProfileRole, getStudentProfile, type Role } from '@/lib/neon-data';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';
import { ProfileForm, type StudentProfileData } from './profile-form';

export const metadata = { title: 'My Profile' };

const ROLE_HOME: Partial<Record<Role, string>> = {
  founder: '/founder',
  admin: '/admin',
};

export default async function StudentProfilePage() {
  const user = await getUser();

  if (!user) redirect('/login');

  // Defense in depth: the proxy already gates /student/*, but a Server
  // Component must not rely on navigation-level protection for its data.
  // redirect() throws, so it stays outside the try/catch below.
  let role: Role | null;
  try {
    role = await getProfileRole(user.id);
  } catch {
    return (
      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <ErrorState
          className="mx-auto max-w-3xl"
          headingLevel="h1"
          title="We could not check your account"
          description="Your account details are not available right now. Try again in a moment."
          action={
            <a
              href="/student/profile"
              className="inline-flex min-h-11 items-center rounded-lg bg-[#ff0063] px-5 py-3 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063]"
            >
              Try again
            </a>
          }
        />
      </section>
    );
  }

  if (role && role !== 'student') redirect(ROLE_HOME[role] ?? '/');

  if (!role) {
    return (
      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <EmptyState
          className="mx-auto max-w-3xl"
          headingLevel="h1"
          title="Finish setting up your account"
          description="Your account is not linked to a student profile yet. Try again after your profile is ready."
          action={
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-lg border border-[#b9dede] px-5 py-3 text-sm font-medium text-[#0b5c5c] transition-colors hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063]"
            >
              Go to home
            </Link>
          }
        />
      </section>
    );
  }

  let initial: StudentProfileData = {
    full_name: null,
    college: null,
    course: null,
    year: null,
    skills: [],
    bio: null,
    availability: null,
    cv_path: null,
  };

  let cvUrl: string | null = null;
  let cvPreviewUnavailable = false;

  let data: Awaited<ReturnType<typeof getStudentProfile>> = null;
  try {
    data = await getStudentProfile(user.id);
  } catch {
    return (
      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <ErrorState
          className="mx-auto max-w-3xl"
          headingLevel="h1"
          title="We could not load your profile"
          description="Your details are not available right now. Try again in a moment."
          action={
            <a
              href="/student/profile"
              className="inline-flex min-h-11 items-center rounded-lg bg-[#ff0063] px-5 py-3 text-sm font-semibold text-[#000000] transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063]"
            >
              Try again
            </a>
          }
        />
      </section>
    );
  }

  if (data) {
    initial = {
      full_name: data.full_name,
      college: data.college,
      course: data.course,
      year: data.year,
      skills: data.skills ?? [],
      bio: data.bio,
      availability: data.availability,
      cv_path: data.cv_path,
    };
  } else if (user.name) {
    initial = { ...initial, full_name: user.name };
  }

  // Signed URLs expire after an hour, so always mint a fresh one. A failed
  // mint is surfaced in the form rather than silently hidden.
  if (initial.cv_path) {
    try {
      cvUrl = await signCv(initial.cv_path, 60 * 60);
    } catch {
      cvUrl = null;
    }
    cvPreviewUnavailable = cvUrl === null;
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl space-y-7">
        <WorkspacePageHeading
          eyebrow="Student workspace"
          title="My Profile"
          description="Keep your details and CV current so founders can find you."
        />
        <ProfileForm
          initial={initial}
          cvUrl={cvUrl}
          cvPreviewUnavailable={cvPreviewUnavailable}
        />
      </div>
    </section>
  );
}
