import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../api/axiosInstance';
import { memberService } from '../../../api/jumuiyaMemberService';
import toast from 'react-hot-toast';
import {
  Shirt,
  Smartphone,
  CreditCard,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  DollarSign,
  AlertCircle,
  Copy,
  Printer,
  Shield,
  Check,
  Eye,
  X
} from 'lucide-react';

interface TshirtOrder {
  id: number;
  jumuiya_id: string;
  member_id?: string;
  holder_name: string;
  payer_name?: string;
  phone: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  mpesa_code?: string;
  status: 'pending_confirmation' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  rejection_reason?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  completed_at?: string;
  completed_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  submitted_at: string;
}

interface PaymentSettings {
  id?: number;
  jumuiya_id: string;
  payment_phone: string;
  account_name: string;
  payment_instructions: string;
  unit_price: number | string;
  is_active: boolean;
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

const JUMUIYA_LIST = [
  { id: 'st-anthony', name: 'St. Anthony', color: '#8b5cf6', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'st-augustine', name: 'St. Augustine', color: '#3b82f6', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'st-catherine', name: 'St. Catherine', color: '#800000', badge: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'st-dominic', name: 'St. Dominic', color: '#64748b', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 'st-elizabeth', name: 'St. Elizabeth', color: '#059669', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'st-maria-goretti', name: 'St. Maria Goretti', color: '#0284c7', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'st-monica', name: 'St. Monica', color: '#dc2626', badge: 'bg-red-50 text-red-700 border-red-200' },
];

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending_confirmation', label: 'Pending Payment', color: 'text-amber-700 bg-amber-100' },
  { id: 'confirmed', label: 'Confirmed', color: 'text-blue-700 bg-blue-100' },
  { id: 'completed', label: 'Delivered', color: 'text-emerald-700 bg-emerald-100' },
  { id: 'cancelled', label: 'Cancelled', color: 'text-rose-700 bg-rose-100' },
] as const;

