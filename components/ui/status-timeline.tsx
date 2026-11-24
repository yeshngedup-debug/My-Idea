/**
 * StatusTimeline: a reusable, accessible status stepper.
 * Server compatible: plain semantic markup, no client JS, no server APIs.
 */
/** One step in a status path. `value` must match a stored status string. */
export interface StatusStep {
  value: string;
  /** Human-readable label shown for every step. */
  label: string;
  /** One line explaining what happens next while this step is current. */
  next: string;
  /**
   * A terminal step ends the path. When it is current, earlier steps are
   * not marked as done, because the flow left the main sequence.
   */
  terminal?: boolean;
}

export interface StatusTimelineProps {
  steps: readonly StatusStep[];
  /** The current stored status value. */
  status: string;
  /** Accessible name for the ordered list. */
  label: string;
  /** Tighter spacing for dense list rows. */
  compact?: boolean;
  className?: string;
}

export function StatusTimeline({
  steps,
  status,
  label,
  compact = false,
  className = '',
}: StatusTimelineProps) {
  const currentIndex = steps.findIndex((s) => s.value === status);
  const current = currentIndex >= 0 ? steps[currentIndex] : steps[0];
  const flowsOffPath = current?.terminal === true;

  return (
    <div
      className={`rounded-xl border border-[#17352b]/10 bg-[#fffefa] px-4 py-3 ${className}`}
    >
      <ol aria-label={label} className="m-0 flex list-none flex-col p-0 sm:flex-row sm:items-start">
        {steps.map((step, index) => {
          const isCurrent = step.value === current?.value;
          const isDone =
            !isCurrent &&
            currentIndex >= 0 &&
            index < currentIndex &&
            !flowsOffPath;
          const stateText = isCurrent ? 'Current' : isDone ? 'Done' : 'Not yet';
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.value}
              aria-current={isCurrent ? 'step' : undefined}
              className={`relative flex flex-1 gap-3 pb-4 last:pb-0 sm:flex-col sm:gap-2 sm:pb-0 ${
                compact ? 'sm:pr-2' : 'sm:pr-4'
              } last:sm:pr-0`}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-[#17352b]/15 sm:left-7 sm:top-[11px] sm:h-px sm:w-[calc(100%-1.75rem)]"
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                  isCurrent
                    ? 'border-[#b23c26] bg-[#b23c26] text-[#fffefa] ring-4 ring-[#b23c26]/15'
                    : isDone
                      ? 'border-[#17352b] bg-[#17352b] text-[#fffefa]'
                      : 'border-[#17352b]/15 bg-[#fffefa] text-[#17352b]/40'
                }`}
              >
                {isDone ? '✓' : String(index + 1)}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold leading-5 sm:text-[13px] ${
                    isCurrent
                      ? 'text-[#17352b]'
                      : isDone
                        ? 'text-[#17352b]/80'
                        : 'text-body-secondary'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-0.5 text-[11px] font-medium ${
                    isCurrent
                      ? 'text-[#b23c26]'
                      : isDone
                        ? 'text-[#17352b]/60'
                        : 'text-body-secondary'
                  }`}
                >
                  {stateText}
                </p>
                {isCurrent && (
                  <p
                    className={`mt-2 max-w-[22rem] rounded-lg bg-[#eeeae1] px-3 py-2 text-[11px] leading-5 text-body-secondary ring-1 ring-[#ded8cb] ${
                      compact ? 'sm:max-w-[12rem]' : ''
                    }`}
                  >
                    <span className="font-medium text-[#17352b]">Next: </span>
                    {step.next}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Application states from the student's point of view. */
export const STUDENT_APPLICATION_STEPS: readonly StatusStep[] = [
  { value: 'pending', label: 'Pending', next: 'Founder is reviewing your application.' },
  {
    value: 'shortlisted',
    label: 'Shortlisted',
    next: 'Founder picked you. Watch for the next message.',
  },
  {
    value: 'accepted',
    label: 'Accepted',
    next: 'Work starts now. Message your founder.',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    next: 'Not this time. Browse other open projects and apply again.',
    terminal: true,
  },
];

/** Application states from the founder's point of view. */
export const FOUNDER_APPLICATION_STEPS: readonly StatusStep[] = [
  { value: 'pending', label: 'Pending', next: 'An application is waiting for your review.' },
  {
    value: 'shortlisted',
    label: 'Shortlisted',
    next: 'You picked this applicant. Move toward an agreement.',
  },
  {
    value: 'accepted',
    label: 'Accepted',
    next: 'Work starts now. The project can move forward.',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    next: 'Not this time. The applicant can apply elsewhere.',
    terminal: true,
  },
];

/** Project lifecycle states. */
export const PROJECT_STEPS: readonly StatusStep[] = [
  { value: 'open', label: 'Open', next: 'Project is open. Students can apply.' },
  { value: 'in_progress', label: 'In progress', next: 'Work has started. Keep the project moving.' },
  { value: 'review', label: 'In review', next: 'Review the work before marking it complete.' },
  { value: 'completed', label: 'Completed', next: 'Project finished. No further action needed.' },
];

/** Manual payment states for a shortlist order. */
export const ORDER_STEPS: readonly StatusStep[] = [
  {
    value: 'pending',
    label: 'Order created',
    next: 'Pay by bank transfer or mBoB, then upload a screenshot.',
  },
  {
    value: 'submitted',
    label: 'Screenshot uploaded',
    next: 'An admin is confirming your payment. Your shortlist unlocks on approval.',
  },
  {
    value: 'confirmed',
    label: 'Unlocked',
    next: 'Your ranked shortlist is ready below.',
  },
  {
    value: 'rejected',
    label: 'Payment not confirmed',
    next: 'Read the admin note. Use /contact for questions.',
    terminal: true,
  },
];
