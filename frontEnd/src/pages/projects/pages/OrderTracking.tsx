import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSpinner, FaBox, FaTruck, FaCheckCircle, FaClock, FaBan, FaWhatsapp } from 'react-icons/fa';
import { apiClient } from '../../../api/axiosInstance';
import ProjectHero from '../components/ProjectHero';
import ProjectPageHeader from '../components/ProjectPageHeader';

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: FaClock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Order Placed' },
  paid: { icon: FaCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Payment Confirmed' },
  preparing: { icon: FaBox, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Being Prepared' },
  ready_for_pickup: { icon: FaTruck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', label: 'Ready for Pickup' },
  completed: { icon: FaCheckCircle, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', label: 'Completed' },
  cancelled: { icon: FaBan, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', label: 'Cancelled' },
  failed: { icon: FaBan, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Failed' },
};

const STATUS_STEPS = ['pending', 'paid', 'preparing', 'ready_for_pickup', 'completed'];

const TrackingTimeline: React.FC<{ status: string }> = ({ status }) => {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 w-full max-w-md mx-auto">
      {STATUS_STEPS.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const Icon = cfg.icon;
        const isComplete = i <= currentIdx && currentIdx >= 0;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isComplete ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
            } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}>
              <Icon size={16} />
            </div>
            <p className={`text-[9px] mt-1.5 text-center font-bold leading-tight ${isComplete ? 'text-blue-600' : 'text-slate-400'}`}>
              {cfg.label}
            </p>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`absolute h-0.5 w-full ${i < currentIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const OrderTracking = () => {
  const navigate = useNavigate();
  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);
    try {
      const res = await apiClient.get(`/orders/track?reference=${encodeURIComponent(ref.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Order not found. Check your order reference and phone number.');
    } finally {
      setLoading(false);
    }
  };

  const items = order?.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
  const statusCfg = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">
      <ProjectHero>
        <ProjectPageHeader
          badge="Order Status"
          title="Track Your Order"
          subtitle="Enter your order reference to check the current status of your purchase."
        />
      </ProjectHero>

      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-20">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Order Reference *</label>
            <input value={ref} onChange={e => setRef(e.target.value)} required
              placeholder="e.g. CSA-2026-0001"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              placeholder="Phone used during checkout"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" disabled={loading || !ref.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" /> Searching...</> : <><FaSearch size={14} /> Track Order</>}
          </button>
        </form>

        {error && searched && (
          <div className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
            <FaBan size={24} className="text-rose-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        )}

        {order && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className={`px-5 py-4 ${statusCfg.bg} border-b`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusCfg.color} bg-white shadow-sm`}>
                  <StatusIcon size={20} />
                </div>
                <div>
                  <p className="font-black text-lg text-slate-800">{statusCfg.label}</p>
                  <p className="text-xs text-slate-600">Order: {order.order_reference || `#${order.id}`}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <TrackingTimeline status={order.status} />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-500 font-semibold">Customer</p>
                  <p className="font-bold text-slate-800 mt-0.5">{order.customer_name || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-500 font-semibold">Amount</p>
                  <p className="font-bold text-slate-800 mt-0.5">KES {Number(order.amount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-500 font-semibold">Payment</p>
                  <p className="font-bold text-slate-800 mt-0.5">{order.mpesa_receipt ? `M-Pesa: ${order.mpesa_receipt}` : 'Pending'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-500 font-semibold">Collection</p>
                  <p className="font-bold text-slate-800 mt-0.5 capitalize">{order.collection_method || 'Pickup'}</p>
                </div>
              </div>

              {items.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">Items Ordered</p>
                  <div className="space-y-2">
                    {items.map((item: any, i: number) => {
                      const product = item.item || item;
                      return (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                          <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0">
                            {product.image_url || product.img ? (
                              <img src={product.image_url || product.img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-50 flex items-center justify-center"><FaBox size={14} className="text-blue-300" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{product.name || 'Item'}</p>
                            <p className="text-[10px] text-slate-500">Qty: {item.quantity || 1}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-800">KES {Number(item.price || 0).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <a href="https://wa.me/254112051739?text=Hello%2C%20I%20need%20help%20with%20my%20order"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-all">
                <FaWhatsapp size={16} /> Need Help? Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
