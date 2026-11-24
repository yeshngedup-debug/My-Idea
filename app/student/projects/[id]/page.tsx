/**
 * Student-facing project details.
 * Students open this from their own workspace — the founder area is
 * role-gated and is never linked from the student side.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Project Details | Bhutan Tech Connect' };

type ProjectDetail = {
  id: string;
  title: string;
  description: string | null;
  required_skills: string[] | null;
  duration: string | null;
  work_mode: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
};

export default async function StudentProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let project: ProjectDetail | null = null;

  if (user) {
    const { data } = await supabase
      .from('projects')
      .select(
        'id, title, description, required_skills, duration, work_mode, budget_min, budget_max, deadline, status, created_at'
      )
      .eq('id', id)
      .single();
    project = (data as unknown as ProjectDetail) ?? null;
  }

  if (!project) notFound();

  const budget =
    project.budget_min != null && project.budget_max != null
      ? `Nu ${project.budget_min.toLocaleString('en-IN')} - ${project.budget_max.toLocaleString('en-IN')}`
      : 'Budget on request';

  const fields = [
    { label: 'Budget', value: budget },
    { label: 'Duration', value: project.duration ?? 'Flexible' },
    {
      label: 'Work mode',
      value: project.work_mode === 'onsite' ? 'Onsite' : 'Remote',
    },
    {
      label: 'Apply by',
      value: project.deadline
        ? new Date(project.deadline).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Open until closed',
    },
    {
      label: 'Posted',
      value: new Date(project.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    },
  ];

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/student/projects"
          className="mb-6 inline-flex min-h-9 items-center gap-2 text-sm text-[#4c5a52] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
        >
          <span aria-hidden="true">←</span> Back to open projects
        </Link>

        <div className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight text-[#17352b] sm:text-2xl">
              {project.title}
            </h1>
            <Badge className="shrink-0 border-[#ded8cb] bg-[#f5f2ea] text-[#17352b] capitalize">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#4c5a52]">
            {project.description ?? 'No description provided.'}
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-[#ded8cb] pt-6 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-xs font-medium text-[#657069]">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#17352b]">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>

          {(project.required_skills?.length ?? 0) > 0 && (
            <div className="mt-6 border-t border-[#ded8cb] pt-6">
              <h2 className="text-xs font-medium text-[#657069]">
                Required skills
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.required_skills!.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
