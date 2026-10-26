'use server';

/**
 * Project server actions — create a project posting as a founder.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ProjectResult {
  ok: boolean;
  message: string;
}

const DURATIONS = ['1 week', '2 weeks', '1 month', '2 months', '3 months'] as const;

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

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim().slice(0, 2000);
  const durationRaw = String(formData.get('duration') ?? '');
  const duration = (DURATIONS as readonly string[]).includes(durationRaw) ? durationRaw : null;
  const workModeRaw = String(formData.get('work_mode') ?? 'remote');
  const workMode = workModeRaw === 'onsite' ? 'onsite' : 'remote';
  const deadlineRaw = String(formData.get('deadline') ?? '');
  const skills = String(formData.get('skills') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 15);

  const budgetMinRaw = Number(formData.get('budget_min'));
  const budgetMaxRaw = Number(formData.get('budget_max'));
  const budgetMin = Number.isFinite(budgetMinRaw) && budgetMinRaw > 0 ? budgetMinRaw : null;
  const budgetMax = Number.isFinite(budgetMaxRaw) && budgetMaxRaw > 0 ? budgetMaxRaw : null;

  if (!title || title.length < 5) {
    return { ok: false, message: 'Title must be at least 5 characters.' };
  }
  if (!description || description.length < 20) {
    return { ok: false, message: 'Description must be at least 20 characters.' };
  }
  if (!duration) {
    return { ok: false, message: 'Choose a duration.' };
  }
  if (!budgetMin || !budgetMax) {
    return { ok: false, message: 'Enter both budget minimum and maximum.' };
  }
  if (budgetMin > budgetMax) {
    return { ok: false, message: 'Budget minimum cannot exceed maximum.' };
  }

  let deadline: string | null = null;
  if (deadlineRaw) {
    const parsed = new Date(deadlineRaw);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(parsed.getTime()) || parsed < today) {
      return { ok: false, message: 'Deadline must be today or later.' };
    }
    deadline = deadlineRaw;
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
    deadline,
    status: 'open',
  });

  if (error) return { ok: false, message: `Save failed: ${error.message}` };

  revalidatePath('/founder/projects');
  revalidatePath('/founder');
  revalidatePath('/student/projects');
  return { ok: true, message: 'Project posted.' };
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
    return { ok: false, message: 'Only students can apply to projects.' };
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
    return { ok: false, message: `Failed: ${error.message}` };
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

  if (error) return { ok: false, message: `Failed: ${error.message}` };

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

  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath(`/founder/projects/${project.id}`);
  revalidatePath('/student/applications');
  revalidatePath('/admin/students');
  return { ok: true, message: 'Applicant status updated.' };
}
