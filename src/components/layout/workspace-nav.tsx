'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/pressable.module.css';

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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-background';

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
            className={`rounded-full border px-3.5 py-2 text-sm font-medium ${styles.press} ${focusRing} ${
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-transparent text-ink-soft hover:border-border hover:bg-card hover:text-primary'
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
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden"
    >
      {links.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${styles.press} ${focusRing} ${
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-ink-soft'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
