/**
 * CV proxy route — GET /api/cv/[id]
 * Founders/admins get a fresh signed URL redirect for a student's CV.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Same-site redirect — never build login URLs from the Supabase host
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['founder', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: sp } = await supabase
    .from('student_profiles')
    .select('cv_path')
    .eq('id', id)
    .single();

  if (!sp?.cv_path) {
    return NextResponse.json({ error: 'CV not found' }, { status: 404 });
  }

  const { data: signed } = await supabase.storage
    .from('cvs')
    .createSignedUrl(sp.cv_path, 300); // 5 minutes, just enough to open

  if (!signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate CV link' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
