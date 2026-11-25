import { describe, expect, it } from "vitest";
import { resolveActiveSectionId } from "./sticky-section-headings";

const sections = [
  { id: "story", label: "Story" },
  { id: "mission", label: "Mission" },
  { id: "impact", label: "Impact" },
];

describe("resolveActiveSectionId", () => {
  it("returns null when there are no sections", () => {
    expect(resolveActiveSectionId([], [], 200)).toBeNull();
  });

  it("keeps the first section active before the first heading passes the offset", () => {
    expect(resolveActiveSectionId(sections, [420, 900, 1400], 200)).toBe("story");
  });

  it("activates the last heading that has passed the offset", () => {
    expect(resolveActiveSectionId(sections, [-40, 180, 640], 200)).toBe("mission");
  });

  it("activates the final section once every heading has passed", () => {
    expect(resolveActiveSectionId(sections, [-800, -200, 120], 200)).toBe("impact");
  });

  it("honours a custom offset", () => {
    expect(resolveActiveSectionId(sections, [-40, 180, 640], 160)).toBe("story");
  });
});
