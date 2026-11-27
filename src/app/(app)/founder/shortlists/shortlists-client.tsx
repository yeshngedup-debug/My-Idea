'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRealtimeClient, type SealedLiveQuery } from '@neon/realtime/client';
import { RealtimeProvider, useLiveQuery } from '@neon/realtime-react';
import type { LiveOrderRow } from '@/lib/neon-realtime';
import { createShortlistOrder, uploadPaymentScreenshot } from '@/features/payments/actions';
import { PACKAGES, PAYMENT_CONFIGURED, PAYMENT_DETAILS, type PackageId } from '@/config/payment';
import { ORDER_COPY } from '@/lib/order-status';
import { formatEnGbUtcDate, formatNuAmount } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusTimeline, ORDER_STEPS } from '@/components/ui/status-timeline';
import { StatusMessage } from '@/components/ui/status-message';

export interface OrderRow {
  id: string;
  package: string;
  amount: number | null;
  status: string;
  screenshot_path: string | null;
  project_id: string | null;
  created_at: string;
}

export interface ShortlistStudent {
  shortlistId: string;
  projectId: string | null;
  id: string;
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[];
  availability: string | null;
  contact_email: string | null;
  cv_path: string | null;
}

const AVAILABILITY_LABEL: Record<string, string> = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  evenings: 'Evenings',
  full_time: 'Full time',
  flexible: 'Flexible',
};

const SHORTLIST_STEPS = ORDER_STEPS.map((step) => {
  if (step.value === 'submitted') return { ...step, next: ORDER_COPY.awaitingReview };
  if (step.value === 'rejected') return { ...step, next: ORDER_COPY.rejectedTimeline };
  return step;
});

/**
 * The shared live pill updates independently of the server-rendered page.
 * When it sees a confirmation the server props have not rendered yet, refresh
 * once so the confirmed state appears without a manual reload. Returns no UI;
 * the pill stays in the page.
 */
export function LiveShortlistRefresh({
  sealedQuery,
  initialData,
  realtimeUrl,
  confirmedOrderIds,
}: {
  sealedQuery: SealedLiveQuery<LiveOrderRow>;
  initialData: LiveOrderRow[];
  realtimeUrl: string;
  /** Confirmed order IDs already reflected in the server-rendered props. */
  confirmedOrderIds: string[];
}) {
  const [client] = useState(() => createRealtimeClient({ url: realtimeUrl }));

  return (
    <RealtimeProvider client={client}>
      <RefreshOnConfirm
        sealedQuery={sealedQuery}
        initialData={initialData}
        confirmedOrderIds={confirmedOrderIds}
      />
    </RealtimeProvider>
  );
}

function RefreshOnConfirm({
  sealedQuery,
  initialData,
  confirmedOrderIds,
}: {
  sealedQuery: SealedLiveQuery<LiveOrderRow>;
  initialData: LiveOrderRow[];
  confirmedOrderIds: string[];
}) {
  const router = useRouter();
  // Seed with what the server already reflected so a mounted page never
  // refreshes for an order it has already rendered. Track IDs, not a boolean,
  // so a second confirmation is still noticed after an earlier one.
  const seenConfirmed = useRef(new Set(confirmedOrderIds));
  const refreshQuery = useCallback(async () => {
    const response = await fetch('/api/realtime/orders', { method: 'POST' });
    if (!response.ok) throw new Error(`Could not renew (${response.status})`);
    return (await response.json()) as SealedLiveQuery<LiveOrderRow>;
  }, []);

  const { data } = useLiveQuery(sealedQuery, { refreshQuery, initialData });

  useEffect(() => {
    const newlyConfirmed = (data ?? [])
      .filter(
        (o) => o.status === 'confirmed' && !seenConfirmed.current.has(o.id)
      )
      .map((o) => o.id);
    if (newlyConfirmed.length === 0) return;
    newlyConfirmed.forEach((id) => seenConfirmed.current.add(id));
    router.refresh();
  }, [data, router]);

  return null;
}

