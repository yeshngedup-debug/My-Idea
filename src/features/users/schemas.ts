/**
 * Zod schemas for student profile inputs.
 *
 * `saveStudentProfileSchema` is the single source of truth for the profile
 * form and is re-exported here. The CV schema mirrors the upload action's
 * MIME / filename / size checks; the action additionally reads the first
 * bytes and requires the `%PDF-` magic header, which a schema cannot do.
 */
import { z } from 'zod';

export { saveStudentProfileSchema } from '@/lib/validators';

export const MAX_CV_BYTES = 5 * 1024 * 1024;
export const CV_MIME_TYPE = 'application/pdf';
export const PDF_MAGIC = '%PDF-';

export const cvUploadSchema = z
  .object({
    cv: z.custom<File>(
      (value) => typeof File !== 'undefined' && value instanceof File && value.size > 0,
      'Choose a PDF first.'
    ),
  })
  .superRefine((value, ctx) => {
    const file = value.cv;
    if (typeof File === 'undefined' || !(file instanceof File)) return; // base check already reported
    if (file.type !== CV_MIME_TYPE || !file.name.toLowerCase().endsWith('.pdf')) {
      ctx.addIssue({ code: 'custom', message: 'Use a PDF file.' });
    }
    if (file.size > MAX_CV_BYTES) {
      ctx.addIssue({ code: 'custom', message: 'PDF must be 5 MB or smaller.' });
    }
  });

/** True when the file begins with the PDF magic bytes checked by `uploadCv`. */
export async function hasPdfHeader(file: File): Promise<boolean> {
  const header = new TextDecoder().decode(
    await file.slice(0, PDF_MAGIC.length).arrayBuffer()
  );
  return header === PDF_MAGIC;
}
