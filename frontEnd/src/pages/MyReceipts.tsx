import { useEffect, useState } from 'react';
import { ShoppingBag, Armchair, MapPin, Phone, Package, FileText, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

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

export const MyReceipts: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<ReceiptsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const email = user?.email || '';

        if (!email) {
            setLoading(false);
            setError('No account email found. Please sign in again.');
            return;
        }

        apiClient
            .get(`/purchase-receipts?email=${encodeURIComponent(email)}`)
            .then(({ data }) => {
                if (!active) return;
                setData(data);
            })
            .catch((err) => {
                if (!active) return;
                const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
                setError(errMsg || 'Failed to load your receipts. Try again.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [user?.email]);

    const totalCount = (data?.orders?.length || 0) + (data?.hires?.length || 0);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Receipts</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Your paid purchases and hires, linked to your account email.
                </p>
            </div>

            {loading && (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Loading your receipts…</p>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-sm text-red-600 font-semibold">{error}</p>
                    <p className="text-xs text-red-400 mt-1">
                        Receipts only show for purchases made with your account email.
                    </p>
                </div>
            )}

            {!loading && !error && data && totalCount === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                    <Package size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-semibold text-sm">No receipts yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Once you complete a purchase with your account email, your receipt will appear here.
                    </p>
                </div>
            )}

            {!loading && !error && data && totalCount > 0 && (
                <>
                    {/* Pickup / admin details banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <MapPin size={12} /> Where to collect your items
                        </p>
                        <p className="text-sm font-black text-slate-800">{data.pickup.order.location}</p>
                        <p className="text-xs text-slate-600 mt-1">{data.pickup.order.instructions}</p>
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                            <Phone size={12} /> {data.pickup.order.admin_phone}
                        </p>
                    </div>

                    <div className="space-y-4">
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

                        <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-start gap-2">
                            <FileText size={16} className="mt-0.5 shrink-0 text-amber-400" />
                            <p className="text-xs">
                                Show this screen to the admin when collecting your items. Your reference numbers confirm your payment.
                            </p>
                        </div>
                    </div>

                    {user?.email && (
                        <p className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> Linked to {user.email}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};
