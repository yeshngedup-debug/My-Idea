import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StickySectionHeadings } from './sticky-section-headings';

const sections = [
  { id: 'story', label: 'Story' },
  { id: 'mission', label: 'Mission' },
  { id: 'impact', label: 'Impact' },
];

const tops: Record<string, number> = {
  story: 100,
  mission: 300,
  impact: 500,
};

beforeEach(() => {
  // Drive the rAF-scheduled measurement synchronously so the effect is testable.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    // A null handle keeps the component's frameRef cleared after the callback.
    return null as unknown as number;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      return { top: tops[this.id] ?? 0, height: 0 } as DOMRect;
    }
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  tops.story = 100;
  tops.mission = 300;
  tops.impact = 500;
});

function renderHeadings() {
  return render(
    <StickySectionHeadings
      title="Our story"
      eyebrow="About"
      navLabel="On this page"
      sections={sections}
    >
      <div>
        <div id="story">Story copy</div>
        <div id="mission">Mission copy</div>
        <div id="impact">Impact copy</div>
      </div>
    </StickySectionHeadings>
  );
}

describe('StickySectionHeadings', () => {
  it('renders the title, eyebrow, section links and children', () => {
    renderHeadings();

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Our story')).toBeInTheDocument();
    expect(screen.getByText('Story copy')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#story',
      '#mission',
      '#impact',
    ]);
    expect(links[0]).toHaveAttribute('aria-current', 'location');
    expect(links[1]).not.toHaveAttribute('aria-current');
  });

  it('omits the navigation when there are no sections', () => {
    render(
      <StickySectionHeadings title="Plain page" sections={[]}>
        <p>Content</p>
      </StickySectionHeadings>
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByText('Plain page')).toBeInTheDocument();
  });

  it('moves the active marker on scroll and cleans up listeners on unmount', () => {
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHeadings();

    expect(added).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });
    expect(added).toHaveBeenCalledWith('resize', expect.any(Function));

    tops.story = -200;
    tops.mission = 60;
    tops.impact = 500;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    const links = screen.getAllByRole('link');
    expect(links[1]).toHaveAttribute('aria-current', 'location');
    expect(links[0]).not.toHaveAttribute('aria-current');

    unmount();
    expect(removed).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removed).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
