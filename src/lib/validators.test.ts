import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  saveStudentProfileSchema,
  shortlistOrderSchema,
} from '@/lib/validators';

describe('createProjectSchema', () => {
  it('accepts a valid project', () => {
    const result = createProjectSchema.safeParse({
      title: 'Build a landing page',
      description: 'A simple landing page for my startup with a contact form.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: 'React, Tailwind, Figma',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(['React', 'Tailwind', 'Figma']);
    }
  });

  it('rejects a title shorter than 5 chars', () => {
    const result = createProjectSchema.safeParse({
      title: 'Hi',
      description: 'A valid description that is long enough.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Title must be at least 5 characters.');
    }
  });

  it('rejects a description shorter than 20 chars', () => {
    const result = createProjectSchema.safeParse({
      title: 'Valid Title',
      description: 'Too short',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Description must be at least 20 characters.');
    }
  });

  it('rejects a title longer than 120 chars', () => {
    const result = createProjectSchema.safeParse({
      title: 'x'.repeat(121),
      description: 'A valid description that is long enough.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Title must be at most 120 characters.');
    }
  });

  it('rejects budgets outside numeric(10,2)', () => {
    const result = createProjectSchema.safeParse({
      title: 'Valid Title',
      description: 'A valid description that is long enough.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 100000000,
      budgetMax: 100000000,
      skills: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Budget must be at most 99999999.99.');
    }
  });

  it('rejects budget min greater than max', () => {
    const result = createProjectSchema.safeParse({
      title: 'Valid Title',
      description: 'A valid description that is long enough.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 2000,
      budgetMax: 1000,
      skills: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Budget minimum cannot exceed maximum.');
    }
  });

  it('rejects an invalid duration', () => {
    const result = createProjectSchema.safeParse({
      title: 'Valid Title',
      description: 'A valid description that is long enough.',
      duration: '6 months',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: '',
    });
    expect(result.success).toBe(false);
  });

  it('trims skills', () => {
    const result = createProjectSchema.safeParse({
      title: 'Valid Title',
      description: 'A valid description that is long enough.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: '  React  ,  Tailwind  ,  Figma  , ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(['React', 'Tailwind', 'Figma']);
    }
  });

  it('rejects more than 15 skills instead of truncating', () => {
    const result = createProjectSchema.safeParse({
      title: 'Valid Title',
      description: 'A valid description that is long enough.',
      duration: '1 month',
      workMode: 'remote',
      deadline: '',
      budgetMin: 500,
      budgetMax: 1000,
      skills: Array.from({ length: 16 }, (_, i) => `Skill ${i + 1}`).join(','),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('You can add up to 15 skills.');
    }
  });
});

describe('saveStudentProfileSchema', () => {
  it('accepts a valid profile', () => {
    const result = saveStudentProfileSchema.safeParse({
      full_name: 'Tashi Dorji',
      college: 'Royal Thimphu College',
      course: 'BSc Computer Science',
      year: '3rd',
      availability: 'weekdays',
      skills: 'React, TypeScript',
      bio: 'Final-year CS student looking for part-time work.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(['React', 'TypeScript']);
    }
  });

  it('rejects empty full_name', () => {
    const result = saveStudentProfileSchema.safeParse({
      full_name: '',
      college: 'RTC',
      course: 'CS',
      year: '',
      availability: '',
      skills: '',
      bio: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Full name is required.');
    }
  });

  it('rejects a one-character full_name', () => {
    const result = saveStudentProfileSchema.safeParse({
      full_name: 'T',
      college: 'RTC',
      course: 'CS',
      year: '',
      availability: '',
      skills: '',
      bio: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) =>
        issue.message.includes('Enter your full name (at least 2 characters).')
      )).toBe(true);
    }
  });

  it('rejects bio longer than 600 chars', () => {
    const result = saveStudentProfileSchema.safeParse({
      full_name: 'Tashi Dorji',
      college: '',
      course: '',
      year: '',
      availability: '',
      skills: '',
      bio: 'x'.repeat(601),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Bio must be at most 600 characters.');
    }
  });
});

describe('shortlistOrderSchema', () => {
  it('accepts valid order data', () => {
    const result = shortlistOrderSchema.safeParse({
      packageId: 'full',
      projectId: '',
      amount: 1500,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-positive amount', () => {
    const result = shortlistOrderSchema.safeParse({
      packageId: 'basic',
      projectId: '',
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('accepts any packageId string (package validity checked at function boundary)', () => {
    const result = shortlistOrderSchema.safeParse({
      packageId: 'premium',
      projectId: '',
      amount: 1000,
    });
    expect(result.success).toBe(true);
  });
});
