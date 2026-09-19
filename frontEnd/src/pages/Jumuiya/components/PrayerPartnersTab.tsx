import React, { useState, useEffect } from 'react';
import { FaPrayingHands, FaEyeSlash, FaUserFriends, FaWhatsapp } from 'react-icons/fa';
import { prayerPartnersService, PrayerPartnerUnit } from '../../../api/prayerPartnersService';
import { toWaPhone } from '../../../api/useCoordinatorContact';
import { normalizeYearOfStudy, getYearOfStudy, genderCode } from '../../../utils/memberYear';
import PageLoader from '../../../assets/Layouts/PageLoader';
import './TabsSystem.css';

interface Props {
    jumuiyaId: string;
    jumuiyaName: string;
    jumuiyaColor: string;
}

export default function PrayerPartnersTab({ jumuiyaId, jumuiyaName, jumuiyaColor }: Props) {
    const [pairs, setPairs] = useState<PrayerPartnerUnit[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const yearLabel = (yearOfStudy: string | null | undefined, memberId: string) => {
        let level = normalizeYearOfStudy(yearOfStudy);
        if (level === 'Unknown') {
            const fromReg = getYearOfStudy(memberId);
            if (fromReg >= 1 && fromReg <= 4) level = String(fromReg);
        }
        return level;
    };

    const _c = (s: string) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

    const errMsg = (e: unknown, fallback: string): string => {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        return err?.response?.data?.message || err?.message || fallback;
    };

    useEffect(() => {
        let active = true;
        setError('');
        if (!jumuiyaId) return;
        setIsLoading(true);
        (async () => {
            try {
                const res = await prayerPartnersService.getPublished(jumuiyaId);
                if (!active) return;
                if (res?.success) {
                    setIsPublished(!!res.published);
                    setPairs(res.pairs || []);
                } else {
                    setError(res?.message || 'Could not load prayer partners.');
                }
            } catch (e) {
                if (active) setError(errMsg(e, 'Could not load prayer partners.'));
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false; };
    }, [jumuiyaId]);

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">
                        <FaPrayingHands style={{ color: jumuiyaColor, marginRight: 8, verticalAlign: '-0.15em' }} />
                        {jumuiyaName} Prayer Partners
                    </h1>
                    <p className="page-description">
                        The official prayer partners for {jumuiyaName}, posted by the jumuiya liturgist. Pray for each other
                        throughout the year.
                    </p>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--rs)',
                    background: 'rgba(225,29,72,0.08)',
                    color: '#be123c',
                    fontSize: '0.85rem',
                    marginBottom: 14,
                    fontWeight: 500,
                }}>{error}</div>
            )}

            {isLoading ? (
                <div style={{ padding: '64px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PageLoader message="Loading Prayer Partners" />
                </div>
            ) : (
                <div className="animate-fade">
                    {!isPublished ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            gap: 14,
                            padding: '72px 24px',
                            border: '1px dashed var(--border-light)',
                            borderRadius: 'var(--rs)',
                            background: '#ffffff',
                        }}>
                            <span style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: _c('14'),
                                color: jumuiyaColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.6rem',
                            }}>
                                <FaEyeSlash />
                            </span>
                            <div>
                                <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Prayer partners not posted yet</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4, maxWidth: 420 }}>
                                    The {jumuiyaName} liturgist is still putting the groups together. Check back once the
                                    official list has been posted.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 14,
                        }}>
                            {pairs.map((p, idx) => (
                                <div key={p.id} style={{
                                    border: `1px solid var(--border-light)`,
                                    borderRadius: 'var(--rs)',
                                    background: '#ffffff',
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                                }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        background: jumuiyaColor,
                                        color: '#fff',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <span>Group No. {idx + 1}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, textTransform: 'none', letterSpacing: 0 }}>
                                            <FaUserFriends /> {p.members.length} {p.members.length === 1 ? 'member' : 'members'}
                                        </span>
                                    </div>
                                    <div style={{ padding: '12px 14px' }}>
                                        {p.members.map((m, mi) => (
                                            <div key={m.member_id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '8px 0',
                                                borderBottom: mi < p.members.length - 1 ? '1px solid var(--border-light)' : 'none',
                                            }}>
                                                <span style={{
                                                    width: 26,
                                                    height: 26,
                                                    flexShrink: 0,
                                                    borderRadius: '50%',
                                                    background: _c('1A'),
                                                    color: jumuiyaColor,
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {mi + 1}
                                                </span>
                                                <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                                                    <span style={{ display: 'block', color: '#1e293b', fontWeight: 500, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {m.name}
                                                    </span>
                                                    {m.phone ? (
                                                        <a
                                                            href={`https://wa.me/${toWaPhone(m.phone)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                color: jumuiyaColor,
                                                                fontSize: '0.72rem',
                                                                fontWeight: 600,
                                                                textDecoration: 'none',
                                                                marginTop: 1,
                                                            }}
                                                        >
                                                            <FaWhatsapp size={10} /> {m.phone}
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500 }}>
                                                            No contact on file
                                                        </span>
                                                    )}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    color: 'var(--text-muted)',
                                                    background: '#f1f5f9',
                                                    borderRadius: 999,
                                                    padding: '2px 8px',
                                                    flexShrink: 0,
                                                }}>
                                                    Yr {yearLabel(m.year_of_study, m.member_id)} · {genderCode(m.gender)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}