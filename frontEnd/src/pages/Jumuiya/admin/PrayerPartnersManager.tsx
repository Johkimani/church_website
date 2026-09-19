import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaCheck, FaUsers, FaUserFriends, FaBan, FaPrayingHands, FaPaperPlane, FaUndo } from 'react-icons/fa';
import { prayerPartnersService, PrayerPartnerMember, PrayerPartnerUnit } from '../../../api/prayerPartnersService';
import { normalizeYearOfStudy, genderCode, isFemale } from '../../../utils/memberYear';
import PageLoader from '../../../assets/Layouts/PageLoader';

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

export default function PrayerPartnersManager({ jumuiyaId, jumuiyaName, jumuiyaColor }: Props) {
    const [members, setMembers] = useState<PrayerPartnerMember[]>([]);
    const [pairs, setPairs] = useState<PrayerPartnerUnit[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [pairSize, setPairSize] = useState<2 | 3>(2);
    const [busy, setBusy] = useState(false);
    const [busyGroupId, setBusyGroupId] = useState<number | null>(null);
    const [busyPublish, setBusyPublish] = useState(false);
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
                setIsPublished(!!res.published?.is_published);
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
        return members.map((m) => ({
            ...m,
            yearLevel: normalizeYearOfStudy(m.year_of_study),
            female: isFemale(m.gender),
            genderBadge: genderCode(m.gender),
        }));
    }, [members]);

    const columns = useMemo(() => {
        const yearCols = YEAR_KEYS.map((y) => ({
            ...y,
            rows: normalized
                .filter((m) => m.yearLevel === y.value && !pairedIds.has(m.member_id))
                .sort((a, b) => (Number(b.female) - Number(a.female)) || a.name.localeCompare(b.name)),
        }));
        // Members with no recognized year (1-4) still count — show them in a fallback column.
        const others = normalized
            .filter((m) => m.yearLevel === 'Unknown' && !pairedIds.has(m.member_id))
            .sort((a, b) => (Number(b.female) - Number(a.female)) || a.name.localeCompare(b.name));
        if (others.length > 0) yearCols.push({ value: 'X', label: 'Other Members', rows: others });
        return yearCols;
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
                setNotice('Prayer partner group created. The posted list was set back to draft — post it again when ready.');
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
        if (!window.confirm('Cancel this prayer partner group? Its members will reappear in the year columns and any posted list will revert to draft.')) return;
        setBusyGroupId(groupId);
        setError('');
        try {
            const res = await prayerPartnersService.cancelGroup(jumuiyaId, groupId);
            if (res?.success) {
                setNotice('Prayer partner group cancelled. The posted list was set back to draft.');
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

    const togglePublish = async () => {
        if (busyPublish || pairs.length === 0) return;
        if (!isPublished && !window.confirm('Post this list? All members of the jumuiya will be able to see these prayer partners on the public jumuiya page.')) return;
        setBusyPublish(true);
        setError('');
        setNotice('');
        try {
            const res = isPublished
                ? await prayerPartnersService.unpost(jumuiyaId)
                : await prayerPartnersService.post(jumuiyaId);
            if (res?.success) {
                setIsPublished(!isPublished);
                setNotice(isPublished ? 'List withdrawn — members can no longer see it.' : 'List posted! Members can now see it under Prayer Partners.');
            } else {
                setError(res?.message || (isPublished ? 'Could not withdraw the list.' : 'Could not post the list.'));
            }
        } catch (e) {
            setError(errMsg(e, isPublished ? 'Could not withdraw the list.' : 'Could not post the list.'));
        } finally {
            setBusyPublish(false);
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
        <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FaPrayingHands style={{ color: jumuiyaColor }} />
                            Prayer Partners Management
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Pair members of {jumuiyaName} into groups of two or three, then post the final list. Members see
                            only the posted outcome on the public page.
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                        isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        {isPublished ? 'Posted — members can see this list' : 'Draft — not visible to members'}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <button
                        onClick={togglePublish}
                        disabled={busyPublish || pairs.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:cursor-not-allowed"
                        style={{ background: pairs.length === 0 ? '#cbd5e1' : isPublished ? '#dc2626' : jumuiyaColor }}
                        title={pairs.length === 0 ? 'Add at least one group before posting.' : (isPublished ? 'Withdraw the list' : 'Post the list')}
                    >
                        {isPublished ? <><FaUndo /> Unpost List</> : <><FaPaperPlane /> Post List</>}
                    </button>
                    <span className="text-xs text-slate-400">
                        {pairs.length} group{pairs.length === 1 ? '' : 's'} ready {isPublished ? '· posted' : '· draft'}
                    </span>
                </div>

                {notice && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--rs)',
                        background: _c('14'),
                        color: jumuiyaColor,
                        fontSize: '0.85rem',
                        marginTop: 12,
                        fontWeight: 500,
                    }}>{notice}</div>
                )}
                {error && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--rs)',
                        background: 'rgba(225,29,72,0.08)',
                        color: '#be123c',
                        fontSize: '0.85rem',
                        marginTop: 12,
                        fontWeight: 500,
                    }}>{error}</div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h3 className="text-sm font-bold text-slate-700">Build the pair list</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-xl overflow-hidden border border-slate-200">
                            <button
                                onClick={() => switchSize(2)}
                                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${pairSize === 2 ? 'text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                                style={pairSize === 2 ? { background: jumuiyaColor } : undefined}
                            >
                                <FaUserFriends /> Pairs of 2
                            </button>
                            <button
                                onClick={() => switchSize(3)}
                                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${pairSize === 3 ? 'text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                                style={pairSize === 3 ? { background: jumuiyaColor } : undefined}
                            >
                                <FaUsers /> Pairs of 3
                            </button>
                        </div>
                        <button
                            onClick={createGroup}
                            disabled={selected.size !== pairSize || busy || availableTotal === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:cursor-not-allowed"
                            style={{ background: selected.size === pairSize && !busy ? jumuiyaColor : '#cbd5e1' }}
                        >
                            <FaCheck /> Create ({selected.size}/{pairSize})
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <PageLoader message="Loading Prayer Partners" />
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns.length + 1}, minmax(0, 1fr))`,
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
                                }}>{col.label}</div>
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
                            }}>Prayer Partners</div>
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
                                                }}>No. {idx + 1}</span>
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
                                                    {busyGroupId === p.id ? (<><FaBan /> Cancelling…</>) : (<><FaBan /> Cancel</>)}
                                                </button>
                                            </div>
                                            {p.members.map((m) => (
                                                <div key={m.member_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#1e293b', padding: '2px 0', gap: 8 }}>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {m.phone ? (
                                                            <a href={`tel:${m.phone.replace(/[^+\d]/g, '')}`} style={{ color: jumuiyaColor, fontWeight: 600, textDecoration: 'none' }}>
                                                                {m.phone}
                                                            </a>
                                                        ) : (
                                                            <span style={{ color: '#cbd5e1' }}>no contact</span>
                                                        )}
                                                        <span>·</span>
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
                    Every member of {jumuiyaName} (except associates) is eligible. {availableTotal} free members shown.
                </p>
            </div>
        </div>
    );
}