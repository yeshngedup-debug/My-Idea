import { WorkspaceLoading } from '@/components/layout/workspace-loading';

/** Loading state for the founder's project list. No invented project data. */
export default function Loading() {
  return <WorkspaceLoading label="projects" ledgerRows={3} listRows={3} />;
}
