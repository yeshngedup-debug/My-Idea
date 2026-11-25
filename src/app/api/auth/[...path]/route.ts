import { auth } from '@/lib/auth/server';

type AuthContext = { params: Promise<{ path: string[] }> };
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Resolve the handler per request so builds do not need auth secrets. */
function route(method: Method) {
  return async (request: Request, context: AuthContext) => {
    const handlers = auth.handler();
    return handlers[method](request, context);
  };
}

export const GET = route('GET');
export const POST = route('POST');
export const PUT = route('PUT');
export const PATCH = route('PATCH');
export const DELETE = route('DELETE');
