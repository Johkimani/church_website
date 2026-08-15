import { Outlet } from "react-router-dom";
import Headers from "../../layOuts/Headers";
import Footers from "../../layOuts/Footers";
import { CartDrawer } from "../../pages/projects/components/CartDrawer";
import { ToastContainer } from "../../pages/projects/components/ToastContainer";
import { useApp } from "../../context/AppContext";

const Pageoulet = () => {
  const {
    cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity,
    customerName, setCustomerName, customerPhone, setCustomerPhone,
    customerEmail, setCustomerEmail, deliveryAddress, setDeliveryAddress,
    collectionMethod, setCollectionMethod,
    cartTotal, proceedToCheckout, proceedWithCash, toasts
  } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Headers />
      <ToastContainer toasts={toasts} />
      <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          cartTotal={cartTotal}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          collectionMethod={collectionMethod}
          setCollectionMethod={setCollectionMethod}
          proceedToCheckout={proceedToCheckout}
          proceedWithCash={proceedWithCash}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footers />
    </div>
  );
};

export default Pageoulet;
