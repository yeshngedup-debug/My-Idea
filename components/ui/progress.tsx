import { cn } from '@/lib/utils';

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10', className)}
    >
      <div
        className="h-full rounded-full bg-amber-400 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
