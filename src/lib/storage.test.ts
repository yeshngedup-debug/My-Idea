import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// vitest.setup.ts auto-mocks this module for application tests. This file
// exercises the real implementation behind a fake files-sdk adapter.
vi.unmock('@/lib/storage');

const harness = vi.hoisted(() => {
  const upload = vi.fn();
  const signedUrl = vi.fn();
  const remove = vi.fn();
  const exists = vi.fn();
  const adapter = { fake: 'neon-adapter' };
  const neon = vi.fn((_config?: unknown) => adapter);
  const filesInstance = { upload, url: signedUrl, delete: remove, exists };
  const Files = vi.fn(function FilesConstructor(_options?: unknown) {
    return filesInstance;
  });

  return { upload, signedUrl, remove, exists, adapter, neon, Files };
});

vi.mock('files-sdk', () => ({ Files: harness.Files }));
vi.mock('files-sdk/neon', () => ({ neon: harness.neon }));

type Storage = typeof import('@/lib/storage');
type Constants = typeof import('@/lib/constants');
type Errors = typeof import('@/lib/errors');
let storage: Storage;
let constants: Constants;
let errors: Errors;

function makePdf(name = 'cv.pdf', content = '%PDF-1.4\nsmall test cv'): File {
  return new File([content], name, { type: 'application/pdf' });
}

beforeEach(async () => {
  // The module caches its Files client, so re-import it for isolated cases.
  vi.resetModules();
  harness.upload.mockReset().mockResolvedValue(undefined);
  harness.signedUrl.mockReset().mockResolvedValue('https://storage.test/signed');
  harness.remove.mockReset().mockResolvedValue(undefined);
  harness.exists.mockReset().mockResolvedValue(true);
  harness.neon.mockReset().mockReturnValue(harness.adapter);
  harness.Files.mockClear();
  // Import after the reset so these share the module instance storage uses.
  storage = await import('@/lib/storage');
  constants = await import('@/lib/constants');
  errors = await import('@/lib/errors');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cvObjectPath', () => {
  it('builds a per-user, per-attempt path in the private bucket', () => {
    expect(storage.cvObjectPath('user-1', 'upload-7')).toBe('user-1/cv-upload-7.pdf');
  });

  it('does not rewrite special characters in the identifiers', () => {
    expect(storage.cvObjectPath('a/b', 'c d')).toBe('a/b/cv-c d.pdf');
  });
});

describe('getFiles', () => {
  it('creates the Neon adapter and Files client once, then reuses them', async () => {
    expect(harness.Files).not.toHaveBeenCalled();

    await storage.cvFileExists('user-1/cv-1.pdf');
    await storage.signCv('user-1/cv-1.pdf');

    expect(harness.neon).toHaveBeenCalledTimes(1);
    expect(harness.neon).toHaveBeenCalledWith({ bucket: constants.STORAGE_BUCKETS.cvs });
    expect(harness.Files).toHaveBeenCalledTimes(1);
    expect(harness.Files).toHaveBeenCalledWith({ adapter: harness.adapter });
  });
});

