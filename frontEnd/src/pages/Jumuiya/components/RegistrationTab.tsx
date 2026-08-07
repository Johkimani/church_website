import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { memberService, JumuiyaRosterMember } from '../../../api/jumuiyaMemberService';
import { FaUserPlus, FaUsers, FaCheckCircle, FaPhoneAlt, FaMoneyBillWave, FaExclamationCircle, FaStamp, FaSpinner } from 'react-icons/fa';
import './TabsSystem.css';
import ChoirJoinForm from '../choir/ChoirJoinForm';
import DancersJoinForm from '../choir/DancersJoinForm';
import CharismaticJoinForm from '../charismatic/CharismaticJoinForm';
import StampCard from './StampCard';

interface RegistrationTabProps {
    jumuiyaName: string;
    jumuiyaId?: string;
    jumuiyaColor?: string;
}

type RegistrationType = 'self' | 'bulk';

const REGISTRATION_FEE = 50;

const RegistrationTab: React.FC<RegistrationTabProps> = ({ jumuiyaName, jumuiyaId, jumuiyaColor = 'var(--primary)' }) => {
    const { user } = useAuth();
    const [members, setMembers] = useState<JumuiyaRosterMember[]>([]);
    const [registrationType, setRegistrationType] = useState<RegistrationType>('self');
    const [selfPhone, setSelfPhone] = useState('');
    const [bulkPhone, setBulkPhone] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showStampCard, setShowStampCard] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        if (jumuiyaId) {
            (async () => {
                try {
                    const res = await memberService.getJumuiyaRoster(jumuiyaId);
                    if (!cancelled && res?.success) setMembers(res.data || []);
                } catch { /* roster is best-effort for the registration form */ }
            })();
        }
        return () => { cancelled = true; };
    }, [jumuiyaId]);

    const currentMember = useMemo(() => {
        return members.find(m => m.id === user?.member_id && m.jumuiya_id === jumuiyaId);
    }, [members, user, jumuiyaId]);

    const unregisteredMembers = useMemo(() => {
        return members.filter(m => !m.is_registered);
    }, [members]);

    const handleSelfSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.member_id || !jumuiyaId) return;
        setIsProcessing(true);
        setError('');
        try {
            const res = await memberService.registerWithPayment({
                member_id: user.member_id,
                jumuiya_id: jumuiyaId,
                phoneNumber: selfPhone,
                amount: REGISTRATION_FEE,
            });
            setSuccessMessage(res?.message || 'Registration complete!');
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMemberIds.length === 0 || !jumuiyaId) return;
        setIsProcessing(true);
        setError('');
        try {
            const res = await memberService.bulkRegisterWithPayment({
                member_ids: selectedMemberIds,
                jumuiya_id: jumuiyaId,
                phoneNumber: bulkPhone,
                amount: REGISTRATION_FEE * selectedMemberIds.length,
            });
            setSuccessMessage(res?.message || `${selectedMemberIds.length} member(s) registered!`);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleMemberSelection = (id: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    if (showStampCard) {
        return (
            <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
                <div className="tab-card glass-card animate-fade" style={{ padding: '32px', maxWidth: '700px', margin: '40px auto' }}>
                    <StampCard
                        jumuiyaId={jumuiyaId || ''}
                        jumuiyaName={jumuiyaName}
                        jumuiyaColor={jumuiyaColor}
                        onClose={() => setShowStampCard(false)}
                    />
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
                <div className="tab-card glass-card animate-fade" style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
                    <FaCheckCircle style={{ fontSize: '4rem', color: '#22c55e', marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Registration Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1.1rem' }}>
                        {successMessage}
                    </p>
                    <p style={{ color: '#22c55e', marginBottom: '32px', fontSize: '0.9rem', fontWeight: 600 }}>
                        A confirmation email has been sent to your registered email address.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-premium primary" onClick={() => setShowStampCard(true)}>
                            <FaStamp style={{ marginRight: '8px' }} /> View Stamp Card
                        </button>
                        <button className="btn-premium" onClick={() => { setIsSubmitted(false); setSuccessMessage(''); }}>
                            Back to Registration
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Join {jumuiyaName}</h1>
                    <p className="page-description">
                        Become a part of our thriving community. Registration is simple and helps us grow together.
                    </p>
                </div>
            </div>

            <div className="toggle-wrapper animate-fade">
                <button
                    className={`toggle-item ${registrationType === 'self' ? 'active' : ''}`}
                    onClick={() => { setRegistrationType('self'); setError(''); }}
                >
                    <FaUserPlus /> Self Registration
                </button>
                <button
                    className={`toggle-item ${registrationType === 'bulk' ? 'active' : ''}`}
                    onClick={() => { setRegistrationType('bulk'); setError(''); }}
                >
                    <FaUsers /> Bulk Registration
                </button>
            </div>

            {error && (
                <div style={{
                    maxWidth: '800px', margin: '0 auto 20px', padding: '16px 20px',
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--rs)',
                    color: '#dc2626', fontSize: '0.9rem', fontWeight: 500
                }}>
                    {error}
                </div>
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {registrationType === 'self' ? (
                    <div className="tab-card glass-card animate-fade">
                        {currentMember?.is_registered ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <FaCheckCircle style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '16px' }} />
                                <h3>You're all set!</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>You are already a registered member of {jumuiyaName}.</p>
                                <button className="btn-premium" style={{ marginTop: '16px' }} onClick={() => setShowStampCard(true)}>
                                    <FaStamp style={{ marginRight: '8px' }} /> View Stamp Card
                                </button>
                            </div>
                        ) : (
                            (jumuiyaId === 'st-thomas-aquinas-choir' || jumuiyaId === 'choir') ? (
                                <ChoirJoinForm moduleId={jumuiyaId || 'choir'} />
                            ) : jumuiyaId === 'dancers' ? (
                                <DancersJoinForm moduleId="dancers" />
                            ) : jumuiyaId === 'charismatic' ? (
                                <CharismaticJoinForm moduleId="charismatic" />
                            ) : (
                                <form onSubmit={handleSelfSubmit}>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Individual Registration</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confirm your details and provide an M-Pesa number for payment.</p>
                                </div>

                                <div className="form-field-group">
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>MEMBER NAME</label>
                                    <div className="form-input-premium" style={{ background: 'var(--bg-soft)', color: 'var(--text-muted)', border: 'none' }}>
                                        {currentMember?.name ?? user?.name ?? 'Member'}
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
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-soft)', padding: '20px', borderRadius: 'var(--rs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FaMoneyBillWave style={{ color: 'var(--jumuiya-color)', fontSize: '1.25rem' }} />
                                        <span style={{ fontWeight: 600 }}>Registration Fee</span>
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--jumuiya-color)' }}>KES {REGISTRATION_FEE}</div>
                                </div>

                                <button type="submit" className="btn-premium primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <><FaSpinner className="animate-spin" style={{ marginRight: '8px' }} /> Please enter your M-Pesa PIN...</>
                                    ) : (
                                        'Pay & Complete Registration'
                                    )}
                                </button>
                                </form>
                            )
                        )}
                    </div>
                ) : (
                    <div className="tab-card glass-card animate-fade">
                        <form onSubmit={handleBulkSubmit}>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Register Multiple Members</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select unregistered members to sponsor their registration.</p>
                            </div>

                            <div className="form-field-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>SELECT MEMBERS</label>
                                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--rs)', maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-soft)' }}>
                                    {unregisteredMembers.length === 0 ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <FaCheckCircle style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }} />
                                            <p>All members are registered!</p>
                                        </div>
                                    ) : (
                                        unregisteredMembers.map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => !isProcessing && toggleMemberSelection(String(member.id))}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderBottom: '1px solid var(--border-light)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    background: selectedMemberIds.includes(String(member.id)) ? 'white' : 'transparent',
                                                    transition: 'var(--t-fast)',
                                                    opacity: isProcessing ? 0.6 : 1,
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    border: `2px solid ${selectedMemberIds.includes(String(member.id)) ? 'var(--jumuiya-color)' : 'var(--border)'}`,
                                                    borderRadius: '4px',
                                                    background: selectedMemberIds.includes(String(member.id)) ? 'var(--jumuiya-color)' : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {selectedMemberIds.includes(String(member.id)) && <FaCheckCircle />}
                                                </div>
                                                <span style={{ flex: 1, fontWeight: 500 }}>{member.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="form-field-group" style={{ marginTop: '24px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYER'S PHONE NUMBER</label>
                                <div style={{ position: 'relative' }}>
                                    <FaPhoneAlt style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="form-input-premium"
                                        style={{ paddingLeft: '44px' }}
                                        type="tel"
                                        value={bulkPhone}
                                        onChange={(e) => setBulkPhone(e.target.value)}
                                        required
                                        placeholder="07XX XXX XXX"
                                        disabled={selectedMemberIds.length === 0 || isProcessing}
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-soft)', padding: '20px', borderRadius: 'var(--rs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Total for {selectedMemberIds.length} members</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>KES {REGISTRATION_FEE} each</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--jumuiya-color)' }}>KES {selectedMemberIds.length * REGISTRATION_FEE}</div>
                            </div>

                            <button
                                type="submit"
                                className="btn-premium primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                disabled={selectedMemberIds.length === 0 || isProcessing}
                            >
                                {isProcessing ? (
                                    <><FaSpinner className="animate-spin" style={{ marginRight: '8px' }} /> Please enter your M-Pesa PIN...</>
                                ) : (
                                    `Pay KES ${selectedMemberIds.length * REGISTRATION_FEE} & Complete`
                                )}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{
                    marginTop: '32px',
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    background: 'color-mix(in srgb, var(--jumuiya-color), white 90%)',
                    borderRadius: 'var(--rs)',
                    color: 'color-mix(in srgb, var(--jumuiya-color), black 20%)',
                    fontSize: '0.9rem',
                    border: '1px solid color-mix(in srgb, var(--jumuiya-color), white 80%)'
                }}>
                    <FaExclamationCircle style={{ flexShrink: 0, marginTop: '3px', color: 'var(--jumuiya-color)' }} />
                    <p>Registration fees are non-refundable and contribute towards community events, charity work, and administrative costs.</p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationTab;
