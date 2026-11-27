import type { MetadataRoute } from 'next';
import { APP_URL } from '@/config/app';

/** Public routes only — dashboard and account pages must not be indexed. */
const PUBLIC_ROUTES: { path: string; frequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', frequency: 'weekly', priority: 1 },
  // /public is a compatibility alias and intentionally not indexed twice.
  { path: '/how-it-works', frequency: 'monthly', priority: 0.9 },
  { path: '/for-students', frequency: 'monthly', priority: 0.9 },
  { path: '/for-founders', frequency: 'monthly', priority: 0.9 },
  { path: '/about', frequency: 'monthly', priority: 0.7 },
  { path: '/faq', frequency: 'monthly', priority: 0.8 },
  { path: '/contact', frequency: 'monthly', priority: 0.8 },
  { path: '/privacy', frequency: 'yearly', priority: 0.5 },
  { path: '/terms', frequency: 'yearly', priority: 0.5 },
  { path: '/login', frequency: 'yearly', priority: 0.3 },
  { path: '/signup', frequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = APP_URL.replace(/\/$/, '');

  return PUBLIC_ROUTES.map(({ path, frequency, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: frequency,
    priority,
  }));
}
