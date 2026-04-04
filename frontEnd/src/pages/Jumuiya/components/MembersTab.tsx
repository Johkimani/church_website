import React, { useState } from 'react';
import { FaCheck, FaUsers } from "react-icons/fa";
import { useJumuiyaMembers } from '../../../hooks/useJumuiyaMembers';
import './TabsSystem.css';

interface MembersTabProps {
    jumuiyaId: string;
    jumuiyaName: string;
    jumuiyaColor?: string;
}

const MembersTab: React.FC<MembersTabProps> = ({ jumuiyaId, jumuiyaName, jumuiyaColor = 'var(--primary-color)' }) => {
    const [activeSubTab, setActiveSubTab] = useState<'this' | 'all'>('this');
    const { members, isLoading, error } = useJumuiyaMembers({ jumuiya_id: jumuiyaId });

    if (isLoading) {
        return (
            <div className="tab-system-content" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: `3px solid ${jumuiyaColor}30`, borderTopColor: jumuiyaColor, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ marginTop: '16px', fontSize: '1.1rem' }}>Loading all members…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-system-content" style={{ padding: '64px 24px', textAlign: 'center', color: '#ef4444' }}>
                <p>Failed to load members: {error}</p>
            </div>
        );
    }

    const displayedMembers = activeSubTab === 'this'
        ? members.filter(m => m.is_current_jumuiya)
        : members;

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">{activeSubTab === 'this' ? `${jumuiyaName} Members` : 'All Church Members'}</h1>
                    <p className="page-description">
                      {activeSubTab === 'this' 
                        ? `A list of all members currently registered in ${jumuiyaName}.` 
                        : 'A complete directory of all members across all communities.'}
                    </p>
                </div>
            </div>

            {/* Registration Type Toggle */}
            <div className="toggle-wrapper animate-fade">
                <button
                    className={`toggle-item ${activeSubTab === 'this' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('this')}
                >
                    <FaCheck /> This Community
                </button>
                <button
                    className={`toggle-item ${activeSubTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('all')}
                >
                    <FaUsers /> All Members (Global)
                </button>
            </div>

            <div className="premium-table-wrap animate-fade" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--rs)' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Member Name</th>
                            <th>Academic Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedMembers.map(member => (
                            <tr key={member.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: member.is_current_jumuiya ? jumuiyaColor : 'var(--bg-soft)',
                                                color: member.is_current_jumuiya ? 'white' : 'var(--text-muted)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                border: member.is_current_jumuiya ? 'none' : '1px solid var(--border-light)'
                                            }}
                                        >
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 600 }}>{member.name}</span>
                                                {member.is_current_jumuiya && (
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        background: jumuiyaColor, 
                                                        color: 'white', 
                                                        padding: '2px 6px', 
                                                        borderRadius: '10px',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        MEMBER
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{member.year || 'N/A'}</span>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: member.is_registered ? '#10b981' : '#f59e0b'
                                        }}>
                                            {member.is_registered ? `Registered (${member.jumuiya_id})` : 'Unregistered'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersTab;
