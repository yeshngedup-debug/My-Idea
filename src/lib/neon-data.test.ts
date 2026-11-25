import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as data from '@/lib/neon-data';

// The global setup auto-mocks neon-data for the rest of the suite. This file is
// the one place that needs the real implementation, so drop that mock and swap
// in a controllable sql client at the database boundary instead.
vi.unmock('@/lib/neon-data');

type Row = Record<string, unknown>;
type SqlStub = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>) & {
  transaction: (fn: (tx: SqlStub) => Promise<Row[]>[]) => Promise<Row[]>;
};

/** A tagged-template sql stub whose results (or rejection) are configurable. */
const db = vi.hoisted(() => {
  const state: {
    rows: Row[];
    queue: Row[][];
    error: Error | null;
    calls: unknown[][];
    transactionCalls: number;
  } = {
    rows: [],
    queue: [],
    error: null,
    calls: [],
    transactionCalls: 0,
  };

  const makeSql = (): SqlStub => {
    const sql = ((strings: TemplateStringsArray, ...values: unknown[]) => {
      state.calls.push([strings, ...values]);
      if (state.error) return Promise.reject(state.error);
      const rows = state.queue.length ? state.queue.shift()! : state.rows;
      return Promise.resolve(rows);
    }) as SqlStub;
    sql.transaction = async (fn) => {
      state.transactionCalls += 1;
      const statements = fn(makeSql());
      await Promise.all(statements);
      return [];
    };
    return sql;
  };

  const sql = makeSql();

  return {
    sql,
    setRows(rows: Row[]) {
      state.rows = rows;
      state.queue = [];
    },
    queueRows(...sets: Row[][]) {
      state.queue = sets;
    },
    setError(error: Error | null) {
      state.error = error;
    },
    reset() {
      state.rows = [];
      state.queue = [];
      state.error = null;
      state.calls = [];
      state.transactionCalls = 0;
    },
    snapshot() {
      return {
        calls: state.calls.slice(),
        transactionCalls: state.transactionCalls,
      };
    },
  };
});

vi.mock('@/lib/neon', () => ({ getSql: () => db.sql }));

// -- fixtures ---------------------------------------------------------------

function newProjectInput(): data.NewProject {
  return {
    title: 'Build a landing page',
    description: 'A marketing site',
    founderId: 'f1',
    requiredSkills: ['React', 'Tailwind'],
    duration: '1 month',
    budgetMin: 500,
    budgetMax: 1000,
    workMode: 'remote',
    deadline: null,
  };
}

