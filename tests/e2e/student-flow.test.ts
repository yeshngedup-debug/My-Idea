/**
 * Student E2E flow — full user journey through the platform.
 *
 * 1. Log in as a seeded student
 * 2. Complete profile (skills, bio, availability)
 * 3. Upload CV PDF
 * 4. Browse open projects
 * 5. Apply to a project
 * 6. Track applications
 *
 * Requires the live seeded database described in demo-users.ts.
 */
import { test, expect } from './fixtures';
import { DEMO_USERS } from './demo-users';
import { loginAs } from './auth-helper';

test.describe('Student flow', () => {
  test('complete student journey: login → profile → CV → apply → track', async ({
    page,
  }) => {
    await test.step('Log in as student', async () => {
      await loginAs(page, DEMO_USERS.student);
    });

    await test.step('Complete student profile', async () => {
      await page.getByRole('link', { name: 'Update profile' }).click();
      await expect(page).toHaveURL('/student/profile');
      await expect(
        page.getByRole('heading', { name: 'My Profile' })
      ).toBeVisible();

      await page.getByLabel('Full name').fill('Tashi Dorji');
      await page.getByLabel('College').fill('Royal Thimphu College');
      await page.getByLabel('Course').fill('BSc Computer Science');
      await page.getByLabel('Year').selectOption('3rd');
      await page.getByLabel('Availability').selectOption('weekdays');

      const skillInput = page.getByLabel('Skills');
      await skillInput.fill('React');
      await skillInput.press('Enter');
      await skillInput.fill('TypeScript');
      await skillInput.press('Enter');
      await expect(
        page.getByRole('button', { name: 'Remove React' })
      ).toBeVisible();

      await page
        .getByLabel('Bio')
        .fill('Final-year CS student looking for part-time product work.');
      await page.getByRole('button', { name: 'Save profile' }).click();
      await expect(page.getByRole('status')).toContainText('Profile saved', {
        timeout: 20_000,
      });
    });

    await test.step('Upload CV', async () => {
      await page
        .locator('input[name="cv"]')
        .setInputFiles('tests/e2e/fixtures/test-cv.pdf');
      await page.getByRole('button', { name: 'Upload CV' }).click();
      await expect(page.getByRole('status')).toContainText('CV uploaded', {
        timeout: 20_000,
      });
    });

    await test.step('Browse open projects', async () => {
      await page.getByRole('link', { name: 'Projects', exact: true }).click();
      await expect(page).toHaveURL('/student/projects');
      await expect(
        page.getByRole('heading', { name: 'Open Projects' })
      ).toBeVisible();
    });

    await test.step('Apply to a project', async () => {
      // Seed must include a project this student has not applied to yet.
      const card = page
        .locator('article')
        .filter({ has: page.getByRole('heading', { level: 3 }) })
        .filter({ has: page.getByRole('button', { name: 'Apply', exact: true }) })
        .first();
      await expect(card).toBeVisible();
      const projectTitle = await card
        .getByRole('heading', { level: 3 })
        .innerText();
      await card.getByRole('button', { name: 'Apply', exact: true }).click();
      // Re-resolve by title: after applying, the button label changes and the
      // original locator would silently match a different project card.
      const appliedCard = page
        .locator('article')
        .filter({
          has: page.getByRole('heading', { level: 3, name: projectTitle }),
        });
      await expect(appliedCard).toContainText('Applied successfully!', {
        timeout: 20_000,
      });
    });

    await test.step('Track applications', async () => {
      await page.getByRole('link', { name: 'Applications', exact: true }).click();
      await expect(page).toHaveURL('/student/applications');
      await expect(
        page.getByRole('heading', { name: 'My Applications' })
      ).toBeVisible();
      await expect(page.locator('li').first()).toBeVisible();
    });
  });

  test('filtered brief back link preserves validated q and mode', async ({
    page,
  }) => {
    await test.step('Log in as student', async () => {
      await loginAs(page, DEMO_USERS.student);
    });

    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL('/student/projects');

    const card = page
      .locator('article')
      .filter({ has: page.getByRole('link', { name: 'View details' }) })
      .first();
    await expect(card).toBeVisible();
    const title = (await card.getByRole('heading', { level: 3 }).innerText()).trim();
    const mode = (await card.innerText()).includes('Onsite') ? 'Onsite' : 'Remote';

    await page.getByLabel('Search project briefs').fill(title);
    await page.getByRole('button', { name: mode, exact: true }).click();
    await expect(page).toHaveURL(/q=/);

    await card.getByRole('link', { name: 'View details' }).click();
    await expect(page).toHaveURL(/\/student\/projects\/[a-f0-9-]+/i);
    const detailUrl = new URL(page.url());
    expect(detailUrl.searchParams.get('q')).toBe(title);
    expect(detailUrl.searchParams.get('mode')).toBe(mode.toLowerCase());

    await page.getByRole('link', { name: 'Back to open projects' }).click();
    await expect(page).toHaveURL(/\/student\/projects(\?|$)/);
    const backUrl = new URL(page.url());
    expect(backUrl.pathname).toBe('/student/projects');
    expect(backUrl.searchParams.get('q')).toBe(title);
    expect(backUrl.searchParams.get('mode')).toBe(mode.toLowerCase());
  });
});
