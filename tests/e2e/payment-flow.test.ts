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
    // The seeded founder may already have a confirmed order from an earlier
    // run. Use a unique amount so this test always scopes the order it creates.
    // shortlist_orders.amount is numeric(10,2), so keep the unique amount
    // two-decimal to match the label the admin page renders.
    const orderAmount = Number(
      (1000 + (Date.now() % 90000) / 100).toFixed(2),
    );
    const orderAmountLabel = `Nu ${new Intl.NumberFormat('en-GB').format(orderAmount)}`;

    await test.step('Founder creates shortlist order', async () => {
      await loginAs(page, PAYMENT_FOUNDER);

      await page.goto('/founder/shortlists');
      await expect(page).toHaveURL('/founder/shortlists');

      // Open the package step from whichever stable state the account is in.
      const packageHeading = page.getByRole('heading', {
        name: 'Choose a package',
      });
      if (!(await packageHeading.isVisible())) {
        const opener = page
          .getByRole('button', { name: 'Get Shortlist' })
          .or(page.getByRole('button', { name: 'Order another shortlist' }));
        await opener.click();
      }
      await expect(packageHeading).toBeVisible();

      await page.getByRole('button', { name: /Full Support/ }).click();
      await page.getByLabel('Amount you will pay').fill(String(orderAmount));
      // A previous run can leave an unpaid order open. The UI asks before
      // creating another one; accept so this test stays idempotent.
      page.once('dialog', (dialog) => dialog.accept());
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
      ).toContainText('Screenshot submitted', { timeout: 20_000 });
    });

    await test.step('Admin confirms payment', async () => {
      // Separate context: the founder session would otherwise bounce /login
      // straight back to /founder and the admin could never sign in.
      const adminContext = await browser.newContext({ reducedMotion: 'reduce' });
      const adminPage = await adminContext.newPage();
      await loginAs(adminPage, DEMO_USERS.admin);

      await adminPage
        .getByRole('link', { name: 'Payments', exact: true })
        .click();
      await expect(adminPage).toHaveURL('/admin/payments');

      // Scope to the unique amount created above so a pre-seeded order cannot
      // be confirmed by mistake.
      const order = adminPage
        .locator('li')
        .filter({ hasText: 'Full Support shortlist' })
        .filter({ hasText: orderAmountLabel })
        .first();
      await expect(order).toBeVisible();

      // The admin must be able to open proof before money is confirmed.
      const proof = order.getByRole('link', { name: 'View payment screenshot' });
      await expect(proof).toBeVisible();
      const proofUrl = await proof.getAttribute('href');
      expect(proofUrl).toMatch(/^https:\/\//);
      if (!proofUrl) throw new Error('Payment screenshot link has no href');
      const proofResponse = await adminPage.request.get(proofUrl);
      expect(proofResponse.ok()).toBeTruthy();
      expect(proofResponse.headers()['content-type']).toMatch(/^image\//);

      await expect(
        order.getByRole('button', { name: 'Confirm payment' })
      ).toBeEnabled();
      await order.getByRole('button', { name: 'Confirm payment' }).click();
      await expect(adminPage.getByRole('status')).toContainText(
        'Payment confirmed',
        { timeout: 20_000 }
      );

      await adminPage.close();
      await adminContext.close();
    });

    await test.step('Founder sees unlocked shortlist', async () => {
      await page.reload();

      // Scope to the order created by this run; older confirmed orders must
      // never be able to satisfy the assertion.
      const confirmedOrder = page
        .getByRole('listitem')
        .filter({ hasText: orderAmountLabel })
        .first();
      await expect(
        confirmedOrder.getByText('Payment confirmed')
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Your shortlist' })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: /View .*'s CV \(rank 1\)/ })
      ).toBeVisible();
    });
  });
});
