/**
 * SimpleLayout — server-only workspace chrome.
 * Header (brand + role badge + nav + account), one content container.
 * No client state lives here; only the nav's active marker is client-side.
 */
import Link from "next/link";
import { logout } from "@/features/auth/actions";
import { getUser } from "@/lib/auth";
import { getProfile } from "@/lib/neon-data";
import { Logo } from "@/components/ui/logo";
import { WorkspaceNav, WorkspaceMobileNav } from "./workspace-nav";
import { WorkspaceClock } from "./workspace-clock";
import pressStyles from "@/styles/pressable.module.css";

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  founder: "Founder",
  admin: "Admin",
};

export default async function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const profile = user ? await getProfile(user.id) : null;

  const roleLinks =
    profile?.role === "student"
      ? [
          { href: "/student", label: "Overview" },
          { href: "/student/projects", label: "Projects" },
          { href: "/student/applications", label: "Applications" },
          { href: "/student/profile", label: "Profile" },
        ]
      : profile?.role === "founder"
        ? [
            { href: "/founder", label: "Overview" },
            { href: "/founder/browse-students", label: "Find talent" },
            { href: "/founder/browse-projects", label: "Browse projects" },
            { href: "/founder/projects", label: "Projects" },
            { href: "/founder/shortlists", label: "Shortlists" },
            { href: "/founder/profile", label: "Profile" },
          ]
        : profile?.role === "admin"
          ? [
              { href: "/admin", label: "Overview" },
              { href: "/admin/students", label: "Students" },
              { href: "/admin/projects", label: "Projects" },
              { href: "/admin/payments", label: "Payments" },
            ]
          : [];

  const roleLabel = profile?.role
    ? (ROLE_LABEL[profile.role] ?? "Member")
    : null;

  return (
    <div className="min-h-screen bg-background text-primary">
      <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className={`flex shrink-0 items-center gap-2.5 rounded-lg ${pressStyles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
              >
                <Logo size="h-7 w-7" />
                <span className="truncate text-sm font-semibold tracking-tight text-primary sm:text-base">
                  Bhutan Tech Connect
                </span>
              </Link>
              {roleLabel && (
                <span className="hidden shrink-0 rounded-full border border-accent-deep/25 bg-accent-deep/8 px-2.5 py-1 text-xs font-semibold text-accent-deep sm:inline-flex">
                  {roleLabel}
                </span>
              )}
            </div>

            <WorkspaceNav links={roleLinks} />

            <div className="flex min-w-0 items-center gap-3">
              <WorkspaceClock />
              <span className="hidden max-w-36 truncate text-sm text-ink-soft sm:inline">
                {profile?.full_name ?? "Signed in"}
              </span>
              <form action={logout} className="inline">
                <button
                  type="submit"
                  className={`inline-flex min-h-9 items-center rounded-full border border-primary/20 bg-card px-4 py-2 text-xs font-semibold text-primary ${pressStyles.press} hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep sm:text-sm`}
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
          <WorkspaceMobileNav links={roleLinks} />
        </div>
      </header>
      <main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
