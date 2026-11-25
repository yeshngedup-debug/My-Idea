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
      <h1 className="text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-tight tracking-[-0.02em] text-[#17352b] text-balance">
        {title}
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-6 text-body-secondary sm:max-w-sm">
        <span className="font-medium text-[#b23c26]">{eyebrow} ·</span>{" "}
        {description}
      </p>
    </div>
  );
}
