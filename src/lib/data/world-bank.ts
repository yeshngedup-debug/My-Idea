/**
 * Auto-refreshing official statistics for Bhutan.
 *
 * Server-only by convention: this module uses the Next.js Data Cache through
 * fetch(url, { next: { revalidate: 3600 } }). Do not import it from a Client
 * Component. Client code reads these values through /api/context-data.
 *
 * "Auto-refreshing" means hourly server revalidation plus 10-minute client
 * polling. These are annual releases and modeled estimates, not real-time data.
 * Every response carries a "checked at" timestamp and each source's own
 * timestamp so readers can see the age of the data.
 *
 * The World Bank API accepts one indicator per request. Semicolon-joined
 * indicator requests return error 120, so each series is fetched separately.
 *
 * This app does not enable Cache Components, so the previous caching model
 * applies and `next.revalidate` is the supported API in Next.js 16.
 *
 * UNDP HDR 2025 and Bhutan national sources (NSB, RMA, data.gov.bt, MoLHR)
 * are deliberately not fetched here. The UNDP CSV is large and would bloat the
 * module, and the national sources have no verified public JSON or CSV API.
 */

export const WORLD_BANK_API_BASE =
  "https://api.worldbank.org/v2/country/BTN/indicator";

export const WHO_GHO_API_BASE = "https://ghoapi.azureedge.net/api";

/** Keep in sync with the `revalidate` export in app/api/context-data/route.ts. */
export const REVALIDATE_SECONDS = 3600;

/** Keep in sync with the interval in components/data/live-context.tsx. */
export const CLIENT_POLL_MS = 10 * 60 * 1000;

export const WORLD_BANK_ATTRIBUTION =
  "World Bank API, World Development Indicators";

export const WHO_ATTRIBUTION = "WHO Global Health Observatory (GHO) API";

export type LiveSourceId = "world-bank" | "who";

export type LiveSource = {
  id: LiveSourceId;
  label: string;
  url: string;
  sourceUpdatedAt: string | null;
};

export type LiveIndicator = {
  code: string;
  name: string;
  value: number;
  year: string;
  displayValue: string;
  seriesNote: string;
  sourceId: LiveSourceId;
  sourceUrl: string;
  relatedObservation?: { year: string; displayValue: string };
};

export type LiveContextResult =
  | {
      ok: true;
      partial: boolean;
      missing: string[];
      errors: string[];
      checkedAt: string;
      fetchedAt: string;
      sourceUpdatedAt: string | null;
      sourceUrl: string;
      sourceLabel: string;
      sources: LiveSource[];
      indicators: LiveIndicator[];
    }
  | {
      ok: false;
      partial: false;
      missing: string[];
      errors: string[];
      checkedAt: string;
      fetchedAt: string;
      sourceUpdatedAt: string | null;
      sourceUrl: string;
      sourceLabel: string;
      sources: LiveSource[];
      indicators: LiveIndicator[];
      error: string;
    };

type IndicatorSpec = {
  code: string;
  fallbackName: string;
  unit: "percent" | "people";
  decimals: number;
  seriesNote: (year: string) => string;
  relatedYear?: string;
};

/**
 * The API's own indicator names are used verbatim in the UI. The fallback
 * names here only apply if the API ever omits a name.
 */
const INDICATORS: IndicatorSpec[] = [
  {
    code: "SL.UEM.1524.ZS",
    fallbackName: "Unemployment, youth total (% of total labor force ages 15-24)",
    unit: "percent",
    decimals: 1,
    seriesNote: (year) => `modeled ILO estimate, year ${year}`,
    relatedYear: "2021",
  },
  {
    code: "NY.GDP.MKTP.KD.ZG",
    fallbackName: "GDP growth (annual %)",
    unit: "percent",
    decimals: 1,
    seriesNote: (year) => `year ${year}`,
  },
  {
    code: "SI.POV.DDAY",
    fallbackName:
      "Poverty headcount ratio at $3.00 a day (2021 PPP) (% of population)",
    unit: "percent",
    decimals: 1,
    seriesNote: (year) => `year ${year}`,
  },
  {
    code: "SP.POP.TOTL",
    fallbackName: "Population, total",
    unit: "people",
    decimals: 0,
    seriesNote: (year) => `year ${year}`,
  },
  {
    code: "SE.ADT.LITR.ZS",
    fallbackName: "Literacy rate, adult total (% of people ages 15 and above)",
    unit: "percent",
    decimals: 1,
    seriesNote: (year) => `year ${year}`,
  },
  {
    code: "SL.TLF.ACTI.1524.ZS",
    fallbackName:
      "Labor force participation rate for ages 15-24, total (%) (modeled ILO estimate)",
    unit: "percent",
    decimals: 1,
    seriesNote: (year) => `modeled ILO estimate, year ${year}`,
  },
];

