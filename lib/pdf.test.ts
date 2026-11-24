import { describe, it, expect } from 'vitest';
import { buildPdf } from '@/lib/pdf';

describe('buildPdf', () => {
  it('produces a valid PDF header', () => {
    const pdf = buildPdf('Test Title', ['Line one', 'Line two']);
    const bytes = Array.from(pdf);
    const header = bytes.slice(0, 5);
    expect(header).toEqual([37, 80, 68, 70, 45]); // %PDF-
  });

  it('includes the title in the content stream', () => {
    const pdf = buildPdf('My Title', ['Body line']);
    const text = new TextDecoder().decode(pdf);
    expect(text).toContain('My Title');
    expect(text).toContain('Body line');
  });

  it('escapes parentheses in text', () => {
    const pdf = buildPdf('Title (with parens)', ['Normal line']);
    const text = new TextDecoder().decode(pdf);
    // Escaped parentheses should appear in the content stream
    expect(text).toContain('\\(with parens\\)');
  });

  it('wraps long lines', () => {
    const longLine = 'A'.repeat(200);
    const pdf = buildPdf('Title', [longLine]);
    const text = new TextDecoder().decode(pdf);
    // Should contain Tj operators for wrapped lines
    expect((text.match(/Tj/g) || []).length).toBeGreaterThan(1);
  });

  it('returns a Uint8Array', () => {
    const pdf = buildPdf('Title', []);
    expect(pdf).toBeInstanceOf(Uint8Array);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it('handles empty lines array', () => {
    const pdf = buildPdf('Title', []);
    expect(pdf.length).toBeGreaterThan(0);
    const text = new TextDecoder().decode(pdf);
    expect(text).toContain('Title');
  });
});
