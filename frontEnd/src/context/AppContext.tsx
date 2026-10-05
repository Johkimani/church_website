import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api/config';
import { apiClient } from '../api/axiosInstance';
import { SessionStorage } from '../utils';
import type { CartItem, SacramentalCategory } from '../pages/projects/pages/data';

// Email of the signed-in account, used to link purchases to "My Receipts".
const getAccountEmail = (): string => {
  try {
    const stored = SessionStorage.get('userdata');
    return stored?.status === 'success' && stored?.email ? String(stored.email) : '';
  } catch {
    return '';
  }
};

export interface HireItem {
  id: number;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  hireMode?: 'daily' | 'hourly';
  hours?: number;
}
import apiService from '../services/api';
import type { ToastMessage } from '../pages/projects/components/ToastContainer';

interface AppContextType {
    // Products & Config
    products: any[];
    apiMessages: Record<string, string[]>;
    sliderImages: any[];
    isLoading: boolean;

    // Theme
    isDarkMode: boolean;
    toggleDarkMode: () => void;

    // Cart
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (index: number) => void;
    updateCartQuantity: (index: number, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemsCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;

    // Checkout
    customerName: string;
    setCustomerName: (name: string) => void;
    customerPhone: string;
    setCustomerPhone: (phone: string) => void;
    customerEmail: string;
    setCustomerEmail: (email: string) => void;
    deliveryAddress: string;
    setDeliveryAddress: (address: string) => void;
    collectionMethod: "pickup" | "delivery";
    setCollectionMethod: (method: "pickup" | "delivery") => void;
    proceedToCheckout: () => Promise<void>;

    // Payment status (for M-Pesa manual confirmation)
    paymentPending: boolean;
    pendingCheckoutId: string | null;
    pendingPhone: string;
    confirmMpesaPayment: (receipt: string) => Promise<void>;
    dismissPaymentPending: () => void;

    // Toasts
    toasts: ToastMessage[];
    showToast: (message: string, type?: ToastMessage['type']) => void;
    dismissToast: (id: number) => void;

    // Global Filters/States
    sacCategory: SacramentalCategory;
    setSacCategory: (cat: SacramentalCategory) => void;
    sectionBanners: Record<string, { img: string; title: string; subtitle: string }> | null;
    projectManagerPhone: string;

    // Hire Cart
    hireItems: HireItem[];
    addToHire: (item: HireItem) => void;
    removeFromHire: (name: string) => void;
    updateHireQty: (name: string, delta: number) => void;
    clearHire: () => void;
    hireItemsCount: number;
    isHireModalOpen: boolean;
    setHireModalOpen: (open: boolean) => void;

    // Auth
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [apiMessages, setApiMessages] = useState<Record<string, string[]>>({});
    const [sliderImages, setSliderImages] = useState<any[]>([]);
    const [sectionBanners, setSectionBanners] = useState<Record<string, { img: string; title: string; subtitle: string }> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [sacCategory, setSacCategory] = useState<SacramentalCategory>('all');
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = sessionStorage.getItem('csa_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [collectionMethod, setCollectionMethod] = useState<"pickup" | "delivery">("pickup");
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [hireItems, setHireItems] = useState<HireItem[]>([]);
    const [isHireModalOpen, setHireModalOpen] = useState(false);

    // Payment pending state (for manual M-Pesa receipt confirmation)
    const [paymentPending, setPaymentPending] = useState(false);
    const [pendingCheckoutId, setPendingCheckoutId] = useState<string | null>(null);
    const [pendingPhone, setPendingPhone] = useState('');

    const addToHire = (item: HireItem) => {
        setHireItems(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i =>
                    i.name === item.name ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromHire = (name: string) => {
        setHireItems(prev => prev.filter(i => i.name !== name));
    };

    const updateHireQty = (name: string, delta: number) => {
        setHireItems(prev => prev.map(i => {
            if (i.name !== name) return i;
            const newQty = i.quantity + delta;
            return newQty <= 0 ? i : { ...i, quantity: newQty };
        }));
    };

    const clearHire = () => setHireItems([]);

    const hireItemsCount = hireItems.reduce((sum, i) => sum + (i.quantity || 0), 0);

    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        return localStorage.getItem('csa_admin_auth') === 'true';
    });

    // Sync Dark Mode state to body class
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    // Persist Cart (per-session — each tab has its own cart)
    useEffect(() => {
        sessionStorage.setItem('csa_cart', JSON.stringify(cart));
    }, [cart]);

    // Fetch system settings
    useEffect(() => {
        apiClient.get('/settings').then(res => setSettings(res.data)).catch(() => {});
    }, []);

    // Persist Admin Auth
    useEffect(() => {
        if (isAdmin) {
            localStorage.setItem('csa_admin_auth', 'true');
        } else {
            localStorage.removeItem('csa_admin_auth');
        }
    }, [isAdmin]);

    useEffect(() => {
        const apiBase = BASE_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : undefined);

        if (!apiBase) {
            console.warn('AppContext: No backend URL configured for products/config loading.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [prodRes, configRes] = await Promise.all([
                    fetch(`${apiBase}/products`),
                    fetch(`${apiBase}/config`)
                ]);
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProducts(prodData);
                }
                if (configRes.ok) {
                    const config = await configRes.json();
                    if (config.MESSAGES) setApiMessages(config.MESSAGES);
                    if (config.SLIDER_IMAGES) setSliderImages(config.SLIDER_IMAGES);
                    if (config.SECTION_BANNERS) setSectionBanners(config.SECTION_BANNERS);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const showToast = (message: string, type?: ToastMessage['type']) => {
        const newToast: ToastMessage = { id: Date.now(), message, type: type || 'success' };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 4000);
    };

    const dismissToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const updateCartQuantity = (indexToUpdate: number, delta: number) => {
        setCart(prev => prev.map((item, index) => {
            if (index !== indexToUpdate) return item;
            const newQty = (Number(item.quantity) || 1) + delta;
            if (newQty <= 0) return item;
            return { ...item, quantity: newQty };
        }));
    };

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            // If same item exists, increment quantity
            const existingIdx = prev.findIndex(p =>
                p.item?.name === item.item?.name &&
                p.item?.price === item.price &&
                p.category === item.category
            );
            if (existingIdx >= 0) {
                return prev.map((p, i) =>
                    i === existingIdx
                        ? { ...p, quantity: (Number(p.quantity) || 1) + 1 }
                        : p
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        setIsCartOpen(true);
        showToast(`Added ${item.item?.name || 'item'} to cart`, 'success');
    };

    const removeFromCart = (indexToRemove: number) => {
        setCart(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => {
        return total + (item.price * (Number(item.quantity) || item.rentalDays || 1));
    }, 0);

    const cartItemsCount = cart.reduce((count, item) => count + (Number(item.quantity) || 1), 0);

    const proceedToCheckout = async () => {
        if (cart.length === 0) return;
        const phoneDigits = customerPhone.replace(/\D/g, '');
        if (!customerName.trim() || !/^\d{10}$/.test(phoneDigits)) {
            showToast(!customerName.trim() ? "Please provide your name" : "Enter a valid 10-digit phone number", 'warning');
            return;
        }

        let phone = '254' + phoneDigits.replace(/^0+/, '');

        let checkoutId: string | null = null;

        try {
            showToast("Initiating M-Pesa payment... Please check your phone.", 'info');
            const response = await apiService.initiateStkPush(phone, cartTotal, cart);
            
            if (!response || !response.checkoutId) {
                showToast(response?.error || "Failed to initiate payment. Please try again.", 'error');
                return;
            }

            checkoutId = response.checkoutId;
            setPendingCheckoutId(checkoutId);
            setPendingPhone(phone);

            // If backend already confirmed payment during its polling window
            if (response.result?.status === 'paid') {
                showToast("Payment successful! Order confirmed.", 'success');
                localStorage.setItem('csa_receipt_phone', phone);
                localStorage.removeItem('csa_receipts_seen');
                setCart([]);
                setIsCartOpen(false);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                setDeliveryAddress('');
                sessionStorage.setItem('csa_order_phone', phone);
                navigate(`/order-confirmation?order_id=${checkoutId}&cid=${checkoutId}&method=mpesa`);
                return;
            }

            // Create a pending order linked to this checkout
            try {
                await apiService.createRecord('orders', {
                    amount: cartTotal,
                    phone,
                    customer_name: customerName.trim(),
                    customer_email: customerEmail.trim() || getAccountEmail() || null,
                    payment_method: 'mpesa',
                    collection_method: collectionMethod,
                    delivery_address: collectionMethod === 'delivery' ? deliveryAddress.trim() : null,
                    checkout_id: checkoutId,
                    items: cart,
                    status: 'pending',
                });
            } catch (e) {
                console.error("Failed to create pending order:", e);
                showToast("Warning: Order record failed, but payment will proceed.", 'warning');
            }
            
            // Poll for status - longer timeout (3 min) for M-Pesa callbacks
            let attempts = 0;
            const maxAttempts = 36;
            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const statusRes = await apiService.checkStkStatus(checkoutId!);
                    
                    if (statusRes.status === 'paid') {
                        clearInterval(pollInterval);
                        setPaymentPending(false);
                        showToast("Payment successful! Order confirmed.", 'success');
                        const orderId = statusRes.order_id || statusRes.orderId || checkoutId;
                        localStorage.setItem('csa_receipt_phone', phone);
                        localStorage.removeItem('csa_receipts_seen');
                        setCart([]);
                        setIsCartOpen(false);
                        setCustomerName('');
                        setCustomerPhone('');
                        setCustomerEmail('');
                        setDeliveryAddress('');
                        sessionStorage.setItem('csa_order_phone', phone);
                        navigate(`/order-confirmation?order_id=${orderId}&cid=${checkoutId}&method=mpesa`);
                    } else if (statusRes.status === 'failed') {
                        clearInterval(pollInterval);
                        showToast(`Payment failed: ${statusRes.result_desc || 'Cancelled'}`, 'error');
                    }
                } catch (e) {
                    console.error("Error polling:", e);
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    setPaymentPending(true);
                    showToast("Payment sent to your phone. If you've already entered your PIN, enter the M-Pesa receipt from your SMS below.", 'info');
                }
            }, 5000);
        } catch (err: any) {
            console.error("Checkout error:", err);
            showToast(err?.response?.data?.message || err?.response?.data?.error || "Failed to initiate payment. Check your connection and try again.", 'error');
        }
    };

    const confirmMpesaPayment = async (receipt: string) => {
        try {
            const response = await apiClient.post('/orders/confirm-payment', {
                phone: pendingPhone,
                checkout_id: pendingCheckoutId,
                mpesa_receipt: receipt.trim(),
            });
            if (response.data?.status === 'paid') {
                setPaymentPending(false);
                setPendingCheckoutId(null);
                setPendingPhone('');
                localStorage.setItem('csa_receipt_phone', pendingPhone);
                localStorage.removeItem('csa_receipts_seen');
                setCart([]);
                setIsCartOpen(false);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                setDeliveryAddress('');
                showToast("Payment confirmed! Order placed successfully.", 'success');
                sessionStorage.setItem('csa_order_phone', pendingPhone);
                navigate(`/order-confirmation?order_id=${receipt}&cid=${pendingCheckoutId}&method=mpesa`);
            } else {
                showToast("Could not confirm payment. Check the receipt number and try again.", 'error');
            }
        } catch (err: any) {
            showToast(err?.response?.data?.message || err?.response?.data?.error || "Failed to confirm payment. Try again.", 'error');
        }
    };

    const dismissPaymentPending = () => {
        setPaymentPending(false);
        setPendingCheckoutId(null);
        setPendingPhone('');
    };

    return (
        <AppContext.Provider value={{
            products, apiMessages, sliderImages, sectionBanners, isLoading,
            isDarkMode, toggleDarkMode,
            cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartItemsCount,
            isCartOpen, setIsCartOpen,
            customerName, setCustomerName, customerPhone, setCustomerPhone,
            customerEmail, setCustomerEmail,
            deliveryAddress, setDeliveryAddress,
            collectionMethod, setCollectionMethod,
            proceedToCheckout,
            paymentPending, pendingCheckoutId, pendingPhone,
            confirmMpesaPayment, dismissPaymentPending,
            toasts, showToast, dismissToast,
            sacCategory, setSacCategory,
            hireItems, addToHire, removeFromHire, updateHireQty, clearHire, hireItemsCount,
            isHireModalOpen, setHireModalOpen,
            isAdmin, setIsAdmin,
            projectManagerPhone: settings.cash_phone || '254112051739'
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
