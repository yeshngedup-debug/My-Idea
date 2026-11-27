/**
 * Marketplace redesign regression checks.
 *
 * These checks are intentionally independent of Neon. They prove the public
 * contract on a standard phone: required actions are reachable, the trust
 * message is present, the three-step workflow stays compact, and content is
 * never hidden before it enters the viewport.
 */
import { test, expect, type Page } from '@playwright/test';

const PHONE = { width: 390, height: 844 } as const;

async function expectVisibleInFirstViewport(page: Page, name: string) {
  const link = page
    .locator('main')
    .getByRole('link', { name, exact: true })
    .first();

  await expect(link, `Expected a visible link labelled "${name}"`).toBeVisible();
  const box = await link.boundingBox();
  expect(box, `Expected "${name}" to have a layout box`).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(PHONE.height);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function expectNoHiddenFirstPaint(page: Page) {
  const hidden = await page
    .locator(
      'main [data-motion-section], main [data-motion-panel], main [data-motion-group], main [data-motion-item]',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = window.getComputedStyle(element);
          return (
            style.opacity !== '1' ||
            style.transform !== 'none' ||
            style.filter !== 'none'
          );
        })
        .map((element) => element.outerHTML.slice(0, 180)),
    );

  expect(hidden).toEqual([]);
}

test.describe('public marketplace', () => {
  test.use({ viewport: PHONE });

  test('homepage exposes both audience paths and the trust bar', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('main h1')).toHaveCount(1);
    await expectVisibleInFirstViewport(page, 'Create student account');
    await expectVisibleInFirstViewport(page, 'Browse projects');
    await expectVisibleInFirstViewport(page, 'Ask for founder access');

    const mainText = await page.locator('main').innerText();
    expect(mainText).toContain(
      'Human verification · Paid in Ngultrum · No bidding wars · Built in Bhutan',
    );

    await expectNoHorizontalOverflow(page);
    await expectNoHiddenFirstPaint(page);
  });

  test('student page starts with account creation and project discovery', async ({
    page,
  }) => {
    await page.goto('/for-students');

    await expect(page.locator('main h1')).toHaveCount(1);
    await expectVisibleInFirstViewport(page, 'Create student account');
    await expectVisibleInFirstViewport(page, 'Browse projects');
    await expectNoHorizontalOverflow(page);
    await expectNoHiddenFirstPaint(page);
  });

  test('founder page starts with access, pricing, and project posting', async ({
    page,
  }) => {
    await page.goto('/for-founders');

    await expect(page.locator('main h1')).toHaveCount(1);
    await expectVisibleInFirstViewport(page, 'Ask for founder access');
    await expectVisibleInFirstViewport(page, 'See pricing');
    await expectVisibleInFirstViewport(page, 'Post a project');
    await expectNoHorizontalOverflow(page);
    await expectNoHiddenFirstPaint(page);
  });

  test('how-it-works page contains exactly three early steps', async ({ page }) => {
    await page.goto('/how-it-works');

    await expect(page.locator('main h1')).toHaveCount(1);
    const stepsRegion = page.getByRole('region', {
      name: 'Three steps, one clear brief',
    });
    await expect(stepsRegion.getByRole('listitem')).toHaveCount(3);

    await expectNoHorizontalOverflow(page);
    await expectNoHiddenFirstPaint(page);
  });

  test('mobile menu owns focus and Escape restores the trigger', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.click();

    const firstMenuLink = page.locator('#marketing-mobile-nav a').first();
    await expect(firstMenuLink).toBeFocused();
    await expect(page.locator('main')).toHaveAttribute('inert', '');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  });
});

test.describe('authentication', () => {
  test.use({ viewport: PHONE });

  for (const route of ['/login', '/signup', '/forgot-password', '/reset-password']) {
    test(`${route} stays usable on a phone`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('main form')).toHaveCount(1);
      await expectNoHorizontalOverflow(page);
    });
  }
});
