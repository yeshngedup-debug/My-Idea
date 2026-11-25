/**
 * Shared E2E test object.
 *
 * Every flow imports `test`/`expect` from here so the Neon Auth + Neon
 * Postgres reachability guard runs before any page interaction. Importing
 * `@playwright/test` directly would bypass the guard and turn an unavailable
 * database into a wall of confusing navigation timeouts.
 */
import { test as base, expect, type TestInfo } from '@playwright/test';
import { requireSeededDb } from './db';

export const test = base;

test.beforeEach(async ({}, testInfo: TestInfo) => {
  await requireSeededDb(testInfo);
});

export { expect };
