import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaTshirt, FaShoppingCart, FaCheck, FaRuler, FaTimes, FaTruck, FaBoxOpen, FaClipboardCheck } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';
import tshirtMockup from '../../../../assets/Images/jumuiya_tshirt.png';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  sizes: string[];
  image_url?: string;
  description?: string;
}

interface Order {
  id: number;
  recipient_name: string;
  phone: string;
  size: string;
  quantity: number;
  total_amount: number;
  status: string;
  product_name?: string;
  created_at: string;
}

const STATUS_STEPS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'pending', label: 'Ordered', icon: <FaClipboardCheck size={14} /> },
  { key: 'processing', label: 'Processing', icon: <FaBoxOpen size={14} /> },
  { key: 'shipped', label: 'Shipped', icon: <FaTruck size={14} /> },
  { key: 'delivered', label: 'Delivered', icon: <FaCheck size={14} /> },
];

const SIZE_CHART = [
  { size: 'S', chest: '34-36"', length: '27"', fit: 'Slim' },
  { size: 'M', chest: '38-40"', length: '28"', fit: 'Regular' },
  { size: 'L', chest: '42-44"', length: '29"', fit: 'Regular' },
  { size: 'XL', chest: '46-48"', length: '30"', fit: 'Relaxed' },
  { size: 'XXL', chest: '50-52"', length: '31"', fit: 'Relaxed' },
];

const CommunityTshirtsTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'orders'>('shop');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', size: 'M', quantity: 1 });
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['tshirt-products', moduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/community-tshirts/${moduleId}/products`);
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 300000,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['tshirt-orders', moduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/community-tshirts/${moduleId}/orders`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: activeSubTab === 'orders',
    staleTime: 60000,
  });

  const product = products[0] as Product | undefined;
  const price = product?.price || 1200;
  const sizes = product?.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  const orderMutation = useMutation({
    mutationFn: async (data: typeof orderForm) => {
      return await apiClient.post('/community-tshirts/orders', {
        module_id: moduleId,
        product_id: product?.id || null,
        recipient_name: data.name,
        phone: data.phone,
        size: data.size,
        quantity: data.quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tshirt-orders', moduleId] });
      toast.success('Order placed!');
      setOrderSuccess(true);
      setShowOrderForm(false);
    },
    onError: () => {
      toast.error('Failed to place order');
    },
  });

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderMutation.mutate(orderForm);
  };

  const getStepIdx = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    const idx = STATUS_STEPS.findIndex((step) => step.key === s);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">T-Shirts</h1>
          <p className="page-description">{moduleName} merchandise</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeSubTab === 'shop' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          style={activeSubTab === 'shop' ? { background: color } : {}}
          onClick={() => setActiveSubTab('shop')}
        >
          <FaTshirt size={14} /> Shop Wear
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeSubTab === 'orders' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          style={activeSubTab === 'orders' ? { background: color } : {}}
          onClick={() => setActiveSubTab('orders')}
        >
          <FaShoppingCart size={14} /> My Orders ({orders.length})
        </button>
      </div>

      {/* Shop Tab */}
      {activeSubTab === 'shop' && (
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl p-6 mb-6 overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${color}10 0%, white 100%)`,
              border: `1px solid ${color}20`,
            }}
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: `${color}10` }} />

            <div className="relative z-10 flex flex-col md:flex-row gap-6">
              {/* Product Image — left */}
              <div className="md:w-1/2 shrink-0">
                <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" style={{ aspectRatio: '1 / 1' }}>
                  <img
                    src={product?.image_url || tshirtMockup}
                    alt={product?.name || 'Community T-Shirt'}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = tshirtMockup; }}
                  />
                </div>
              </div>

              {/* Details — right */}
              <div className="md:w-1/2 flex flex-col">
                {/* Product name + price (ecommerce style) */}
                <div className="mb-4">
                  {product?.name && (
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{product.name}</h2>
                  )}
                  <div className="flex items-end justify-between mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black" style={{ color }}>KES {price.toLocaleString()}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <FaCheck size={10} /> In Stock
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <FaTruck size={11} /> Delivery in 3–5 days · Available sizes: {sizes.join(', ')}
                  </p>
                </div>

                {/* Size chart link */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="inline-flex items-center gap-2 text-xs font-bold underline decoration-dotted underline-offset-4 cursor-pointer transition-colors hover:opacity-80"
                    style={{ color }}
                  >
                    <FaRuler size={12} /> View Size Chart
                  </button>
                </div>

                {product?.description && (
                  <p className="text-slate-600 text-sm font-medium mb-5 leading-relaxed">{product.description}</p>
                )}

                {!showOrderForm && !orderSuccess ? (
                  <button
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-lg cursor-pointer mt-auto"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 6px 20px ${color}30` }}
                    onClick={() => setShowOrderForm(true)}
                  >
                    <FaTshirt className="inline mr-2" /> Order Now
                  </button>
                ) : orderSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${color}15` }}>
                      <FaCheck style={{ color }} size={28} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1 text-lg">Order Placed!</h3>
                    <p className="text-slate-500 text-sm mb-4">You will be contacted for M-Pesa payment.</p>
                    <button className="text-sm font-bold underline cursor-pointer" style={{ color }} onClick={() => { setOrderSuccess(false); setOrderForm({ name: '', phone: '', size: 'M', quantity: 1 }); }}>
                      Place Another Order
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOrderSubmit} className="space-y-4 p-5 rounded-2xl bg-white border border-slate-100 relative">
                    {orderMutation.isPending && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-10">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Recipient Name</label>
                      <input required value={orderForm.name} onChange={e => setOrderForm({ ...orderForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-blue-500 outline-none" placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                      <input required type="tel" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-blue-500 outline-none" placeholder="0712 345 678" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Size</label>
                        <select value={orderForm.size} onChange={e => setOrderForm({ ...orderForm, size: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-blue-500 outline-none">
                          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Quantity</label>
                        <input type="number" min={1} max={10} value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                    <div className="text-center py-2 rounded-xl" style={{ background: `${color}10` }}>
                      Total: <strong className="text-lg" style={{ color }}>KES {(price * orderForm.quantity).toLocaleString()}</strong>
                    </div>
                    <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-sm cursor-pointer" style={{ background: color }}>
                      Confirm & Pay via M-Pesa
                    </button>
                    <button type="button" className="w-full py-2.5 rounded-xl text-slate-500 font-semibold text-sm hover:bg-slate-50 cursor-pointer" onClick={() => setShowOrderForm(false)}>
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeSubTab === 'orders' && (
        <div>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: Order) => {
                const stepIdx = getStepIdx(order.status);
                return (
                  <div key={order.id} className="p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{order.product_name || 'T-Shirt'}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{order.recipient_name} · {order.size} × {order.quantity}</p>
                      </div>
                      <span className="text-sm font-black" style={{ color }}>KES {Number(order.total_amount).toLocaleString()}</span>
                    </div>

                    {/* Progress Stepper */}
                    <div className="flex items-center gap-1 mb-3">
                      {STATUS_STEPS.map((step, i) => {
                        const isActive = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        return (
                          <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                                style={isActive ? { background: i === STATUS_STEPS.length - 1 ? '#10b981' : color } : {}}
                              >
                                {step.icon}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-slate-700' : isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                                {step.label}
                              </span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className="flex-1 h-0.5 rounded-full mb-5" style={{ background: i < stepIdx ? color : '#e5e7eb' }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-400 text-right">
                      Ordered {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
                <FaShoppingCart style={{ color: `${color}40` }} size={28} />
              </div>
              <p className="font-semibold text-slate-400 text-sm">No orders yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowSizeChart(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <FaRuler style={{ color }} size={18} /> Size Chart
              </h3>
              <button onClick={() => setShowSizeChart(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all cursor-pointer">
                <FaTimes size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `${color}10` }}>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider" style={{ color }}>Size</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider" style={{ color }}>Chest</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider" style={{ color }}>Length</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider" style={{ color }}>Fit</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row.size} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-bold text-slate-800">{row.size}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.chest}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.length}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs font-semibold">{row.fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-4 font-semibold">Between sizes? Go one size up for a comfortable fit.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityTshirtsTab;
