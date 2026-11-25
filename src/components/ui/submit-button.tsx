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
    <>
      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="h-auto min-h-11 w-full rounded-lg bg-[#ff0063] py-3.5 font-medium text-[#000000] hover:bg-[#d40054]"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border-2 border-[#ffffff]/40 border-t-[#ffffff] animate-spin motion-reduce:animate-none"
            />
            {pendingLabel}
          </span>
        ) : (
          children
        )}
      </Button>
      {/* Disabling the button during submit can drop focus, so its changed
          label may never be announced. A stable live region fills that gap. */}
      <span role="status" aria-live="polite" className="sr-only">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}
