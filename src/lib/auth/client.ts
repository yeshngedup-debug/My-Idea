'use client';

import { createAuthClient } from '@neon/auth/next';

/** Browser auth client. Talks to the same-origin /api/auth proxy. */
export const authClient = createAuthClient();
