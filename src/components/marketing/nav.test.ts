import { describe, expect, it } from 'vitest';
import {
  CTA_HREFS,
  CTA_LABELS,
  FOOTER_START_LINKS,
  NAV_LINKS,
  SITE,
  resolveAction,
} from './nav';

describe('marketing navigation contract', () => {
  it('keeps the primary navigation labels and routes stable', () => {
    expect(NAV_LINKS).toEqual([
      { label: 'How it works', href: '/how-it-works' },
      { label: 'For students', href: '/for-students' },
      { label: 'For founders', href: '/for-founders' },
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
    ]);
  });

  it('keeps one trust line and one public home route', () => {
    expect(SITE.homeHref).toBe('/');
    expect(SITE.trustLine).toBe(
      'Human verification · Paid in Ngultrum · No bidding wars · Built in Bhutan',
    );
  });

  it('keeps the footer pricing link absolute', () => {
    const pricing = FOOTER_START_LINKS.find(
      (link) => link.label === CTA_LABELS.pricing,
    );

    expect(pricing).toEqual({
      href: '/for-founders#pricing',
      label: 'See pricing',
    });
  });

  it('resolves pricing as an in-page anchor only on the founder page', () => {
    expect(resolveAction(CTA_HREFS.forFounders, 'pricing')).toEqual({
      href: '#pricing',
      label: 'See pricing',
    });

    for (const pathname of [
      '/',
      '/public',
      '/for-students',
      '/how-it-works',
      null,
    ]) {
      expect(resolveAction(pathname, 'pricing')).toEqual({
        href: '/for-founders#pricing',
        label: 'See pricing',
      });
    }
  });
});
