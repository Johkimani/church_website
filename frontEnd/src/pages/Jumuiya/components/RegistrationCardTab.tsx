import React from 'react';
import { FaIdCard, FaPrint, FaCheckCircle, FaRegCircle, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useJumuiyaMembers } from '../../../hooks/useJumuiyaMembers';
import './TabsSystem.css';

interface RegistrationCardTabProps {
    jumuiyaId: string;
    jumuiyaName: string;
    jumuiyaColor: string;
}

const RegistrationCardTab: React.FC<RegistrationCardTabProps> = ({ jumuiyaId, jumuiyaName, jumuiyaColor }) => {
    const { user } = useAuth();
    const { members, isLoading } = useJumuiyaMembers();

    // Find the current logged-in member in this specific Jumuiya
    const memberRecord = members.find(m => m.id === user?.member_id && m.jumuiya_id === jumuiyaId);

    if (isLoading) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <div className="animate-spin-slow" style={{ fontSize: '2rem', color: jumuiyaColor }}><FaUniversity /></div>
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Retrieving your official record...</p>
            </div>
        );
    }

    if (!memberRecord) {
        return (
            <div className="tab-card glass-card animate-fade" style={{ textAlign: 'center', padding: '64px 20px' }}>
                <div style={{ width: '80px', height: '80px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <FaIdCard style={{ fontSize: '2.5rem', color: '#ef4444' }} />
                </div>
                <h3>No Card Available</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px' }}>
                    You must be a registered member of {jumuiyaName} to access and download your official registration card.
                </p>
            </div>
        );
    }

    const semesters = [
        { id: 1, status: memberRecord.sem_1_reg },
        { id: 2, status: memberRecord.sem_2_reg },
        { id: 3, status: memberRecord.sem_3_reg },
        { id: 4, status: memberRecord.sem_4_reg },
        { id: 5, status: memberRecord.sem_5_reg },
        { id: 6, status: memberRecord.sem_6_reg },
        { id: 7, status: memberRecord.sem_7_reg },
        { id: 8, status: memberRecord.sem_8_reg },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Registration Card</h1>
                    <p className="page-description">Your official digital community identification and academic tracking card.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium primary" onClick={handlePrint}>
                        <FaPrint style={{ marginRight: '8px' }} /> Print / Save PDF
                    </button>
                </div>
            </div>

            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                {/* The ID Card Mockup */}
                <div id="registration-card" className="print-section" style={{
                    width: '100%',
                    maxWidth: '450px',
                    background: 'white',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    border: `1px solid ${jumuiyaColor}30`,
                    position: 'relative'
                }}>
                    {/* Card Top Branding */}
                    <div style={{
                        background: `linear-gradient(135deg, ${jumuiyaColor} 0%, #1e293b 100%)`,
                        padding: '24px',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '12rem', opacity: 0.1, transform: 'rotate(-15deg)' }}>
                            <FaUniversity />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
                                {jumuiyaName.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{jumuiyaName}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Official Registration Card</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '16px', border: `3px solid ${jumuiyaColor}20`, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: jumuiyaColor }}>
                                <FaIdCard />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Name</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{memberRecord.name}</div>
                                
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registration ID</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: jumuiyaColor, fontFamily: 'monospace' }}>{memberRecord.id}</div>
                            </div>
                        </div>

                        {/* 8-Semester Tracking Board */}
                        <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '20px' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase' }}>Academic Persistence Tracker</div>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(4, 1fr)', 
                                gap: '10px' 
                            }}>
                                {semesters.map((sem) => (
                                    <div key={sem.id} style={{ 
                                        textAlign: 'center', 
                                        padding: '10px 4px', 
                                        background: sem.status ? `${jumuiyaColor}15` : 'white',
                                        borderRadius: '12px',
                                        border: sem.status ? `1px solid ${jumuiyaColor}30` : '1px solid #e2e8f0',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>S{sem.id}</div>
                                        <div style={{ fontSize: '1rem' }}>
                                            {sem.status ? <FaCheckCircle style={{ color: jumuiyaColor }} /> : <FaRegCircle style={{ color: '#cbd5e1' }} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>YEAR OF STUDY</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{memberRecord.year || 'N/A'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>ISSUE DATE</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{new Date(memberRecord.joined_at || '').toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Security Ribbon */}
                    <div style={{ height: '8px', background: `repeating-linear-gradient(45deg, ${jumuiyaColor}, ${jumuiyaColor} 10px, #1e293b 10px, #1e293b 20px)` }}></div>
                </div>
            </div>

            <style>{`
                @media print {
                    .sidebar, .notif-fab-container, .mobile-menu-toggle, .header-actions, .tab-header-wrap {
                        display: none !important;
                    }
                    body, .detail-page, .main-content, .content-wrapper, .tab-system-content {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .print-section {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                        margin: 40px auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default RegistrationCardTab;