export function ShortlistsClient({
  orders,
  students,
  projects,
}: {
  orders: OrderRow[];
  students: ShortlistStudent[];
  projects: { id: string; title: string }[];
}) {
  const router = useRouter();
  const isUnlocked = orders.some((o) => o.status === 'confirmed');
  const openOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'submitted'
  );

  // A newly created order is not in the `orders` server prop yet, so keep it
  // locally — otherwise the payment step (below) never renders. Seed it from
  // server rows too, so reloading while paying resumes the same order.
  const [pendingOrder, setPendingOrder] = useState<OrderRow | null>(
    () => orders.find((o) => o.status === 'pending' || o.status === 'submitted') ?? null
  );
  const [step, setStep] = useState<'closed' | 'package' | 'pay'>(
    isUnlocked ? 'closed' : pendingOrder ? 'pay' : 'package'
  );
  const [chosenPackage, setChosenPackage] = useState<PackageId | null>(null);
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(pendingOrder?.id ?? null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [creating, startCreate] = useTransition();
  const [uploading, startUpload] = useTransition();

  // A live confirmation can land while the founder is on the pay step. Derive
  // the visible step so a confirmed order never keeps an upload form open.
  const activeOrderIsConfirmed =
    activeOrderId != null &&
    orders.some((o) => o.id === activeOrderId && o.status === 'confirmed');
  const visibleStep = activeOrderIsConfirmed ? 'closed' : step;

  function startAnotherOrder() {
    setStatus(null);
    setChosenPackage(null);
    setProjectId('');
    setAmount('');
    setPendingOrder(null);
    setActiveOrderId(null);
    setSelectedFileName('');
    setStep('package');
  }

  function handleCreateOrder() {
    if (!chosenPackage) return;
    if (
      (openOrders.length > 0 || pendingOrder) &&
      !window.confirm(
        'You already have an order awaiting payment. Create another? The earlier order will stay open.'
      )
    ) {
      return;
    }
    setStatus(null);
    startCreate(async () => {
      try {
        const res = await createShortlistOrder(chosenPackage, projectId || null, amount ? Number(amount) : null);
        if (res.ok && res.orderId) {
          setActiveOrderId(res.orderId);
          setPendingOrder({
            id: res.orderId,
            package: chosenPackage,
            amount: amount ? Number(amount) : PACKAGES[chosenPackage].defaultAmount,
            status: 'pending',
            screenshot_path: null,
            project_id: projectId || null,
            created_at: new Date().toISOString(),
          });
          setStep('pay');
          setStatus({ ok: true, msg: 'Order created. Follow the payment instructions below.' });
          router.refresh();
        } else {
          setStatus({ ok: false, msg: res.message });
        }
      } catch (error) {
        console.error('[shortlists] order creation failed', error);
        setStatus({ ok: false, msg: 'Could not create the order. Please try again.' });
      }
    });
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeOrderId) return;
    const fd = new FormData(e.currentTarget);
    startUpload(async () => {
      try {
        const res = await uploadPaymentScreenshot(activeOrderId, fd);
        setStatus({ ok: res.ok, msg: res.message });
        if (res.ok) {
          setSelectedFileName('');
          router.refresh();
        }
      } catch (error) {
        console.error('[shortlists] screenshot upload failed', error);
        setStatus({ ok: false, msg: 'Could not submit the screenshot. Please try again.' });
      }
    });
  }

  const paymentNotice = !PAYMENT_CONFIGURED
    ? 'Payments are not configured yet. Shortlist orders are paused until the bank and mBoB details are published.'
    : null;
  const noticeText = [status?.msg, paymentNotice].filter(Boolean).join(' ');
  const noticeTone = status?.ok === false || paymentNotice ? 'error' : 'success';

  return (
    <div className="space-y-5 pb-10">
      {noticeText && (
        <StatusMessage
          key={`${noticeTone}:${noticeText}`}
          tone={noticeTone}
        >
          {noticeText}
        </StatusMessage>
      )}

      <p className="text-xs text-body-secondary">
        All amounts are in Bhutanese ngultrum (Nu).
      </p>

      {!isUnlocked && visibleStep === 'closed' && (
        <Button type="button" onClick={() => setStep('package')} disabled={!PAYMENT_CONFIGURED} className="w-full pressable bg-cta font-semibold text-cta-foreground hover:bg-cta-hover h-12 text-base">
          Get Shortlist
        </Button>
      )}

      {visibleStep === 'package' && (
        <section id="order-form" className="space-y-3">
          <h2 className="text-base font-semibold text-accent">Choose a package</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.values(PACKAGES) as (typeof PACKAGES)[PackageId][]).map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  setChosenPackage(pkg.id);
                  setAmount(String(pkg.defaultAmount));
                }}
                aria-pressed={chosenPackage === pkg.id}
                className={`pressable rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  chosenPackage === pkg.id
                    ? 'border-accent bg-cta/6'
                    : 'border-border bg-card hover:bg-secondary'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-accent">{pkg.name}</h3>
                  {chosenPackage === pkg.id && <span className="h-2.5 w-2.5 rounded-full bg-cta" aria-hidden="true" />}
                </div>
                <p className="mb-3 text-sm font-semibold text-destructive">{pkg.priceRange}</p>
                <ul className="space-y-1.5 text-xs text-body-secondary">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {chosenPackage && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div>
                <label htmlFor="order-project" className="block text-sm font-medium text-accent mb-2">
                  Attach to project (optional)
                </label>
                <select
                  id="order-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3.5 py-2.5 text-base text-accent focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-destructive"
                >
                  <option value="">No specific project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="order-amount" className="block text-sm font-medium text-accent mb-2">
                  Amount you will pay (Nu)
                </label>
                <Input
                  id="order-amount"
                  type="number"
                  min={100}
                  step={50}
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleCreateOrder} disabled={creating} className="w-full pressable bg-cta font-semibold text-cta-foreground hover:bg-cta-hover h-12 text-base">
                {creating ? 'Creating order...' : 'Continue to payment'}
              </Button>
            </div>
          )}
        </section>
      )}

      {visibleStep === 'pay' && pendingOrder && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-accent">
            Pay {pendingOrder.package === 'full' ? 'Full Support' : 'Basic'} -{' '}
            <span className="tabular-nums">{formatNuAmount(pendingOrder.amount)}</span>
          </h2>

          {openOrders.length > 1 && (
            <p className="text-xs text-body-secondary">
              You have {openOrders.length} orders awaiting payment. Open one
              under &quot;Your orders&quot; to continue it.
            </p>
          )}

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="text-sm">
                <p className="font-semibold text-accent">Bank transfer</p>
                <p className="text-body-secondary">
                  {PAYMENT_DETAILS.bank.bankName} - {PAYMENT_DETAILS.bank.branch}<br />
                  {PAYMENT_DETAILS.bank.accountName}
                  <br />
                  A/C: <span className="font-mono text-accent">{PAYMENT_DETAILS.bank.accountNumber}</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-sm">
                <p className="font-semibold text-accent">{PAYMENT_DETAILS.mbob.label}</p>
                <p className="text-body-secondary">
                  {PAYMENT_DETAILS.mbob.name}
                  <br />
                  <span className="font-mono text-accent">{PAYMENT_DETAILS.mbob.number}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-body-secondary">{PAYMENT_DETAILS.note}</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-accent">Upload payment screenshot</h3>
            <input
              id="screenshot"
              name="screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-describedby="screenshot-help"
              onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? '')}
              className="peer sr-only"
            />
            <label htmlFor="screenshot" className="flex min-h-11 items-center justify-center gap-2 w-full border border-dashed border-border rounded-xl px-4 py-4 text-sm text-body-secondary hover:border-border/40 hover:text-accent transition-colors cursor-pointer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              Choose image (PNG / JPG / WEBP)
            </label>
            <p id="screenshot-help" className="text-xs text-body-secondary">
              Max 5 MB. {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose a screenshot before submitting.'}
            </p>
            <Button type="submit" disabled={uploading || !PAYMENT_CONFIGURED} className="w-full pressable bg-cta font-semibold text-cta-foreground hover:bg-cta-hover h-12 text-base">
              {uploading ? 'Submitting...' : 'Submit screenshot'}
            </Button>
            <button type="button" onClick={startAnotherOrder} className="inline-flex min-h-11 items-center rounded text-sm text-body-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Start a different order
            </button>
          </form>
        </section>
      )}

      {orders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-accent">Your orders</h2>
          <ul className="divide-y divide-border border-y border-border">
            {orders.map((o) => {
              const packageName = o.package === 'full' ? 'Full Support' : 'Basic';
              const projectTitle = o.project_id
                ? projects.find((p) => p.id === o.project_id)?.title ?? 'project'
                : 'no project';
              const orderDate = formatEnGbUtcDate(o.created_at);
              const isOpen = o.status === 'pending' || o.status === 'submitted';

              return (
                <li key={o.id} className="space-y-3 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {packageName} shortlist - {projectTitle}
                    </p>
                    <p className="text-xs tabular-nums text-body-secondary">
                      {formatNuAmount(o.amount)} - {orderDate}
                    </p>
                  </div>
                  {isOpen && o.id !== activeOrderId && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingOrder(o);
                        setActiveOrderId(o.id);
                        setStatus(null);
                        setStep('pay');
                      }}
                      className="inline-flex min-h-11 items-center rounded border border-border px-3 text-sm text-accent hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Continue payment
                    </button>
                  )}
                  <StatusTimeline
                    steps={SHORTLIST_STEPS}
                    status={o.status}
                    label={`Payment status for ${packageName} shortlist - ${projectTitle} - ${orderDate}`}
                    compact
                  />
                  {o.status === 'rejected' && (
                    <a
                      href="#order-form"
                      onClick={startAnotherOrder}
                      className="inline-flex min-h-11 items-center rounded text-sm text-destructive hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {ORDER_COPY.createNewOrder}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {isUnlocked && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-accent">Your shortlist</h2>
            {visibleStep === 'closed' && PAYMENT_CONFIGURED && (
              <Button
                type="button"
                onClick={startAnotherOrder}
                className="pressable bg-cta font-semibold text-cta-foreground hover:bg-cta-hover h-10 text-sm"
              >
                Order another shortlist
              </Button>
            )}
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-body-secondary">
              {ORDER_COPY.shortlistPending}
            </p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {students.map((s, i) => {
                const studentName = s.full_name?.trim() || 'Student record';

                return (
                  <li key={s.shortlistId} className="py-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary text-sm font-semibold tabular-nums text-foreground">
                        {i + 1}
                      </span>
                      <h3 className="truncate text-base font-semibold text-accent">{studentName}</h3>
                    </div>
                    <p className="text-xs text-body-secondary mb-2">
                      {s.college}{s.course ? ` - ${s.course}` : ''}{s.year ? ` (${s.year} year)` : ''}{s.availability ? ` - ${AVAILABILITY_LABEL[s.availability] ?? s.availability}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {s.skills.slice(0, 5).map((k) => (
                        <Badge key={k} variant="outline">{k}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                      {s.contact_email && (
                        <a href={`mailto:${s.contact_email}`} className="inline-flex min-h-11 items-center break-all text-destructive underline-offset-2 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                          {s.contact_email}
                        </a>
                      )}
                      {s.cv_path && (
                        <a
                          href={`/api/cv/${encodeURIComponent(s.id)}`}
                          aria-label={`View ${studentName}'s CV (rank ${i + 1})`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-1.5 rounded text-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          View CV
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-accent mb-1">Service agreement</h2>
        <a href="/founder/shortlists/agreement" download className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-accent hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Download agreement (PDF)
        </a>
      </section>
    </div>
  );
}