/** Both-sexes rows only, so the value is comparable over time. */
const WHO_LIFE_EXPECTANCY_URL =
  `${WHO_GHO_API_BASE}/WHOSIS_000001` +
  "?$filter=SpatialDim%20eq%20%27BTN%27%20and%20Dim1%20eq%20%27SEX_BTSX%27&$top=50";

const EXPECTED_INDICATORS: Record<string, string> = {
  ...Object.fromEntries(INDICATORS.map((spec) => [spec.code, spec.fallbackName])),
  WHOSIS_000001: "Life expectancy at birth (years)",
};

function missingIndicators(indicators: LiveIndicator[]): string[] {
  const present = new Set(indicators.map((indicator) => indicator.code));
  return Object.entries(EXPECTED_INDICATORS)
    .filter(([code]) => !present.has(code))
    .map(([, label]) => label);
}

type RawObservation = {
  indicator?: { id?: string; value?: string };
  date?: string;
  value?: number | null;
};

type RawEnvelope = { lastupdated?: string };
type RawPayload = [RawEnvelope, RawObservation[]];

type WhoRow = {
  SpatialDim?: string;
  Dim1?: string;
  TimeDim?: number;
  NumericValue?: number | null;
  Date?: string;
};

type WhoPayload = { value?: WhoRow[] };

type IndicatorFetchResult = {
  indicator: LiveIndicator | null;
  sourceUpdatedAt: string | null;
  error: string | null;
};

function indicatorUrl(code: string): string {
  return `${WORLD_BANK_API_BASE}/${code}?format=json&per_page=30&date=2000:2026`;
}

function formatValue(
  value: number,
  decimals: number,
  isPercent: boolean,
): string {
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return isPercent ? `${formatted}%` : formatted;
}

async function fetchWorldBankIndicator(
  spec: IndicatorSpec,
): Promise<IndicatorFetchResult> {
  const url = indicatorUrl(spec.code);

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        indicator: null,
        sourceUpdatedAt: null,
        error: "World Bank API did not respond.",
      };
    }

    const payload = (await response.json()) as RawPayload;
    if (
      !Array.isArray(payload) ||
      payload.length < 2 ||
      !Array.isArray(payload[1])
    ) {
      return {
        indicator: null,
        sourceUpdatedAt: null,
        error: "World Bank API returned an unexpected format.",
      };
    }

    const envelope = payload[0] ?? {};
    const observations = payload[1];
    const sourceUpdatedAt =
      typeof envelope.lastupdated === "string" ? envelope.lastupdated : null;

    // A zero is a real value. Only null and missing values are skipped.
    const latest = observations.find(
      (item) =>
        typeof item.date === "string" &&
        typeof item.value === "number" &&
        Number.isFinite(item.value),
    );

    if (
      !latest ||
      typeof latest.date !== "string" ||
      typeof latest.value !== "number"
    ) {
      return { indicator: null, sourceUpdatedAt, error: null };
    }

    const related = spec.relatedYear
      ? observations.find(
          (item) =>
            item.date === spec.relatedYear &&
            typeof item.value === "number" &&
            Number.isFinite(item.value),
        )
      : undefined;

    const indicator: LiveIndicator = {
      code: spec.code,
      name: latest.indicator?.value ?? spec.fallbackName,
      value: latest.value,
      year: latest.date,
      displayValue: formatValue(
        latest.value,
        spec.decimals,
        spec.unit === "percent",
      ),
      seriesNote: spec.seriesNote(latest.date),
      sourceId: "world-bank",
      sourceUrl: url,
    };

    if (
      related?.date &&
      typeof related.value === "number" &&
      Number.isFinite(related.value)
    ) {
      indicator.relatedObservation = {
        year: related.date,
        // Keep the extra precision. Rounding 20.609 to 20.6 would wrongly
        // suggest it is the same figure as the press release.
        displayValue: formatValue(related.value, 3, spec.unit === "percent"),
      };
    }

    return { indicator, sourceUpdatedAt, error: null };
  } catch {
    return {
      indicator: null,
      sourceUpdatedAt: null,
      error: "World Bank API is temporarily unavailable.",
    };
  }
}

