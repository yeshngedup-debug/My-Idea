import { describe, expect, it } from 'vitest';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  StorageError,
  NotFoundError,
  isAppError,
  errorStatus,
  logMessage,
} from '@/lib/errors';

describe('AppError', () => {
  it('keeps the message, code and status supplied by the caller', () => {
    const error = new AppError('Boom', 'custom/code', 418);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.message).toBe('Boom');
    expect(error.code).toBe('custom/code');
    expect(error.status).toBe(418);
  });

  it('defaults to status 500 and no code', () => {
    const error = new AppError('Plain failure');

    expect(error.message).toBe('Plain failure');
    expect(error.code).toBeUndefined();
    expect(error.status).toBe(500);
    expect(error.name).toBe('AppError');
  });

  it('uses the concrete class name for subclasses', () => {
    expect(new ValidationError('Bad input').name).toBe('ValidationError');
    expect(new AppError('x').name).toBe('AppError');
  });
});

describe('typed error subclasses', () => {
  it('AuthenticationError is a 401 with the unauthenticated code', () => {
    const error = new AuthenticationError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Not signed in.');
    expect(error.code).toBe('auth/unauthenticated');
    expect(error.status).toBe(401);
    expect(error.name).toBe('AuthenticationError');
  });

  it('AuthenticationError accepts a custom message', () => {
    expect(new AuthenticationError('Session expired').message).toBe('Session expired');
  });

  it('AuthorizationError is a 403 with the forbidden code', () => {
    const error = new AuthorizationError();

    expect(error.message).toBe('You do not have access to this resource.');
    expect(error.code).toBe('auth/forbidden');
    expect(error.status).toBe(403);
    expect(error.name).toBe('AuthorizationError');
  });

  it('AuthorizationError accepts a custom message', () => {
    expect(new AuthorizationError('Admins only').message).toBe('Admins only');
  });

  it('ValidationError is a 400 and requires a message', () => {
    const error = new ValidationError('Use a PDF file.');

    expect(error.message).toBe('Use a PDF file.');
    expect(error.code).toBe('validation/failed');
    expect(error.status).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('NotFoundError is a 404 with the not-found code', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Resource not found.');
    expect(error.code).toBe('resource/not-found');
    expect(error.status).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('NotFoundError accepts a custom message', () => {
    expect(new NotFoundError('No such project').message).toBe('No such project');
  });

  it('StorageError is a 502 with a configurable message and code', () => {
    const fallback = new StorageError();
    const custom = new StorageError('Could not upload the CV.', 'storage/upload-failed');

    expect(fallback.message).toBe('Could not access the file.');
    expect(fallback.code).toBe('storage/failed');
    expect(fallback.status).toBe(502);
    expect(fallback.name).toBe('StorageError');

    expect(custom.message).toBe('Could not upload the CV.');
    expect(custom.code).toBe('storage/upload-failed');
    expect(custom.status).toBe(502);
  });
});

describe('isAppError', () => {
  it('recognises AppError and every subclass', () => {
    const errors: AppError[] = [
      new AppError('x'),
      new AuthenticationError(),
      new AuthorizationError(),
      new ValidationError('x'),
      new NotFoundError(),
      new StorageError(),
    ];

    for (const error of errors) expect(isAppError(error)).toBe(true);
  });

  it('rejects plain errors and non-error values', () => {
    expect(isAppError(new Error('plain'))).toBe(false);
    expect(isAppError({ message: 'x', status: 400 })).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('boom')).toBe(false);
  });
});

describe('errorStatus', () => {
  it('uses the status carried by an AppError', () => {
    expect(errorStatus(new ValidationError('x'))).toBe(400);
    expect(errorStatus(new AuthenticationError())).toBe(401);
    expect(errorStatus(new AuthorizationError())).toBe(403);
    expect(errorStatus(new NotFoundError())).toBe(404);
    expect(errorStatus(new StorageError())).toBe(502);
    expect(errorStatus(new AppError('x', 'custom', 418))).toBe(418);
  });

  it('keeps unknown errors opaque at 500', () => {
    expect(errorStatus(new Error('database password is secret'))).toBe(500);
    expect(errorStatus(null)).toBe(500);
    expect(errorStatus('boom')).toBe(500);
  });
});

describe('logMessage', () => {
  it('returns the message of any Error, including AppError', () => {
    expect(logMessage(new Error('plain failure'))).toBe('plain failure');
    expect(logMessage(new StorageError('storage is down'))).toBe('storage is down');
  });

  it('falls back to a safe placeholder for non-errors', () => {
    expect(logMessage(null)).toBe('Unknown error');
    expect(logMessage(undefined)).toBe('Unknown error');
    expect(logMessage({ message: 'looks like an error' })).toBe('Unknown error');
    expect(logMessage('boom')).toBe('Unknown error');
  });
});
