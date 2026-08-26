import React, { useState, useEffect, useCallback } from 'react';
import type { TshirtOrder } from '../data/jumuiyaData';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../api/axiosInstance';
import {
  FaTshirt,
  FaShoppingCart,
  FaCheckCircle,
  FaUser,
  FaPhone,
  FaRuler,
  FaLayerGroup,
  FaArrowRight,
  FaPrint,
  FaDownload,
  FaIdCard,
  FaMoneyBillWave,
  FaCopy,
  FaCheck,
  FaClock,
  FaTimesCircle,
  FaBoxOpen,
  FaInfoCircle,
  FaReceipt,
  FaSignInAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import tshirtMockup from '../../../assets/Images/jumuiya_tshirt.png';
import './TabsSystem.css';
import './TshirtsTab.css';

interface TshirtsTabProps {
  jumuiyaId: string;
  jumuiyaName: string;
  orders?: TshirtOrder[];
  jumuiyaColor: string;
}

interface PaymentSettings {
  payment_phone: string;
  account_name: string;
  payment_instructions: string;
  unit_price: number;
  is_active: boolean;
  collection_date?: string;
  tshirt_image_url?: string;
}

const TshirtsTab: React.FC<TshirtsTabProps> = ({
  jumuiyaId,
  jumuiyaName,
  jumuiyaColor,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [subTab, setSubTab] = useState<'order' | 'history'>('order');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Dynamic Payment Settings & Pricing
  const [settings, setSettings] = useState<PaymentSettings>({
    payment_phone: '',
    account_name: '',
    payment_instructions: 'Send payment via M-Pesa to the designated Vice-Chairperson mobile money number and enter your transaction code below.',
    unit_price: 1200,
    is_active: true,
    collection_date: '',
    tshirt_image_url: '',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // User Orders
  const [userOrders, setUserOrders] = useState<TshirtOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    holderName: user?.name || '',
    payerName: user?.name || '',
    phone: user?.phone || '',
    size: 'M' as TshirtOrder['size'],
    quantity: 1,
    mpesaCode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastOrder, setLastOrder] = useState<TshirtOrder | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sizes: TshirtOrder['size'][] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await apiClient.get(`/jumuiya-tshirts/${jumuiyaId}/settings`);
      if (res.data && res.data.success) {
        setSettings({
          payment_phone: res.data.data.payment_phone || '',
          account_name: res.data.data.account_name || '',
          payment_instructions: res.data.data.payment_instructions || '',
          unit_price: Number(res.data.data.unit_price) || 1200,
          is_active: res.data.data.is_active !== undefined ? res.data.data.is_active : true,
          collection_date: res.data.data.collection_date ? res.data.data.collection_date.split('T')[0] : '',
          tshirt_image_url: res.data.data.tshirt_image_url || '',
        });
      }
    } catch (err) {
      console.error('Error loading tshirt payment settings', err);
    } finally {
      setLoadingSettings(false);
    }
  }, [jumuiyaId]);

  // Fetch User Orders
  const fetchUserOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const res = await apiClient.get(`/jumuiya-tshirts/${jumuiyaId}/my-orders`);
      if (res.data && res.data.success) {
        const mappedOrders: TshirtOrder[] = (res.data.data || []).map((o: any) => ({
          id: String(o.id),
          holderName: o.holder_name,
          payerName: o.payer_name,
          phone: o.phone,
          size: o.size,
          quantity: o.quantity,
          unitPrice: Number(o.unit_price) || 1200,
          totalAmount: Number(o.total_amount) || Number(o.unit_price || 1200) * o.quantity,
          mpesaCode: o.mpesa_code,
          status: o.status,
          rejectionReason: o.rejection_reason,
          confirmedAt: o.confirmed_at,
          completedAt: o.completed_at,
          submittedAt: o.submitted_at,
        }));
        setUserOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Error fetching user orders', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [jumuiyaId, isAuthenticated]);

  useEffect(() => {
    fetchSettings();
    if (isAuthenticated) {
      fetchUserOrders();
    }
  }, [fetchSettings, fetchUserOrders, isAuthenticated]);

  // Sync logged in user details if form is untouched
  useEffect(() => {
    if (user && !formData.holderName) {
      setFormData(prev => ({
        ...prev,
        holderName: user.name || '',
        payerName: user.name || '',
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const copyPhoneNumber = () => {
    if (!settings.payment_phone) return;
    navigator.clipboard.writeText(settings.payment_phone);
    setCopiedPhone(true);
    toast.success('Mobile money number copied!');
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.holderName.trim()) newErrors.holderName = 'Recipient name is required';
    if (!formData.phone.trim()) newErrors.phone = 'M-Pesa phone number is required';
    if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    if (!formData.mpesaCode.trim()) newErrors.mpesaCode = 'M-Pesa transaction reference code is required for validation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in with your member account to place an order.');
      navigate('/login');
      return;
    }

    if (validate()) {
      setIsSubmitting(true);
      try {
        const res = await apiClient.post(`/jumuiya-tshirts/${jumuiyaId}/orders`, {
          holder_name: formData.holderName,
          payer_name: formData.payerName || formData.holderName,
          phone: formData.phone,
          size: formData.size,
          quantity: formData.quantity,
          mpesa_code: formData.mpesaCode,
        });

        if (res.data && res.data.success) {
          const raw = res.data.data;
          const createdOrder: TshirtOrder = {
            id: String(raw.id),
            holderName: raw.holder_name,
            payerName: raw.payer_name,
            phone: raw.phone,
            size: raw.size,
            quantity: raw.quantity,
            unitPrice: Number(raw.unit_price) || settings.unit_price,
            totalAmount: Number(raw.total_amount) || settings.unit_price * raw.quantity,
            mpesaCode: raw.mpesa_code,
            status: raw.status || 'pending_confirmation',
            submittedAt: raw.submitted_at,
          };
          setLastOrder(createdOrder);
          setIsSubmitted(true);
          fetchUserOrders();
          toast.success('T-Shirt order submitted for Vice-Chair confirmation!');
        }
      } catch (err: any) {
        console.error('Failed to submit order', err);
        toast.error(err.response?.data?.error || 'Failed to submit order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const _c = (s: string) => (jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s);

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">{jumuiyaName} Official Wear</h1>
          <p className="page-description">
            Get your official {jumuiyaName} T-shirt, wear your community identity, and support our ministry.
          </p>
        </div>

        {/* Sub-tab selection */}
        <div
          className="tshirt-subtabs"
          style={{
            background: 'var(--bg-soft)',
            padding: '6px',
            borderRadius: '40px',
            marginTop: '16px',
            border: '1px solid var(--border-light)',
            display: 'flex',
          }}
        >
          <button
            onClick={() => setSubTab('order')}
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: '30px',
              border: 'none',
              background: subTab === 'order' ? jumuiyaColor : 'transparent',
              color: subTab === 'order' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <FaShoppingCart /> Order T-Shirt
          </button>

          <button
            onClick={() => setSubTab('history')}
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: '30px',
              border: 'none',
              background: subTab === 'history' ? jumuiyaColor : 'transparent',
              color: subTab === 'history' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <FaIdCard /> My Orders ({userOrders.length})
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {subTab === 'order' ? (
          <div className="tshirt-order-grid">
            {/* Left: Product Showcase & Payment Instructions */}
            <div className="space-y-6">
              {/* Expected Collection Date Announcement Banner */}
              {settings.collection_date && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                    border: '1px solid #fde68a',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: '#fef3c7',
                      border: '1px solid #fcd34d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    📦
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#b45309', fontWeight: 800 }}>
                      Order Arrival &amp; Collection
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#78350f', marginTop: '2px' }}>
                      Ready for collection on {new Date(settings.collection_date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Showcase Card */}
              <div className="tab-card glass-card tshirt-showcase-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="tshirt-showcase-media" style={{ position: 'relative' }}>
                  <img
                    src={settings.tshirt_image_url || tshirtMockup}
                    alt={`${jumuiyaName} T-shirt`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback to local default mockup if remote image fails
                      (e.currentTarget as HTMLImageElement).src = tshirtMockup;
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      padding: '30px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                      color: 'white',
                    }}
                  >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '6px', fontWeight: 800 }}>
                      Official {jumuiyaName} T-Shirt
                    </h2>
                    <p style={{ color: 'white', opacity: 0.9, fontSize: '0.95rem' }}>
                      100% Premium Combed Cotton • Screen Printed Crest • Unisex Fit
                    </p>
                  </div>
                </div>

                <div className="tshirt-stat-grid" style={{ padding: '24px' }}>
                  <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: jumuiyaColor }}>
                      KES {settings.unit_price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>UNIT PRICE</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: jumuiyaColor }}>XS to XXL</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SIZES AVAILABLE</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: jumuiyaColor }}>
                      {settings.collection_date ? new Date(settings.collection_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : '3-5 Days'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                      {settings.collection_date ? 'COLLECTION' : 'EST. DELIVERY'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Mobile Money Payment Box */}
              <div
                className="tab-card glass-card"
                style={{
                  padding: '24px',
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${jumuiyaColor}15`,
                      color: jumuiyaColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                    }}
                  >
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      Payment Instructions
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Manual M-Pesa / Mobile Money Transfer
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: '#f1f5f9',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Vice-Chairperson Mobile Money Number
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
                      {settings.payment_phone || 'Contact Vice-Chair for Payment Number'}
                    </div>

                    {settings.payment_phone && (
                      <button
                        type="button"
                        onClick={copyPhoneNumber}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          background: copiedPhone ? '#059669' : jumuiyaColor,
                          color: 'white',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                      >
                        {copiedPhone ? <FaCheck /> : <FaCopy />}
                        {copiedPhone ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>

                  {settings.account_name && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                      Account Name: <strong style={{ color: '#0f172a' }}>{settings.account_name}</strong>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  {settings.payment_instructions}
                </p>
              </div>
            </div>

            {/* Right: Order Form */}
            <div className="tab-card glass-card" style={{ padding: '36px', overflow: 'hidden' }}>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="tshirt-form-header">
                    <h3 className="tshirt-form-title">Place Your Order</h3>
                    <p className="tshirt-form-desc">
                      Fill out your recipient details and M-Pesa transaction reference for validation.
                    </p>
                  </div>

                  {!isAuthenticated && (
                    <div
                      style={{
                        padding: '14px 18px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaInfoCircle style={{ color: '#2563eb' }} />
                        <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
                          Please log in to track your order in your account.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={{
                          padding: '6px 14px',
                          background: '#2563eb',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Log In
                      </button>
                    </div>
                  )}

                  <div className="tshirt-form-body">
                    {/* Recipient Name */}
                    <div className="form-field-group">
                      <label className="tshirt-form-label">
                        <FaUser style={{ color: jumuiyaColor, fontSize: '0.9rem' }} />
                        T-Shirt Recipient Name *
                      </label>
                      <input
                        className="form-input-premium tshirt-form-input"
                        name="holderName"
                        value={formData.holderName}
                        onChange={handleInputChange}
                        placeholder="e.g., John Mwangi"
                      />
                      {errors.holderName && (
                        <small className="error-text tshirt-error-hint">{errors.holderName}</small>
                      )}
                    </div>

                    {/* M-Pesa Phone Number */}
                    <div className="form-field-group">
                      <label className="tshirt-form-label">
                        <FaPhone style={{ color: jumuiyaColor, fontSize: '0.9rem' }} />
                        M-Pesa Contact Phone *
                      </label>
                      <input
                        className="form-input-premium tshirt-form-input"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g., 0712345678"
                      />
                      {errors.phone && (
                        <small className="error-text tshirt-error-hint">{errors.phone}</small>
                      )}
                    </div>

                    {/* Size & Quantity */}
                    <div className="tshirt-form-row-2col">
                      <div className="form-field-group">
                        <label className="tshirt-form-label">
                          <FaRuler style={{ color: jumuiyaColor }} />
                          Select Size
                        </label>
                        <select
                          className="form-input-premium tshirt-form-input"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                        >
                          {sizes.map((s) => (
                            <option key={s} value={s}>
                              Size {s}
                            </option>
                          ))}
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
                          max="20"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          style={{ fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    {/* M-Pesa Transaction Code */}
                    <div className="form-field-group">
                      <label className="tshirt-form-label">
                        <FaMoneyBillWave style={{ color: jumuiyaColor, fontSize: '0.9rem' }} />
                        M-Pesa Transaction Code *
                      </label>
                      <input
                        className="form-input-premium tshirt-form-input"
                        name="mpesaCode"
                        value={formData.mpesaCode}
                        onChange={handleInputChange}
                        placeholder="e.g., QK78HJ239K"
                        style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 700 }}
                      />
                      {errors.mpesaCode && (
                        <small className="error-text tshirt-error-hint">{errors.mpesaCode}</small>
                      )}
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Input the confirmation code received from M-Pesa after sending payment.
                      </span>
                    </div>
                  </div>

                  {/* Total Amount Summary */}
                  <div className="tshirt-total-card" style={{ marginTop: '20px' }}>
                    <div className="tshirt-total-content">
                      <div>
                        <div className="tshirt-total-label">Total Payable</div>
                        <div className="tshirt-total-value">
                          KES {(formData.quantity * settings.unit_price).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>
                        KES {settings.unit_price.toLocaleString()} × {formData.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !settings.is_active}
                    className="tshirt-submit-btn"
                    style={{
                      background: settings.is_active ? jumuiyaColor : '#94a3b8',
                      cursor: settings.is_active ? 'pointer' : 'not-allowed',
                      marginTop: '20px',
                    }}
                  >
                    {isSubmitting ? (
                      'Submitting Order...'
                    ) : !settings.is_active ? (
                      'Orders Temporarily Closed'
                    ) : (
                      <>
                        Submit Order for Verification
                        <FaArrowRight className="tshirt-submit-icon" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success Confirmation State */
                <div className="tshirt-success-container">
                  <div className="tshirt-success-icon-box" style={{ background: `${jumuiyaColor}15`, color: jumuiyaColor }}>
                    <FaCheckCircle className="tshirt-success-icon" style={{ color: jumuiyaColor }} />
                  </div>

                  <h2 className="tshirt-success-title">Order Submitted!</h2>
                  <p className="tshirt-success-text">
                    Your order #{lastOrder?.id} has been recorded. The {jumuiyaName} Vice-Chairperson will verify
                    your payment and confirm your order shortly.
                  </p>

                  <div className="tshirt-order-summary-card">
                    <div className="tshirt-summary-row">
                      <span style={{ color: '#64748b' }}>Recipient:</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{lastOrder?.holderName}</span>
                    </div>
                    <div className="tshirt-summary-row" style={{ marginTop: '8px' }}>
                      <span style={{ color: '#64748b' }}>Total Amount:</span>
                      <span style={{ fontWeight: 800, color: jumuiyaColor }}>
                        KES {lastOrder?.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="tshirt-summary-row" style={{ marginTop: '8px' }}>
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span style={{ fontWeight: 700, color: '#d97706', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                        ● Pending Confirmation
                      </span>
                    </div>
                  </div>

                  <div className="tshirt-success-actions">
                    <button
                      className="tshirt-submit-btn"
                      style={{ height: '48px', borderRadius: '12px', background: jumuiyaColor }}
                      onClick={() => setSubTab('history')}
                    >
                      Track Order Status →
                    </button>
                    <button
                      className="tshirt-btn-secondary"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          holderName: user?.name || '',
                          payerName: user?.name || '',
                          phone: user?.phone || '',
                          size: 'M',
                          quantity: 1,
                          mpesaCode: '',
                        });
                      }}
                    >
                      ← Place Another Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* History / My Orders Sub-tab */
          <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Order Tracking & History
              </h3>
              <div
                style={{
                  padding: '6px 16px',
                  background: `${_c('15')}`,
                  color: jumuiyaColor,
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                {userOrders.length} ORDERS
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="empty-tab-state" style={{ padding: '60px 20px', background: 'white', borderRadius: '20px' }}>
                <FaSignInAlt className="empty-icon" style={{ opacity: 0.3, color: jumuiyaColor }} />
                <h3>Sign in to view your orders</h3>
                <p>Please log in with your member account to see your order history and live updates.</p>
                <button className="btn-premium primary" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>
                  Log In Now
                </button>
              </div>
            ) : loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <FaClock style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', marginBottom: '12px' }} />
                <p>Loading your orders...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="empty-tab-state" style={{ padding: '70px 20px', background: 'white', borderRadius: '20px' }}>
                <FaTshirt className="empty-icon" style={{ opacity: 0.2 }} />
                <h3>No Orders Yet</h3>
                <p>You haven't placed any T-shirt orders for {jumuiyaName} yet.</p>
                <button
                  className="btn-premium primary"
                  style={{ marginTop: '20px', background: jumuiyaColor }}
                  onClick={() => setSubTab('order')}
                >
                  Order T-Shirt Now
                </button>
              </div>
            ) : (
              <div className="premium-table-wrap" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Ref Number</th>
                      <th>Size / Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => {
                      const isPending = order.status === 'pending_confirmation' || order.status === 'pending';
                      const isConfirmed = order.status === 'confirmed';
                      const isCompleted = order.status === 'completed';
                      const isCancelled = order.status === 'cancelled';

                      return (
                        <tr key={order.id}>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{order.holderName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {new Date(order.submittedAt || Date.now()).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </td>

                          <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                            #{order.id}
                            {order.mpesaCode && (
                              <div style={{ fontSize: '0.72rem', color: jumuiyaColor, fontWeight: 700 }}>
                                {order.mpesaCode}
                              </div>
                            )}
                          </td>

                          <td>
                            <span
                              style={{
                                padding: '4px 10px',
                                background: 'var(--bg-soft)',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              Size {order.size}
                            </span>
                            <span style={{ marginLeft: '8px', color: '#64748b', fontWeight: 600 }}>
                              × {order.quantity}
                            </span>
                          </td>

                          <td style={{ fontWeight: 800, color: '#0f172a' }}>
                            KES {(order.totalAmount || order.quantity * 1200).toLocaleString()}
                          </td>

                          <td>
                            {isPending && (
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <FaClock /> Pending Confirmation
                              </span>
                            )}
                            {isConfirmed && (
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  background: '#dbeafe',
                                  color: '#1d4ed8',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <FaCheckCircle /> Payment Confirmed
                              </span>
                            )}
                            {isCompleted && (
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <FaBoxOpen /> Received / Done
                              </span>
                            )}
                            {isCancelled && (
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                                title={order.rejectionReason}
                              >
                                <FaTimesCircle /> Cancelled
                              </span>
                            )}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setLastOrder(order);
                                setShowReceipt(true);
                              }}
                              className="btn-premium"
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.75rem',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <FaReceipt /> Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {showReceipt && lastOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
        >
          <div
            className="animate-slide-up"
            style={{
              background: 'white',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '440px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ padding: '32px 32px 20px', textAlign: 'center', borderBottom: '2px dashed #f1f5f9' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: jumuiyaColor,
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '1.4rem',
                }}
              >
                <FaCheckCircle />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                Order Receipt
              </h3>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Official {jumuiyaName} T-Shirt Order
              </p>
            </div>

            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>ORDER REF:</span>
                <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  #{lastOrder.id}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '18px',
                  background: '#f8fafc',
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Recipient</span>
                  <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>
                    {lastOrder.holderName}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Phone</span>
                  <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>{lastOrder.phone}</span>
                </div>

                {lastOrder.mpesaCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>M-Pesa Code</span>
                    <span style={{ color: jumuiyaColor, fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {lastOrder.mpesaCode}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Status</span>
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', color: jumuiyaColor }}>
                    {lastOrder.status?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>

                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Size {lastOrder.size} × {lastOrder.quantity}
                  </span>
                  <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
                    KES {(lastOrder.totalAmount || lastOrder.quantity * 1200).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button
                  className="btn-premium primary"
                  style={{ flex: 1, justifyContent: 'center', background: jumuiyaColor }}
                  onClick={() => window.print()}
                >
                  <FaPrint style={{ marginRight: '8px' }} /> Print
                </button>
                <button
                  className="btn-premium"
                  style={{ flex: 1, justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  onClick={() => setShowReceipt(false)}
                >
                  Close
                </button>
              </div>

              <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
                {new Date(lastOrder.submittedAt || Date.now()).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TshirtsTab;
