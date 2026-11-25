/**
 * Server-only auth helpers backed by Neon Managed Better Auth.
 * Neon remains the source of truth for application roles. A failed or unknown
 * role lookup never grants access — the NeonDataError propagates so callers
 * fail closed. Do not import this module from a Client Component.
 */
import { auth } from '@/lib/auth/server';
import { getProfileRole, type Role } from '@/lib/neon-data';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';

export type { Role };

export type AuthUser = { id: string; email: string; name?: string | null };

/** Returns the verified session user, or null when signed out. */
export async function getUser(): Promise<AuthUser | null> {
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: 'name' in user ? (user.name as string | null) : null,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) throw new AuthenticationError();
  return user;
}

export async function getUserRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

export async function requireRole(allowed: Role | readonly Role[]) {
  const user = await requireUser();
  const accepted: readonly Role[] = typeof allowed === 'string' ? [allowed] : allowed;
  const role = await getProfileRole(user.id);
  if (!role || !accepted.includes(role)) throw new AuthorizationError();
  return { user, role };
}
