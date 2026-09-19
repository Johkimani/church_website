import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaCheck, FaUsers, FaUserFriends, FaBan, FaPrayingHands } from 'react-icons/fa';
import { prayerPartnersService, PrayerPartnerMember, PrayerPartnerUnit } from '../../../api/prayerPartnersService';
import { normalizeYearOfStudy, genderCode, isFemale } from '../../../utils/memberYear';
import PageLoader from '../../../assets/Layouts/PageLoader';
import './TabsSystem.css';

const YEAR_KEYS = [
    { value: '1', label: 'Year 1' },
    { value: '2', label: 'Year 2' },
    { value: '3', label: 'Year 3' },
    { value: '4', label: 'Year 4' },
] as const;

interface Props {
    jumuiyaId: string;
    jumuiyaName: string;
    jumuiyaColor: string;
}

export default function PrayerPartnersTab({ jumuiyaId, jumuiyaName, jumuiyaColor }: Props) {
    const [members, setMembers] = useState<PrayerPartnerMember[]>([]);
    const [pairs, setPairs] = useState<PrayerPartnerUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [pairSize, setPairSize] = useState<2 | 3>(2);
    const [busy, setBusy] = useState(false);
    const [busyGroupId, setBusyGroupId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const _c = (s: string) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

const errMsg = (e: unknown, fallback: string): string => {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    return err?.response?.data?.message || err?.message || fallback;
};

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await prayerPartnersService.getData(jumuiyaId);
            if (res?.success) {
                setMembers(res.members || []);
                setPairs(res.pairs || []);
            } else {
                setError(res?.message || 'Could not load prayer partners.');
            }
} catch (e) {
                setError(errMsg(e, 'Could not load prayer partners.'));
            } finally {
            setIsLoading(false);
        }
    }, [jumuiyaId]);

    useEffect(() => {
        setSelected(new Set());
        setError('');
        setNotice('');
        if (jumuiyaId) loadData();
    }, [jumuiyaId, loadData]);

    const pairedIds = useMemo(() => {
        const ids = new Set<string>();
        pairs.forEach((p) => p.members.forEach((m) => ids.add(m.member_id)));
        return ids;
    }, [pairs]);

    const normalized = useMemo(() => {
        return members
            .map((m) => ({
                ...m,
                yearLevel: normalizeYearOfStudy(m.year_of_study),
                female: isFemale(m.gender),
                genderBadge: genderCode(m.gender),
            }))
            .filter((m) => m.yearLevel !== 'Unknown' && m.genderBadge !== '—');
    }, [members]);

    const columns = useMemo(() => {
        return YEAR_KEYS.map((y) => ({
            ...y,
            rows: normalized
                .filter((m) => m.yearLevel === y.value && !pairedIds.has(m.member_id))
                .sort((a, b) => (Number(b.female) - Number(a.female)) || a.name.localeCompare(b.name)),
        }));
    }, [normalized, pairedIds]);

    const availableTotal = columns.reduce((sum, c) => sum + c.rows.length, 0);

    const toggleSelect = (memberId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(memberId)) {
                next.delete(memberId);
                setNotice('');
            } else {
                if (next.size >= pairSize) {
                    setNotice(`One group holds ${pairSize} members — uncheck one before adding another.`);
                    return prev;
                }
                next.add(memberId);
                setNotice('');
            }
            return next;
        });
    };

    const switchSize = (size: 2 | 3) => {
        setPairSize(size);
        setSelected(new Set());
        setNotice('');
    };

    const createGroup = async () => {
        if (selected.size !== pairSize || busy) return;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const res = await prayerPartnersService.createGroup(jumuiyaId, Array.from(selected));
            if (res?.success) {
                setSelected(new Set());
                setNotice(`Prayer partner group of ${pairSize} created successfully.`);
                await loadData();
            } else {
                setError(res?.message || 'Could not create the group.');
            }
        } catch (e) {
            setError(errMsg(e, 'Could not create the group.'));
        } finally {
            setBusy(false);
        }
    };

    const cancelGroup = async (groupId: number) => {
        if (busyGroupId !== null) return;
        if (!window.confirm('Cancel this prayer partner group? Its members will reappear in the year columns.')) return;
        setBusyGroupId(groupId);
        setError('');
        try {
            const res = await prayerPartnersService.cancelGroup(jumuiyaId, groupId);
            if (res?.success) {
                setNotice('Prayer partner group cancelled.');
                await loadData();
            } else {
                setError(res?.message || 'Could not cancel the group.');
            }
} catch (e) {
                setError(errMsg(e, 'Could not cancel the group.'));
            } finally {
            setBusyGroupId(null);
        }
    };

    const cellStyle = (axis: 'x' | 'y') => ({
        flex: '1 1 0px',
        minWidth: '0',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--rs)',
        background: '#ffffff',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        ...(axis === 'y' ? { overflowY: 'auto' as const } : {}),
    });

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">
                        <FaPrayingHands style={{ color: jumuiyaColor, marginRight: 8, verticalAlign: '-0.15em' }} />
                        {jumuiyaName} Prayer Partners
                    </h1>
                    <p className="page-description">
                        Pair members of {jumuiyaName} into groups of two or three prayer partners. Each member can only
                        belong to one group at a time — cancel a group to free its members again.
                    </p>
                </div>
            </div>

            <div className="members-action-bar animate-fade" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                gap: 12,
                flexWrap: 'wrap',
            }}>
                <div className="toggle-wrapper" style={{ margin: 0, flex: '0 1 auto' }}>
                    <button className={`toggle-item ${pairSize === 2 ? 'active' : ''}`} onClick={() => switchSize(2)}>
                        <FaUserFriends /> <span className="tab-label">Pairs of 2</span>
                    </button>
                    <button className={`toggle-item ${pairSize === 3 ? 'active' : ''}`} onClick={() => switchSize(3)}>
                        <FaUsers /> <span className="tab-label">Pairs of 3</span>
                    </button>
                </div>
                <button
                    onClick={createGroup}
                    disabled={selected.size !== pairSize || busy || availableTotal === 0}
                    style={{
                        background: selected.size === pairSize && !busy ? jumuiyaColor : '#cbd5e1',
                        color: selected.size === pairSize && !busy ? '#fff' : '#94a3b8',
                        border: 'none',
                        borderRadius: 'var(--rs)',
                        padding: '12px 18px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: selected.size === pairSize && !busy ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <FaCheck />
                    Create Prayer Partners ({selected.size}/{pairSize})
                </button>
            </div>

            {notice && (
                <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--rs)',
                    background: _c('14'),
                    color: jumuiyaColor,
                    fontSize: '0.85rem',
                    marginBottom: 14,
                    fontWeight: 500,
                }}>
                    {notice}
                </div>
            )}
            {error && (
                <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--rs)',
                    background: 'rgba(225,29,72,0.08)',
                    color: '#be123c',
                    fontSize: '0.85rem',
                    marginBottom: 14,
                    fontWeight: 500,
                }}>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PageLoader message="Loading Prayer Partners" />
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 12,
                    minHeight: 320,
                }} className="animate-fade">
                    {columns.map((col) => (
                        <div key={col.value} style={{ ...cellStyle('y'), maxHeight: 480 }}>
                            <div style={{
                                padding: '10px 12px',
                                background: jumuiyaColor,
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                borderTopLeftRadius: 'var(--rs)',
                                borderTopRightRadius: 'var(--rs)',
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                            }}>
                                {col.label}
                            </div>
                            <div style={{ padding: '6px 8px 10px', flex: '1 1 auto' }}>
                                {col.rows.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '14px 4px', textAlign: 'center' }}>
                                        No free members
                                    </div>
                                ) : (
                                    col.rows.map((m, idx) => (
                                        <label
                                            key={m.member_id}
                                            onClick={() => toggleSelect(m.member_id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '7px 6px',
                                                borderRadius: 'var(--rs)',
                                                cursor: 'pointer',
                                                background: selected.has(m.member_id) ? _c('26') : 'transparent',
                                                border: `1px solid ${selected.has(m.member_id) ? jumuiyaColor : 'transparent'}`,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected.has(m.member_id)}
                                                readOnly
                                                style={{ accentColor: jumuiyaColor, margin: 0, width: 15, height: 15, flexShrink: 0 }}
                                            />
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', minWidth: 16, fontWeight: 600 }}>
                                                {idx + 1}.
                                            </span>
                                            <span style={{ flex: '1 1 auto', fontSize: '0.82rem', fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {m.name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                color: m.female ? '#db2777' : '#2563eb',
                                                background: m.female ? 'rgba(219,39,119,0.1)' : 'rgba(37,99,235,0.1)',
                                                borderRadius: 999,
                                                padding: '2px 7px',
                                                flexShrink: 0,
                                            }}>
                                                {m.female ? 'W' : 'M'}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Fifth column — active prayer partner groups */}
                    <div style={{ ...cellStyle('y'), maxHeight: 480, background: '#f8fafc' }}>
                        <div style={{
                            padding: '10px 12px',
                            background: '#0f172a',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            borderTopLeftRadius: 'var(--rs)',
                            borderTopRightRadius: 'var(--rs)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 2,
                        }}>
                            Prayer Partners
                        </div>
                        <div style={{ padding: '6px 8px 10px', flex: '1 1 auto' }}>
                            {pairs.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '14px 4px', textAlign: 'center' }}>
                                    No prayer partners yet.
                                </div>
                            ) : (
                                pairs.map((p, idx) => (
                                    <div key={p.id} style={{
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--rs)',
                                        padding: '8px 10px',
                                        marginBottom: 8,
                                        background: '#ffffff',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                color: '#fff',
                                                background: '#0f172a',
                                                borderRadius: 999,
                                                padding: '2px 8px',
                                            }}>
                                                No. {idx + 1}
                                            </span>
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                {p.members.length}-person group
                                            </span>
                                            <button
                                                onClick={() => cancelGroup(p.id)}
                                                disabled={busyGroupId !== null}
                                                style={{
                                                    marginLeft: 'auto',
                                                    border: 'none',
                                                    background: 'rgba(225,29,72,0.08)',
                                                    color: '#be123c',
                                                    borderRadius: 'var(--rs)',
                                                    padding: '4px 8px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    cursor: busyGroupId !== null ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                {busyGroupId === p.id ? (
                                                    <><FaBan /> Cancelling…</>
                                                ) : (
                                                    <><FaBan /> Cancel</>
                                                )}
                                            </button>
                                        </div>
                                        {p.members.map((m) => (
                                            <div key={m.member_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#1e293b', padding: '2px 0' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }}>
                                                    Yr {normalizeYearOfStudy(m.year_of_study)} · {genderCode(m.gender)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <p style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Only active members with a known year of study (1–4) and gender are listed. {availableTotal} free, eligible members shown.
            </p>
        </div>
    );
}