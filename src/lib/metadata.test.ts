import { describe, expect, it } from 'vitest';
import { pageMetadata } from './metadata';

describe('pageMetadata', () => {
  it('publishes the canonical path and matching social preview', () => {
    const metadata = pageMetadata({
      title: 'For founders',
      description: 'Post paid project work in Bhutan.',
      path: '/for-founders',
    });

    expect(metadata.alternates).toEqual({ canonical: '/for-founders' });
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      title: 'For founders',
      description: 'Post paid project work in Bhutan.',
      url: '/for-founders',
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'For founders',
      description: 'Post paid project work in Bhutan.',
      images: ['/og-image.png'],
    });
  });

  it('strips a duplicated brand from the caller title once', () => {
    expect(
      pageMetadata({
        title: 'Bhutan Tech Connect | Public home',
        description: 'Public home.',
        path: '/',
      }).openGraph,
    ).toMatchObject({ title: 'Public home' });
  });
});
