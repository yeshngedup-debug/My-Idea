/**
 * Homepage first-paint, media and reveal checks.
 *
 * These tests import @playwright/test directly: they need no database and must
 * not be skipped by the seeded-Neon guard used by the authenticated flows.
 */
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('homepage icon panels render with real layout boxes', async ({ page }) => {
  await page.goto('/public');

  expect(await page.locator('main img').count()).toBe(0);

  const panels = page.locator('main [data-media-panel]');
  expect(await panels.count()).toBeGreaterThan(0);

  for (let index = 0; index < (await panels.count()); index += 1) {
    const panel = panels.nth(index);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS('opacity', '1');
    await expect
      .poll(() => panel.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThan(0);
    await expect
      .poll(() => panel.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThan(0);
    await expect(panel.locator('[data-media-icon]')).toHaveCount(1);
  }
});

test('root URL redirects before any page is rendered', async ({ request }) => {
  // A page-level redirect is thrown after the shell has flushed, so the root
  // used to answer 200 with an empty loading skeleton. The server-level
  // redirect must return a real status code instead.
  const response = await request.get('/', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/public');
});

test('favicon serves the canonical public asset', async ({ request }) => {
  const response = await request.get('/favicon.ico');
  expect(response.ok()).toBeTruthy();

  const served = await response.body();
  const canonical = fs.readFileSync(
    path.resolve(process.cwd(), 'public/favicon.ico'),
  );
  expect(served.equals(canonical)).toBe(true);
});

test('hero copy is static in server HTML and on first client render', async ({
  page,
  request,
}) => {
  // Next streams page content through inline scripts, so a JavaScript-disabled
  // browser sees only the root loading fallback. Inspect the server HTML
  // directly instead, then verify the rendered first client state.
  const response = await request.get('/public');
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toMatch(/Paid project work/i);
  const headingTag = html.match(/<h1\b[^>]*>/i)?.[0] ?? '';
  expect(headingTag).not.toMatch(/opacity:\s*0/i);
  expect(headingTag).not.toMatch(/\bhidden\b/i);

  await page.goto('/public', { waitUntil: 'domcontentloaded' });

  const heading = page.getByRole('heading', {
    level: 1,
    name: /Paid project work/i,
  });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('opacity', '1');
  await expect(heading).toHaveCSS('transform', 'none');
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`motion preference: ${reducedMotion}`, () => {
    test.use({ reducedMotion });

    test('later content stays fully static after scrolling', async ({ page }) => {
      await page.goto('/public');
      const laterSection = page.locator('main section').last();

      await laterSection.scrollIntoViewIfNeeded();

      await expect(laterSection).toBeVisible();
      await expect(laterSection).toHaveCSS('opacity', '1');
      await expect(laterSection).toHaveCSS('transform', 'none');
      await expect(laterSection).toHaveCSS('filter', 'none');
    });
  });
}
