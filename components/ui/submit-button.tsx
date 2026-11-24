"use client";

/**
 * Submit button with a pending state — shows a spinner label while the
 * server action is in flight so slow logins never look frozen.
 */
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

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
      className="h-auto min-h-11 w-full rounded-lg bg-[#17352b] py-3.5 font-medium text-[#fffefa] hover:bg-[#244b3e]"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded-full border-2 border-[#fffefa]/40 border-t-[#fffefa] animate-spin"
          />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
