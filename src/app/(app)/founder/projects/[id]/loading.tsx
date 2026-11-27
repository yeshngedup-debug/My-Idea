import { WorkspaceLoading } from '@/components/layout/workspace-loading';

/** Loading state for a single project's detail and applicant list. */
export default function Loading() {
  return <WorkspaceLoading label="project" ledgerRows={2} listRows={3} />;
}
