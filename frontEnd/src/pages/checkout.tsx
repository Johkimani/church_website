import { useState } from "react";
import { useCart } from "../context/cartcontext";
import { apiClient } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePayment = async () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const res = await apiClient.post("/payments/stkpush", {
  userId: 1, // later replace with logged-in user id
  phoneNumber: phone,
  amount: total,
  description: "Cart Purchase"
});

      console.log("STK response:", res.data);

      alert("STK Push sent to phone");

      clearCart();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💳 Checkout</h2>

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
        onClick={handlePayment}
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