'use client';

/** Editable founder display name with explicit pending and result states. */
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateFounderName } from './actions';

export function ProfileClient({ fullName }: { fullName: string }) {
  const [name, setName] = useState(fullName);
  const [draft, setDraft] = useState(fullName);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, startSave] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startSave(async () => {
      const res = await updateFounderName(formData);
      if (res.ok) setName(draft.trim());
      setResult(res);
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-[#17352b]">Display name</h2>
        <p className="mt-1 text-sm leading-6 text-[#56645c]">
          Shown on your projects and wherever your profile appears.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="founder-full-name" className="mb-2 block">
            Full name
          </Label>
          <Input
            id="founder-full-name"
            name="full_name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
          />
        </div>

        <Button
          type="submit"
          disabled={saving || draft.trim() === name}
          className="pressable inline-flex min-h-11 bg-[#17352b] px-5 py-3 font-semibold text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]"
        >
          {saving ? 'Saving...' : 'Save name'}
        </Button>
      </form>

      <p className="text-xs text-[#657069]">Current name: {name}</p>

      {result && (
        <p
          role={result.ok ? 'status' : 'alert'}
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm ${
            result.ok
              ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
              : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
          }`}
        >
          {result.message}
        </p>
      )}
    </section>
  );
}
