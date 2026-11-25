/**
 * Auth data reads/writes. Thin wrappers over the existing Neon helpers —
 * no SQL and no database client of our own. Neon Managed Better Auth is the
 * identity source of truth; these calls only mirror its role into app tables.
 */
import { ensureProfile, getProfileRole, syncProfileRole } from '@/lib/neon-data';
import type { Role } from './types';

/** Role lookup used for dashboard routing after login and in the callback. */
export async function loadUserRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

/** Mirror a freshly signed-up user into Neon with the server-assigned role. */
export async function mirrorNewUser(userId: string, fullName: string | null): Promise<void> {
  await ensureProfile(userId, fullName);
}

/** Reconcile the Neon role with the identity provider on every login. */
export async function mirrorUserRole(
  userId: string,
  fullName: string | null,
  role: Role
): Promise<void> {
  await syncProfileRole(userId, fullName, role);
}