export default function JumuiyaTshirtsAdmin() {
  const { user } = useAuth();

  const userJumuiyaId = useMemo(() => {
    const raw = user?.jumuiya_id;
    if (!raw) return 'st-anthony';
    const found = JUMUIYA_LIST.find(j => j.id === raw.toLowerCase() || j.id.replace(/-/g, '') === raw.toLowerCase().replace(/[^a-z0-9]/g, ''));
    return found ? found.id : raw;
  }, [user?.jumuiya_id]);

  const [selectedJumuiya, setSelectedJumuiya] = useState<string>(userJumuiyaId);
  const [resolvedJumuiyaName, setResolvedJumuiyaName] = useState('');

  const [settings, setSettings] = useState<PaymentSettings>({
    jumuiya_id: selectedJumuiya,
    payment_phone: '',
    account_name: '',
    payment_instructions: '',
    unit_price: 1200,
    is_active: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [orders, setOrders] = useState<TshirtOrder[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<TshirtOrder | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<TshirtOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (userJumuiyaId) setSelectedJumuiya(userJumuiyaId);
  }, [userJumuiyaId]);

  useEffect(() => {
    if (!selectedJumuiya) return;
    const known = JUMUIYA_LIST.find(j => j.id === selectedJumuiya);
    if (known) {
      setResolvedJumuiyaName(known.name);
      return;
    }
    memberService.getJumuiyaLookup()
      .then((res: any) => {
        const lookup = res?.data || res || {};
        const entry = lookup[selectedJumuiya];
        setResolvedJumuiyaName(entry?.name || entry?.fullName || '');
      })
      .catch(() => setResolvedJumuiyaName(''));
  }, [selectedJumuiya]);

  const fetchSettings = useCallback(async (jumuiyaId: string) => {
    setLoadingSettings(true);
    try {
      const res = await apiClient.get(`/jumuiya-tshirts/${jumuiyaId}/settings`);
      if (res.data?.success) {
        const d = res.data.data;
        setSettings({
          jumuiya_id: jumuiyaId,
          payment_phone: d.payment_phone || '',
          account_name: d.account_name || '',
          payment_instructions: d.payment_instructions || '',
          unit_price: d.unit_price || 1200,
          is_active: d.is_active !== undefined ? d.is_active : true,
        });
      }
    } catch {
      toast.error('Failed to load payment settings');
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const fetchOrders = useCallback(async (jumuiyaId: string) => {
    setLoadingOrders(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery?.trim()) params.search = searchQuery.trim();
      const res = await apiClient.get(`/jumuiya-tshirts/${jumuiyaId}/admin/orders`, { params });
      if (res.data?.success) {
        setOrders(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (selectedJumuiya) {
      fetchSettings(selectedJumuiya);
      fetchOrders(selectedJumuiya);
    }
  }, [selectedJumuiya, fetchSettings, fetchOrders, statusFilter, searchQuery]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await apiClient.put(`/jumuiya-tshirts/${selectedJumuiya}/settings`, {
        payment_phone: settings.payment_phone,
        account_name: settings.account_name,
        payment_instructions: settings.payment_instructions,
        unit_price: Number(settings.unit_price) || 1200,
        is_active: settings.is_active,
      });
      if (res.data?.success) {
        toast.success('Payment settings updated!');
        setSettings(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const res = await apiClient.patch(`/jumuiya-tshirts/orders/${orderId}/confirm`);
      if (res.data?.success) {
        toast.success(`Order #${orderId} confirmed!`);
        fetchOrders(selectedJumuiya);
        if (selectedOrder?.id === orderId) setSelectedOrder(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to confirm order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const res = await apiClient.patch(`/jumuiya-tshirts/orders/${orderId}/complete`);
      if (res.data?.success) {
        toast.success(`Order #${orderId} completed!`);
        fetchOrders(selectedJumuiya);
        if (selectedOrder?.id === orderId) setSelectedOrder(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setActionLoading(cancelModalOrder.id);
    try {
      const res = await apiClient.patch(`/jumuiya-tshirts/orders/${cancelModalOrder.id}/cancel`, { reason: rejectionReason });
      if (res.data?.success) {
        toast.success(`Order #${cancelModalOrder.id} cancelled`);
        setCancelModalOrder(null);
        setRejectionReason('');
        fetchOrders(selectedJumuiya);
        if (selectedOrder?.id === cancelModalOrder.id) setSelectedOrder(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setActionLoading(null);
    }
  };

  const activeJumuiyaInfo = JUMUIYA_LIST.find(j => j.id === selectedJumuiya) || {
    id: selectedJumuiya, name: resolvedJumuiyaName || 'Jumuiya', color: '#4f46e5',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const refreshAll = () => {
    fetchSettings(selectedJumuiya);
    fetchOrders(selectedJumuiya);
  };

  const statusCounts = (s: string) => s === 'all' ? stats.total : stats[s as keyof OrderStats] ?? 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jumuiya T-Shirt Administration</h1>
            <p className="text-sm text-slate-500">Manage payment numbers, pricing, and member orders.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50/80 border border-indigo-200 rounded-xl">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-900">{activeJumuiyaInfo.name}</span>
            <span className="text-xs font-medium bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">Jumuiya Officer</span>
          </div>
          <button onClick={refreshAll} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition border border-slate-200" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Shirt className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-400 block mt-1">All time submissions</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-b from-amber-50/30 to-white">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-amber-600">{stats.pending}</span>
            <span className="text-xs text-amber-700/70 block mt-1">Requires VC Confirm</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm bg-gradient-to-b from-blue-50/30 to-white">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-blue-600">{stats.confirmed}</span>
            <span className="text-xs text-blue-700/70 block mt-1">In preparation</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><PackageCheck className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.completed}</span>
            <span className="text-xs text-emerald-700/70 block mt-1">Handed over</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm bg-gradient-to-b from-purple-50/30 to-white col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><CreditCard className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-purple-900">KES {stats.totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-purple-700/70 block mt-1">Confirmed & Completed</span>
          </div>
        </div>
      </div>

      {/* Payment Settings + Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Smartphone className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manual Payment & Pricing</h2>
                <p className="text-xs text-slate-500">Set the mobile money number and price for {activeJumuiyaInfo.name} members.</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${activeJumuiyaInfo.badge}`}>{activeJumuiyaInfo.name}</span>
          </div>

          <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Money Number <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Smartphone className="w-4 h-4" /></div>
                  <input type="text" required value={settings.payment_phone}
                    onChange={(e) => setSettings({ ...settings, payment_phone: e.target.value })}
                    placeholder="e.g., 0712345678"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Members send M-Pesa payment to this number.</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account / Recipient Name <span className="text-rose-500">*</span></label>
                <input type="text" required value={settings.account_name}
                  onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                  placeholder="e.g., Jane Doe (VC)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
                <span className="text-[11px] text-slate-400 mt-1 block">Displayed on the checkout screen.</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Price Per Shirt (KES) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><DollarSign className="w-4 h-4" /></div>
                  <input type="number" required min="1" step="50" value={settings.unit_price}
                    onChange={(e) => setSettings({ ...settings, unit_price: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Instructions</label>
                <textarea rows={2} value={settings.payment_instructions}
                  onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })}
                  placeholder="e.g., Send M-Pesa, use your Name as reference, then enter transaction code."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.is_active}
                  onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <span className="text-xs font-semibold text-slate-700">Allow members to place orders</span>
              </label>
              <button type="submit" disabled={savingSettings || loadingSettings}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer">
                {savingSettings ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <AlertCircle className="w-4 h-4" /> Workflow Guide
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Order Lifecycle</h3>
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Review Transaction Code</h4>
                  <p className="text-[11px] text-slate-400">Verify the M-Pesa SMS on your phone matching the member's code.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Confirm Payment</h4>
                  <p className="text-[11px] text-slate-400">Transitions the order to Confirmed. User sees printing in progress.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mark as Done</h4>
                  <p className="text-[11px] text-slate-400">Hand over the physical T-shirt to the member and close the order.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-300">
            <span>Current Price: KES {Number(settings.unit_price || 1200).toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">Manual Verification Active</span>
          </div>
        </div>
      </div>

      {/* Orders Board */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {STATUS_TABS.map(tab => (
              <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}>
                {tab.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  statusFilter === tab.id ? 'bg-slate-800 text-white' : tab.color || 'bg-slate-100 text-slate-600'
                }`}>{statusCounts(tab.id)}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipient, phone, M-Pesa..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingOrders ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
              <p className="text-sm font-semibold">Loading T-shirt orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Shirt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">No Orders Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {statusFilter !== 'all' ? `No orders matching status "${statusFilter}".` : `No T-shirt orders submitted for ${activeJumuiyaInfo.name} yet.`}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Ref / Date</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Phone / M-Pesa</th>
                  <th className="px-6 py-4">Size & Qty</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map(order => {
                  const isPending = order.status === 'pending_confirmation' || order.status === 'pending';
                  const isConfirmed = order.status === 'confirmed';
                  const isCompleted = order.status === 'completed';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold text-slate-900">#{order.id}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(order.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{order.holder_name}</div>
                        {order.payer_name && order.payer_name !== order.holder_name && (
                          <div className="text-[11px] text-slate-400">Payer: {order.payer_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-800 font-semibold">{order.phone}</div>
                        {order.mpesa_code ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="font-mono text-[11px] bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">{order.mpesa_code}</span>
                            <button onClick={() => copyToClipboard(order.mpesa_code!, 'M-Pesa Code')} className="text-slate-400 hover:text-indigo-600 p-0.5" title="Copy M-Pesa Code">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : <span className="text-[10px] text-slate-400 italic">No code submitted</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-xs">{order.size}</span>
                        <span className="text-xs text-slate-500 font-semibold ml-2">&times; {order.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">KES {Number(order.total_amount || order.quantity * 1200).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isPending && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>}
                        {isConfirmed && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>}
                        {isCompleted && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200"><PackageCheck className="w-3 h-3" /> Delivered</span>}
                        {isCancelled && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer" title={order.rejection_reason || 'Cancelled'}><XCircle className="w-3 h-3" /> Cancelled</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending && (
                            <button onClick={() => handleConfirmOrder(order.id)} disabled={actionLoading === order.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                              <Check className="w-3.5 h-3.5" /> Confirm
                            </button>
                          )}
                          {isConfirmed && (
                            <button onClick={() => handleCompleteOrder(order.id)} disabled={actionLoading === order.id}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                              <PackageCheck className="w-3.5 h-3.5" /> Done
                            </button>
                          )}
                          {(isPending || isConfirmed) && (
                            <button onClick={() => setCancelModalOrder(order)} disabled={actionLoading === order.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Cancel Order">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Cancel Order #{cancelModalOrder.id}</h3>
              </div>
              <button onClick={() => setCancelModalOrder(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-600">Cancel the order for <strong>{cancelModalOrder.holder_name}</strong>? This will update their status to <em>Cancelled</em>.</p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Reason for Cancellation</label>
                <textarea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Transaction code not found, wrong amount paid..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button onClick={() => setCancelModalOrder(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Go Back</button>
              <button onClick={handleCancelOrder} disabled={actionLoading === cancelModalOrder.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
                {actionLoading === cancelModalOrder.id ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl animate-scale-up border border-slate-100 relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            <div className="text-center pb-6 border-b border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner"><Shirt className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-900">Order Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeJumuiyaInfo.name} Jumuiya Wear</p>
            </div>
            <div className="py-6 space-y-4 text-xs">
              <div className="flex justify-between items-center py-1"><span className="text-slate-400 font-bold">ORDER REF</span><span className="font-mono font-extrabold text-slate-900">#{selectedOrder.id}</span></div>
              <div className="flex justify-between items-center py-1"><span className="text-slate-400 font-bold">RECIPIENT</span><span className="font-bold text-slate-900">{selectedOrder.holder_name}</span></div>
              <div className="flex justify-between items-center py-1"><span className="text-slate-400 font-bold">PHONE</span><span className="font-mono font-bold text-slate-900">{selectedOrder.phone}</span></div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold">M-PESA CODE</span>
                <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{selectedOrder.mpesa_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1"><span className="text-slate-400 font-bold">SPECIFICATION</span><span className="font-bold text-slate-900">Size {selectedOrder.size} &times; {selectedOrder.quantity} Unit(s)</span></div>
              <div className="flex justify-between items-center py-1"><span className="text-slate-400 font-bold">STATUS</span><span className="font-extrabold uppercase text-indigo-600">{selectedOrder.status.replace('_', ' ')}</span></div>
              {selectedOrder.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <span className="font-bold block mb-0.5">Cancellation Reason:</span>{selectedOrder.rejection_reason}
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 font-bold">TOTAL PAID</span>
                <span className="text-lg font-extrabold text-slate-900">KES {Number(selectedOrder.total_amount || selectedOrder.quantity * 1200).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
