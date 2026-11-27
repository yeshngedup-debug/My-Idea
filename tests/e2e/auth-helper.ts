/**
 * Authenticate an E2E test as a SEEDED account.
 *
 * The redesigned /login and /signup pages no longer have a role <select>.
 * Signup always creates a `student` (see app/actions/auth.ts); founder and
 * admin roles are assigned by an admin / SQL. So there is no signup fallback
 * here — E2E signs in with the seeded accounts from demo-users.ts and then
 * asserts the redirect landed in that role's dashboard.
 *
 * No hard sleeps: Playwright's web-first URL assertion retries until the
 * login server action's redirect completes.
 */
import { expect, type Page } from '@playwright/test';
import { ROLE_HOME, type DemoUser } from './demo-users';

// Live Neon Auth sign-in plus the role mirror can exceed Playwright's 5s
// default on a cold dev server. Wait for the actual redirect, with headroom.
const LOGIN_TIMEOUT_MS = 20_000;

export async function loginAs(page: Page, user: DemoUser): Promise<void> {
  if (!user.email || !user.password) {
    throw new Error(
      `Missing seeded credentials for the ${user.role} account. ` +
        `Set E2E_${user.role.toUpperCase()}_EMAIL and ` +
        `E2E_${user.role.toUpperCase()}_PASSWORD, then seed the account ` +
        '(see tests/e2e/demo-users.ts).'
    );
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

  // Labels are the user-facing selectors on the current login page.
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);

  const submit = page.getByRole('button', { name: 'Log in', exact: true });
  await expect(submit).toBeEnabled();
  await submit.click();

  // Outcome: the login server action redirects to the role's dashboard, and
  // middleware keeps the user inside that role area.
  await expect(page).toHaveURL(ROLE_HOME[user.role], { timeout: LOGIN_TIMEOUT_MS });
  await expect(page.getByRole('link', { name: 'Overview', exact: true })).toBeVisible({
    timeout: LOGIN_TIMEOUT_MS,
  });
}
