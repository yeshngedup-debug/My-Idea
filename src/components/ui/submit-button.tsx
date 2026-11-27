"use client";

/**
 * Submit button with a pending state — shows a plain pending label while the
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
        className="h-auto min-h-12 w-full rounded-[2px] bg-cta py-3.5 text-[13px] font-semibold text-cta-foreground hover:bg-cta-hover"
      >
        {pending ? pendingLabel : children}
      </Button>
      {/* Disabling the button during submit can drop focus, so its changed
          label may never be announced. A stable live region fills that gap. */}
      <span role="status" aria-live="polite" className="sr-only">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}
