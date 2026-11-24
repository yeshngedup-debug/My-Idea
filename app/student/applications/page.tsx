/**
 * Student Applications — server component.
 * Lists the logged-in student's applications joined with project info.
 * Filtering and status feedback live in the client list below.
 */
import { createClient } from "@/lib/supabase/server";
import { listStudentApplications } from "@/lib/neon-data";
import { PinnedHeadingSection } from "@/components/layout/pinned-heading-section";
import { WorkspacePageHeading } from "@/components/layout/workspace-page-heading";
import {
  ApplicationsClient,
  type ApplicationRow,
} from "./applications-client";

export const metadata = { title: "My Applications | Bhutan Tech Connect" };

export default async function StudentApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: ApplicationRow[] = [];

  if (user) {
    const appRows = await listStudentApplications(user.id);
    rows = appRows.map((a) => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      project: a.project,
    }));
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Student workspace"
              title="My Applications"
              description="Every brief you applied to and where it stands."
            />
          }
        >
          <ApplicationsClient rows={rows} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
