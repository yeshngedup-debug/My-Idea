'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface WorkspaceNavLink {
  href: string;
  label: string;
}

/** Active state comes from the real pathname, never from local state. */
function useActiveHref(links: WorkspaceNavLink[]) {
  const pathname = usePathname();
  const baseHref = links[0]?.href ?? '';

  return (href: string) =>
    pathname === href ||
    (href !== baseHref && pathname.startsWith(`${href}/`));
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff]';

export function WorkspaceNav({ links }: { links: WorkspaceNavLink[] }) {
  const isActive = useActiveHref(links);

  return (
    <nav aria-label="Workspace navigation" className="hidden items-center gap-2 lg:flex">
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:active:scale-100 ${focusRing} ${
              active
                ? 'border-[#b9dede]/90 bg-white font-semibold text-[#0b5c5c] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]'
                : 'border-transparent text-[#356464] hover:bg-white/70 hover:text-[#0b5c5c]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceMobileNav({ links }: { links: WorkspaceNavLink[] }) {
  const isActive = useActiveHref(links);

  return (
    <nav
      aria-label="Workspace navigation"
      className="-mx-4 flex gap-2 overflow-x-auto border-b border-[#b9dede] px-4 pb-3 pt-1 lg:hidden"
    >
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:active:scale-100 ${focusRing} ${
              active
                ? 'border-[#66bfbf] bg-[#66bfbf] text-[#0b2e2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]'
                : 'border-[#b9dede]/90 bg-white/90 text-[#356464]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
