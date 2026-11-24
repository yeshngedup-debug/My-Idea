'use client';

/**
 * Admin payments client — order cards with screenshot link,
 * Confirm (unlock) and Reject actions.
 */
import { useState, useTransition } from 'react';
import { CheckCircle, WarningCircle, X, FileImage, Clock } from '@phosphor-icons/react';
import { confirmOrder, rejectOrder } from '@/app/actions/shortlist-order';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/shadcn/alert';

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
  pending: { label: 'Awaiting payment', cls: 'border-amber-200 bg-amber-50 text-[#8a5a00]' },
  submitted: { label: 'Verifying payment', cls: 'border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]' },
  confirmed: { label: 'Confirmed', cls: 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]' },
  rejected: { label: 'Rejected', cls: 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]' },
};

export function PaymentsClient({ orders }: { orders: AdminOrder[] }) {
  const [items, setItems] = useState(orders);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  function update(id: string, action: 'confirm' | 'reject') {
    setConfirmingId(null);
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
      <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
        <h3 className="mb-2 text-lg font-semibold text-[#17352b]">No orders yet</h3>
        <p className="text-sm text-[#657069]">
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
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            status.ok
              ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
              : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
          }`}
        >
          {status.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
          {status.msg}
        </p>
      )}

      <h2 className="sr-only">Payment orders</h2>
      <ul className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
      {items.map((o) => {
        const badge = STATUS_BADGE[o.status] ?? STATUS_BADGE.pending;
        const actionable = o.status === 'submitted' || o.status === 'pending';
        return (
          <li key={o.id} className="py-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#17352b]">
                  {o.package === 'full' ? 'Full Support' : 'Basic'} shortlist
                </h3>
                <p className="truncate text-xs tabular-nums text-[#657069]">
                  {o.founderName ?? 'Founder'} - {o.amount != null ? `Nu ${o.amount.toLocaleString('en-IN')}` : 'Amount not set'}
                  {o.projectTitle ? ` - ${o.projectTitle}` : ''}
                  {' - '}
                  {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <Badge className={`shrink-0 ${badge.cls}`}>
                {o.status === 'confirmed' ? (
                  <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                ) : o.status === 'rejected' ? (
                  <X className="w-3 h-3 mr-1" aria-hidden="true" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                )}
                {badge.label}
              </Badge>
            </div>

            {o.screenshotUrl && (
              <a
                href={o.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-[#b23c26] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
              >
                <FileImage className="w-4 h-4" aria-hidden="true" /> View payment screenshot
              </a>
            )}

            {actionable && confirmingId !== o.id && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === o.id || !o.screenshot_path}
                  title={o.screenshot_path ? undefined : 'No payment screenshot uploaded yet'}
                  onClick={() => update(o.id, 'confirm')}
                  className="pressable inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#17352b]/20 bg-[#17352b]/8 px-4 py-2.5 text-sm font-semibold text-[#17352b] hover:bg-[#17352b]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  {busyId === o.id ? 'Working...' : 'Confirm payment'}
                </button>
                <button
                  type="button"
                  disabled={busyId === o.id}
                  onClick={() => setConfirmingId(o.id)}
                  className="pressable inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-4 py-2.5 text-sm font-semibold text-[#b23c26] hover:bg-[#b23c26]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                >
                  <X className="w-4 h-4" aria-hidden="true" /> Reject
                </button>
              </div>
            )}

            {actionable && confirmingId === o.id && (
              <Alert variant="warning" icon={<WarningCircle />}>
                <AlertTitle>Reject this payment?</AlertTitle>
                <AlertDescription>
                  The founder&apos;s shortlist stays locked. They need a new order to try again.
                </AlertDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="pressable inline-flex min-h-11 items-center justify-center rounded-xl border border-[#ded8cb] bg-[#fffefa] px-5 py-2.5 text-sm font-semibold text-[#17352b] hover:bg-[#eae5d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    Keep order
                  </button>
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => update(o.id, 'reject')}
                    className="pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-5 py-2.5 text-sm font-semibold text-[#b23c26] hover:bg-[#b23c26]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                    {busyId === o.id ? 'Rejecting...' : 'Reject payment'}
                  </button>
                </div>
              </Alert>
            )}
          </li>
        );
      })}
      </ul>
    </div>
  );
}
