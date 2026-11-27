/**
 * One accessible field-error surface for every auth form. `role="alert"` makes
 * each newly shown message a live region; the input keeps the `aria-describedby`
 * and `aria-invalid` wiring, and focus still moves in each form's submit handler.
 */
export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-sm font-semibold leading-5 text-foreground"
    >
      {children}
    </p>
  );
}
