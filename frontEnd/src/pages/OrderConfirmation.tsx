import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, Home, ShoppingBag } from "lucide-react";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("order_id");
    if (id) setOrderId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-center">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-black">Payment Successful!</h1>
            <p className="text-emerald-100 text-sm mt-1">Thank you for your order</p>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-4">
            {orderId && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order Number</p>
                <p className="text-2xl font-black text-slate-800 font-mono">#{orderId}</p>
              </div>
            )}

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold">
                You will receive a confirmation via SMS and email shortly.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Your order is now being processed. We'll notify you when it's ready for delivery or collection.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate("/sacramentals")}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <ShoppingBag size={16} /> Continue Shopping
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} /> Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          CSA Kirinyaga Chapter &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
