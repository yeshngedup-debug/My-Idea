'use client';

/**
 * Post a Project form — dark design, skills chips, budget range,
 * duration select, remote/on-site pills, deadline picker.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';
import { createProject } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/30 text-red-300 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {status.msg}
        </p>
      )}

      <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-5">
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
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="description">Description *</Label>
            <span className="text-xs text-white/30">{description.length}/2000</span>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to be built, deliverables, tools the student will use..."
            required
            minLength={20}
            maxLength={2000}
            className="min-h-[140px]"
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
      </div>

      <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-5">
        <div>
          <Label htmlFor="duration" className="mb-2">Duration *</Label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 [&>option]:bg-[#13111a]"
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
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  workMode === mode
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
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
          />
          <p className="text-xs text-white/30 mt-1.5">Optional. Students see this on the project card.</p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-amber-400 text-black font-bold hover:bg-amber-300 h-12 text-base"
      >
        {saving ? 'Posting...' : 'Post project'}
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs text-white/30">
        <Briefcase className="w-3.5 h-3.5" />
        Your project goes live for students immediately.
      </p>
    </form>
  );
}