function projectRow(overrides: Row = {}): Row {
  return {
    id: 'p1',
    title: 'Project',
    description: null,
    founder_id: 'f1',
    student_id: null,
    budget: '500.25',
    budget_min: '400',
    budget_max: '600',
    required_skills: ['React', 'Node'],
    duration: '1 month',
    work_mode: null,
    deadline: null,
    status: 'open',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function studentRow(overrides: Row = {}): Row {
  return {
    id: 's1',
    full_name: 'Ada',
    college: 'College',
    course: 'CS',
    year: '3',
    skills: ['React'],
    bio: null,
    availability: 'weekends',
    cv_path: '/cv/s1.pdf',
    cv_url: null,
    rank: '2',
    verified: true,
    contact_email: 'ada@example.com',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: 'not-a-date',
    ...overrides,
  };
}

function applicationRow(overrides: Row = {}): Row {
  return {
    id: 'a1',
    student_id: 's1',
    project_id: 'p1',
    status: 'pending',
    created_at: '2026-01-01T00:00:00Z',
    project: { id: 'p1', title: 'Project' },
    student: studentRow(),
    ...overrides,
  };
}

function shortlistRow(overrides: Row = {}): Row {
  return {
    id: 'sl1',
    founder_id: 'f1',
    student_id: 's1',
    project_id: null,
    status: 'requested',
    source: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function orderRow(overrides: Row = {}): Row {
  return {
    id: 'o1',
    founder_id: 'f1',
    project_id: null,
    package: 'standard',
    amount: '100.50',
    status: 'confirmed',
    screenshot_path: null,
    created_at: '2026-01-01T00:00:00Z',
    confirmed_at: null,
    ...overrides,
  };
}

beforeEach(() => db.reset());

// -- profiles ---------------------------------------------------------------

describe('profiles', () => {
  it('getProfileRole returns the stored role or null', async () => {
    db.setRows([{ role: 'founder' }]);
    await expect(data.getProfileRole('u1')).resolves.toBe('founder');
    db.setRows([]);
    await expect(data.getProfileRole('u1')).resolves.toBeNull();
  });

  it('getProfile maps a row with a normalized timestamp', async () => {
    db.setRows([
      {
        id: 7,
        role: 'student',
        full_name: null,
        created_at: new Date('2026-02-01T00:00:00Z'),
      },
    ]);
    await expect(data.getProfile('u1')).resolves.toEqual({
      id: '7',
      role: 'student',
      full_name: null,
      created_at: '2026-02-01T00:00:00.000Z',
    });
    db.setRows([]);
    await expect(data.getProfile('u1')).resolves.toBeNull();
  });

  it('listProfilesByIds maps rows and skips empty input without querying', async () => {
    await expect(data.listProfilesByIds([])).resolves.toEqual([]);
    expect(db.snapshot().calls).toHaveLength(0);

    db.setRows([
      { id: 's1', full_name: null },
      { id: 's2', full_name: 'Bob' },
    ]);
    await expect(data.listProfilesByIds(['s1', 's2'])).resolves.toEqual([
      { id: 's1', full_name: null },
      { id: 's2', full_name: 'Bob' },
    ]);
  });

  it('listFounderProfiles maps founder rows', async () => {
    db.setRows([{ id: 'f1', full_name: 'Ada' }]);
    await expect(data.listFounderProfiles()).resolves.toEqual([
      { id: 'f1', full_name: 'Ada' },
    ]);
  });

  it('listRoleCounts maps counts to numbers', async () => {
    db.setRows([
      { role: 'student', count: '12' },
      { role: 'admin', count: 2 },
    ]);
    await expect(data.listRoleCounts()).resolves.toEqual([
      { role: 'student', count: 12 },
      { role: 'admin', count: 2 },
    ]);
  });

  it('mutation helpers resolve when the statement succeeds', async () => {
    db.setRows([]);
    await expect(data.updateProfileFullName('u1', 'Ada')).resolves.toBeUndefined();
    await expect(data.ensureProfile('u1', null)).resolves.toBeUndefined();
    await expect(
      data.syncProfileRole('u1', null, 'admin')
    ).resolves.toBeUndefined();
    expect(db.snapshot().calls).toHaveLength(3);
  });
});

// -- projects ---------------------------------------------------------------

describe('projects', () => {
  it('insertProject returns the generated id', async () => {
    db.setRows([{ id: 'p9' }]);
    await expect(data.insertProject(newProjectInput())).resolves.toEqual({
      id: 'p9',
    });
  });

  it('getProject maps a full project row with defaults', async () => {
    db.setRows([projectRow({ id: 42, required_skills: 'not-an-array' })]);
    await expect(data.getProject('p1')).resolves.toEqual({
      id: '42',
      title: 'Project',
      description: null,
      founder_id: 'f1',
      student_id: null,
      budget: 500.25,
      budget_min: 400,
      budget_max: 600,
      required_skills: [],
      duration: '1 month',
      work_mode: 'remote',
      deadline: null,
      status: 'open',
      created_at: '2026-01-01T00:00:00.000Z',
    });
    db.setRows([]);
    await expect(data.getProject('p1')).resolves.toBeNull();
  });

  it('updateProjectStatus reports whether a row was updated', async () => {
    db.setRows([{ id: 'p1' }]);
    await expect(
      data.updateProjectStatus('p1', 'f1', 'assigned')
    ).resolves.toBe(true);
    db.setRows([]);
    await expect(
      data.updateProjectStatus('p1', 'f1', 'assigned')
    ).resolves.toBe(false);
  });

  it('listOpenProjects maps rows', async () => {
    db.setRows([projectRow()]);
    const rows = await data.listOpenProjects();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'p1',
      required_skills: ['React', 'Node'],
      work_mode: 'remote',
    });
  });

  it('listProjectsByFounder and listAllProjectsWithDetails map rows', async () => {
    db.setRows([projectRow()]);
    await expect(data.listProjectsByFounder('f1')).resolves.toHaveLength(1);
    await expect(data.listAllProjectsWithDetails()).resolves.toHaveLength(1);
  });

  it('listProjectStatuses stringifies statuses', async () => {
    db.setRows([{ status: 'open' }, { status: 5 }]);
    await expect(data.listProjectStatuses()).resolves.toEqual(['open', '5']);
  });

  it('listAllProjects returns the compact shape', async () => {
    db.setRows([{ id: 'p1', title: 'Project', founder_id: 'f1' }]);
    await expect(data.listAllProjects()).resolves.toEqual([
      { id: 'p1', title: 'Project', founder_id: 'f1' },
    ]);
  });
});

// -- applications -----------------------------------------------------------

describe('applications', () => {
  it('insertApplication resolves on success', async () => {
    db.setRows([]);
    await expect(data.insertApplication('s1', 'p1')).resolves.toBeUndefined();
  });

  it('getApplication maps a row or null', async () => {
    db.setRows([{ id: 'a1', project_id: 12 }]);
    await expect(data.getApplication('a1')).resolves.toEqual({
      id: 'a1',
      project_id: '12',
    });
    db.setRows([]);
    await expect(data.getApplication('a1')).resolves.toBeNull();
  });

  it('updateApplicationStatus reports whether a row changed', async () => {
    db.setRows([{ application_id: 'a1' }]);
    await expect(data.updateApplicationStatus('a1', 'accepted')).resolves.toBe(
      true
    );
    db.setRows([]);
    await expect(data.updateApplicationStatus('a1', 'accepted')).resolves.toBe(
      false
    );
  });

  it('listStudentApplications maps nested project and student rows', async () => {
    db.setRows([applicationRow()]);
    const rows = await data.listStudentApplications('s1');
    expect(rows).toHaveLength(1);
    expect(rows[0].project).toEqual({ id: 'p1', title: 'Project' });
    expect(rows[0].student?.skills).toEqual(['React']);
  });

  it('listProjectApplicants handles a missing student profile', async () => {
    db.setRows([applicationRow({ student: null })]);
    const rows = await data.listProjectApplicants('p1');
    expect(rows[0].student).toBeNull();
  });

  it('id and project-id list helpers stringify values', async () => {
    db.setRows([{ project_id: 'p1' }, { project_id: 2 }]);
    await expect(data.listStudentAppliedProjectIds('s1')).resolves.toEqual([
      'p1',
      '2',
    ]);
    db.setRows([{ student_id: 's1' }, { student_id: 2 }]);
    await expect(data.listAllApplicationStudentIds()).resolves.toEqual([
      's1',
      '2',
    ]);
  });

  it('hasApplicationToFounderProject reports row presence', async () => {
    db.setRows([{ '1': 1 }]);
    await expect(
      data.hasApplicationToFounderProject('s1', 'f1')
    ).resolves.toBe(true);
    db.setRows([]);
    await expect(
      data.hasApplicationToFounderProject('s1', 'f1')
    ).resolves.toBe(false);
  });
});

// -- student profiles -------------------------------------------------------

describe('student profiles', () => {
  const input: data.StudentProfileInput = {
    id: 's1',
    full_name: 'Ada',
    college: 'College',
    course: 'CS',
    year: '3',
    skills: ['React'],
    bio: null,
    availability: 'weekends',
    contact_email: 'ada@example.com',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('upsertStudentProfile and setStudentProfileCv resolve on success', async () => {
    db.setRows([]);
    await expect(data.upsertStudentProfile(input)).resolves.toBeUndefined();
    await expect(
      data.setStudentProfileCv('s1', '/cv/new.pdf', '2026-02-01T00:00:00Z')
    ).resolves.toBeUndefined();
  });

  it('getStudentProfile maps numerics, dates and nulls', async () => {
    db.setRows([studentRow()]);
    const profile = await data.getStudentProfile('s1');
    expect(profile).toMatchObject({
      id: 's1',
      rank: 2,
      verified: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: 'not-a-date',
    });
    expect(profile?.bio).toBeNull();
    db.setRows([]);
    await expect(data.getStudentProfile('s1')).resolves.toBeNull();
  });

  it('listStudentProfiles maps rows and skips empty input without querying', async () => {
    await expect(data.listStudentProfiles([])).resolves.toEqual([]);
    expect(db.snapshot().calls).toHaveLength(0);
    db.setRows([studentRow()]);
    await expect(data.listStudentProfiles(['s1'])).resolves.toHaveLength(1);
  });

  it('listBrowseableStudents maps the public-safe shape', async () => {
    db.setRows([studentRow()]);
    const rows = await data.listBrowseableStudents();
    expect(rows[0]).toEqual({
      id: 's1',
      full_name: 'Ada',
      college: 'College',
      course: 'CS',
      year: '3',
      skills: ['React'],
      bio: null,
      availability: 'weekends',
    });
    expect(rows[0]).not.toHaveProperty('cv_path');
  });

  it('listAdminStudents maps full rows', async () => {
    db.setRows([studentRow()]);
    await expect(data.listAdminStudents()).resolves.toHaveLength(1);
  });

  it('setStudentRank and setStudentVerified resolve on success', async () => {
    db.setRows([]);
    await expect(data.setStudentRank('s1', null)).resolves.toBeUndefined();
    await expect(data.setStudentVerified('s1', false)).resolves.toBeUndefined();
  });
});

// -- shortlists -------------------------------------------------------------

describe('shortlists', () => {
  it('requestShortlist inserts after an application relationship check', async () => {
    db.queueRows([{ '1': 1 }], [], []);
    await expect(
      data.requestShortlist('f1', 's1', 'p1')
    ).resolves.toBeUndefined();
    expect(db.snapshot().calls).toHaveLength(3);
  });

  it('requestShortlist accepts a confirmed general order', async () => {
    db.queueRows([], [{ project_id: null }], []);
    await expect(
      data.requestShortlist('f1', 's1', null)
    ).resolves.toBeUndefined();
  });

  it('requestShortlist accepts a confirmed project order', async () => {
    db.queueRows([], [{ project_id: 'p1' }], []);
    await expect(
      data.requestShortlist('f1', 's1', 'p1')
    ).resolves.toBeUndefined();
  });

  it('requestShortlist is idempotent for an existing general row', async () => {
    db.queueRows([{ '1': 1 }], [{ id: 'sl1' }]);
    await expect(
      data.requestShortlist('f1', 's1', null)
    ).resolves.toBeUndefined();
    expect(db.snapshot().calls).toHaveLength(2);
  });

  it('requestShortlist updates an existing project row', async () => {
    db.queueRows([{ '1': 1 }], [{ id: 'sl1' }], []);
    await expect(
      data.requestShortlist('f1', 's1', 'p1')
    ).resolves.toBeUndefined();
    expect(db.snapshot().calls).toHaveLength(3);
  });

  it('requestShortlist rejects when there is no relationship', async () => {
    db.setRows([]);
    await expect(
      data.requestShortlist('f1', 's1', null)
    ).rejects.toThrow('No relationship with this student');
  });

  it('getShortlist maps a row or null', async () => {
    db.setRows([{ id: 'sl1' }]);
    await expect(data.getShortlist('f1', 's1')).resolves.toEqual({ id: 'sl1' });
    db.setRows([]);
    await expect(data.getShortlist('f1', 's1')).resolves.toBeNull();
  });

  it('listShortlistedStudentIds stringifies ids', async () => {
    db.setRows([{ student_id: 's1' }, { student_id: 2 }]);
    await expect(data.listShortlistedStudentIds('f1')).resolves.toEqual([
      's1',
      '2',
    ]);
  });

  it('listFounderShortlists maps rows with the default source', async () => {
    db.setRows([shortlistRow()]);
    await expect(data.listFounderShortlists('f1')).resolves.toEqual([
      {
        id: 'sl1',
        founder_id: 'f1',
        student_id: 's1',
        project_id: null,
        status: 'requested',
        source: 'admin',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('replaceAdminShortlist runs a transaction for project and general scopes', async () => {
    await expect(
      data.replaceAdminShortlist('f1', 'p1', ['s1'])
    ).resolves.toBeUndefined();
    await expect(
      data.replaceAdminShortlist('f1', null, ['s1'])
    ).resolves.toBeUndefined();
    expect(db.snapshot().transactionCalls).toBe(2);
  });

  it('hasShortlistWithOrder skips the database when no order is unlocked', async () => {
    await expect(
      data.hasShortlistWithOrder('f1', 's1', false, [])
    ).resolves.toBe(false);
    expect(db.snapshot().calls).toHaveLength(0);
  });

  it('hasShortlistWithOrder checks general and project scopes', async () => {
    db.setRows([{ id: 'sl1' }]);
    await expect(
      data.hasShortlistWithOrder('f1', 's1', true, [])
    ).resolves.toBe(true);
    db.setRows([]);
    await expect(
      data.hasShortlistWithOrder('f1', 's1', false, ['p1'])
    ).resolves.toBe(false);
  });
});

// -- shortlist orders -------------------------------------------------------

describe('shortlist orders', () => {
  const orderInput = {
    founderId: 'f1',
    projectId: null,
    package: 'standard',
    amount: 100,
  };

  it('insertOrder returns the new id and rejects a missing project', async () => {
    db.setRows([{ id: 'o1' }]);
    await expect(data.insertOrder(orderInput)).resolves.toEqual({ id: 'o1' });
    db.setRows([]);
    await expect(data.insertOrder(orderInput)).rejects.toThrow(
      'Project not found for this founder.'
    );
  });

  it('getOrder maps a row or null', async () => {
    db.setRows([
      orderRow({ confirmed_at: '2026-02-01T00:00:00Z', project_id: 'p1' }),
    ]);
    await expect(data.getOrder('o1')).resolves.toEqual({
      id: 'o1',
      founder_id: 'f1',
      project_id: 'p1',
      package: 'standard',
      amount: 100.5,
      status: 'confirmed',
      screenshot_path: null,
      created_at: '2026-01-01T00:00:00.000Z',
      confirmed_at: '2026-02-01T00:00:00.000Z',
    });
    db.setRows([]);
    await expect(data.getOrder('o1')).resolves.toBeNull();
  });

  it('setOrderScreenshot resolves on update and guards a stale order', async () => {
    db.setRows([{ id: 'o1' }]);
    await expect(
      data.setOrderScreenshot('o1', '/screens/a.png')
    ).resolves.toBeUndefined();
    db.setRows([]);
    await expect(
      data.setOrderScreenshot('o1', '/screens/a.png')
    ).rejects.toThrow('This order can no longer accept a screenshot.');
  });

  it('setOrderStatus resolves for both statuses and guards a stale order', async () => {
    db.setRows([{ id: 'o1' }]);
    await expect(
      data.setOrderStatus('o1', 'confirmed', '2026-03-01T00:00:00Z')
    ).resolves.toBeUndefined();
    await expect(data.setOrderStatus('o1', 'rejected')).resolves.toBeUndefined();
    db.setRows([]);
    await expect(data.setOrderStatus('o1', 'confirmed')).rejects.toThrow(
      'This order can no longer be reviewed.'
    );
  });

  it('listOrders and listFounderOrders map rows', async () => {
    db.setRows([orderRow()]);
    await expect(data.listOrders()).resolves.toHaveLength(1);
    await expect(data.listFounderOrders('f1')).resolves.toHaveLength(1);
  });

  it('listConfirmedOrderProjectIds maps nullable project ids', async () => {
    db.setRows([{ project_id: null }, { project_id: 'p1' }]);
    await expect(data.listConfirmedOrderProjectIds('f1')).resolves.toEqual([
      { projectId: null },
      { projectId: 'p1' },
    ]);
  });
});

// -- health and error normalization ----------------------------------------

describe('health', () => {
  it('pingDatabase runs the probe query', async () => {
    await expect(data.pingDatabase()).resolves.toBeUndefined();
    expect(db.snapshot().calls).toHaveLength(1);
  });
});

describe('NeonDataError normalization', () => {
  it('preserves the name and code when wrapping a driver error', async () => {
    db.setError(Object.assign(new Error('duplicate key'), { code: '23505' }));
    await expect(data.ensureProfile('u1', null)).rejects.toMatchObject({
      name: 'NeonDataError',
      message: 'duplicate key',
      code: '23505',
    });
  });

  it('rethrows an existing NeonDataError unchanged', async () => {
    const original = new data.NeonDataError('already there', 'P0001');
    db.setError(original);
    await expect(data.getProfileRole('u1')).rejects.toBe(original);
  });

  it('uses a default message when the thrown value has none', async () => {
    db.setError(null);
    db.setRows([{ role: 'admin' }]);
    await expect(data.getProfileRole('u1')).resolves.toBe('admin');
  });
});

// Every function with a `catch` block must translate driver failures into a
// NeonDataError. A single parameterized case list keeps that guarantee tight.
const errorCases: Array<[string, () => Promise<unknown>]> = [
  ['getProfileRole', () => data.getProfileRole('u')],
  ['getProfile', () => data.getProfile('u')],
  ['listProfilesByIds', () => data.listProfilesByIds(['u'])],
  ['listFounderProfiles', () => data.listFounderProfiles()],
  ['listRoleCounts', () => data.listRoleCounts()],
  ['updateProfileFullName', () => data.updateProfileFullName('u', 'Ada')],
  ['ensureProfile', () => data.ensureProfile('u', null)],
  ['syncProfileRole', () => data.syncProfileRole('u', null, 'student')],
  ['insertProject', () => data.insertProject(newProjectInput())],
  ['getProject', () => data.getProject('p')],
  ['updateProjectStatus', () => data.updateProjectStatus('p', 'f', 'open')],
  ['listOpenProjects', () => data.listOpenProjects()],
  ['listProjectsByFounder', () => data.listProjectsByFounder('f')],
  ['listProjectStatuses', () => data.listProjectStatuses()],
  ['listAllProjectsWithDetails', () => data.listAllProjectsWithDetails()],
  ['listAllProjects', () => data.listAllProjects()],
  ['insertApplication', () => data.insertApplication('s', 'p')],
  ['getApplication', () => data.getApplication('a')],
  ['updateApplicationStatus', () => data.updateApplicationStatus('a', 'x')],
  ['listStudentApplications', () => data.listStudentApplications('s')],
  ['listStudentAppliedProjectIds', () => data.listStudentAppliedProjectIds('s')],
  ['listProjectApplicants', () => data.listProjectApplicants('p')],
  ['listAllApplicationStudentIds', () => data.listAllApplicationStudentIds()],
  ['hasApplicationToFounderProject', () => data.hasApplicationToFounderProject('s', 'f')],
  ['upsertStudentProfile', () => data.upsertStudentProfile({
    id: 's', full_name: 'A', college: null, course: null, year: null,
    skills: [], bio: null, availability: null, contact_email: null,
    updated_at: '2026-01-01T00:00:00Z',
  })],
  ['setStudentProfileCv', () => data.setStudentProfileCv('s', '/cv', '2026')],
  ['getStudentProfile', () => data.getStudentProfile('s')],
  ['listStudentProfiles', () => data.listStudentProfiles(['s'])],
  ['listBrowseableStudents', () => data.listBrowseableStudents()],
  ['listAdminStudents', () => data.listAdminStudents()],
  ['setStudentRank', () => data.setStudentRank('s', 1)],
  ['setStudentVerified', () => data.setStudentVerified('s', true)],
  ['requestShortlist', () => data.requestShortlist('f', 's', 'p')],
  ['getShortlist', () => data.getShortlist('f', 's')],
  ['listShortlistedStudentIds', () => data.listShortlistedStudentIds('f')],
  ['listFounderShortlists', () => data.listFounderShortlists('f')],
  ['replaceAdminShortlist', () => data.replaceAdminShortlist('f', null, ['s'])],
  ['hasShortlistWithOrder', () => data.hasShortlistWithOrder('f', 's', true, [])],
  ['insertOrder', () => data.insertOrder({
    founderId: 'f', projectId: null, package: 'standard', amount: 1,
  })],
  ['getOrder', () => data.getOrder('o')],
  ['setOrderScreenshot', () => data.setOrderScreenshot('o', '/s')],
  ['setOrderStatus', () => data.setOrderStatus('o', 'confirmed')],
  ['listOrders', () => data.listOrders()],
  ['listFounderOrders', () => data.listFounderOrders('f')],
  ['listConfirmedOrderProjectIds', () => data.listConfirmedOrderProjectIds('f')],
];

describe('driver error wrapping', () => {
  it.each(errorCases)('%s wraps driver errors as NeonDataError', async (_name, call) => {
    db.setError(new Error('db down'));
    await expect(call()).rejects.toMatchObject({
      name: 'NeonDataError',
      message: 'db down',
    });
  });

  it('pingDatabase propagates raw driver errors', async () => {
    db.setError(new Error('db down'));
    await expect(data.pingDatabase()).rejects.toThrow('db down');
  });
});
