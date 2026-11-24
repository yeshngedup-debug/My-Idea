'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, FileText, CheckCircle, Warning } from '@phosphor-icons/react';
import { saveStudentProfile, uploadCv } from '@/app/actions/student-profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/shadcn/progress';

const YEARS = ['1st', '2nd', '3rd', '4th', 'Graduate'];
const AVAILABILITY = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'full_time', label: 'Full time' },
  { value: 'flexible', label: 'Flexible' },
];

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

export function ProfileForm({
  initial,
  cvUrl,
  cvPreviewUnavailable = false,
}: {
  initial: StudentProfileData;
  cvUrl?: string | null;
  cvPreviewUnavailable?: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.full_name ?? '');
  const [college, setCollege] = useState(initial.college ?? '');
  const [course, setCourse] = useState(initial.course ?? '');
  const [year, setYear] = useState(initial.year ?? '');
  const [skills, setSkills] = useState<string[]>(initial.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [availability, setAvailability] = useState(initial.availability ?? '');
  const [cvUploaded, setCvUploaded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [saving, startSave] = useTransition();
  const [uploading, startUpload] = useTransition();

  // The upload marker is derived: the server row wins once the refresh lands,
  // while an in-flight upload keeps the optimistic state visible. No fake path
  // is ever stored or shown as if it came from the database.
  const hasCv = Boolean(initial.cv_path) || cvUploaded;

  const { completion, completed, missing } = useMemo(() => {
    const checks = [
      { label: 'Full name', done: fullName.trim().length > 1 },
      { label: 'College', done: college.trim().length > 1 },
      { label: 'Course', done: course.trim().length > 1 },
      { label: 'Year', done: year !== '' },
      { label: 'Skills', done: skills.length > 0 },
      { label: 'Bio', done: bio.trim().length > 20 },
      { label: 'Availability', done: availability !== '' },
      { label: 'CV', done: hasCv },
    ];
    const done = checks.filter((c) => c.done).length;
    return {
      completion: Math.round((done / checks.length) * 100),
      completed: done,
      missing: checks.filter((c) => !c.done).map((c) => c.label),
    };
  }, [fullName, college, course, year, skills, bio, availability, hasCv]);

  function addSkill() {
    const v = skillInput.trim();
    if (v && !skills.includes(v) && skills.length < 15) setSkills([...skills, v]);
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
        setCvUploaded(true);
        setFileName(fd.get('cv') instanceof File ? (fd.get('cv') as File).name : null);
        // Re-run the server component so the CV preview uses a fresh signed
        // URL instead of the URL captured when this page first loaded.
        router.refresh();
      }
      setStatus({ ok: res.ok, msg: res.message });
    });
  }

  return (
    <div className="space-y-6">
      <section
        aria-label="Profile summary"
        className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5"
      >
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs text-[#657069]">Name</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-[#17352b]">
              {fullName.trim() || 'Not set'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#657069]">Completion</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-[#17352b]">
              {completion}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#657069]">CV</dt>
            <dd className="mt-1 text-sm font-semibold text-[#17352b]">
              {hasCv ? 'Uploaded' : 'Not uploaded'}
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-[#ded8cb] pt-4">
          <Progress
            value={completion}
            label="Profile completion"
            valueLabel={`${completed} of 8 details`}
            aria-valuetext={`${completion}% complete, ${completed} of 8 details`}
          />
          <p className="mt-3 text-xs text-[#657069]">
            {missing.length === 0
              ? 'Complete. Founders see a full profile.'
              : `Still needed: ${missing.join(', ')}`}
          </p>
        </div>
      </section>

      {status && (
        <p
          role={status.ok ? 'status' : 'alert'}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            status.ok
              ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
              : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
          }`}
        >
          {status.ok ? (
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Warning className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {status.msg}
        </p>
      )}

      <form onSubmit={handleCvSubmit} className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5">
        <h2 className="mb-1 text-sm font-semibold text-[#17352b]">CV / Resume</h2>
        <p className="mb-4 text-xs text-[#657069]">PDF only, max 5 MB.</p>

        {hasCv ? (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#17352b]/20 bg-[#17352b]/8 px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-[#17352b]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#17352b]">CV uploaded</p>
              {fileName && <p className="truncate text-xs text-[#657069]">{fileName}</p>}
            </div>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex min-h-11 shrink-0 items-center rounded text-xs font-semibold text-[#17352b] underline underline-offset-2 transition-colors hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
              >
                View PDF
              </a>
            )}
          </div>
        ) : null}
        {hasCv && !cvUrl && cvPreviewUnavailable && (
          <p className="mb-4 text-xs leading-5 text-[#b23c26]">
            Preview is unavailable right now. The uploaded CV is saved.
          </p>
        )}

        <input
          id="cv"
          name="cv"
          type="file"
          accept="application/pdf,.pdf"
          className="peer sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <label
          htmlFor="cv"
          className="mb-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#ded8cb] px-4 py-4 text-sm text-[#4c5a52] transition-colors hover:border-[#17352b]/40 hover:text-[#17352b] peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#b23c26] peer-focus-visible:ring-offset-2"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {hasCv ? 'Replace PDF' : 'Choose PDF file'}
        </label>
        {fileName && !hasCv && (
          <p className="mb-4 truncate text-xs text-[#657069]">
            Selected file: <span className="font-medium text-[#17352b]">{fileName}</span>
          </p>
        )}
        <Button type="submit" disabled={uploading} variant="outline" className="h-11 w-full border-[#ded8cb] bg-[#fffefa] text-[#17352b] hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
          {uploading ? 'Uploading...' : 'Upload CV'}
        </Button>
      </form>

      <form onSubmit={handleProfileSubmit} className="space-y-5 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5">
        <div>
          <Label htmlFor="full_name" className="mb-2">Full name *</Label>
          <input
            id="full_name"
            className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tashi Dorji"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <Label htmlFor="college" className="mb-2">College</Label>
          <input id="college" className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Royal Thimphu College" autoComplete="organization" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course" className="mb-2">Course</Label>
            <input id="course" className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="BSc Computer Science" />
          </div>
          <div>
            <Label htmlFor="year" className="mb-2">Year</Label>
            <select id="year" className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]" value={year} onChange={(e) => setYear(e.target.value)}>
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
              className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
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
            <Button type="button" onClick={addSkill} variant="outline" className="h-auto min-h-[48px] shrink-0 border-[#ded8cb] bg-[#fffefa] px-4 text-[#17352b] hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
              Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((s) => (
                <Badge key={s} className="gap-1 border-[#ded8cb] bg-[#f5f2ea] pr-1 text-[#17352b]">
                  {s}
                  <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills(skills.filter((x) => x !== s))} className="grid min-h-6 min-w-6 place-items-center rounded-full p-0.5 transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bio" className="mb-2">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell founders what you can build and what you want to learn..." maxLength={600} className="w-full min-h-[140px] rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]" />
          <p className="mt-1 text-right text-xs text-[#657069]">{bio.length}/600</p>
        </div>

        <div>
          <Label htmlFor="availability" className="mb-2">Availability</Label>
          <select id="availability" className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]" value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">Select availability</option>
            {AVAILABILITY.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={saving} className="pressable h-12 w-full bg-[#17352b] text-base font-semibold text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
