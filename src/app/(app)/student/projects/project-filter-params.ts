export type WorkModeFilter = 'all' | 'remote' | 'onsite';

export interface ProjectFilters {
  /** Raw query value, capped to the client input limit. */
  q: string;
  mode: WorkModeFilter;
}

type ServerSearchParams = Record<string, string | string[] | undefined>;
type ProjectSearchParams = ServerSearchParams | URLSearchParams;

const MAX_QUERY_LENGTH = 120;

export function normalizeWorkMode(value: unknown): WorkModeFilter {
  return typeof value === 'string' && (value === 'remote' || value === 'onsite')
    ? value
    : 'all';
}

function readParam(params: ProjectSearchParams, name: string): unknown {
  if (params instanceof URLSearchParams) return params.get(name) ?? undefined;

  // Repeated server params are ambiguous, so they are rejected rather than
  // silently taking the first value.
  const value = params[name];
  return Array.isArray(value) ? undefined : value;
}

/**
 * Accept both Next's server searchParams and URLSearchParams so the client
 * feed and the server detail page validate the same values.
 */
export function parseProjectFilters(params: ProjectSearchParams): ProjectFilters {
  const q = readParam(params, 'q');
  const mode = readParam(params, 'mode');

  return {
    q: typeof q === 'string' ? q.slice(0, MAX_QUERY_LENGTH) : '',
    mode: normalizeWorkMode(mode),
  };
}

/** Append only valid filters; `encodeURIComponent` cannot inject parameters. */
export function projectFiltersHref(
  base: string,
  filters: ProjectFilters,
  extra: Record<string, string> = {},
): string {
  const params = new URLSearchParams();
  const q = filters.q.trim();

  if (q) params.set('q', q);
  if (filters.mode !== 'all') params.set('mode', filters.mode);
  for (const [key, value] of Object.entries(extra)) {
    params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
