import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { CommunityModule, PracticeSchedule, Announcement, RepertoireItem, FeaturedAudioTrack } from "../../context/CommunityDataContext";
import {
  FaCalendarDay,
  FaClock,
  FaChurch,
  FaUsers,
  FaDownload,
  FaStar,
  FaPrayingHands,
  FaMusic,
  FaVolumeUp,
  FaVolumeMute,
  FaPlay,
  FaPause,
  FaExclamationCircle,
  FaUserTie,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaArrowRight,
  FaMicrophone,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaShareAlt,
  FaLayerGroup,
  FaCheckCircle,
  FaHeadphones,
  FaBible,
  FaFire,
  FaCopy,
  FaCheck,
  FaPlus,
  FaTimes,
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaTshirt,
  FaVideo,
  FaImages,
  FaChild,
  FaAward,
  FaHeart,
  FaLeaf,
  FaTree,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaDonate,
  FaHome,
  FaSeedling,
  FaRecycle,
  FaSun,
  FaDove,
  FaGraduationCap,
  FaBriefcase,
  FaBookOpen,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaLightbulb,
  FaComments
} from "react-icons/fa";
import '../../../Jumuiya/components/TabsSystem.css';

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
  charismatic: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
  'st-francis': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
  youth: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  mentorship: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
};
const DEFAULT_COMMUNITY_IMAGE = 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=800';

interface Props {
  module: CommunityModule;
  color: string;
  onNavigateBack: () => void;
  onQuickLink?: (tab: 'officials' | 'activities' | 'channels' | 'tshirts' | 'members' | 'suggestions') => void;
}

// ─── CHARISMATIC RENEWAL DATA ──────────────────────────────────────────────
const CHARISMATIC_VERSES = [
  {
    verse: "In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans.",
    reference: "Romans 8:26",
    theme: "Intercession & The Holy Spirit",
    context: "When words fail, the Spirit carries our burdens straight to the Throne of Grace."
  },
  {
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11",
    theme: "God's Divine Purpose",
    context: "Rest in the assurance that your academic journey, health, and family are in God's hands."
  },
  {
    verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God will guard your hearts.",
    reference: "Philippians 4:6-7",
    theme: "Peace in Prayer",
    context: "Bring your burdens to the Thursday fellowship and watch God replace anxiety with peace."
  },
  {
    verse: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    reference: "Isaiah 40:31",
    theme: "Divine Strength & Hope",
    context: "Let the Holy Spirit uplift you whenever exhaustion and spiritual battles arise."
  },
  {
    verse: "Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.",
    reference: "1 Thessalonians 5:16-18",
    theme: "Continual Fellowship",
    context: "A lifestyle of unceasing praise unlocks spiritual breakthroughs."
  }
];

const INITIAL_PRAYER_INTENTIONS = [
  {
    id: 'int-1',
    title: 'Divine Healing & Recovery for Brother Anthony',
    request: 'Please join in praying for Brother Anthony who underwent surgery this week. We pray for complete restoration, speedy healing, and divine strength for his family.',
    author: 'Sister Grace M.',
    category: 'Healing',
    prayingCount: 38,
    date: '2 hours ago',
    isAnswered: false
  },
  {
    id: 'int-2',
    title: 'Academic Wisdom & Exam Breakthrough for Finalists',
    request: 'Lifting all university and college candidates preparing for upcoming semester examinations. We pray for sharp retention, calm minds, and divine favor.',
    author: 'Final Year Fellowship Member',
    category: 'Academics',
    prayingCount: 52,
    date: 'Yesterday',
    isAnswered: false
  },
  {
    id: 'int-3',
    title: 'Spiritual Renewal & Peace in Our Families',
    request: 'Interceding for reconciliation, spiritual breakthrough, and peace in struggling family homes. May the Holy Spirit soften hearts and restore love.',
    author: 'Anonymous Intercessor',
    category: 'Family Peace',
    prayingCount: 29,
    date: '2 days ago',
    isAnswered: false
  },
  {
    id: 'int-4',
    title: 'Thanksgiving: Miraculous Job Placement & Tuition Grace',
    request: 'Praising God for answering our prayers! After 4 months of prayer wall intercession, God opened a major employment door and cleared all school fees.',
    author: 'Brother Emmanuel K.',
    category: 'Thanksgiving',
    prayingCount: 76,
    date: '3 days ago',
    isAnswered: true
  }
];

const CHARISMATIC_TESTIMONIES = [
  {
    id: 'test-1',
    title: 'Instant Relief & Healing from Chronic Chest Pain',
    story: 'During the Thursday Praise & Worship session, prayers were made for respiratory healing. I felt a warm, soothing sensation over my chest. The chronic pain I battled for months vanished completely!',
    author: 'Sister Christine W.',
    category: 'Physical Healing',
    date: 'August 14, 2026'
  },
  {
    id: 'test-2',
    title: 'Secured Tuition Grace When All Hope Seemed Lost',
    story: 'I was facing exam deregistration due to an insurmountable fee balance. We placed this petition on the Tuesday Intercession Wall. Within 48 hours, an unexpected sponsor cleared the exact deficit.',
    author: 'Brian O. (3rd Year Student)',
    category: 'Academic Grace',
    date: 'August 08, 2026'
  },
  {
    id: 'test-3',
    title: 'Inner Peace & Deliverance from Severe Anxiety',
    story: 'Attending the First Friday Overnight Vigil broke months of panic attacks and restlessness. The Eucharistic Adoration hour brought profound peace that restored my mind and joy.',
    author: 'Anonymous Parishioner',
    category: 'Inner Healing',
    date: 'July 30, 2026'
  }
];

// ─── DANCERS DATA ───────────────────────────────────────────────────────────
const DANCERS_CHOREOGRAPHY = [
  {
    id: 'ch-1',
    title: 'Entrance Procession: Twende Wote Nyumbani',
    part: 'Entrance Liturgy',
    song: 'Twende Wote Nyumbani Mwa Bwana',
    tempo: 'Joyful 4/4 Processional',
    formation: 'V-Formation & Stole Ripple Wave',
    props: 'Gold Waist Sashes & Liturgical Banners',
    notes: 'Synchronized step-touch entrance advancing down the main nave at 10:00 AM Mass.',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'ch-2',
    title: 'Gloria Sacred Sway: Utukufu Juu Mbinguni',
    part: 'Gloria Response',
    song: 'Utukufu Juu Mbinguni (Liturgical Setting)',
    tempo: 'Majestic 3/4 Sway',
    formation: 'Circular Garland around Sanctuary Step',
    props: 'Soft Gold Praise Ribbons',
    notes: 'Reverent bows at holy name invocations with fluid, sweeping arm extensions.',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'ch-3',
    title: 'Offertory Harvest Ministration: Tolea Sadaka',
    part: 'Offertory Procession',
    song: 'Tolea Sadaka Yako Kwa Moyo Safi',
    tempo: 'Rhythmic African Praise',
    formation: 'Double Column Harvest Step with Gifts',
    props: 'Woven Offering Baskets & Fruit Baskets',
    notes: 'Accompanying gift bearers to the altar with high-energy footwork and rhythmic turns.',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'ch-4',
    title: 'Recessional Praise Finale: Heshima na Sifa',
    part: 'Recessional / Thanksgiving',
    song: 'Heshima na Sifa kwa Bwana Mungu',
    tempo: 'Fast 4/4 Celebration',
    formation: 'Radiating Sunburst & Ribbon Spirals',
    props: 'Tambourines & Victory Praise Ribbons',
    notes: 'Exuberant joyful sending forth as congregation departs in celebration.',
    videoUrl: 'https://youtube.com'
  }
];

const DANCERS_COSTUME_CHECKLIST = [
  { item: 'Royal Blue & Gold Liturgical Robe', spec: 'Official pressed team robe with gold trim', mandatory: true, icon: <FaTshirt /> },
  { item: 'Gold Embroidered Waist Sash / Stole', spec: 'Tied on left hip with clean drape', mandatory: true, icon: <FaAward /> },
  { item: 'Clean White Dance / Jazz Shoes', spec: 'White soft split-sole dance flats (no heavy sneakers)', mandatory: true, icon: <FaCheckCircle /> },
  { item: 'Gold Praise Ribbons & Tambourine', spec: 'Handheld 2-meter ribbon wands & tuned tambourines', mandatory: true, icon: <FaStar /> },
  { item: 'Grooming & Hair Staging', spec: 'Neat high bun with gold ribbon band, natural clean makeup', mandatory: true, icon: <FaChild /> }
];

