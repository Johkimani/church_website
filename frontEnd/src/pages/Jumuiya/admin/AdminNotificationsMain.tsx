import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FaTrash, FaPlus, FaBell, FaFilter } from 'react-icons/fa';
import type { Notification } from '../data/jumuiyaData';
import './Admin.css';

const AdminNotificationsMain: React.FC = () => {
    const { jumuiyaList, updateJumuiya } = useData();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<Notification['type']>('info');
    const [selectedJumuiyaId, setSelectedJumuiyaId] = useState<string>('all');
    const [filterJumuiyaId, setFilterJumuiyaId] = useState<string>('all');
    const [postedBy, setPostedBy] = useState('Admin');

    const handleAddNotification = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && message.trim()) {
            const newNotification: Notification = {
                id: Date.now().toString(),
                title,
                message,
                type,
                date: new Date().toISOString(),
                postedBy
            };

            if (selectedJumuiyaId === 'all') {
                // Post to all Jumuiyas
                jumuiyaList.forEach((jumuiya) => {
                    const updatedNotifications = [
                        newNotification,
                        ...(jumuiya.notifications || [])
                    ];
                    updateJumuiya(jumuiya.id, { notifications: updatedNotifications });
                });
            } else {
                // Post to specific Jumuiya
                const jumuiya = jumuiyaList.find(j => j.id === selectedJumuiyaId);
                if (jumuiya) {
                    const updatedNotifications = [
                        newNotification,
                        ...(jumuiya.notifications || [])
                    ];
                    updateJumuiya(selectedJumuiyaId, { notifications: updatedNotifications });
                }
            }

            setTitle('');
            setMessage('');
            setType('info');
            setSelectedJumuiyaId('all');
        }
    };

    const handleDeleteNotification = (jumuiyaId: string, notificationId: string) => {
        if (window.confirm('Delete this notification?')) {
            const jumuiya = jumuiyaList.find(j => j.id === jumuiyaId);
            if (jumuiya) {
                const updatedNotifications = (jumuiya.notifications || []).filter(
                    n => n.id !== notificationId
                );
                updateJumuiya(jumuiyaId, { notifications: updatedNotifications });
            }
        }
    };

    // Get all notifications across all Jumuiyas
    const getAllNotifications = () => {
        const allNotifications: Array<{ jumuiya: any; notification: Notification }> = [];
        
        jumuiyaList.forEach((jumuiya) => {
            if (filterJumuiyaId === 'all' || jumuiya.id === filterJumuiyaId) {
                (jumuiya.notifications || []).forEach((notification) => {
                    allNotifications.push({ jumuiya, notification });
                });
            }
        });

        // Sort by date (newest first)
        return allNotifications.sort((a, b) => 
            new Date(b.notification.date).getTime() - new Date(a.notification.date).getTime()
        );
    };

    const allNotifications = getAllNotifications();

    return (
        <div className="admin-notifications-main">
            <div className="admin-card">
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaBell style={{ color: 'var(--primary)' }} />
                        Manage Notifications & Announcements
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Create and manage announcements for specific Jumuiyas or broadcast to all communities
                    </p>
                </div>

                {/* Post New Notification Form */}
                <form onSubmit={handleAddNotification} className="notification-form" style={{ 
                    marginBottom: '40px', 
                    padding: '24px', 
                    background: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Post New Announcement</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                Target Jumuiya
                            </label>
                            <select
                                value={selectedJumuiyaId}
                                onChange={(e) => setSelectedJumuiyaId(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--border-color)',
                                    background: 'white'
                                }}
                            >
                                <option value="all">🌍 All Jumuiyas (Broadcast)</option>
                                {jumuiyaList.map((jumuiya) => (
                                    <option key={jumuiya.id} value={jumuiya.id}>
                                        {jumuiya.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                Posted By
                            </label>
                            <input
                                type="text"
                                value={postedBy}
                                onChange={(e) => setPostedBy(e.target.value)}
                                placeholder="Admin name..."
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--border-color)' 
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title..."
                            style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-color)' 
                            }}
                            required
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Notification details..."
                                rows={3}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--border-color)',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--border-color)',
                                    background: 'white',
                                    height: '100%'
                                }}
                            >
                                <option value="info">ℹ️ Info</option>
                                <option value="success">✅ Success</option>
                                <option value="warning">⚠️ Warning</option>
                                <option value="urgent">🚨 Urgent</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            padding: '12px 32px', 
                            borderRadius: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <FaPlus /> Post Announcement
                    </button>
                </form>

                {/* Filter Section */}
                <div style={{ 
                    marginBottom: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <FaBell /> All Notifications ({allNotifications.length})
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaFilter style={{ color: 'var(--text-secondary)' }} />
                        <select
                            value={filterJumuiyaId}
                            onChange={(e) => setFilterJumuiyaId(e.target.value)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)',
                                background: 'white',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="all">All Jumuiyas</option>
                            {jumuiyaList.map((jumuiya) => (
                                <option key={jumuiya.id} value={jumuiya.id}>
                                    {jumuiya.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {allNotifications.length > 0 ? (
                        allNotifications.map(({ jumuiya, notification }) => (
                            <div 
                                key={`${jumuiya.id}-${notification.id}`} 
                                className="notification-card"
                                style={{ 
                                    padding: '20px', 
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    borderLeft: `4px solid ${
                                        notification.type === 'urgent' ? '#ef4444' : 
                                        notification.type === 'warning' ? '#f59e0b' : 
                                        notification.type === 'success' ? '#10b981' : 
                                        jumuiya.color || 'var(--primary)'
                                    }`
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span 
                                            style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                background: jumuiya.color || 'var(--primary)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {jumuiya.name}
                                        </span>
                                        <span 
                                            style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                background: 
                                                    notification.type === 'urgent' ? '#fef2f2' : 
                                                    notification.type === 'warning' ? '#fffbeb' : 
                                                    notification.type === 'success' ? '#f0fdf4' : 
                                                    '#eff6ff',
                                                color: 
                                                    notification.type === 'urgent' ? '#ef4444' : 
                                                    notification.type === 'warning' ? '#f59e0b' : 
                                                    notification.type === 'success' ? '#10b981' : 
                                                    '#3b82f6',
                                                fontSize: '0.7rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            {notification.type.toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(notification.date).toLocaleString('en-GB', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                                        {notification.title}
                                    </h4>
                                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {notification.message}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        Posted by: {notification.postedBy}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteNotification(jumuiya.id, notification.id)}
                                    style={{ 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        color: '#ef4444', 
                                        border: 'none', 
                                        padding: '10px', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'all 0.2s'
                                    }}
                                    title="Delete notification"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#ef4444';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        e.currentTarget.style.color = '#ef4444';
                                    }}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '64px 32px', 
                            color: 'var(--text-secondary)', 
                            background: 'var(--bg-secondary)',
                            borderRadius: '16px',
                            border: '2px dashed var(--border-color)'
                        }}>
                            <FaBell style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px 0' }}>
                                No notifications posted yet
                            </p>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                Create your first announcement using the form above
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsMain;
