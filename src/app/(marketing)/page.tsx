import { permanentRedirect } from 'next/navigation';

/**
 * Root path fallback.
 *
 * The real redirect is configured in next.config.ts so "/" answers with a 308
 * before any rendering starts. This component is the route-level safety net:
 * if the config rule is ever removed, the root still lands on the landing
 * page instead of a 404.
 */
export default function RootPage() {
  permanentRedirect('/public');
}
