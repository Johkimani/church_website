import React from 'react';
import { FaIdCard, FaPrint, FaCheckCircle, FaRegCircle, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useJumuiyaMembers } from '../../../hooks/useJumuiyaMembers';
import PageLoader from '../../../assets/Layouts/PageLoader';
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

    const isDemo = !memberRecord;

    // Mock data for demo purposes
    const displayRecord = memberRecord || {
        name: user?.name || "Sample Member",
        id: user?.member_id || "CSA-DEMO-001",
        year: user?.year || "Year 3",
        joined_at: new Date().toISOString(),
        sem_1_reg: true,
        sem_2_reg: true,
        sem_3_reg: true,
        sem_4_reg: true,
        sem_5_reg: false,
        sem_6_reg: false,
        sem_7_reg: false,
        sem_8_reg: false,
        jumuiya_name: jumuiyaName
    };

    // Calculate registration progress
    const registeredSemesters = Object.keys(displayRecord)
        .filter(key => key.startsWith('sem_') && key.endsWith('_reg'))
        .filter(key => displayRecord[key as keyof typeof displayRecord] === true).length;
    const totalSemesters = 8;
    const progressPercentage = (registeredSemesters / totalSemesters) * 100;

    if (isLoading) {
        return (
            <div className="tab-system-content" style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <PageLoader message="Retrieving your official record..." />
            </div>
        );
    }

    const semesters = [
        { id: 1, status: displayRecord.sem_1_reg, name: "Semester 1" },
        { id: 2, status: displayRecord.sem_2_reg, name: "Semester 2" },
        { id: 3, status: displayRecord.sem_3_reg, name: "Semester 3" },
        { id: 4, status: displayRecord.sem_4_reg, name: "Semester 4" },
        { id: 5, status: displayRecord.sem_5_reg, name: "Semester 5" },
        { id: 6, status: displayRecord.sem_6_reg, name: "Semester 6" },
        { id: 7, status: displayRecord.sem_7_reg, name: "Semester 7" },
        { id: 8, status: displayRecord.sem_8_reg, name: "Semester 8" },
    ];

    const handlePrint = () => {
        window.print();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const _c = (s) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Registration Card</h1>
                    <p className="page-description">Your official digital community identification and academic tracking card.</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-premium primary"
                        onClick={handlePrint}
                        disabled={isDemo}
                        style={isDemo ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        <FaPrint style={{ marginRight: '8px' }} /> {isDemo ? 'Register to Print' : 'Print / Save PDF'}
                    </button>
                </div>
            </div>

            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                {/* Modern ID Card */}
                <div id="registration-card" className="print-section" style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'white',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    border: `1px solid ${_c('20')}`,
                    position: 'relative',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}>

                    {/* Card Pattern Background */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at 100% 0%, ${_c('08')} 0%, transparent 50%)`,
                        pointerEvents: 'none',
                    }} />

                    {/* Card Header with Gradient */}
                    <div style={{
                        background: `linear-gradient(135deg, ${jumuiyaColor} 0%, ${_c('DD')} 100%)`,
                        padding: '28px 32px',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative elements */}
                        <div style={{ position: 'absolute', right: '-30px', top: '-30px', fontSize: '10rem', opacity: 0.1, transform: 'rotate(10deg)' }}>
                            <FaUniversity />
                        </div>
                        <div style={{ position: 'absolute', left: '-20px', bottom: '-40px', fontSize: '8rem', opacity: 0.08, transform: 'rotate(-5deg)' }}>
                            <FaIdCard />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.75rem',
                                    fontWeight: 900,
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}>
                                    {getInitials(displayRecord.jumuiya_name || jumuiyaName)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px', opacity: 0.9 }}>
                                        COMMUNITY
                                    </h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 700 }}>
                                        {displayRecord.jumuiya_name || jumuiyaName}
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                backdropFilter: 'blur(5px)'
                            }}>
                                OFFICIAL ID
                            </div>
                        </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '32px' }}>
                        {/* Member Profile Section */}
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', position: 'relative' }}>
                            {/* Avatar */}
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '24px',
                                background: `linear-gradient(135deg, ${_c('15')}, ${_c('05')})`,
                                border: `2px solid ${_c('30')}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                color: jumuiyaColor,
                                position: 'relative'
                            }}>
                                <FaIdCard />
                                {isDemo && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-8px',
                                        right: '-8px',
                                        background: '#ef4444',
                                        borderRadius: '8px',
                                        padding: '2px 6px',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        color: 'white'
                                    }}>
                                        DEMO
                                    </div>
                                )}
                            </div>

                            {/* Member Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                        Member Name
                                    </div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                        {displayRecord.name}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                        Registration ID
                                    </div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: jumuiyaColor,
                                        fontFamily: 'monospace',
                                        background: `${_c('10')}`,
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        display: 'inline-block'
                                    }}>
                                        {displayRecord.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Overview */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Academic Progress
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: jumuiyaColor }}>
                                    {registeredSemesters}/{totalSemesters} Semesters
                                </div>
                            </div>
                            <div style={{
                                height: '8px',
                                background: '#e2e8f0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${progressPercentage}%`,
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${jumuiyaColor}, ${_c('CC')})`,
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>

                        {/* Semester Tracker Grid */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: '#64748b',
                                marginBottom: '16px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>Semester Registration Tracker</span>
                                <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
                                gap: '12px'
                            }}>
                                {semesters.map((sem) => (
                                    <div key={sem.id} style={{
                                        textAlign: 'center',
                                        padding: '12px 8px',
                                        background: sem.status ? `${_c('12')}` : '#f8fafc',
                                        borderRadius: '16px',
                                        border: sem.status ? `1.5px solid ${_c('40')}` : '1.5px solid #e2e8f0',
                                        transition: 'all 0.2s ease',
                                        cursor: 'default',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            color: sem.status ? jumuiyaColor : '#94a3b8',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Sem {sem.id}
                                        </div>
                                        <div style={{ fontSize: '1.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            {sem.status ?
                                                <FaCheckCircle style={{ color: jumuiyaColor, filter: `drop-shadow(0 2px 4px ${_c('40')})` }} /> :
                                                <FaRegCircle style={{ color: '#cbd5e1' }} />
                                            }
                                        </div>
                                        {sem.status && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-4px',
                                                right: '-4px',
                                                width: '8px',
                                                height: '8px',
                                                background: jumuiyaColor,
                                                borderRadius: '50%',
                                                boxShadow: `0 0 0 2px white`
                                            }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div style={{
                            paddingTop: '24px',
                            borderTop: `2px solid ${_c('15')}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                                    YEAR OF STUDY
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    background: '#f1f5f9',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                }}>
                                    {displayRecord.year || 'N/A'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                                    ISSUE DATE
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                    {new Date(displayRecord.joined_at || '').toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Features */}
                    <div style={{
                        height: '4px',
                        background: `repeating-linear-gradient(45deg, ${jumuiyaColor}, ${jumuiyaColor} 15px, #1e293b 15px, #1e293b 30px)`,
                        position: 'relative'
                    }} />

                    {/* Holographic effect overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        pointerEvents: 'none',
                        opacity: 0.3
                    }} />
                </div>
            </div>

            {/* Demo Banner */}
            {isDemo && (
                <div className="animate-fade" style={{
                    maxWidth: '520px',
                    margin: '24px auto',
                    padding: '20px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${_c('08')}, ${_c('02')})`,
                    border: `1px solid ${_c('20')}`,
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '1.5rem' }}>✨</div>
                        <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                            This is a preview of the official {jumuiyaName} registration card
                        </p>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 0 }}>
                        Register now to get your unique ID and start tracking your academic persistence!
                    </p>
                </div>
            )}

            {/* Print Styles */}
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
                        border: 1px solid #e2e8f0 !important;
                        margin: 20px auto !important;
                        page-break-inside: avoid;
                    }
                    #registration-card {
                        break-inside: avoid;
                    }
                }
                
                @media (max-width: 640px) {
                    .print-section {
                        margin: 0 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default RegistrationCardTab;
