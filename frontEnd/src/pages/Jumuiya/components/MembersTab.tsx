import React, { useState, useEffect, useMemo } from 'react';
import { FaCheck, FaUsers, FaGraduationCap, FaSearch, FaTimes } from "react-icons/fa";
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

/**
 * Calculates graduation year for an associate based on 4-year undergraduate progression:
 * - Direct graduation_year (e.g. 2026, 2025)
 * - admission_year + 4 (e.g. 2022 -> 2026, 2021 -> 2025)
 * - Reg number suffix /YY (e.g. ED100/G/18019/22 -> 2022 + 4 = 2026)
 * - Academic year range "2022-2023" or "2021/2022" -> Start year + 4 = 2026 / 2025
 */
const getGraduationYear = (member: JumuiyaRosterMember): number | null => {
    if (member.graduation_year && !isNaN(Number(member.graduation_year))) {
        return Number(member.graduation_year);
    }
    if (member.admission_year && !isNaN(Number(member.admission_year))) {
        return Number(member.admission_year) + 4;
    }
    const rawId = member.member_id || member.id;
    if (rawId) {
        const match = String(rawId).trim().match(/(\d{2})\s*$/);
        if (match) {
            return 2000 + parseInt(match[1], 10) + 4;
        }
    }
    const yrStr = String(member.year || '');
    const rangeMatch = yrStr.match(/(\d{4})\s*[-/]\s*(\d{4})/);
    if (rangeMatch) {
        return parseInt(rangeMatch[1], 10) + 4;
    }
    const singleYearMatch = yrStr.match(/^(\d{4})$/);
    if (singleYearMatch) {
        const y = parseInt(singleYearMatch[1], 10);
        return y > 2000 ? y : null;
    }
    return null;
};

const MembersTab: React.FC<MembersTabProps> = ({ jumuiyaId, jumuiyaName, jumuiyaColor = 'var(--primary-color)', officials = [] }) => {
    const [activeSubTab, setActiveSubTab] = useState<'registered' | 'all' | 'associates'>('registered');
    const [members, setMembers] = useState<JumuiyaRosterMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const officialNames = useMemo(
        () => new Set(officials.map(o => o.name?.toLowerCase().trim())),
        [officials]
    );

    useEffect(() => {
        let cancelled = false;
        if (jumuiyaId) {
            setIsLoading(true);
            (async () => {
                try {
                    let res;
                    if (activeSubTab === 'registered') {
                        res = await memberService.getJumuiyaRegistered(jumuiyaId);
                    } else if (activeSubTab === 'associates') {
                        res = await memberService.getJumuiyaAssociates(jumuiyaId);
                    } else {
                        res = await memberService.getJumuiyaRoster(jumuiyaId);
                    }
                    if (!cancelled && res?.success) setMembers(res.data || []);
                } catch { /* roster read is best-effort */ }
                if (!cancelled) setIsLoading(false);
            })();
        }
        return () => { cancelled = true; };
    }, [jumuiyaId, activeSubTab]);

    const displayedMembers = useMemo(() => {
        if (!searchQuery.trim()) return members;
        const q = searchQuery.toLowerCase().trim();
        return members.filter(m => {
            const nameMatch = (m.name || '').toLowerCase().includes(q);
            const courseMatch = (m.course || '').toLowerCase().includes(q);
            const yearMatch = String(m.year || '').toLowerCase().includes(q);
            const idMatch = String(m.member_id || m.id || '').toLowerCase().includes(q);
            const gradYear = getGraduationYear(m);
            const classOfMatch = gradYear ? String(gradYear).includes(q) || `class of ${gradYear}`.includes(q) : false;
            return nameMatch || courseMatch || yearMatch || idMatch || classOfMatch;
        });
    }, [members, searchQuery]);

    const _c = (s: string) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

    const getMemberTag = (member: JumuiyaRosterMember) => {
        if (officialNames.has(member.name?.toLowerCase().trim())) {
            return { label: 'OFFICIAL', color: '#8b5cf6', bg: '#f5f3ff' };
        }
        if (activeSubTab === 'associates' || member.is_associate) {
            return { label: 'ASSOCIATE', color: '#059669', bg: '#ecfdf5' };
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
                            : activeSubTab === 'associates'
                            ? `Directory of alumni and associate members who graduated from ${jumuiyaName}.`
                            : `A complete directory of all members assigned to ${jumuiyaName}.`}
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="members-action-bar animate-fade" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--space-xl)',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <div className="toggle-wrapper" style={{ margin: 0, flex: '1 1 340px' }}>
                    <button
                        className={`toggle-item ${activeSubTab === 'registered' ? 'active' : ''}`}
                        onClick={() => { setActiveSubTab('registered'); setSearchQuery(''); }}
                    >
                        <FaCheck /> <span className="tab-label">Registered</span>
                    </button>
                    <button
                        className={`toggle-item ${activeSubTab === 'all' ? 'active' : ''}`}
                        onClick={() => { setActiveSubTab('all'); setSearchQuery(''); }}
                    >
                        <FaUsers /> <span className="tab-label">All Members</span>
                    </button>
                    <button
                        className={`toggle-item ${activeSubTab === 'associates' ? 'active' : ''}`}
                        onClick={() => { setActiveSubTab('associates'); setSearchQuery(''); }}
                    >
                        <FaGraduationCap /> <span className="tab-label">Associates</span>
                    </button>
                </div>

                {/* Quick Search Bar */}
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
                    <FaSearch style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.85rem' 
                    }} />
                    <input
                        type="text"
                        placeholder={activeSubTab === 'associates' ? "Search associates, class, course..." : "Search members, course..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input-premium"
                        style={{ 
                            paddingLeft: '34px', 
                            paddingRight: searchQuery ? '32px' : '12px',
                            fontSize: '0.85rem', 
                            paddingBlock: '0.65rem' 
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <FaTimes size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div className="premium-table-wrap animate-fade" style={{ minHeight: '300px', maxHeight: '550px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--rs)', position: 'relative' }}>
                {isLoading ? (
                    <div style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <PageLoader message={activeSubTab === 'associates' ? "Fetching Associates Data" : "Fetching Membership Data"} />
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Member Name</th>
                                <th>{activeSubTab === 'associates' ? 'Class Of' : 'Academic Year'}</th>
                                <th>Course</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                        {searchQuery
                                            ? `No matches found for "${searchQuery}".`
                                            : activeSubTab === 'associates'
                                            ? `No associates found for ${jumuiyaName}.`
                                            : `No members found in this category.`}
                                    </td>
                                </tr>
                            ) : displayedMembers.map(member => {
                                const tag = getMemberTag(member);
                                const gradYear = activeSubTab === 'associates' ? getGraduationYear(member) : null;

                                return (
                                    <tr key={member.id || member.member_id}>
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
                                                    {(member.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                                            {activeSubTab === 'associates' ? (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '3px 10px',
                                                    borderRadius: '16px',
                                                    background: '#ecfdf5',
                                                    color: '#065f46',
                                                    border: '1px solid #a7f3d0',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    <FaGraduationCap size={13} style={{ color: '#059669' }} />
                                                    {gradYear ? `Class of ${gradYear}` : (member.year || 'Class of N/A')}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{member.year || 'N/A'}</span>
                                            )}
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
