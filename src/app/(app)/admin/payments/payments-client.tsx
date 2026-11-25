'use client';

/**
 * Admin payments client — order cards with screenshot link,
 * Confirm payment and Reject actions.
 *
 * The server remains authoritative: every mutation re-checks the admin role,
 * and setOrderStatus only transitions pending/submitted rows in Neon. This
 * component keeps a mirrors-only local view so the buttons respond instantly.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, WarningCircle, X, FileImage, Clock } from '@phosphor-icons/react';
import { confirmOrder, rejectOrder } from '@/features/payments/actions';
import { formatEnGbUtcDateTime, formatNuAmount } from '@/lib/format';
import { SegmentedControl } from '@/components/interactive/segmented-control';
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
  screenshotError?: boolean;
  founderName?: string | null;
  projectTitle?: string | null;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Awaiting proof', cls: 'border-amber-200 bg-amber-50 text-[#8a5a00]' },
  submitted: { label: 'Verifying payment', cls: 'border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]' },
  confirmed: { label: 'Confirmed', cls: 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]' },
  rejected: { label: 'Rejected', cls: 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]' },
  unknown: { label: 'Needs review', cls: 'border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]' },
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Awaiting proof' },
  { value: 'submitted', label: 'Verifying' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
] as const;

function isActionable(status: string): boolean {
  return status === 'submitted' || status === 'pending';
}

export function PaymentsClient({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  // Derive the list from server props; only successful local actions override
  // a status. No duplicated order state to drift out of sync with the ledger.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>('all');
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      orders.map((o) =>
        overrides[o.id] ? { ...o, status: overrides[o.id] } : o,
      ),
    [orders, overrides],
  );
  const visibleItems = useMemo(() => {
    const filtered = filter === 'all' ? items : items.filter((o) => o.status === filter);
    // Keep the server's order within each group; surface work first.
    return [...filtered].sort(
      (a, b) => Number(isActionable(b.status)) - Number(isActionable(a.status)),
    );
  }, [items, filter]);
  const awaitingCount = items.filter((o) => isActionable(o.status)).length;
  const filterLabel = FILTERS.find((entry) => entry.value === filter)?.label.toLowerCase() ?? '';
  const countLabel =
    filter === 'all'
      ? `Showing all ${items.length} ${items.length === 1 ? 'order' : 'orders'}`
      : `Showing ${visibleItems.length} ${filterLabel} ${visibleItems.length === 1 ? 'order' : 'orders'}`;

  // Move focus into the inline rejection guard; Escape returns to its trigger.
  useEffect(() => {
    if (confirmingId) alertRef.current?.focus();
  }, [confirmingId]);

  function cancelReject() {
    const id = confirmingId;
    setConfirmingId(null);
    if (id) {
      requestAnimationFrame(() => document.getElementById(`reject-${id}`)?.focus());
    }
  }

  function update(id: string, action: 'confirm' | 'reject') {
    setConfirmingId(null);
    setStatus(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        const res = action === 'confirm' ? await confirmOrder(id) : await rejectOrder(id);
        if (res.ok) {
          setOverrides((prev) => ({
            ...prev,
            [id]: action === 'confirm' ? 'confirmed' : 'rejected',
          }));
        }
        setStatus({ ok: res.ok, msg: res.message });
      } catch {
        // Surface the failure; never swallow a rejected server action.
        setStatus({ ok: false, msg: 'Could not update the order. Try again.' });
      } finally {
        setBusyId(null);
        router.refresh();
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="sr-only">Payment orders</h2>
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">No orders yet</h3>
          <p className="text-sm text-[#657069]">
            When a founder buys a Premium Shortlist, the payment shows up here for verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action result: the only role=status on this page (E2E contract). */}
      {status && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            status.ok
              ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
              : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#7a2c1c]'
          }`}
        >
          {status.ok ? (
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <X className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {status.msg}
        </p>
      )}

      <h2 className="sr-only">Payment orders</h2>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          options={FILTERS.map(({ value, label }) => ({ value, label }))}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter payment orders by status"
        />
        <p aria-live="polite" className="text-sm text-[#56645c]">
          {awaitingCount === 1
            ? '1 order awaiting review'
            : `${awaitingCount} orders awaiting review`}{' · '}
          {countLabel}
        </p>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
          <h3 className="mb-2 text-lg font-semibold text-[#17352b]">
            No orders in this view
          </h3>
          <p className="mb-5 text-sm text-[#657069]">
            Choose All to see the full payment queue.
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="pressable inline-flex min-h-11 items-center rounded-full bg-[#17352b] px-6 py-3 text-sm font-semibold text-[#fffefa] hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
          >
            Show all orders
          </button>
        </div>
      ) : (
      <ul className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
        {visibleItems.map((o) => {
          const badge = STATUS_BADGE[o.status] ?? STATUS_BADGE.unknown;
          const actionable = isActionable(o.status);
          const hasProof = Boolean(o.screenshot_path);
          const proofReady = Boolean(o.screenshotUrl);
          const proofMessageId = !hasProof
            ? `proof-missing-${o.id}`
            : !proofReady
              ? `proof-unavailable-${o.id}`
              : undefined;
          return (
            <li key={o.id} className="py-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-[#17352b]">
                    {o.package === 'full' ? 'Full Support' : 'Basic'} shortlist
                  </h3>
                  <p className="break-words text-xs tabular-nums text-[#657069]">
                    {o.founderName ?? 'Founder'} · {formatNuAmount(o.amount)}
                    {o.projectTitle ? ` · ${o.projectTitle}` : ''}
                    {' · '}
                    {formatEnGbUtcDateTime(o.created_at)}
                    {' · #'}
                    {o.id.slice(0, 8)}
                  </p>
                </div>
                <Badge className={`shrink-0 ${badge.cls}`}>
                  {o.status === 'confirmed' ? (
                    <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                  ) : o.status === 'rejected' ? (
                    <X className="mr-1 h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                  )}
                  {badge.label}
                </Badge>
              </div>

              {o.screenshotUrl ? (
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a
                    href={o.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded text-sm font-semibold text-[#b23c26] transition-colors hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]"
                  >
                    <FileImage className="h-4 w-4" aria-hidden="true" /> View payment screenshot
                  </a>
                  {actionable && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => router.refresh()}
                      aria-label={`Refresh payment screenshot link for order ${o.id.slice(0, 8)}`}
                      className="pressable inline-flex min-h-9 items-center rounded text-xs font-semibold text-[#56645c] underline decoration-[#ded8cb] underline-offset-4 hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Refresh proof link
                    </button>
                  )}
                </div>
              ) : actionable && o.screenshot_path && !proofReady ? (
                <div className="mb-3 space-y-2">
                  <p id={`proof-unavailable-${o.id}`} className="text-sm leading-6 text-[#7a2c1c]">
                    {o.screenshotError
                      ? 'Storage could not create a proof link. Refresh the proof link before confirming.'
                      : 'Proof is stored, but its link is no longer available. Refresh the proof link before confirming.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    className="pressable inline-flex min-h-11 items-center rounded-full border border-[#b23c26]/25 bg-[#fffefa] px-5 py-2.5 text-sm font-semibold text-[#b23c26] hover:bg-[#b23c26]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffefa]"
                  >
                    Refresh proof link
                  </button>
                </div>
              ) : null}

              {actionable && confirmingId !== o.id && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busyId === o.id || !proofReady}
                    aria-describedby={proofMessageId}
                    onClick={() => update(o.id, 'confirm')}
                    className="pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#17352b]/20 bg-[#17352b]/8 px-4 py-2.5 text-sm font-semibold text-[#17352b] hover:bg-[#17352b]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    {busyId === o.id ? 'Working...' : 'Confirm payment'}
                  </button>
                  <button
                    id={`reject-${o.id}`}
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => setConfirmingId(o.id)}
                    className="pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-4 py-2.5 text-sm font-semibold text-[#b23c26] hover:bg-[#b23c26]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" aria-hidden="true" /> Reject
                  </button>
                </div>
              )}

              {actionable && !hasProof && confirmingId !== o.id && (
                <p
                  id={`proof-missing-${o.id}`}
                  className="mt-2 text-xs leading-5 text-[#7a2c1c]"
                >
                  No payment screenshot yet. The founder must upload proof before this order can be confirmed.
                </p>
              )}

              {actionable && confirmingId === o.id && (
                <Alert
                  ref={alertRef}
                  tabIndex={-1}
                  variant="warning"
                  icon={<WarningCircle />}
                  aria-labelledby={`reject-title-${o.id}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') cancelReject();
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]"
                >
                  <AlertTitle id={`reject-title-${o.id}`}>Reject this payment?</AlertTitle>
                  <AlertDescription className="opacity-100 text-[#7a2c1c]">
                    Reject closes this order. The founder can create a new order to try again.
                  </AlertDescription>
                  <div className="grid gap-2 pt-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={cancelReject}
                      className="pressable inline-flex min-h-11 items-center justify-center rounded-xl border border-[#ded8cb] bg-[#fffefa] px-5 py-2.5 text-sm font-semibold text-[#17352b] hover:bg-[#eae5d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37]"
                    >
                      Keep order
                    </button>
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => update(o.id, 'reject')}
                      className="pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-5 py-2.5 text-sm font-semibold text-[#b23c26] hover:bg-[#b23c26]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      {busyId === o.id ? 'Rejecting...' : 'Reject payment'}
                    </button>
                  </div>
                </Alert>
              )}
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}
