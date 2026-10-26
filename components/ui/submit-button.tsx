'use client';

/**
 * Submit button with a pending state — shows a spinner label while the
 * server action is in flight so slow logins never look frozen.
 */
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full bg-amber-400 text-black font-bold py-3.5 rounded-xl hover:bg-amber-300 shadow-lg shadow-amber-400/20 h-auto"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"
          />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
