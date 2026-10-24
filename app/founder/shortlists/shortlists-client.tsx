'use client';

/**
 * Premium Shortlist client — package picker, payment instructions,
 * screenshot upload, order statuses, unlocked shortlist, agreement PDF.
 */
import { useMemo, useState, useTransition } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Download,
  FileText,
  Landmark,
  Smartphone,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  createShortlistOrder,
  uploadPaymentScreenshot,
} from '@/app/actions/shortlist-order';
import { PACKAGES, PAYMENT_DETAILS, type PackageId } from '@/config/payment';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Awaiting payment', cls: 'bg-amber-400/10 text-amber-300' },
  submitted: { label: 'Verifying payment', cls: 'bg-blue-400/10 text-blue-300' },
  confirmed: { label: 'Unlocked', cls: 'bg-emerald-400/10 text-emerald-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-400/10 text-red-300' },
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

  const [step, setStep] = useState<'closed' | 'package' | 'pay'>(isUnlocked ? 'closed' : 'package');
  const [chosenPackage, setChosenPackage] = useState<PackageId | null>(null);
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [creating, startCreate] = useTransition();
  const [uploading, startUpload] = useTransition();

  const pendingOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId) ?? null,
    [orders, activeOrderId]
  );

  function handleCreateOrder() {
    if (!chosenPackage) return;
    startCreate(async () => {
      const res = await createShortlistOrder(
        chosenPackage,
        projectId || null,
        amount ? Number(amount) : null
      );
      if (res.ok && res.orderId) {
        setActiveOrderId(res.orderId);
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
      {/* Status banner */}
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

      {/* Get Shortlist CTA */}
      {!isUnlocked && step === 'closed' && (
        <Button
          type="button"
          onClick={() => setStep('package')}
          className="w-full bg-amber-400 text-black font-bold hover:bg-amber-300 h-12 text-base"
        >
          <Lock className="w-4 h-4 mr-1" /> Get Shortlist
        </Button>
      )}

      {/* Package selection */}
      {!isUnlocked && step === 'package' && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold tracking-tight">Choose a package</h2>
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
                className={`text-left rounded-3xl p-5 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  chosenPackage === pkg.id
                    ? 'border-amber-400/60 bg-amber-400/[0.08]'
                    : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-extrabold tracking-tight">{pkg.name}</h3>
                  {chosenPackage === pkg.id && (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <p className="text-amber-400 font-bold text-sm mb-3">{pkg.priceRange}</p>
                <ul className="space-y-1.5 text-xs text-white/50">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/70" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {chosenPackage && (
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-4">
              <div>
                <label htmlFor="order-project" className="block text-sm font-medium text-white/70 mb-2">
                  Attach to project (optional)
                </label>
                <select
                  id="order-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 [&>option]:bg-[#13111a]"
                >
                  <option value="">No specific project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="order-amount" className="block text-sm font-medium text-white/70 mb-2">
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
              <Button
                type="button"
                onClick={handleCreateOrder}
                disabled={creating}
                className="w-full bg-amber-400 text-black font-bold hover:bg-amber-300 h-12 text-base"
              >
                {creating ? 'Creating order...' : 'Continue to payment'}
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Payment instructions + upload */}
      {!isUnlocked && step === 'pay' && pendingOrder && (
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold tracking-tight">Pay {pendingOrder.package === 'full' ? 'Full Support' : 'Basic'} - Nu {pendingOrder.amount?.toLocaleString('en-IN')}</h2>

          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Landmark className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-white">Bank transfer</p>
                <p className="text-white/50">
                  {PAYMENT_DETAILS.bank.bankName} - {PAYMENT_DETAILS.bank.branch}
                  <br />
                  {PAYMENT_DETAILS.bank.accountName}
                  <br />
                  A/C: <span className="font-mono text-white">{PAYMENT_DETAILS.bank.accountNumber}</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-white">{PAYMENT_DETAILS.mbob.label}</p>
                <p className="text-white/50">
                  {PAYMENT_DETAILS.mbob.name}
                  <br />
                  <span className="font-mono text-white">{PAYMENT_DETAILS.mbob.number}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-white/40">{PAYMENT_DETAILS.note}</p>
          </div>

          <form
            onSubmit={handleUpload}
            className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white/80">Upload payment screenshot</h3>
            <label
              htmlFor="screenshot"
              className="flex items-center justify-center gap-2 w-full border border-dashed border-white/20 rounded-xl px-4 py-4 text-sm text-white/60 hover:border-amber-400/50 hover:text-white transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Choose image (PNG / JPG / WEBP)
            </label>
            <input
              id="screenshot"
              name="screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
            />
            <Button
              type="submit"
              disabled={uploading}
              className="w-full bg-amber-400 text-black font-bold hover:bg-amber-300 h-12 text-base"
            >
              {uploading ? 'Submitting...' : 'Submit screenshot'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setStep('package')}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Change package
          </button>
        </section>
      )}

      {/* Orders */}
      {orders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold tracking-tight">Your orders</h2>
          <ul className="space-y-2">
            {orders.map((o) => {
              const badge = STATUS_BADGE[o.status] ?? STATUS_BADGE.pending;
              return (
                <li
                  key={o.id}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">
                      {o.package === 'full' ? 'Full Support' : 'Basic'} shortlist
                      {o.project_id &&
                        ` - ${projects.find((p) => p.id === o.project_id)?.title ?? 'project'}`}
                    </p>
                    <p className="text-xs text-white/40">
                      Nu {o.amount?.toLocaleString('en-IN')} -{' '}
                      {new Date(o.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <Badge className={`shrink-0 ${badge.cls}`}>
                    {o.status === 'confirmed' ? (
                      <Unlock className="w-3 h-3 mr-1" />
                    ) : o.status === 'rejected' ? (
                      <XCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {badge.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Unlocked shortlist */}
      {isUnlocked && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold tracking-tight">Your shortlist</h2>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-white/50">
              Payment confirmed. Your ranked shortlist will appear here as soon as the admin
              finalizes it (usually within 2 working days).
            </p>
          ) : (
            <ul className="space-y-3">
              {students.map((s, i) => (
                <li key={s.shortlistId} className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-extrabold tracking-tight truncate">{s.full_name}</h3>
                  </div>
                  <p className="text-xs text-white/40 mb-2">
                    {s.college}
                    {s.course ? ` - ${s.course}` : ''}
                    {s.year ? ` (${s.year} year)` : ''}
                    {s.availability ? ` - ${AVAILABILITY_LABEL[s.availability] ?? s.availability}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.skills.slice(0, 5).map((k) => (
                      <Badge key={k} variant="outline" className="text-white/60">{k}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    {s.contact_email && (
                      <a
                        href={`mailto:${s.contact_email}`}
                        className="text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline"
                      >
                        {s.contact_email}
                      </a>
                    )}
                    {s.cv_path && (
                      <a
                        href={`/api/cv/${s.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View CV
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Agreement template */}
      <section className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
        <h2 className="text-sm font-bold text-white/80 mb-1">Service agreement</h2>
        <p className="text-xs text-white/40 mb-3">
          Review, fill in the placeholders, and sign before work starts.
        </p>
        <a
          href="/founder/shortlists/agreement"
          download
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Download className="w-4 h-4" /> Download agreement (PDF)
        </a>
      </section>
    </div>
  );
}
