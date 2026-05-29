import React, { createContext, useContext, useState, useEffect } from 'react';
import {  MESSAGES as DEFAULT_MESSAGES, SACRAMENTAL_CATEGORIES} from '../pages/projects/pages/data';
import type { CartItem, SacramentalCategory } from '../pages/projects/pages/data';

interface ToastMessage {
    id: number;
    message: string;
}

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
    clearCart: () => void;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;

    // Checkout
    customerName: string;
    setCustomerName: (name: string) => void;
    customerPhone: string;
    setCustomerPhone: (phone: string) => void;
    proceedToCheckout: () => Promise<void>;

    // Toasts
    toasts: ToastMessage[];
    showToast: (message: string) => void;

    // Global Filters/States
    sacCategory: SacramentalCategory;
    setSacCategory: (cat: SacramentalCategory) => void;

    // Auth
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [apiMessages, setApiMessages] = useState<Record<string, string[]>>(DEFAULT_MESSAGES);
    const [sliderImages, setSliderImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [sacCategory, setSacCategory] = useState<SacramentalCategory>('all');
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('csa_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
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

    // Persist Cart
    useEffect(() => {
        localStorage.setItem('csa_cart', JSON.stringify(cart));
    }, [cart]);

    // Persist Admin Auth
    useEffect(() => {
        if (isAdmin) {
            localStorage.setItem('csa_admin_auth', 'true');
        } else {
            localStorage.removeItem('csa_admin_auth');
        }
    }, [isAdmin]);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_SERVER_URI?.replace(/\/+$/, '') || '';

        const fetchData = async () => {
            try {
                const [prodRes, configRes] = await Promise.all([
                    fetch(`${apiBase}/api/products`),
                    fetch(`${apiBase}/api/config`)
                ]);
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProducts(prodData);
                }
                if (configRes.ok) {
                    const config = await configRes.json();
                    if (config.MESSAGES) setApiMessages(config.MESSAGES);
                    if (config.SLIDER_IMAGES) setSliderImages(config.SLIDER_IMAGES);
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

    const showToast = (message: string) => {
        const newToast = { id: Date.now(), message };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 3000);
    };

    const addToCart = (item: CartItem) => {
        setCart(prev => [...prev, item]);
        showToast(`Added ${item.item.name} to cart`);
    };

    const removeFromCart = (indexToRemove: number) => {
        setCart(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => {
        return total + (item.price * (item.rentalDays || 1));
    }, 0);

    const proceedToCheckout = async () => {
        if (cart.length === 0) return;
        if (!customerName.trim() || !customerPhone.trim()) {
            showToast("Please provide your name and phone number");
            return;
        }

        const orderData = {
            items: cart,
            total: cartTotal,
            customer_name: customerName,
            customer_phone: customerPhone
        };

        const apiBase = import.meta.env.VITE_SERVER_URI?.replace(/\/+$/, '') || '';

        try {
            await fetch(`${apiBase}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            showToast("Order placed successfully! Redirecting to WhatsApp...");
        } catch (err) {
            console.error("Failed to save order to database:", err);
        }

        const SELLER_NUMBERS = { sacramentals: "254112051739" }; // Simplified for now

        const message = `Order Details:\nName: ${customerName}\nPhone: ${customerPhone}\n\n` + cart.map(c =>
            `- ${c.item.name} ${c.size ? `(Size: ${c.size})` : ''} ` +
            `${c.rentalDays ? `[Rental: ${c.rentalDays} days]` : ''} ` +
            `KES ${c.price * (c.rentalDays || 1)}`
        ).join('\n') + `\n\nTotal: KES ${cartTotal}`;

        window.open(`https://wa.me/${SELLER_NUMBERS.sacramentals}?text=${encodeURIComponent(message)}`, '_blank');

        setCart([]);
        setIsCartOpen(false);
        setCustomerName('');
        setCustomerPhone('');
    };

    return (
        <AppContext.Provider value={{
            products, apiMessages, sliderImages, isLoading,
            isDarkMode, toggleDarkMode,
            cart, addToCart, removeFromCart, clearCart, cartTotal,
            isCartOpen, setIsCartOpen,
            customerName, setCustomerName, customerPhone, setCustomerPhone, proceedToCheckout,
            toasts, showToast,
            sacCategory, setSacCategory,
            isAdmin, setIsAdmin
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
