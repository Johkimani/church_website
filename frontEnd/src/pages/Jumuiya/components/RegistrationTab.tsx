import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { FaCheckCircle, FaPhoneAlt, FaMoneyBillWave, FaExclamationCircle } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './TabsSystem.css';

interface RegistrationTabProps {
    jumuiyaId: string;
    jumuiyaName: string;
    jumuiyaColor?: string;
}

const REGISTRATION_FEE = 50;

interface UnregisteredMember {
    member_id: string;
    first_name: string;
    last_name: string;
    email: string;
    year_of_study: string;
}

const RegistrationTab: React.FC<RegistrationTabProps> = ({ jumuiyaId, jumuiyaName, jumuiyaColor = 'var(--primary)' }) => {
    const [regType, setRegType] = useState<'self' | 'bulk'>('self');
    const [selfPhone, setSelfPhone] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [bulkResults, setBulkResults] = useState<{ count: number; message: string } | null>(null);
    const { user, login } = useAuth();
    const { resetData } = useData();

    // Bulk Registration State
    const [unregisteredMembers, setUnregisteredMembers] = useState<UnregisteredMember[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingUnregistered, setIsLoadingUnregistered] = useState(false);

    const baseUrl = import.meta.env.VITE_SERVER_URI || 'http://localhost:3000';

    React.useEffect(() => {
        if (regType === 'bulk') {
            fetchUnregistered();
        }
    }, [regType]);

    const fetchUnregistered = async () => {
        try {
            setIsLoadingUnregistered(true);
            const response = await axios.get(`${baseUrl}/api/jumuiya-members/unregistered`);
            if (response.data.success) {
                setUnregisteredMembers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching unregistered:", error);
        } finally {
            setIsLoadingUnregistered(false);
        }
    };

    const handleSelfSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Please login first to register");
            return;
        }

        try {
            const response = await axios.post(`${baseUrl}/api/jumuiya-members`, {
                member_id: user.member_id,
                jumuiya_id: jumuiyaId
            });

            if (response.data.success) {
                // Update local auth state to include the new jumuiya_id
                const updatedUser = { ...user, jumuiya_id: jumuiyaId };
                const token = localStorage.getItem('token') || '';
                login(updatedUser, token);
                setIsSubmitted(true);
                resetData(); // Refresh global data
            } else {
                alert(response.data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred during registration. Please try again.");
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMemberIds.length === 0) {
            alert("Please select at least one member");
            return;
        }

        try {
            const response = await axios.post(`${baseUrl}/api/jumuiya-members/bulk-join`, {
                member_ids: selectedMemberIds,
                jumuiya_id: jumuiyaId
            });

            if (response.data.success) {
                setBulkResults({ 
                    count: response.data.count, 
                    message: response.data.message 
                });
                setIsSubmitted(true);
                setSelectedMemberIds([]);
                resetData(); // Refresh global data
            }
        } catch (error) {
            console.error("Bulk registration error:", error);
            alert("Failed to register members in bulk.");
        }
    };

    const toggleMemberSelection = (id: string) => {
        setSelectedMemberIds(prev => 
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    if (isSubmitted) {
        return (
            <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
                <div className="tab-card glass-card animate-fade" style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
                    <FaCheckCircle style={{ fontSize: '4rem', color: '#10b981', marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
                        {bulkResults ? "Registration Complete!" : "Registration Successful!"}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
                        {bulkResults 
                            ? `${bulkResults.count} members have been successfully registered to ${jumuiyaName}.` 
                            : `Welcome to ${jumuiyaName}! A payment prompt has been sent to your M-Pesa number {selfPhone} to complete the fee payment.`
                        }
                    </p>
                    <button className="btn-premium primary" onClick={() => {
                        setIsSubmitted(false);
                        setBulkResults(null);
                        if (regType === 'bulk') fetchUnregistered();
                    }}>
                        {bulkResults ? "Register More" : "View Community Details"}
                    </button>
                </div>
            </div>
        );
    }

    const isAlreadyMember = user?.jumuiya_id === jumuiyaId;

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Community Registration</h1>
                    <p className="page-description">
                        Become a part of {jumuiyaName} or add others to our thriving community.
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-soft)', padding: '6px', borderRadius: 'var(--rs)' }}>
                    <button 
                        className={`btn-premium ${regType === 'self' ? 'primary' : ''}`}
                        style={{ flex: 1, padding: '10px', fontSize: '0.9rem', boxShadow: 'none' }}
                        onClick={() => setRegType('self')}
                    >
                        Register Self
                    </button>
                    <button 
                        className={`btn-premium ${regType === 'bulk' ? 'primary' : ''}`}
                        style={{ flex: 1, padding: '10px', fontSize: '0.9rem', boxShadow: 'none' }}
                        onClick={() => setRegType('bulk')}
                    >
                        Register Others
                    </button>
                </div>

                <div className="tab-card glass-card animate-fade">
                    {regType === 'self' ? (
                        isAlreadyMember ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <FaCheckCircle style={{ fontSize: '3rem', color: '#10b981', marginBottom: '16px' }} />
                                <h3>You're all set!</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>You are already a registered member of {jumuiyaName}.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSelfSubmit}>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Individual Registration</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confirm your details and provide an M-Pesa number for payment.</p>
                                </div>

                                <div className="form-field-group">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>MEMBER NAME</label>
                                    <div className="form-input-premium" style={{ background: 'var(--bg-soft)', color: 'var(--text-muted)', border: 'none' }}>
                                        {user ? `${user.member_id} (${user.email})` : 'Guest User'}
                                    </div>
                                </div>

                                <div className="form-field-group">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>M-PESA PHONE NUMBER</label>
                                    <div style={{ position: 'relative' }}>
                                        <FaPhoneAlt style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="form-input-premium"
                                            style={{ paddingLeft: '44px' }}
                                            type="tel"
                                            value={selfPhone}
                                            onChange={(e) => setSelfPhone(e.target.value)}
                                            required
                                            placeholder="07XX XXX XXX"
                                        />
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-soft)', padding: '20px', borderRadius: 'var(--rs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FaMoneyBillWave style={{ color: jumuiyaColor, fontSize: '1.25rem' }} />
                                        <span style={{ fontWeight: 600 }}>Registration Fee</span>
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: jumuiyaColor }}>KES {REGISTRATION_FEE}</div>
                                </div>

                                <button type="submit" className="btn-premium primary" style={{ width: '100%', justifyContent: 'center' }} disabled={!user}>
                                    Pay & Complete Registration
                                </button>
                            </form>
                        )
                    ) : (
                        <div className="bulk-registration">
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Register Multiple Members</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Select members who are not yet registered to any community.
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <input 
                                    type="text" 
                                    className="form-input-premium" 
                                    placeholder="Search by name or member ID..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ marginBottom: '16px' }}
                                />
                                
                                <div style={{ 
                                    maxHeight: '300px', 
                                    overflowY: 'auto', 
                                    border: '1px solid var(--border-light)', 
                                    borderRadius: 'var(--rs)',
                                    marginBottom: '20px'
                                }}>
                                    {isLoadingUnregistered ? (
                                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading unregistered members...</div>
                                    ) : (unregisteredMembers.filter(m => 
                                        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        m.member_id.toLowerCase().includes(searchQuery.toLowerCase())
                                    )).length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No unregistered members found.</div>
                                    ) : (
                                        (unregisteredMembers.filter(m => 
                                            `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            m.member_id.toLowerCase().includes(searchQuery.toLowerCase())
                                        )).map(m => (
                                            <div 
                                                key={m.member_id}
                                                onClick={() => toggleMemberSelection(m.member_id)}
                                                style={{ 
                                                    padding: '12px 16px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border-light)',
                                                    background: selectedMemberIds.includes(m.member_id) ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedMemberIds.includes(m.member_id)}
                                                    onChange={() => {}} // Handled by div click
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.member_id} • {m.email}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                background: 'var(--bg-soft)', 
                                padding: '16px', 
                                borderRadius: 'var(--rs)',
                                marginBottom: '24px'
                            }}>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <strong>{selectedMemberIds.length}</strong> members selected
                                </div>
                                <div style={{ fontWeight: 700, color: jumuiyaColor }}>
                                    Total: KES {selectedMemberIds.length * REGISTRATION_FEE}
                                </div>
                            </div>

                            <button 
                                className="btn-premium primary" 
                                style={{ width: '100%', justifyContent: 'center' }} 
                                disabled={selectedMemberIds.length === 0}
                                onClick={handleBulkSubmit}
                            >
                                Register Selected ({selectedMemberIds.length})
                            </button>
                        </div>
                    )
}
                </div>

                <div style={{
                    marginTop: '32px',
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: 'var(--rs)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    border: '1px solid var(--border-light)'
                }}>
                    <FaExclamationCircle style={{ flexShrink: 0, marginTop: '3px' }} />
                    <p>Registration fees are non-refundable and contribute towards community events, charity work, and administrative costs.</p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationTab;
