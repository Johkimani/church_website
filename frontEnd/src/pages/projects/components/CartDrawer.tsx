import React from 'react';
import type { CartItem } from '../data';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    cartTotal: number;
    removeFromCart: (index: number) => void;
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    proceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
    isOpen, onClose, cart, cartTotal, removeFromCart,
    customerName, setCustomerName, customerPhone, setCustomerPhone, proceedToCheckout
}) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay animate-fade-in" onClick={onClose}
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />
            <div className="cart-drawer animate-slide-in"
                style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-bg)', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' }}>
                <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Your Cart ({cart.length})</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-text)' }}>&times;</button>
                </div>

                <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-muted)' }}>
                            <p>Your cart is empty.</p>
                            <button className="btn-secondary" onClick={onClose} style={{ marginTop: '10px' }}>Continue Shopping</button>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="cart-item" style={{ display: 'flex', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
                                {item.item.img ? (
                                    <img src={item.item.img} alt={item.item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ width: '80px', height: '80px', background: 'var(--color-card)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No img</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{item.item.name}</h4>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                                        {item.size && <span>Size: {item.size} &bull; </span>}
                                        {item.rentalDays ? <span>Rental: {item.rentalDays} days</span> : <span>Purchase</span>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <span style={{ fontWeight: 600 }}>KES {item.price}</span>
                                        <button onClick={() => removeFromCart(index)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer" style={{ padding: '20px', background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span>KES {cartTotal}</span>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Your Name <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                required
                                className="checkout-input"
                                placeholder="John Doe"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>Phone Number <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="tel"
                                required
                                className="checkout-input"
                                placeholder="07XX XXX XXX"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '15px' }}
                            onClick={proceedToCheckout}
                            disabled={!customerName.trim() || !customerPhone.trim()}
                        >
                            Checkout via WhatsApp
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '10px' }}>
                            We will prepare your order and contact you shortly.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};
