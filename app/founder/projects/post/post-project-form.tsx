'use client';

/**
 * Post a Project form — light theme, simple layout.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/shadcn/progress';
import { X } from '@phosphor-icons/react';

const DURATIONS = ['1 week', '2 weeks', '1 month', '2 months', '3 months'];

export function PostProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [duration, setDuration] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [workMode, setWorkMode] = useState<'remote' | 'onsite'>('remote');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, startSave] = useTransition();

  function addSkill() {
    const v = skillInput.trim();
    if (v && !skills.includes(v) && skills.length < 15) setSkills([...skills, v]);
    setSkillInput('');
  }

  // Mirrors createProjectSchema: the indicator reports only fields the server
  // also checks, so a completed bar means the form can actually be posted.
  const minBudget = Number(budgetMin);
  const maxBudget = Number(budgetMax);
  const requirements = [
    { label: 'Title of at least 5 characters', done: title.trim().length >= 5 },
    {
      label: 'Description of at least 20 characters',
      done: description.trim().length >= 20 && description.length <= 2000,
    },
    { label: 'A duration', done: DURATIONS.includes(duration) },
    { label: 'A positive minimum budget', done: budgetMin.trim() !== '' && minBudget > 0 },
    {
      label: 'A maximum budget at least as high as the minimum',
      done: budgetMax.trim() !== '' && maxBudget > 0 && maxBudget >= minBudget,
    },
  ];
  const ready = requirements.filter((item) => item.done).length;
  const missing = requirements.filter((item) => !item.done).map((item) => item.label);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      const res = await createProject(fd);
      if (res.ok) {
        router.push('/founder/projects');
      } else {
        setStatus({ ok: false, msg: res.message });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status && !status.ok && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-4 py-3 text-sm text-[#b23c26]">
          {status.msg}
        </p>
      )}

      <div className="rounded-xl border border-[#ded8cb] bg-[#f5f2ea] p-4">
        <Progress
          value={ready}
          max={requirements.length}
          label="Ready to post"
          valueLabel={`${ready} of ${requirements.length} details ready`}
          aria-describedby="post-form-missing"
        />
        <p id="post-form-missing" className="mt-2 text-xs leading-5 text-[#56645c]">
          {missing.length === 0
            ? 'All required details are ready. You can post the project.'
            : `Still needed: ${missing.join('; ')}.`}
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5">
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
            className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="description">Description *</Label>
            <span className="text-xs text-[#657069]">{description.length}/2000</span>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to be built, deliverables, tools the student will use..."
            required
            minLength={20}
            maxLength={2000}
            className="w-full min-h-[140px] rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
          />
        </div>

        <div>
          <Label htmlFor="skill-input" className="mb-2">Required skills</Label>
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
              className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
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
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="grid min-h-6 min-w-6 place-items-center rounded-full p-0.5 transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-[#ded8cb] bg-[#fffefa] p-5">
        <div>
          <Label htmlFor="duration" className="mb-2">Duration *</Label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
          >
            <option value="">Select duration</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2">Budget / stipend (Nu.) *</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                inputMode="numeric"
                min={100}
                step={100}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min"
                required
                aria-label="Budget minimum"
                className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
              />
            </div>
            <div>
              <Input
                type="number"
                inputMode="numeric"
                min={100}
                step={100}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max"
                required
                aria-label="Budget maximum"
                className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2">Work mode</Label>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Work mode">
            {(['remote', 'onsite'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={workMode === mode}
                onClick={() => setWorkMode(mode)}
                className={`min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
                  workMode === mode
                    ? 'bg-[#17352b] text-[#fffefa]'
                    : 'border border-[#ded8cb] bg-[#fffefa] text-[#4c5a52] hover:bg-[#f5f2ea]'
                }`}
              >
                {mode === 'remote' ? 'Remote' : 'On-site'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="deadline" className="mb-2">Deadline to apply</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] placeholder:text-[#8d948e] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
          />
          <p className="mt-1.5 text-xs text-[#657069]">Optional. Students see this on the project card.</p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="pressable h-12 w-full bg-[#17352b] text-base font-bold text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
      >
        {saving ? 'Posting...' : 'Post project'}
      </Button>
    </form>
  );
}