async function fetchWhoLifeExpectancy(): Promise<IndicatorFetchResult> {
  try {
    const response = await fetch(WHO_LIFE_EXPECTANCY_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        indicator: null,
        sourceUpdatedAt: null,
        error: "WHO GHO API did not respond.",
      };
    }

    const payload = (await response.json()) as WhoPayload;
    if (!payload || !Array.isArray(payload.value)) {
      return {
        indicator: null,
        sourceUpdatedAt: null,
        error: "WHO GHO API returned an unexpected format.",
      };
    }

    const rows = payload.value.filter(
      (row) =>
        row.SpatialDim === "BTN" &&
        row.Dim1 === "SEX_BTSX" &&
        typeof row.TimeDim === "number" &&
        typeof row.NumericValue === "number" &&
        Number.isFinite(row.NumericValue),
    );

    const latest = [...rows].sort(
      (a, b) => (b.TimeDim ?? 0) - (a.TimeDim ?? 0),
    )[0];

    if (
      !latest ||
      typeof latest.TimeDim !== "number" ||
      typeof latest.NumericValue !== "number"
    ) {
      return { indicator: null, sourceUpdatedAt: null, error: null };
    }

    return {
      indicator: {
        code: "WHOSIS_000001",
        name: "Life expectancy at birth (years)",
        value: latest.NumericValue,
        year: String(latest.TimeDim),
        displayValue: formatValue(latest.NumericValue, 1, false),
        seriesNote: `both sexes, year ${latest.TimeDim}`,
        sourceId: "who",
        sourceUrl: WHO_LIFE_EXPECTANCY_URL,
      },
      sourceUpdatedAt: typeof latest.Date === "string" ? latest.Date : null,
      error: null,
    };
  } catch {
    return {
      indicator: null,
      sourceUpdatedAt: null,
      error: "WHO GHO API is temporarily unavailable.",
    };
  }
}

async function loadLiveContext(): Promise<LiveContextResult> {
  const checkedAt = new Date().toISOString();
  const sourceUrl = indicatorUrl(INDICATORS[0].code);

  try {
    const [worldBankResults, whoResult] = await Promise.all([
      Promise.all(INDICATORS.map(fetchWorldBankIndicator)),
      fetchWhoLifeExpectancy(),
    ]);

    const indicators: LiveIndicator[] = [];
    const errors: string[] = [];
    let worldBankUpdatedAt: string | null = null;

    for (const result of worldBankResults) {
      if (result.sourceUpdatedAt) worldBankUpdatedAt = result.sourceUpdatedAt;
      if (result.indicator) indicators.push(result.indicator);
      if (result.error) errors.push(result.error);
    }
    // WHO exposes its own timestamp on the observation rather than an
    // envelope. The World Bank envelope value stays as the headline value.
    if (whoResult.indicator) indicators.push(whoResult.indicator);
    if (whoResult.error) errors.push(whoResult.error);

    const sources: LiveSource[] = [
      {
        id: "world-bank",
        label: WORLD_BANK_ATTRIBUTION,
        url: sourceUrl,
        sourceUpdatedAt: worldBankUpdatedAt,
      },
      {
        id: "who",
        label: WHO_ATTRIBUTION,
        url: WHO_LIFE_EXPECTANCY_URL,
        sourceUpdatedAt: whoResult.sourceUpdatedAt,
      },
    ];

    const missing = missingIndicators(indicators);
    if (indicators.length === 0) {
      return {
        ok: false,
        partial: false,
        missing,
        errors,
        checkedAt,
        fetchedAt: checkedAt,
        sourceUpdatedAt: worldBankUpdatedAt,
        sourceUrl,
        sourceLabel: WORLD_BANK_ATTRIBUTION,
        sources,
        indicators: [],
        error: errors[0] ?? "Official statistics are temporarily unavailable.",
      };
    }

    return {
      ok: true,
      partial: errors.length > 0 || missing.length > 0,
      missing,
      errors,
      checkedAt,
      fetchedAt: checkedAt,
      sourceUpdatedAt: worldBankUpdatedAt,
      sourceUrl,
      sourceLabel: WORLD_BANK_ATTRIBUTION,
      sources,
      indicators,
    };
  } catch {
    const error = "Official statistics are temporarily unavailable.";
    return {
      ok: false,
      partial: false,
      missing: Object.values(EXPECTED_INDICATORS),
      errors: [error],
      checkedAt,
      fetchedAt: checkedAt,
      sourceUpdatedAt: null,
      sourceUrl,
      sourceLabel: WORLD_BANK_ATTRIBUTION,
      sources: [],
      indicators: [],
      error,
    };
  }
}

export const getLiveContext = loadLiveContext;
