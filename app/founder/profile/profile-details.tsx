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
  memberSince,
  total,
  counts,
}: {
  fullName: string;
  role: string;
  memberSince: string;
  total: number;
  counts: ProjectCount[];
}) {
  return (
    <>
      <section className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-[#17352b]">Account</h2>
        <dl className="mt-4 divide-y divide-[#ded8cb] border-t border-[#ded8cb] text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <dt className="inline-flex min-h-6 items-center gap-2 text-[#657069]">
              <UserCircle size={16} aria-hidden="true" className="shrink-0" />
              Name
            </dt>
            <dd className="break-words font-medium text-[#17352b]">
              {fullName || 'Not set'}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <dt className="inline-flex min-h-6 items-center gap-2 text-[#657069]">
              <Briefcase size={16} aria-hidden="true" className="shrink-0" />
              Role
            </dt>
            <dd className="font-medium capitalize text-[#17352b]">{role}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <dt className="inline-flex min-h-6 items-center gap-2 text-[#657069]">
              <CalendarBlank size={16} aria-hidden="true" className="shrink-0" />
              Member since
            </dt>
            <dd className="font-medium tabular-nums text-[#17352b]">
              {memberSince}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-[#657069]">
          Member since uses your account creation date. This profile has no
          company or avatar field.
        </p>
      </section>

      <section className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-[#17352b]">Your projects</h2>
        <dl className="mt-4 divide-y divide-[#ded8cb] border-t border-[#ded8cb] text-sm">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-[#657069]">Projects posted</dt>
            <dd className="font-semibold tabular-nums text-[#17352b]">{total}</dd>
          </div>
          {counts.map((item) => (
            <div
              key={item.value}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <dt className="text-[#657069]">{item.label}</dt>
              <dd className="font-medium tabular-nums text-[#17352b]">
                {item.count}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-[#657069]">
          Counts come from your posted briefs only.
        </p>
      </section>
    </>
  );
}
