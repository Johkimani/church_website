import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaUsers, FaUserFriends, FaBan, FaPrayingHands, FaPaperPlane, FaUndo } from 'react-icons/fa';
import { prayerPartnersService, PrayerPartnerMember, PrayerPartnerUnit } from '../../../api/prayerPartnersService';
import { normalizeYearOfStudy, getYearOfStudy, genderCode, isFemale } from '../../../utils/memberYear';
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
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const _c = (s: string) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

    const errMsg = (e: unknown, fallback: string): string => {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        return err?.response?.data?.message || err?.message || fallback;
    };

    const yearLabel = (yearOfStudy: string | null | undefined, memberId: string) => {
        let level = normalizeYearOfStudy(yearOfStudy);
        if (level === 'Unknown') {
            const fromReg = getYearOfStudy(memberId);
            if (fromReg >= 1 && fromReg <= 4) level = String(fromReg);
        }
        return level;
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
        // Prefer the stored year_of_study field, but fall back to the year
        // encoded in the last two digits of the reg/member id (same rule the
        // All Members table uses) when the field is empty.
        return members.map((m) => {
            let yearLevel = normalizeYearOfStudy(m.year_of_study);
            if (yearLevel === 'Unknown') {
                const fromReg = getYearOfStudy(m.member_id);
                if (fromReg >= 1 && fromReg <= 4) yearLevel = String(fromReg);
            }
            return {
                ...m,
                yearLevel,
                female: isFemale(m.gender),
                genderBadge: genderCode(m.gender),
            };
        });
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
        if (pairedIds.has(memberId)) {
            setNotice('This member is already in a group.');
            return;
        }
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

    // When a group is full, move it to the final column instantly (local state
    // only — nothing is sent to the server until Post). Chosen members are
    // snapshotted from `normalized` so phone/gender/year render immediately.
    // Only unpaired members can be selected, so a member can never land in two
    // groups.
    useEffect(() => {
        if (selected.size !== pairSize) return;
        const chosen = normalized.filter((m) => selected.has(m.member_id) && !pairedIds.has(m.member_id));
        if (chosen.length !== pairSize) return;
        const draftId = -Date.now() - Math.round(Math.random() * 1000);
        setPairs((prev) => [...prev, {
            id: draftId,
            members: chosen.map((m) => ({ member_id: m.member_id, name: m.name, gender: m.gender, year_of_study: m.year_of_study, phone: m.phone })),
        }]);
        setSelected(new Set());
        markDraftChanged();
    }, [selected, normalized, pairSize, pairedIds]);

    // Any edit after a post takes the list back to draft. The server flag is
    // turned off so members never see a stale list while the liturgist reworks it.
    const markDraftChanged = () => {
        if (isPublished) {
            setIsPublished(false);
            prayerPartnersService.unpost(jumuiyaId).catch(() => {});
        }
    };

    const switchSize = (size: 2 | 3) => {
        setPairSize(size);
        setSelected(new Set());
        setNotice('');
    };

    const cancelGroup = (draftId: number) => {
        setPairs((prev) => prev.filter((p) => p.id !== draftId));
        setNotice('Group removed from the draft.');
        markDraftChanged();
    };

    const togglePublish = async () => {
        if (busy || pairs.length === 0) return;
        if (!isPublished && !window.confirm('Upload and post this list? Members of the jumuiya will immediately be able to see these prayer partners on the public page.')) return;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            if (isPublished) {
                const res = await prayerPartnersService.unpost(jumuiyaId);
                if (res?.success) {
                    setIsPublished(false);
                    setNotice('List withdrawn — members can no longer see it.');
                } else {
                    setError(res?.message || 'Could not withdraw the list.');
                }
            } else {
                const groups = pairs.map((p) => p.members.map((m) => m.member_id));
                const saved = await prayerPartnersService.replaceAll(jumuiyaId, groups);
                if (!saved?.success) {
                    setError(saved?.message || 'Could not upload the list.');
                    return;
                }
                const res = await prayerPartnersService.post(jumuiyaId);
                if (res?.success) {
                    setIsPublished(true);
                    setNotice('List uploaded & posted! Members can now see it under Prayer Partners.');
                } else {
                    setError(res?.message || 'Could not post the list.');
                }
            }
        } catch (e) {
            setError(errMsg(e, isPublished ? 'Could not withdraw the list.' : 'Could not upload the list.'));
        } finally {
            setBusy(false);
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
                            Check members of {jumuiyaName} — the moment a group of {pairSize} fills, it moves to the
                            Prayer Partners column instantly. Pairing is local; the whole list is uploaded in one go when
                            you press Post.
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
                        disabled={busy || pairs.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:cursor-not-allowed"
                        style={{ background: pairs.length === 0 ? '#cbd5e1' : isPublished ? '#dc2626' : jumuiyaColor }}
                        title={pairs.length === 0 ? 'Build at least one group before posting.' : (isPublished ? 'Withdraw the list' : 'Upload & post the list')}
                    >
                        {isPublished ? <><FaUndo /> Unpost List</> : <><FaPaperPlane /> {busy ? 'Uploading…' : 'Post List'}</>}
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
                        <span className={`text-xs font-semibold ${selected.size === pairSize ? 'text-emerald-600' : 'text-slate-500'}`}
                            style={selected.size === pairSize ? { background: 'rgba(16,185,129,0.12)', padding: '6px 10px', borderRadius: 'var(--rs)' } : undefined}
                        >
                            {selected.size === pairSize
                                ? '✓ Group complete — moving to Prayer Partners…'
                                : `${selected.size}/${pairSize} selected — keeps filling automatically`}
                        </span>
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
                                            <div
                                                key={m.member_id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => toggleSelect(m.member_id)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(m.member_id); } }}
                                                aria-pressed={selected.has(m.member_id)}
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
                                                    userSelect: 'none',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(m.member_id)}
                                                    readOnly
                                                    tabIndex={-1}
                                                    aria-hidden="true"
                                                    style={{ accentColor: jumuiyaColor, margin: 0, width: 15, height: 15, flexShrink: 0, pointerEvents: 'none' }}
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
                                            </div>
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
                                                    style={{
                                                        marginLeft: 'auto',
                                                        border: 'none',
                                                        background: 'rgba(225,29,72,0.08)',
                                                        color: '#be123c',
                                                        borderRadius: 'var(--rs)',
                                                        padding: '4px 8px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                    }}
                                                >
                                                    <FaBan /> Cancel
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
                                                        Yr {yearLabel(m.year_of_study, m.member_id)} · {genderCode(m.gender)}
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