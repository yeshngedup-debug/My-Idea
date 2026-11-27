/**
 * Marketing first-paint and motion contract.
 *
 * These checks need no seeded database. They protect the server-rendered hero,
 * the explicit GSAP keys, and the static final state after a scroll.
 */
import { test, expect, type Locator } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/for-students',
  '/for-founders',
  '/how-it-works',
  '/about',
  '/contact',
  '/faq',
] as const;

const FIRST_VIEW_LINKS: Record<string, string[]> = {
  '/': ['Create student account', 'Browse projects', 'Ask for founder access'],
  '/for-students': ['Create student account', 'Browse projects'],
  '/for-founders': ['Ask for founder access', 'See pricing', 'Post a project'],
};

const MOTION_KEYS = [
  'data-motion-section',
  'data-motion-panel',
  'data-motion-group',
  'data-motion-item',
] as const;

async function expectNoMotionKey(locator: Locator) {
  const hasMotionKey = await locator.evaluate(
    (element, keys) => keys.some((key) => element.hasAttribute(key)),
    [...MOTION_KEYS],
  );
  expect(hasMotionKey).toBe(false);
}

for (const pathname of PUBLIC_ROUTES) {
  test(`${pathname} paints a visible hero with scoped motion keys`, async ({
    page,
    request,
  }) => {
    const response = await request.get(pathname);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    const headingTags = html.match(/<h1\b[^>]*>/gi) ?? [];

    expect(headingTags).toHaveLength(1);
    expect(headingTags[0]).not.toMatch(/opacity:\s*0\b/i);
    expect(headingTags[0]).not.toMatch(/\bhidden\b/i);

    await page.goto(pathname, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('main[data-marketing-root]')).toHaveCount(1);
    await expect(page.locator('main img')).toHaveCount(0);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS('opacity', '1');
    await expect(heading).toHaveCSS('transform', 'none');
    await expectNoMotionKey(heading);

    expect(await page.locator('[data-motion-section]').count()).toBeGreaterThan(0);
  });
}

for (const [pathname, labels] of Object.entries(FIRST_VIEW_LINKS)) {
  test(`${pathname} keeps its first-viewport actions available`, async ({ page }) => {
    await page.goto(pathname, { waitUntil: 'domcontentloaded' });

    for (const label of labels) {
      const link = page.getByRole('link', { name: label, exact: true }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveCSS('opacity', '1');
      await expectNoMotionKey(link);
    }
  });
}

test('how-it-works keeps the three-step region free of motion-keyed list items', async ({
  page,
}) => {
  await page.goto('/how-it-works');

  const region = page.getByRole('region', {
    name: 'Three steps, one clear brief',
  });
  await expect(region).toBeVisible();
  await expect(region.locator('li')).toHaveCount(3);
  await expect(region.locator('[data-motion-item]')).toHaveCount(0);
});

test('founder pricing CTA resolves to the in-page anchor', async ({ page }) => {
  await page.goto('/for-founders');

  await expect(
    page.getByRole('link', { name: 'See pricing', exact: true }).first(),
  ).toHaveAttribute('href', '#pricing');

  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'See pricing', exact: true }).first(),
  ).toHaveAttribute('href', '/for-founders#pricing');
});

test.describe('prefers reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tagged sections stay static instead of entering a GSAP timeline', async ({
    page,
  }) => {
    await page.goto('/for-students');
    const section = page.locator('[data-motion-section]').last();

    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section).toHaveCSS('opacity', '1');
    await expect(section).toHaveCSS('transform', 'none');
  });
});

test.describe('no motion preference', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('tagged sections end visible and untransformed after their reveal', async ({
    page,
  }) => {
    await page.goto('/about');
    const sections = page.locator('[data-motion-section]');

    for (let index = 0; index < (await sections.count()); index += 1) {
      const section = sections.nth(index);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      await expect(section).toHaveCSS('opacity', '1');
      await expect(section).toHaveCSS('transform', 'none');
    }
  });
});
