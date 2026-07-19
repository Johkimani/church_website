import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommunityData } from './context/CommunityDataContext';
import type { CommunityModule, PracticeSchedule } from './context/CommunityDataContext';
import { apiClient } from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import CommunityModal from './components/CommunityModal';
import { FaWhatsapp } from 'react-icons/fa';
import { 
  ChevronLeft, 
  Clock, 
  Coins, 
  MapPin, 
  Calendar, 
  Bell, 
  Info, 
  Users, 
  Music, 
  Compass, 
  Flame, 
  HeartHandshake,
  GraduationCap,
  Image as ImageIcon,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  CheckCircle,
  X
} from 'lucide-react';

interface MinistryMood {
  accent: string;
  kicker: string;
  icon: React.ReactNode;
}

const MINISTRY_MOOD: Record<string, MinistryMood> = {
  choir: { accent: '#7c2d12', kicker: 'Voices raised in praise', icon: <Music className="w-7 h-7 text-white" /> },
  dancers: { accent: '#9a3412', kicker: 'Liturgical movement', icon: <Compass className="w-7 h-7 text-white" /> },
  charismatic: { accent: '#b45309', kicker: 'Prayer & healing', icon: <Flame className="w-7 h-7 text-white" /> },
  'st-francis': { accent: '#92400e', kicker: 'Simplicity & charity', icon: <HeartHandshake className="w-7 h-7 text-white" /> },
  youth: { accent: '#a16207', kicker: 'Mentorship & guidance', icon: <Users className="w-7 h-7 text-white" /> },
};

const DEFAULT_MOOD: MinistryMood = { accent: '#7c2d12', kicker: 'Parish ministry', icon: <Users className="w-7 h-7 text-white" /> };

const tabIcons: Record<string, React.ReactNode> = {
  about: <Info size={16} />,
  announcements: <Bell size={16} />,
  classes: <GraduationCap size={16} />,
  schedules: <Clock size={16} />,
  officials: <Users size={16} />,
  members: <Users size={16} />,
  activities: <Calendar size={16} />,
  gallery: <ImageIcon size={16} />
};

// ─── Next Practice Countdown (Choir-specific) ────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseT(t: string) {
    const [h, m] = t.split(':').map(Number);
    return { h: h || 0, m: m || 0 };
}
function fmt12(t: string) {
    if (!t) return '';
    const { h, m } = parseT(t);
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
}
function getWindows(schedules: PracticeSchedule[], now: Date) {
    return schedules.map(s => {
        const dayIdx = DAY_NAMES.indexOf(s.day);
        const st = parseT(s.startTime);
        const et = parseT(s.endTime);
        let daysUntil = (dayIdx - now.getDay() + 7) % 7;
        const start = new Date(now);
        start.setDate(now.getDate() + daysUntil);
        start.setHours(st.h, st.m, 0, 0);
        const end = new Date(start);
        end.setHours(et.h, et.m, 0, 0);
        if (end <= now) { start.setDate(start.getDate() + 7); end.setDate(end.getDate() + 7); }
        return { s, start, end };
    });
}

