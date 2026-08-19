import React, { useState, useEffect, useMemo } from 'react';
import { FaCheck, FaUsers } from "react-icons/fa";
import { memberService, JumuiyaRosterMember } from '../../../api/jumuiyaMemberService';
import type { Official } from '../data/jumuiyaData';
import PageLoader from '../../../assets/Layouts/PageLoader';
import './TabsSystem.css';

interface MembersTabProps {
    jumuiyaId: string;
    jumuiyaName: string;
    jumuiyaColor?: string;
    officials?: Official[];
}

const MembersTab: React.FC<MembersTabProps> = ({ jumuiyaId, jumuiyaName, jumuiyaColor = 'var(--primary-color)', officials = [] }) => {
    const [activeSubTab, setActiveSubTab] = useState<'registered' | 'all'>('registered');
    const [members, setMembers] = useState<JumuiyaRosterMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const officialNames = useMemo(
        () => new Set(officials.map(o => o.name?.toLowerCase().trim())),
        [officials]
    );

    useEffect(() => {
        let cancelled = false;
        if (jumuiyaId) {
            (async () => {
                try {
                    const res = activeSubTab === 'registered'
                        ? await memberService.getJumuiyaRegistered(jumuiyaId)
                        : await memberService.getJumuiyaRoster(jumuiyaId);
                    if (!cancelled && res?.success) setMembers(res.data || []);
                } catch { /* roster read is best-effort */ }
                if (!cancelled) setIsLoading(false);
            })();
        }
        return () => { cancelled = true; };
    }, [jumuiyaId, activeSubTab]);

    const displayedMembers = members;

    const _c = (s: string) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

    const getMemberTag = (member: JumuiyaRosterMember) => {
        if (officialNames.has(member.name?.toLowerCase().trim())) {
            return { label: 'OFFICIAL', color: '#8b5cf6', bg: '#f5f3ff' };
        }
        if (member.is_registered) {
            return { label: 'MEMBER', color: jumuiyaColor, bg: jumuiyaColor };
        }
        return { label: 'PENDING', color: '#9ca3af', bg: '#9ca3af' };
    };

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">{jumuiyaName} Membership</h1>
                    <p className="page-description">
                        {activeSubTab === 'registered' 
                            ? `Listing members explicitly found in the registration database for ${jumuiyaName}.`
                            : `A complete directory of all members assigned to ${jumuiyaName}.`}
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="members-action-bar animate-fade" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'stretch',
                marginBottom: 'var(--space-xl)',
                gap: '12px',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row'
            }}>
                <div className="toggle-wrapper" style={{ margin: 0, width: '100%', flex: '1 1 auto' }}>
                    <button
                        className={`toggle-item ${activeSubTab === 'registered' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('registered')}
                    >
                        <FaCheck /> <span className="tab-label">Registered</span>
                    </button>
                    <button
                        className={`toggle-item ${activeSubTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('all')}
                    >
                        <FaUsers /> <span className="tab-label">All Members</span>
                    </button>
                </div>
            </div>

            <div className="premium-table-wrap animate-fade" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--rs)', position: 'relative' }}>
                {isLoading ? (
                    <div style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <PageLoader message="Fetching Membership Data" />
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Member Name</th>
                                <th>Academic Year</th>
                                <th>Course</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                        No members found in this category.
                                    </td>
                                </tr>
                            ) : displayedMembers.map(member => {
                                const tag = getMemberTag(member);
                                return (
                                    <tr key={member.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: tag.color,
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 600 }}>{member.name}</span>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            background: tag.bg,
                                                            color: tag.color === tag.bg ? 'white' : tag.color,
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            fontWeight: 700,
                                                            letterSpacing: '0.05em'
                                                        }}>
                                                            {tag.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{member.year || 'N/A'}</span>
                                        </td>
                                        <td>
                                            {member.course ? (
                                                <span style={{
                                                    padding: '3px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: `${_c('15')}`,
                                                    color: jumuiyaColor,
                                                    border: `1px solid ${_c('30')}`,
                                                    display: 'inline-block'
                                                }}>
                                                    {member.course}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MembersTab;
