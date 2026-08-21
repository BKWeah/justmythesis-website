'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Check, X, Pencil, CreditCard, Eye, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Payment {
  id: string;
  amount: number | string;
  currency: string;
  payment_method: string;
  payment_date: string;
  reference_number: string;
  transaction_id: string | null;
  proof_url: string | null;
  status: 'Pending' | 'Verified' | 'Rejected';
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
}
interface CurrencySummary { currency: string; recorded: number; verified: number; pending: number; rejected: number }
interface PaymentsTabProps { projectId: string; isCompleted?: boolean }

const MAX_PROOF_SIZE = 10 * 1024 * 1024;
const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'Select payment method' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Mobile Money', label: 'Mobile Money' },
  { value: 'PayPal', label: 'PayPal' },
  { value: 'Western Union', label: 'Western Union' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Other', label: 'Other' },
];
const CURRENCY_OPTIONS = [{ value: 'USD', label: 'USD' }, { value: 'LRD', label: 'LRD' }];
const newForm = () => ({
  amount: '', currency: 'USD', payment_method: '',
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '', transaction_id: '', proof_url: '', notes: '',
});
function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}
function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function statusVariant(status: Payment['status']) {
  if (status === 'Verified') return 'success';
  if (status === 'Rejected') return 'danger';
  return 'warning';
}
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('Unable to read payment proof file'));
    reader.readAsDataURL(file);
  });
}

