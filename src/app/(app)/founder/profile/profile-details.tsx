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
      <section className="rounded-xl border border-[#b9dede] bg-[#ffffff] p-4 sm:p-5">
        <h2 className="text-base font-semibold text-[#0b5c5c]">Account</h2>
        <dl className="mt-3 divide-y divide-[#b9dede] border-t border-[#b9dede] text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <dt className="inline-flex min-h-6 items-center gap-2 text-[#356464]">
              <UserCircle size={16} aria-hidden="true" className="shrink-0" />
              Name
            </dt>
            <dd className="break-words font-medium text-[#0b5c5c]">
              {fullName || 'Not set'}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <dt className="inline-flex min-h-6 items-center gap-2 text-[#356464]">
              <Briefcase size={16} aria-hidden="true" className="shrink-0" />
              Role
            </dt>
            <dd className="font-medium capitalize text-[#0b5c5c]">{role}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <dt className="inline-flex min-h-6 items-center gap-2 text-[#356464]">
              <CalendarBlank size={16} aria-hidden="true" className="shrink-0" />
              Account created
            </dt>
            <dd className="font-medium tabular-nums text-[#0b5c5c]">
              {accountCreated}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-[#b9dede] bg-[#ffffff] p-4 sm:p-5">
        <h2 className="text-base font-semibold text-[#0b5c5c]">Your projects</h2>
        <dl className="mt-3 divide-y divide-[#b9dede] border-t border-[#b9dede] text-sm">
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-[#356464]">Projects posted</dt>
            <dd className="font-semibold tabular-nums text-[#0b5c5c]">{total}</dd>
          </div>
          {counts.map((item) => (
            <div
              key={item.value}
              className="flex items-baseline justify-between gap-4 py-2.5"
            >
              <dt className="text-[#356464]">{item.label}</dt>
              <dd className="font-medium tabular-nums text-[#0b5c5c]">
                {item.count}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
