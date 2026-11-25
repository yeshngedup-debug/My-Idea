/**
 * Sample data for the marketing previews.
 *
 * A local-only demo fixture retained from the previous seed data. It is shown
 * on marketing pages as a clearly labelled sample. It is not a real order, a
 * real student profile, or a real CV.
 */

export interface SampleStudent {
  shortlistId: string;
  id: string;
  full_name: string;
  college: string;
  course: string;
  year: string;
  skills: string[];
  availability: string;
  contact_email: string;
  cv_path: string;
}

/** Mirrors the real ShortlistStudent shape used in app/founder/shortlists. */
export const SAMPLE_STUDENTS: readonly SampleStudent[] = [
  {
    shortlistId: "sample-1",
    id: "student.tashi",
    full_name: "Tashi Dorji",
    college: "Royal Thimphu College",
    course: "BSc Computer Science",
    year: "3rd",
    skills: ["React", "TypeScript", "Node.js"],
    availability: "weekdays",
    contact_email: "student.tashi@btc-e2e.test",
    cv_path: "demo-cv.pdf",
  },
  {
    shortlistId: "sample-2",
    id: "student.pema",
    full_name: "Pema Choden",
    college: "Royal Thimphu College",
    course: "BCom Business Analytics",
    year: "Graduate",
    skills: ["SQL", "Excel", "Power BI"],
    availability: "weekends",
    contact_email: "student.pema@btc-e2e.test",
    cv_path: "demo-cv.pdf",
  },
] as const;

/** Copied from AVAILABILITY_LABEL in app/founder/shortlists/shortlists-client.tsx. */
export const AVAILABILITY_LABEL: Record<string, string> = {
  weekdays: "Weekdays",
  weekends: "Weekends",
  evenings: "Evenings",
  full_time: "Full time",
  flexible: "Flexible",
};
