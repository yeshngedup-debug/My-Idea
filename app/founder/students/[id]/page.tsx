/**
 * Student full profile — founder view.
 * Shows every completed-profile field plus a signed CV link.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, GraduationCap, Clock, FileText, CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
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

  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (!target || target.role !== 'student') notFound();

  const { data: sp } = await supabase
    .from('student_profiles')
    .select('full_name, college, course, year, skills, bio, availability, cv_path, cv_url, updated_at')
    .eq('id', id)
    .single();

  if (!sp || !sp.cv_path) notFound();

  // Fresh 1-hour signed URL for the CV
  const { data: signed } = await supabase.storage
    .from('cvs')
    .createSignedUrl(sp.cv_path, 60 * 60);

  const { data: existing } = await supabase
    .from('shortlists')
    .select('id')
    .eq('founder_id', user?.id ?? '')
    .eq('student_id', id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/founder/browse-students"
          aria-label="Back to browse students"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold tracking-tight truncate">
          {sp.full_name}
        </h1>
      </header>

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <h1 className="text-lg font-extrabold tracking-tight mb-8">Student profile</h1>
        <Link
          href="/founder/browse-students"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to browse
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <Link
            href="/founder/browse-students"
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Back to browse students"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
            {sp.full_name}
          </h2>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-white/30" />
              {sp.college}
              {sp.course ? ` - ${sp.course}` : ''}
            </span>
            {sp.year && <Badge variant="outline">{sp.year} year</Badge>}
            {sp.availability && (
              <Badge className="bg-amber-400/10 text-amber-300 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {AVAILABILITY_LABEL[sp.availability] ?? sp.availability}
              </Badge>
            )}
          </div>

          {(sp.skills?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {sp.skills!.map((k: string) => (
                  <Badge key={k}>{k}</Badge>
                ))}
              </div>
            </div>
          )}

          {sp.bio && (
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-1">Bio</h3>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{sp.bio}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-2">CV</h3>
            <a
              href={signed?.signedUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <FileText className="w-4 h-4" /> Open CV (PDF)
            </a>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-white/30 inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Updated{' '}
              {new Date(sp.updated_at ?? '').toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <ShortlistButton studentId={id} alreadyShortlisted={!!existing} />
          </div>
        </div>
      </main>
    </div>
  );
}
