/**
 * Compact page heading for workspace sub-pages.
 * Server-only. One real h1 and a short purpose line answer "where am I" and
 * "what is here". Role context stays non-visual so nothing competes with it.
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
      <h1 className="text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-[1.25] tracking-[-0.02em] text-[#18251f] text-balance">
        {title}
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-6 text-[#56645c] sm:max-w-sm">
        {description}
      </p>
    </div>
  );
}
