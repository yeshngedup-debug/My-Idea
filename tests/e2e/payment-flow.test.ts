/**
 * Premium Shortlist payment E2E flow — the money path.
 *
 * 1. Founder creates a shortlist order
 * 2. Founder uploads a payment screenshot
 * 3. Admin confirms the payment
 * 4. Founder sees the unlocked shortlist
 *
 * Requires the live seeded database described in demo-users.ts.
 */
import { test, expect } from './fixtures';
import { DEMO_USERS, PAYMENT_FOUNDER } from './demo-users';
import { loginAs } from './auth-helper';

test.describe('Premium Shortlist payment flow', () => {
  test('founder orders → uploads screenshot → admin confirms → shortlist unlocks', async ({
    page,
    browser,
  }) => {
    await test.step('Founder creates shortlist order', async () => {
      await loginAs(page, PAYMENT_FOUNDER);

      await page.goto('/founder/shortlists');
      await expect(page).toHaveURL('/founder/shortlists');

      // The client may already open on the package step; only click the
      // opener when it is actually present.
      const opener = page.getByRole('button', { name: 'Get Shortlist' });
      if (await opener.isVisible()) await opener.click();
      await expect(
        page.getByRole('heading', { name: 'Choose a package' })
      ).toBeVisible();

      await page.getByRole('button', { name: /Full Support/ }).click();
      await page.getByLabel('Amount you will pay').fill('1500');
      await page.getByRole('button', { name: 'Continue to payment' }).click();

      // The revalidated route supplies the new order; wait for its UI,
      // never for a fixed number of milliseconds.
      await expect(
        page.getByRole('heading', { name: 'Upload payment screenshot' })
      ).toBeVisible();
      await page
        .locator('input[name="screenshot"]')
        .setInputFiles('tests/e2e/fixtures/test-screenshot.png');
      await page.getByRole('button', { name: 'Submit screenshot' }).click();
      // The live Neon Realtime status is also role=status, so scope to the
      // action result message instead of matching every status on the page.
      await expect(
        page.getByRole('status').filter({ hasText: 'Screenshot submitted' })
      ).toContainText('Screenshot submitted');
    });

    await test.step('Admin confirms payment', async () => {
      // Separate context: the founder session would otherwise bounce /login
      // straight back to /founder and the admin could never sign in.
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await loginAs(adminPage, DEMO_USERS.admin);

      await adminPage
        .getByRole('link', { name: 'Payments', exact: true })
        .click();
      await expect(adminPage).toHaveURL('/admin/payments');

      // Scope to the order just created (Full Support, Nu 1,500) so a
      // pre-seeded order cannot be confirmed by mistake.
      const order = adminPage
        .locator('li')
        .filter({ hasText: 'Full Support shortlist' })
        .filter({ hasText: '1,500' })
        .first();
      await expect(order).toBeVisible();
      await expect(
        order.getByRole('button', { name: 'Confirm payment' })
      ).toBeEnabled();
      await order.getByRole('button', { name: 'Confirm payment' }).click();
      await expect(adminPage.getByRole('status')).toContainText(
        'Payment confirmed'
      );

      await adminPage.close();
      await adminContext.close();
    });

    await test.step('Founder sees unlocked shortlist', async () => {
      await page.reload();
      await expect(
        page.getByRole('list', { name: /Payment status/ }).getByText('Unlocked')
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Your shortlist' })
      ).toBeVisible();
    });
  });
});
