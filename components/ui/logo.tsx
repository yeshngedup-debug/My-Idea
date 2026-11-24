/**
 * Shared Bhutan Tech Connect logo symbol.
 *
 * Canonical mark: two equal dots joined by one bridge, capped by one amber
 * arch. Forest `#17352b` and in-app amber `#e0ad3c` come from
 * `lib/design-tokens.ts` (`colors.forest` / `colors.amberLogo`).
 *
 * All current call sites place the mark next to a visible wordmark, so it is
 * decorative by default. Pass `label` when the mark is used on its own (for
 * example, the only content of a link or button).
 */
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Size in Tailwind classes (applied to width/height). Default w-5 h-5. */
  size?: string;
  /** Accessible name for standalone use. Omit alongside a visible wordmark. */
  label?: string;
}

export function Logo({ size = "w-5 h-5", label }: LogoProps) {
  const decorative = label === undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn(size, "shrink-0")}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <circle cx="68" cy="145" r="11" className="fill-[#17352b]" />
      <circle cx="188" cy="145" r="11" className="fill-[#17352b]" />
      <rect
        x="79"
        y="139"
        width="98"
        height="16"
        rx="8"
        className="fill-[#17352b]"
      />
      <path
        d="M 79 139 A 52 52 0 0 1 177 139 L 177 147 A 52 52 0 0 0 79 147 Z"
        className="fill-[#e0ad3c]"
      />
    </svg>
  );
}
