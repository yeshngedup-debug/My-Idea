'use client';

/**
 * Dashboard shell — AdminCN-style layout adapted to the dark+amber brand:
 * fixed sidebar with nav + user block (desktop), floating rounded header bar,
 * slide-over nav on mobile. Logout is wired to the real server action.
 */
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Mountain, X, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  founder: 'Founder',
  admin: 'Admin',
};

function initials(name: string | null) {
  if (!name) return 'BT';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function DashboardShell({
  role,
  title,
  nav,
  userName,
  children,
}: {
  role: 'student' | 'founder' | 'admin';
  title: string;
  nav: NavItem[];
  userName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navList = (
    <>
      <div className="flex items-center gap-2 px-3 h-14 shrink-0">
        <Mountain className="w-5 h-5 text-amber-400" />
        <span className="font-extrabold tracking-tight text-sm">Bhutan Tech Connect</span>
      </div>
      <p className="px-3 pt-4 pb-1 text-[11px] uppercase tracking-widest text-white/30">
        {ROLE_LABEL[role]} menu
      </p>
      <nav className="flex-1 space-y-1 px-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                active
                  ? 'bg-amber-400/10 text-amber-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 mt-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-400/15 text-amber-300 text-xs font-extrabold flex items-center justify-center shrink-0">
            {initials(userName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{userName ?? 'Signed in'}</p>
            <p className="text-xs text-white/40">{ROLE_LABEL[role]} account</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#0f0e13] border-r border-white/5 flex-col z-30">
        {navList}
      </aside>

      {/* Mobile slide-over */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#0f0e13] border-r border-white/10 flex flex-col animate-in slide-in-from-left duration-200">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
            {navList}
          </div>
        </div>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Floating rounded header bar */}
        <header className="sticky top-0 z-40 px-3 sm:px-5 pt-3">
          <div className="rounded-xl border border-white/10 bg-[#13111a]/85 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-1 rounded-lg text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-semibold text-white/80 truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-extrabold flex items-center justify-center">
                  {initials(userName)}
                </span>
                <span className="text-sm text-white/70 max-w-32 truncate">{userName ?? ''}</span>
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
