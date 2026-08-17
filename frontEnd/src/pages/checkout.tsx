import { useState } from "react";
import { useCart } from "../context/cartcontext";
import { apiClient } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const showToast = (message: string) => alert(message);

  const handleSTKPush = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      if (phone.length < 9) {
          setError('Please enter a valid phone number');
          setLoading(false);
          return;
      }

      try {
          const res = await apiClient.post('/stkPush/initiate/guest', {
              amount: total,
              phoneNumber: phone
          });

          const cid = res.data.checkoutId || res.data.CheckoutRequestID;
          if (!cid) throw new Error("No checkout ID received");

          setCheckoutId(cid);
          showToast('Please check your phone for the M-Pesa prompt.');

          pollPaymentStatus(cid);

      } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to initiate STK Push. Try again.');
          setLoading(false);
      }
  };

  const pollPaymentStatus = async (cid: string) => {
      let attempts = 0;
      const maxAttempts = 15;

      const interval = setInterval(async () => {
          attempts++;
          try {
              const checkRes = await apiClient.get(`/stkPush/check/${cid}`);
              const status = checkRes.data.status;

              if (status === 'paid') {
                  clearInterval(interval);
                  showToast('Payment successful!');
                  
                  await createOrder(checkRes.data.mpesa_receipt);
              } else if (status === 'failed') {
                  clearInterval(interval);
                  setError('Payment failed or was cancelled.');
                  setLoading(false);
                  setCheckoutId(null);
              }
          } catch (err) {
              console.error("Polling error", err);
          }

          if (attempts >= maxAttempts) {
              clearInterval(interval);
              setError('Payment timeout. Please check your messages.');
              setLoading(false);
              setCheckoutId(null);
          }
      }, 3000);
  };

  const createOrder = async (receipt: string) => {
      try {
          await apiClient.post('/orders', {
              amount: total,
              phone: phone,
              checkout_id: checkoutId,
              mpesa_receipt: receipt,
              items: cart,
              status: 'paid'
          });
          clearCart();
          showToast('Order confirmed successfully!');
          navigate('/');
      } catch (err) {
          setError('Payment succeeded but failed to save order details. Contact admin.');
          setLoading(false);
      }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Enter phone (2547XXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ padding: "10px", width: "300px", marginBottom: "10px" }}
      />

      <h3>Order Summary</h3>

      {cart.map((item) => (
        <div key={item.id}>
          {item.name} x {item.quantity} = KES {item.price * item.quantity}
        </div>
      ))}

      <h2>Total: KES {total}</h2>

      <button
        onClick={handleSTKPush}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "green",
          color: "white",
          border: "none",
          marginTop: "20px",
          cursor: "pointer"
        }}
      >
        {loading ? "Processing..." : "Pay with M-Pesa"}
      </button>
    </div>
  );
}