import type { MetadataRoute } from 'next';
import { APP_URL } from '@/config/app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated areas and private file proxies must never be indexed.
      disallow: ['/admin/', '/founder/', '/student/', '/api/', '/auth/'],
    },
    sitemap: `${APP_URL.replace(/\/$/, '')}/sitemap.xml`,
  };
}
