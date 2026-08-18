import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHistory } from "react-icons/fa";
import jumuiyaActivitiesService from '../../../api/jumuiyaActivitiesService';
import './TabsSystem.css';

interface ActivitiesTabProps {
    jumuiyaColor: string;
    jumuiyaId?: string;
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

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ jumuiyaColor, jumuiyaId }) => {
    const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivity[]>([]);
    const [semesterActivities, setSemesterActivities] = useState<SemesterActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

    const fetchData = useCallback(async () => {
        if (!jumuiyaId) return;
        setLoading(true);
        try {
            const [weekly, semester] = await Promise.all([
                jumuiyaActivitiesService.getJumuiyaWeekly(jumuiyaId),
                jumuiyaActivitiesService.getJumuiyaSemester(jumuiyaId),
            ]);
            setWeeklyActivities(weekly.sort((a: WeeklyActivity, b: WeeklyActivity) => (a.sort_order || 0) - (b.sort_order || 0)));
            setSemesterActivities(semester);
        } catch (err) {
            console.error('Failed to load activities:', err);
        } finally {
            setLoading(false);
        }
    }, [jumuiyaId]);

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
            </div>

            {/* Featured upcoming event */}
            {featuredEvent && (
                <div className="animate-fade" style={{ marginBottom: 'var(--space-3xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '1px', background: 'var(--jumuiya-color)' }}></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--jumuiya-color)', letterSpacing: '1px' }}>Next Big Event</span>
                    </div>
                    <div className="tab-card glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'var(--space-2xl)', padding: 'var(--space-2xl)', overflow: 'hidden' }}>
                        {featuredEvent.image_url && (
                            <div style={{ borderRadius: 'var(--rm)', overflow: 'hidden', minHeight: '200px' }}>
                                <img src={featuredEvent.image_url} alt={featuredEvent.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <FaCalendarAlt />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Weekly Schedule</span>
                </div>

                {weeklyActivities.length === 0 ? (
                    <div className="tab-card glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No weekly activities scheduled yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {weeklyActivities.map((item) => (
                            <div key={item.id} className="tab-card glass-card" style={{ padding: '16px 20px', opacity: item.is_active ? 1 : 0.5, borderLeft: `4px solid ${jumuiyaColor}` }}>
                                <div>
                                    {item.image_url && (
                                        <img src={item.image_url} alt={item.activity} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
                                        <span style={{ fontWeight: 800, color: jumuiyaColor, minWidth: '100px' }}>{item.day}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{item.time || '—'}</span>
                                        <span style={{ fontWeight: 600 }}>{item.activity}</span>
                                        {item.venue && <span style={{ color: 'var(--text-secondary)' }}><FaMapMarkerAlt style={{ marginRight: '4px', fontSize: '0.75rem' }} />{item.venue}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Events */}
            <div className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <FaHistory />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Upcoming Events</span>
                </div>

                {semesterActivities.length === 0 ? (
                    <div className="tab-card glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No upcoming events yet.
                    </div>
                ) : (
                    <div className="activity-carousel">
                        {semesterActivities.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()).map((activity) => {
                            const isPast = new Date(activity.date_time) < new Date();
                            return (
                                <div key={activity.id} className="tab-card activity-card-premium" style={{ opacity: activity.is_active ? (isPast ? 0.6 : 1) : 0.4, borderTop: `4px solid ${jumuiyaColor}` }}>
                                    {activity.image_url && (
                                        <div style={{ margin: '-0px -0px 16px', borderRadius: '0', overflow: 'hidden' }}>
                                            <img src={activity.image_url} alt={activity.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div className="activity-date-badge">
                                            <div className="date-month" style={{ background: jumuiyaColor }}>{new Date(activity.date_time).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="date-day">{new Date(activity.date_time).getDate()}</div>
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{activity.title}</h3>
                                    {activity.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>{activity.description}</p>}
                                    <div className="activity-meta-list">
                                        <span className="activity-meta-item"><FaClock /> <span>{new Date(activity.date_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span></span>
                                        {activity.venue && <span className="activity-meta-item"><FaMapMarkerAlt /> <span>{activity.venue}</span></span>}
                                    </div>
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
