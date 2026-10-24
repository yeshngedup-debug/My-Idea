/**
 * Payment configuration — MVP manual payment details.
 * Replace the placeholder values with your real bank / mBoB details.
 */
export const PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceRange: 'Nu 500 - 1,000',
    defaultAmount: 750,
    features: [
      'Ranked shortlist of 3-5 students',
      'Name, skills, college, contact',
      'CV links included',
      'Delivered within 2 working days',
    ],
  },
  full: {
    id: 'full',
    name: 'Full Support',
    priceRange: 'Nu 1,000 - 2,000',
    defaultAmount: 1500,
    features: [
      'Everything in Basic',
      'Ranked shortlist of 5-10 students',
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
    accountNumber: '0000000000', // TODO: replace with real account number
    branch: 'Thimphu',
  },
  mbob: {
    label: 'mBoB (mobile banking)',
    number: '7777777777', // TODO: replace with real mBoB number
    name: 'Bhutan Tech Connect',
  },
  note: 'After paying, upload the payment screenshot below. The admin verifies it manually (usually within a day) and unlocks your shortlist.',
};
