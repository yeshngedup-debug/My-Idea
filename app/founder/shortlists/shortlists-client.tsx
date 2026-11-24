'use client';

import { useState, useTransition } from 'react';
import { createShortlistOrder, uploadPaymentScreenshot } from '@/app/actions/shortlist-order';
import { PACKAGES, PAYMENT_CONFIGURED, PAYMENT_DETAILS, type PackageId } from '@/config/payment';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusTimeline, ORDER_STEPS } from '@/components/ui/status-timeline';

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

export function ShortlistsClient({
  orders,
  students,
  projects,
}: {
  orders: OrderRow[];
  students: ShortlistStudent[];
  projects: { id: string; title: string }[];
}) {
  const isUnlocked = orders.some((o) => o.status === 'confirmed');
  const generalUnlocked = orders.some((o) => o.status === 'confirmed' && !o.project_id);

  const [step, setStep] = useState<'closed' | 'package' | 'pay'>(isUnlocked ? 'closed' : 'package');
  const [chosenPackage, setChosenPackage] = useState<PackageId | null>(null);
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [creating, startCreate] = useTransition();
  const [uploading, startUpload] = useTransition();

  // A newly created order is not in the `orders` server prop yet, so keep it
  // locally — otherwise the payment step (below) never renders.
  const [pendingOrder, setPendingOrder] = useState<OrderRow | null>(null);

  function handleCreateOrder() {
    if (!chosenPackage) return;
    startCreate(async () => {
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
      } else {
        setStatus({ ok: false, msg: res.message });
      }
    });
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeOrderId) return;
    const fd = new FormData(e.currentTarget);
    startUpload(async () => {
      const res = await uploadPaymentScreenshot(activeOrderId, fd);
      setStatus({ ok: res.ok, msg: res.message });
    });
  }

  return (
    <div className="space-y-5 pb-10">
      {status && (
        <p role={status.ok ? 'status' : 'alert'} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
          status.ok
            ? 'border-[#17352b]/20 bg-[#17352b]/8 text-[#17352b]'
            : 'border-[#b23c26]/25 bg-[#b23c26]/8 text-[#b23c26]'
        }`}>
          {status.msg}
        </p>
      )}

      {!PAYMENT_CONFIGURED && (
        <p role="alert" className="rounded-xl border border-[#b23c26]/25 bg-[#b23c26]/8 px-4 py-3 text-sm text-[#b23c26]">
          Payments are not configured yet. Shortlist orders are paused until the bank and mBoB details are published.
        </p>
      )}

      {!generalUnlocked && step === 'closed' && (
        <Button type="button" onClick={() => setStep('package')} disabled={!PAYMENT_CONFIGURED} className="w-full pressable bg-[#17352b] font-semibold text-[#fffefa] hover:bg-[#244b3e] h-12 text-base">
          Get Shortlist
        </Button>
      )}

      {!generalUnlocked && step === 'package' && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#17352b]">Choose a package</h2>
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
                className={`rounded-2xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] ${
                  chosenPackage === pkg.id
                    ? 'border-[#17352b] bg-[#17352b]/6'
                    : 'border-[#ded8cb] bg-[#fffefa] hover:bg-[#f5f2ea]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#17352b]">{pkg.name}</h3>
                  {chosenPackage === pkg.id && <span className="h-2.5 w-2.5 rounded-full bg-[#d84f37]" aria-hidden="true" />}
                </div>
                <p className="mb-3 text-sm font-semibold text-[#b23c26]">{pkg.priceRange}</p>
                <ul className="space-y-1.5 text-xs text-[#657069]">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8d948e]" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {chosenPackage && (
            <div className="space-y-4 rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5">
              <div>
                <label htmlFor="order-project" className="block text-sm font-medium text-[#17352b] mb-2">
                  Attach to project (optional)
                </label>
                <select
                  id="order-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3 text-base text-[#17352b] focus:outline-none focus:ring-2 focus:ring-[#b23c26]/30 focus:border-[#b23c26]"
                >
                  <option value="">No specific project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="order-amount" className="block text-sm font-medium text-[#17352b] mb-2">
                  Amount you will pay (Nu.)
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
              <Button type="button" onClick={handleCreateOrder} disabled={creating} className="w-full pressable bg-[#17352b] font-semibold text-[#fffefa] hover:bg-[#244b3e] h-12 text-base">
                {creating ? 'Creating order...' : 'Continue to payment'}
              </Button>
            </div>
          )}
        </section>
      )}

      {!generalUnlocked && step === 'pay' && pendingOrder && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-[#17352b]">
            Pay {pendingOrder.package === 'full' ? 'Full Support' : 'Basic'} - Nu <span className="tabular-nums">{pendingOrder.amount?.toLocaleString('en-IN')}</span>
          </h2>

          <div className="space-y-4 rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5">
            <div className="flex items-start gap-3">
              <div className="text-sm">
                <p className="font-semibold text-[#17352b]">Bank transfer</p>
                <p className="text-[#4c5a52]">
                  {PAYMENT_DETAILS.bank.bankName} - {PAYMENT_DETAILS.bank.branch}<br />
                  {PAYMENT_DETAILS.bank.accountName}
                  <br />
                  A/C: <span className="font-mono text-[#17352b]">{PAYMENT_DETAILS.bank.accountNumber}</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-sm">
                <p className="font-semibold text-[#17352b]">{PAYMENT_DETAILS.mbob.label}</p>
                <p className="text-[#4c5a52]">
                  {PAYMENT_DETAILS.mbob.name}
                  <br />
                  <span className="font-mono text-[#17352b]">{PAYMENT_DETAILS.mbob.number}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-[#657069]">{PAYMENT_DETAILS.note}</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5">
            <h3 className="text-sm font-semibold text-[#17352b]">Upload payment screenshot</h3>
            <input id="screenshot" name="screenshot" type="file" accept="image/png,image/jpeg,image/webp" className="peer sr-only" />
            <label htmlFor="screenshot" className="flex min-h-11 items-center justify-center gap-2 w-full border border-dashed border-[#ded8cb] rounded-xl px-4 py-4 text-sm text-[#4c5a52] hover:border-[#17352b]/40 hover:text-[#17352b] transition-colors cursor-pointer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#b23c26]">
              Choose image (PNG / JPG / WEBP)
            </label>
            <Button type="submit" disabled={uploading || !PAYMENT_CONFIGURED} className="w-full pressable bg-[#17352b] font-semibold text-[#fffefa] hover:bg-[#244b3e] h-12 text-base">
              {uploading ? 'Submitting...' : 'Submit screenshot'}
            </Button>
            <button type="button" onClick={() => setStep('package')} className="inline-flex min-h-9 items-center rounded text-sm text-[#657069] hover:text-[#17352b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
              Change package
            </button>
          </form>
        </section>
      )}

      {orders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#17352b]">Your orders</h2>
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="bg-[#fffefa] border border-[#ded8cb] rounded-2xl p-4 space-y-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {o.package === 'full' ? 'Full Support' : 'Basic'} shortlist
                    {o.project_id && ` - ${projects.find((p) => p.id === o.project_id)?.title ?? 'project'}`}
                  </p>
                  <p className="text-xs tabular-nums text-[#657069]">
                    Nu {o.amount?.toLocaleString('en-IN')} -{' '}
                    {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <StatusTimeline
                  steps={ORDER_STEPS}
                  status={o.status}
                  label={`Payment status for ${o.package === 'full' ? 'Full Support' : 'Basic'} shortlist`}
                  compact
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {isUnlocked && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#17352b]">Your shortlist</h2>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-[#657069]">
              Payment confirmed. Your ranked shortlist will appear here as soon as the admin finalizes it.
            </p>
          ) : (
            <ul className="space-y-3">
              {students.map((s, i) => (
                <li key={s.shortlistId} className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-full bg-[#17352b] text-[#fffefa] font-semibold text-sm tabular-nums flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="truncate text-base font-semibold text-[#17352b]">{s.full_name}</h3>
                  </div>
                  <p className="text-xs text-[#657069] mb-2">
                    {s.college}{s.course ? ` - ${s.course}` : ''}{s.year ? ` (${s.year} year)` : ''}{s.availability ? ` - ${AVAILABILITY_LABEL[s.availability] ?? s.availability}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.skills.slice(0, 5).map((k) => (
                      <Badge key={k} variant="outline">{k}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    {s.contact_email && (
                      <a href={`mailto:${s.contact_email}`} className="break-all text-[#b23c26] underline-offset-2 hover:text-[#17352b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded">
                        {s.contact_email}
                      </a>
                    )}
                    {s.cv_path && (
                      <a href={`/api/cv/${encodeURIComponent(s.id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded text-[#17352b] hover:text-[#17352b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
                        View CV
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-[#ded8cb] bg-[#fffefa] p-5">
        <h2 className="text-sm font-semibold text-[#17352b] mb-1">Service agreement</h2>
        <a href="/founder/shortlists/agreement" download className="inline-flex items-center gap-2 rounded-xl border border-[#ded8cb] px-4 py-2.5 text-sm font-semibold text-[#17352b] hover:bg-[#f5f2ea] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]">
          Download agreement (PDF)
        </a>
      </section>
    </div>
  );
}
