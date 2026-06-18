import { useCart } from "../context/cartcontext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // 🧠 calculate total price
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Your Cart</h2>

      {/* EMPTY CART STATE */}
      {cart.length === 0 && (
        <p>Your cart is empty</p>
      )}

      {/* CART ITEMS */}
      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{item.name}</h3>
          <p>Price: KES {item.price}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Total: KES {item.price * item.quantity}</p>

          <button onClick={() => removeFromCart(item.id)}>
            Remove
          </button>
        </div>
      ))}

      {/* TOTAL SECTION */}
      <h2>Total: KES {total}</h2>

      {/* CHECKOUT BUTTON */}
      <button
        disabled={cart.length === 0}
        onClick={() => navigate("/checkout")}
        style={{
          padding: "10px 20px",
          background: "green",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}