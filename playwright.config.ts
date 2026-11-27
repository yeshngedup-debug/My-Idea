import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Next.js loads .env and .env.local for the app, but Playwright is a separate
 * process. Load both here, in Next's precedence order, so the E2E DB guard and
 * login helpers see the same Neon project the dev server is using. Real
 * environment variables win.
 */
function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

// Next gives .env.local precedence over .env. Load it first here because
// loadEnvFile() keeps the first value it sees; real process env still wins.
loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Flows share one seeded database and the same founder/admin accounts.
  // Parallel workers mutate shared rows (orders, applications), so run serially.
  workers: 1,
  reporter: 'html',
  // Live Neon Auth + signed proof URLs can make a full flow exceed 30s on the
  // first cold run. Keep the per-assertion timeouts short, but allow the whole
  // journey enough time to finish.
  timeout: 60_000,
  use: {
    baseURL: (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, ''),
    // Flow tests click real controls; reduced motion keeps reveal wrappers
    // static so visibility checks cannot race an opacity transition.
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
