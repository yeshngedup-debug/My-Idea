import { describe, it, expect } from "vitest";
import {
  APPLICATION_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
  applicationStatusLabel,
  projectStatusLabel,
} from "./status-labels";

describe("application status labels", () => {
  it("names every stored application status once", () => {
    expect(APPLICATION_STATUS_LABEL).toEqual({
      pending: "Pending",
      shortlisted: "Shortlisted",
      accepted: "Accepted",
      rejected: "Rejected",
    });
  });

  it("uses the same wording for every stored status", () => {
    expect(applicationStatusLabel("pending")).toBe("Pending");
    expect(applicationStatusLabel("shortlisted")).toBe("Shortlisted");
    expect(applicationStatusLabel("accepted")).toBe("Accepted");
    expect(applicationStatusLabel("rejected")).toBe("Rejected");
  });

  it("falls back to a readable label for an unknown status", () => {
    expect(applicationStatusLabel("some_new_state")).toBe("Some new state");
  });
});

describe("project status labels", () => {
  it("names every stored project status once", () => {
    expect(PROJECT_STATUS_LABEL).toEqual({
      open: "Open",
      in_progress: "In progress",
      review: "In review",
      completed: "Completed",
    });
  });

  it("uses the same wording for every stored status", () => {
    expect(projectStatusLabel("open")).toBe("Open");
    expect(projectStatusLabel("in_progress")).toBe("In progress");
    expect(projectStatusLabel("review")).toBe("In review");
    expect(projectStatusLabel("completed")).toBe("Completed");
  });

  it("falls back to a readable label for an unknown status", () => {
    expect(projectStatusLabel("draft_state")).toBe("Draft state");
  });
});
