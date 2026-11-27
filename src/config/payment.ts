/**
 * Payment configuration — MVP manual payment details.
 *
 * Production must set NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER and
 * NEXT_PUBLIC_PAYMENT_MBOB_NUMBER to the real Bank of Bhutan account and mBoB
 * number. Never hardcode them here: blank or whitespace-only env values keep
 * PAYMENT_CONFIGURED false, so the UI pauses new orders instead of asking
 * founders to pay to a fake or blank destination.
 */
export const PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceRange: 'Nu 500–1,000',
    defaultAmount: 750,
    minStudents: 3,
    maxStudents: 5,
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
    minStudents: 5,
    maxStudents: 10,
    features: [
      'Everything in Basic',
      'Ranked shortlist of 5–10 students',
      'Admin-finalized ranking',
      'Student availability from profiles',
      'Founder outreach contact details',
    ],
  },
} as const;

export type PackageId = keyof typeof PACKAGES;

export const PAYMENT_DETAILS = {
  bank: {
    bankName: 'Bank of Bhutan',
    accountName: 'Bhutan Tech Connect',
    accountNumber: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ?? '',
    branch: 'Thimphu',
  },
  mbob: {
    label: 'mBoB (mobile banking)',
    number: process.env.NEXT_PUBLIC_PAYMENT_MBOB_NUMBER ?? '',
    name: 'Bhutan Tech Connect',
  },
  note: 'Upload your payment screenshot, then an admin confirms it.',
};

/**
 * False until both real payment destinations are supplied through the
 * environment. The UI blocks new orders and shows an explicit notice instead
 * of blank numbers, so founders cannot pay to nowhere.
 */
export const PAYMENT_CONFIGURED = Boolean(
  PAYMENT_DETAILS.bank.accountNumber.trim() && PAYMENT_DETAILS.mbob.number.trim()
);
