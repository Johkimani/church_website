import React, { useState } from 'react';
import { FaTshirt, FaShoppingCart } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
}

const CommunityTshirtsTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'orders'>('shop');
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', size: 'M', quantity: 1 });
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">T-Shirts</h1>
          <p className="page-description">{moduleName} merchandise</p>
        </div>
      </div>

      <div className="sub-tab-bar">
        <button
          className={`sub-tab ${activeSubTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('shop')}
        >
          <FaTshirt /> Shop Wear
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('orders')}
        >
          <FaShoppingCart /> My Orders
        </button>
      </div>

      {activeSubTab === 'shop' && (
        <div className="tshirt-shop">
          <div className="tshirt-stats">
            <div className="stat-card" style={{ borderColor: `${color}30` }}>
              <span className="stat-value" style={{ color }}>KES 1,200</span>
              <span className="stat-label">Price</span>
            </div>
            <div className="stat-card" style={{ borderColor: `${color}30` }}>
              <span className="stat-value" style={{ color }}>S – XXL</span>
              <span className="stat-label">Sizes</span>
            </div>
            <div className="stat-card" style={{ borderColor: `${color}30` }}>
              <span className="stat-value" style={{ color }}>3–5 Days</span>
              <span className="stat-label">Delivery</span>
            </div>
          </div>

          {!showOrderForm ? (
            <button className="btn-premium primary" onClick={() => setShowOrderForm(true)}>
              <FaTshirt /> Order Now
            </button>
          ) : (
            <form className="order-form" onSubmit={e => { e.preventDefault(); alert('Order submitted!'); setShowOrderForm(false); }}>
              <h3 className="form-title">Place Order</h3>
              <div className="form-group">
                <label>Recipient Name</label>
                <input required value={orderForm.name} onChange={e => setOrderForm({ ...orderForm, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input required type="tel" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} placeholder="0712 345 678" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Size</label>
                  <select value={orderForm.size} onChange={e => setOrderForm({ ...orderForm, size: e.target.value })}>
                    <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min={1} max={10} value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} />
                </div>
              </div>
              <div className="order-total">
                Total: <strong>KES {(1200 * orderForm.quantity).toLocaleString()}</strong>
              </div>
              <button type="submit" className="btn-premium primary full-width">Confirm & Pay via M-Pesa</button>
              <button type="button" className="btn-premium secondary full-width" onClick={() => setShowOrderForm(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}

      {activeSubTab === 'orders' && (
        <div className="empty-state">
          <FaShoppingCart className="empty-icon" />
          <p>No orders yet.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityTshirtsTab;