export function PaymentsTab({ projectId, isCompleted = false }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState(newForm());
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const response = await fetch(`/api/projects/${projectId}/payments`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to load payments');
      setPayments(result.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally { setIsLoading(false); }
  }, [projectId]);
  useEffect(() => { loadPayments(); }, [loadPayments]);

  const summaries = useMemo(() => {
    const grouped = new Map<string, CurrencySummary>();
    for (const payment of payments) {
      const currency = String(payment.currency || 'USD').toUpperCase();
      const current = grouped.get(currency) || { currency, recorded: 0, verified: 0, pending: 0, rejected: 0 };
      const amount = Number(payment.amount || 0);
      current.recorded += amount;
      if (payment.status === 'Verified') current.verified += amount;
      if (payment.status === 'Pending') current.pending += amount;
      if (payment.status === 'Rejected') current.rejected += amount;
      grouped.set(currency, current);
    }
    return Array.from(grouped.values()).sort((a, b) => a.currency === 'USD' ? -1 : b.currency === 'USD' ? 1 : a.currency.localeCompare(b.currency));
  }, [payments]);

  const openNewPayment = () => { setEditingPayment(null); setForm(newForm()); setProofFile(null); setError(null); setShowPaymentModal(true); };
  const openEditPayment = (payment: Payment) => {
    setEditingPayment(payment); setProofFile(null);
    setForm({ amount: String(payment.amount), currency: payment.currency, payment_method: payment.payment_method,
      payment_date: payment.payment_date, reference_number: payment.reference_number || '',
      transaction_id: payment.transaction_id || '', proof_url: payment.proof_url || '', notes: payment.notes || '' });
    setError(null); setShowPaymentModal(true);
  };
  const closePaymentModal = () => {
    if (isSubmitting) return;
    setShowPaymentModal(false); setEditingPayment(null); setForm(newForm()); setProofFile(null);
  };

  const uploadProof = async (file: File) => {
    if (file.size > MAX_PROOF_SIZE) throw new Error('Payment proof cannot exceed 10 MB');
    const fileData = await fileToBase64(file);
    const response = await fetch(`/api/projects/${projectId}/payments/proof`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size, fileData }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || 'Failed to upload payment proof');
    return String(result.path);
  };

  const removeProofPath = async (path: string) => {
    await fetch(`/api/projects/${projectId}/payments/proof`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }),
    });
  };

  const savePayment = async () => {
    if (!form.amount || !form.payment_method || !form.payment_date) return;
    let stagedProofPath: string | null = null;
    const oldProofPath = editingPayment?.proof_url || null;
    try {
      setIsSubmitting(true); setError(null);
      if (proofFile) stagedProofPath = await uploadProof(proofFile);
      const proofUrl = stagedProofPath || form.proof_url || null;
      const response = await fetch(`/api/projects/${projectId}/payments`, {
        method: editingPayment ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPayment ? { action: 'update', paymentId: editingPayment.id, amount: Number(form.amount), currency: form.currency,
          payment_method: form.payment_method, payment_date: form.payment_date, transaction_id: form.transaction_id, proof_url: proofUrl, notes: form.notes }
          : { amount: Number(form.amount), currency: form.currency, payment_method: form.payment_method, payment_date: form.payment_date,
            reference_number: form.reference_number, transaction_id: form.transaction_id, proof_url: proofUrl, notes: form.notes }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (stagedProofPath) await removeProofPath(stagedProofPath);
        throw new Error(result?.error || 'Failed to save payment');
      }
      if (stagedProofPath && oldProofPath && oldProofPath !== stagedProofPath) await removeProofPath(oldProofPath);
      closePaymentModal(); await loadPayments();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save payment'); }
    finally { setIsSubmitting(false); }
  };

  const viewProof = async (paymentId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/payments/proof?paymentId=${encodeURIComponent(paymentId)}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to open payment proof');
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to open payment proof'); }
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      setIsSubmitting(true); setError(null);
      const response = await fetch(`/api/projects/${projectId}/payments`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', paymentId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to verify payment');
      await loadPayments();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to verify payment'); }
    finally { setIsSubmitting(false); }
  };
  const openRejectPayment = (payment: Payment) => { setRejectingPayment(payment); setRejectionReason(''); setError(null); setShowRejectModal(true); };
  const rejectPayment = async () => {
    if (!rejectingPayment || !rejectionReason.trim()) return;
    try {
      setIsSubmitting(true); setError(null);
      const response = await fetch(`/api/projects/${projectId}/payments`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', paymentId: rejectingPayment.id, rejection_reason: rejectionReason.trim() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to reject payment');
      setShowRejectModal(false); setRejectingPayment(null); setRejectionReason(''); await loadPayments();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to reject payment'); }
    finally { setIsSubmitting(false); }
  };

  return <>
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="text-lg font-semibold text-gray-900">Project Payments</h3><p className="text-sm text-gray-500">Record, verify, and track payments for this project.</p></div>
        {!isCompleted && <Button onClick={openNewPayment}><Plus className="mr-2 h-4 w-4" />Record Payment</Button>}
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {summaries.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['Total Recorded', 'Verified Payments', 'Pending Verification'].map((label) => <div key={label} className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{formatMoney(0, 'USD')}</p></div>)}
        </div>
      ) : summaries.map((s) => <div key={s.currency} className="rounded-xl border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between"><p className="font-semibold text-gray-900">{s.currency} Payment Summary</p><Badge variant="secondary">{s.currency}</Badge></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4"><p className="text-sm text-gray-500">Total Recorded</p><p className="mt-1 text-2xl font-bold text-gray-900">{formatMoney(s.recorded, s.currency)}</p></div>
          <div className="rounded-lg bg-green-50 p-4"><p className="text-sm text-green-700">Verified Payments</p><p className="mt-1 text-2xl font-bold text-green-700">{formatMoney(s.verified, s.currency)}</p></div>
          <div className="rounded-lg bg-amber-50 p-4"><p className="text-sm text-amber-700">Pending Verification</p><p className="mt-1 text-2xl font-bold text-amber-700">{formatMoney(s.pending, s.currency)}</p></div>
          <div className="rounded-lg bg-red-50 p-4"><p className="text-sm text-red-700">Rejected Payments</p><p className="mt-1 text-2xl font-bold text-red-700">{formatMoney(s.rejected, s.currency)}</p></div>
        </div>
      </div>)}

      {isLoading ? <div className="py-12 text-center text-gray-500">Loading payments...</div> : payments.length === 0 ?
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center"><CreditCard className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 font-medium text-gray-700">No payments recorded</p></div> :
        <div className="overflow-x-auto"><table className="w-full min-w-[980px]"><thead><tr className="border-b">
          {['Date','Reference','Method','Amount','Status','Proof','Actions'].map((h) => <th key={h} className={`py-3 text-xs font-medium uppercase text-gray-500 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>)}
        </tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b last:border-0">
          <td className="py-4 text-gray-700">{formatDate(payment.payment_date)}</td>
          <td className="py-4"><p className="font-mono text-sm font-medium text-brand-green">{payment.reference_number}</p>{payment.transaction_id && <p className="mt-1 text-xs text-gray-500">Transaction: {payment.transaction_id}</p>}</td>
          <td className="py-4 text-gray-700">{payment.payment_method}</td><td className="py-4 font-semibold text-gray-900">{formatMoney(Number(payment.amount), payment.currency)}</td>
          <td className="py-4"><Badge variant={statusVariant(payment.status) as any}>{payment.status}</Badge>{payment.rejection_reason && <p className="mt-1 max-w-[220px] text-xs text-red-600">{payment.rejection_reason}</p>}</td>
          <td className="py-4">{payment.proof_url ? <Button size="sm" variant="ghost" onClick={() => viewProof(payment.id)}><Eye className="mr-1 h-4 w-4" />View Proof</Button> : <span className="text-sm text-gray-400">None</span>}</td>
          <td className="py-4 text-right"><div className="flex justify-end gap-2">{payment.status === 'Pending' && !isCompleted && <>
            <Button size="sm" variant="ghost" onClick={() => openEditPayment(payment)} disabled={isSubmitting}><Pencil className="mr-1 h-4 w-4" />Edit</Button>
            <Button size="sm" variant="secondary" onClick={() => verifyPayment(payment.id)} disabled={isSubmitting}><Check className="mr-1 h-4 w-4" />Verify</Button>
            <Button size="sm" variant="ghost" onClick={() => openRejectPayment(payment)} disabled={isSubmitting}><X className="mr-1 h-4 w-4" />Reject</Button></>}</div></td>
        </tr>)}</tbody></table></div>}
    </div>

    <Modal isOpen={showPaymentModal} onClose={closePaymentModal} title={editingPayment ? 'Edit Pending Payment' : 'Record Payment'}>
      <div className="space-y-4">{error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm(p => ({...p, amount:e.target.value}))} placeholder="0.00" />
          <Select label="Currency" value={form.currency} onChange={(e) => setForm(p => ({...p, currency:e.target.value}))} options={CURRENCY_OPTIONS} />
        </div>
        <Select label="Payment Method" value={form.payment_method} onChange={(e) => setForm(p => ({...p, payment_method:e.target.value}))} options={PAYMENT_METHOD_OPTIONS} />
        <Input label="Payment Date" type="date" value={form.payment_date} onChange={(e) => setForm(p => ({...p, payment_date:e.target.value}))} />
        {!editingPayment && <Input label="Reference Number" value={form.reference_number} onChange={(e) => setForm(p => ({...p, reference_number:e.target.value}))} placeholder="Leave blank to generate automatically" />}
        <Input label="Transaction ID" value={form.transaction_id} onChange={(e) => setForm(p => ({...p, transaction_id:e.target.value}))} placeholder="Optional" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">{editingPayment?.proof_url ? 'Replace Payment Proof' : 'Payment Proof'}</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 hover:bg-gray-50">
            <Paperclip className="h-4 w-4 text-brand-green" />
            <span className="text-sm text-gray-700">{proofFile ? proofFile.name : editingPayment?.proof_url ? 'Choose a replacement file' : 'Choose receipt or payment proof'}</span>
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file && file.size > MAX_PROOF_SIZE) { setError('Payment proof cannot exceed 10 MB'); setProofFile(null); return; }
              setError(null); setProofFile(file);
            }} />
          </label>
          <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG, WEBP, DOC or DOCX. Maximum 10 MB.</p>
          {editingPayment?.proof_url && !proofFile && <p className="mt-1 text-xs text-green-700">A payment proof is currently attached.</p>}
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => setForm(p => ({...p, notes:e.target.value}))} rows={3} placeholder="Optional payment note" />
      </div>
      <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={closePaymentModal} disabled={isSubmitting}>Cancel</Button><Button onClick={savePayment} disabled={isSubmitting || !form.amount || !form.payment_method || !form.payment_date}>{isSubmitting ? 'Saving...' : editingPayment ? 'Save Changes' : 'Record Payment'}</Button></div>
    </Modal>

    <Modal isOpen={showRejectModal} onClose={() => { if (!isSubmitting) { setShowRejectModal(false); setRejectingPayment(null); setRejectionReason(''); } }} title="Reject Payment">
      <div className="space-y-4">{error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<p className="text-gray-600">Provide the reason this payment cannot be verified.</p><Textarea label="Rejection Reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} placeholder="Enter the rejection reason" /></div>
      <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => { setShowRejectModal(false); setRejectingPayment(null); setRejectionReason(''); }} disabled={isSubmitting}>Cancel</Button><Button onClick={rejectPayment} disabled={isSubmitting || !rejectionReason.trim()}>{isSubmitting ? 'Rejecting...' : 'Reject Payment'}</Button></div>
    </Modal>
  </>;
}

export default PaymentsTab;
