import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaList } from "react-icons/fa";
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
    image_url: string | null;
    is_active: boolean;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const DAY_ICONS: Record<string, string> = {
    Monday: '📖', Tuesday: '🎵', Wednesday: '✝️', Thursday: '🙏',
    Friday: '⛪', Saturday: '🎶', Sunday: '🕊️',
};

const DAY_COLORS: Record<string, string> = {
    Monday: '#3b82f6', Tuesday: '#8b5cf6', Wednesday: '#10b981',
    Thursday: '#f59e0b', Friday: '#ef4444', Saturday: '#6366f1', Sunday: '#64748b',
};

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

    const upcomingEvents = semesterActivities
        .filter(a => a.is_active && new Date(a.date_time) >= new Date())
        .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

    const featuredEvent = upcomingEvents[0] || null;

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
                });
            } else {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [featuredEvent]);

    if (loading) {
        return (
            <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading activities...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-system-content" style={{ '--jumuiya-color': jumuiyaColor } as React.CSSProperties}>
            {/* Page Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Jumuiya Activities
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                    Join us in our spiritual gatherings, service missions, and community events.
                </p>
            </div>

            {/* Featured Upcoming Event */}
            {featuredEvent && (
                <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '32px', height: '3px', background: jumuiyaColor, borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: jumuiyaColor, letterSpacing: '1.5px' }}>Next Big Event</span>
                    </div>

                    <div style={{
                        background: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    }}>
                        {featuredEvent.image_url && (
                            <div style={{ width: '100%', height: '280px', overflow: 'hidden' }}>
                                <img
                                    src={featuredEvent.image_url}
                                    alt={featuredEvent.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'start' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '16px', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                                        {featuredEvent.title}
                                    </h2>
                                    {featuredEvent.description && (
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.7 }}>
                                            {featuredEvent.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                            <FaCalendarAlt style={{ color: jumuiyaColor, width: '16px' }} />
                                            <span>{new Date(featuredEvent.date_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                            <FaClock style={{ color: jumuiyaColor, width: '16px' }} />
                                            <span>{new Date(featuredEvent.date_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {featuredEvent.venue && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                <FaMapMarkerAlt style={{ color: jumuiyaColor, width: '16px' }} />
                                                <span>{featuredEvent.venue}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Countdown */}
                                {timeRemaining && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '16px',
                                        background: `${jumuiyaColor}08`,
                                        border: `1px solid ${jumuiyaColor}20`,
                                        borderRadius: '16px',
                                        padding: '24px',
                                        minWidth: '180px',
                                    }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            {[
                                                { val: timeRemaining.days, label: 'Days' },
                                                { val: String(timeRemaining.hours).padStart(2, '0'), label: 'Hrs' },
                                                { val: String(timeRemaining.minutes).padStart(2, '0'), label: 'Min' },
                                            ].map((item, i) => (
                                                <React.Fragment key={item.label}>
                                                    {i > 0 && <div style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-secondary)', opacity: 0.4 }}>:</div>}
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '2rem', fontWeight: 900, color: jumuiyaColor, lineHeight: 1 }}>{item.val}</div>
                                                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>{item.label}</div>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <div style={{
                                            width: '56px', height: '56px',
                                            borderRadius: '12px',
                                            background: jumuiyaColor,
                                            color: 'white',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 4px 12px ${jumuiyaColor}40`,
                                        }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
                                                {new Date(featuredEvent.date_time).toLocaleString('default', { month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1 }}>
                                                {new Date(featuredEvent.date_time).getDate()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Schedule */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <FaList style={{ color: jumuiyaColor }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-primary)' }}>Weekly Schedule</span>
                </div>

                {weeklyActivities.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        No weekly activities scheduled yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                        {weeklyActivities.map((item) => {
                            const dayColor = DAY_COLORS[item.day] || jumuiyaColor;
                            return (
                                <div key={item.id} style={{
                                    background: 'white',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    opacity: item.is_active ? 1 : 0.5,
                                }}>
                                    {item.image_url && (
                                        <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                                            <img src={item.image_url} alt={item.activity} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span style={{
                                                background: `${dayColor}14`,
                                                color: dayColor,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.3px',
                                            }}>
                                                {item.day}
                                            </span>
                                            {item.time && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                    {item.time}
                                                </span>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                            {item.activity}
                                        </h3>
                                        {item.venue && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <FaMapMarkerAlt style={{ fontSize: '0.75rem' }} />
                                                <span>{item.venue}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upcoming Events */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <FaCalendarAlt style={{ color: jumuiyaColor }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-primary)' }}>Upcoming Events</span>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        No upcoming events yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {upcomingEvents.map((activity) => (
                            <div key={activity.id} style={{
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                            }}>
                                {activity.image_url && (
                                    <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                                        <img src={activity.image_url} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        {/* Date badge */}
                                        <div style={{
                                            width: '52px', height: '52px',
                                            borderRadius: '12px',
                                            background: jumuiyaColor,
                                            color: 'white',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <div style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
                                                {new Date(activity.date_time).toLocaleString('default', { month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.1 }}>
                                                {new Date(activity.date_time).getDate()}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                                {activity.title}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                <FaClock style={{ fontSize: '0.7rem' }} />
                                                <span>{new Date(activity.date_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {activity.description && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                                            {activity.description}
                                        </p>
                                    )}
                                    {activity.venue && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '10px 14px', background: 'var(--bg-soft, #f8fafc)', borderRadius: '10px' }}>
                                            <FaMapMarkerAlt style={{ color: jumuiyaColor, fontSize: '0.8rem' }} />
                                            <span style={{ fontWeight: 600 }}>{activity.venue}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivitiesTab;
