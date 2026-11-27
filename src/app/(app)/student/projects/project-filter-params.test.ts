import { describe, expect, it } from 'vitest';
import {
  parseProjectFilters,
  projectFiltersHref,
} from './project-filter-params';

describe('parseProjectFilters', () => {
  it('reads validated query and work mode from server search params', () => {
    expect(
      parseProjectFilters({ q: '  paid design  ', mode: 'remote' }),
    ).toEqual({ q: '  paid design  ', mode: 'remote' });
  });

  it('caps the query at 120 characters and rejects repeated or unknown modes', () => {
    const longQuery = 'x'.repeat(180);

    expect(
      parseProjectFilters({
        q: longQuery,
        mode: ['remote', 'onsite'],
      }),
    ).toEqual({ q: longQuery.slice(0, 120), mode: 'all' });

    expect(parseProjectFilters({ q: 'brief', mode: 'unknown' })).toEqual({
      q: 'brief',
      mode: 'all',
    });
  });

  it('reads URLSearchParams and ignores unrelated apply notices', () => {
    const params = new URLSearchParams(
      'q=branding&mode=onsite&apply=applied',
    );

    expect(parseProjectFilters(params)).toEqual({
      q: 'branding',
      mode: 'onsite',
    });
  });
});

describe('projectFiltersHref', () => {
  it('appends only the filters worth preserving', () => {
    expect(
      projectFiltersHref('/student/projects', {
        q: ' paid design ',
        mode: 'remote',
      }),
    ).toBe('/student/projects?q=paid+design&mode=remote');

    expect(
      projectFiltersHref('/student/projects', { q: '   ', mode: 'all' }),
    ).toBe('/student/projects');
  });

  it('encodes query values so a brief cannot inject another parameter', () => {
    expect(
      projectFiltersHref('/student/projects', {
        q: 'a b&mode=all',
        mode: 'onsite',
      }),
    ).toBe('/student/projects?q=a+b%26mode%3Dall&mode=onsite');
  });

  it('builds detail links from the same validated filters', () => {
    expect(
      projectFiltersHref('/student/projects/brief-1', {
        q: 'design',
        mode: 'remote',
      }),
    ).toBe('/student/projects/brief-1?q=design&mode=remote');
  });
});
