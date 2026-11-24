/**
 * Founder E2E flow — full user journey through the platform.
 *
 * 1. Log in as a seeded founder
 * 2. Post a project
 * 3. Browse student profiles
 * 4. View a full student profile
 * 5. Request shortlist
 *
 * Requires the live seeded database described in demo-users.ts.
 */
import { test, expect } from './fixtures';
import { DEMO_USERS } from './demo-users';
import { loginAs } from './auth-helper';

test.describe('Founder flow', () => {
  test('complete founder journey: login → post project → browse → shortlist', async ({
    page,
  }) => {
    await test.step('Log in as founder', async () => {
      await loginAs(page, DEMO_USERS.founder);
    });

    await test.step('Post a project', async () => {
      await page.getByRole('link', { name: 'Post a project' }).click();
      await expect(page).toHaveURL('/founder/projects/post');

      // Unique per run so other flows can resolve their project card by title.
      const projectTitle = `Mobile app UI redesign ${Date.now()}`;
      await page.getByLabel('Project title').fill(projectTitle);
      await page
        .getByLabel('Description')
        .fill(
          'Redesign our mobile app with a modern look, clean navigation, and a working contact form.'
        );

      const skillInput = page.getByLabel('Required skills');
      await skillInput.fill('Figma');
      await skillInput.press('Enter');
      await skillInput.fill('React Native');
      await skillInput.press('Enter');
      await expect(
        page.getByRole('button', { name: 'Remove Figma' })
      ).toBeVisible();

      await page.getByLabel('Duration').selectOption('2 weeks');
      await page.getByLabel('Budget minimum').fill('2500');
      await page.getByLabel('Budget maximum').fill('4000');
      await page.getByRole('radio', { name: 'Remote' }).click();

      // Always in the future — no calendar-dependent failures.
      const deadline = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .slice(0, 10);
      await page.getByLabel('Deadline to apply').fill(deadline);

      await page.getByRole('button', { name: 'Post project' }).click();
      // Success redirects to the founder's project list.
      await expect(page).toHaveURL('/founder/projects');
      await expect(
        page.getByRole('cell', { name: projectTitle })
      ).toBeVisible();
    });

    await test.step('Browse student profiles', async () => {
      await page.getByRole('link', { name: 'Find talent' }).click();
      await expect(page).toHaveURL('/founder/browse-students');
      await expect(
        page.getByRole('heading', { name: 'Browse Students' })
      ).toBeVisible();
    });

    await test.step('View full student profile', async () => {
      // Seed must include a completed profile with an uploaded CV.
      const card = page
        .locator('li')
        .filter({ has: page.getByRole('heading', { level: 3 }) })
        .first();
      await expect(card).toBeVisible();
      const name = (await card.getByRole('heading', { level: 3 }).innerText()).trim();
      await card.getByRole('link', { name: 'View full profile' }).click();
      await expect(page).toHaveURL(/\/founder\/students\/[a-f0-9-]+/);
      await expect(
        page.getByRole('heading', { level: 1, name, exact: true })
      ).toBeVisible();
    });

    await test.step('Request shortlist', async () => {
      // Seed gives this founder a relationship with a browsable student, so
      // the request is accepted. Accept an already-shortlisted seed as the
      // same verified end state.
      const request = page.getByRole('button', { name: 'Request shortlist' });
      const shortlisted = page.getByRole('button', { name: 'Shortlisted' });
      if (await request.isVisible()) {
        await request.click();
      }
      await expect(shortlisted).toBeVisible();
    });
  });
});
