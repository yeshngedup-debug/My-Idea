'use client';

/** Read-only account facts and own-project counts. Icons stay client-side. */
import { Briefcase, CalendarBlank, UserCircle } from '@phosphor-icons/react';

export interface ProjectCount {
  value: string;
  label: string;
  count: number;
}

export function ProfileDetails({
  fullName,
  role,
  accountCreated,
  total,
  counts,
}: {
  fullName: string;
  role: string;
  accountCreated: string;
  total: number;
  counts: ProjectCount[];
}) {
  return (
    <>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-accent">Account</h2>
        <dl className="mt-3 divide-y divide-border border-t border-border text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <dt className="inline-flex min-h-6 items-center gap-2 text-body-secondary">
              <UserCircle size={16} aria-hidden="true" className="shrink-0" />
              Name
            </dt>
            <dd className="break-words font-medium text-accent">
              {fullName || 'Not set'}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <dt className="inline-flex min-h-6 items-center gap-2 text-body-secondary">
              <Briefcase size={16} aria-hidden="true" className="shrink-0" />
              Role
            </dt>
            <dd className="font-medium capitalize text-accent">{role}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <dt className="inline-flex min-h-6 items-center gap-2 text-body-secondary">
              <CalendarBlank size={16} aria-hidden="true" className="shrink-0" />
              Account created
            </dt>
            <dd className="font-medium tabular-nums text-accent">
              {accountCreated}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-accent">Your projects</h2>
        <dl className="mt-3 divide-y divide-border border-t border-border text-sm">
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-body-secondary">Projects posted</dt>
            <dd className="font-semibold tabular-nums text-accent">{total}</dd>
          </div>
          {counts.map((item) => (
            <div
              key={item.value}
              className="flex items-baseline justify-between gap-4 py-2.5"
            >
              <dt className="text-body-secondary">{item.label}</dt>
              <dd className="font-medium tabular-nums text-accent">
                {item.count}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
