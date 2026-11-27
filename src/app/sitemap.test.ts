import { describe, expect, it } from 'vitest';
import { APP_URL } from '@/config/app';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('contains each public marketing route with an absolute URL', () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const path of [
      '/',
      '/how-it-works',
      '/for-students',
      '/for-founders',
      '/about',
      '/faq',
      '/contact',
    ]) {
      expect(urls).toContain(`${APP_URL.replace(/\/$/, '')}${path}`);
    }

    expect(urls.some((url) => url.endsWith('/public'))).toBe(false);
  });

  it('does not expose authenticated workspaces', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.includes('/student/'))).toBe(false);
    expect(urls.some((url) => url.includes('/founder/'))).toBe(false);
    expect(urls.some((url) => url.includes('/admin/'))).toBe(false);
  });
});
