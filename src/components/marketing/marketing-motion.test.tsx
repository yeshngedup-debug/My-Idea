import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const mocks = vi.hoisted(() => {
  const timeline = { fromTo: vi.fn() };
  const add = vi.fn((_query: string, callback: () => void) => {
    callback();
    return () => {};
  });

  return {
    timeline,
    add,
    revert: vi.fn(),
    registerPlugin: vi.fn(),
    useGSAP: vi.fn(),
    gsap: {
      timeline: vi.fn(() => timeline),
      matchMedia: vi.fn(),
      registerPlugin: vi.fn(),
    },
  };
});

vi.mock('@gsap/react', () => ({
  useGSAP: (callback: () => void, config: unknown) => {
    mocks.useGSAP(callback, config);
    callback();
  },
}));

vi.mock('gsap', () => ({ default: mocks.gsap }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { name: 'scrollTrigger' } }));
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

import { MarketingMotion } from './marketing-motion';

beforeEach(() => {
  mocks.gsap.matchMedia.mockReturnValue({
    add: mocks.add,
    revert: mocks.revert,
  });

  document.body.innerHTML = `
    <main data-marketing-root>
      <h1>Paid project work</h1>
      <section data-motion-section>
        <div data-motion-panel></div>
        <div data-motion-group>
          <span data-motion-item></span>
        </div>
      </section>
    </main>
  `;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('MarketingMotion', () => {
  it('uses a scoped GSAP timeline with one-shot ScrollTriggers', () => {
    render(<MarketingMotion />);

    expect(mocks.gsap.timeline).toHaveBeenCalledTimes(1);
    expect(mocks.gsap.timeline).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollTrigger: expect.objectContaining({ once: true }),
      }),
    );
    expect(mocks.useGSAP).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        scope: '[data-marketing-root]',
        dependencies: ['/'],
        revertOnUpdate: true,
      }),
    );
  });

  it('animates tagged sections, panels and groups with visible start values', () => {
    render(<MarketingMotion />);

    expect(mocks.add).toHaveBeenCalledWith(
      '(prefers-reduced-motion: no-preference)',
      expect.any(Function),
    );
    expect(mocks.timeline.fromTo).toHaveBeenCalledTimes(3);

    const [section, sectionFrom, sectionTo] = mocks.timeline.fromTo.mock
      .calls[0] as [HTMLElement, Record<string, unknown>, Record<string, unknown>];
    expect(section.tagName).toBe('SECTION');
    expect(sectionFrom).toMatchObject({ opacity: 0.94, y: 12, immediateRender: false });
    expect(sectionTo).toMatchObject({
      opacity: 1,
      y: 0,
      clearProps: 'opacity,transform',
    });
    expect(
      mocks.timeline.fromTo.mock.calls.some(
        ([target]) => (target as HTMLElement).tagName === 'H1',
      ),
    ).toBe(false);

    expect(mocks.timeline.fromTo.mock.calls[1][1]).toMatchObject({
      opacity: 0.96,
      scale: 0.985,
    });
    expect(mocks.timeline.fromTo.mock.calls[2][1]).toMatchObject({
      opacity: 0.94,
      y: 8,
    });
  });
});
