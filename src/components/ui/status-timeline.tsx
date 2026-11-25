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
      className={`rounded-xl border border-[#66bfbf]/10 bg-[#ffffff] px-4 py-3 ${className}`}
    >
      <ol aria-label={label} className="m-0 flex list-none flex-col p-0 sm:flex-row sm:items-start">
        {steps.map((step, index) => {
          const isCurrent = step.value === current?.value;
          const isDone =
            !isCurrent &&
            currentIndex >= 0 &&
            index < currentIndex &&
            !flowsOffPath;
          const stateText = isCurrent
            ? 'Current'
            : isDone
              ? 'Done'
              : flowsOffPath
                ? 'Earlier stage'
                : 'Not yet';
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
                  className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-[#0b5c5c]/15 sm:left-7 sm:top-[11px] sm:h-px sm:w-[calc(100%-1.75rem)]"
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                  isCurrent
                    ? 'border-[#c2004b] bg-[#ff0063] text-[#000000] ring-4 ring-[#c2004b]/15'
                    : isDone
                      ? 'border-[#66bfbf] bg-[#66bfbf] text-[#0b2e2e]'
                      : 'border-[#66bfbf]/15 bg-[#ffffff] text-[#0b5c5c]/40'
                }`}
              >
                {isDone ? '✓' : String(index + 1)}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold leading-5 sm:text-[13px] ${
                    isCurrent ? 'text-[#0b5c5c]' : 'text-body-secondary'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-0.5 text-xs font-medium ${
                    isCurrent ? 'text-[#c2004b]' : 'text-body-secondary'
                  }`}
                >
                  {stateText}
                </p>
                {isCurrent && (
                  <p
                    className={`mt-2 max-w-[22rem] rounded-lg bg-[#eaf6f6] px-3 py-2 text-xs leading-5 text-body-secondary ring-1 ring-[#b9dede] sm:text-sm ${
                      compact ? 'sm:max-w-[12rem]' : ''
                    }`}
                  >
                    <span className="font-medium text-[#0b5c5c]">Next: </span>
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
    next: 'Founder picked you. Your founder will contact you when the next step is ready.',
  },
  {
    value: 'accepted',
    label: 'Accepted',
    next: 'Work starts now. Check your project brief.',
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
    label: 'Payment confirmed',
    next: 'An admin finalizes and ranks the shortlist before release.',
  },
  {
    value: 'rejected',
    label: 'Payment not confirmed',
    next: 'Read the admin note. Contact us if you need help.',
    terminal: true,
  },
];
