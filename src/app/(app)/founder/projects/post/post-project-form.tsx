'use client';

/**
 * Post a Project form — light theme, simple layout.
 */
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/features/projects/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/shadcn/progress';
import { X } from '@phosphor-icons/react';

const DURATIONS = ['1 week', '2 weeks', '1 month', '2 months', '3 months'];
const WORK_MODES = ['remote', 'onsite'] as const;
type WorkMode = (typeof WORK_MODES)[number];
/** Matches numeric(10,2) in neon/schema.sql; the Zod schema still needs this bound. */
const MAX_BUDGET = 99999999.99;
/** number inputs accept values the column would round; check precision in the UI too. */
const BUDGET_PATTERN = /^(?:\d+|\d*\.\d{1,2})$/;
type FieldId = 'title' | 'description' | 'duration' | 'budget-min' | 'budget-max';

function isBudgetInput(value: string) {
  return BUDGET_PATTERN.test(value.trim());
}

export function PostProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [duration, setDuration] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('remote');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [invalidFields, setInvalidFields] = useState<FieldId[]>([]);
  const [saving, startSave] = useTransition();
  const workModeRefs = useRef<Record<WorkMode, HTMLButtonElement | null>>({
    remote: null,
    onsite: null,
  });

  // One badge must equal one stored skill: the server splits this comma list.
  function addSkill() {
    const additions = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (additions.length) {
      setSkills((current) => {
        const next = [...current];
        for (const skill of additions) {
          if (!next.includes(skill) && next.length < 15) next.push(skill);
        }
        return next;
      });
    }
    setSkillInput('');
  }

  function handleWorkModeKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    mode: WorkMode
  ) {
    const index = WORK_MODES.indexOf(mode);
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % WORK_MODES.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + WORK_MODES.length) % WORK_MODES.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = WORK_MODES.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const nextMode = WORK_MODES[next];
    setWorkMode(nextMode);
    workModeRefs.current[nextMode]?.focus();
  }

  // Mirrors createProjectSchema and the numeric(10,2) column, so a completed
  // bar means the form can be posted without a DB rounding surprise.
  const minBudget = Number(budgetMin);
  const maxBudget = Number(budgetMax);
  const requirements: { id: FieldId; label: string; error: string; done: boolean }[] = [
    {
      id: 'title',
      label: 'Title of at least 5 characters',
      error: 'Add a title of at least 5 characters.',
      done: title.trim().length >= 5,
    },
    {
      id: 'description',
      label: 'Description of at least 20 characters',
      error: 'Add a description of at least 20 characters.',
      done: description.trim().length >= 20 && description.length <= 2000,
    },
    {
      id: 'duration',
      label: 'A duration',
      error: 'Choose a duration.',
      done: DURATIONS.includes(duration),
    },
    {
      id: 'budget-min',
      label: 'A positive minimum budget',
      error: `Enter a minimum budget above 0, up to 2 decimals, and at most ${MAX_BUDGET} Nu.`,
      done:
        budgetMin.trim() !== '' &&
        isBudgetInput(budgetMin) &&
        minBudget > 0 &&
        minBudget <= MAX_BUDGET,
    },
    {
      id: 'budget-max',
      label: 'A maximum budget at least as high as the minimum',
      error: `Enter a maximum budget above 0, at least the minimum, up to 2 decimals, and at most ${MAX_BUDGET} Nu.`,
      done:
        budgetMax.trim() !== '' &&
        isBudgetInput(budgetMax) &&
        maxBudget > 0 &&
        maxBudget >= minBudget &&
        maxBudget <= MAX_BUDGET,
    },
  ];
  const ready = requirements.filter((item) => item.done).length;
  const missing = requirements.filter((item) => !item.done).map((item) => item.label);
  // A submitted field stops showing its error as soon as its value becomes valid.
  const errors = Object.fromEntries(
    requirements
      .filter((item) => !item.done && invalidFields.includes(item.id))
      .map((item) => [item.id, item.error])
  ) as Partial<Record<FieldId, string>>;

  function fieldError(id: FieldId) {
    return errors[id] ? (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-[#c2004b]">
        {errors[id]}
      </p>
    ) : null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The submit button is disabled while saving; guard other submit paths too.
    if (saving) return;
    // The bar is real: a completed bar means the same checks the server
    // action applies have passed, so do not send an incomplete brief.
    if (ready !== requirements.length) {
      const failed = requirements.filter((item) => !item.done);
      setInvalidFields(failed.map((item) => item.id));
      setStatus({ ok: false, msg: `Still needed: ${missing.join('; ')}.` });
      const first = failed[0];
      if (first) {
        requestAnimationFrame(() => document.getElementById(first.id)?.focus());
      }
      return;
    }
    setInvalidFields([]);
    setStatus(null);
    const fd = new FormData();
    fd.set('title', title);
    fd.set('description', description);
    fd.set('skills', skills.join(','));
    fd.set('duration', duration);
    fd.set('budget_min', budgetMin);
    fd.set('budget_max', budgetMax);
    fd.set('work_mode', workMode);
    fd.set('deadline', deadline);

    startSave(async () => {
      try {
        const res = await createProject(fd);
        if (res.ok) {
          router.push('/founder/projects');
        } else {
          setStatus({ ok: false, msg: res.message });
        }
      } catch {
        // The action can reject before it returns a result (e.g. role lookup).
        setStatus({ ok: false, msg: 'Could not post project. Try again.' });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status && !status.ok && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-[#c2004b]/25 bg-[#ff0063]/8 px-4 py-3 text-sm text-[#c2004b]">
          {status.msg}
        </p>
      )}

      <div className="rounded-xl border border-[#b9dede] bg-[#eaf6f6] p-4">
        <Progress
          value={ready}
          max={requirements.length}
          label="Ready to post"
          valueLabel={`${ready} of ${requirements.length} details ready`}
        />
        <p id="post-form-missing" aria-live="polite" className="mt-2 text-xs leading-5 text-[#356464]">
          {missing.length === 0
            ? 'All required details are ready. You can post the project.'
            : `Still needed: ${missing.join('; ')}.`}
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-[#b9dede] bg-[#ffffff] p-5">
        <div>
          <Label htmlFor="title" className="mb-2">Project title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mobile app UI redesign"
            required
            minLength={5}
            maxLength={120}
            invalid={Boolean(errors.title)}
            describedBy={errors.title ? 'title-error' : undefined}
            className="w-full rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
          />
          {fieldError('title')}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="description">Description *</Label>
            <span className="text-xs text-[#356464]">{description.length}/2000</span>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to be built, deliverables, tools the student will use..."
            required
            minLength={20}
            maxLength={2000}
            invalid={Boolean(errors.description)}
            describedBy={errors.description ? 'description-error' : undefined}
            className="w-full min-h-[140px] rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
          />
          {fieldError('description')}
        </div>

        <div>
          <Label htmlFor="skill-input" className="mb-2">Skills students need</Label>
          <div className="flex gap-2">
            <Input
              id="skill-input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="React, Figma, Python..."
              className="w-full rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
            />
            <Button
              type="button"
              onClick={addSkill}
              disabled={skills.length >= 15}
              variant="outline"
              className="pressable h-auto min-h-11 shrink-0 border-[#b9dede] bg-[#ffffff] px-4 text-[#0b5c5c] hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
            >
              Add
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-[#356464]">
            Optional. Add up to 15 skills, separated by commas.
          </p>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((s) => (
                <Badge key={s} className="gap-1 border-[#b9dede] bg-[#eaf6f6] pr-1 text-[#0b5c5c]">
                  {s}
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="pressable grid min-h-6 min-w-6 place-items-center rounded-full p-0.5 transition-colors hover:bg-[#eaf6f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-[#b9dede] bg-[#ffffff] p-5">
        <div>
          <Label htmlFor="duration" className="mb-2">Duration *</Label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            aria-invalid={Boolean(errors.duration)}
            aria-describedby={errors.duration ? 'duration-error' : undefined}
            className="w-full rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
          >
            <option value="">Select duration</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {fieldError('duration')}
        </div>

        <div>
          <Label className="mb-2">Budget / stipend (Nu.) *</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                id="budget-min"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_BUDGET}
                step={0.01}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min"
                required
                aria-label="Budget minimum"
                invalid={Boolean(errors['budget-min'])}
                describedBy={errors['budget-min'] ? 'budget-min-error' : undefined}
                className="w-full rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base tabular-nums text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
              />
              {fieldError('budget-min')}
            </div>
            <div>
              <Input
                id="budget-max"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_BUDGET}
                step={0.01}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max"
                required
                aria-label="Budget maximum"
                invalid={Boolean(errors['budget-max'])}
                describedBy={errors['budget-max'] ? 'budget-max-error' : undefined}
                className="w-full rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base tabular-nums text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
              />
              {fieldError('budget-max')}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[#356464]">
            Nu. amounts can have up to 2 decimal places.
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-[#0b2e2e]">
            Work mode
          </legend>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Work mode">
            {WORK_MODES.map((mode) => (
              <button
                key={mode}
                ref={(node) => {
                  workModeRefs.current[mode] = node;
                }}
                type="button"
                role="radio"
                aria-checked={workMode === mode}
                tabIndex={workMode === mode ? 0 : -1}
                onKeyDown={(e) => handleWorkModeKeyDown(e, mode)}
                onClick={() => setWorkMode(mode)}
                className={`pressable min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] ${
                  workMode === mode
                    ? 'bg-[#66bfbf] text-[#0b2e2e]'
                    : 'border border-[#b9dede] bg-[#ffffff] text-[#356464] hover:bg-[#eaf6f6]'
                }`}
              >
                {mode === 'remote' ? 'Remote' : 'On-site'}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="deadline" className="mb-2">Deadline to apply</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            describedBy="deadline-help"
            className="w-full rounded-xl border border-[#b9dede] bg-[#ffffff] px-4 py-3 text-base text-[#0b5c5c] placeholder:text-[#356464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]/30 focus-visible:border-[#c2004b]"
          />
          <p id="deadline-help" className="mt-1.5 text-xs text-[#356464]">
            Optional. Open through this date in your local time; students see it on the card.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="pressable h-12 w-full bg-[#ff0063] text-base font-semibold text-[#000000] hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b]"
      >
        {saving ? 'Posting...' : 'Post project'}
      </Button>
    </form>
  );
}
