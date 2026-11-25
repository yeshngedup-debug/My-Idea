import { Badge } from "@/components/ui/badge";
import {
  AVAILABILITY_LABEL,
  type SampleStudent,
} from "./sample-shortlist-data";

/**
 * A single shortlist row. The markup mirrors the real student row in
 * app/founder/shortlists/shortlists-client.tsx: rank, name, college and course
 * meta, skill badges, then contact and CV labels.
 *
 * Contact and CV are rendered as labels, not links. The sample has no real
 * mailboxes or CV files, so no destination is invented.
 */
export function ShortlistRow({
  student,
  rank,
  headingLevel = "h3",
  className = "",
}: {
  student: SampleStudent;
  rank: number;
  headingLevel?: "h3" | "h4";
  className?: string;
}) {
  const nameClass = "truncate text-base font-semibold text-[#17352b]";
  const availability =
    AVAILABILITY_LABEL[student.availability] ?? student.availability;

  return (
    <li className={`rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5 ${className}`}>
      <div className="mb-2 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#17352b] text-sm font-semibold text-[#fffefa]"
        >
          {rank}
        </span>
        {headingLevel === "h4" ? (
          <h4 className={nameClass}>{student.full_name}</h4>
        ) : (
          <h3 className={nameClass}>{student.full_name}</h3>
        )}
      </div>

      <p className="mb-2 text-xs text-[#657069]">
        {student.college} - {student.course} ({student.year} year) -{" "}
        {availability}
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {student.skills.slice(0, 5).map((skill) => (
          <Badge key={skill} variant="outline">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
        <span className="break-all text-[#5e554a]">
          {student.contact_email}
        </span>
        <span className="text-[#17352b]">View CV</span>
      </div>
    </li>
  );
}
