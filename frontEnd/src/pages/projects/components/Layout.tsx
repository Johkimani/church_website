import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { ReceiptsDrawer } from './ReceiptsDrawer';
import { ToastContainer } from './ToastContainer';
import { useApp } from '../context/AppContext';
import { apiClient } from '../../../api/axiosInstance';
import { useState, useEffect } from 'react';
import { SELLER_NUMBERS } from '../data';

const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

export const Layout = () => {
    const {
        cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity,
        customerName, setCustomerName, customerPhone, setCustomerPhone,
        customerEmail, setCustomerEmail,
        deliveryAddress, setDeliveryAddress,
        collectionMethod, setCollectionMethod,
        cartTotal, proceedToCheckout, proceedWithCash, toasts, isDarkMode, toggleDarkMode,
        apiMessages,
        paymentPending, confirmMpesaPayment, dismissPaymentPending,
        dismissToast, cashPhone
    } = useApp();

    const [footerIndex, setFooterIndex] = useState(0);
    const [isFooterFading, setIsFooterFading] = useState(false);
    const [receiptsOpen, setReceiptsOpen] = useState(false);
    const [receiptCount, setReceiptCount] = useState(0);

    const STORAGE_KEY = 'csa_receipt_phone';
    const SEEN_KEY = 'csa_receipts_seen';

    const refreshReceiptCount = () => {
        const phone = localStorage.getItem(STORAGE_KEY);
        if (!phone) return;
        apiClient.get(`/purchase-receipts?phone=${encodeURIComponent(phone.replace(/\D/g, ''))}`)
            .then(res => {
                const count = (res.data?.orders?.length || 0) + (res.data?.hires?.length || 0);
                const seen = Number(localStorage.getItem(SEEN_KEY) || 0);
                setReceiptCount(count > seen ? count - seen : 0);
            })
            .catch(() => {});
    };

    useEffect(() => {
        refreshReceiptCount();
    }, [cart.length]);

    const openReceipts = () => {
        const phone = localStorage.getItem(STORAGE_KEY);
        if (phone) {
            const count = Number(localStorage.getItem(SEEN_KEY) || 0);
            localStorage.setItem(SEEN_KEY, String(count + receiptCount));
            setReceiptCount(0);
        }
        setReceiptsOpen(true);
    };

    const generalMessages = apiMessages?.general || [];
    useEffect(() => {
        if (generalMessages.length <= 1) return;
        const interval = setInterval(() => {
            setIsFooterFading(true);
            setTimeout(() => {
                setFooterIndex(prev => (prev + 1) % generalMessages.length);
                setIsFooterFading(false);
            }, 500);
        }, 5000);
        return () => clearInterval(interval);
    }, [generalMessages]);

    return (
        <div className="app-container">
            <Header
                cartCount={cart.length}
                setIsCartOpen={setIsCartOpen}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                onOpenReceipts={openReceipts}
                receiptCount={receiptCount}
            />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            <ReceiptsDrawer
                isOpen={receiptsOpen}
                onClose={() => setReceiptsOpen(false)}
            />

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
                paymentPending={paymentPending}
                confirmMpesaPayment={confirmMpesaPayment}
                dismissPaymentPending={dismissPaymentPending}
                cashPhone={cashPhone}
            />

            <main className="content">
                <Outlet />
            </main>

            <div className="floating-actions">
                <a href={`tel:${SELLER_NUMBERS.sacramentals}`} className="float-btn phone shadow-lg">
                    <PhoneIcon />
                </a>
            </div>

            <Footer apiMessages={apiMessages} footerIndex={footerIndex} isFooterFading={isFooterFading} />
        </div>
    );
};
