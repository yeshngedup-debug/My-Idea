/**
 * Student full profile — founder view.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileRole,
  getStudentProfile,
  getShortlist,
} from '@/lib/neon-data';
import { Badge } from '@/components/ui/badge';
import { ShortlistButton } from './shortlist-button';

export const metadata = { title: 'Student Profile | Bhutan Tech Connect' };

const AVAILABILITY_LABEL: Record<string, string> = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  evenings: 'Evenings',
  full_time: 'Full time',
  flexible: 'Flexible',
};

export default async function StudentProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetRole = await getProfileRole(id);

  if (targetRole !== 'student') notFound();

  const sp = await getStudentProfile(id);

  if (!sp || !sp.cv_path) notFound();

  // Is this student already on this founder's shortlist?
  const existing = user ? await getShortlist(user.id, id) : null;

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/founder/browse-students" className="inline-flex min-h-9 items-center text-sm text-[#4c5a52] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded">
            Browse students
          </Link>
          <div className="min-w-0 text-right">
            <h1 className="text-xl font-semibold tracking-tight text-[#17352b] sm:text-2xl">{sp.full_name}</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#4c5a52]">
            <span>{sp.college}{sp.course ? ` - ${sp.course}` : ''}{sp.year ? ` (${sp.year} year)` : ''}</span>
            {sp.availability && (
              <Badge variant="outline">{AVAILABILITY_LABEL[sp.availability] ?? sp.availability}</Badge>
            )}
          </div>

          {(sp.skills?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(sp.skills ?? []).map((k: string) => (
                <Badge key={k} variant="outline">{k}</Badge>
              ))}
            </div>
          )}

          {sp.bio && (
            <div className="mt-6 border-t border-[#ded8cb] pt-6">
              <h3 className="mb-1 text-sm font-semibold text-[#17352b]">Bio</h3>
              <p className="whitespace-pre-line text-sm leading-6 text-[#4c5a52]">{sp.bio}</p>
            </div>
          )}

          <div className="mt-6 border-t border-[#ded8cb] pt-6">
            <h3 className="mb-2 text-sm font-semibold text-[#17352b]">CV</h3>
            <a href={`/api/cv/${encodeURIComponent(id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ded8cb] px-4 py-2.5 text-sm font-semibold text-[#17352b] transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
              View CV (PDF)
            </a>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#ded8cb] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#657069]">Interested in working with {sp.full_name}?</p>
            <ShortlistButton studentId={id} alreadyShortlisted={!!existing} />
          </div>
        </div>
      </div>
    </section>
  );
}
