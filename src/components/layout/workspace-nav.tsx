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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff]';

const itemBase =
  'inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none';

/**
 * Desktop workspace navigation. One row of square-edged items: the current
 * page is filled teal with white text, every peer is quiet ink. No pills, no
 * gradients, no entrance motion.
 */
export function WorkspaceNav({ links }: { links: WorkspaceNavLink[] }) {
  const isActive = useActiveHref(links);

  if (links.length === 0) return null;

  return (
    <nav aria-label="Workspace navigation" className="hidden items-center gap-1 lg:flex">
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`${itemBase} ${focusRing} ${
              active
                ? 'bg-[#0b5c5c] font-semibold text-[#ffffff]'
                : 'text-[#356464] hover:bg-[#eaf6f6] hover:text-[#0b5c5c]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile workspace navigation. A single scrollable strip under the header:
 * every role link stays one tap away at 360px, and the current page is marked
 * with `aria-current` plus a filled teal block.
 */
export function WorkspaceMobileNav({ links }: { links: WorkspaceNavLink[] }) {
  const isActive = useActiveHref(links);

  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="-mx-4 flex gap-1 overflow-x-auto border-t border-[#b9dede] px-4 pb-2 pt-2 lg:hidden"
    >
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`${itemBase} shrink-0 ${focusRing} ${
              active
                ? 'bg-[#0b5c5c] font-semibold text-[#ffffff]'
                : 'text-[#356464] hover:bg-[#eaf6f6] hover:text-[#0b5c5c]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
