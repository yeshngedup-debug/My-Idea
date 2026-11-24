'use server';

/**
 * Project server actions — create a project posting as a founder.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createProjectSchema } from '@/lib/validators';

export interface ProjectResult {
  ok: boolean;
  message: string;
}

export async function createProject(formData: FormData): Promise<ProjectResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  // Confirm the signed-in user is actually a founder
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'founder') {
    return { ok: false, message: 'Only founders can post projects.' };
  }

  // Centralised zod validation of all form inputs
  const raw = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    duration: String(formData.get('duration') ?? ''),
    workMode: String(formData.get('work_mode') ?? 'remote'),
    deadline: String(formData.get('deadline') ?? ''),
    skills: String(formData.get('skills') ?? ''),
    budgetMin: String(formData.get('budget_min') ?? ''),
    budgetMax: String(formData.get('budget_max') ?? ''),
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }

  const { title, description, duration, workMode, deadline, skills, budgetMin, budgetMax } =
    parsed.data;

  let deadlineValue: string | null = null;
  if (deadline) {
    const parsed = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(parsed.getTime()) || parsed < today) {
      return { ok: false, message: 'Deadline cannot be in the past.' };
    }
    deadlineValue = deadline;
  }

  const { error } = await supabase.from('projects').insert({
    title,
    description,
    founder_id: user.id,
    required_skills: skills,
    duration,
    budget_min: budgetMin,
    budget_max: budgetMax,
    work_mode: workMode,
    deadline: deadlineValue,
    status: 'open',
  });

  if (error) return { ok: false, message: 'Could not post project. Try again.' };

  revalidatePath('/founder/projects');
  revalidatePath('/founder');
  revalidatePath('/student/projects');
  return { ok: true, message: 'Project posted.' };
}

/**
 * Form-action wrapper for `<form action={...}>`.
 * Next.js requires form actions to resolve to void; the result is
 * discarded here (the client form uses `createProject` directly).
 */
export async function createProjectFormAction(formData: FormData): Promise<void> {
  await createProject(formData);
}

/** Student applies to an open project (one application per project). */
export async function applyToProject(projectId: string): Promise<ProjectResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'student') {
    return { ok: false, message: 'Only students can apply.' };
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .single();
  if (!project) return { ok: false, message: 'Project not found.' };
  if (project.status !== 'open') {
    return { ok: false, message: 'This project is no longer open.' };
  }

  const { error } = await supabase.from('applications').insert({
    student_id: user.id,
    project_id: projectId,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') {
      return { ok: false, message: 'You already applied to this project.' };
    }
    return { ok: false, message: 'Could not send application. Try again.' };
  }

  revalidatePath('/student/projects');
  revalidatePath('/student/applications');
  revalidatePath('/admin/students');
  return { ok: true, message: 'Application sent.' };
}

const PROJECT_STATUSES = ['open', 'in_progress', 'review', 'completed'] as const;
const APPLICATION_STATUSES = ['pending', 'shortlisted', 'accepted', 'rejected'] as const;

/** Founder sets a project's status — only on their own project. */
export async function updateProjectStatus(
  projectId: string,
  status: string
): Promise<ProjectResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: 'Invalid project status.' };
  }

  // Ownership check: the project must belong to this founder
  const { data: project } = await supabase
    .from('projects')
    .select('id, founder_id')
    .eq('id', projectId)
    .single();

  if (!project) return { ok: false, message: 'Project not found.' };
  if (project.founder_id !== user.id) {
    return { ok: false, message: 'You can only update your own projects.' };
  }

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .eq('founder_id', user.id);

  if (error) return { ok: false, message: 'Could not update project status. Try again.' };

  revalidatePath(`/founder/projects/${projectId}`);
  revalidatePath('/founder/projects');
  revalidatePath('/student/projects');
  return { ok: true, message: 'Project status updated.' };
}

/** Founder sets an applicant's status — only on their own project. */
export async function updateApplicationStatus(
  applicationId: string,
  status: string
): Promise<ProjectResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: 'Invalid application status.' };
  }

  // Load the application and verify the founder owns its project
  const { data: application } = await supabase
    .from('applications')
    .select('id, project_id')
    .eq('id', applicationId)
    .single();

  if (!application) return { ok: false, message: 'Application not found.' };

  const { data: project } = await supabase
    .from('projects')
    .select('id, founder_id')
    .eq('id', application.project_id)
    .single();

  if (!project || project.founder_id !== user.id) {
    return { ok: false, message: 'You can only manage applicants on your own projects.' };
  }

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId);

  if (error) return { ok: false, message: 'Could not update applicant status. Try again.' };

  revalidatePath(`/founder/projects/${project.id}`);
  revalidatePath('/student/applications');
  revalidatePath('/admin/students');
  return { ok: true, message: 'Applicant status updated.' };
}
