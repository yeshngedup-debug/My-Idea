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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a4b00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]';

export function WorkspaceNav({ links }: { links: WorkspaceNavLink[] }) {
  const isActive = useActiveHref(links);

  return (
    <nav aria-label="Workspace navigation" className="hidden items-center gap-1 lg:flex">
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full border px-3 py-2 text-sm font-medium ${focusRing} ${
              active
                ? 'border-[#ded8cb] bg-[#fffefa] font-semibold text-[#18251f]'
                : 'border-transparent text-[#56645c] hover:text-[#18251f]'
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
      className="-mx-4 flex gap-2 overflow-x-auto border-b border-[#ded8cb] px-4 pb-3 pt-1 lg:hidden"
    >
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${focusRing} ${
              active
                ? 'border-[#17352b] bg-[#17352b] text-[#fffefa]'
                : 'border-[#ded8cb] bg-[#fffefa] text-[#56645c]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
