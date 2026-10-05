import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import {
  Wallet, TrendingUp, TrendingDown, Receipt, Plus,
  Trash2, RefreshCw, X, Loader2, Landmark, Upload, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import TreasuryScanner from './TreasuryScanner';
import TreasuryAsOfReport from './TreasuryAsOfReport';
import TreasuryInOut from './TreasuryInOut';

interface LedgerEntry {
  id: number | string;
  entry_type: 'income' | 'expense' | string;
  title: string;
  amount: number | string;
  category: string;
  payment_method?: string;
  receipt_url?: string | null;
  notes?: string | null;
  entry_date?: string;
  recorded_by?: string | null;
  created_at?: string;
}

interface Budget {
  id: number | string;
  event_name: string;
  target_amount: number | string;
  collected_amount: number | string;
  spent_amount: number | string;
  status?: string;
  notes?: string | null;
}

interface SiteTxn {
  id: string;
  code: string;
  source: 'T-Shirt Order' | 'Equipment Hire' | 'Contribution';
  user: string;
  detail: string;
  amount: number;
  status: string;
  date: string;
}

const LEDGER_CATEGORIES = ['Dues', 'Trips', 'Semester Activities', 'Transport', 'Welfare', 'T-Shirts', 'Concert', 'Donations', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  Dues: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Trips: 'bg-sky-50 text-sky-700 border-sky-200',
  'Semester Activities': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Transport: 'bg-amber-50 text-amber-700 border-amber-200',
  Welfare: 'bg-rose-50 text-rose-700 border-rose-200',
  'T-Shirts': 'bg-violet-50 text-violet-700 border-violet-200',
  Concert: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Donations: 'bg-teal-50 text-teal-700 border-teal-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
};

const fmt = (n: number) => `KES ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;

const semesterWindow = () => {
  const now = new Date();
  const m = now.getMonth();
  if (m >= 8) return { start: new Date(now.getFullYear(), 8, 1), label: `Sept–Dec ${now.getFullYear()}` };
  if (m <= 3) return { start: new Date(now.getFullYear(), 0, 1), label: `Jan–Apr ${now.getFullYear()}` };
  return { start: new Date(now.getFullYear(), 4, 1), label: `May–Aug ${now.getFullYear()}` };
};

const extractUploadUrl = (resp: any): string | null => {
  const candidates = [resp?.data?.url, resp?.data?.secure_url, resp?.data?.data?.url, resp?.data?.data?.secure_url];
  if (Array.isArray(resp?.data?.data)) {
    for (const f of resp.data.data) { if (f?.url) return f.url; if (f?.secure_url) return f.secure_url; }
  }
  for (const c of candidates) if (typeof c === 'string' && c.startsWith('http')) return c;
  return null;
};

export default function TreasuryHub() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [siteTxns, setSiteTxns] = useState<SiteTxn[]>([]);

  // Ledger form state
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    entry_type: 'income', title: '', amount: '', category: 'Dues',
    payment_method: 'cash', receipt_url: '', notes: '', entry_date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState('');

  // Budget form state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ event_name: '', target_amount: '', collected_amount: '', spent_amount: '', notes: '' });
  const [budgetError, setBudgetError] = useState('');


  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [ledgerRes, budgetRes, ordersRes, hiresRes] = await Promise.all([
        apiClient.get('/table/finance_ledger').catch(() => ({ data: [] })),
        apiClient.get('/table/finance_budgets').catch(() => ({ data: [] })),
        apiClient.get('/table/orders').catch(() => ({ data: [] })),
        apiClient.get('/table/hire_requests').catch(() => ({ data: [] })),
      ]);
      const l = Array.isArray(ledgerRes.data) ? ledgerRes.data : (ledgerRes.data?.data || []);
      const b = Array.isArray(budgetRes.data) ? budgetRes.data : (budgetRes.data?.data || []);
      const o = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || []);
      const h = Array.isArray(hiresRes.data) ? hiresRes.data : (hiresRes.data?.data || []);
      setLedger(l);
      setBudgets(b);

      const txns: SiteTxn[] = [
        ...o.map((x: any) => ({
          id: `ord-${x.id}`, code: `ORD-${String(x.id).padStart(5, '0')}`,
          source: 'T-Shirt Order' as const,
          user: x.recipient_name || x.customer_name || x.name || 'Customer',
          detail: x.product_name || x.items?.map((i: any) => `${i.name}×${i.quantity}`).join(', ') || 'Choir merchandise',
          amount: Number(x.total_amount ?? x.amount ?? 0),
          status: x.payment_status || x.status || 'pending',
          date: x.created_at || x.order_date || x.date || '',
        })),
        ...h.map((x: any) => ({
          id: `hire-${x.id}`, code: x.hire_reference || `HIRE-${String(x.id).padStart(5, '0')}`,
          source: 'Equipment Hire' as const,
          user: x.full_name || x.name || x.recipient_name || 'Member',
          detail: x.item_category || x.item_name || 'Equipment hire',
          amount: Number(x.payment_amount ?? x.total_cost ?? 0),
          status: x.payment_status || x.status || 'pending',
          date: x.created_at || x.event_date || '',
        })),
      ].sort((a, b2) => new Date(b2.date || 0).getTime() - new Date(a.date || 0).getTime());
      setSiteTxns(txns);
    } catch (e) {
      console.error('Treasury load failed', e);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── KPI math ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const win = semesterWindow();
    const inWin = (d?: string) => d && new Date(d) >= win.start;

    const ledgerIncome = ledger.filter(e => e.entry_type === 'income').reduce((s, e) => s + Number(e.amount || 0), 0);
    const ledgerExpense = ledger.filter(e => e.entry_type === 'expense').reduce((s, e) => s + Number(e.amount || 0), 0);

    const paidSite = siteTxns.filter(t => ['paid', 'success', 'delivered', 'completed'].includes(String(t.status).toLowerCase()));
    const siteIncomeAll = paidSite.reduce((s, t) => s + t.amount, 0);
    const siteIncomeSemester = paidSite.filter(t => inWin(t.date)).reduce((s, t) => s + t.amount, 0);

    const semIncome = ledger.filter(e => e.entry_type === 'income' && inWin(e.entry_date || e.created_at)).reduce((s, e) => s + Number(e.amount || 0), 0) + siteIncomeSemester;
    const semExpense = ledger.filter(e => e.entry_type === 'expense' && inWin(e.entry_date || e.created_at)).reduce((s, e) => s + Number(e.amount || 0), 0);

    const pendingReceipts = ledger.filter(e => !e.receipt_url).length;

    return {
      balance: ledgerIncome + siteIncomeAll - ledgerExpense,
      semIncome, semExpense, pendingReceipts, semesterLabel: win.label,
    };
  }, [ledger, siteTxns]);


  // ── Ledger CRUD ───────────────────────────────────────────
  const openAdd = (side: 'income' | 'expense' = 'income') => {
    setEditingId(null);
    setForm({ entry_type: side, title: '', amount: '', category: 'Dues', payment_method: 'cash', receipt_url: '', notes: '', entry_date: new Date().toISOString().slice(0, 10) });
    setFormError('');
    setShowLedgerModal(true);
  };

  const openEdit = (e: LedgerEntry) => {
    setEditingId(e.id);
    setForm({
      entry_type: e.entry_type, title: e.title, amount: String(e.amount), category: e.category || 'Other',
      payment_method: e.payment_method || 'cash', receipt_url: e.receipt_url || '',
      notes: e.notes || '', entry_date: (e.entry_date || '').slice(0, 10),
    });
    setFormError('');
    setShowLedgerModal(true);
  };

  const handleReceiptUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await apiClient.post('/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = extractUploadUrl(res.data);
      if (!url) throw new Error('No URL returned');
      setForm(v => ({ ...v, receipt_url: url }));
      toast.success('Receipt uploaded to cloud storage');
    } catch (err) {
      console.error(err);
      toast.error('Receipt upload failed — you can paste a URL instead');
    } finally {
      setUploading(false);
    }
  };

  const saveLedger = async () => {
    setFormError('');
    if (!form.title.trim()) return setFormError('Title cannot be blank.');
    const amt = Number(form.amount);
    if (!form.amount.trim()) return setFormError('Amount cannot be blank.');
    if (isNaN(amt) || amt <= 0) return setFormError('Amount must be a positive number.');
    if (!form.entry_date) return setFormError('Please pick a date.');

    setSaving(true);
    const payload = {
      entry_type: form.entry_type, title: form.title.trim(), amount: amt, category: form.category,
      payment_method: form.payment_method, receipt_url: form.receipt_url || null,
      notes: form.notes || null, entry_date: form.entry_date,
      recorded_by: user?.name || user?.email || 'treasurer',
    };
    try {
      if (editingId) {
        await apiClient.patch(`/table/finance_ledger/${editingId}`, payload);
        toast.success('Transaction updated successfully!');
      } else {
        await apiClient.post('/table/finance_ledger', payload);
        toast.success('Transaction recorded successfully!');
      }
      setShowLedgerModal(false);
      loadAll(true);
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLedger = async (id: number | string) => {
    if (!window.confirm('Delete this financial record? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/table/finance_ledger/${id}`);
      toast.success('Record deleted');
      loadAll(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete record');
    }
  };

  // ── Budget CRUD ───────────────────────────────────────────
  const saveBudget = async () => {
    setBudgetError('');
    if (!budgetForm.event_name.trim()) return setBudgetError('Event name cannot be blank.');
    const t = Number(budgetForm.target_amount);
    if (!budgetForm.target_amount.trim() || isNaN(t) || t <= 0) return setBudgetError('Target budget must be a positive number.');

    setSavingBudget(true);
    try {
      await apiClient.post('/table/finance_budgets', {
        event_name: budgetForm.event_name.trim(),
        target_amount: t,
        collected_amount: Number(budgetForm.collected_amount) || 0,
        spent_amount: Number(budgetForm.spent_amount) || 0,
        status: 'active', notes: budgetForm.notes || null,
      });
      toast.success('Budget tracker created!');
      setShowBudgetModal(false);
      setBudgetForm({ event_name: '', target_amount: '', collected_amount: '', spent_amount: '', notes: '' });
      loadAll(true);
    } catch (err: any) {
      setBudgetError(err.response?.data?.error || 'Failed to create budget.');
    } finally {
      setSavingBudget(false);
    }
  };

  const deleteBudget = async (id: number | string) => {
    if (!window.confirm('Remove this budget tracker?')) return;
    try {
      await apiClient.delete(`/table/finance_budgets/${id}`);
      toast.success('Budget removed');
      loadAll(true);
    } catch { toast.error('Failed to remove budget'); }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-emerald-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Treasury Hub…</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Current Total Balance', value: fmt(kpis.balance), icon: Wallet, chip: 'from-slate-800 to-slate-900', sub: 'All-time, incl. site collections' },
    { label: `Total Inflows (${kpis.semesterLabel})`, value: fmt(kpis.semIncome), icon: TrendingUp, chip: 'from-emerald-500 to-teal-600', sub: 'Ledger income + site payments' },
    { label: `Total Outflows (${kpis.semesterLabel})`, value: fmt(kpis.semExpense), icon: TrendingDown, chip: 'from-rose-500 to-red-600', sub: 'Logged expenses only' },
    { label: 'Pending Receipts', value: String(kpis.pendingReceipts), icon: Receipt, chip: 'from-amber-400 to-orange-500', sub: 'Records missing proof' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-emerald-400" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md inline-block mb-2">Treasurer's Financial Hub</p>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Finance Command Center</h1>
          <p className="text-white/55 text-xs mt-1 font-medium">Site transactions · Cash ledger · Budgets · Audit-ready statements</p>
        </div>
        <div className="relative flex flex-wrap gap-2">
          <button onClick={() => loadAll()} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.chip} flex items-center justify-center text-white shadow-md`}>
                <k.icon size={19} />
              </div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{k.label}</p>
            <p className="text-xl md:text-2xl font-black text-slate-800 mt-1 tracking-tight">{k.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* OCR Scan: written/printed records page → ledger */}
      <TreasuryScanner onSaved={() => loadAll(true)} recordedBy={user?.name || user?.email || 'treasurer'} />

      {/* Statement as at a date */}
      <TreasuryAsOfReport ledger={ledger} />

      {/* Inflows & Outflows - every record (website + manual) */}
      <TreasuryInOut
        ledger={ledger}
        siteTxns={siteTxns}
        onAdd={(side) => openAdd(side === "in" ? "income" : "expense")}
        onEdit={openEdit}
        onDelete={deleteLedger}
      />
      {/* Budget Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Landmark size={17} /></div>
            <div>
              <h2 className="text-sm font-black text-slate-800">Event & Project Budget Tracker</h2>
              <p className="text-[11px] text-slate-400 font-medium">Targets vs actual collections and expenditure</p>
            </div>
          </div>
          <button onClick={() => setShowBudgetModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 transition-all shadow-md min-h-[40px]">
            <Plus size={14} /> New Budget
          </button>
        </div>
        {budgets.length === 0 ? (
          <div className="text-center py-14 px-4">
            <Landmark size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-600 text-sm">No budget trackers yet</p>
            <p className="text-xs text-slate-400 mt-1">Create one for trips, concerts or projects to monitor funding progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
            {budgets.map(b => {
              const target = Number(b.target_amount || 0);
              const collected = Number(b.collected_amount || 0);
              const spent = Number(b.spent_amount || 0);
              const pct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;
              const spendPct = collected > 0 ? Math.min(100, Math.round((spent / collected) * 100)) : 0;
              return (
                <div key={b.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 group relative">
                  <button onClick={() => deleteBudget(b.id)} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition" title="Remove"><Trash2 size={14} /></button>
                  <h4 className="font-black text-slate-800 text-sm pr-6">{b.event_name}</h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Target: {fmt(target)}</p>
                  <div className="mt-3 space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1"><span className="text-emerald-600">Collected {fmt(collected)}</span><span className="text-slate-400">{pct}%</span></div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1"><span className="text-rose-500">Spent {fmt(spent)}</span><span className="text-slate-400">{spendPct}% of collected</span></div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-all" style={{ width: `${spendPct}%` }} /></div>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-3">Remaining: <span className={target - spent >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{fmt(target - spent)}</span></p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Ledger Modal ── */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLedgerModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h3 className="font-black text-slate-800">{editingId ? 'Edit Transaction' : 'Record Transaction'}</h3>
              <button onClick={() => setShowLedgerModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {(['income', 'expense'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(v => ({ ...v, entry_type: t }))}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all ${form.entry_type === t ? (t === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700') : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} placeholder="e.g. Trip contribution — Sunday collection"
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Amount (KES) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(v => ({ ...v, amount: e.target.value }))} placeholder="0.00"
                    className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Date *</label>
                  <input type="date" value={form.entry_date} onChange={e => setForm(v => ({ ...v, entry_date: e.target.value }))}
                    className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} className="w-full border border-slate-300 px-3 py-2.5 rounded-xl text-sm font-medium bg-white cursor-pointer">
                    {LEDGER_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Method</label>
                  <select value={form.payment_method} onChange={e => setForm(v => ({ ...v, payment_method: e.target.value }))} className="w-full border border-slate-300 px-3 py-2.5 rounded-xl text-sm font-medium bg-white cursor-pointer">
                    <option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile">Mobile Money</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Receipt (image / PDF)</label>
                {form.receipt_url ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 truncate"><CheckCircle2 size={14} /> Receipt attached</span>
                    <button type="button" onClick={() => setForm(v => ({ ...v, receipt_url: '' }))} className="text-xs font-bold text-rose-500">Remove</button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploading ? 'Uploading…' : 'Tap to upload receipt'}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleReceiptUpload(f); }} />
                  </label>
                )}
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} placeholder="Optional context…"
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <button onClick={saveLedger} disabled={saving || uploading}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : editingId ? 'Save Changes' : 'Record Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Modal ── */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBudgetModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800">New Budget Tracker</h3>
              <button onClick={() => setShowBudgetModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {budgetError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {budgetError}
                </div>
              )}
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">Event / Project Name *</label>
                <input value={budgetForm.event_name} onChange={e => setBudgetForm(v => ({ ...v, event_name: e.target.value }))} placeholder="e.g. Mombasa Trip 2026"
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Target *</label>
                  <input type="number" min="0" value={budgetForm.target_amount} onChange={e => setBudgetForm(v => ({ ...v, target_amount: e.target.value }))} placeholder="0"
                    className="w-full border border-slate-300 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Collected</label>
                  <input type="number" min="0" value={budgetForm.collected_amount} onChange={e => setBudgetForm(v => ({ ...v, collected_amount: e.target.value }))} placeholder="0"
                    className="w-full border border-slate-300 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">Spent</label>
                  <input type="number" min="0" value={budgetForm.spent_amount} onChange={e => setBudgetForm(v => ({ ...v, spent_amount: e.target.value }))} placeholder="0"
                    className="w-full border border-slate-300 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
              </div>
              <button onClick={saveBudget} disabled={savingBudget}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]">
                {savingBudget ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Tracker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
