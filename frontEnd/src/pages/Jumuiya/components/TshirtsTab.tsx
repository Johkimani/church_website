import React, { useState } from 'react';
import type { TshirtOrder } from '../data/jumuiyaData';
import { useData } from '../context/DataContext';
import { FaTshirt, FaShoppingCart, FaCheckCircle, FaUser, FaPhone, FaRuler, FaLayerGroup, FaArrowRight, FaPrint, FaDownload, FaTimes, FaIdCard } from 'react-icons/fa';
import tshirtMockup from '../../../assets/Images/jumuiya_tshirt.png';
import './TabsSystem.css';
import './TshirtsTab.css';

interface TshirtsTabProps {
    jumuiyaId: string;
    jumuiyaName: string;
    orders: TshirtOrder[];
    jumuiyaColor: string;
}

const TshirtsTab: React.FC<TshirtsTabProps> = ({ jumuiyaId, jumuiyaName, orders, jumuiyaColor }) => {
    const { addTshirtOrder } = useData();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [formData, setFormData] = useState({
        holderName: '',
        payerName: '',
        phone: '',
        size: 'M' as TshirtOrder['size'],
        quantity: 1
    });
    const [lastOrder, setLastOrder] = useState<TshirtOrder | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [subTab, setSubTab] = useState<'order' | 'history'>('order');

    const sizes: TshirtOrder['size'][] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.holderName.trim()) newErrors.holderName = 'T-shirt holder name is required';
        if (!formData.payerName.trim()) newErrors.payerName = 'Payer name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const newOrder: TshirtOrder = {
                id: `TS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                ...formData,
                submittedAt: new Date().toISOString()
            };
            addTshirtOrder(jumuiyaId, newOrder);
            setLastOrder(newOrder);
            setIsSubmitted(true);
        }
    };

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">{jumuiyaName} T-Shirts</h1>
                    <p className="page-description">Get your official {jumuiyaName} wear and represent us with pride.</p>
                </div>
                {/* Sub-tab selection */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-soft)', padding: '6px', borderRadius: '40px', marginTop: '16px', border: '1px solid var(--border-light)' }}>
                    <button
                        onClick={() => setSubTab('order')}
                        style={{
                            flex: 1, padding: '10px 24px', borderRadius: '30px', border: 'none',
                            background: subTab === 'order' ? jumuiyaColor : 'transparent',
                            color: subTab === 'order' ? 'white' : 'var(--text-secondary)',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        <FaShoppingCart style={{ marginRight: '8px' }} /> Shop Wear
                    </button>
                    <button
                        onClick={() => setSubTab('history')}
                        style={{
                            flex: 1, padding: '10px 24px', borderRadius: '30px', border: 'none',
                            background: subTab === 'history' ? jumuiyaColor : 'transparent',
                            color: subTab === 'history' ? 'white' : 'var(--text-secondary)',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        <FaIdCard style={{ marginRight: '8px' }} /> My Orders ({orders.length})
                    </button>
                </div>
            </div>

            <div className="animate-fade-in">
                {subTab === 'order' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
                        {/* Left: Product Showcase */}
                        <div className="tab-card glass-card" style={{ padding: '0', overflow: 'hidden', position: 'sticky', top: '20px' }}>
                            <div style={{ position: 'relative', height: '500px' }}>
                                <img
                                    src={tshirtMockup}
                                    alt="T-shirtcloseup"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white' }}>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Official {jumuiyaName} Tshirt</h2>
                                    <p style={{ color: 'white', opacity: 0.9, fontSize: '1.1rem' }}>Premium 100% Cotton • Gold Typography • Limited Edition</p>
                                </div>
                            </div>
                            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: jumuiyaColor }}>KES 1,200</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PRICE PER UNIT</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: jumuiyaColor }}>All Sizes</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>XS TO XXL</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: jumuiyaColor }}>3-5 Days</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DELIVERY TIME</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Refined Order Form */}
                        <div className="tab-card glass-card" style={{ padding: '40px', overflow: 'hidden' }}>
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="tshirt-form-header">
                                        <h3 className="tshirt-form-title">
                                            Place Your Order
                                        </h3>
                                        <p className="tshirt-form-desc">
                                            Please provide the correct details for processing your Jumuiya Tshirt.
                                        </p>
                                    </div>

                                    <div className="tshirt-form-body">
                                        <div className="form-field-group">
                                            <label className="tshirt-form-label">
                                                <FaUser style={{ color: jumuiyaColor, fontSize: '0.9rem' }} />
                                                T-shirt Recipient Name
                                            </label>
                                            <input
                                                className="form-input-premium tshirt-form-input"
                                                name="holderName"
                                                value={formData.holderName}
                                                onChange={handleInputChange}
                                                placeholder="e.g., John Mwangi"
                                            />
                                            {errors.holderName && <small className="error-text tshirt-error-hint">{errors.holderName}</small>}
                                        </div>

                                        <div className="form-field-group">
                                            <label className="tshirt-form-label">
                                                <FaPhone style={{ color: jumuiyaColor, fontSize: '0.9rem' }} />
                                                M-Pesa Phone Number
                                            </label>
                                            <input
                                                className="form-input-premium tshirt-form-input"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 0712345678"
                                            />
                                            {errors.phone && <small className="error-text tshirt-error-hint">{errors.phone}</small>}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="form-field-group">
                                                <label className="tshirt-form-label">
                                                    <FaRuler style={{ color: jumuiyaColor }} />
                                                    Select Size
                                                </label>
                                                <select className="form-input-premium tshirt-form-input" name="size" value={formData.size} onChange={handleInputChange}>
                                                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-field-group">
                                                <label className="tshirt-form-label">
                                                    <FaLayerGroup style={{ color: jumuiyaColor }} />
                                                    Quantity
                                                </label>
                                                <input
                                                    className="form-input-premium tshirt-form-input"
                                                    type="number"
                                                    name="quantity"
                                                    min="1"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    style={{ fontWeight: 600 }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tshirt-total-card">
                                        <div className="tshirt-total-content">
                                            <div>
                                                <div className="tshirt-total-label">
                                                    Total Amount
                                                </div>
                                                <div className="tshirt-total-value">
                                                    KES {formData.quantity * 1200}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="tshirt-submit-btn"
                                    >
                                        Confirm & Pay via M-Pesa
                                        <FaArrowRight className="tshirt-submit-icon" />
                                    </button>
                                </form>
                            ) : (
                                <div className="tshirt-success-container">
                                    <div className="tshirt-success-icon-box">
                                        <FaCheckCircle className="tshirt-success-icon" />
                                    </div>
                                    <h2 className="tshirt-success-title">
                                        Request Received! 🎉
                                    </h2>
                                    <p className="tshirt-success-text">
                                        We've sent an M-Pesa payment prompt to your phone. Complete the payment to confirm your order.
                                    </p>

                                    <div className="tshirt-order-summary-card">
                                        <div className="tshirt-summary-row">
                                            <span style={{ color: '#64748b' }}>Order Summary:</span>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>KES {formData.quantity * 1200}</span>
                                        </div>
                                        <div className="tshirt-progress-bar">
                                            <div className="tshirt-progress-fill" style={{ width: '66%' }} />
                                        </div>
                                        <p className="tshirt-expiration-note">
                                            ⏱️ Payment expires in 15 minutes
                                        </p>
                                    </div>

                                    <div className="tshirt-success-actions">
                                        <button
                                            className="tshirt-submit-btn"
                                            style={{ height: '48px', borderRadius: '12px' }}
                                            onClick={() => setSubTab('history')}
                                        >
                                            View Order Status →
                                        </button>
                                        <button
                                            className="tshirt-btn-secondary"
                                            onClick={() => setIsSubmitted(false)}
                                        >
                                            ← Continue Shopping
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* History Sub-tab */
                    <div className="animate-slide-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3>Order Tracking</h3>
                            <div style={{ padding: '8px 16px', background: `${jumuiyaColor}10`, color: jumuiyaColor, borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem' }}>
                                {orders.length} ACTIVE REQUESTS
                            </div>
                        </div>

                        {orders.length === 0 ? (
                            <div className="empty-tab-state" style={{ padding: '80px 20px', background: 'white' }}>
                                <FaTshirt className="empty-icon" style={{ opacity: 0.2 }} />
                                <h3>No orders yet</h3>
                                <p>You haven't placed any T-shirt orders for {jumuiyaName} yet.</p>
                                <button className="btn-premium primary" style={{ marginTop: '24px' }} onClick={() => setSubTab('order')}>
                                    Explore Wear
                                </button>
                            </div>
                        ) : (
                            <div className="premium-table-wrap" style={{ background: 'white' }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Recipient</th>
                                            <th>Ref Number</th>
                                            <th>Size/Qty</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.holderName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ordered on {new Date(order.submittedAt).toLocaleDateString()}</div>
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.id}</td>
                                                <td>
                                                    <span style={{ padding: '4px 12px', background: 'var(--bg-soft)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{order.size}</span>
                                                    <span style={{ marginLeft: '8px', color: '#64748b' }}>×{order.quantity}</span>
                                                </td>
                                                <td>
                                                    <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <FaCheckCircle /> Processed
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            setLastOrder(order);
                                                            setShowReceipt(true);
                                                        }}
                                                        className="btn-premium"
                                                        style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'white', border: '1px solid #e2e8f0', margin: '0 auto' }}
                                                    >
                                                        <FaPrint style={{ marginRight: '8px' }} /> Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Digital Receipt Modal */}
            {showReceipt && lastOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                    <div className="animate-slide-up" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '32px 32px 20px', textAlign: 'center', borderBottom: '2px dashed #f1f5f9' }}>
                            <div style={{ width: '64px', height: '64px', background: jumuiyaColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
                                <FaCheckCircle />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Transaction Receipt</h3>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Official {jumuiyaName} Order</p>
                        </div>

                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>ORDER REF:</span>
                                <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>{lastOrder.id}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Holder</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{lastOrder.holderName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Payer</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{lastOrder.payerName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Phone</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{lastOrder.phone}</span>
                                </div>
                                <div style={{ height: '1px', background: '#e2e8f0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Spec ({lastOrder.size}) × {lastOrder.quantity}</span>
                                    <span style={{ color: jumuiyaColor, fontWeight: 800, fontSize: '1.2rem' }}>PAID</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <button className="btn-premium primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>
                                    <FaDownload style={{ marginRight: '8px' }} /> Save
                                </button>
                                <button className="btn-premium" style={{ flex: 1, justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }} onClick={() => setShowReceipt(false)}>
                                    Close
                                </button>
                            </div>

                            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                                {new Date(lastOrder.submittedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TshirtsTab;
