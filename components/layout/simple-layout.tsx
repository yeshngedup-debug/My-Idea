/**
 * SimpleLayout — server-only workspace chrome.
 * Header (brand + role badge + nav + account), one content container.
 * No client state lives here; only the nav's active marker is client-side.
 */
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import { WorkspaceNav, WorkspaceMobileNav } from "./workspace-nav";
import pressStyles from "../ui/pressable.module.css";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
    : { data: null };

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
            { href: "/founder/projects", label: "Projects" },
            { href: "/founder/shortlists", label: "Shortlists" },
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
    <div className="min-h-screen bg-[#f5f2ea] text-[#17352b]">
      <header className="sticky top-0 z-30 border-b border-[#ded8cb] bg-[#f5f2ea]/92 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className={`flex shrink-0 items-center gap-2.5 rounded-lg ${pressStyles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]`}
              >
                <Logo size="h-7 w-7" />
                <span className="truncate text-sm font-semibold tracking-tight text-[#17352b] sm:text-base">
                  Bhutan Tech Connect
                </span>
              </Link>
              {roleLabel && (
                <span className="hidden shrink-0 rounded-full border border-[#b23c26]/25 bg-[#b23c26]/8 px-2.5 py-1 text-xs font-semibold text-[#b23c26] sm:inline-flex">
                  {roleLabel}
                </span>
              )}
            </div>

            <WorkspaceNav links={roleLinks} />

            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden max-w-36 truncate text-sm text-[#4c5a52] sm:inline">
                {profile?.full_name ?? "Signed in"}
              </span>
              <form action={logout} className="inline">
                <button
                  type="submit"
                  className={`inline-flex min-h-9 items-center rounded-full border border-[#17352b]/20 bg-[#fffefa] px-4 py-2 text-xs font-semibold text-[#17352b] ${pressStyles.press} hover:border-[#17352b] hover:bg-[#17352b] hover:text-[#fffefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] sm:text-sm`}
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
