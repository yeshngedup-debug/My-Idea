/**
 * Verified context data for the public landing page.
 *
 * Source checked with a live browser on 2026-11-24:
 * World Bank, "Bhutan's Growth Outlook Remains Strong, Job Creation Must
 * Accelerate Amid Global Uncertainty" (Bhutan Development Update), 9 April 2026
 * https://www.worldbank.org/en/news/press-release/2026/04/09/bhutan-s-growth-outlook-remains-strong
 *
 * Every figure below is a national indicator about Bhutan. None of them is a
 * Bhutan Tech Connect result, user count, or outcome.
 */

export const WORLD_BANK_SOURCE = {
  label: "World Bank · Bhutan Development Update, April 2026",
  url: "https://www.worldbank.org/en/news/press-release/2026/04/09/bhutan-s-growth-outlook-remains-strong",
};

/**
 * Provenance for the auto-refreshing statistics panel. These are annual
 * dataset releases, not real-time data. The page checks the server endpoint
 * every 10 minutes; the server revalidates the datasets hourly.
 */
export const LIVE_DATA_SOURCE = {
  label: "Auto-refreshing official statistics",
  url: "https://api.worldbank.org/v2/country/BTN/indicator",
  attribution:
    "World Bank API, World Development Indicators; WHO Global Health Observatory (GHO) API. Annual releases and modeled estimates, not real-time data.",
} as const;

export const YOUTH_UNEMPLOYMENT = {
  value: "20.6%",
  label: "Youth unemployment in Bhutan",
  note: "World Bank, April 2026. National indicator, not a platform result.",
};

/** Stable, slug-style ids so disclosure IDREFs never depend on label copy. */
export const CONTEXT_FACTS = [
  {
    id: "gdp-growth",
    value: "7.1%",
    label: "Real GDP growth projected for FY25/26",
    note: "6.4% projected for FY26/27.",
  },
  {
    id: "emigration",
    value: "~9%",
    label: "Of Bhutan's population emigrated as of 2025",
    note: "World Bank, April 2026.",
  },
  {
    id: "agrifood",
    value: "55%",
    label: "Of employed people work in the agrifood system",
    note: "Including 71% of rural workers.",
  },
] as const;

export const CONTEXT_QUOTE = {
  text: "The challenge is to translate this growth into jobs, particularly for women and young people.",
  author: "Xavier Furtado, World Bank Group Country Manager for Bhutan",
};
