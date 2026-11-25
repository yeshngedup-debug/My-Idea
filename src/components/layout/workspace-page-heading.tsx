/**
 * Compact, pinned-friendly page heading for workspace sub-pages.
 * Server-only. Carries role context, one h1 and a short purpose line so every
 * dashboard page answers "where am I" and "what is here" before the work area.
 */
export function WorkspacePageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0">
      <span className="inline-flex items-center rounded-full border border-[#ded8cb] bg-[#fffefa] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#7a4b00]">
        {eyebrow}
      </span>
      <h1 className="mt-3 text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-[1.25] tracking-[-0.02em] text-[#18251f] text-balance">
        {title}
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-6 text-[#56645c] sm:max-w-sm">
        {description}
      </p>
    </div>
  );
}
