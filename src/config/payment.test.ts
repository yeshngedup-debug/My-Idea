import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const ACCOUNT_VAR = 'NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER';
const MBOB_VAR = 'NEXT_PUBLIC_PAYMENT_MBOB_NUMBER';

function loadPayment() {
  vi.resetModules();
  return import('./payment');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('PACKAGES', () => {
  it('publishes the enforced shortlist size ranges', async () => {
    const { PACKAGES } = await loadPayment();
    expect(PACKAGES.basic).toMatchObject({ minStudents: 3, maxStudents: 5 });
    expect(PACKAGES.full).toMatchObject({ minStudents: 5, maxStudents: 10 });
  });

  it('does not advertise support promises without a tracked workflow', async () => {
    const { PACKAGES } = await loadPayment();
    const fullFeatures = PACKAGES.full.features.join(' ');
    expect(fullFeatures).not.toMatch(/pre-checked/i);
    expect(fullFeatures).not.toMatch(/admin-led/i);
    expect(fullFeatures).not.toMatch(/introduction/i);
    expect(fullFeatures).not.toMatch(/replacement/i);
  });
});

describe('payment configuration', () => {
  it('pauses orders when either destination is missing or blank', async () => {
    vi.stubEnv(ACCOUNT_VAR, '   ');
    vi.stubEnv(MBOB_VAR, '');
    const { PAYMENT_CONFIGURED, PAYMENT_DETAILS } = await loadPayment();

    expect(PAYMENT_CONFIGURED).toBe(false);
    expect(PAYMENT_DETAILS.bank.accountNumber).toBe('   ');
    expect(PAYMENT_DETAILS.mbob.number).toBe('');
  });

  it('enables orders only when both env-driven destinations are present', async () => {
    vi.stubEnv(ACCOUNT_VAR, ' 1234567 ');
    vi.stubEnv(MBOB_VAR, ' 9876543 ');
    const { PAYMENT_CONFIGURED, PAYMENT_DETAILS } = await loadPayment();

    expect(PAYMENT_CONFIGURED).toBe(true);
    expect(PAYMENT_DETAILS.bank.accountNumber).toBe(' 1234567 ');
    expect(PAYMENT_DETAILS.mbob.number).toBe(' 9876543 ');
  });

  it('never hardcodes a long bank or mBoB number in source', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/config/payment.ts'),
      'utf8'
    );
    expect(source).not.toMatch(/\b\d{7,}\b/);
  });
});
