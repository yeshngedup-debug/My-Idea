'use client';

/**
 * Student profile form — mobile-first, dark design.
 * Skills as chips, CV upload to Supabase Storage, live completion %.
 */
import { useMemo, useState, useTransition } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveStudentProfile, uploadCv } from '@/app/actions/student-profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface StudentProfileData {
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[];
  bio: string | null;
  availability: string | null;
  cv_path: string | null;
}

const YEARS = ['1st', '2nd', '3rd', '4th', 'Graduate'];
const AVAILABILITY = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'full_time', label: 'Full time' },
  { value: 'flexible', label: 'Flexible' },
];

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 transition-all text-base';

export function ProfileForm({
  initial,
  cvUrl,
}: {
  initial: StudentProfileData;
  cvUrl?: string | null;
}) {
  const [fullName, setFullName] = useState(initial.full_name ?? '');
  const [college, setCollege] = useState(initial.college ?? '');
  const [course, setCourse] = useState(initial.course ?? '');
  const [year, setYear] = useState(initial.year ?? '');
  const [skills, setSkills] = useState<string[]>(initial.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [availability, setAvailability] = useState(initial.availability ?? '');
  const [cvPath, setCvPath] = useState(initial.cv_path);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [saving, startSave] = useTransition();
  const [uploading, startUpload] = useTransition();

  const completion = useMemo(() => {
    const checks = [
      fullName.trim().length > 1,
      college.trim().length > 1,
      course.trim().length > 1,
      year !== '',
      skills.length > 0,
      bio.trim().length > 20,
      availability !== '',
      cvPath !== null,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [fullName, college, course, year, skills, bio, availability, cvPath]);

  function addSkill() {
    const v = skillInput.trim();
    if (v && !skills.includes(v) && skills.length < 15) {
      setSkills([...skills, v]);
    }
    setSkillInput('');
  }

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('full_name', fullName);
    fd.set('college', college);
    fd.set('course', course);
    fd.set('year', year);
    fd.set('skills', skills.join(','));
    fd.set('bio', bio);
    fd.set('availability', availability);
    startSave(async () => {
      const res = await saveStudentProfile(fd);
      setStatus({ ok: res.ok, msg: res.message });
    });
  }

  function handleCvSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startUpload(async () => {
      const res = await uploadCv(fd);
      if (res.ok) {
        setCvPath(`uploaded`);
        setFileName(fd.get('cv') instanceof File ? (fd.get('cv') as File).name : null);
      }
      setStatus({ ok: res.ok, msg: res.message });
    });
  }

  return (
    <div className="space-y-6">
      {/* Completion */}
      <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70">Profile completion</h2>
          <span className="text-2xl font-extrabold text-amber-400 tabular-nums">{completion}%</span>
        </div>
        <Progress value={completion} aria-label="Profile completion" />
        <p className="text-xs text-white/40 mt-2">
          {completion === 100
            ? 'Complete. Founders can shortlist you.'
            : 'Add more details to appear higher in founder searches.'}
        </p>
      </section>

      {/* Status banner */}
      {status && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            status.ok
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {status.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      {/* CV upload */}
      <form onSubmit={handleCvSubmit} className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-1">CV / Resume</h2>
        <p className="text-xs text-white/40 mb-4">PDF only, max 5 MB.</p>

        {cvPath ? (
          <div className="flex items-center gap-3 mb-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30 px-4 py-3">
            <FileText className="w-5 h-5 text-emerald-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-300 truncate">CV uploaded</p>
              {fileName && <p className="text-xs text-white/40 truncate">{fileName}</p>}
            </div>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 text-xs font-semibold text-emerald-300 underline underline-offset-2 hover:text-emerald-200 transition-colors"
              >
                View PDF
              </a>
            )}
          </div>
        ) : null}

        <label
          htmlFor="cv"
          className="flex items-center justify-center gap-2 w-full border border-dashed border-white/20 rounded-xl px-4 py-4 text-sm text-white/60 hover:border-amber-400/50 hover:text-white transition-colors cursor-pointer mb-4"
        >
          <Upload className="w-4 h-4" />
          {cvPath ? 'Replace PDF' : 'Choose PDF file'}
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <Button
          type="submit"
          disabled={uploading}
          variant="outline"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 h-11"
        >
          {uploading ? 'Uploading...' : 'Upload CV'}
        </Button>
      </form>

      {/* Profile details */}
      <form onSubmit={handleProfileSubmit} className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-5">
        <div>
          <Label htmlFor="full_name" className="mb-2">Full name *</Label>
          <input id="full_name" className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tashi Dorji" required autoComplete="name" />
        </div>

        <div>
          <Label htmlFor="college" className="mb-2">College</Label>
          <input id="college" className={inputCls} value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Royal Thimphu College" autoComplete="organization" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course" className="mb-2">Course</Label>
            <input id="course" className={inputCls} value={course} onChange={(e) => setCourse(e.target.value)} placeholder="BSc Computer Science" />
          </div>
          <div>
            <Label htmlFor="year" className="mb-2">Year</Label>
            <select id="year" className={`${inputCls} [&>option]:bg-[#13111a]`} value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y} year</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="skill-input" className="mb-2">Skills</Label>
          <div className="flex gap-2">
            <input
              id="skill-input"
              className={inputCls}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="React, Figma, Python..."
              inputMode="text"
            />
            <Button type="button" onClick={addSkill} variant="outline" className="shrink-0 border-white/20 bg-transparent text-white hover:bg-white/10 h-auto min-h-[48px] px-4">
              Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((s) => (
                <Badge key={s} className="pr-1 gap-1">
                  {s}
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="rounded-full p-0.5 hover:bg-black/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bio" className="mb-2">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell founders what you can build and what you want to learn..."
            maxLength={600}
            className="text-base"
          />
          <p className="text-xs text-white/30 mt-1 text-right">{bio.length}/600</p>
        </div>

        <div>
          <Label htmlFor="availability" className="mb-2">Availability</Label>
          <select
            id="availability"
            className={`${inputCls} [&>option]:bg-[#13111a]`}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Select availability</option>
            {AVAILABILITY.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-400 text-black font-bold hover:bg-amber-300 h-12 text-base"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
