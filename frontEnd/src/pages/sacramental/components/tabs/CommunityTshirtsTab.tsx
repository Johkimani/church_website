import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaTshirt, FaShoppingCart, FaCheck } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

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

const CommunityTshirtsTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'orders'>('shop');
  const [showOrderForm, setShowOrderForm] = useState(false);
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
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'shop' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          style={activeSubTab === 'shop' ? { background: color } : {}}
          onClick={() => setActiveSubTab('shop')}
        >
          <FaTshirt size={14} /> Shop Wear
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'orders' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          style={activeSubTab === 'orders' ? { background: color } : {}}
          onClick={() => setActiveSubTab('orders')}
        >
          <FaShoppingCart size={14} /> My Orders ({orders.length})
        </button>
      </div>

      {/* Shop Tab */}
      {activeSubTab === 'shop' && (
        <div>
          {/* Product Showcase */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: `linear-gradient(135deg, ${color}10 0%, white 100%)`, border: `1px solid ${color}20` }}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { value: `KES ${price.toLocaleString()}`, label: 'Price' },
                { value: sizes.join(' – '), label: 'Sizes' },
                { value: '3–5 Days', label: 'Delivery' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'white', border: `1px solid ${color}15` }}>
                  <div className="font-extrabold text-lg" style={{ color }}>{stat.value}</div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {product?.description && (
              <p className="text-slate-600 text-sm font-medium mb-4">{product.description}</p>
            )}

            {!showOrderForm && !orderSuccess ? (
              <button
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-lg"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 6px 20px ${color}30` }}
                onClick={() => setShowOrderForm(true)}
              >
                <FaTshirt className="inline mr-2" /> Order Now
              </button>
            ) : orderSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${color}15` }}>
                  <FaCheck style={{ color }} size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Order Placed!</h3>
                <p className="text-slate-500 text-sm mb-4">You will be contacted for M-Pesa payment.</p>
                <button className="text-sm font-bold" style={{ color }} onClick={() => { setOrderSuccess(false); setOrderForm({ name: '', phone: '', size: 'M', quantity: 1 }); }}>
                  Place Another Order
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4 p-5 rounded-xl bg-white border border-slate-100">
                {orderMutation.isPending && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
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
                <div className="text-center py-2 rounded-lg" style={{ background: `${color}10` }}>
                  Total: <strong className="text-lg" style={{ color }}>KES {(price * orderForm.quantity).toLocaleString()}</strong>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-sm" style={{ background: color }}>
                  Confirm & Pay via M-Pesa
                </button>
                <button type="button" className="w-full py-2.5 rounded-xl text-slate-500 font-semibold text-sm hover:bg-slate-50" onClick={() => setShowOrderForm(false)}>
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeSubTab === 'orders' && (
        <div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order: Order) => (
                <div key={order.id} className="p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{order.product_name || 'T-Shirt'}</h4>
                      <p className="text-xs text-slate-400">{order.recipient_name} · {order.size} × {order.quantity}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">KES {Number(order.total_amount).toLocaleString()}</span>
                    <span className="text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
              <FaShoppingCart style={{ color: `${color}40` }} className="mx-auto mb-3" size={40} />
              <p className="font-semibold text-slate-400 text-sm">No orders yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityTshirtsTab;
