/**
 * Typed application errors. Each class keeps the `name` + optional `code`
 * shape of `NeonDataError`, so callers can treat provider and app errors the
 * same way, with an HTTP status for API routes.
 */
export class AppError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, code?: string, status = 500) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Not signed in.') {
    super(message, 'auth/unauthenticated', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have access to this resource.') {
    super(message, 'auth/forbidden', 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'validation/failed', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(message, 'resource/not-found', 404);
  }
}

export class StorageError extends AppError {
  constructor(message = 'Could not access the file.', code = 'storage/failed') {
    super(message, code, 502);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Safe status for API responses; unknown errors stay opaque (500). */
export function errorStatus(error: unknown): number {
  return isAppError(error) ? error.status : 500;
}

/** Message for server logs only — never send an unknown error message to a client. */
export function logMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
