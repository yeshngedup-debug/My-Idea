/**
 * Minimal dependency-free PDF builder (single page, Helvetica).
 * Produces a valid PDF 1.4 byte stream for simple text documents.
 */

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Wrap a line to roughly maxChars using word boundaries. */
function wrapLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(/\s+/);
  const out: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) out.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) out.push(current.trim());
  return out;
}

/**
 * Build a one-page PDF. `title` renders bold 15pt; `lines` render 10pt.
 * Lines longer than ~95 chars wrap automatically. Keep under ~50 lines.
 */
export function buildPdf(title: string, lines: string[]): Uint8Array {
  const contentParts: string[] = ['BT'];

  // Title
  contentParts.push('/F2 15 Tf');
  contentParts.push('50 792 Td');
  contentParts.push(`(${escapePdfText(title)}) Tj`);

  // Body
  contentParts.push('/F1 10 Tf');
  let first = true;
  for (const raw of lines) {
    for (const line of wrapLine(raw, 95)) {
      contentParts.push(first ? '0 -22 Td' : '0 -14 Td');
      contentParts.push(`(${escapePdfText(line)}) Tj`);
      first = false;
    }
  }
  contentParts.push('ET');

  const stream = contentParts.join('\n');

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  // ASCII-only content, so byte length === string length
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}
