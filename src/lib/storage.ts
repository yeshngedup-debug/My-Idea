/**
 * Private file storage backed by Neon Object Storage (S3-compatible).
 *
 * The `cvs` bucket is private: never hand out a public URL. The /api/cv/[id]
 * proxy mints a short-lived presigned link only after the caller's relationship
 * with the student has been checked. Credentials come from the AWS_* variables
 * injected by `neon deploy` / `neon env pull`.
 */
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import {
  CV_SIGNED_URL_TTL_SECONDS,
  MAX_UPLOAD_BYTES,
  STORAGE_BUCKETS,
} from '@/lib/constants';
import { StorageError, ValidationError } from '@/lib/errors';

const CV_BUCKET = STORAGE_BUCKETS.cvs;

let files: Files | undefined;
function getFiles(): Files {
  if (!files) files = new Files({ adapter: neon({ bucket: CV_BUCKET }) });
  return files;
}

export function cvObjectPath(userId: string, uploadId: string): string {
  return `${userId}/cv-${uploadId}.pdf`;
}

async function assertPdf(file: File): Promise<void> {
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new ValidationError('PDF must be 5 MB or smaller.');
  }
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
    throw new ValidationError('Use a PDF file.');
  }
  const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (header !== '%PDF-') throw new ValidationError('Use a valid PDF file.');
}

function newUploadId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

/** Upload to a per-attempt path; the caller publishes that path in Neon. */
export async function uploadCv(
  userId: string,
  file: File,
  uploadId: string = newUploadId()
): Promise<string> {
  await assertPdf(file);
  const path = cvObjectPath(userId, uploadId);
  try {
    await getFiles().upload(path, file, { contentType: 'application/pdf' });
  } catch {
    throw new StorageError('Could not upload the CV.', 'storage/upload-failed');
  }
  return path;
}

export async function signCv(
  path: string,
  expiresIn: number = CV_SIGNED_URL_TTL_SECONDS
): Promise<string> {
  try {
    return await getFiles().url(path, { expiresIn });
  } catch {
    throw new StorageError('Could not open the CV right now.', 'storage/sign-failed');
  }
}

export async function removeCv(path: string): Promise<void> {
  try {
    await getFiles().delete(path);
  } catch {
    throw new StorageError('Could not remove the CV.', 'storage/remove-failed');
  }
}

export async function cvFileExists(path: string): Promise<boolean> {
  try {
    return await getFiles().exists(path);
  } catch {
    throw new StorageError('Could not check the CV.', 'storage/check-failed');
  }
}
