import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  X,
  Image as ImageIcon,
  Calendar,
  Edit3,
  Save,
  Sparkles,
  TrendingUp
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
  collection_date?: string;
  tshirt_image_url?: string;
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
    collection_date: '',
    tshirt_image_url: '',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const [orders, setOrders] = useState<TshirtOrder[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<TshirtOrder | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<TshirtOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userJumuiyaId) setSelectedJumuiya(userJumuiyaId);
  }, [userJumuiyaId]);

  useEffect(() => {
    if (!selectedJumuiya) return;
    const known = JUMUIYA_LIST.find(j => j.id === selectedJumuiya);
    if (known) { setResolvedJumuiyaName(known.name); return; }
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
          collection_date: d.collection_date ? d.collection_date.split('T')[0] : '',
          tshirt_image_url: d.tshirt_image_url || '',
        });
        setImagePreviewError(false);
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
        collection_date: settings.collection_date || null,
        tshirt_image_url: settings.tshirt_image_url || null,
      });
      if (res.data?.success) {
        toast.success('Settings updated successfully!');
        const d = res.data.data;
        setSettings(prev => ({
          ...prev,
          ...d,
          collection_date: d.collection_date ? d.collection_date.split('T')[0] : '',
          tshirt_image_url: d.tshirt_image_url || '',
        }));
        setImagePreviewError(false);
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
        toast.success(`Order #${orderId} marked as delivered!`);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Shirt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Jumuiya T-Shirt Admin</h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">● Live</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Manage payment numbers, T-shirt images, collection dates &amp; orders.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-900">{activeJumuiyaInfo.name}</span>
            <span className="text-[10px] font-black bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Officer</span>
          </div>
          <button onClick={refreshAll} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition border border-slate-200 cursor-pointer" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: Shirt, color: 'slate', textColor: 'text-slate-900', bg: 'bg-slate-50', iconBg: 'bg-slate-100 text-slate-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber', textColor: 'text-amber-600', bg: 'bg-amber-50/40', iconBg: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
          { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'blue', textColor: 'text-blue-600', bg: 'bg-blue-50/40', iconBg: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
          { label: 'Delivered', value: stats.completed, icon: PackageCheck, color: 'emerald', textColor: 'text-emerald-600', bg: 'bg-emerald-50/40', iconBg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white p-5 rounded-2xl border shadow-sm ${stat.border || 'border-slate-200'} ${stat.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.iconBg}`}><stat.icon className="w-3.5 h-3.5" /></div>
            </div>
            <span className={`text-3xl font-black ${stat.textColor}`}>{stat.value}</span>
          </div>
        ))}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 rounded-2xl shadow-lg shadow-indigo-100 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Revenue</span>
            <div className="p-2 rounded-xl bg-white/20 text-white"><TrendingUp className="w-3.5 h-3.5" /></div>
          </div>
          <span className="text-xl font-black text-white">KES {stats.totalRevenue.toLocaleString()}</span>
          <p className="text-[10px] text-indigo-200 font-semibold mt-1">Confirmed &amp; Delivered</p>
        </div>
      </div>

      {/* ── Settings + Preview ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Settings Form — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Edit3 className="w-4 h-4" /></div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Payment &amp; Display Settings</h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Visible to members on the T-shirts order page</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-wider ${activeJumuiyaInfo.badge}`}>{activeJumuiyaInfo.name}</span>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
            {/* Phone + Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Mobile Money Number <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Smartphone className="w-4 h-4" /></div>
                  <input type="text" required value={settings.payment_phone}
                    onChange={e => setSettings(s => ({ ...s, payment_phone: e.target.value }))}
                    placeholder="e.g., 0712345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Members send M-Pesa here.</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Account / Recipient Name <span className="text-rose-500">*</span></label>
                <input type="text" required value={settings.account_name}
                  onChange={e => setSettings(s => ({ ...s, account_name: e.target.value }))}
                  placeholder="e.g., Jane Doe (VC)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition" />
                <p className="text-[10px] text-slate-400 mt-1">Shown on checkout screen.</p>
              </div>
            </div>

            {/* Price + Collection Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Price Per Shirt (KES) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><DollarSign className="w-4 h-4" /></div>
                  <input type="number" required min="1" step="50" value={settings.unit_price}
                    onChange={e => setSettings(s => ({ ...s, unit_price: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" />Order Collection Date</span>
                </label>
                <input type="date" value={settings.collection_date || ''}
                  onChange={e => setSettings(s => ({ ...s, collection_date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition" />
                <p className="text-[10px] text-slate-400 mt-1">Displayed as "Ready for pickup on…" for members.</p>
              </div>
            </div>

            {/* T-shirt image URL */}
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">
                <span className="inline-flex items-center gap-1.5"><ImageIcon className="w-3 h-3" />T-Shirt Sample Image URL</span>
              </label>
              <input type="url" value={settings.tshirt_image_url || ''}
                onChange={e => { setSettings(s => ({ ...s, tshirt_image_url: e.target.value })); setImagePreviewError(false); }}
                placeholder="https://... (direct link to shirt photo)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition" />
              <p className="text-[10px] text-slate-400 mt-1">Members will see this photo when ordering. Use Cloudinary or any public image URL.</p>
            </div>

            {/* Payment Instructions */}
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Payment Instructions</label>
              <textarea rows={2} value={settings.payment_instructions}
                onChange={e => setSettings(s => ({ ...s, payment_instructions: e.target.value }))}
                placeholder="e.g., Send M-Pesa, use your Name as reference, then enter transaction code."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none resize-none transition" />
            </div>

            {/* Toggle + Save */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={settings.is_active}
                    onChange={e => setSettings(s => ({ ...s, is_active: e.target.checked }))} />
                  <div className="w-10 h-6 bg-slate-200 peer-checked:bg-indigo-600 rounded-full transition-colors duration-200"></div>
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4"></div>
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Allow members to place orders</span>
              </label>
              <button type="submit" disabled={savingSettings || loadingSettings}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer">
                {savingSettings ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> Save Settings</>}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Panel — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* T-Shirt Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-black text-slate-900">T-Shirt Preview</span>
            </div>
            {settings.tshirt_image_url && !imagePreviewError ? (
              <div className="relative">
                <img
                  src={settings.tshirt_image_url}
                  alt="T-shirt sample"
                  onError={() => setImagePreviewError(true)}
                  className="w-full h-52 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-xs font-bold">{activeJumuiyaInfo.name} Official T-Shirt</p>
                  <p className="text-white/70 text-[10px]">KES {Number(settings.unit_price || 1200).toLocaleString()} per shirt</p>
                </div>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
                  <Shirt className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-xs font-bold text-slate-500">No image set</p>
                <p className="text-[10px] text-slate-400 mt-0.5 text-center px-6">Enter an image URL above to preview the T-shirt</p>
              </div>
            )}
            <div className="p-4 space-y-2">
              {settings.collection_date && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Collection Date</p>
                    <p className="text-xs font-bold text-amber-900">{formatDate(settings.collection_date)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pay To</p>
                  <p className="text-xs font-bold text-slate-800">{settings.payment_phone || '—'} {settings.account_name ? `(${settings.account_name})` : ''}</p>
                </div>
                {settings.payment_phone && (
                  <button onClick={() => copyToClipboard(settings.payment_phone, 'Phone')} className="ml-auto p-1.5 hover:bg-slate-200 rounded-lg transition cursor-pointer">
                    <Copy className="w-3 h-3 text-slate-500" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-3">
              <AlertCircle className="w-3.5 h-3.5" /> Order Workflow
            </div>
            <div className="space-y-3.5">
              {[
                { num: 1, title: 'Verify M-Pesa Code', desc: 'Check SMS on phone matching the member\'s code & amount.', numBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300' },
                { num: 2, title: 'Confirm Payment', desc: 'Moves to Confirmed. Member sees "printing in progress".', numBg: 'bg-blue-500/20 border-blue-400/40 text-blue-300' },
                { num: 3, title: 'Mark as Delivered', desc: 'Hand shirt to member on collection date. Order closes.', numBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' },
              ].map(step => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${step.numBg}`}>{step.num}</div>
                  <div>
                    <p className="text-[11px] font-bold text-white">{step.title}</p>
                    <p className="text-[10px] text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-indigo-300">
              <span>KES {Number(settings.unit_price || 1200).toLocaleString()} / shirt</span>
              {settings.collection_date && <span className="text-amber-300">📦 {formatDate(settings.collection_date)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Orders Board ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Orders Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {STATUS_TABS.map(tab => (
              <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}>
                {tab.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : (tab.color || 'bg-slate-100 text-slate-600')
                }`}>{statusCounts(tab.id)}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, M-Pesa…"
              className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loadingOrders ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
              <p className="text-sm font-bold text-slate-500">Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-base font-black text-slate-600">No Orders Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {statusFilter !== 'all' ? `No orders with status "${statusFilter}".` : `No T-shirt orders for ${activeJumuiyaInfo.name} yet.`}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-5 py-4">Ref / Date</th>
                  <th className="px-5 py-4">Recipient</th>
                  <th className="px-5 py-4">Phone / M-Pesa</th>
                  <th className="px-5 py-4">Size &amp; Qty</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => {
                  const isPending = order.status === 'pending_confirmation' || order.status === 'pending';
                  const isConfirmed = order.status === 'confirmed';
                  const isCompleted = order.status === 'completed';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-black text-slate-900">#{order.id}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(order.submitted_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{order.holder_name}</div>
                        {order.payer_name && order.payer_name !== order.holder_name && (
                          <div className="text-[10px] text-slate-400 mt-0.5">Payer: {order.payer_name}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-slate-700 font-semibold">{order.phone}</div>
                        {order.mpesa_code ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 font-black">{order.mpesa_code}</span>
                            <button onClick={() => copyToClipboard(order.mpesa_code!, 'M-Pesa Code')} className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer" title="Copy code">
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : <span className="text-[9px] text-slate-400 italic">No code</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-black text-xs">{order.size}</span>
                        <span className="text-xs text-slate-500 font-semibold ml-1.5">× {order.quantity}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-black text-slate-900 text-sm">KES {Number(order.total_amount || order.quantity * 1200).toLocaleString()}</div>
                      </td>
                      <td className="px-5 py-4">
                        {isPending && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-2.5 h-2.5" />Pending</span>}
                        {isConfirmed && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-2.5 h-2.5" />Confirmed</span>}
                        {isCompleted && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200"><PackageCheck className="w-2.5 h-2.5" />Delivered</span>}
                        {isCancelled && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200" title={order.rejection_reason}><XCircle className="w-2.5 h-2.5" />Cancelled</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending && (
                            <button onClick={() => handleConfirmOrder(order.id)} disabled={actionLoading === order.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                          )}
                          {isConfirmed && (
                            <button onClick={() => handleCompleteOrder(order.id)} disabled={actionLoading === order.id}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-sm transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                              <PackageCheck className="w-3 h-3" /> Delivered
                            </button>
                          )}
                          {(isPending || isConfirmed) && (
                            <button onClick={() => setCancelModalOrder(order)} disabled={actionLoading === order.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer" title="Cancel">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer" title="View details">
                            <Eye className="w-3.5 h-3.5" />
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

      {/* ── Cancel Modal ───────────────────────────────── */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="font-black text-slate-900">Cancel Order #{cancelModalOrder.id}</h3>
              </div>
              <button onClick={() => setCancelModalOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Cancel the order for <strong>{cancelModalOrder.holder_name}</strong>? Their status will change to <em>Cancelled</em>.
            </p>
            <div>
              <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-wider">Reason (optional)</label>
              <textarea rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g., Transaction code not found, wrong amount paid…"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none" />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-4">
              <button onClick={() => setCancelModalOrder(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer">Go Back</button>
              <button onClick={handleCancelOrder} disabled={actionLoading === cancelModalOrder.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer">
                {actionLoading === cancelModalOrder.id ? 'Processing…' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Detail Modal ─────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Order Details</h3>
                  <p className="text-[10px] text-slate-500">{activeJumuiyaInfo.name} · #{selectedOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              {[
                { label: 'Order Ref', value: `#${selectedOrder.id}`, mono: true },
                { label: 'Recipient', value: selectedOrder.holder_name, bold: true },
                { label: 'Phone', value: selectedOrder.phone, mono: true },
                { label: 'M-Pesa Code', value: selectedOrder.mpesa_code || 'N/A', mono: true, color: selectedOrder.mpesa_code ? 'text-indigo-700' : 'text-slate-400' },
                { label: 'Specification', value: `Size ${selectedOrder.size} × ${selectedOrder.quantity}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-black uppercase tracking-wider text-[9px]">{row.label}</span>
                  <span className={`font-bold ${row.mono ? 'font-mono' : ''} ${row.color || 'text-slate-900'}`}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-black uppercase tracking-wider text-[9px]">Status</span>
                <span className="font-black uppercase text-indigo-600 text-[10px]">{selectedOrder.status.replace(/_/g, ' ')}</span>
              </div>
              {selectedOrder.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="font-black text-rose-800 text-[10px] uppercase tracking-wider mb-1">Cancellation Reason</p>
                  <p className="text-rose-700 text-xs">{selectedOrder.rejection_reason}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="text-slate-500 font-black text-[10px] uppercase tracking-wider">Total Paid</span>
                <span className="text-xl font-black text-slate-900">KES {Number(selectedOrder.total_amount || selectedOrder.quantity * 1200).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
