'use client';

/** Editable founder display name with explicit pending and result states. */
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusMessage } from '@/components/ui/status-message';
import { updateFounderName } from './actions';

/** Mirrors the server schema so bad names get app-level feedback, not just a native tooltip. */
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

type SaveResult = { ok: boolean; message: string; fieldError?: boolean };

function nameError(value: string): string | null {
  const length = value.trim().length;
  if (length < MIN_NAME_LENGTH) return 'Enter a name of at least 2 characters.';
  if (length > MAX_NAME_LENGTH) return 'Name must be at most 100 characters.';
  return null;
}

export function ProfileClient({ fullName }: { fullName: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(fullName);
  const [draft, setDraft] = useState(fullName);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [saving, startSave] = useTransition();

  // The server is authoritative. After router.refresh() the prop can change
  // (the stored name may differ from what we submitted), so re-sync the local
  // state with it. An unsaved edit in the field is never overwritten.
  const [lastServerName, setLastServerName] = useState(fullName);
  if (fullName !== lastServerName) {
    setLastServerName(fullName);
    setName(fullName);
    setDraft((current) => (current.trim() === name ? fullName : current));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = nameError(draft);
    if (error) {
      setResult({ ok: false, message: error, fieldError: true });
      inputRef.current?.focus();
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set('full_name', draft.trim());
    startSave(async () => {
      try {
        const res = await updateFounderName(formData);
        if (res.ok) {
          const savedName = draft.trim();
          setName(savedName);
          // Keep the editable field aligned with the trimmed value on the card.
          setDraft(savedName);
          // Server data (the Account card) must catch up with the success banner.
          router.refresh();
        }
        setResult(res);
        if (!res.ok) inputRef.current?.focus();
      } catch {
        setResult({ ok: false, message: 'Could not save your name. Please try again.' });
        inputRef.current?.focus();
      }
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-[#b9dede] bg-[#ffffff] p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-[#0b5c5c]">Display name</h2>
        <p className="mt-1 text-sm leading-6 text-[#356464]">
          Shown on your projects and wherever your profile appears.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="founder-full-name" className="mb-2 block">
            Full name
          </Label>
          <Input
            ref={inputRef}
            id="founder-full-name"
            name="full_name"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setResult(null);
            }}
            required
            minLength={MIN_NAME_LENGTH}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="name"
            disabled={saving}
            invalid={Boolean(result && !result.ok && result.fieldError)}
            describedBy={
              result && !result.ok && result.fieldError
                ? 'founder-name-result'
                : undefined
            }
            className="w-full rounded-md border border-[#b9dede] bg-[#ffffff] px-3.5 py-2.5 text-base text-[#0b5c5c]"
          />
        </div>

        <Button
          type="submit"
          disabled={saving || draft.trim() === name}
          className="pressable inline-flex min-h-11 bg-[#ff0063] px-5 py-3 font-semibold text-[#000000] hover:bg-[#d40054]"
        >
          {saving ? 'Saving...' : 'Save name'}
        </Button>
      </form>

      <p className="text-xs text-[#356464]">Current name: {name}</p>

      {result && (
        <StatusMessage
          id="founder-name-result"
          tone={result.ok ? 'success' : 'error'}
        >
          {result.message}
        </StatusMessage>
      )}
    </section>
  );
}
