/**
 * Payment configuration — MVP manual payment details.
 *
 * ⚠️ TODO before real users pay:
 *   1. Replace `accountNumber` with your real Bank of Bhutan account number.
 *   2. Replace `number` (mBoB) with your real mobile banking number.
 *   The values are intentionally empty — the payment screen will show
 *   blanks until you fill them in, so fake numbers can never ship.
 */
export const PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceRange: 'Nu 500–1,000',
    defaultAmount: 750,
    features: [
      'Ranked shortlist of 3–5 students',
      'Name, skills, college, contact',
      'CV links included',
      'Delivered within 2 working days',
    ],
  },
  full: {
    id: 'full',
    name: 'Full Support',
    priceRange: 'Nu 1,000–2,000',
    defaultAmount: 1500,
    features: [
      'Everything in Basic',
      'Ranked shortlist of 5–10 students',
      'Availability pre-checked with students',
      'Admin-led intro to each student',
      'One replacement if a student drops out',
    ],
  },
} as const;

export type PackageId = keyof typeof PACKAGES;

export const PAYMENT_DETAILS = {
  bank: {
    bankName: 'Bank of Bhutan',
    accountName: 'Bhutan Tech Connect',
    accountNumber: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ?? '', // TODO: real account number in production
    branch: 'Thimphu',
  },
  mbob: {
    label: 'mBoB (mobile banking)',
    number: process.env.NEXT_PUBLIC_PAYMENT_MBOB_NUMBER ?? '', // TODO: real mBoB number in production
    name: 'Bhutan Tech Connect',
  },
  note: 'Upload your payment screenshot, then an admin confirms it.',
};

/**
 * False until both real payment destinations are filled in above. The UI
 * blocks new orders and shows an explicit notice instead of blank numbers,
 * so founders cannot pay to nowhere.
 */
export const PAYMENT_CONFIGURED = Boolean(
  PAYMENT_DETAILS.bank.accountNumber.trim() && PAYMENT_DETAILS.mbob.number.trim()
);
