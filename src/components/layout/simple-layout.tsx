/**
 * SimpleLayout — server-only workspace chrome.
 * Header (brand + role badge + nav + account), one content container.
 * No client state lives here; only the nav's active marker is client-side.
 *
 * The shell stays compact on a 360px screen: the brand truncates, the role is
 * a single chip, and the account/logout control is always reachable. The
 * decorative workspace clock was removed — it carried no information the
 * workspace needed and cost horizontal room.
 */
import Link from "next/link";
import { logout } from "@/features/auth/actions";
import { getUser } from "@/lib/auth";
import { getProfile } from "@/lib/neon-data";
import { Logo } from "@/components/ui/logo";
import { WorkspaceNav, WorkspaceMobileNav } from "./workspace-nav";

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
            { href: "/founder/projects", label: "My projects" },
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
    <div className="min-h-[100dvh] bg-secondary text-foreground">
      {/* One quiet work bar: a hairline edge, a solid white field and no
          floating pill, blur stack or decorative chrome. */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[56px] items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="pressable flex min-h-11 min-w-0 shrink items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Logo size="h-6 w-6" />
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  Bhutan Tech Connect
                </span>
              </Link>
              {roleLabel && (
                <span className="shrink-0 rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-semibold leading-4 text-accent">
                  {roleLabel}
                </span>
              )}
            </div>

            <WorkspaceNav links={roleLinks} />

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden max-w-40 truncate text-sm text-body-secondary xl:inline">
                {profile?.full_name ?? "Signed in"}
              </span>
              <form action={logout} className="inline">
                <button
                  type="submit"
                  className="pressable inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:border-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
