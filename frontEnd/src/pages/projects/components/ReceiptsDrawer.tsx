import { useEffect, useState } from 'react';
import { X, Search, CheckCircle2, ShoppingBag, Armchair, MapPin, Phone, Package, FileText } from 'lucide-react';
import { apiClient } from '../../../api/axiosInstance';

interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderReceipt {
    order_reference: string;
    customer_name: string;
    phone: string;
    amount: number;
    mpesa_receipt: string | null;
    items: ReceiptItem[];
    collection_method: string | null;
    delivery_address: string | null;
    checkout_id: string | null;
    updated_at: string;
}

interface HireReceipt {
    hire_reference: string;
    customer_name: string;
    phone_number: string;
    item_name: string;
    quantity: number;
    total_cost: number;
    mpesa_receipt: string | null;
    paid_at: string | null;
    pickup_date: string | null;
    status: string;
}

interface PickupInfo {
    order: { location: string; instructions: string; admin_phone: string };
    hire: { location: string; instructions: string; admin_phone: string };
}

interface ReceiptsData {
    pickup: PickupInfo;
    orders: OrderReceipt[];
    hires: HireReceipt[];
}

interface ReceiptsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const STORAGE_KEY = 'csa_receipt_phone';

export const ReceiptsDrawer: React.FC<ReceiptsDrawerProps> = ({ isOpen, onClose }) => {
    const [phone, setPhone] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
    const [data, setData] = useState<ReceiptsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handlePhoneChange = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 10);
        setPhone(digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3').trim());
    };

    const fetchReceipts = async (raw?: string) => {
        const digits = (raw ?? phone).replace(/\D/g, '');
        if (!/^\d{9,10}$/.test(digits)) {
            setError('Enter a valid phone number.');
            setData(null);
            setSearched(true);
            return;
        }
        setLoading(true);
        setError('');
        setData(null);
        setSearched(false);
        try {
            const res = await apiClient.get(`/purchase-receipts?phone=${encodeURIComponent(digits)}`);
            setData(res.data);
            setSearched(true);
        } catch (err) {
            const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(errMsg || 'Failed to load your receipts. Try again.');
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const totalCount = (data?.orders?.length || 0) + (data?.hires?.length || 0);

    useEffect(() => {
        if (!isOpen) return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setTimeout(() => fetchReceipts(stored), 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
                            <div>
                                <h2 className="font-black text-lg flex items-center gap-2">
                                    <FileText size={18} /> My Receipts
                                </h2>
                                <p className="text-white/80 text-[11px] mt-0.5">
                                    Show a receipt to the admin when collecting your items
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Phone lookup */}
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Phone number used at checkout
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchReceipts()}
                                    placeholder="0712 345 678"
                                    className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                />
                                <button
                                    onClick={() => fetchReceipts()}
                                    disabled={loading}
                                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all"
                                >
                                    <Search size={15} />
                                    {loading ? 'Loading…' : 'Find'}
                                </button>
                            </div>
                            {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {!searched && !data && (
                                <div className="text-center py-10 text-slate-400">
                                    <CheckCircle2 size={32} className="mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">Enter your phone number to see your paid items.</p>
                                </div>
                            )}

                            {searched && !loading && data && totalCount === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <Package size={32} className="mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">No paid items found for this number yet.</p>
                                </div>
                            )}

                            {data && (
                                <>
                                    {/* Pickup / admin details banner */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <MapPin size={12} /> Where to collect your items
                                        </p>
                                        <p className="text-sm font-black text-slate-800">
                                            {data.pickup.order.location}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {data.pickup.order.instructions}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                                            <Phone size={12} /> {data.pickup.order.admin_phone}
                                        </p>
                                    </div>

                                    {/* Orders */}
                                    {data.orders.map((order) => (
                                        <div key={order.order_reference} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                                                <ShoppingBag size={16} className="text-emerald-600 shrink-0" />
                                                <p className="text-sm font-black text-emerald-800 flex-1">
                                                    You purchased for KES {Number(order.amount).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="px-4 py-3 space-y-2">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-slate-600">
                                                            {item.quantity} × {item.name}
                                                        </span>
                                                        <span className="font-semibold text-slate-800">
                                                            KES {(item.quantity * item.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between pt-2 border-t border-slate-100">
                                                    <span className="text-xs text-slate-400 font-semibold">Ref</span>
                                                    <span className="text-xs font-mono font-bold text-slate-600">{order.order_reference}</span>
                                                </div>
                                                {order.mpesa_receipt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-slate-400 font-semibold">M-Pesa receipt</span>
                                                        <span className="text-xs font-mono font-bold text-slate-600">{order.mpesa_receipt}</span>
                                                    </div>
                                                )}
                                                {order.collection_method === 'delivery' ? (
                                                    <p className="text-xs text-slate-500">
                                                        Delivery: {order.delivery_address || 'Address on file'}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin size={11} /> Pickup at {data.pickup.order.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hires */}
                                    {data.hires.map((hire) => (
                                        <div key={hire.hire_reference} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                                <Armchair size={16} className="text-blue-600 shrink-0" />
                                                <p className="text-sm font-black text-blue-800 flex-1">
                                                    You hired for KES {Number(hire.total_cost).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="px-4 py-3 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        {hire.quantity} × {hire.item_name}
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        KES {Number(hire.total_cost).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-slate-400 font-semibold">Ref</span>
                                                    <span className="text-xs font-mono font-bold text-slate-600">{hire.hire_reference}</span>
                                                </div>
                                                {hire.mpesa_receipt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-slate-400 font-semibold">M-Pesa receipt</span>
                                                        <span className="text-xs font-mono font-bold text-slate-600">{hire.mpesa_receipt}</span>
                                                    </div>
                                                )}
                                                {hire.pickup_date && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-slate-400 font-semibold">Pickup date</span>
                                                        <span className="text-xs font-bold text-slate-600">
                                                            {new Date(hire.pickup_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MapPin size={11} /> {data.pickup.hire.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {totalCount > 0 && (
                                        <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-start gap-2">
                                            <FileText size={16} className="mt-0.5 shrink-0 text-amber-400" />
                                            <p className="text-xs">
                                                Show this screen to the admin when collecting your items.
                                                Your reference numbers confirm your payment.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
