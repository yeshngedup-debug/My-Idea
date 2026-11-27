/**
 * Compact page heading for workspace sub-pages.
 * Server-only. One real h1, a quiet context line and a short purpose line
 * answer "where am I" and "what is here".
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
    <div className="min-w-0" data-role-context={eyebrow}>
      <p className="text-xs font-medium text-[#356464]">{eyebrow}</p>
      <h1 className="mt-1.5 text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0b2e2e] text-balance">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#356464] sm:max-w-md">
        {description}
      </p>
    </div>
  );
}
