/**
 * Admin E2E flow — full user journey through the platform.
 *
 * 1. Log in as a seeded admin
 * 2. Manage students (rank, verify)
 * 3. Generate a shortlist for a founder/project
 * 4. Manage payments (confirm)
 *
 * Requires the live seeded database described in demo-users.ts.
 */
import { test, expect } from './fixtures';
import { DEMO_USERS } from './demo-users';
import { loginAs } from './auth-helper';

test.describe('Admin flow', () => {
  test('complete admin journey: login → rank/verify → generate shortlist → manage payments', async ({
    page,
  }) => {
    await test.step('Log in as admin', async () => {
      await loginAs(page, DEMO_USERS.admin);
    });

    await test.step('Rank and verify students', async () => {
      await page.getByRole('link', { name: 'Students', exact: true }).click();
      await expect(page).toHaveURL('/admin/students');

      // Seed must include at least one student profile.
      const card = page
        .locator('li')
        .filter({ has: page.getByRole('heading', { level: 3 }) })
        .first();
      await expect(card).toBeVisible();

      const rank = card.locator('input[id^="rank-"]');
      await rank.fill('1');
      await rank.blur();
      await expect(page.getByRole('status')).toContainText('Rank 1 saved');

      const notVerified = card.locator('button').filter({ hasText: /Not verified/ });
      if (await notVerified.isVisible()) {
        await notVerified.click();
      }
      await expect(card.locator('button').filter({ hasText: /Verified/ })).toBeVisible();
    });

    await test.step('Generate a shortlist for a founder', async () => {
      await page.getByRole('button', { name: 'Select all shown' }).click();

      const founderSelect = page.getByLabel('Choose founder');
      await expect(founderSelect).toBeVisible();
      // Option 0 is the "Choose founder..." placeholder; seed supplies a founder.
      await founderSelect.selectOption({ index: 1 });

      await page.getByRole('button', { name: 'Generate' }).click();
      await expect(
        page.getByRole('heading', { name: 'Generated shortlist' })
      ).toBeVisible();
    });

    await test.step('Confirm a payment order', async () => {
      await page.getByRole('link', { name: 'Payments', exact: true }).click();
      await expect(page).toHaveURL('/admin/payments');

      // Seed a submitted Basic order with a screenshot. Scoping by package
      // keeps this independent of the Full Support order in payment-flow.
      const order = page
        .locator('li')
        .filter({ hasText: 'Basic shortlist' })
        .first();
      await expect(order).toBeVisible();
      await expect(
        order.getByRole('button', { name: 'Confirm payment' })
      ).toBeEnabled();
      await order.getByRole('button', { name: 'Confirm payment' }).click();
      await expect(page.getByRole('status')).toContainText('Payment confirmed');
      await expect(order).toContainText('Confirmed');
    });
  });
});
