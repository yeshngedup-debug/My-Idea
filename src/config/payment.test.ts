import { describe, it, expect } from 'vitest';
import { PACKAGES } from './payment';

describe('PACKAGES', () => {
  it('publishes the enforced shortlist size ranges', () => {
    expect(PACKAGES.basic).toMatchObject({ minStudents: 3, maxStudents: 5 });
    expect(PACKAGES.full).toMatchObject({ minStudents: 5, maxStudents: 10 });
  });

  it('does not advertise support promises without a tracked workflow', () => {
    const fullFeatures = PACKAGES.full.features.join(' ');
    expect(fullFeatures).not.toMatch(/pre-checked/i);
    expect(fullFeatures).not.toMatch(/admin-led/i);
    expect(fullFeatures).not.toMatch(/introduction/i);
    expect(fullFeatures).not.toMatch(/replacement/i);
  });
});
