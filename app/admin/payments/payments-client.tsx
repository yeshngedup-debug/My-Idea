'use client';

/**
 * Admin payments client — order cards with screenshot link,
 * Confirm (unlock) and Reject actions.
 */
import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, FileImage, Clock } from 'lucide-react';
import { confirmOrder, rejectOrder } from '@/app/actions/shortlist-order';
import { Badge } from '@/components/ui/badge';

export interface AdminOrder {
  id: string;
  founder_id: string;
  project_id: string | null;
  package: string;
  amount: number | null;
  status: string;
  screenshot_path: string | null;
  created_at: string;
  screenshotUrl?: string | null;
  founderName?: string | null;
  projectTitle?: string | null;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Awaiting payment', cls: 'bg-amber-400/10 text-amber-300' },
  submitted: { label: 'Verifying payment', cls: 'bg-blue-400/10 text-blue-300' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-400/10 text-emerald-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10 text-red-300' },
};

export function PaymentsClient({ orders }: { orders: AdminOrder[] }) {
  const [items, setItems] = useState(orders);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  function update(id: string, action: 'confirm' | 'reject') {
    setBusyId(id);
    startTransition(async () => {
      const res = action === 'confirm' ? await confirmOrder(id) : await rejectOrder(id);
      if (res.ok) {
        setItems((prev) =>
          prev.map((o) =>
            o.id === id
              ? { ...o, status: action === 'confirm' ? 'confirmed' : 'rejected' }
              : o
          )
        );
      }
      setStatus({ ok: res.ok, msg: res.message });
      setBusyId(null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center">
        <h3 className="text-xl font-extrabold tracking-tight mb-2">No orders yet</h3>
        <p className="text-white/50 text-sm">
          When a founder buys a Premium Shortlist, the payment shows up here for verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action result */}
      {status && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            status.ok
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {status.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      <ul className="space-y-3">
      {items.map((o) => {
        const badge = STATUS_BADGE[o.status] ?? STATUS_BADGE.pending;
        const actionable = o.status === 'submitted' || o.status === 'pending';
        return (
          <li key={o.id} className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold tracking-tight truncate">
                  {o.package === 'full' ? 'Full Support' : 'Basic'} shortlist
                </h3>
                <p className="text-xs text-white/40 truncate">
                  {o.founderName ?? 'Founder'} - Nu {o.amount?.toLocaleString('en-IN')}
                  {o.projectTitle ? ` - ${o.projectTitle}` : ''}
                  {' - '}
                  {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <Badge className={`shrink-0 ${badge.cls}`}>
                {o.status === 'confirmed' ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : o.status === 'rejected' ? (
                  <XCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {badge.label}
              </Badge>
            </div>

            {o.screenshotUrl && (
              <a
                href={o.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors mb-3"
              >
                <FileImage className="w-4 h-4" /> View payment screenshot
              </a>
            )}

            {actionable && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === o.id || !o.screenshot_path}
                  title={o.screenshot_path ? undefined : 'No payment screenshot uploaded yet'}
                  onClick={() => update(o.id, 'confirm')}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-400/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {busyId === o.id ? 'Working...' : 'Confirm payment'}
                </button>
                <button
                  type="button"
                  disabled={busyId === o.id}
                  onClick={() => update(o.id, 'reject')}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-400/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </li>
        );
      })}
      </ul>
    </div>
  );
}
