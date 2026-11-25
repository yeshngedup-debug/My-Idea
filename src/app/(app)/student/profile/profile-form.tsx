'use client';

/**
 * Editable student profile. All data comes from the server component; the
 * only writes are the two server actions, which re-check the session and
 * the student role. No client code reads a table directly.
 */
import { useMemo, useRef, useState, useTransition, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, FileText, CheckCircle, Warning } from '@phosphor-icons/react';
import { saveStudentProfile, uploadCv } from '@/features/users/actions';
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

const MAX_SKILLS = 15;
const MAX_BIO = 600;
const MAX_CV_BYTES = 5 * 1024 * 1024;

/** Select and submit must agree on what can be uploaded. */
function isPdfFile(file: File) {
  return file.type === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf');
}

/** Mirror the server action so a mislabelled non-PDF is rejected before upload. */
async function hasPdfHeader(file: File) {
  try {
    const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    return header === '%PDF-';
  } catch {
    return false;
  }
}

/** One style contract for every text field, including select controls. */
const FIELD_CLASS =
  'w-full min-w-0 rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#5f6b63] focus:outline-none focus-visible:border-[#d84f37] focus-visible:ring-2 focus-visible:ring-[#d84f37]/35 motion-reduce:transition-none';

type Banner = { tone: 'success' | 'error'; msg: string };

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
  const [fileName, setFileName] = useState<string | null>(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const cvSelectionId = useRef(0);

  const [saving, startSave] = useTransition();
  const [uploading, startUpload] = useTransition();

  // The database row is the source of truth; the optimistic marker only
  // bridges the gap until router.refresh() delivers the updated row and a
  // freshly signed CV URL. No fake path is ever stored or displayed.
  const hasCv = Boolean(initial.cv_path) || cvUploaded;

  const { completion, completed, total, missing } = useMemo(() => {
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
      total: checks.length,
      missing: checks.filter((c) => !c.done).map((c) => c.label),
    };
  }, [fullName, college, course, year, skills, bio, availability, hasCv]);

  // A single banner slot avoids competing role="status"/role="alert" nodes
  // during the pending → settled transition.
  const visibleBanner = saving
    ? { tone: 'pending' as const, msg: 'Saving profile…' }
    : uploading
      ? { tone: 'pending' as const, msg: 'Uploading CV…' }
      : banner;

  function addSkill() {
    const incoming = skillInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (incoming.length === 0) return;

    // Check the whole batch first: a rejected entry must not leave half of it
    // added while the input is cleared and only an error is shown.
    const seen = new Set(skills.map((s) => s.toLowerCase()));
    const duplicate = incoming.find((skill) => {
      const key = skill.toLowerCase();
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (duplicate) {
      setBanner({ tone: 'error', msg: `${duplicate} is already added.` });
      skillInputRef.current?.focus();
      return;
    }
    if (skills.length + incoming.length > MAX_SKILLS) {
      setBanner({ tone: 'error', msg: `You can add up to ${MAX_SKILLS} skills.` });
      skillInputRef.current?.focus();
      return;
    }

    setSkills([...skills, ...incoming]);
    setSkillInput('');
    setBanner(null);
  }

  async function handleCvChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0] ?? null;
    if (!file) {
      setFileName(null);
      return;
    }

    const selectionId = ++cvSelectionId.current;
    const reject = (msg: string) => {
      if (input.files?.[0] === file) input.value = '';
      setFileName(null);
      setBanner({ tone: 'error', msg });
      fileInputRef.current?.focus();
    };

    if (!isPdfFile(file)) {
      reject('Use a PDF file.');
      return;
    }
    if (file.size === 0 || file.size > MAX_CV_BYTES) {
      reject('PDF must be 5 MB or smaller.');
      return;
    }
    if (!(await hasPdfHeader(file))) {
      if (selectionId !== cvSelectionId.current) return;
      reject('Use a valid PDF file.');
      return;
    }
    if (selectionId !== cvSelectionId.current) return;

    setFileName(file.name);
    setBanner(null);
  }

  function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setBanner({ tone: 'error', msg: 'Enter your full name (at least 2 characters).' });
      fullNameRef.current?.focus();
      return;
    }
    if (skills.length > MAX_SKILLS) {
      setBanner({ tone: 'error', msg: `You can add up to ${MAX_SKILLS} skills.` });
      skillInputRef.current?.focus();
      return;
    }
    if (bio.length > MAX_BIO) {
      setBanner({ tone: 'error', msg: `Bio must be at most ${MAX_BIO} characters.` });
      return;
    }

    const fd = new FormData();
    fd.set('full_name', fullName.trim());
    fd.set('college', college.trim());
    fd.set('course', course.trim());
    fd.set('year', year);
    fd.set('skills', skills.join(','));
    fd.set('bio', bio.trim());
    fd.set('availability', availability);

    startSave(async () => {
      try {
        const res = await saveStudentProfile(fd);
        setBanner({ tone: res.ok ? 'success' : 'error', msg: res.message });
        if (res.ok) router.refresh();
      } catch {
        setBanner({
          tone: 'error',
          msg: 'Could not save profile. Check your connection and try again.',
        });
      }
    });
  }

  async function handleCvSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setBanner({ tone: 'error', msg: 'Choose a PDF first.' });
      fileInputRef.current?.focus();
      return;
    }
    if (!isPdfFile(file)) {
      setBanner({ tone: 'error', msg: 'Use a PDF file.' });
      fileInputRef.current?.focus();
      return;
    }
    if (file.size === 0 || file.size > MAX_CV_BYTES) {
      setBanner({ tone: 'error', msg: 'PDF must be 5 MB or smaller.' });
      fileInputRef.current?.focus();
      return;
    }
    if (!(await hasPdfHeader(file))) {
      if (fileInputRef.current?.files?.[0] !== file) return;
      setBanner({ tone: 'error', msg: 'Use a valid PDF file.' });
      fileInputRef.current?.focus();
      return;
    }
    if (fileInputRef.current?.files?.[0] !== file) return;

    const fd = new FormData();
    fd.set('cv', file);

    startUpload(async () => {
      try {
        const res = await uploadCv(fd);
        if (res.ok) {
          setCvUploaded(true);
          setFileName(file.name);
          if (fileInputRef.current) fileInputRef.current.value = '';
          // Re-run the server component so the preview uses a fresh signed
          // URL rather than the one captured when this page first loaded.
          router.refresh();
        }
        setBanner({ tone: res.ok ? 'success' : 'error', msg: res.message });
      } catch {
        setBanner({
          tone: 'error',
          msg: 'Could not upload CV. Check your connection and try again.',
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="profile-summary-heading"
        className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5"
      >
        <h2 id="profile-summary-heading" className="text-sm font-semibold text-[#17352b]">
          Progress
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs text-[#657069]">Name</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-[#17352b]">
              {fullName.trim() || 'Not set'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-[#657069]">Details added</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-[#17352b]">
              {completion}%
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-[#657069]">CV</dt>
            <dd className="mt-1 text-sm font-semibold text-[#17352b]">
              {hasCv ? 'Uploaded' : 'Not uploaded'}
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-[#ded8cb] pt-4">
          <Progress
            value={completion}
            label="Profile details"
            valueLabel={`${completed} of ${total} added`}
            aria-valuetext={`${completion}% of profile details added, ${completed} of ${total}`}
          />
          <p className="mt-3 text-xs leading-5 text-[#657069]">
            {missing.includes('Full name')
              ? 'Add your full name to save this profile. Other details are optional.'
              : missing.length === 0
                ? 'All details added. Save any changes to keep them.'
                : `Add more detail when you can: ${missing.join(', ')}`}
          </p>
        </div>
      </section>

      {visibleBanner && (
        <p
          role={visibleBanner.tone === 'error' ? 'alert' : 'status'}
          className={`flex min-w-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm leading-6 ${
            visibleBanner.tone === 'success'
              ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
              : visibleBanner.tone === 'error'
                ? 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
                : 'border-[#ded8cb] bg-[#f5f2ea] text-[#4c5a52]'
          }`}
        >
          {visibleBanner.tone === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : visibleBanner.tone === 'error' ? (
            <Warning className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-current" />
          )}
          <span>{visibleBanner.msg}</span>
        </p>
      )}

      <form
        onSubmit={(e) => { void handleCvSubmit(e); }}
        aria-labelledby="cv-heading"
        className="rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5"
      >
        <h2 id="cv-heading" className="text-sm font-semibold text-[#17352b]">
          CV / Resume
        </h2>
        <p id="cv-hint" className="mt-1 text-xs text-[#657069]">
          PDF only, max 5 MB.
        </p>

        {hasCv && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#17352b]/20 bg-[#17352b]/8 px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-[#17352b]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#17352b]">CV uploaded</p>
              {fileName && (
                <p className="break-all text-xs leading-5 text-[#657069]" title={fileName}>
                  {fileName}
                </p>
              )}
            </div>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex min-h-11 shrink-0 items-center rounded text-xs font-semibold text-[#17352b] underline underline-offset-2 transition-colors hover:text-[#b23c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] motion-reduce:transition-none"
              >
                View PDF
              </a>
            )}
          </div>
        )}
        {hasCv && !cvUrl && cvPreviewUnavailable && (
          <p role="alert" className="mt-2 text-xs leading-5 text-[#b23c26]">
            Preview is unavailable right now. The uploaded CV is saved.
          </p>
        )}

        <div className="mt-4">
          <input
            ref={fileInputRef}
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            aria-describedby="cv-hint"
            className="peer sr-only"
            onChange={(e) => { void handleCvChange(e); }}
          />
          <label
            htmlFor="cv"
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#ded8cb] px-4 py-4 text-sm text-[#4c5a52] transition-colors hover:border-[#17352b]/40 hover:text-[#17352b] peer-focus-visible:border-[#d84f37] peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#d84f37] peer-focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
            {hasCv ? 'Replace PDF' : 'Choose PDF file'}
          </label>
          {fileName && !hasCv && (
            <p className="mt-2 text-xs leading-5 text-[#657069]">
              Selected file:{' '}
              <span className="break-all font-medium text-[#17352b]" title={fileName}>
                {fileName}
              </span>
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={uploading}
          variant="outline"
          className="mt-3 w-full border-[#ded8cb] bg-[#fffefa] text-[#17352b]"
        >
          {uploading ? 'Uploading...' : 'Upload CV'}
        </Button>
      </form>

      <form
        onSubmit={handleProfileSubmit}
        noValidate
        aria-labelledby="details-heading"
        className="space-y-5 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5"
      >
        <h2 id="details-heading" className="text-sm font-semibold text-[#17352b]">
          Your details
        </h2>

        <div>
          <Label htmlFor="full_name" required className="mb-2">Full name</Label>
          <input
            ref={fullNameRef}
            id="full_name"
            className={FIELD_CLASS}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tashi Dorji"
            aria-describedby="full-name-hint"
            required
            minLength={2}
            autoComplete="name"
          />
          <p id="full-name-hint" className="mt-1 text-xs leading-5 text-[#657069]">
            Required. The other details are optional.
          </p>
        </div>

        <div>
          <Label htmlFor="college" className="mb-2">College</Label>
          <input
            id="college"
            className={FIELD_CLASS}
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="Royal Thimphu College"
            autoComplete="organization"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <Label htmlFor="course" className="mb-2">Course</Label>
            <input
              id="course"
              className={FIELD_CLASS}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="BSc Computer Science"
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor="year" className="mb-2">Year</Label>
            <select
              id="year"
              className={FIELD_CLASS}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
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
              ref={skillInputRef}
              id="skill-input"
              className={FIELD_CLASS}
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
              aria-describedby="skills-hint"
            />
            <Button
              type="button"
              onClick={addSkill}
              variant="outline"
              className="h-auto min-h-[48px] shrink-0 border-[#ded8cb] bg-[#fffefa] px-4 text-[#17352b]"
            >
              Add
            </Button>
          </div>
          <p id="skills-hint" className="mt-2 text-xs text-[#657069]">
            Press Enter or Add. Separate multiple skills with commas. Up to {MAX_SKILLS}.
          </p>
          {skills.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s} className="min-w-0">
                  <Badge className="max-w-full gap-1 border-[#ded8cb] bg-[#f5f2ea] py-1 pl-2.5 pr-1 text-[#17352b]">
                    <span className="truncate" title={s}>{s}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${s}`}
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#ded8cb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] motion-reduce:transition-none"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="bio" className="mb-2">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell founders what you can build and what you want to learn..."
            maxLength={MAX_BIO}
            aria-describedby="bio-count"
            className={`${FIELD_CLASS} min-h-[140px] resize-y`}
          />
          <p id="bio-count" className="mt-1 text-right text-xs text-[#657069]">
            {bio.length}/{MAX_BIO}
          </p>
        </div>

        <div>
          <Label htmlFor="availability" className="mb-2">Availability</Label>
          <select
            id="availability"
            className={FIELD_CLASS}
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
          className="pressable h-12 w-full bg-[#17352b] text-base font-semibold text-[#fffefa]"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
