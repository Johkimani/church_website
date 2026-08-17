import React, { useState, useEffect, useCallback } from 'react';
import { FaPray, FaHandHoldingHeart, FaBook, FaFire, FaUsers, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHistory, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaChevronUp, FaChevronDown, FaToggleOn, FaToggleOff } from "react-icons/fa";
import activitiesService from '../../../api/activitiesServices';
import './TabsSystem.css';

interface ActivitiesTabProps {
    jumuiyaColor: string;
    jumuiyaId?: string;
    canManage?: boolean;
}

interface WeeklyActivity {
    id: number;
    jumuiya_id?: string;
    day: string;
    time: string | null;
    activity: string;
    venue: string | null;
    fare: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
}

interface SemesterActivity {
    id: number;
    jumuiya_id?: string;
    title: string;
    date_time: string;
    venue: string | null;
    description: string | null;
    fare: string | null;
    image_url: string | null;
    is_active: boolean;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ jumuiyaColor, jumuiyaId, canManage }) => {
    const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivity[]>([]);
    const [semesterActivities, setSemesterActivities] = useState<SemesterActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
    const [editingWeekly, setEditingWeekly] = useState<number | null>(null);
    const [editingSemester, setEditingSemester] = useState<number | null>(null);
    const [showNewWeekly, setShowNewWeekly] = useState(false);
    const [showNewSemester, setShowNewSemester] = useState(false);
    const [weeklyForm, setWeeklyForm] = useState({ day: 'Monday', time: '', activity: '', venue: '', fare: '' });
    const [semesterForm, setSemesterForm] = useState({ title: '', date_time: '', venue: '', description: '', fare: '' });
    const [editWeeklyForm, setEditWeeklyForm] = useState({ day: '', time: '', activity: '', venue: '', fare: '' });
    const [editSemesterForm, setEditSemesterForm] = useState({ title: '', date_time: '', venue: '', description: '', fare: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        if (!jumuiyaId) return;
        setLoading(true);
        try {
            const [weekly, semester] = await Promise.all([
                activitiesService.getJumuiyaWeekly(jumuiyaId, canManage),
                activitiesService.getJumuiyaSemester(jumuiyaId, canManage),
            ]);
            setWeeklyActivities(weekly.sort((a: WeeklyActivity, b: WeeklyActivity) => (a.sort_order || 0) - (b.sort_order || 0)));
            setSemesterActivities(semester);
        } catch (err) {
            console.error('Failed to load activities:', err);
        } finally {
            setLoading(false);
        }
    }, [jumuiyaId, canManage]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const featuredEvent = semesterActivities
        .filter(a => a.is_active && new Date(a.date_time) >= new Date())
        .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())[0] || null;

    useEffect(() => {
        if (!featuredEvent) return;
        const tick = () => {
            const diff = new Date(featuredEvent.date_time).getTime() - Date.now();
            if (diff > 0) {
                setTimeRemaining({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff % 86400000) / 3600000),
                    minutes: Math.floor((diff % 3600000) / 60000),
                    seconds: Math.floor((diff % 60000) / 1000),
                    total: diff,
                });
            } else {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [featuredEvent]);

    const handleSaveWeekly = async (isNew: boolean, id?: number) => {
        setSaving(true); setError('');
        try {
            if (isNew) {
                await activitiesService.createJumuiyaWeekly(jumuiyaId!, weeklyForm);
            } else if (id) {
                await activitiesService.updateJumuiyaWeekly(id, editWeeklyForm);
            }
            setShowNewWeekly(false); setEditingWeekly(null);
            setWeeklyForm({ day: 'Monday', time: '', activity: '', venue: '', fare: '' });
            await fetchData();
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleDeleteWeekly = async (id: number) => {
        if (!confirm('Delete this weekly activity?')) return;
        setSaving(true);
        try {
            await activitiesService.deleteJumuiyaWeekly(id);
            await fetchData();
        } catch { setError('Failed to delete'); }
        finally { setSaving(false); }
    };

    const handleToggleWeekly = async (item: WeeklyActivity) => {
        setSaving(true);
        try {
            await activitiesService.updateJumuiyaWeekly(item.id, { is_active: !item.is_active });
            await fetchData();
        } catch { setError('Failed to toggle'); }
        finally { setSaving(false); }
    };

    const handleSaveSemester = async (isNew: boolean, id?: number) => {
        setSaving(true); setError('');
        try {
            if (isNew) {
                await activitiesService.createJumuiyaSemester(jumuiyaId!, semesterForm);
            } else if (id) {
                await activitiesService.updateJumuiyaSemester(id, editSemesterForm);
            }
            setShowNewSemester(false); setEditingSemester(null);
            setSemesterForm({ title: '', date_time: '', venue: '', description: '', fare: '' });
            await fetchData();
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleDeleteSemester = async (id: number) => {
        if (!confirm('Delete this event?')) return;
        setSaving(true);
        try {
            await activitiesService.deleteJumuiyaSemester(id);
            await fetchData();
        } catch { setError('Failed to delete'); }
        finally { setSaving(false); }
    };

    const handleToggleSemester = async (item: SemesterActivity) => {
        setSaving(true);
        try {
            await activitiesService.updateJumuiyaSemester(item.id, { is_active: !item.is_active });
            await fetchData();
        } catch { setError('Failed to toggle'); }
        finally { setSaving(false); }
    };

    const handleMoveWeekly = async (item: WeeklyActivity, dir: -1 | 1) => {
        const sorted = [...weeklyActivities].sort((a, b) => a.sort_order - b.sort_order);
        const idx = sorted.findIndex(a => a.id === item.id);
        const swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;
        [sorted[idx].sort_order, sorted[swapIdx].sort_order] = [sorted[swapIdx].sort_order, sorted[idx].sort_order];
        setWeeklyActivities(sorted);
        try {
            await activitiesService.reorderJumuiyaWeekly(sorted.map((a, i) => ({ id: a.id, sort_order: i })));
        } catch { await fetchData(); }
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px', borderRadius: '10px',
        border: '1px solid var(--border)', background: 'var(--bg-card)',
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const,
    };

    const btnPrimary = {
        padding: '10px 20px', borderRadius: '10px', border: 'none',
        background: jumuiyaColor, color: '#fff', fontWeight: 700,
        cursor: 'pointer', fontSize: '0.9rem',
    };

    if (loading) {
        return (
            <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Loading activities...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Jumuiya Activities</h1>
                    <p className="page-description">Join us in our spiritual gatherings, service missions, and community events.</p>
                </div>
                {canManage && (
                    <button onClick={() => fetchData()} style={{ ...btnPrimary, opacity: saving ? 0.5 : 1 }} disabled={saving}>
                        Refresh
                    </button>
                )}
            </div>

            {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {/* Featured upcoming semester event */}
            {featuredEvent && (
                <div className="animate-fade" style={{ marginBottom: 'var(--space-3xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '1px', background: 'var(--jumuiya-color)' }}></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--jumuiya-color)', letterSpacing: '1px' }}>Next Big Event</span>
                    </div>
                    <div className="tab-card glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'var(--space-2xl)', padding: 'var(--space-2xl)' }}>
                        <div>
                            <h2 style={{ fontSize: '2.25rem', marginBottom: '16px', lineHeight: '1.1' }}>{featuredEvent.title}</h2>
                            {featuredEvent.description && <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1.1rem' }}>{featuredEvent.description}</p>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                    <FaCalendarAlt style={{ color: 'var(--jumuiya-color)' }} />
                                    <span>{new Date(featuredEvent.date_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                    <FaClock style={{ color: 'var(--jumuiya-color)' }} />
                                    <span>{new Date(featuredEvent.date_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {featuredEvent.venue && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <FaMapMarkerAlt style={{ color: 'var(--jumuiya-color)' }} />
                                        <span>{featuredEvent.venue}</span>
                                    </div>
                                )}
                                {featuredEvent.fare && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <FaPray style={{ color: 'var(--jumuiya-color)' }} />
                                        <span>{featuredEvent.fare}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px', background: 'var(--bg-soft)', borderRadius: 'var(--rm)', padding: 'var(--space-xl)' }}>
                            <div className="activities-countdown">
                                {[
                                    { val: timeRemaining?.days || 0, label: 'Days' },
                                    { val: String(timeRemaining?.hours || 0).padStart(2, '0'), label: 'Hrs' },
                                    { val: String(timeRemaining?.minutes || 0).padStart(2, '0'), label: 'Min' },
                                ].map((item, i) => (
                                    <React.Fragment key={item.label}>
                                        {i > 0 && <div style={{ fontSize: '2rem', fontWeight: 300, opacity: 0.3 }}>:</div>}
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--jumuiya-color)', lineHeight: '1' }}>{item.val}</div>
                                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, marginTop: '4px', opacity: 0.6 }}>{item.label}</div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="activity-date-badge" style={{ transform: 'scale(1.5)' }}>
                                <div className="date-month" style={{ background: 'var(--jumuiya-color)' }}>{new Date(featuredEvent.date_time).toLocaleString('default', { month: 'short' })}</div>
                                <div className="date-day">{new Date(featuredEvent.date_time).getDate()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Schedule */}
            <div className="animate-fade" style={{ marginBottom: 'var(--space-3xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaCalendarAlt />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Weekly Schedule</span>
                    </div>
                    {canManage && (
                        <button onClick={() => setShowNewWeekly(!showNewWeekly)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaPlus /> Add Day
                        </button>
                    )}
                </div>

                {canManage && showNewWeekly && (
                    <div className="tab-card glass-card" style={{ marginBottom: '16px', padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                            <select value={weeklyForm.day} onChange={e => setWeeklyForm({ ...weeklyForm, day: e.target.value })} style={inputStyle}>
                                {DAY_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input placeholder="Time (e.g. 6:00 PM)" value={weeklyForm.time} onChange={e => setWeeklyForm({ ...weeklyForm, time: e.target.value })} style={inputStyle} />
                            <input placeholder="Activity *" value={weeklyForm.activity} onChange={e => setWeeklyForm({ ...weeklyForm, activity: e.target.value })} style={inputStyle} />
                            <input placeholder="Venue" value={weeklyForm.venue} onChange={e => setWeeklyForm({ ...weeklyForm, venue: e.target.value })} style={inputStyle} />
                            <input placeholder="Fare" value={weeklyForm.fare} onChange={e => setWeeklyForm({ ...weeklyForm, fare: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleSaveWeekly(true)} disabled={saving || !weeklyForm.activity} style={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => { setShowNewWeekly(false); setWeeklyForm({ day: 'Monday', time: '', activity: '', venue: '', fare: '' }); }} style={{ ...btnPrimary, background: 'var(--bg-soft)', color: 'var(--text-secondary)' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {weeklyActivities.length === 0 ? (
                    <div className="tab-card glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No weekly activities scheduled yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {weeklyActivities.map((item, idx) => (
                            <div key={item.id} className="tab-card glass-card" style={{ padding: '16px 20px', opacity: item.is_active ? 1 : 0.5, borderLeft: `4px solid ${jumuiyaColor}` }}>
                                {editingWeekly === item.id ? (
                                    <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                                            <select value={editWeeklyForm.day} onChange={e => setEditWeeklyForm({ ...editWeeklyForm, day: e.target.value })} style={inputStyle}>
                                                {DAY_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <input placeholder="Time" value={editWeeklyForm.time} onChange={e => setEditWeeklyForm({ ...editWeeklyForm, time: e.target.value })} style={inputStyle} />
                                            <input placeholder="Activity" value={editWeeklyForm.activity} onChange={e => setEditWeeklyForm({ ...editWeeklyForm, activity: e.target.value })} style={inputStyle} />
                                            <input placeholder="Venue" value={editWeeklyForm.venue} onChange={e => setEditWeeklyForm({ ...editWeeklyForm, venue: e.target.value })} style={inputStyle} />
                                            <input placeholder="Fare" value={editWeeklyForm.fare} onChange={e => setEditWeeklyForm({ ...editWeeklyForm, fare: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => handleSaveWeekly(false, item.id)} disabled={saving} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem' }}><FaSave /> Save</button>
                                            <button onClick={() => setEditingWeekly(null)} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem', background: 'var(--bg-soft)', color: 'var(--text-secondary)' }}><FaTimes /> Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                                            <span style={{ fontWeight: 800, color: jumuiyaColor, minWidth: '100px' }}>{item.day}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{item.time || '—'}</span>
                                            <span style={{ fontWeight: 600 }}>{item.activity}</span>
                                            {item.venue && <span style={{ color: 'var(--text-secondary)' }}><FaMapMarkerAlt style={{ marginRight: '4px', fontSize: '0.75rem' }} />{item.venue}</span>}
                                        </div>
                                        {canManage && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => handleMoveWeekly(item, -1)} disabled={idx === 0} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}><FaChevronUp /></button>
                                                <button onClick={() => handleMoveWeekly(item, 1)} disabled={idx === weeklyActivities.length - 1} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', opacity: idx === weeklyActivities.length - 1 ? 0.3 : 1 }}><FaChevronDown /></button>
                                                <button onClick={() => { setEditingWeekly(item.id); setEditWeeklyForm({ day: item.day, time: item.time || '', activity: item.activity, venue: item.venue || '', fare: item.fare || '' }); }} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563eb' }}><FaEdit /></button>
                                                <button onClick={() => handleToggleWeekly(item)} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: item.is_active ? '#16a34a' : '#dc2626' }}>{item.is_active ? <FaToggleOn /> : <FaToggleOff />}</button>
                                                <button onClick={() => handleDeleteWeekly(item.id)} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}><FaTrash /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Semester Events */}
            <div className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaHistory />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Upcoming Events</span>
                    </div>
                    {canManage && (
                        <button onClick={() => setShowNewSemester(!showNewSemester)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaPlus /> Add Event
                        </button>
                    )}
                </div>

                {canManage && showNewSemester && (
                    <div className="tab-card glass-card" style={{ marginBottom: '16px', padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                            <input placeholder="Title *" value={semesterForm.title} onChange={e => setSemesterForm({ ...semesterForm, title: e.target.value })} style={inputStyle} />
                            <input type="datetime-local" value={semesterForm.date_time} onChange={e => setSemesterForm({ ...semesterForm, date_time: e.target.value })} style={inputStyle} />
                            <input placeholder="Venue" value={semesterForm.venue} onChange={e => setSemesterForm({ ...semesterForm, venue: e.target.value })} style={inputStyle} />
                            <input placeholder="Fare" value={semesterForm.fare} onChange={e => setSemesterForm({ ...semesterForm, fare: e.target.value })} style={inputStyle} />
                            <input placeholder="Description" value={semesterForm.description} onChange={e => setSemesterForm({ ...semesterForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleSaveSemester(true)} disabled={saving || !semesterForm.title || !semesterForm.date_time} style={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => { setShowNewSemester(false); setSemesterForm({ title: '', date_time: '', venue: '', description: '', fare: '' }); }} style={{ ...btnPrimary, background: 'var(--bg-soft)', color: 'var(--text-secondary)' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {semesterActivities.length === 0 ? (
                    <div className="tab-card glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No upcoming events. Add one to get started!
                    </div>
                ) : (
                    <div className="activity-carousel">
                        {semesterActivities.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()).map((activity) => {
                            const isPast = new Date(activity.date_time) < new Date();
                            return (
                                <div key={activity.id} className="tab-card activity-card-premium" style={{ opacity: activity.is_active ? (isPast ? 0.6 : 1) : 0.4, borderTop: `4px solid ${jumuiyaColor}` }}>
                                    {editingSemester === activity.id ? (
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                                                <input placeholder="Title" value={editSemesterForm.title} onChange={e => setEditSemesterForm({ ...editSemesterForm, title: e.target.value })} style={inputStyle} />
                                                <input type="datetime-local" value={editSemesterForm.date_time} onChange={e => setEditSemesterForm({ ...editSemesterForm, date_time: e.target.value })} style={inputStyle} />
                                                <input placeholder="Venue" value={editSemesterForm.venue} onChange={e => setEditSemesterForm({ ...editSemesterForm, venue: e.target.value })} style={inputStyle} />
                                                <input placeholder="Fare" value={editSemesterForm.fare} onChange={e => setEditSemesterForm({ ...editSemesterForm, fare: e.target.value })} style={inputStyle} />
                                                <input placeholder="Description" value={editSemesterForm.description} onChange={e => setEditSemesterForm({ ...editSemesterForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => handleSaveSemester(false, activity.id)} disabled={saving} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem' }}><FaSave /> Save</button>
                                                <button onClick={() => setEditingSemester(null)} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem', background: 'var(--bg-soft)', color: 'var(--text-secondary)' }}><FaTimes /> Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                <div className="activity-date-badge">
                                                    <div className="date-month" style={{ background: jumuiyaColor }}>{new Date(activity.date_time).toLocaleString('default', { month: 'short' })}</div>
                                                    <div className="date-day">{new Date(activity.date_time).getDate()}</div>
                                                </div>
                                                {canManage && (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button onClick={() => { setEditingSemester(activity.id); setEditSemesterForm({ title: activity.title, date_time: activity.date_time, venue: activity.venue || '', description: activity.description || '', fare: activity.fare || '' }); }} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563eb' }}><FaEdit /></button>
                                                        <button onClick={() => handleToggleSemester(activity)} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: activity.is_active ? '#16a34a' : '#dc2626' }}>{activity.is_active ? <FaToggleOn /> : <FaToggleOff />}</button>
                                                        <button onClick={() => handleDeleteSemester(activity.id)} style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}><FaTrash /></button>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{activity.title}</h3>
                                            {activity.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>{activity.description}</p>}
                                            <div className="activity-meta-list">
                                                <span className="activity-meta-item"><FaClock /> <span>{new Date(activity.date_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span></span>
                                                {activity.venue && <span className="activity-meta-item"><FaMapMarkerAlt /> <span>{activity.venue}</span></span>}
                                                {activity.fare && <span className="activity-meta-item"><FaHandHoldingHeart /> <span>{activity.fare}</span></span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivitiesTab;
