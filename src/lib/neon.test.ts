import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;

const harness = vi.hoisted(() => {
  const state: { rows: Row[] } = { rows: [] };
  const sql = vi.fn(
    (_strings: TemplateStringsArray, ..._values: unknown[]) =>
      Promise.resolve(state.rows)
  );
  const neonMock = vi.fn(() => sql);

  return {
    neonMock,
    sql,
    setRows(rows: Row[]) {
      state.rows = rows;
    },
    reset() {
      state.rows = [];
      sql.mockClear();
      neonMock.mockClear();
    },
  };
});

vi.mock('@neondatabase/serverless', () => ({ neon: harness.neonMock }));

const originalDatabaseUrl = process.env.DATABASE_URL;

beforeEach(() => {
  // getSql keeps a module-level client, so reload the module for every case.
  vi.resetModules();
  harness.reset();
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

describe('getSql', () => {
  it('throws a helpful error when DATABASE_URL is missing', async () => {
    const { getSql } = await import('@/lib/neon');
    expect(() => getSql()).toThrow('DATABASE_URL is not set');
    expect(harness.neonMock).not.toHaveBeenCalled();
  });

  it('creates the client once and caches it across calls', async () => {
    process.env.DATABASE_URL = 'postgres://pooled.example/db';
    const { getSql } = await import('@/lib/neon');

    const first = getSql();
    const second = getSql();

    expect(first).toBe(second);
    expect(harness.neonMock).toHaveBeenCalledTimes(1);
    expect(harness.neonMock).toHaveBeenCalledWith('postgres://pooled.example/db');
  });
});

describe('read helpers', () => {
  it('getNeonStats coerces every count to a number', async () => {
    process.env.DATABASE_URL = 'postgres://pooled.example/db';
    const { getNeonStats } = await import('@/lib/neon');
    harness.setRows([
      {
        profiles: '10',
        projects: '9',
        applications: '8',
        student_profiles: '7',
        shortlists: '6',
        orders: '5',
      },
    ]);

    await expect(getNeonStats()).resolves.toEqual({
      profiles: 10,
      projects: 9,
      applications: 8,
      studentProfiles: 7,
      shortlists: 6,
      orders: 5,
    });
  });

  it('getOpenProjects maps rows and preserves null budgets', async () => {
    process.env.DATABASE_URL = 'postgres://pooled.example/db';
    const { getOpenProjects } = await import('@/lib/neon');
    harness.setRows([
      { id: 1, title: 'A', status: 'open', budget_min: '100', budget_max: null },
      { id: '2', title: 'B', status: 'open', budget_min: null, budget_max: '200' },
    ]);

    await expect(getOpenProjects()).resolves.toEqual([
      { id: '1', title: 'A', status: 'open', budgetMin: 100, budgetMax: null },
      { id: '2', title: 'B', status: 'open', budgetMin: null, budgetMax: 200 },
    ]);
  });
});