const DANCERS_GALLERY_SNAPSHOTS = [
  { url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600', caption: 'Easter Vigil Sanctuary Ministration', date: 'Easter Solemnity' },
  { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600', caption: 'Solemn Entrance Procession', date: 'Parish Feast Day' },
  { url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=600', caption: 'Offertory Harvest Dance Staging', date: 'Sunday 10AM Mass' },
  { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600', caption: 'Saturday Formation Workshop', date: 'Weekly Rehearsal' }
];

// ─── ST. FRANCIS OF ASSISI DATA ─────────────────────────────────────────────
const ST_FRANCIS_CHARITY_PROJECTS = [
  {
    id: 'ch-proj-1',
    title: "Subukia Pilgrimage & St. Ann's Children's Home",
    desc: "Carrying dry food hampers, clothes, school books, and spiritual encouragement to 120 orphaned children.",
    target: 60000,
    raised: 42500,
    status: "Active Drive",
    badge: "Children & Pilgrimage"
  },
  {
    id: 'ch-proj-2',
    title: "Monthly Elderly & Vulnerable Food Baskets",
    desc: "Distributing essential household foodstuffs (maize flour, rice, cooking oil, soap) to 35 elderly parishioners.",
    target: 35000,
    raised: 28000,
    status: "Monthly Relief",
    badge: "Elderly Care"
  },
  {
    id: 'ch-proj-3',
    title: "Hospital Comfort & Pastoral Visit Ministry",
    desc: "Weekly hospital visits offering prayers, fruit baskets, and hygiene packs to patients in Nazareth & KNH.",
    target: 20000,
    raised: 17500,
    status: "Ongoing Service",
    badge: "Corporal Mercy"
  }
];

const ST_FRANCIS_ECO_PROJECTS = [
  {
    title: "1,000 Indigenous Trees Planting Campaign",
    desc: "Greening our parish compound and planting fruit & shade trees in neighboring community schools.",
    progress: "680 / 1,000 Trees Planted",
    percent: 68,
    icon: <FaTree className="text-emerald-500" />
  },
  {
    title: "Parish Compound Green-Up & Recycling Clean-Up",
    desc: "First Saturday monthly clean-up, waste segregation, and compost manure generation for church flowers.",
    progress: "1st Saturday Monthly · 8:30 AM",
    percent: 100,
    icon: <FaRecycle className="text-emerald-600" />
  },
  {
    title: "Laudato Si' Community Herbal & Organic Garden",
    desc: "Demonstration garden behind the parish hall promoting organic farming and care for mother earth.",
    progress: "Harvesting & Demonstration",
    percent: 85,
    icon: <FaSeedling className="text-emerald-500" />
  }
];

const ST_FRANCIS_SCC_BLOCKS = [
  {
    block: "Block A: Central Campus & Hostels",
    leader: "Bro. Dennis Wachira",
    meetingTime: "Tuesdays at 6:30 PM",
    venue: "Rotational Hostels & LH 21",
    focus: "Student faith fellowship, Rosary, and mutual study aid."
  },
  {
    block: "Block B: Upper Suburbs & Estates",
    leader: "Sister Mary Wambui",
    meetingTime: "Wednesdays at 6:00 PM",
    venue: "Rotational Family Homes",
    focus: "Family prayers, parenting support, and benevolent care."
  },
  {
    block: "Block C: Parish Vicinity & Staff",
    leader: "Bro. Francis Mwangi",
    meetingTime: "Thursdays at 7:00 PM",
    venue: "St. Francis Grotto / Member Homes",
    focus: "Scriptural sharing, hospital visits, and environmental care."
  }
];

const ST_FRANCIS_RESOURCES = [
  {
    title: "St. Francis Community Constitution & Bylaws",
    desc: "Guiding principles, election procedures, and spiritual foundation of our Franciscan fraternity.",
    fileSize: "1.4 MB · PDF",
    tag: "Governance"
  },
  {
    title: "Annual Charity & Financial Transparency Report",
    desc: "Complete audit of funds raised, outreach expenditures, and food basket distribution logs.",
    fileSize: "2.1 MB · PDF",
    tag: "Financial Audit"
  },
  {
    title: "Laudato Si' Creation Care Action Manual",
    desc: "Practical handbook on tree planting, eco-spirituality, water conservation, and parish recycling.",
    fileSize: "3.5 MB · PDF",
    tag: "Eco-Stewardship"
  },
  {
    title: "SCC Neighborhood Prayer & Visitation Guide",
    desc: "Liturgical readings, Rosary meditations, and home visitation etiquette for Small Christian Communities.",
    fileSize: "1.8 MB · PDF",
    tag: "SCC Fellowship"
  }
];

// ─── MENTORSHIP PROGRAM DATA ────────────────────────────────────────────────

// Mentorship Pillars & Tracks
const MENTORSHIP_PILLARS = [
  {
    icon: <FaPrayingHands className="text-purple-600" />,
    title: 'Spiritual Formation',
    color: '#7c3aed',
    lightColor: '#ede9fe',
    badge: 'Faith & Prayer',
    desc: 'Weekly faith reflections, personal prayer discipline, Catholic social teaching, and discernment of vocation with a spiritual director.',
    outcomes: ['Personal prayer routine', 'Vocation clarity', 'Sacramental life deepening', 'Faith-work integration']
  },
  {
    icon: <FaBriefcase className="text-sky-600" />,
    title: 'Career Guidance',
    color: '#0369a1',
    lightColor: '#e0f2fe',
    badge: 'Jobs & Branding',
    desc: 'Professional CV writing, LinkedIn branding, industry mentoring, internship placement, and networking with Catholic professional circles.',
    outcomes: ['Polished CV & cover letter', 'LinkedIn profile optimization', 'Industry mentor pairing', 'Job search strategy']
  },
  {
    icon: <FaBookOpen className="text-emerald-600" />,
    title: 'Academic Coaching',
    color: '#047857',
    lightColor: '#d1fae5',
    badge: 'Excellence & Exams',
    desc: 'Study skills coaching, time management, exam preparation strategies, HELB/scholarship guidance, and peer study accountability groups.',
    outcomes: ['Personalized study plan', 'Exam technique coaching', 'Scholarship identification', 'Accountability partner']
  },
  {
    icon: <FaLightbulb className="text-amber-600" />,
    title: 'Life Skills Development',
    color: '#b45309',
    lightColor: '#fef3c7',
    badge: 'Finance & Wellness',
    desc: 'Financial literacy (budgeting, savings, investment basics), mental wellness, healthy relationships, leadership, and communication skills.',
    outcomes: ['Personal budget worksheet', 'Mental health self-care toolkit', 'Public speaking practice', 'Leadership project']
  }
];

// Active Mentors Roster
const MENTORSHIP_MENTORS = [
  {
    id: 'm-1',
    name: 'Dr. Paul Kariuki',
    role: 'Spiritual Formation Lead',
    profession: 'Catholic Chaplain & Theologian',
    phone: '0712334455',
    expertise: ['Faith discernment', 'Vocational clarity', 'Catholic spirituality'],
    availability: 'Sundays 3:00 PM & Wednesdays Online',
    slots: 3
  },
  {
    id: 'm-2',
    name: 'Ms. Grace Achieng',
    role: 'Career Guidance Mentor',
    profession: 'HR Director, Nairobi Business Group',
    phone: '0723445566',
    expertise: ['CV writing & LinkedIn', 'Job interviews', 'Corporate networking'],
    availability: 'Saturdays 9:00 AM & Wednesdays Online',
    slots: 4
  },
  {
    id: 'm-3',
    name: 'Mr. Kevin Odhiambo',
    role: 'Academic & Life Skills Coach',
    profession: 'Senior Lecturer & Educational Consultant',
    phone: '0734556677',
    expertise: ['Study planning', 'Research methodology', 'Exam strategies'],
    availability: 'Sundays 3:00 PM & Wednesdays Online',
    slots: 5
  },
  {
    id: 'm-4',
    name: 'Mrs. Cecilia Mwangi',
    role: 'Financial Literacy Mentor',
    profession: 'Certified Financial Planner & Business Advisor',
    phone: '0745667788',
    expertise: ['Budgeting basics', 'Personal investment', 'Entrepreneurship'],
    availability: 'Saturdays 9:00 AM (Parish Hall)',
    slots: 4
  }
];

// Upcoming Workshops & Seminars
const MENTORSHIP_WORKSHOPS = [
  {
    id: 'ws-1',
    title: '"Faith, Career & Purpose" — Guest Speaker Seminar',
    speaker: 'Dr. Angela Wanjiru (Medical Doctor & Leadership Coach)',
    date: 'August 30, 2026 · 9:00 AM',
    venue: 'Parish Hall & Livestream',
    track: 'Career Guidance',
    color: '#0369a1',
    badge: 'Upcoming'
  },
  {
    id: 'ws-2',
    title: 'CV Masterclass & Mock Interview Assessment Workshop',
    speaker: 'Ms. Grace Achieng (HR Director & Talent Lead)',
    date: 'September 13, 2026 · 9:30 AM',
    venue: 'LH 21 & Online Google Meet',
    track: 'Career Guidance',
    color: '#0369a1',
    badge: 'Hands-on Lab'
  },
  {
    id: 'ws-3',
    title: 'Personal Finance Mastery: Budget, Save & Invest Safely',
    speaker: 'Mrs. Cecilia Mwangi (Financial Planner)',
    date: 'October 4, 2026 · 10:00 AM',
    venue: 'Parish Hall',
    track: 'Life Skills',
    color: '#b45309',
    badge: 'Workshop'
  },
  {
    id: 'ws-4',
    title: 'Spiritual Discernment Retreat: Unlocking Your Divine Vocation',
    speaker: 'Fr. Anthony Mwangi (Spiritual Director)',
    date: 'October 18–19, 2026',
    venue: 'Karen Retreat Centre',
    track: 'Spiritual Formation',
    color: '#7c3aed',
    badge: 'Residential Retreat'
  }
];

// Resource Library & Reading Materials
const MENTORSHIP_RESOURCES = [
  {
    title: '2026 Goal-Setting & Personal Growth Workbook',
    desc: 'Comprehensive quarterly goal planner with SMART goals framework, prayer reflection sections, and weekly review templates.',
    tag: 'Life Skills',
    fileSize: '2.2 MB · PDF',
    color: '#b45309'
  },
  {
    title: 'Catholic Professional CV & Cover Letter Template',
    desc: 'Professionally designed CV template tailored for fresh graduates and young professionals entering competitive job markets.',
    tag: 'Career Guidance',
    fileSize: '1.4 MB · DOCX + PDF',
    color: '#0369a1'
  },
  {
    title: 'Faith & Work Integration — Daily Devotional Guide',
    desc: 'A 30-day devotional connecting Catholic faith with Monday–Friday professional life using scripture, reflection, and prayer.',
    tag: 'Spiritual Formation',
    fileSize: '3.1 MB · PDF',
    color: '#7c3aed'
  },
  {
    title: 'Mentorship Cohort Program Handbook & Code of Conduct',
    desc: 'Complete guide outlining cohort expectations, mentor responsibilities, session formats, reporting, and ethical boundaries.',
    tag: 'Program Guidelines',
    fileSize: '1.6 MB · PDF',
    color: '#047857'
  }
];

// Success Stories & Testimonials
const MENTORSHIP_TESTIMONIALS = [
  {
    id: 'mt-1',
    quote: 'The Career Guidance track completely transformed my job search. My mentor helped me rewrite my CV and coached me through three interviews. I received my first full-time offer within 6 weeks of joining!',
    name: 'Brian Omondi',
    cohort: 'Cohort 4 · 2025',
    track: 'Career Guidance',
    outcome: 'Secured Full-Time IT Role at KCB Group',
    avatar: 'BO'
  },
  {
    id: 'mt-2',
    quote: 'I came in spiritually dry and professionally lost. The Spiritual Formation sessions reignited my prayer life, and through the Vocation discernment sessions, I found clarity on pursuing a medical career as my calling.',
    name: 'Sister Angela Weru',
    cohort: 'Cohort 3 · 2025',
    track: 'Spiritual Formation',
    outcome: 'Admitted to University of Nairobi Medical School',
    avatar: 'AW'
  },
  {
    id: 'mt-3',
    quote: 'The Personal Finance workshop was eye-opening. For the first time, I created a monthly budget and understood how to separate tithe, savings, and expenses. My debt cleared within 4 months using the guidance I received.',
    name: 'Kevin Mutua',
    cohort: 'Cohort 5 · 2026',
    track: 'Life Skills',
    outcome: 'Debt-Free & Started Emergency Savings Fund',
    avatar: 'KM'
  }
];

// ─── CHOIR FALLBACK DATA ────────────────────────────────────────────────────
const DEFAULT_CHOIR_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'notif-1',
    title: 'Vestment & Robe Guideline for Sunday Mass',
    content: 'All choristers are required to wear the official cream-and-navy liturgical robes with black formal footwear for the 10:00 AM Solemn Mass.',
    date: 'August 20, 2026',
    priority: 'urgent',
    category: 'Vestments'
  },
  {
    id: 'notif-2',
    title: 'Sectionals Time Shift for Tenor & Bass',
    content: 'Thursday sectional practice will start 30 minutes earlier at 4:30 PM in LH 32 for dedicated Solfa sight-reading and 4-part polyphony.',
    date: 'August 18, 2026',
    priority: 'high',
    category: 'Rehearsal Shift'
  },
  {
    id: 'notif-3',
    title: 'New Solfa Song Sheets & Audio Aids Uploaded',
    content: 'The practice sheets and audio recordings for "Panis Angelicus" and "Mungu Ni Pendo" are now available under Channels for download.',
    date: 'August 15, 2026',
    priority: 'normal',
    category: 'Score Sheets'
  }
];

const DEFAULT_CHOIR_REPERTOIRE: RepertoireItem[] = [
  { id: 'rep-1', part: 'Entrance', title: 'Come, Christians, Join to Sing', composer: 'Christian H. Bateman', keySignature: 'D Major', tempo: 'Allegro Brillante', theme: 'Praise & Thanksgiving' },
  { id: 'rep-2', part: 'Kyrie/Gloria', title: 'Missa De Angelis (Misa ya VIII)', composer: 'Gregorian Chant / Liturgical Setting', keySignature: 'F Major', tempo: 'Solemn & Reverent', theme: 'Penitential & Praise' },
  { id: 'rep-3', part: 'Responsorial', title: 'Lord, You Have the Words of Everlasting Life', composer: 'Psalm 19 Setting', keySignature: 'G Major', tempo: 'Moderato', theme: 'Word of God' },
  { id: 'rep-4', part: 'Offertory', title: 'Tolea Sadaka Yako Kwa Moyo Safi', composer: 'Traditional African Liturgical', keySignature: 'F Major', tempo: 'Joyful 4/4', theme: 'Sacrifice & Giving' },
  { id: 'rep-5', part: 'Communion', title: 'Panis Angelicus / Ave Verum Corpus', composer: 'César Franck & W.A. Mozart', keySignature: 'A Major / D Major', tempo: 'Adagio Cantabile', theme: 'The Holy Eucharist' },
  { id: 'rep-6', part: 'Recessional', title: 'Sing with All the Saints in Glory', composer: 'Ludwig van Beethoven (Ode to Joy)', keySignature: 'F Major', tempo: 'Majestic Con Brio', theme: 'Sending Forth & Joy' },
];

const DEFAULT_CHOIR_TRACKS: FeaturedAudioTrack[] = [
  {
    id: 'track-1',
    title: 'Panis Angelicus (Live Easter Choral)',
    subtitle: 'St. Thomas Aquinas Choir feat. Chamber String Quartet',
    category: 'Sacred Polyphony',
    duration: '3:45',
    conductor: 'Choir Director',
    lyricsExcerpt: 'Panis angelicus fit panis hominum; Dat panis coelicus figuris terminum: O res mirabilis! manducat Dominum pauper, servus et humilis.'
  },
  {
    id: 'track-2',
    title: 'Mungu Ni Pendo (Live Sunday Liturgy)',
    subtitle: 'Solemn 10:00 AM Mass Live Recording',
    category: 'Liturgical Hymn',
    duration: '4:12',
    conductor: 'Choir Master',
    lyricsExcerpt: 'Mungu ni pendo, apenda watu wote; Kila amwaminiye hatapotea bali atapata uzima wa milele.'
  },
  {
    id: 'track-3',
    title: 'Ave Verum Corpus (W.A. Mozart, K. 618)',
    subtitle: 'Corpus Christi Solemnity Mass',
    category: 'Classical Choral',
    duration: '3:18',
    conductor: 'Choir Mistress',
    lyricsExcerpt: 'Ave verum Corpus, natum de Maria Virgine: Vere passum, immolatum in cruce pro homine. Cujus latus perforatum fluxit aqua et sanguine.'
  }
];

const VOICE_SECTIONS = [
  {
    id: 'soprano',
    name: 'Soprano',
    desc: 'High Female Voice (C4 – C6)',
    role: 'Melody lines, descants, and crisp vocal ornamentation.',
    badge: 'Treble Clef',
    leader: 'Sister Maria K. (Soprano Leader)',
    announcement: 'Sopranos note: We are practicing the high G descant in Ave Verum at 5:30 PM prior to Tuesday rehearsal.',
    trackTitle: 'Ave Verum Corpus - Soprano Lead Rehearsal Track',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    solfaSnippet: 'd : r : m | s : - : f | m : r : d | d : - : -',
    whatsappGroup: 'https://chat.whatsapp.com/demo-soprano'
  },
  {
    id: 'alto',
    name: 'Alto',
    desc: 'Warm Lower Female Voice (F3 – F5)',
    role: 'Rich harmonic counter-melodies and deep vocal warmth.',
    badge: 'Harmony',
    leader: 'Sister Christine M. (Alto Leader)',
    announcement: 'Altos: Please review the middle-tier harmony for Missa De Angelis (Misa ya VIII) before Saturday.',
    trackTitle: 'Missa De Angelis - Alto Harmony Lead Track',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    solfaSnippet: 'm : f : s | d\' : - : t | l : s : f | m : - : -',
    whatsappGroup: 'https://chat.whatsapp.com/demo-alto'
  },
  {
    id: 'tenor',
    name: 'Tenor',
    desc: 'Bright High Male Voice (C3 – A4)',
    role: 'Upper harmonic clarity, solos, and radiant polyphony.',
    badge: 'Tenor Clef',
    leader: 'Brother Kevin O. (Tenor Leader)',
    announcement: 'Tenors: Extra 30-minute sectionals in LH 32 on Thursday at 4:30 PM for Panis Angelicus high notes.',
    trackTitle: 'Panis Angelicus - Tenor Solfa & Polyphony Track',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    solfaSnippet: 's : l : t | d\' : - : s | m\' : r\' : d\' | t : - : -',
    whatsappGroup: 'https://chat.whatsapp.com/demo-tenor'
  },
  {
    id: 'bass',
    name: 'Bass',
    desc: 'Resonant Deep Male Voice (E2 – E4)',
    role: 'Harmonic foundation, rhythmic drive, and rich undertones.',
    badge: 'Bass Clef',
    leader: 'Brother Joseph T. (Bass Leader)',
    announcement: 'Basses: Focus on the cadential pedal points for Tolea Sadaka. Rhythmic precision is key.',
    trackTitle: 'Tolea Sadaka Yako - Bass Foundation Track',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    solfaSnippet: 'd : d : d | s, : - : s, | l, : t, : d | d : - : -',
    whatsappGroup: 'https://chat.whatsapp.com/demo-bass'
  }
];

const UPCOMING_SUNDAY_LITURGY = {
  sundayTitle: '21st Sunday in Ordinary Time (Year B)',
  date: 'Sunday, August 23, 2026',
  massTime: '10:00 AM Solemn Parish Mass',
  theme: 'Standing Firm in Faith & Divine Wisdom',
  liturgicalColor: 'Green',
  colorHex: '#16a34a',
  uniformCode: 'Cream Robes with Green Stoles & Black Dress Shoes',
  entranceHymn: { title: 'Come, Christians, Join to Sing', key: 'D Major', number: 'Nyimbo za Sifa #142' },
  gloriaSetting: { title: 'Utukufu Juu Mbinguni', key: 'F Major', setting: 'Missa Jubilate (Solfa)' },
  psalmTone: { title: 'Psalm 34: Taste and see the goodness of the Lord', tone: 'Tone 8G Solfa' },
  communionMotet: { title: 'Ave Verum Corpus / Panis Angelicus', composer: 'W.A. Mozart & César Franck' },
  recessionalHymn: { title: 'Sing with All the Saints in Glory', key: 'F Major (Ode to Joy)' }
};

const DIGITAL_SONGBOOK_SHEETS: Record<string, any> = {
  'rep-1': {
    title: 'Come, Christians, Join to Sing',
    composer: 'Christian H. Bateman (1843)',
    keySignature: 'D Major',
    tempo: '4/4 Allegro Brillante',
    part: 'Entrance Hymn',
    solfa: `d : r | m : s | f : m | r : -\nm : f | s : d' | t : l | s : -\ns : m | l : s | f : m | r : -\nd : m | s : d' | m : r | d : -`,
    lyricsSwahili: `1. Njoni Wakristo wote, Tumwimbie Bwana Yesu;\n   Paza sauti zenu, Kwa sifa na shukrani.\n\n2. Yeye ni Mfalme wetu, Ametupa uzima;\n   Wema wake ni mkuu, Milele na milele.`,
    lyricsEnglish: `1. Come, Christians, join to sing: Alleluia! Amen!\n   Loud praise to Christ our King: Alleluia! Amen!\n   Let all, with heart and voice, before His throne rejoice;\n   Praise is His gracious choice: Alleluia! Amen!`,
    notes: 'Focus on crisp consonants on beat 1 and majestic crescendo into verse 2.'
  },
  'rep-2': {
    title: 'Utukufu Juu Mbinguni (Missa Jubilate)',
    composer: 'Gregorian Chant / Swahili Liturgical',
    keySignature: 'F Major',
    tempo: '3/4 Moderato Reverent',
    part: 'Gloria Response',
    solfa: `m : m : f | s : - : s | l : s : f | m : - : -\ns : s : l | t : - : d' | s : f : m | r : - : -\nd : m : s | d' : - : t | l : s : f | m : - : -`,
    lyricsSwahili: `Utukufu juu kwa Mungu, Na amani duniani kwa watu wenye mapenzi mema.\nTunakusifu, tunakuheshimu, Tunakuabudu, tunakutukuza,\nTunakushukuru kwa ajili ya utukufu wako mkuu.`,
    lyricsEnglish: `Glory to God in the highest, and on earth peace to people of good will.\nWe praise you, we bless you, we adore you, we glorify you,\nwe give you thanks for your great glory.`,
    notes: 'Reverent bows at holy name invocations with fluid, sweeping arm extensions.'
  },
  'rep-3': {
    title: 'Psalm 34: Taste and See',
    composer: 'Tone 8G Liturgical Setting',
    keySignature: 'G Major',
    tempo: 'Andante',
    part: 'Responsorial Psalm',
    solfa: `s : m : d | f : m : r | d : - : -\ns : d' : t | l : s : f | m : - : -`,
    lyricsSwahili: `Kiitikio: Onjeni muone jinsi Bwana alivyo mwema; Aheri mtu yule anayemtumainia.`,
    lyricsEnglish: `Refrain: Taste and see the goodness of the Lord; blessed is the one who takes refuge in Him.`,
    notes: 'Cantor leads refrain twice before choir and congregation join.'
  },
  'rep-5': {
    title: 'Ave Verum Corpus (K. 618)',
    composer: 'Wolfgang Amadeus Mozart',
    keySignature: 'D Major',
    tempo: 'Adagio Sostenuto',
    part: 'Communion Motet',
    solfa: `s : - | m : - | f : m | r : -\ns : - | d' : - | t : l | s : -\nm' : r' | d' : t | l : s | s : -`,
    lyricsSwahili: `Salamu, Mwili wa kweli, uliozaliwa na Bikira Maria;\nUlioteswa kweli na kutolewa sadaka msalabani kwa ajili ya mwanadamu.`,
    lyricsEnglish: `Hail, true Body, born of the Virgin Mary, having truly suffered, sacrificed on the cross for mankind, from whose pierced side flowed water and blood.`,
    notes: 'Keep dynamic level under control. Pianissimo at "O Jesu dulcis, O Jesu pie".'
  }
};

const CHARISMATIC_RESOURCES = [
  {
    title: "Life in the Spirit Seminar Manual",
    desc: "Complete 7-week discipleship guide on discovering and exercising charismatic gifts (1 Cor 12).",
    fileSize: "2.4 MB · PDF",
    tag: "Foundational Manual"
  },
  {
    title: "Charismatic Doctrines & Charisms Guide",
    desc: "Catholic Church teachings on praise, tongues, discernment, prophecy, and inner healing ministry.",
    fileSize: "1.8 MB · PDF",
    tag: "Doctrine & Ministry"
  },
  {
    title: "Praise & Worship Chord Charts & Songbook",
    desc: "Guitar and piano chord progressions for all Swahili and English fellowship praise anthems.",
    fileSize: "3.1 MB · PDF",
    tag: "Worship Music"
  },
  {
    title: "Annual Intercession Report & Guidelines",
    desc: "Testimonies of answered prayers, vigil schedules, and 24/7 prayer chain guidelines.",
    fileSize: "1.2 MB · PDF",
    tag: "Prayer Ministry"
  }
];

const CommunityAboutTab: React.FC<Props> = ({ module, color, onQuickLink }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const isChoir = module.id === 'choir' || module.title.toLowerCase().includes('choir');
  const isCharismatic = module.id === 'charismatic' || module.title.toLowerCase().includes('charismatic');
  const isDancers = module.id === 'dancers' || module.title.toLowerCase().includes('dance');
  const isStFrancis = module.id === 'st-francis' || module.title.toLowerCase().includes('francis');
  const isMentorship = module.id === 'youth' || module.title.toLowerCase().includes('mentor');

  // Scripture Verse rotation state for Charismatic
  const [verseIndex, setVerseIndex] = useState(0);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const currentVerse = CHARISMATIC_VERSES[verseIndex] || CHARISMATIC_VERSES[0];

  const handleCopyVerse = () => {
    navigator.clipboard.writeText(`"${currentVerse.verse}" — ${currentVerse.reference}`);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  // Prayer Wall state for Charismatic
  const [prayerIntentions, setPrayerIntentions] = useState(INITIAL_PRAYER_INTENTIONS);
  const [userIntercededIds, setUserIntercededIds] = useState<Record<string, boolean>>({});
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [newPrayerForm, setNewPrayerForm] = useState({
    title: '',
    request: '',
    category: 'Healing',
    author: '',
    isAnonymous: false
  });

  const handlePrayAlong = (id: string) => {
    if (userIntercededIds[id]) return;
    setUserIntercededIds(prev => ({ ...prev, [id]: true }));
    setPrayerIntentions(prev =>
      prev.map(item => (item.id === id ? { ...item, prayingCount: item.prayingCount + 1 } : item))
    );
  };

  const handleAddIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerForm.title.trim() || !newPrayerForm.request.trim()) return;

    const newIntention = {
      id: `int-${Date.now()}`,
      title: newPrayerForm.title.trim(),
      request: newPrayerForm.request.trim(),
      category: newPrayerForm.category,
      author: newPrayerForm.isAnonymous || !newPrayerForm.author.trim() ? 'Anonymous Intercessor' : newPrayerForm.author.trim(),
      prayingCount: 1,
      date: 'Just now',
      isAnswered: false
    };

    setPrayerIntentions([newIntention, ...prayerIntentions]);
    setShowPrayerModal(false);
    setNewPrayerForm({ title: '', request: '', category: 'Healing', author: '', isAnonymous: false });
  };

  // Testimony Submission Modal state
  const [testimonies, setTestimonies] = useState(CHARISMATIC_TESTIMONIES);
  const [showTestimonyModal, setShowTestimonyModal] = useState(false);
  const [testimonyForm, setTestimonyForm] = useState({
    title: '',
    story: '',
    author: '',
    category: 'Physical Healing',
    isAnonymous: false
  });

  const handleAddTestimony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonyForm.title.trim() || !testimonyForm.story.trim()) return;

    const newTest = {
      id: `test-${Date.now()}`,
      title: testimonyForm.title.trim(),
      story: testimonyForm.story.trim(),
      author: testimonyForm.isAnonymous || !testimonyForm.author.trim() ? 'Anonymous Parishioner' : testimonyForm.author.trim(),
      category: testimonyForm.category,
      date: 'Just now'
    };

    setTestimonies([newTest, ...testimonies]);
    setShowTestimonyModal(false);
    setTestimonyForm({ title: '', story: '', author: '', category: 'Physical Healing', isAnonymous: false });
  };

  // Dancers Active Routine Preview Modal state
  const [selectedRoutine, setSelectedRoutine] = useState<typeof DANCERS_CHOREOGRAPHY[0] | null>(null);

  // St. Francis Donation Modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedCharityProject, setSelectedCharityProject] = useState<typeof ST_FRANCIS_CHARITY_PROJECTS[0] | null>(null);
  const [donationAmount, setDonationAmount] = useState('500');

  // Mentorship Modal states
  const [selectedMentor, setSelectedMentor] = useState<typeof MENTORSHIP_MENTORS[0] | null>(null);
  const [showMentorRequestModal, setShowMentorRequestModal] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [mentorRequestForm, setMentorRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    track: 'Career Guidance',
    goals: '',
  });

  // Choir Modal & Interactive Hub states
  const [selectedVoiceSection, setSelectedVoiceSection] = useState<typeof VOICE_SECTIONS[0] | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedSongbookSheet, setSelectedSongbookSheet] = useState<any | null>(null);
  const [showSongbookModal, setShowSongbookModal] = useState(false);
  const [playingVoiceAudio, setPlayingVoiceAudio] = useState(false);
  const [copiedSheetSolfa, setCopiedSheetSolfa] = useState(false);
  const [activeSongbookTab, setActiveSongbookTab] = useState<'solfa' | 'swahili' | 'english' | 'dual'>('solfa');
  const [songbookPlaybackSpeed, setSongbookPlaybackSpeed] = useState<number>(1.0);
  const [highlightedVoicePart, setHighlightedVoicePart] = useState<'all' | 'soprano' | 'alto' | 'tenor' | 'bass'>('all');
  const [medleyPlaying, setMedleyPlaying] = useState(false);
  const [medleyIndex, setMedleyIndex] = useState(0);

  // Web Audio Reference Pitch Pipe
  const playPitchPipe = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch {
      // AudioContext fallback
    }
  };

  // Next Practice / Gathering Countdown calculation
  const practiceSchedules: PracticeSchedule[] = useMemo(() => {
    if (module.practiceSchedules && module.practiceSchedules.length > 0) {
      return module.practiceSchedules;
    }
    if (isChoir) {
      return [
        { id: '1', day: 'Tuesday', startTime: '18:00', endTime: '20:00', location: 'Main Church Hall', targetSection: 'Full Choir SATB' },
        { id: '2', day: 'Thursday', startTime: '17:00', endTime: '18:30', location: 'LH 32', targetSection: 'Sectionals (Tenor & Bass)' },
        { id: '3', day: 'Saturday', startTime: '13:00', endTime: '16:00', location: 'LH 32', targetSection: 'General Rehearsal' },
      ];
    }
    if (isCharismatic) {
      return [
        { id: '1', day: 'Thursday', startTime: '18:00', endTime: '20:00', location: 'Parish Hall', targetSection: 'Praise & Worship Main Fellowship' },
        { id: '2', day: 'Tuesday', startTime: '17:30', endTime: '19:00', location: 'Church Grotto / Chapel', targetSection: 'Intercessory Prayer Chain' },
        { id: '3', day: 'Friday', startTime: '21:00', endTime: '05:00', location: 'Main Church', targetSection: '1st Friday Overnight Vigil & Adoration' },
        { id: '4', day: 'Saturday', startTime: '16:00', endTime: '17:30', location: 'Parish Hall', targetSection: 'Life in the Spirit & Formation' }
      ];
    }
    if (isDancers) {
      return [
        { id: '1', day: 'Saturday', startTime: '16:00', endTime: '18:30', location: 'School Compound / Main Hall', targetSection: 'Full Choreography & Staging' },
        { id: '2', day: 'Wednesday', startTime: '17:00', endTime: '18:30', location: 'LH 21', targetSection: 'Technique, Stretches & Prop Drills' }
      ];
    }
    if (isStFrancis) {
      return [
        { id: '1', day: 'Sunday', startTime: '17:00', endTime: '18:30', location: 'LH 21 / Neighborhood Jumuiya Blocks', targetSection: 'Community Fellowship & SCC Prayer' },
        { id: '2', day: 'Saturday', startTime: '08:30', endTime: '12:30', location: 'Parish Grounds / Outreach Centers', targetSection: 'Laudato Si\' Eco-Care & Charity Drive' }
      ];
    }
    if (isMentorship) {
      return [
        { id: '1', day: 'Sunday', startTime: '15:00', endTime: '17:00', location: 'Parish Hall / LH 21', targetSection: 'Group Cohort Sessions & Life Skills' },
        { id: '2', day: 'Saturday', startTime: '09:00', endTime: '13:00', location: 'Parish Hall / Online', targetSection: 'Career Workshops, Mock Interviews & Seminars' },
        { id: '3', day: 'Wednesday', startTime: '18:30', endTime: '20:00', location: 'Online (Google Meet / WhatsApp)', targetSection: 'One-on-One Mentor Check-ins & Academic Coaching' }
      ];
    }
    return [];
  }, [module.practiceSchedules, isChoir, isCharismatic, isDancers, isStFrancis, isMentorship]);

  const nextRehearsal = useMemo(() => {
    if (!practiceSchedules || practiceSchedules.length === 0) return null;
    const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const upcoming = practiceSchedules
      .map((ps) => {
        const targetDay = dayMap[ps.day] ?? (isStFrancis ? 0 : isMentorship ? 0 : isDancers ? 6 : isCharismatic ? 4 : 2);
        let dayDiff = (targetDay - currentDay + 7) % 7;
        const [startH, startM] = (ps.startTime || '17:00').split(':').map(Number);
        
        if (dayDiff === 0 && (currentHour > startH || (currentHour === startH && currentMin >= startM))) {
          dayDiff = 7;
        }

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + dayDiff);
        targetDate.setHours(startH, startM, 0, 0);

        return {
          ...ps,
          targetDate,
          diffMs: targetDate.getTime() - now.getTime(),
        };
      })
      .sort((a, b) => a.diffMs - b.diffMs)[0];

    return upcoming || null;
  }, [practiceSchedules, isStFrancis, isMentorship, isDancers, isCharismatic]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!nextRehearsal) return;
    const calculateTime = () => {
      const diff = nextRehearsal.targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [nextRehearsal]);

  // Audio player simulation state
  const tracks: FeaturedAudioTrack[] = useMemo(() => {
    if (module.featuredTracks && module.featuredTracks.length > 0) return module.featuredTracks;
    if (isChoir) return DEFAULT_CHOIR_TRACKS;
    return [];
  }, [module.featuredTracks, isChoir]);

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(28);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let progressTimer: any;
    if (isPlaying) {
      progressTimer = setInterval(() => {
        setPlayProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(progressTimer);
  }, [isPlaying]);

  // Announcements list
  const announcements: Announcement[] = useMemo(() => {
    if (module.announcements && module.announcements.length > 0) return module.announcements;
    if (isChoir) return DEFAULT_CHOIR_ANNOUNCEMENTS;
    return [];
  }, [module.announcements, isChoir]);

  // Repertoire list
  const repertoire: RepertoireItem[] = useMemo(() => {
    if (module.repertoire && module.repertoire.length > 0) return module.repertoire;
    if (isChoir) return DEFAULT_CHOIR_REPERTOIRE;
    return [];
  }, [module.repertoire, isChoir]);

  // Leadership Spotlight
  const officials = module.officials || [];
  const leaderSpotlight = useMemo(() => {
    if (officials.length === 0) {
      if (isChoir) {
        return {
          name: 'Dr. John Doe',
          role: 'Choir Director & Conductor',
          phoneNumber: '+254712345678',
          email: 'director@sta-choir.org',
          bio: 'Directing the St. Thomas Aquinas Choir with a focus on sacred liturgical polyphony, voice production, and reverent Catholic worship.',
        };
      }
      if (isCharismatic) {
        return {
          name: 'Dr. Patrick Mwangi',
          role: 'Charismatic Coordinator & Intercession Lead',
          phoneNumber: '+254711223344',
          email: 'patrick@charismatic-csa.org',
          bio: 'Leading the Charismatic Prayer Group in cultivating Holy Spirit gifts, Thursday praise fellowship, and community intercession chains.',
        };
      }
      if (isDancers) {
        return {
          name: 'Sister Christine Ndunge',
          role: 'Lead Choreographer & Ministry Director',
          phoneNumber: '+254714223344',
          email: 'christine@dancers-csa.org',
          bio: 'Directing the Liturgical Dance Ministry in sacred movement, body prayer, cultural praise, and synchronizing vibrant altar processions.',
        };
      }
      if (isStFrancis) {
        return {
          name: 'Joseph Karanja',
          role: 'Chairperson & Community Outreach Director',
          phoneNumber: '+254732546356',
          email: 'karanja@stfrancis-csa.org',
          bio: 'Guiding St. Francis of Assisi community in charity drives, Laudato Si\' eco-stewardship, and fostering vibrant neighborhood SCC Jumuiya fellowships.',
        };
      }
      if (isMentorship) {
        return {
          name: 'Dr. Paul Kariuki',
          role: 'Program Director & Spiritual Formation Lead',
          phoneNumber: '+254712334455',
          email: 'paul@mentorship-csa.org',
          bio: 'Directing the Mentorship Program through structured cohorts, spiritual formation sessions, career workshops, and one-on-one mentoring for over 120 young parishioners.',
        };
      }
      return null;
    }
    const prime = officials.find(
      (o: any) =>
        (o.role || o.position || '').toLowerCase().includes('chair') ||
        (o.role || o.position || '').toLowerCase().includes('director') ||
        (o.role || o.position || '').toLowerCase().includes('coordinator') ||
        (o.role || o.position || '').toLowerCase().includes('leader')
    ) || officials[0];

    return {
      name: prime.name,
      role: prime.role || (prime as any).position || 'Ministry Leader',
      photoUrl: prime.photoUrl || (prime as any).photo_url,
      phoneNumber: prime.phoneNumber || (prime as any).phone || (prime as any).contact,
      email: prime.email,
      bio: isMentorship
        ? `Leading the ${module.title} in cohort management, spiritual formation, career coaching, and matching mentees with professional mentors.`
        : isStFrancis
        ? `Leading the ${module.title} in charity outreach, member welfare, creation care, and neighborhood Jumuiya prayer groups.`
        : isDancers
        ? `Leading the ${module.title} in sacred choreography, weekly rehearsals, and spiritual fellowship across all dance formations.`
        : isCharismatic
        ? `Guiding the ${module.title} in spiritual renewal, praise and worship, healing intercession, and faithful fellowship.`
        : `Guiding the ${module.title} in vocal excellence, weekly rehearsals, and spiritual fellowship across all 4 voice parts.`,
    };
  }, [officials, isChoir, isCharismatic, isDancers, isStFrancis, isMentorship, module.title]);

  // Non-redundant functional statistics
  const statCards = useMemo(() => {
    if (isChoir) {
      return [
        {
          icon: <FaClock className="text-amber-500" />,
          title: 'Rehearsals',
          value: '2x Weekly',
          subtitle: 'Tue 6:00 PM & Sat 1:00 PM',
          detail: 'Main Church Hall & LH 32',
        },
        {
          icon: <FaMusic className="text-indigo-500" />,
          title: 'Voice Harmony',
          value: '4 Parts (SATB)',
          subtitle: 'Soprano, Alto, Tenor, Bass',
          detail: 'Solfa Sight Reading & Blends',
        },
        {
          icon: <FaUsers className="text-emerald-500" />,
          title: 'Active Choristers',
          value: '60+ Members',
          subtitle: 'Serving Sunday 10:00 AM Mass',
          detail: 'Liturgical & Concert Ministry',
        },
      ];
    }
    if (isCharismatic) {
      return [
        {
          icon: <FaFire className="text-amber-500" />,
          title: 'Weekly Gathering',
          value: 'Thursdays 6:00 PM',
          subtitle: 'Parish Hall Fellowship',
          detail: 'Praise, Teachings & Intercession',
        },
        {
          icon: <FaPrayingHands className="text-purple-500" />,
          title: 'Prayer Wall & Chain',
          value: '120+ Petitions',
          subtitle: 'Tuesday Grotto Chain',
          detail: 'Active Community Intercessors',
        },
        {
          icon: <FaStar className="text-indigo-500" />,
          title: 'Charismatic Renewal',
          value: 'Life in the Spirit',
          subtitle: 'Charisms & Inner Healing',
          detail: 'Open to All Parishioners',
        },
      ];
    }
    if (isDancers) {
      return [
        {
          icon: <FaClock className="text-pink-500" />,
          title: 'Weekly Rehearsals',
          value: 'Saturdays 4:00 PM',
          subtitle: 'School Compound / Main Hall',
          detail: 'Choreography & Formation Drills',
        },
        {
          icon: <FaUsers className="text-purple-500" />,
          title: 'Active Dancers',
          value: '35+ Members',
          subtitle: 'All Skill & Age Levels',
          detail: 'Sacred Altar Ministration',
        },
        {
          icon: <FaAward className="text-amber-500" />,
          title: 'Ministrations',
          value: '12+ Masses & Feasts',
          subtitle: 'Liturgical Seasons & Weddings',
          detail: 'Entrance & Offertory Animation',
        },
      ];
    }
    if (isStFrancis) {
      return [
        {
          icon: <FaHome className="text-emerald-500" />,
          title: 'Weekly Gatherings',
          value: 'Sundays 5:00 PM',
          subtitle: 'LH 21 & Neighborhood Blocks',
          detail: 'SCC Rosary, Fellowship & Action',
        },
        {
          icon: <FaHandHoldingHeart className="text-rose-500" />,
          title: 'Charity & Mercy',
          value: '500+ Lives Touched',
          subtitle: 'Children’s Homes & Food Baskets',
          detail: 'Subukia Pilgrimages & Hospital Care',
        },
        {
          icon: <FaLeaf className="text-emerald-600" />,
          title: 'Creation Stewardship',
          value: 'Laudato Si’ Chapter',
          subtitle: '680+ Trees Planted',
          detail: 'Compound Greening & Clean-ups',
        },
      ];
    }
    if (isMentorship) {
      return [
        {
          icon: <FaClock className="text-purple-500" />,
          title: 'Cohort Sessions',
          value: 'Sundays 3:00 PM',
          subtitle: 'Parish Hall & LH 21',
          detail: 'Life Skills, Faith & Peer Coaching',
        },
        {
          icon: <FaAward className="text-indigo-500" />,
          title: 'Mentorship Network',
          value: '120+ Mentees Empowered',
          subtitle: '15+ Professional Mentors',
          detail: 'Active Cohort 5 · 4 Core Pillars',
        },
        {
          icon: <FaStar className="text-amber-500" />,
          title: 'Growth Pillars',
          value: '4 Specialized Tracks',
          subtitle: 'Spiritual, Career, Academics, Life',
          detail: '1-on-1 Matching & Seminars',
        },
      ];
    }
    return [
      {
        icon: <FaUsers className="text-blue-500" />,
        title: 'Gatherings',
        value: 'Weekly Fellowship',
        subtitle: module.meetingSchedule ? 'Scheduled Meetings' : 'Parish Community',
        detail: 'Active Member Engagement',
      },
      {
        icon: <FaPrayingHands className="text-purple-500" />,
        title: 'Ministry Pillar',
        value: 'Prayer & Service',
        subtitle: 'Faith Formation & Action',
        detail: 'Spiritual Community Support',
      },
      {
        icon: <FaStar className="text-amber-500" />,
        title: 'Community',
        value: module.title.split(' ').slice(0, 2).join(' '),
        subtitle: 'Parish Liturgical Branch',
        detail: 'Open to All Members',
      },
    ];
  }, [isChoir, isCharismatic, isDancers, isStFrancis, isMentorship, module.meetingSchedule, module.title]);

  const activeTrack = tracks[activeTrackIndex] || tracks[0];

  const formatPhoneForWa = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^0/, '254');
  };

  const gradient = `linear-gradient(135deg, ${color} 0%, ${color}dd 60%, ${color}bb 100%)`;
  const lightBg = `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`;

  return (
    <div className="tab-system-content" style={{ "--jumuiya-color": color } as React.CSSProperties}>
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl" style={{ background: gradient, minHeight: '280px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-1" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${color}55 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`,
          }}
        />
        {(module.saint_image_url || module.image_url || COMMUNITY_IMAGES[module.id] || DEFAULT_COMMUNITY_IMAGE) && (
          <div className="absolute inset-0">
            <img
              src={module.saint_image_url || module.image_url || COMMUNITY_IMAGES[module.id] || DEFAULT_COMMUNITY_IMAGE}
              alt={module.title}
              className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-30 scale-100' : 'opacity-0 scale-105'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}
        <div className="relative z-10 px-8 py-12 md:px-14 md:py-16 flex flex-col justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white/90 text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {isMentorship ? <FaGraduationCap className="text-amber-300" /> : isStFrancis ? <FaDove className="text-emerald-300" /> : isCharismatic ? <FaFire className="text-amber-300" /> : isDancers ? <FaChild className="text-pink-300" /> : <FaChurch style={{ fontSize: '0.75rem' }} />}
              {isChoir ? "Liturgical Choral Ministry" : isCharismatic ? "Catholic Charismatic Renewal" : isDancers ? "Liturgical Sacred Movement Ministry" : isStFrancis ? "Franciscan Fraternity & Eco-Charity" : isMentorship ? "Youth & Young Professionals Empowerment" : (module.description || "Community Ministry")}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-md">
              {module.title}
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
              {module.description || module.about || module.story}
            </p>
          </div>

          {/* Direct Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => {
                if (isChoir) {
                  navigate(`/community/choir/join`);
                } else if (isCharismatic) {
                  navigate(`/community/charismatic/join`);
                } else if (isDancers) {
                  navigate(`/community/dancers/join`);
                } else if (isStFrancis) {
                  navigate(`/community/st-francis/join`);
                } else if (isMentorship) {
                  navigate(`/community/youth/join`);
                } else if (onQuickLink) {
                  onQuickLink('members');
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-slate-900 shadow-lg hover:bg-slate-100 hover:scale-[1.02] transition-all cursor-pointer"
            >
              {isMentorship ? <FaUserGraduate className="text-purple-600" /> : isStFrancis ? <FaHandsHelping className="text-emerald-600" /> : isDancers ? <FaChild className="text-pink-600" /> : isCharismatic ? <FaFire className="text-purple-600" /> : <FaMicrophone className="text-indigo-600" />}
              {isChoir ? "Join Voice Sections" : isCharismatic ? "Join Charismatic Fellowship" : isDancers ? "Join Dance Ministry" : isStFrancis ? "Join St. Francis Community" : isMentorship ? "Register as Mentee (Cohort 5)" : "Join Ministry"}
            </button>

            {isMentorship && (
              <button
                onClick={() => setShowVolunteerModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white backdrop-blur-md bg-amber-500/85 hover:bg-amber-500 border border-amber-300/30 transition-all cursor-pointer shadow-md"
              >
                <FaChalkboardTeacher /> Volunteer as Mentor
              </button>
            )}

            {isStFrancis && (
              <button
                onClick={() => {
                  setSelectedCharityProject(ST_FRANCIS_CHARITY_PROJECTS[0]);
                  setShowDonationModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white backdrop-blur-md bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/30 transition-all cursor-pointer shadow-md"
              >
                <FaHandHoldingHeart /> Support Charity Drive
              </button>
            )}

            {isCharismatic && (
              <button
                onClick={() => setShowPrayerModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white backdrop-blur-md bg-amber-500/80 hover:bg-amber-500 border border-amber-400/30 transition-all cursor-pointer shadow-md"
              >
                <FaPrayingHands /> Submit Prayer Request
              </button>
            )}

            {onQuickLink && (
              <button
                onClick={() => onQuickLink('activities')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/20 transition-all cursor-pointer"
              >
                <FaCalendarCheck /> {isMentorship ? "Workshops & Seminars" : isStFrancis ? "Feast Day & Outreaches" : isDancers ? "Ministrations & Masses" : isCharismatic ? "Vigils & Gatherings" : "Rehearsals & Calendar"}
              </button>
            )}

            {onQuickLink && (
              <button
                onClick={() => onQuickLink('channels')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white backdrop-blur-md bg-white/10 hover:bg-white/25 border border-white/15 transition-all cursor-pointer"
              >
                <FaDownload /> {isMentorship ? "Toolkits & Guides" : isStFrancis ? "SCC & Eco Resources" : isDancers ? "Routines & Formations" : isCharismatic ? "Praise & Chords" : "Repertoire & Sheets"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CHOIR SPECIAL: LITURGY & HYMN OF THE WEEK CARD */}
      {isChoir && (
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden">
          {/* Decorative glow mesh */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_#34d399]"></span>
                  Liturgical Color: {UPCOMING_SUNDAY_LITURGY.liturgicalColor}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {UPCOMING_SUNDAY_LITURGY.sundayTitle}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {UPCOMING_SUNDAY_LITURGY.date}
                </span>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  Upcoming Sunday Mass Liturgy & Hymnal Lineup
                </h2>
                <p className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-2">
                  <FaTshirt /> Vestment Code: <span className="text-slate-200 font-semibold">{UPCOMING_SUNDAY_LITURGY.uniformCode}</span>
                </p>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Theme of Mass: <strong className="text-amber-300">"{UPCOMING_SUNDAY_LITURGY.theme}"</strong> · {UPCOMING_SUNDAY_LITURGY.massTime}
              </p>

              {/* Interactive Mass Hymn Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                <div
                  onClick={() => {
                    setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-1']);
                    setShowSongbookModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-indigo-900/50 border border-indigo-500/20 hover:border-indigo-400/50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                      Entrance Processional
                    </span>
                    <span className="text-[9px] font-extrabold text-indigo-300 opacity-0 group-hover:opacity-100 transition">View Solfa →</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition">{UPCOMING_SUNDAY_LITURGY.entranceHymn.title}</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">{UPCOMING_SUNDAY_LITURGY.entranceHymn.key} · {UPCOMING_SUNDAY_LITURGY.entranceHymn.number}</span>
                </div>

                <div
                  onClick={() => {
                    setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-2']);
                    setShowSongbookModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-pink-900/50 border border-pink-500/20 hover:border-pink-400/50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
                      Gloria & Kyrie Setting
                    </span>
                    <span className="text-[9px] font-extrabold text-pink-300 opacity-0 group-hover:opacity-100 transition">View Solfa →</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition">{UPCOMING_SUNDAY_LITURGY.gloriaSetting.title}</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">{UPCOMING_SUNDAY_LITURGY.gloriaSetting.key} · {UPCOMING_SUNDAY_LITURGY.gloriaSetting.setting}</span>
                </div>

                <div
                  onClick={() => {
                    setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-3']);
                    setShowSongbookModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-amber-900/50 border border-amber-500/20 hover:border-amber-400/50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Responsorial Psalm Tone
                    </span>
                    <span className="text-[9px] font-extrabold text-amber-300 opacity-0 group-hover:opacity-100 transition">View Solfa →</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition">{UPCOMING_SUNDAY_LITURGY.psalmTone.title}</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">{UPCOMING_SUNDAY_LITURGY.psalmTone.tone}</span>
                </div>

                <div
                  onClick={() => {
                    setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-5']);
                    setShowSongbookModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                      Communion Motet
                    </span>
                    <span className="text-[9px] font-extrabold text-purple-300 opacity-0 group-hover:opacity-100 transition">View Solfa →</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition">{UPCOMING_SUNDAY_LITURGY.communionMotet.title}</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">{UPCOMING_SUNDAY_LITURGY.communionMotet.composer}</span>
                </div>

                <div
                  onClick={() => {
                    setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-1']);
                    setShowSongbookModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-emerald-900/50 border border-emerald-500/20 hover:border-emerald-400/50 transition-all cursor-pointer group shadow-sm sm:col-span-2 md:col-span-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Recessional Hymn
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-300 opacity-0 group-hover:opacity-100 transition">View Solfa →</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition">{UPCOMING_SUNDAY_LITURGY.recessionalHymn.title}</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">{UPCOMING_SUNDAY_LITURGY.recessionalHymn.key}</span>
                </div>
              </div>
            </div>

            <div className="flex lg:flex-col items-center gap-3 shrink-0 pt-2 lg:pt-0">
              <button
                onClick={() => {
                  setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-1']);
                  setShowSongbookModal(true);
                }}
                className="px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 w-full border border-indigo-400/30"
              >
                <FaBookOpen /> Open Digital Songbook
              </button>
              <button
                onClick={() => {
                  setSelectedVoiceSection(VOICE_SECTIONS[0]);
                  setShowVoiceModal(true);
                }}
                className="px-6 py-3.5 rounded-2xl font-black text-xs text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 w-full"
              >
                <FaHeadphones /> Section Audio Leads
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 2. MENTORSHIP PROGRAM PILLARS & TRACKS (Mentorship Special) */}
      {isMentorship && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Four Pillars of Holistic Growth
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Structured mentorship tracks equipping young Christians spiritually, professionally, academically, and personally.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700 self-start sm:self-auto">
              Cohort 5 · Semester 2 / 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MENTORSHIP_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between border transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                style={{ borderColor: `${pillar.color}25` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                      style={{ background: pillar.lightColor }}
                    >
                      {pillar.icon}
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{ background: pillar.lightColor, color: pillar.color }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">{pillar.desc}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Core Outcomes
                  </span>
                  <div className="space-y-1">
                    {pillar.outcomes.map((out, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <FaCheckCircle size={10} style={{ color: pillar.color }} />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MENTOR & MENTEE PAIRING BOARD (Mentorship Special) */}
      {isMentorship && (
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, color-mix(in srgb, ${color}, black 20%) 100%)`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-200 text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-md">
                <FaChalkboardTeacher /> Active Mentors & One-on-One Pairing
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Meet the Mentor Cohort Faculty
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedMentor(MENTORSHIP_MENTORS[0]);
                setShowMentorRequestModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-purple-900 shadow-md hover:bg-slate-100 hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
            >
              <FaComments /> Request 1-on-1 Session
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MENTORSHIP_MENTORS.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/20 text-purple-200">
                      {m.role}
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-300">
                      {m.slots} slots open
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white mb-0.5">{m.name}</h4>
                  <p className="text-xs text-purple-200 font-medium mb-3">{m.profession}</p>

                  <div className="space-y-1 mb-3">
                    {m.expertise.map((exp, eIdx) => (
                      <span
                        key={eIdx}
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/90 mr-1 mb-1"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15">
                  <p className="text-[10px] text-white/70 font-semibold mb-2">
                    <FaClock className="inline mr-1 text-amber-300" /> {m.availability}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedMentor(m);
                      setShowMentorRequestModal(true);
                    }}
                    className="w-full py-1.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Connect with {m.name.split(' ')[1] || 'Mentor'} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. UPCOMING WORKSHOPS & SEMINARS (Mentorship Special) */}
      {isMentorship && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Upcoming Workshops & Seminars
                </h2>
                <p className="text-xs text-slate-500 font-medium">Monthly masterclasses, guest speaker series, and career bootcamps.</p>
              </div>
            </div>
            {onQuickLink && (
              <button
                onClick={() => onQuickLink('activities')}
                className="text-xs font-bold flex items-center gap-1 transition-colors hover:underline cursor-pointer"
                style={{ color }}
              >
                Full Calendar →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MENTORSHIP_WORKSHOPS.map((ws) => (
              <div
                key={ws.id}
                className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{ background: `${ws.color}15`, color: ws.color }}
                    >
                      {ws.track}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {ws.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mb-1.5 leading-snug">{ws.title}</h3>
                  <p className="text-xs font-bold text-purple-700 mb-3 flex items-center gap-1.5">
                    <FaUserTie size={11} /> Facilitator: {ws.speaker}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800">
                    <FaClock size={11} className="text-purple-600" /> {ws.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <FaMapMarkerAlt size={11} className="text-purple-600" /> {ws.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUCCESS STORIES & TESTIMONIALS (Mentorship Special) */}
      {isMentorship && (
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Alumni Milestones & Success Stories
              </h2>
              <p className="text-xs text-slate-500 font-medium">Breakthroughs and transformations from our past cohort mentees.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MENTORSHIP_TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl p-5 bg-white shadow-sm border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                      {t.track}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{t.cohort}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium italic mb-4">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-none mb-0.5">{t.name}</h4>
                      <span className="text-[11px] font-bold text-emerald-700 block">✓ {t.outcome}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ST. FRANCIS FEAST DAY BANNER & PEACE PRAYER (St. Francis Special) */}
      {isStFrancis && (
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, #064e3b 0%, #047857 50%, color-mix(in srgb, ${color}, black 20%) 100%)`,
            border: `1px solid rgba(255, 255, 255, 0.15)`,
          }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-300/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                  <FaDove /> Patronal Solemnity Countdown · October 4th
                </span>
                <span className="text-xs text-white/70 font-semibold">Parish Feast Day Celebration</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
                Feast of St. Francis of Assisi & Blessing of Creation
              </h3>

              <p className="text-xs md:text-sm text-emerald-50 leading-relaxed font-medium mb-3 italic">
                "Lord, make me an instrument of your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is despair, hope."
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-emerald-200">
                <span>✓ Outdoor Solemn Mass</span>
                <span>✓ Blessing of Pets & Creation</span>
                <span>✓ 500 Seedlings Planting</span>
                <span>✓ Community Charity Luncheon</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[200px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block mb-1">
                Solemnity Date
              </span>
              <span className="text-2xl font-black text-white block">OCTOBER 4</span>
              <span className="text-xs text-white/80 font-medium">10:00 AM · Parish Grounds</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. SCRIPTURE / VERSE OF THE DAY BANNER (Charismatic Highlight) */}
      {isCharismatic && (
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, color-mix(in srgb, ${color}, black 20%) 100%)`,
            border: `1px solid rgba(255, 255, 255, 0.15)`,
          }}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                  <FaBible /> Scripture of the Week · {currentVerse.theme}
                </span>
                <span className="text-xs text-white/60 font-semibold font-mono">RSV-CE Catholic Bible</span>
              </div>

              <blockquote className="text-lg md:text-xl font-extrabold text-white leading-relaxed tracking-tight mb-2 font-serif italic">
                "{currentVerse.verse}"
              </blockquote>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-sm font-black text-amber-300 tracking-wide">{currentVerse.reference}</span>
                <span className="text-white/40">·</span>
                <span className="text-xs text-white/80 font-medium italic">{currentVerse.context}</span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={handleCopyVerse}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
              >
                {copiedVerse ? <><FaCheck className="text-emerald-400" /> Copied!</> : <><FaCopy /> Copy Verse</>}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVerseIndex((prev) => (prev > 0 ? prev - 1 : CHARISMATIC_VERSES.length - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Previous verse"
                >
                  <FaChevronLeft size={10} />
                </button>
                <span className="text-[11px] font-bold text-white/60 px-2 font-mono">
                  {verseIndex + 1}/{CHARISMATIC_VERSES.length}
                </span>
                <button
                  onClick={() => setVerseIndex((prev) => (prev + 1) % CHARISMATIC_VERSES.length)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Next verse"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. NON-REDUNDANT STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="relative rounded-2xl p-5 overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-sm"
            style={{
              background: `linear-gradient(135deg, white 0%, ${color}06 100%)`,
              border: `1px solid ${color}20`,
              boxShadow: `0 4px 18px ${color}08`,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, color }}
              >
                {stat.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.title}</span>
            </div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-700 mt-1">{stat.subtitle}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* 9. ST. FRANCIS CHARITY & OUTREACH INITIATIVES (St. Francis Special) */}
      {isStFrancis && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Charity & Corporal Mercy Outreach
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Live progress tracking of our ongoing community mercy drives, hospital visits, and children's home support.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedCharityProject(ST_FRANCIS_CHARITY_PROJECTS[0]);
                setShowDonationModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:scale-[1.02] transition-all self-start sm:self-auto cursor-pointer"
              style={{ background: color }}
            >
              <FaDonate size={12} /> Contribute to Outreach
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ST_FRANCIS_CHARITY_PROJECTS.map((proj) => {
              const percent = Math.min(100, Math.round((proj.raised / proj.target) * 100));
              return (
                <div
                  key={proj.id}
                  className="rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {proj.badge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{proj.status}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm mb-2 leading-snug">{proj.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">{proj.desc}</p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Raised: <strong>Ksh {proj.raised.toLocaleString()}</strong></span>
                        <span className="text-emerald-600 font-extrabold">{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block text-right mt-0.5">
                        Target: Ksh {proj.target.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCharityProject(proj);
                        setShowDonationModal(true);
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FaDonate size={11} /> Support This Project
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10. ECO-STEWARDSHIP / LAUDATO SI' CREATION CARE (St. Francis Special) */}
      {isStFrancis && (
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, #064e3b 0%, #047857 50%, color-mix(in srgb, ${color}, black 20%) 100%)`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-md">
                <FaLeaf /> Laudato Si' Creation Care Initiative
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Stewards of the Earth & Environmental Ministry
              </h2>
            </div>
            <span className="text-xs text-white/80 font-semibold bg-white/10 px-3.5 py-1.5 rounded-xl self-start md:self-auto backdrop-blur-md">
              "Praise be to You, my Lord, through Sister Mother Earth"
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ST_FRANCIS_ECO_PROJECTS.map((eco, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg mb-3 shadow-sm">
                    {eco.icon}
                  </div>
                  <h4 className="text-sm font-black text-white mb-1.5">{eco.title}</h4>
                  <p className="text-xs text-white/80 leading-relaxed font-medium mb-4">{eco.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-emerald-200">
                  <span>{eco.progress}</span>
                  <span className="text-white">✓ Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. SMALL CHRISTIAN COMMUNITIES (SCC) & JUMUIYA BLOCKS (St. Francis Special) */}
      {isStFrancis && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Neighborhood Small Christian Communities (SCC)
                </h2>
                <p className="text-xs text-slate-500 font-medium">Rotational weekly neighborhood prayer clusters, Rosary sharing, and welfare support.</p>
              </div>
            </div>
            {onQuickLink && (
              <button
                onClick={() => onQuickLink('members')}
                className="text-xs font-bold flex items-center gap-1 transition-colors hover:underline cursor-pointer"
                style={{ color }}
              >
                View Cluster Roster →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ST_FRANCIS_SCC_BLOCKS.map((scc, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-white shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{scc.block}</h4>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">{scc.focus}</p>

                  <div className="space-y-1.5 text-xs text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <FaClock size={11} className="text-emerald-600" /> {scc.meetingTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt size={11} className="text-emerald-600" /> {scc.venue}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Cluster Leader</span>
                  <span className="text-slate-800 font-extrabold">{scc.leader}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. NEXT REHEARSAL / GATHERING COUNTDOWN & CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Countdown Card */}
        <div
          className="lg:col-span-6 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}ee 50%, color-mix(in srgb, ${color}, black 25%) 100%)`,
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-sm">
                <FaClock className="text-amber-300" /> {isMentorship ? "Next Cohort Gathering" : isStFrancis ? "Next Community Fellowship" : isDancers ? "Next Rehearsal & Staging" : isCharismatic ? "Next Prayer Gathering" : "Next Rehearsal Countdown"}
              </span>
              {nextRehearsal?.targetSection && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white/90 border border-white/15">
                  {nextRehearsal.targetSection}
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              {nextRehearsal ? `${nextRehearsal.day} at ${nextRehearsal.startTime}` : 'Weekly Fellowship Schedule'}
            </h3>
            
            <p className="text-white/80 text-xs md:text-sm font-semibold flex items-center gap-2 mb-6">
              <FaMapMarkerAlt className="text-amber-300 shrink-0" />
              Venue: <span className="text-white font-black">{nextRehearsal?.location || (isMentorship ? 'Parish Hall / LH 21' : isStFrancis ? 'LH 21 & Neighborhood Blocks' : 'Parish Hall')}</span>
              {nextRehearsal?.endTime && ` · Till ${nextRehearsal.endTime}`}
            </p>

            {/* Countdown Clock Grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: 'Days', val: timeLeft.days },
                { label: 'Hours', val: timeLeft.hours },
                { label: 'Mins', val: timeLeft.minutes },
                { label: 'Secs', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-3 text-center backdrop-blur-md"
                  style={{ background: 'rgba(255, 255, 255, 0.14)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <span className="block text-2xl md:text-3xl font-black text-white leading-none">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 mt-1 block">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-3">
            <span className="text-xs text-white/70 font-medium">
              {isMentorship ? "Open to all registered cohort mentees and volunteer mentors" : isStFrancis ? "All parishioners & charity volunteers welcome" : isDancers ? "Beginner warmups & staging open to all" : "All community members welcome"}
            </span>
            {onQuickLink && (
              <button
                onClick={() => onQuickLink('activities')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Full Calendar <FaArrowRight size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Upcoming Masses & Gatherings Mini-List */}
        <div
          className="lg:col-span-6 rounded-3xl p-6 md:p-8 bg-white shadow-md flex flex-col justify-between"
          style={{ border: `1px solid ${color}18` }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: `${color}15`, color }}
                >
                  <FaCalendarDay />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {isMentorship ? "Cohort Schedule & Workshops" : isStFrancis ? "Feast Days & Outreach Activities" : isDancers ? "Performance & Ministration Schedule" : isCharismatic ? "Prayer Gatherings & Vigils" : "Liturgical Events & Masses"}
                </h3>
              </div>
              {onQuickLink && (
                <button
                  onClick={() => onQuickLink('activities')}
                  className="text-xs font-bold transition-colors hover:underline cursor-pointer"
                  style={{ color }}
                >
                  View All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(module.activities && module.activities.length > 0 ? module.activities.slice(0, 3) : [
                {
                  id: 'act-1',
                  title: '"Faith, Career & Purpose" Saturday Seminar',
                  date: 'August 30, 2026 · 9:00 AM',
                  description: 'Guest speaker Dr. Angela Wanjiru on integrating Catholic faith with professional ambition.',
                  status: 'Upcoming'
                },
                {
                  id: 'act-2',
                  title: 'Semester 2 Cohort Kick-Off & Mentor Pairing Day',
                  date: 'September 7, 2026 · 3:00 PM',
                  description: 'Official cohort launch with mentor–mentee matching and goal-setting in the Parish Hall.',
                  status: 'Upcoming'
                },
                {
                  id: 'act-3',
                  title: 'Monthly One-on-One Mentor Review Sessions',
                  date: 'Every Wednesday · 6:30 PM',
                  description: 'Individual check-in meetings between assigned mentors and mentees online or in-person.',
                  status: 'Ongoing'
                }
              ]).map((act: any, idx: number) => (
                <div
                  key={act.id || idx}
                  className="p-3.5 rounded-2xl transition-all duration-200 hover:translate-x-1"
                  style={{ background: lightBg, border: `1px solid ${color}10` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-extrabold text-slate-800 text-sm">{act.title}</h4>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0"
                      style={{
                        background: act.status === 'Ongoing' ? '#ecfdf5' : '#eff6ff',
                        color: act.status === 'Ongoing' ? '#059669' : color,
                        border: `1px solid ${color}20`
                      }}
                    >
                      {act.status || 'Scheduled'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <FaClock size={10} style={{ color }} /> {act.date}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{act.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isMentorship ? "Mentorship Program Semester 2 Calendar" : isStFrancis ? "Franciscan Outreach & Liturgical Calendar" : isDancers ? "Liturgical Sacred Dance Calendar" : "Community Calendar"}</span>
            <span className="font-bold text-slate-700">Cohort 5 · Year 2026</span>
          </div>
        </div>
      </div>

      {/* 13. ANNOUNCEMENTS & URGENT NOTICE BOARD */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Notice Board & Urgent Updates
            </h2>
          </div>
          {onQuickLink && (
            <button
              onClick={() => onQuickLink('channels')}
              className="text-xs font-bold flex items-center gap-1 transition-colors hover:underline cursor-pointer"
              style={{ color }}
            >
              Resources & Channels <FaShareAlt size={10} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((notice, idx) => {
            const isUrgent = notice.priority === 'urgent' || idx === 0;
            const isHigh = notice.priority === 'high' || idx === 1;
            const badgeBg = isUrgent ? '#fee2e2' : isHigh ? '#fef3c7' : '#e0e7ff';
            const badgeColor = isUrgent ? '#dc2626' : isHigh ? '#d97706' : '#4338ca';

            return (
              <div
                key={notice.id || idx}
                className="relative rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                style={{
                  border: `1px solid ${isUrgent ? '#fca5a5' : `${color}18`}`,
                  borderLeft: `4px solid ${isUrgent ? '#ef4444' : isHigh ? '#f59e0b' : color}`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isUrgent ? 'notice-urgent-pulse' : ''}`}
                      style={{ background: badgeBg, color: badgeColor }}
                    >
                      <FaExclamationCircle size={10} />
                      {notice.category || (isUrgent ? 'Urgent Notice' : 'Community Alert')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{notice.date || 'Active Notice'}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm mb-2 leading-snug">
                    {notice.title || notice.announcement_title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {notice.content || notice.announcement_content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    {isMentorship ? 'Mentorship Directorate' : isStFrancis ? 'St. Francis Core Team' : isDancers ? 'Dance Core Team' : isCharismatic ? 'Charismatic Core Team' : 'Choir Office'}
                  </span>
                  {onQuickLink && (
                    <button
                      onClick={() => onQuickLink('channels')}
                      className="text-[11px] font-bold transition-all hover:underline cursor-pointer"
                      style={{ color }}
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 14. LEADERSHIP SPOTLIGHT */}
      {leaderSpotlight && (
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-lg"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${color}, white 94%) 0%, white 100%)`,
            border: `1px solid ${color}25`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-xl shrink-0 ring-4"
                style={{ ringColor: `${color}30` }}
              >
                {leaderSpotlight.photoUrl ? (
                  <img src={leaderSpotlight.photoUrl} alt={leaderSpotlight.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-3xl font-black"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                  >
                    {leaderSpotlight.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2"
                  style={{ background: `${color}15`, color }}
                >
                  <FaUserTie size={10} /> {leaderSpotlight.role}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{leaderSpotlight.name}</h3>
                <p className="text-xs text-slate-600 max-w-lg leading-relaxed font-medium mb-3">
                  {leaderSpotlight.bio}
                </p>

                {/* Direct Action Contacts */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {leaderSpotlight.phoneNumber && (
                    <a
                      href={`tel:${leaderSpotlight.phoneNumber}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all"
                    >
                      <FaPhoneAlt size={10} /> Call Leader
                    </a>
                  )}
                  {leaderSpotlight.phoneNumber && (
                    <a
                      href={`https://wa.me/${formatPhoneForWa(leaderSpotlight.phoneNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm"
                    >
                      <FaWhatsapp size={12} /> WhatsApp
                    </a>
                  )}
                  {leaderSpotlight.email && (
                    <a
                      href={`mailto:${leaderSpotlight.email}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm"
                    >
                      <FaEnvelope size={10} /> Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {onQuickLink && (
              <button
                onClick={() => onQuickLink('officials')}
                className="px-5 py-3 rounded-2xl font-black text-xs text-white shadow-md hover:scale-[1.03] transition-all shrink-0 cursor-pointer"
                style={{ background: color }}
              >
                Meet All Mentors & Leads →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 15. MEMBERSHIP & VOLUNTEER RECRUITMENT CTA */}
      <div
        className="rounded-3xl p-6 md:p-10 mb-8 text-white relative overflow-hidden shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color}, black 20%) 100%)`,
        }}
      >
        <div className="relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-md">
              {isMentorship ? <FaGraduationCap className="text-amber-300" /> : isStFrancis ? <FaDove className="text-emerald-300" /> : isDancers ? <FaChild className="text-pink-300" /> : isCharismatic ? <FaFire className="text-amber-300" /> : <FaMicrophone />}
              {isMentorship ? "Cohort 5 Intake & Mentor Volunteer Registration" : isStFrancis ? "Franciscan Fraternity Membership" : isDancers ? "Dance Ministry Auditions & Training" : isCharismatic ? "Join the Charismatic Fellowship" : "Auditions & Open Rehearsals"}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              {isMentorship
                ? "Invest in Your Calling: Faith, Career & Life Growth"
                : isStFrancis
                ? "Live the Franciscan Way: Peace, Charity & Eco-Care"
                : isDancers
                ? "Praise the Lord with Sacred Dance & Bodily Prayer"
                : isCharismatic
                ? "Experience the Power & Gifts of the Holy Spirit"
                : "Sing with Us in Four-Part Harmony"}
            </h2>
            <p className="text-white/85 text-xs md:text-sm leading-relaxed font-medium">
              {isMentorship
                ? "Join our structured 4-month cohort as a Mentee to receive personalized coaching, or join our faculty of seasoned Catholic professionals investing as volunteer Mentors."
                : isStFrancis
                ? "Join our vibrant fraternity in corporal works of mercy, caring for creation, and supporting one another in Small Christian Communities (SCC)."
                : isDancers
                ? "Aspiring dancers of all skill levels are warmly welcome! We provide structured coaching in rhythm, sacred movement, and altar reverence (Psalm 149:3)."
                : isCharismatic
                ? "All parishioners, youth, and seekers are warmly invited to join our weekly praise & worship, scripture teachings, and community prayer chains."
                : "Whether you are a seasoned vocalist or looking to learn tonic solfa and music reading for the first time, our choir community welcomes you."}
            </p>
          </div>

          {/* Voice Sections for Choir (Interactive Voice Hubs) */}
          {isChoir && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <FaHeadphones /> Interactive Voice Section Hubs · Click Card to View Rehearsal Leads & Announcements
                </span>
                <span className="text-[10px] font-bold text-white/70 font-mono">SATB 4-Part Harmony</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {VOICE_SECTIONS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVoiceSection(v);
                      setShowVoiceModal(true);
                    }}
                    className="rounded-2xl p-4 backdrop-blur-md text-left transition-all duration-300 hover:scale-[1.03] hover:bg-white/20 cursor-pointer group relative overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        {v.name} <FaChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/20 text-amber-300">
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-amber-200 mb-1">{v.desc}</p>
                    <p className="text-[11px] text-white/75 leading-relaxed line-clamp-2">{v.role}</p>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/90 font-bold">
                      <span className="flex items-center gap-1"><FaVolumeUp size={10} className="text-amber-300" /> Play Lead Audio</span>
                      <span className="text-amber-300 font-mono text-[9px]">Hub &rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (isChoir) {
                  navigate(`/community/choir/join`);
                } else if (isCharismatic) {
                  navigate(`/community/charismatic/join`);
                } else if (isDancers) {
                  navigate(`/community/dancers/join`);
                } else if (isStFrancis) {
                  navigate(`/community/st-francis/join`);
                } else if (isMentorship) {
                  navigate(`/community/youth/join`);
                } else if (onQuickLink) {
                  onQuickLink('members');
                }
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm bg-white text-slate-900 shadow-xl hover:bg-slate-100 hover:scale-[1.03] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FaCheckCircle className="text-emerald-600" />
              {isMentorship ? "Register as Mentee (Cohort 5)" : isStFrancis ? "Register for St. Francis Community" : isDancers ? "Register for Liturgical Dancers" : isCharismatic ? "Register for Charismatic Fellowship" : "Apply to Join Choir Online"}
            </button>

            {isMentorship && (
              <button
                onClick={() => setShowVolunteerModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-amber-500/85 hover:bg-amber-500 border border-amber-300/30 transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
              >
                <FaChalkboardTeacher /> Volunteer as a Mentor
              </button>
            )}

            {onQuickLink && (
              <button
                onClick={() => onQuickLink('officials')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-white/20 hover:bg-white/30 border border-white/25 transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <FaUsers /> Contact Ministry Leadership
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 16. DOCUMENT & RESOURCE CENTER */}
      <div
        className="rounded-3xl p-7 md:p-9 mb-8 bg-white shadow-sm"
        style={{ border: `1px solid ${color}18` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
            <h2 className="text-xl font-black text-slate-900">
              {isMentorship ? "Mentorship Resource Library & Downloadable Toolkits" : isStFrancis ? "Document & Resource Center" : isCharismatic ? "Document & Resource Center" : "Our Sacred Journey & Story"}
            </h2>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm md:text-[15px] font-medium whitespace-pre-line mb-6">
          {module.story || module.about || module.description}
        </p>

        {isMentorship ? (
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <FaDownload className="text-purple-600" /> Goal Planners, CV Templates & Devotionals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {MENTORSHIP_RESOURCES.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                        style={{ background: `${res.color}15`, color: res.color }}
                      >
                        {res.tag}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{res.fileSize}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">{res.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{res.desc}</p>
                  </div>

                  <a
                    href={module.history_pdf_url || (module as any).pdf_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
                    style={{ background: color }}
                  >
                    <FaDownload size={11} /> Download Toolkit Resource
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : isStFrancis ? (
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <FaDownload className="text-emerald-600" /> Franciscan Guidelines, Constitution & Reports
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ST_FRANCIS_RESOURCES.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {res.tag}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{res.fileSize}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">{res.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{res.desc}</p>
                  </div>

                  <a
                    href={module.history_pdf_url || (module as any).pdf_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
                    style={{ background: color }}
                  >
                    <FaDownload size={11} /> Download PDF Resource
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : isCharismatic ? (
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <FaBible className="text-purple-600" /> Foundational Group Documents & Manuals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CHARISMATIC_RESOURCES.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                        {res.tag}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{res.fileSize}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">{res.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{res.desc}</p>
                  </div>

                  <a
                    href={module.history_pdf_url || (module as any).pdf_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
                    style={{ background: color }}
                  >
                    <FaDownload size={11} /> Download PDF Resource
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : isChoir ? (
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <FaBookOpen className="text-indigo-600" /> Active Hymnody, Solfa Scores & Digital Songbook
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {DEFAULT_CHOIR_REPERTOIRE.map((item) => {
                const sheetData = DIGITAL_SONGBOOK_SHEETS[item.id] || {
                  title: item.title,
                  composer: item.composer,
                  keySignature: item.keySignature,
                  tempo: item.tempo,
                  part: item.part,
                  solfa: `d : m | s : d' | m : r | d : -`,
                  lyricsSwahili: `1. Tumwimbie Bwana kwa sifa na vigelegele.\n2. Wema wake hudumu milele na milele.`,
                  lyricsEnglish: `1. Sing to the Lord with praise and joyful shouting.\n2. His mercy endures forever and ever.`,
                  notes: `Key signature: ${item.keySignature}`
                };

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                          {item.part}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">{item.keySignature}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-semibold mb-3">{item.composer}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSongbookSheet(sheetData);
                          setShowSongbookModal(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <FaBookOpen size={11} /> Solfa Score
                      </button>
                      {(module.history_pdf_url || (module as any).pdf_url) && (
                        <a
                          href={module.history_pdf_url || (module as any).pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all"
                          title="Download PDF"
                        >
                          <FaDownload size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          (module.history_pdf_url || (module as any).pdf_url) && (
            <a
              href={module.history_pdf_url || (module as any).pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-md"
              style={{ background: color }}
            >
              <FaDownload size={13} /> Download History & Guidelines (PDF)
            </a>
          )
        )}
      </div>

      {/* 17. ENHANCED ACTIONABLE MEETING SCHEDULE GRID */}
      <div
        className="rounded-3xl p-7 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color}, black 25%) 100%)`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <FaCalendarCheck className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {isMentorship
                ? "Mentorship Cohort & Coaching Schedule Breakdown"
                : isStFrancis
                ? "Fellowship & Outreach Schedule Breakdown"
                : isDancers
                ? "Rehearsal & Staging Schedule Breakdown"
                : isCharismatic
                ? "Prayer Gatherings & Intercession Schedule"
                : "Rehearsal & Practice Schedule Breakdown"}
            </h3>
            <p className="text-xs text-white/70">Regular weekly time slots, formats, and venue locations</p>
          </div>
        </div>

        {/* 3-Column Actionable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Weekly Sessions */}
          <div
            className="rounded-2xl p-5 backdrop-blur-md"
            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <FaClock /> {isMentorship ? "Cohort Sessions" : isStFrancis ? "Main Gatherings" : isDancers ? "Rehearsal Times" : isCharismatic ? "Main Fellowships" : "Practice Times"}
            </div>
            {isMentorship ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Sundays: 3:00 PM – 5:00 PM</p>
                <p className="text-xs text-white/80 mb-2.5">General Cohort Sessions, Masterclasses & Life Skills</p>
                <p className="text-sm font-extrabold text-white mb-1">Wednesdays: 6:30 PM – 8:00 PM</p>
                <p className="text-xs text-white/80">1-on-1 Virtual Check-ins & Academic Coaching</p>
              </>
            ) : isStFrancis ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Sundays: 5:00 PM – 6:30 PM</p>
                <p className="text-xs text-white/80 mb-2.5">LH 21 Fellowship & Community Rosary</p>
                <p className="text-sm font-extrabold text-white mb-1">Tues – Thu: 6:30 PM</p>
                <p className="text-xs text-white/80">Neighborhood SCC Jumuiya Rotations</p>
              </>
            ) : isDancers ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Saturdays: 4:00 PM – 6:30 PM</p>
                <p className="text-xs text-white/80 mb-2.5">Full Choreography, Staging & Processions</p>
                <p className="text-sm font-extrabold text-white mb-1">Wednesdays: 5:00 PM – 6:30 PM</p>
                <p className="text-xs text-white/80">Technique, Body Stretches & Prop Drills</p>
              </>
            ) : isCharismatic ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Thursdays: 6:00 PM – 8:00 PM</p>
                <p className="text-xs text-white/80 mb-2.5">Praise & Worship, Teachings & Testimonies</p>
                <p className="text-sm font-extrabold text-white mb-1">Tuesdays: 5:30 PM – 7:00 PM</p>
                <p className="text-xs text-white/80">Intercessory Prayer Chain & Wall Petitions</p>
              </>
            ) : (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Tuesdays: 6:00 PM – 8:00 PM</p>
                <p className="text-xs text-white/80 mb-2.5">Full Choir SATB Hymnody & Solfa</p>
                <p className="text-sm font-extrabold text-white mb-1">Saturdays: 1:00 PM – 4:00 PM</p>
                <p className="text-xs text-white/80">Intensive Mass & Polyphony Repertoire</p>
              </>
            )}
          </div>

          {/* Column 2: Venue & Special Sessions */}
          <div
            className="rounded-2xl p-5 backdrop-blur-md"
            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <FaMapMarkerAlt /> {isMentorship ? "Venues & Bootcamps" : isStFrancis ? "Venues & Outreaches" : isDancers ? "Venues & Ministration" : isCharismatic ? "Venues & Vigils" : "Venues & Rooms"}
            </div>
            {isMentorship ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Parish Hall & LH 21</p>
                <p className="text-xs text-white/80 mb-2.5">Sunday general meetings & guest speaker labs</p>
                <p className="text-sm font-extrabold text-white mb-1">Monthly Saturday: 9AM – 1PM</p>
                <p className="text-xs text-white/80">Career bootcamps, mock interviews & CV reviews</p>
              </>
            ) : isStFrancis ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">1st Saturday Monthly: 8:30 AM</p>
                <p className="text-xs text-white/80 mb-2.5">Laudato Si' Eco-Care & Tree Planting</p>
                <p className="text-sm font-extrabold text-white mb-1">Lecture Hall 21 (LH 21)</p>
                <p className="text-xs text-white/80">Central parish gathering & donation drop-off</p>
              </>
            ) : isDancers ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">School Compound / Main Hall</p>
                <p className="text-xs text-white/80 mb-2.5">Main choreography drills & space mapping</p>
                <p className="text-sm font-extrabold text-white mb-1">Lecture Hall 21 (LH 21)</p>
                <p className="text-xs text-white/80">Theory, costume fitting & spiritual warmups</p>
              </>
            ) : isCharismatic ? (
              <>
                <p className="text-sm font-extrabold text-white mb-1">1st Friday Monthly: 9PM – 5AM</p>
                <p className="text-xs text-white/80 mb-2.5">Main Church Overnight Vigil & Adoration</p>
                <p className="text-sm font-extrabold text-white mb-1">Parish Hall & Church Grotto</p>
                <p className="text-xs text-white/80">Main gathering and quiet intercession point</p>
              </>
            ) : (
              <>
                <p className="text-sm font-extrabold text-white mb-1">Main Church Hall</p>
                <p className="text-xs text-white/80 mb-2.5">General practice & liturgical staging</p>
                <p className="text-sm font-extrabold text-white mb-1">Lecture Hall 32 (LH 32)</p>
                <p className="text-xs text-white/80">Sectionals, sight-reading & vocal coaching</p>
              </>
            )}
          </div>

          {/* Column 3: Leadership Reach-out */}
          <div
            className="rounded-2xl p-5 backdrop-blur-md"
            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <FaPhoneAlt /> Leadership Inquiries
            </div>
            <p className="text-xs text-white/80 mb-2">
              {isMentorship
                ? "Questions on cohort admission, mentor pairing, or workshop schedule?"
                : isStFrancis
                ? "Questions on charity donations, member welfare, or SCC cluster allocation?"
                : isDancers
                ? "Questions on dance routines, uniform fittings, or audition placement?"
                : isCharismatic
                ? "Need pastoral counseling, hospital visitation, or emergency intercession?"
                : "Questions regarding rehearsals, voice allocation, or music sheets?"}
            </p>
            {leaderSpotlight?.phoneNumber && (
              <a
                href={`https://wa.me/${formatPhoneForWa(leaderSpotlight.phoneNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md mt-1"
              >
                <FaWhatsapp size={12} /> WhatsApp {isMentorship ? 'Program Director' : isStFrancis ? 'Chairperson' : isDancers ? 'Choreography Lead' : isCharismatic ? 'Intercession Lead' : 'Choir Master'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 18. QUICK LINKS SYSTEM */}
      {onQuickLink && (
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full" style={{ background: color }} />
            Explore {module.title}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { tab: 'officials' as const, icon: <FaUsers />, label: 'Leadership & Mentors' },
              { tab: 'activities' as const, icon: <FaCalendarDay />, label: 'Events & Schedule' },
              { tab: 'channels' as const, icon: isMentorship ? <FaBookOpen /> : isStFrancis ? <FaHandHoldingHeart /> : isDancers ? <FaVideo /> : isCharismatic ? <FaPrayingHands /> : <FaMusic />, label: isMentorship ? 'Toolkits & Media' : isStFrancis ? 'Outreaches & Media' : isDancers ? 'Routines & Media' : isCharismatic ? 'Praise & Channels' : 'Channels & Sheets' },
              { tab: 'members' as const, icon: <FaLayerGroup />, label: 'Community Register' },
            ].map((link) => (
              <button
                key={link.tab}
                onClick={() => onQuickLink(link.tab)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all hover:scale-[1.03] hover:shadow-md duration-300 cursor-pointer bg-white"
                style={{
                  border: `1px solid ${color}18`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                  style={{ background: `${color}15`, color }}
                >
                  {link.icon}
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: MENTORSHIP SESSION REQUEST */}
      {showMentorRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowMentorRequestModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <FaChalkboardTeacher size={18} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Request 1-on-1 Mentorship</h3>
                <p className="text-xs text-slate-500">
                  {selectedMentor ? `Session with ${selectedMentor.name}` : 'Connect with a Catholic Professional'}
                </p>
              </div>
            </div>

            {selectedMentor && (
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 mb-4">
                <p className="text-xs font-black text-purple-900">{selectedMentor.role} · {selectedMentor.profession}</p>
                <p className="text-[11px] text-purple-700 font-semibold mt-0.5">Availability: {selectedMentor.availability}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Thank you ${mentorRequestForm.name || 'Mentee'}! Your mentorship request has been submitted to the directorate.`);
                setShowMentorRequestModal(false);
                setMentorRequestForm({ name: '', email: '', phone: '', track: 'Career Guidance', goals: '' });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mwangi"
                  value={mentorRequestForm.name}
                  onChange={(e) => setMentorRequestForm({ ...mentorRequestForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0712345678"
                    value={mentorRequestForm.phone}
                    onChange={(e) => setMentorRequestForm({ ...mentorRequestForm, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Growth Track *
                  </label>
                  <select
                    value={mentorRequestForm.track}
                    onChange={(e) => setMentorRequestForm({ ...mentorRequestForm, track: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="Spiritual Formation">Spiritual Formation</option>
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Academic Coaching">Academic Coaching</option>
                    <option value="Life Skills">Life Skills & Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  What are your key goals or questions for this session? *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Need CV review for internship applications, spiritual discernment for career, study plan..."
                  value={mentorRequestForm.goals}
                  onChange={(e) => setMentorRequestForm({ ...mentorRequestForm, goals: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMentorRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FaCheckCircle /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VOLUNTEER AS A MENTOR */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowVolunteerModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <FaChalkboardTeacher size={18} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Volunteer as a Mentor</h3>
                <p className="text-xs text-slate-500">Invest your professional experience in young Christians</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100 text-xs text-amber-900 leading-relaxed font-medium mb-4">
              Mentors commit to 2–4 hours per month to guide an assigned cohort mentee, host workshop labs, or provide resume & spiritual reviews.
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-xs font-bold text-slate-700">Reach out directly to our Program Director:</p>
              <a
                href="https://wa.me/254712334455?text=Hello%20Dr.%20Paul,%20I%20would%20like%20to%20volunteer%20as%20a%20Mentor%20for%20the%20Mentorship%20Program."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaWhatsapp size={14} /> Contact Dr. Paul Kariuki on WhatsApp
              </a>
              <a
                href="mailto:paul@mentorship-csa.org?subject=Volunteer%20Mentor%20Application"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaEnvelope size={13} /> Send Email Application
              </a>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowVolunteerModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHARITY CONTRIBUTION MODAL */}
      {showDonationModal && selectedCharityProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowDonationModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FaHandHoldingHeart size={18} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Support Charity Project</h3>
                <p className="text-xs text-slate-500">{selectedCharityProject.title}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 mb-4">
              <p className="text-xs text-emerald-900 font-medium leading-relaxed mb-2">
                {selectedCharityProject.desc}
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Target: Ksh {selectedCharityProject.target.toLocaleString()}</span>
                <span>Raised: Ksh {selectedCharityProject.raised.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Contribution Amount (Ksh)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['200', '500', '1000', '2000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        donationAmount === amt
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Ksh {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Or enter custom amount in Ksh..."
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 mb-0.5">Parish Paybill / Welfare Account:</p>
                <p className="font-mono text-[11px] text-slate-500">Paybill: <strong>247247</strong> · Acc: <strong>ST-FRANCIS-CHARITY</strong></p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDonationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <a
                href={`https://wa.me/254732546356?text=Hello%20St.%20Francis%20Chairperson,%20I%20would%20like%20to%20support%20the%20${encodeURIComponent(selectedCharityProject.title)}%20with%20Ksh%20${donationAmount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FaWhatsapp size={12} /> Confirm with Treasurer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DANCERS ROUTINE PREVIEW */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedRoutine(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-100 text-pink-700">
                {selectedRoutine.part}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">{selectedRoutine.tempo}</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">{selectedRoutine.title}</h3>
            <p className="text-xs font-bold text-pink-600 mb-4">Song: {selectedRoutine.song}</p>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Formation & Staging
                </span>
                <p className="text-xs font-bold text-slate-800">{selectedRoutine.formation}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Required Props & Vestments
                </span>
                <p className="text-xs font-bold text-slate-800">{selectedRoutine.props}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Choreography Instructions
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedRoutine.notes}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRoutine(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
              {onQuickLink && (
                <button
                  onClick={() => {
                    setSelectedRoutine(null);
                    onQuickLink('channels');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-pink-600 hover:bg-pink-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FaVideo size={11} /> Open Video Tutorial
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT PRAYER INTENTION */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowPrayerModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <FaPrayingHands size={18} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Submit Prayer Intention</h3>
                <p className="text-xs text-slate-500">Lifting our petitions to the Throne of Grace</p>
              </div>
            </div>

            <form onSubmit={handleAddIntention} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Intention Title / Need *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healing for My Mother, Academic Breakthrough..."
                  value={newPrayerForm.title}
                  onChange={(e) => setNewPrayerForm({ ...newPrayerForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={newPrayerForm.category}
                  onChange={(e) => setNewPrayerForm({ ...newPrayerForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="Healing">Healing & Recovery</option>
                  <option value="Academics">Academics & Exams</option>
                  <option value="Family Peace">Family Peace & Reconciliation</option>
                  <option value="Spiritual Freedom">Spiritual Deliverance & Peace</option>
                  <option value="Thanksgiving">Thanksgiving for Answered Prayer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Prayer Petition Details *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details so our intercessors can specifically pray for you..."
                  value={newPrayerForm.request}
                  onChange={(e) => setNewPrayerForm({ ...newPrayerForm, request: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FaLock size={11} className="text-slate-400" /> Submit Anonymously
                </span>
                <input
                  type="checkbox"
                  checked={newPrayerForm.isAnonymous}
                  onChange={(e) => setNewPrayerForm({ ...newPrayerForm, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
              </div>

              {!newPrayerForm.isAnonymous && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sister Christine, Kevin O."
                    value={newPrayerForm.author}
                    onChange={(e) => setNewPrayerForm({ ...newPrayerForm, author: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPrayerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FaPrayingHands /> Post Intention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHARE TESTIMONY */}
      {showTestimonyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowTestimonyModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <FaQuoteLeft size={16} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Share Your Praise Report</h3>
                <p className="text-xs text-slate-500">Testify of God’s goodness to encourage others</p>
              </div>
            </div>

            <form onSubmit={handleAddTestimony} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Testimony Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healed of Chronic Illness, Passing Final Exams..."
                  value={testimonyForm.title}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={testimonyForm.category}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="Physical Healing">Physical Healing</option>
                  <option value="Academic Grace">Academic Grace & Favor</option>
                  <option value="Inner Healing">Inner Healing & Peace</option>
                  <option value="Spiritual Breakthrough">Spiritual Breakthrough</option>
                  <option value="Financial Provision">Financial / Tuition Provision</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  What God Did (Your Story) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe how God answered prayer and brought breakthrough..."
                  value={testimonyForm.story}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, story: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FaLock size={11} className="text-slate-400" /> Share Anonymously
                </span>
                <input
                  type="checkbox"
                  checked={testimonyForm.isAnonymous}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
              </div>

              {!testimonyForm.isAnonymous && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sister Christine, Kevin O."
                    value={testimonyForm.author}
                    onChange={(e) => setTestimonyForm({ ...testimonyForm, author: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestimonyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FaQuoteLeft size={10} /> Publish Testimony
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHOIR VOICE SECTION REHEARSAL HUB */}
      {showVoiceModal && selectedVoiceSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setShowVoiceModal(false);
                setPlayingVoiceAudio(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                <FaHeadphones size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{selectedVoiceSection.name} Voice Hub</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">
                    {selectedVoiceSection.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold">{selectedVoiceSection.leader}</p>
              </div>
            </div>

            {/* Pitch Pipe Reference Tuner */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white mb-4 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Pitch Pipe Reference (Web Synthesizer)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Audio</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { note: 'Middle C (C4)', freq: 261.63 },
                  { note: 'Pitch E4', freq: 329.63 },
                  { note: 'Pitch G4', freq: 392.00 },
                  { note: 'High C (C5)', freq: 523.25 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => playPitchPipe(p.freq)}
                    className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-900 border border-slate-700 text-[10px] font-black text-slate-200 transition-all cursor-pointer text-center"
                    title={`Play ${p.note} pitch tone`}
                  >
                    🎵 {p.note.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Announcement */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block mb-1 flex items-center gap-1">
                <FaExclamationCircle size={10} /> Section Announcement
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                {selectedVoiceSection.announcement}
              </p>
            </div>

            {/* Voice Audio Rehearsal Lead Track */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white mb-4 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-1">
                Audio Practice Lead Track
              </span>
              <h4 className="font-extrabold text-sm text-white mb-2">{selectedVoiceSection.trackTitle}</h4>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPlayingVoiceAudio(!playingVoiceAudio)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {playingVoiceAudio ? <FaPause size={12} /> : <FaPlay size={12} />}
                  {playingVoiceAudio ? 'Pause Voice Track' : 'Play Rehearsal Lead'}
                </button>
                <a
                  href={selectedVoiceSection.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 transition-all flex items-center gap-1.5"
                >
                  <FaDownload size={11} /> MP3
                </a>
              </div>
            </div>

            {/* Tonic Solfa Reference Snippet */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Key Solfa Passage Snippet
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                {selectedVoiceSection.solfaSnippet}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowVoiceModal(false);
                  setSelectedSongbookSheet(DIGITAL_SONGBOOK_SHEETS['rep-1']);
                  setShowSongbookModal(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FaBookOpen /> Open Full Score
              </button>
              <a
                href={selectedVoiceSection.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FaWhatsapp size={13} /> Join {selectedVoiceSection.name} WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}


      {/* MODAL: DIGITAL SONGBOOK & SHEET MUSIC VIEWER */}
      {showSongbookModal && selectedSongbookSheet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-indigo-500/30 text-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowSongbookModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black text-xl">
                <FaBookOpen size={22} />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {selectedSongbookSheet.part}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">{selectedSongbookSheet.title}</h3>
                <p className="text-xs text-slate-400 font-bold">{selectedSongbookSheet.composer}</p>
              </div>
            </div>

            {/* Song Meta Header */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Key Signature</span>
                <span className="text-xs font-black text-amber-300">{selectedSongbookSheet.keySignature}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Tempo & Time</span>
                <span className="text-xs font-black text-indigo-300">{selectedSongbookSheet.tempo}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Score Format</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tonic Solfa + Dual Lyrics
                </span>
              </div>
            </div>

            {/* Interactive Rehearsal Audio Player & Speed Bar */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => playPitchPipe(261.63)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <FaHeadphones size={12} /> Play Pitch Pipe (C4)
                </button>
                <span className="text-xs font-extrabold text-slate-300 hidden sm:inline">Practice Speed:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { label: '0.75x Slow', speed: 0.75 },
                  { label: '1.0x Normal', speed: 1.0 },
                  { label: '1.25x Fast', speed: 1.25 },
                ].map((s) => (
                  <button
                    key={s.speed}
                    type="button"
                    onClick={() => setSongbookPlaybackSpeed(s.speed)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      songbookPlaybackSpeed === s.speed
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SATB Voice Part Highlight Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SATB Voice Focus:</span>
              {[
                { id: 'all', label: 'All SATB' },
                { id: 'soprano', label: 'Soprano' },
                { id: 'alto', label: 'Alto' },
                { id: 'tenor', label: 'Tenor' },
                { id: 'bass', label: 'Bass' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setHighlightedVoicePart(v.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    highlightedVoicePart === v.id
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Tabs for Solfa vs Lyrics */}
            <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveSongbookTab('solfa')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeSongbookTab === 'solfa' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🎼 Tonic Solfa Score
              </button>
              <button
                type="button"
                onClick={() => setActiveSongbookTab('swahili')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeSongbookTab === 'swahili' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Swahili Lyrics
              </button>
              <button
                type="button"
                onClick={() => setActiveSongbookTab('english')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeSongbookTab === 'english' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                English Lyrics
              </button>
              <button
                type="button"
                onClick={() => setActiveSongbookTab('dual')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeSongbookTab === 'dual' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🌐 Dual Side-by-Side View
              </button>
            </div>

            {/* Tab Body */}
            {activeSongbookTab === 'solfa' && (
              <div className="p-5 rounded-2xl bg-slate-900 text-amber-300 font-mono text-sm leading-relaxed mb-4 overflow-x-auto whitespace-pre border border-slate-800 shadow-inner">
                <div className="text-[10px] text-indigo-400 uppercase font-sans font-black mb-2">
                  Tonic Solfa Score Notation {highlightedVoicePart !== 'all' && `(Focused: ${highlightedVoicePart.toUpperCase()})`}
                </div>
                {selectedSongbookSheet.solfa}
              </div>
            )}

            {activeSongbookTab === 'swahili' && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm font-medium leading-relaxed mb-4 whitespace-pre-line">
                {selectedSongbookSheet.lyricsSwahili}
              </div>
            )}

            {activeSongbookTab === 'english' && (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm font-medium leading-relaxed mb-4 whitespace-pre-line">
                {selectedSongbookSheet.lyricsEnglish}
              </div>
            )}

            {activeSongbookTab === 'dual' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium leading-relaxed whitespace-pre-line">
                  <span className="text-[10px] font-black uppercase text-indigo-400 block mb-2">Swahili Version</span>
                  {selectedSongbookSheet.lyricsSwahili}
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium leading-relaxed whitespace-pre-line">
                  <span className="text-[10px] font-black uppercase text-purple-400 block mb-2">English Translation</span>
                  {selectedSongbookSheet.lyricsEnglish}
                </div>
              </div>
            )}

            {/* Performance Notes */}
            {selectedSongbookSheet.notes && (
              <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-800/80 text-xs text-amber-200 mb-6 font-medium">
                <strong className="text-amber-300">Performance Notes:</strong> {selectedSongbookSheet.notes}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${selectedSongbookSheet.title}\n\nSolfa:\n${selectedSongbookSheet.solfa}`);
                    setCopiedSheetSolfa(true);
                    setTimeout(() => setCopiedSheetSolfa(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedSheetSolfa ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  {copiedSheetSolfa ? 'Copied!' : 'Copy Solfa'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  🖨️ Print Score
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSongbookModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out the sheet music and solfa for "${selectedSongbookSheet.title}":\n\n${selectedSongbookSheet.solfa}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FaWhatsapp size={13} /> Share Sheet Score
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityAboutTab;