describe('uploadCv', () => {
  it('uploads a valid PDF to the per-attempt path', async () => {
    const file = makePdf();

    const path = await storage.uploadCv('user-1', file, 'upload-7');

    expect(path).toBe('user-1/cv-upload-7.pdf');
    expect(harness.upload).toHaveBeenCalledWith(path, file, { contentType: 'application/pdf' });
  });

  it('accepts an uppercase PDF extension', async () => {
    await expect(storage.uploadCv('user-1', makePdf('CV.PDF'), 'u')).resolves.toBe(
      'user-1/cv-u.pdf'
    );
    expect(harness.upload).toHaveBeenCalledTimes(1);
  });

  it('generates an upload id from crypto.randomUUID when none is supplied', async () => {
    const file = makePdf();
    const uuid = '11111111-2222-3333-4444-555555555555';
    const randomUuid = vi.fn(() => uuid);
    vi.stubGlobal('crypto', { ...globalThis.crypto, randomUUID: randomUuid });

    await expect(storage.uploadCv('user-1', file)).resolves.toBe(`user-1/cv-${uuid}.pdf`);
    expect(randomUuid).toHaveBeenCalledTimes(1);
  });

  it('falls back to a timestamp id when crypto.randomUUID is unavailable', async () => {
    const file = makePdf();
    vi.stubGlobal('crypto', { randomUUID: undefined });
    // Object.create keeps Math.max and friends for jsdom's Blob implementation.
    vi.stubGlobal('Math', Object.assign(Object.create(Math), { random: () => 0.5 }));

    const path = await storage.uploadCv('user-1', file);

    expect(path).toMatch(/^user-1\/cv-\d+-.+\.pdf$/);
    expect(harness.upload).toHaveBeenCalledWith(path, file, { contentType: 'application/pdf' });
  });

  it('rejects an empty file before touching storage', async () => {
    const file = new File([], 'cv.pdf', { type: 'application/pdf' });
    expect(file.size).toBe(0);

    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toBeInstanceOf(errors.ValidationError);
    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toThrow(
      'PDF must be 5 MB or smaller.'
    );
    expect(harness.upload).not.toHaveBeenCalled();
  });

  it('rejects a file larger than the upload limit', async () => {
    const file = makePdf();
    Object.defineProperty(file, 'size', { value: constants.MAX_UPLOAD_BYTES + 1 });

    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toBeInstanceOf(errors.ValidationError);
    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toThrow(
      'PDF must be 5 MB or smaller.'
    );
    expect(harness.upload).not.toHaveBeenCalled();
  });

  it('rejects a non-PDF MIME type', async () => {
    const file = new File(['%PDF-1.4'], 'cv.pdf', { type: 'text/plain' });

    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toThrow('Use a PDF file.');
    expect(harness.upload).not.toHaveBeenCalled();
  });

  it('rejects a PDF MIME type with a non-PDF filename', async () => {
    const file = new File(['%PDF-1.4'], 'cv.txt', { type: 'application/pdf' });

    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toThrow('Use a PDF file.');
    expect(harness.upload).not.toHaveBeenCalled();
  });

  it('rejects a file whose bytes do not start with the PDF header', async () => {
    const file = new File(['this is not a pdf'], 'cv.pdf', { type: 'application/pdf' });

    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toBeInstanceOf(errors.ValidationError);
    await expect(storage.uploadCv('user-1', file, 'u')).rejects.toThrow('Use a valid PDF file.');
    expect(harness.upload).not.toHaveBeenCalled();
  });

  it('wraps an adapter upload failure in a StorageError', async () => {
    harness.upload.mockRejectedValue(new Error('S3 is down'));

    await expect(storage.uploadCv('user-1', makePdf(), 'u')).rejects.toMatchObject({
      name: 'StorageError',
      message: 'Could not upload the CV.',
      code: 'storage/upload-failed',
      status: 502,
    });
    await expect(storage.uploadCv('user-1', makePdf(), 'u')).rejects.toBeInstanceOf(errors.StorageError);
  });
});

describe('signCv', () => {
  it('mints a signed URL with the default TTL', async () => {
    await expect(storage.signCv('user-1/cv-1.pdf')).resolves.toBe('https://storage.test/signed');
    expect(harness.signedUrl).toHaveBeenCalledWith('user-1/cv-1.pdf', {
      expiresIn: constants.CV_SIGNED_URL_TTL_SECONDS,
    });
  });

  it('honours a custom TTL', async () => {
    await expect(storage.signCv('user-1/cv-1.pdf', 42)).resolves.toBe(
      'https://storage.test/signed'
    );
    expect(harness.signedUrl).toHaveBeenCalledWith('user-1/cv-1.pdf', { expiresIn: 42 });
  });

  it('wraps an adapter signing failure in a StorageError', async () => {
    harness.signedUrl.mockRejectedValue(new Error('signing failed'));

    await expect(storage.signCv('user-1/cv-1.pdf')).rejects.toMatchObject({
      name: 'StorageError',
      message: 'Could not open the CV right now.',
      code: 'storage/sign-failed',
      status: 502,
    });
    await expect(storage.signCv('user-1/cv-1.pdf')).rejects.toBeInstanceOf(errors.StorageError);
  });
});

describe('removeCv', () => {
  it('deletes the object at the given path', async () => {
    await expect(storage.removeCv('user-1/cv-1.pdf')).resolves.toBeUndefined();
    expect(harness.remove).toHaveBeenCalledWith('user-1/cv-1.pdf');
  });

  it('wraps an adapter delete failure in a StorageError', async () => {
    harness.remove.mockRejectedValue(new Error('delete failed'));

    await expect(storage.removeCv('user-1/cv-1.pdf')).rejects.toMatchObject({
      name: 'StorageError',
      message: 'Could not remove the CV.',
      code: 'storage/remove-failed',
      status: 502,
    });
    await expect(storage.removeCv('user-1/cv-1.pdf')).rejects.toBeInstanceOf(errors.StorageError);
  });
});

describe('cvFileExists', () => {
  it('returns true when the object exists', async () => {
    harness.exists.mockResolvedValueOnce(true);

    await expect(storage.cvFileExists('user-1/cv-1.pdf')).resolves.toBe(true);
    expect(harness.exists).toHaveBeenCalledWith('user-1/cv-1.pdf');
  });

  it('returns false when the object is missing', async () => {
    harness.exists.mockResolvedValueOnce(false);

    await expect(storage.cvFileExists('user-1/missing.pdf')).resolves.toBe(false);
  });

  it('wraps an adapter existence-check failure in a StorageError', async () => {
    harness.exists.mockRejectedValue(new Error('head request failed'));

    await expect(storage.cvFileExists('user-1/cv-1.pdf')).rejects.toMatchObject({
      name: 'StorageError',
      message: 'Could not check the CV.',
      code: 'storage/check-failed',
      status: 502,
    });
    await expect(storage.cvFileExists('user-1/cv-1.pdf')).rejects.toBeInstanceOf(errors.StorageError);
  });
});
