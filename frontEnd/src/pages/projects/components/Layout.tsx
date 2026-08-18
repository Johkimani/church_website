import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { ReceiptsDrawer } from './ReceiptsDrawer';
import { ToastContainer } from './ToastContainer';
import { useApp } from '../../../context/AppContext';
import { apiClient } from '../../../api/axiosInstance';
import { useState, useEffect } from 'react';

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

            <Footer apiMessages={apiMessages} footerIndex={footerIndex} isFooterFading={isFooterFading} />
        </div>
    );
};
