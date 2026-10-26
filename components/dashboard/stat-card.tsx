/**
 * Stat card — AdminCN style: icon tile, muted label, big number, sub note.
 */
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[#13111a] ring-1 ring-white/10 rounded-xl p-5 flex flex-col gap-4">
      <span className="w-9 h-9 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5" />
      </span>
      <div>
        <p className="text-sm text-white/50">{label}</p>
        <p className="text-2xl font-semibold tabular-nums mt-0.5">{value}</p>
        {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