const PracticeCountdown: React.FC<{ schedules: PracticeSchedule[] }> = ({ schedules }) => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const windows = getWindows(schedules, now);
    const inProgress = windows.find(w => now >= w.start && now < w.end);

    if (inProgress) {
        const remaining = Math.max(0, inProgress.end.getTime() - now.getTime());
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div className="text-green-700 font-black text-lg mb-1">🎵 Practice In Progress!</div>
                <div className="text-green-600 font-semibold">{inProgress.s.day} · {inProgress.s.location}</div>
                <div className="text-green-500 text-sm mt-1">Ends in <strong>{mins}m {secs}s</strong></div>
            </div>
        );
    }

    const sorted = [...windows].sort((a, b) => a.start.getTime() - b.start.getTime());
    const next = sorted[0];
    const diff = Math.max(0, next.start.getTime() - now.getTime());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2 text-center">Next Practice</div>
            <div className="text-center mb-4">
                <div className="font-extrabold text-slate-800 text-lg">{next.s.day}</div>
                <div className="text-slate-500 text-sm">{fmt12(next.s.startTime)} – {fmt12(next.s.endTime)}</div>
                <div className="text-slate-400 text-xs mt-1">📍 {next.s.location}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                {[['DAYS', days], ['HRS', hours], ['MIN', minutes], ['SEC', seconds]].map(([label, val]) => (
                    <div key={label as string} className="bg-white border border-indigo-100 rounded-xl p-2 shadow-sm">
                        <div className="text-2xl font-black text-indigo-600 tabular-nums">{String(val).padStart(2, '0')}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const CommunityDetail: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const { getModuleById } = useCommunityData();
    const queryClient = useQueryClient();

    type TabType = 'about' | 'announcements' | 'officials' | 'activities' | 'gallery' | 'classes' | 'schedules' | 'members';
    const [activeTab, setActiveTab] = useState<TabType>('about');
    const [showRegistration, setShowRegistration] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', experience: '', voiceType: '', musicLevel: 'Beginner' });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activePhoto, setActivePhoto] = useState<any | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [activeCheckoutId, setActiveCheckoutId] = useState<string | null>(null);
    const [verificationTimeout, setVerificationTimeout] = useState(false);
    const [pendingPayment, setPendingPayment] = useState<{ amount: number; description: string; type: 'Join' | 'Uniform' | 'Class' }>({ amount: 0, description: '', type: 'Join' });

    // Robust Fee Parser
    const parseFee = (val: any): number => {
        if (typeof val === 'number') return val;
        if (!val || typeof val !== 'string') return 0;
        if (val.toLowerCase().includes('free') || val.toLowerCase().includes('none')) return 0;
        const match = val.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    };

    const enrollMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const endpoint = moduleData?.registrationEndpoint || '/api/enrollments';
            const isSimple = isCharismatic || isDancers || isYouth;
            const payload = isSimple ? {
                fullName: data.name,
                phoneNumber: data.phone,
                email: data.email || '',
                community: isDancers ? 'dancers' : isYouth ? 'youth' : 'charismatic',
                status: 'Pending'
            } : {
                full_name: data.name,
                class_id: selectedClassId || moduleId,
                module_id: moduleId,
                voice_type: data.voiceType || '', // Use actual voice type for all groups
                music_level: data.musicLevel || 'Beginner', // Use actual music level for all groups
                phone: data.phone || '',
                email: data.email || '',
                status: 'Pending',
            };

            if (isSimple) {
                console.log(`Submitting ${moduleId} Registration:`, payload);
            }

            return await apiClient.post(endpoint, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments', moduleId] });
            toast.success('Registration submitted successfully!');
            setShowRegistration(false);
            setShowSuccessModal(true);
            setSelectedClassId(null);
            setFormData({ name: '', phone: '', email: '', experience: '', voiceType: '', musicLevel: 'Beginner' });
        },
        onError: () => {
            toast.error('Failed to submit application. Please try again.');
        }
    });

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let amount = 0;
        let pType: 'Join' | 'Class' = 'Join';
        let desc = `Joining ${moduleData?.title}`;

        if (isCharismatic || isDancers || isYouth) {
            amount = 0;
        } else if (isChoir || isStFrancis) {
            amount = 20;
            pType = 'Join';
        } else if (selectedClassId) {
            const cls = moduleData?.musicClasses?.find(c => c.id === selectedClassId);
            amount = parseFee(cls?.fee);
            pType = 'Class';
            desc = `Class Enrollment: ${cls?.title}`;
        } else {
            amount = parseFee(moduleData?.fees?.registration);
        }

        if (amount <= 0) {
            enrollMutation.mutate(formData);
        } else {
            setPendingPayment({ amount, description: desc, type: pType });
            setShowPaymentModal(true);
        }
    };

    const initiateSpecificPayment = (amt: number, desc: string, type: 'Join' | 'Uniform') => {
        setPendingPayment({ amount: amt, description: desc, type });
        setShowPaymentModal(true);
    };

    const handleVerifyPayment = async () => {
        if (!activeCheckoutId) return;
        setIsProcessingPayment(true);
        try {
            const statusRes = await apiClient.get(`/authentication/stk-push-status/${activeCheckoutId}`);
            if (statusRes.data.status === 'paid') {
                setIsProcessingPayment(false);
                toast.success('Payment received! Completing registration...');
                if (pendingPayment.type === 'Join' || pendingPayment.type === 'Class') {
                    enrollMutation.mutate(formData);
                }
                setShowPaymentModal(false);
                setVerificationTimeout(false);
                setActiveCheckoutId(null);
            } else if (statusRes.data.status === 'failed') {
                setIsProcessingPayment(false);
                toast.error(`Payment failed: ${statusRes.data.result_desc || 'Cancelled by user'}`);
                setVerificationTimeout(false);
                setActiveCheckoutId(null);
            } else {
                setIsProcessingPayment(false);
                toast.error('Payment still pending. If you paid, wait a moment and try again.');
            }
        } catch (error) {
            setIsProcessingPayment(false);
            toast.error('Could not verify payment status. Try again.');
        }
    };

    const handleConfirmPayment = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setIsProcessingPayment(true);
        setVerificationTimeout(false);
        const loadingToast = toast.loading('Initiating M-Pesa Payment...');

        try {
            const res = await apiClient.post('/authentication/stk-push-guest', {
                phoneNumber: formData.phone,
                amount: pendingPayment.amount,
                description: pendingPayment.description
            });
            
            const checkoutId = res.data.checkoutId;
            setActiveCheckoutId(checkoutId);
            toast.success('M-Pesa prompt sent. Please enter your PIN on your phone.', { id: loadingToast });
            toast.loading('Processing payment... Do not close this window.', { id: 'pollingToast' });

            const pollPayment = setInterval(async () => {
                try {
                    const statusRes = await apiClient.get(`/authentication/stk-push-status/${checkoutId}`);
                    if (statusRes.data.status === 'paid') {
                        clearInterval(pollPayment);
                        setIsProcessingPayment(false);
                        toast.success('Payment received! Completing registration...', { id: 'pollingToast' });
                        if (pendingPayment.type === 'Join' || pendingPayment.type === 'Class') {
                            enrollMutation.mutate(formData);
                        }
                        setShowPaymentModal(false);
                        setActiveCheckoutId(null);
                    } else if (statusRes.data.status === 'failed') {
                        clearInterval(pollPayment);
                        setIsProcessingPayment(false);
                        toast.error(`Payment failed: ${statusRes.data.result_desc || 'Cancelled by user'}`, { id: 'pollingToast' });
                        setActiveCheckoutId(null);
                    }
                } catch (err) {
                    // Ignore transient errors and continue polling
                }
            }, 3000);

            // Timeout after 120 seconds
            setTimeout(() => {
                clearInterval(pollPayment);
                setIsProcessingPayment(false);
                setVerificationTimeout(true);
                toast.error('Payment verification timed out.', { id: 'pollingToast' });
            }, 120000);

        } catch (error: any) {
            setIsProcessingPayment(false);
            toast.error(error.response?.data?.message || 'Failed to initiate payment. Check your internet.', { id: loadingToast });
        }
    };

    const openClassEnrollment = (classId: string) => {
        setSelectedClassId(classId);
        setShowRegistration(true);
        setActiveTab('about');
        window.scrollTo({ top: 500, behavior: 'smooth' });
    };

    const { data: serverModuleData, isLoading, isError } = useQuery({
        queryKey: ['community', moduleId],
        queryFn: async () => {
            const res = await apiClient.get(`/community-view/${moduleId}`);
            if (res.data?.isMissing || res.data?.isServerError) throw new Error('Not available');
            return res.data;
        },
        retry: 1,
        staleTime: 300000
    });

    const { data: enrollmentsData = [] } = useQuery({
        queryKey: ['enrollments', moduleId],
        queryFn: async () => {
            const res = await apiClient.get('/enrollments');
            if (moduleId === 'charismatic') {
                console.log("Charismatic Members:", res.data);
            }
            // Filter by class_id matching moduleId
            return Array.isArray(res.data) 
                ? res.data.filter((e: any) => e.class_id === moduleId || e.module_id === moduleId)
                : [];
        },
        retry: 1,
        staleTime: 300000
    });

    const contextFallback = moduleId ? getModuleById(moduleId) : undefined;
    const moduleData: CommunityModule | undefined = serverModuleData || contextFallback;

    const isChoir = moduleId === 'choir';
    const isStFrancis = moduleId === 'st-francis';
    const isCharismatic = moduleId === 'charismatic';
    const isDancers = moduleId === 'dancers';
    const isYouth = moduleId === 'youth';

    const getWhatsAppNumber = (phone?: string) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 10 && digits.startsWith('0')) {
            return `254${digits.slice(1)}`;
        }
        if (digits.length === 12 && digits.startsWith('254')) {
            return digits;
        }
        return digits;
    };

    const coordinator = moduleData?.officials?.find(official => official.phoneNumber || (official as any).phone);
    const coordinatorWhatsApp = coordinator ? getWhatsAppNumber(coordinator.phoneNumber || (coordinator as any).phone) : '';
    const contactHref = coordinatorWhatsApp ? `https://wa.me/${coordinatorWhatsApp}` : 'mailto:info@church.com';
    const contactLabel = coordinatorWhatsApp ? 'Chat with Coordinator on WhatsApp' : 'Contact Coordinator';

    const availableTabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'about', label: 'About', icon: 'fas fa-info-circle' },
        { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
        ...(moduleData?.musicClasses?.length ? [{ id: 'classes' as TabType, label: 'Classes', icon: 'fas fa-graduation-cap' }] : []),
        ...(moduleData?.practiceSchedules?.length ? [{ id: 'schedules' as TabType, label: moduleData.scheduleLabel || 'Schedule', icon: 'fas fa-clock' }] : []),
        { id: 'officials', label: 'Leadership', icon: 'fas fa-users' },
        ...(enrollmentsData?.length && !isStFrancis && !isCharismatic && !isDancers && !isYouth ? [{ id: 'members' as TabType, label: 'Members', icon: 'fas fa-user-group' }] : []),
        { id: 'activities', label: 'Activities', icon: 'fas fa-calendar-alt' },
        { id: 'gallery', label: 'Gallery', icon: 'fas fa-images' }
    ];

    if (isLoading && !contextFallback) {
        return (
            <div className="w-full bg-[#faf8f5] min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin text-amber-800"><i className="fas fa-circle-notch text-4xl"></i></div>
            </div>
        );
    }

    if (!moduleData) {
        return (
            <div className="w-full bg-[#faf8f5] flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] border border-stone-200/70 max-w-md">
                    <i className="fas fa-exclamation-triangle text-4xl text-amber-500 mb-4"></i>
                    <h2 className="text-xl font-bold text-stone-800 mb-2">Ministry Not Found</h2>
                    <p className="text-stone-500 mb-6">We could not find the community ministry you are looking for.</p>
                    <button onClick={() => navigate('/community')} className="px-6 py-2 bg-stone-900 text-white rounded-full font-medium">Back to Community</button>
                </div>
            </div>
        );
    }

    const mood = MINISTRY_MOOD[moduleId || ''] || DEFAULT_MOOD;
    const heroImage = moduleData?.saint_image_url || moduleData?.image_url;

    return (
        <div className="w-full bg-[#faf8f5] min-h-screen pb-24 animate-fade-in font-sans text-stone-800">
            {/* hand-torn parish strip */}
            <div className="h-2 bg-[repeating-linear-gradient(135deg,#7c2d12_0_14px,#9a3412_14px_28px)] opacity-90" />

            {/* ══════════ Editorial Hero ══════════ */}
            <div className="w-full relative overflow-hidden">
                {heroImage && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={heroImage}
                            alt={moduleData.title}
                            className="w-full h-full object-cover brightness-[0.5] saturate-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-stone-900/40 to-transparent" />
                    </div>
                )}

                <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28 relative z-10">
                    <Link
                        to="/community"
                        className="inline-flex items-center gap-1.5 text-stone-200 hover:text-white text-xs font-bold uppercase tracking-[0.22em] mb-6 transition-colors"
                    >
                        <ChevronLeft size={14} /> All ministries
                    </Link>

                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                            style={{ backgroundColor: mood.accent }}
                        >
                            {mood.icon}
                        </div>

                        <div className="text-white">
                            <span
                                className="text-[11px] font-bold uppercase tracking-[0.24em] inline-block mb-3"
                                style={{ color: '#fcd34d' }}
                            >
                                {mood.kicker}
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                                {moduleData.title}
                            </h1>
                            <p className="mt-4 text-stone-200 max-w-2xl text-base md:text-lg leading-relaxed">
                                {moduleData.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════ Page Container ══════════ */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-20">
                {/* Tab bar */}
                <div className="bg-white/70 backdrop-blur-sm border border-stone-200/70 rounded-sm shadow-[0_10px_40px_-24px_rgba(60,40,20,0.3)] p-1.5 mb-8 flex flex-wrap gap-1.5 justify-center md:justify-start sticky top-2">
                    {availableTabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-sm font-bold flex items-center gap-2 transition-all text-[13px] cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-stone-900 text-white shadow'
                                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                            }`}
                        >
                            {tabIcons[tab.id] || <Info size={14} />}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* ABOUT TAB */}
                        {activeTab === 'about' && (
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 border border-slate-100 animate-fade-in relative">
                                {isError && (
                                    <div className="absolute top-6 right-6 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle size={14} /> Offline Mode
                                    </div>
                                )}
                                
                                {(isCharismatic || isStFrancis) ? (
                                    <div className="mb-10">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* Biography/Description Left Side */}
                                            <div className="flex-1">
                                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">
                                                    Welcome to {moduleData.title}
                                                </h2>
                                                <p className="text-slate-600 leading-relaxed text-base md:text-lg whitespace-pre-line font-medium mb-6">
                                                    {moduleData.story || moduleData.about || moduleData.description}
                                                </p>
                                                
                                                {/* PDF Button */}
                                                {(moduleData.history_pdf_url || moduleData.pdf_url) && (
                                                    <div className="mb-6">
                                                        <a 
                                                            href={moduleData.history_pdf_url || moduleData.pdf_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                                        >
                                                            <FileText size={18} />
                                                            View Full History (PDF)
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Image Right Side */}
                                            {(moduleData.saint_image_url || moduleData.image_url) && (
                                                <div className="w-full md:w-1/3 shrink-0">
                                                    <img 
                                                        src={moduleData.saint_image_url || moduleData.image_url} 
                                                        alt={moduleData.title} 
                                                        className="w-full h-auto rounded-2xl shadow-md object-cover" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">
                                            Welcome to {moduleData.title}
                                        </h2>
                                        <p className="text-slate-600 leading-relaxed text-base md:text-lg whitespace-pre-line mb-8 font-medium">
                                            {moduleData.story || moduleData.about || moduleData.description}
                                        </p>
                                    </>
                                )}

                                {/* Agenda Section */}
                                {moduleData.agenda && moduleData.agenda.length > 0 && (
                                    <div className="mb-10">
                                        <h3 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-50 pb-2">
                                            <FileText className="text-blue-600 w-5 h-5" /> Our Mission & Objectives
                                        </h3>
                                        <ul className="space-y-4">
                                            {moduleData.agenda.map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-slate-700 font-semibold text-sm leading-relaxed pt-0.5">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Registration CTA */}
                                <div className="p-8 bg-amber-50/40 border border-amber-200/70 rounded-sm shadow-inner relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                                            {selectedClassId ? 'Class Enrollment' : 'Ready to Join?'}
                                        </h3>
                                        
                                        <p className="text-slate-500 mb-6 font-semibold text-sm leading-relaxed">
                                            {selectedClassId 
                                                ? 'Enrolling in a specialized training program designed to help you build key skills.' 
                                                : isCharismatic
                                                    ? 'Join our Charismatic Prayer Group community of faith, healing, worship, and spiritual growth.'
                                                    : "We are always welcoming new hearts to share in our service. Submit your enrollment to get started."
                                            }
                                        </p>

                                        {!showRegistration ? (
                                                <button 
                                                    onClick={() => setShowRegistration(true)} 
                                                    className="inline-flex items-center gap-2.5 px-8 py-4 text-white font-black text-xs uppercase tracking-wider rounded-sm shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                                                    style={{ backgroundColor: mood.accent }}
                                                >
                                                    <FileText size={16} /> Join this Ministry
                                                </button>
                                        ) : (
                                            <form onSubmit={handleRegisterSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-lg border border-blue-100 relative">
                                                {enrollMutation.isPending && (
                                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                                        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-black text-slate-800 text-base uppercase tracking-wider">Enrollment Form</h4>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setShowRegistration(false); setSelectedClassId(null); }} 
                                                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Full Name</label>
                                                        <input 
                                                            required 
                                                            type="text" 
                                                            value={formData.name} 
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-semibold" 
                                                            placeholder="John Doe" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Phone Number</label>
                                                        <input 
                                                            required 
                                                            type="tel" 
                                                            value={formData.phone} 
                                                            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-semibold" 
                                                            placeholder="e.g. 0712345678" 
                                                        />
                                                    </div>
                                                </div>

                                                {isChoir ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Voice Type</label>
                                                            <select 
                                                                required 
                                                                value={formData.voiceType} 
                                                                onChange={e => setFormData({ ...formData, voiceType: e.target.value })} 
                                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-semibold"
                                                            >
                                                                <option value="">Select Voice</option>
                                                                <option>Soprano</option>
                                                                <option>Alto</option>
                                                                <option>Tenor</option>
                                                                <option>Bass</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Skill Level</label>
                                                            <select 
                                                                value={formData.musicLevel} 
                                                                onChange={e => setFormData({ ...formData, musicLevel: e.target.value })} 
                                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-semibold"
                                                            >
                                                                <option>Beginner</option>
                                                                <option>Intermediate</option>
                                                                <option>Advanced</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ) : (isStFrancis || isCharismatic || isDancers || isYouth) ? (
                                                    /* Simple prayer group form, no music/experience fields */
                                                    <></>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Voice Type (Optional)</label>
                                                            <select 
                                                                value={formData.voiceType} 
                                                                onChange={e => setFormData({ ...formData, voiceType: e.target.value })} 
                                                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold"
                                                            >
                                                                <option value="">Not applicable</option>
                                                                <option>Soprano</option>
                                                                <option>Alto</option>
                                                                <option>Tenor</option>
                                                                <option>Bass</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Experience Level (Optional)</label>
                                                            <select 
                                                                value={formData.musicLevel} 
                                                                onChange={e => setFormData({ ...formData, musicLevel: e.target.value })} 
                                                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold"
                                                            >
                                                                <option>Beginner</option>
                                                                <option>Intermediate</option>
                                                                <option>Advanced</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Email Address (Optional)</label>
                                                    <input 
                                                        type="email" 
                                                        value={formData.email} 
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-semibold" 
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                                
                                                {!isStFrancis && !isCharismatic && !isDancers && !isYouth && (
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Notes / Why do you want to join?</label>
                                                        <textarea 
                                                            value={formData.experience} 
                                                            onChange={e => setFormData({ ...formData, experience: e.target.value })} 
                                                            rows={3} 
                                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none resize-none transition-all text-sm font-semibold" 
                                                            placeholder="Brief details about your motivation or past experience..."
                                                        />
                                                    </div>
                                                )}
                                                
                                                <button 
                                                    type="submit" 
                                                    className="w-full py-4 text-white font-black text-xs uppercase tracking-wider rounded-sm shadow-lg transition-all cursor-pointer"
                                                    style={{ backgroundColor: mood.accent }}
                                                >
                                                    Submit Application
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CLASSES TAB (Choir-specific) */}
                        {activeTab === 'classes' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">Music Classes</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {moduleData.musicClasses?.map(mc => (
                                        <div key={mc.id} className="p-6 bg-slate-50 border border-slate-100 rounded-sm hover:border-blue-200 hover:shadow-md transition duration-300 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{mc.title}</h3>
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg shrink-0">{mc.skillLevel}</span>
                                            </div>
                                            <p className="text-slate-500 text-sm mb-4 leading-relaxed flex-grow">{mc.description}</p>
                                            
                                            <div className="space-y-2 mb-5">
                                                {mc.instructor && (
                                                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                                        <Users size={14} /> {mc.instructor}
                                                    </div>
                                                )}
                                                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                                    <Clock size={14} /> {mc.schedule}
                                                </div>
                                            </div>
                                            
                                                <button 
                                                    onClick={() => openClassEnrollment(mc.id)} 
                                                    className="w-full py-3 text-white rounded-sm font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                                                    style={{ backgroundColor: mood.accent }}
                                                >
                                                    Join Class
                                                </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SCHEDULES TAB */}
                        {activeTab === 'schedules' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">
                                    {moduleData.scheduleLabel || 'Schedules'}
                                </h2>
                                <div className="space-y-4">
                                    {moduleData.practiceSchedules?.map(ps => (
                                        <div key={ps.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-100 rounded-sm shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-300 gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{ps.day}</h3>
                                                    <p className="text-slate-500 font-semibold text-xs mt-1">📍 {ps.location}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100 shrink-0 text-center">
                                                {fmt12(ps.startTime)} – {fmt12(ps.endTime)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ANNOUNCEMENTS TAB */}
                        {activeTab === 'announcements' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in relative">
                                {isError && (
                                    <div className="absolute top-6 right-6 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle size={14} /> Offline Mode
                                    </div>
                                )}
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">Latest Announcements</h2>
                                {moduleData.announcements && moduleData.announcements.length > 0 ? (
                                    <div className="space-y-4">
                                        {moduleData.announcements.map((ann: any) => (
                                            <div key={ann.id} className="p-6 border-l-4 border-l-amber-500 bg-amber-50/20 rounded-r-3xl shadow-sm hover:shadow-md transition duration-300">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                                                    <h3 className="text-lg font-black text-slate-800">{ann.announcement_title || ann.title}</h3>
                                                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full w-fit">
                                                        {new Date(ann.announcement_date || ann.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed font-semibold">{ann.announcement_content || ann.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p className="font-semibold text-sm">No announcements at this time.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OFFICIALS TAB */}
                        {activeTab === 'officials' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in relative">
                                {isError && (
                                    <div className="absolute top-6 right-6 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle size={14} /> Offline Mode
                                    </div>
                                )}
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">Our Leadership</h2>
                                {moduleData.officials && moduleData.officials.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {moduleData.officials.map((official: any) => (
                                            <div key={official.id} className="flex items-center gap-4 p-5 border border-slate-100 rounded-sm hover:shadow-lg transition bg-slate-50/50 hover:bg-white group duration-300">
                                                {official.photo_url || official.photoUrl ? (
                                                    <img 
                                                        src={official.photo_url || official.photoUrl} 
                                                        alt={official.name} 
                                                        className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition duration-300" 
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
                                                        {official.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="font-black text-slate-800 text-base group-hover:text-blue-600 transition truncate">{official.name}</h3>
                                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider truncate">{official.role}</p>
                                                    <div className="flex gap-3 text-xs font-black uppercase tracking-wider">
                                                        {official.email && (
                                                            <a href={`mailto:${official.email}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                                <Mail size={12} /> Email
                                                            </a>
                                                        )}
                                                        {(official.phoneNumber || official.phone) && (
                                                            <a href={`tel:${official.phoneNumber || official.phone}`} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                                                                <Phone size={12} /> Call
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p className="font-semibold text-sm">No leadership listed yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MEMBERS TAB */}
                        {activeTab === 'members' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in relative">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">
                                    Registered Members ({enrollmentsData?.length || 0})
                                </h2>
                                {enrollmentsData && enrollmentsData.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {enrollmentsData.map((member: any) => (
                                            <div key={member.id} className="p-6 border border-slate-100 rounded-sm bg-slate-50/50 hover:bg-white hover:shadow-lg transition group duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
                                                        {(member.fullName || member.full_name || '?').charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h3 className="font-black text-slate-800 text-base group-hover:text-blue-600 transition truncate">{member.fullName || member.full_name}</h3>
                                                        <span className={`text-[10px] font-black uppercase tracking-wider inline-block mt-1 px-2.5 py-1 rounded-lg ${
                                                            member.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : member.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        }`}>
                                                            {member.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100/80 text-xs font-semibold">
                                                    {!isCharismatic && !isDancers && !isYouth && member.voice_type && (
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Voice</span>
                                                            <span className="text-slate-700 font-black">{member.voice_type}</span>
                                                        </div>
                                                    )}
                                                    {!isCharismatic && !isDancers && !isYouth && member.music_level && (
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Level</span>
                                                            <span className="text-slate-700 font-black">{member.music_level}</span>
                                                        </div>
                                                    )}
                                                    {(member.phoneNumber || member.phone) && (
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                                                            <a href={`tel:${member.phoneNumber || member.phone}`} className="text-blue-600 hover:text-blue-800 font-black transition">{member.phoneNumber || member.phone}</a>
                                                        </div>
                                                    )}
                                                    {(member.email) && (
                                                        <div className="flex justify-between items-center gap-2">
                                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Email</span>
                                                            <a href={`mailto:${member.email}`} className="text-blue-600 hover:text-blue-800 font-black transition truncate max-w-[150px]">{member.email}</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p className="font-semibold text-sm">No members registered yet. Be the first to join!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ACTIVITIES TAB */}
                        {activeTab === 'activities' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in relative">
                                {isError && (
                                    <div className="absolute top-6 right-6 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle size={14} /> Offline Mode
                                    </div>
                                )}
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-5 tracking-tight">Upcoming Activities</h2>
                                {moduleData.activities && moduleData.activities.length > 0 ? (
                                    <div className="space-y-4">
                                        {moduleData.activities.map((activity: any) => (
                                            <div key={activity.id} className="flex flex-col md:flex-row p-6 border border-slate-100 rounded-sm bg-white shadow-sm hover:border-blue-100 hover:shadow-md transition-all duration-300">
                                                <div className="md:w-44 mb-4 md:mb-0 md:border-r border-slate-100 md:pr-6 flex flex-col justify-center">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1.5 w-fit px-2.5 py-1 rounded ${
                                                        activity.status === 'Upcoming' 
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    }`}>
                                                        {activity.status || 'Event'}
                                                    </span>
                                                    <span className="font-black text-slate-700 text-sm flex items-center gap-1.5 mt-1">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        {new Date(activity.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="md:pl-6 flex-grow flex flex-col justify-center">
                                                    <h3 className="text-lg font-black text-slate-800 mb-1 leading-snug">{activity.title}</h3>
                                                    <p className="text-slate-500 text-sm leading-relaxed font-semibold">{activity.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p className="font-semibold text-sm">No activities scheduled yet. Join us for regular gatherings!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GALLERY TAB */}
                        {activeTab === 'gallery' && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-8 border border-stone-200/70 animate-fade-in relative flex flex-col">
                                {isError && (
                                    <div className="absolute top-6 right-6 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertTriangle size={14} /> Offline Mode
                                    </div>
                                )}
                                
                                {/* Photo Gallery Header with Photo Count */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Photo Gallery</h2>
                                        <p className="text-slate-500 font-semibold text-xs mt-1">Capturing our memorable moments and celebrations</p>
                                    </div>
                                    {moduleData.gallery && moduleData.gallery.length > 0 && (
                                        <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-black text-xs uppercase tracking-wider shrink-0 w-fit">
                                            {moduleData.gallery.length} {moduleData.gallery.length === 1 ? 'Photo' : 'Photos'}
                                        </span>
                                    )}
                                </div>

                                {/* Scrollable Gallery Container with Fixed Responsive Height */}
                                <div 
                                    className="pr-3 gallery-scrollbar"
                                    style={{ height: '650px', maxHeight: '75vh', overflowY: 'scroll' }}
                                >
                                    {moduleData.gallery && moduleData.gallery.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pb-4">
                                            {moduleData.gallery.map((img: any) => (
                                                <div 
                                                    key={img.id} 
                                                    onClick={() => setActivePhoto(img)}
                                                    className="group relative rounded-sm overflow-hidden aspect-[4/3] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-zoom-in border border-slate-100 bg-slate-50"
                                                >
                                                    <img 
                                                        src={img.url || img.imageUrl || img.image_url} 
                                                        alt={img.caption || img.eventName} 
                                                        loading="lazy"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <p className="text-white font-bold text-sm leading-snug">{img.caption || img.eventName}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                            <p className="font-semibold text-sm">Photos will appear here soon.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Practice Countdown - Choir only */}
                        {isChoir && moduleData.practiceSchedules && moduleData.practiceSchedules.length > 0 && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-6 border border-stone-200/70">
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                                    <h3 className="text-lg font-black text-indigo-950">Next Practice</h3>
                                </div>
                                <PracticeCountdown schedules={moduleData.practiceSchedules} />
                            </div>
                        )}

                        {/* Meeting / Training Schedule (sidebar) */}
                        <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-6 border border-stone-200/70 relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 text-slate-50 opacity-30 scale-150 pointer-events-none">
                                <Clock className="w-32 h-32 text-slate-100" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                                    <h3 className="text-xl font-black text-indigo-950">{moduleData.scheduleLabel || 'Meeting Time'}</h3>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                    <p className="text-slate-700 font-semibold text-sm leading-relaxed">
                                        {(moduleData as any).training || moduleData.meetingSchedule || 'Contact parish office for schedule.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        {moduleData.fees && (moduleData.fees.registration || moduleData.fees.uniform) && (
                            <div className="bg-white rounded-sm shadow-[0_10px_40px_-22px_rgba(60,40,20,0.25)] p-6 border border-stone-200/70 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 text-slate-50 opacity-30 scale-125 pointer-events-none">
                                    <Coins className="w-28 h-28 text-slate-100" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Coins className="w-5 h-5" /></div>
                                        <h3 className="text-xl font-black text-emerald-950">Ministry Fees</h3>
                                    </div>
                                    <ul className="space-y-4 text-slate-700">
                                        {moduleData.fees.registration !== undefined && (
                                            <li className="flex justify-between items-center border-b border-slate-100 pb-3 gap-4">
                                                <div className="flex-grow">
                                                    <span className="text-slate-500 font-semibold text-xs block">Registration</span>
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {moduleData.fees.registration === 0 || moduleData.fees.registration === 'Free' ? (
                                                            <span className="text-emerald-600">Free</span>
                                                        ) : (
                                                            `Ksh ${moduleData.fees.registration}`
                                                        )}
                                                    </span>
                                                </div>
                                                {moduleData.fees.registration !== 0 && moduleData.fees.registration !== 'Free' && (
                                                    <button
                                                        onClick={() => initiateSpecificPayment(Number(moduleData.fees?.registration), `Registration for ${moduleData.title}`, 'Join')}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                                                    >
                                                        PAY NOW
                                                    </button>
                                                )}
                                            </li>
                                        )}
                                        {moduleData.fees.uniform && (
                                            <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-start mb-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-black text-emerald-600 block uppercase tracking-wider">Uniform Info</span>
                                                        <span className="text-xs text-slate-700 font-bold leading-relaxed block mt-1">{moduleData.fees.uniform}</span>
                                                    </div>
                                                    {moduleData.fees.uniform.includes('Ksh') && (
                                                        <button 
                                                            onClick={() => {
                                                                const amt = parseFee(moduleData.fees?.uniform);
                                                                initiateSpecificPayment(amt, `Uniform for ${moduleData.title}`, 'Uniform');
                                                            }}
                                                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer shrink-0"
                                                        >
                                                            ORDER
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Contact CTA */}
                        <div className="rounded-sm p-8 text-white text-center shadow-[0_10px_40px_-22px_rgba(60,40,20,0.3)] border border-stone-200/70 relative overflow-hidden" style={{ backgroundColor: mood.accent }}>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black mb-2">Need more info?</h3>
                                <p className="text-white/80 mb-6 text-sm font-semibold leading-relaxed">Reach out to the ministry coordinator for any questions.</p>
                                <a 
                                    href={contactHref} 
                                    target={coordinatorWhatsApp ? '_blank' : undefined}
                                    rel={coordinatorWhatsApp ? 'noopener noreferrer' : undefined}
                                    className="inline-flex items-center justify-center gap-2 mx-auto px-6 py-4 bg-white text-stone-900 rounded-sm font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] duration-300 hover:bg-stone-100"
                                >
                                    {coordinatorWhatsApp && <FaWhatsapp className="text-[#25D366]" size={16} />}
                                    {contactLabel}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <CommunityModal 
                isOpen={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)}
                title="Welcome Aboard!"
                type="success"
            >
                <p className="mb-4 text-slate-650 font-semibold leading-relaxed">
                    Your application to join <strong>{moduleData.title}</strong> has been received by our coordinators.
                </p>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={18} />
                    <p className="text-sm text-emerald-700 font-semibold leading-relaxed">
                        Please attend our next meeting on <strong>{moduleData.meetingSchedule}</strong> for a brief orientation.
                    </p>
                </div>
            </CommunityModal>

            {/* Payment Modal / M-Pesa Confirmation */}
            <CommunityModal
                isOpen={showPaymentModal}
                onClose={() => !isProcessingPayment && setShowPaymentModal(false)}
                title={pendingPayment.type === 'Join' ? 'Registration Payment' : pendingPayment.description}
                type="info"
            >
                <div className="space-y-4 mb-6">
                    <p className="text-slate-600 font-medium">To complete your registration, please make a payment of <strong>Ksh {pendingPayment.amount}</strong>.</p>
                </div>

                <div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100 mb-6">
                    <h4 className="font-black text-emerald-900 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <MapPin size={16} /> M-PESA Payment
                    </h4>
                    <p className="text-xs text-emerald-700 font-semibold leading-relaxed">Enter your M-PESA number to receive the payment prompt:</p>
                    <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        disabled={isProcessingPayment}
                        className="w-full mt-3 p-3.5 bg-white border border-emerald-200 focus:border-emerald-600 rounded-2xl outline-none text-emerald-950 font-black text-sm disabled:opacity-50"
                        placeholder="e.g. 0712345678"
                    />
                </div>
                
                {verificationTimeout ? (
                    <div className="space-y-3">
                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-semibold">
                            We could not confirm payment automatically. If you have already paid, click below to verify.
                        </div>
                        <button 
                            onClick={handleVerifyPayment}
                            disabled={isProcessingPayment}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isProcessingPayment ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Payment Status"
                            )}
                        </button>
                        <button 
                            onClick={handleConfirmPayment}
                            disabled={isProcessingPayment}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            Retry Sending Prompt
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleConfirmPayment}
                        disabled={isProcessingPayment}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isProcessingPayment ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing... Check Phone
                            </>
                        ) : (
                            `Pay Ksh ${pendingPayment.amount}`
                        )}
                    </button>
                )}
            </CommunityModal>

            {/* Gallery Lightbox Modal */}
            {activePhoto && (
                <div 
                    className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in cursor-zoom-out"
                    onClick={() => setActivePhoto(null)}
                >
                    {/* Close button */}
                    <button 
                        onClick={() => setActivePhoto(null)} 
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                    >
                        <X size={24} />
                    </button>

                    {/* Image container */}
                    <div 
                        className="relative max-w-5xl max-h-[80vh] flex flex-col items-center justify-center cursor-default"
                        onClick={e => e.stopPropagation()}
                    >
                        <img 
                            src={activePhoto.url || activePhoto.imageUrl || activePhoto.image_url} 
                            alt={activePhoto.caption || activePhoto.eventName} 
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10 animate-scale-in" 
                        />
                        
                        {/* Caption info panel */}
                        <div className="mt-5 text-center text-white max-w-xl px-4">
                            <h3 className="text-xl font-black tracking-tight">{activePhoto.caption || activePhoto.eventName}</h3>
                            {activePhoto.description && (
                                <p className="text-slate-300 text-sm mt-2 font-medium leading-relaxed">{activePhoto.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityDetail;
