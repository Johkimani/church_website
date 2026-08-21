import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../../../api/axiosInstance';

export interface Official {
    id: string;
    name: string;
    role: string;
    photoUrl?: string;
    email?: string;
    phoneNumber?: string;
}

export interface Activity {
    id: string;
    title: string;
    date: string;
    description: string;
    status: 'Upcoming' | 'Completed' | 'Ongoing';
}

export interface GalleryImage {
    id: string;
    url: string;
    caption: string;
    imageUrl?: string; 
}

export interface Announcement {
    id: string;
    title?: string;
    announcement_title?: string;
    content?: string;
    announcement_content?: string;
    date?: string;
    announcement_date?: string;
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    category?: string;
}

export interface RepertoireItem {
    id: string;
    part: 'Entrance' | 'Kyrie/Gloria' | 'Responsorial' | 'Offertory' | 'Sanctus/Agnus Dei' | 'Communion' | 'Recessional';
    title: string;
    composer?: string;
    keySignature?: string;
    tempo?: string;
    theme?: string;
    sheetUrl?: string;
}

export interface FeaturedAudioTrack {
    id: string;
    title: string;
    subtitle?: string;
    category: string;
    duration: string;
    audioUrl?: string;
    coverUrl?: string;
    lyricsExcerpt?: string;
    conductor?: string;
}

export interface MusicClass {
    id: string;
    title: string;
    instructor?: string;
    schedule: string;
    description: string;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    fee?: number;
}

export interface PracticeSchedule {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    location: string;
    targetSection?: string;
}

export interface CommunityModule {
    id: string;
    title: string;
    description: string;
    path: string;
    color: string;
    icon: string;
    iconColor?: string;
    about?: string;
    scheduleLabel?: string;
    meetingSchedule?: string;
    officials?: Official[];
    activities?: Activity[];
    gallery?: GalleryImage[];
    announcements?: Announcement[];
    musicClasses?: MusicClass[];
    practiceSchedules?: PracticeSchedule[];
    repertoire?: RepertoireItem[];
    featuredTracks?: FeaturedAudioTrack[];
    agenda?: string[];
    fees?: {
        registration?: number | string;
        subscription?: number | string;
        uniform?: string;
    };
    story?: string;
    registrationEndpoint?: string;
    saint_image_url?: string;
    image_url?: string;
    history_pdf_url?: string;
    pdf_url?: string;
}

const initialModules: CommunityModule[] = [
    {
        id: 'choir',
        title: 'St. Thomas Aquinas Choir',
        description: 'Lead the congregation in sacred liturgy and elevate worship through four-part harmony and choral excellence.',
        path: '/community/choir',
        color: '#1e3a5f',
        icon: 'fas fa-music',
        scheduleLabel: 'Practice Schedule',
        registrationEndpoint: '/enrollments',
        about: 'The St. Thomas Aquinas Catholic Choir is dedicated to uplifting the minds and hearts of the faithful through sacred polyphony, classical anthems, and vibrant traditional African liturgical hymns. We animate Sunday 10:00 AM Mass and major feasts throughout the academic year.',
        story: 'Founded with a deep love for sacred choral music, our choir unites students and community members across all 4 voice parts (Soprano, Alto, Tenor, Bass). Through weekly rehearsals, vocal coaching, and spiritual fellowship, we serve the altar with reverence and musical beauty.',
        meetingSchedule: 'Tuesdays 6:00 PM – 8:00 PM (Church Hall) · Saturdays 1:00 PM – 4:00 PM (LH 32)',
        practiceSchedules: [
            { id: '1', day: 'Tuesday', startTime: '18:00', endTime: '20:00', location: 'Main Church Hall', targetSection: 'Full Choir SATB' },
            { id: '2', day: 'Thursday', startTime: '17:00', endTime: '18:30', location: 'LH 32', targetSection: 'Sectionals (Tenor & Bass)' },
            { id: '3', day: 'Saturday', startTime: '13:00', endTime: '16:00', location: 'LH 32', targetSection: 'General Rehearsal' }
        ],
        announcements: [
            {
                id: '1',
                title: 'Vestment & Robe Guideline for Sunday Mass',
                content: 'All choristers are requested to wear the official cream-and-navy liturgical vestments with black formal shoes for the upcoming Solemn Mass.',
                date: '2026-08-20',
                priority: 'urgent',
                category: 'Vestments'
            },
            {
                id: '2',
                title: 'Sectionals Time Shift for Tenor & Bass',
                content: 'Thursday sectional practice will start 30 minutes earlier at 4:30 PM in LH 32 for intensive Solfa sight-reading.',
                date: '2026-08-18',
                priority: 'high',
                category: 'Rehearsal'
            },
            {
                id: '3',
                title: 'New Solfa Song Sheets Uploaded',
                content: 'The sheet music and audio aids for "Panis Angelicus" and "Mungu Ni Pendo" are now available under Channels for download.',
                date: '2026-08-15',
                priority: 'normal',
                category: 'Repertoire'
            }
        ],
        repertoire: [
            { id: '1', part: 'Entrance', title: 'Come, Christians, Join to Sing', composer: 'Christian H. Bateman', keySignature: 'D Major', tempo: 'Allegro Brillante', theme: 'Praise & Adoration' },
            { id: '2', part: 'Kyrie/Gloria', title: 'Missa De Angelis (Misa ya VIII)', composer: 'Gregorian Chant / Liturgical', keySignature: 'F Major', tempo: 'Reverent', theme: 'Penitential & Praise' },
            { id: '3', part: 'Responsorial', title: 'Lord, You Have the Words of Everlasting Life', composer: 'Ps. 19 Setting', keySignature: 'G Major', tempo: 'Moderato', theme: 'Word of God' },
            { id: '4', part: 'Offertory', title: 'Tolea Sadaka Yako Kwa Moyo Safi', composer: 'African Sacred Tradition', keySignature: 'F Major', tempo: 'Joyful 4/4', theme: 'Thanksgiving & Giving' },
            { id: '5', part: 'Communion', title: 'Panis Angelicus / Ave Verum Corpus', composer: 'César Franck & W.A. Mozart', keySignature: 'A Major / D Major', tempo: 'Adagio Cantabile', theme: 'Sacred Eucharist' },
            { id: '6', part: 'Recessional', title: 'Sing with All the Saints in Glory', composer: 'Ludwig van Beethoven (Ode to Joy)', keySignature: 'F Major', tempo: 'Majestic Con Brio', theme: 'Sending Forth' },
        ],
        featuredTracks: [
            {
                id: '1',
                title: 'Panis Angelicus (Live at Easter Vigil)',
                subtitle: 'St. Thomas Aquinas Choir feat. Chamber Ensemble',
                category: 'Sacred Anthem',
                duration: '3:45',
                conductor: 'Choir Director',
                lyricsExcerpt: 'Panis angelicus fit panis hominum; Dat panis coelicus figuris terminum: O res mirabilis! manducat Dominum pauper, servus et humilis.'
            },
            {
                id: '2',
                title: 'Mungu Ni Pendo (Swahili Hymn)',
                subtitle: 'Sunday 10AM Liturgical Live Recording',
                category: 'Liturgical Hymn',
                duration: '4:12',
                conductor: 'Choir Master',
                lyricsExcerpt: 'Mungu ni pendo, apenda watu wote; Kila amwaminiye hatapotea bali atapata uzima wa milele.'
            },
            {
                id: '3',
                title: 'Ave Verum Corpus (W.A. Mozart)',
                subtitle: 'Corpus Christi Solemnity Live Mass',
                category: 'Choral Polyphony',
                duration: '3:18',
                conductor: 'Choir Mistress',
                lyricsExcerpt: 'Ave verum Corpus, natum de Maria Virgine: Vere passum, immolatum in cruce pro homine.'
            }
        ],
        musicClasses: [
            { id: '1', title: 'Tonic Solfa & Sight Reading', instructor: 'Choir Master', schedule: 'Tuesdays 5:00 PM', description: 'Learn to read music notes, sight-sing tonic solfa, and master choral harmony.', skillLevel: 'Beginner' },
            { id: '2', title: 'Vocal Projection & Voice Blend', instructor: 'Choir Mistress', schedule: 'Thursdays 4:30 PM', description: 'Breathing technique, SATB vocal blend, and resonant choir tone.', skillLevel: 'Intermediate' }
        ],
        officials: [
            { id: '1', name: 'Dr. John Doe', role: 'Choir Director / Patron', email: 'director@sta-choir.org', phoneNumber: '0712345678' },
            { id: '2', name: 'Mary Wambui', role: 'Choir Chairperson', email: 'chair@sta-choir.org', phoneNumber: '0722001122' },
            { id: '3', name: 'Emmanuel Kiprono', role: 'Choir Master & Conductor', email: 'choirmaster@sta-choir.org', phoneNumber: '0733445566' }
        ],
        activities: [
            { id: '1', title: 'Solemn Sunday 10:00 AM Mass', date: 'Upcoming Sunday · 10:00 AM', description: 'Animated celebration of the Holy Eucharist with 4-part choral liturgy.', status: 'Upcoming' },
            { id: '2', title: 'National Catholic Choral Festival', date: '2026-10-15', description: 'Inter-parish choral competition and sacred polyphony showcase.', status: 'Upcoming' },
            { id: '3', title: 'Weekly Intensive SATB Rehearsal', date: 'Every Tuesday & Saturday', description: 'Regular practice preparing upcoming liturgical pieces and solfa.', status: 'Ongoing' }
        ],
        fees: { registration: 20, subscription: 50, uniform: 'Cream & Navy Liturgical Robe' }
    },
    {
        id: 'dancers',
        title: 'Liturgical Dancers',
        description: 'Express faith and sacred devotion through graceful choreography, cultural movements, and traditional praise dances during Mass.',
        path: '/community/dancers',
        color: '#db2777',
        icon: 'fas fa-child',
        scheduleLabel: 'Rehearsal & Staging',
        registrationEndpoint: '/enrollments',
        about: 'Our Liturgical Dance Ministry enriches Catholic worship through bodily prayer, graceful liturgical movement, and traditional African praise. We welcome aspiring and seasoned dancers of all skill levels to praise the Lord with rhythm, joy, and sacred reverence (Psalm 149:3).',
        story: 'Rooted in the Catholic tradition of praise and bodily prayer, our Liturgical Dancers bring biblical joy, reverence, and vibrant expressions of worship to Sunday Masses, feasts, weddings, and Archdiocesan solemnities.',
        meetingSchedule: 'Every Saturday, 4:00 PM – 6:30 PM (School Compound / Main Hall) · Wednesdays 5:00 PM (LH 21)',
        practiceSchedules: [
            { id: '1', day: 'Saturday', startTime: '16:00', endTime: '18:30', location: 'School Compound / Main Hall', targetSection: 'Full Choreography & Staging' },
            { id: '2', day: 'Wednesday', startTime: '17:00', endTime: '18:30', location: 'LH 21', targetSection: 'Technique, Stretches & Prop Drills' }
        ],
        announcements: [
            {
                id: '1',
                title: 'Costume & Prop Checklist for Sunday Solemnity Mass',
                content: 'All dancers ministering this Sunday must wear the Royal Blue robes with Gold sashes, clean white dance shoes, and assemble with gold praise ribbons at 9:15 AM.',
                date: '2026-08-21',
                priority: 'urgent',
                category: 'Costumes'
            },
            {
                id: '2',
                title: 'Entrance & Offertory Formations Video Uploaded',
                content: 'The step-by-step formation video for "Tolea Sadaka Yako" and "Heshima na Sifa" is now available in Channels for home practice.',
                date: '2026-08-19',
                priority: 'high',
                category: 'Choreography'
            },
            {
                id: '3',
                title: 'New Member Recruitment & Sacred Dance Workshop',
                content: 'Open warmup and gentle choreography training for new members begins this Saturday at 4:00 PM. No prior dance background needed!',
                date: '2026-08-15',
                priority: 'normal',
                category: 'Recruitment'
            }
        ],
        officials: [
            { id: '1', name: 'Christine Ndunge', role: 'Lead Choreographer & Ministry Director', email: 'christine@dancers-csa.org', phoneNumber: '0714223344' },
            { id: '2', name: 'Brian Mwangi', role: 'Dance Captain & Formations Lead', email: 'brian@dancers-csa.org', phoneNumber: '0725334455' },
            { id: '3', name: 'Angela Wanjiru', role: 'Costumes, Props & Vestments Lead', email: 'angela@dancers-csa.org', phoneNumber: '0736445566' }
        ],
        activities: [
            { id: '1', title: 'Solemn Sunday 10:00 AM Mass Ministration', date: 'Upcoming Sunday · 10:00 AM', description: 'Liturgical Entrance Procession and Joyful Offertory Dance Animation in the Main Church.', status: 'Upcoming' },
            { id: '2', title: 'Archdiocesan Liturgical Sacred Dance Festival', date: '2026-10-22', description: 'Annual regional Catholic dance competition, praise drama, and youth showcase.', status: 'Upcoming' },
            { id: '3', title: 'Weekly Technique & Synchronization Drill', date: 'Every Saturday · 4:00 PM', description: 'Body conditioning, formation symmetry, spiritual prayer warmup, and tambourine practice.', status: 'Ongoing' }
        ],
        agenda: [
            'Express faith and adoration through cultural and liturgical dance',
            'Animate Sunday Masses, feast days, parish weddings, and crusades',
            'Foster sisterhood and brotherhood through disciplined movement and prayer',
            'Train new members from beginner basics to advanced sacred choreography'
        ],
        fees: { registration: 0, subscription: 20, uniform: 'Royal Blue & Gold Robe (Ksh 800) + White Dance Shoes' }
    },
    {
        id: 'charismatic',
        title: 'Charismatic Prayer Group',
        description: 'Deepen your spiritual walk through heartfelt praise & worship, Holy Spirit gifts, and powerful community intercession.',
        path: '/community/charismatic',
        color: '#7c3aed',
        icon: 'fas fa-fire-alt',
        scheduleLabel: 'Prayer Schedule',
        registrationEndpoint: '/enrollments',
        about: 'The Catholic Charismatic Renewal Group is dedicated to experiencing the transformative power and gifts of the Holy Spirit. Through vibrant praise and worship, deep scriptural teachings, healing intercession, and fellowship, we build each other up in faith and love.',
        story: 'Formed as a prayer fellowship rooted in the Catholic Charismatic Renewal, our community gathers weekly to seek the outpouring of the Holy Spirit. We have witnessed countless testimonies of healing, academic breakthroughs, spiritual renewal, and answered prayers.',
        meetingSchedule: 'Thursdays 6:00 PM – 8:00 PM (Parish Hall) · Tuesdays 5:30 PM (Intercession) · 1st Friday Overnight Vigil',
        practiceSchedules: [
            { id: '1', day: 'Thursday', startTime: '18:00', endTime: '20:00', location: 'Parish Hall', targetSection: 'Praise & Worship Main Fellowship' },
            { id: '2', day: 'Tuesday', startTime: '17:30', endTime: '19:00', location: 'Church Grotto / Chapel', targetSection: 'Intercessory Prayer Chain' },
            { id: '3', day: 'Friday', startTime: '21:00', endTime: '05:00', location: 'Main Church', targetSection: '1st Friday Overnight Vigil & Adoration' },
            { id: '4', day: 'Saturday', startTime: '16:00', endTime: '17:30', location: 'Parish Hall', targetSection: 'Life in the Spirit & Formation' }
        ],
        announcements: [
            {
                id: '1',
                title: 'First Friday Overnight Vigil: "Fresh Fire of the Holy Spirit"',
                content: 'Join us this First Friday from 9:00 PM to 5:00 AM for an anointed night of Eucharistic Adoration, praise, and healing prayers in the Main Church.',
                date: '2026-08-21',
                priority: 'urgent',
                category: 'Overnight Vigil'
            },
            {
                id: '2',
                title: 'Life in the Spirit 7-Week Seminar Registration',
                content: 'Registration is now open for our annual Life in the Spirit Seminar starting next month. Learn about the charismatic gifts (1 Cor 12).',
                date: '2026-08-19',
                priority: 'high',
                category: 'Formation'
            },
            {
                id: '3',
                title: 'Tuesday Intercession: Praying for Prayer Wall Petitions',
                content: 'All members and intercessors are invited to submit their prayer requests or join Tuesday 5:30 PM intercession at the Grotto.',
                date: '2026-08-16',
                priority: 'normal',
                category: 'Intercession'
            }
        ],
        featuredTracks: [
            {
                id: '1',
                title: 'Roho Mtakatifu Tawala (Anointing Worship Chant)',
                subtitle: 'Live Charismatic Fellowship Worship Recording',
                category: 'Praise & Worship',
                duration: '4:45',
                conductor: 'Praise & Worship Team',
                lyricsExcerpt: 'Roho wa Mungu shuka sasa, jaza mioyo yetu. Washa moto wa upendo wako, twakuhitaji Bwana.'
            },
            {
                id: '2',
                title: 'Mtakatifu Mtakatifu (Live Praise & Adoration Medley)',
                subtitle: 'Eucharistic Holy Hour Live Recording',
                category: 'Adoration & Tongues',
                duration: '5:20',
                conductor: 'Intercession Ministry',
                lyricsExcerpt: 'Mtakatifu Bwana wa Majeshi, mbingu na nchi zimejaa utukufu wako. Hosanna mbinguni.'
            },
            {
                id: '3',
                title: 'As the Deer / Lord I Need You (Adoration Medley)',
                subtitle: 'Overnight Vigil Live Session',
                category: 'Inner Healing',
                duration: '4:10',
                conductor: 'Charismatic Ministry',
                lyricsExcerpt: 'As the deer panteth for the water, so my soul longeth after Thee. You alone are my strength and shield.'
            }
        ],
        officials: [
            { id: '1', name: 'Dr. Patrick Mwangi', role: 'Charismatic Coordinator & Intercession Lead', email: 'patrick@charismatic-csa.org', phoneNumber: '0711223344' },
            { id: '2', name: 'Grace Muthoni', role: 'Praise & Worship Team Leader', email: 'grace@charismatic-csa.org', phoneNumber: '0722334455' },
            { id: '3', name: 'Francis Otieno', role: 'Secretary & Life in the Spirit Coordinator', email: 'francis@charismatic-csa.org', phoneNumber: '0733445566' }
        ],
        activities: [
            { id: '1', title: 'First Friday Overnight Vigil & Adoration', date: 'Monthly 1st Friday · 9:00 PM – 5:00 AM', description: 'Night of deep intercession, Eucharistic Adoration, and spiritual deliverance in the Main Church.', status: 'Upcoming' },
            { id: '2', title: 'Weekly Praise & Worship Fellowship', date: 'Every Thursday · 6:00 PM', description: 'Uplifting praise, scripture teachings, testimonies, and communal prayer in the Parish Hall.', status: 'Ongoing' },
            { id: '3', title: 'Life in the Spirit 7-Week Seminar', date: 'September 12 – October 24, 2026', description: 'Seven-week foundational discipleship on discovering and exercising charismatic gifts (1 Cor 12).', status: 'Upcoming' }
        ],
        agenda: [
            'Pray for the sick, brokenhearted, and afflicted through the power of the Holy Spirit',
            'Lead praise and worship sessions during parish retreats and liturgical events',
            'Conduct annual Life in the Spirit seminars and faith-building workshops',
            'Sustain a 24/7 prayer chain interceding for the parish, community, and nation'
        ],
        fees: { registration: 0, subscription: 0 }
    },
    {
        id: 'st-francis',
        title: 'St. Francis of Assisi',
        description: 'Build bonds of love and support through simplicity, charity, member welfare, and care for creation.',
        path: '/community/st-francis',
        color: '#047857',
        icon: 'fas fa-dove',
        scheduleLabel: 'Fellowship & Outreach',
        registrationEndpoint: '/enrollments',
        about: 'The St. Francis of Assisi community serves the marginalized, cares for God’s creation (Laudato Si’), and promotes peace and charity within our parish. Inspired by the radical humility of our patron saint, we foster neighborhood Jumuiya prayer groups, charity drives, member welfare support, and ecological stewardship.',
        story: 'Named after St. Francis of Assisi, the patron of ecology, peace, and the poor, our community was formed to embody practical Christian mercy. We regularly organize visits to children’s homes, tree-planting drives across parish grounds, hospital visitation ministry, and weekly Small Christian Community neighborhood fellowships.',
        meetingSchedule: 'Every Sunday, 5:00 PM – 6:30 PM (LH 21 & Neighborhood Blocks) · Monthly 1st Saturday Eco-Care',
        practiceSchedules: [
            { id: '1', day: 'Sunday', startTime: '17:00', endTime: '18:30', location: 'LH 21 / Neighborhood Jumuiya Blocks', targetSection: 'Community Fellowship & SCC Prayer' },
            { id: '2', day: 'Saturday', startTime: '08:30', endTime: '12:30', location: 'Parish Grounds / Outreach Centers', targetSection: 'Laudato Si\' Eco-Care & Charity Drive' }
        ],
        announcements: [
            {
                id: '1',
                title: 'Annual St. Francis Feast Day & Creation Blessing (Oct 4th)',
                content: 'Preparations are underway for the Solemn Feast of St. Francis on October 4th featuring the Blessing of Creation, outdoor Mass, and community luncheon.',
                date: '2026-08-21',
                priority: 'urgent',
                category: 'Feast Day'
            },
            {
                id: '2',
                title: 'Children’s Home & Subukia Shrine Charity Drive',
                content: 'Donations of non-perishable foodstuff, school stationery, clothing, and welfare funds for our upcoming outreach are ongoing. Collection desk at LH 21.',
                date: '2026-08-19',
                priority: 'high',
                category: 'Charity Outreach'
            },
            {
                id: '3',
                title: 'Laudato Si’ Tree Planting & Compound Green-up',
                content: 'Join our eco-team this Saturday as we plant 500 indigenous seedlings across the church compound and distribute fruit trees to members.',
                date: '2026-08-16',
                priority: 'normal',
                category: 'Eco-Stewardship'
            }
        ],
        officials: [
            { id: '1', name: 'Joseph Karanja', role: 'Chairperson & Community Director', email: 'karanja@stfrancis-csa.org', phoneNumber: '0732546356' },
            { id: '2', name: 'Catherine Muthoni', role: 'Charity & Member Welfare Coordinator', email: 'catherine@stfrancis-csa.org', phoneNumber: '0721889900' },
            { id: '3', name: 'Peter Kimani', role: 'Laudato Si\' & Eco-Stewardship Lead', email: 'peter@stfrancis-csa.org', phoneNumber: '0712778899' }
        ],
        activities: [
            { id: '1', title: 'Solemn Feast of St. Francis & Creation Blessing', date: 'October 4, 2026 · 10:00 AM', description: 'Annual patronal solemnity Mass, outdoor blessing of creation, tree planting, and community feast in the Parish Grounds.', status: 'Upcoming' },
            { id: '2', title: 'Subukia Pilgrimage & Children’s Home Visit', date: 'September 20, 2026 · 8:30 AM', description: 'Visiting Subukia Shrine and St. Ann Children’s Home with dry food hampers, clothes, and spiritual fellowship.', status: 'Upcoming' },
            { id: '3', title: 'Weekly Neighborhood SCC Fellowship', date: 'Every Sunday · 5:00 PM', description: 'Scripture reflection, community Rosary, member welfare check-ins, and hospitality in LH 21.', status: 'Ongoing' }
        ],
        agenda: [
            'Serve the poor, sick, and marginalized through regular charity drives',
            'Care for the environment through Laudato Si\' tree planting and green-up campaigns',
            'Strengthen Small Christian Communities (SCC) and neighborhood prayer clusters',
            'Sustain a strong member emergency welfare and benevolent support fund'
        ],
        fees: { registration: 20, subscription: 20, uniform: 'Green St. Francis Polo Shirt (Ksh 700)' }
    },
    {
        id: 'youth',
        title: 'Mentorship Program',
        description: 'Empowering young Christians to flourish in faith, career, academics, and life skills through intentional structured mentorship.',
        path: '/community/youth',
        color: '#8e44ad',
        icon: 'fas fa-users',
        scheduleLabel: 'Mentorship Sessions',
        registrationEndpoint: '/enrollments',
        about: 'The Mentorship Program connects young parishioners with experienced Catholic professionals, faith leaders, and life coaches. Through structured cohorts, one-on-one sessions, workshops, and spiritual formation, we cultivate well-rounded disciples ready for the workplace, family life, and society.',
        story: 'Launched to bridge the gap between faith and everyday life, our Mentorship Program has guided over 120 young professionals and students through spiritual formation, career coaching, academic support, and personal transformation. Our mentors are seasoned volunteers — doctors, engineers, educators, entrepreneurs, and spiritual directors — who freely invest in the next generation.',
        meetingSchedule: 'Every Sunday, 3:00 PM – 5:00 PM (Parish Hall) · Monthly Saturday Career & Spiritual Day',
        practiceSchedules: [
            { id: '1', day: 'Sunday', startTime: '15:00', endTime: '17:00', location: 'Parish Hall / LH 21', targetSection: 'Group Cohort Sessions & Life Skills' },
            { id: '2', day: 'Saturday', startTime: '09:00', endTime: '13:00', location: 'Parish Hall / Online', targetSection: 'Career Workshops, Mock Interviews & Seminars' },
            { id: '3', day: 'Wednesday', startTime: '18:30', endTime: '20:00', location: 'Online (Google Meet / WhatsApp)', targetSection: 'One-on-One Mentor Check-ins & Academic Coaching' }
        ],
        announcements: [
            {
                id: '1',
                title: 'New Cohort Intake: Semester 2 / 2026 Registration Now Open',
                content: 'Applications for the September–December 2026 mentorship cohort are now open. Register as a Mentee or volunteer as a Mentor. Limited slots available — 25 mentees per cohort.',
                date: '2026-08-21',
                priority: 'urgent',
                category: 'Cohort Registration'
            },
            {
                id: '2',
                title: 'Guest Speaker: "Faith, Career & Purpose" — August 30th',
                content: 'Join us for an inspiring Saturday seminar featuring Dr. Angela Wanjiru (Medical Doctor & Leadership Coach) on aligning your career with your Catholic faith and God\'s calling.',
                date: '2026-08-19',
                priority: 'high',
                category: 'Workshop'
            },
            {
                id: '3',
                title: 'Goal-Setting Planner & CV Templates Now Available',
                content: 'Download your free 2026 Goal-Setting Workbook and CV Template from the Resources section. Designed specifically for our Mentorship cohort members.',
                date: '2026-08-15',
                priority: 'normal',
                category: 'Resources'
            }
        ],
        officials: [
            { id: '1', name: 'Dr. Paul Kariuki', role: 'Program Director & Spiritual Formation Lead', email: 'paul@mentorship-csa.org', phoneNumber: '0712334455' },
            { id: '2', name: 'Ms. Grace Achieng', role: 'Career Guidance & Professional Development Mentor', email: 'grace@mentorship-csa.org', phoneNumber: '0723445566' },
            { id: '3', name: 'Mr. Kevin Odhiambo', role: 'Academic Coaching & Life Skills Coordinator', email: 'kevin@mentorship-csa.org', phoneNumber: '0734556677' }
        ],
        activities: [
            { id: '1', title: '"Faith, Career & Purpose" Saturday Seminar', date: 'August 30, 2026 · 9:00 AM', description: 'Guest speaker Dr. Angela Wanjiru on integrating Catholic faith with professional ambition and career choices.', status: 'Upcoming' },
            { id: '2', title: 'Semester 2 Cohort Kick-Off & Mentor Pairing Day', date: 'September 7, 2026 · 3:00 PM', description: 'Official cohort launch with mentor–mentee matching, goal-setting sessions, and program orientation in the Parish Hall.', status: 'Upcoming' },
            { id: '3', title: 'Monthly One-on-One Mentor Review Sessions', date: 'Every Wednesday · 6:30 PM', description: 'Individual check-in meetings between assigned mentors and mentees via online or in-person for progress reviews.', status: 'Ongoing' }
        ],
        agenda: [
            'Guide young Christians in spiritual formation, Catholic identity, and discipleship',
            'Provide structured career coaching, CV writing, and interview preparation support',
            'Support academic excellence through goal-setting, study skills, and peer coaching',
            'Develop essential life skills including financial literacy, time management, and mental wellness'
        ],
        fees: { registration: 0, subscription: 0 }
    }
];

interface CommunityContextType {
    modules: CommunityModule[];
    getModuleById: (id: string) => CommunityModule | undefined;
    isLoading: boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const getStoredModules = (): CommunityModule[] => {
        const cached = localStorage.getItem('community_modules_cache');
        if (!cached) return initialModules;

        try {
            const parsed = JSON.parse(cached) as CommunityModule[];
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialModules;
        } catch (error) {
            console.error('Failed to parse cached community modules:', error);
            return initialModules;
        }
    };

    const [modules, setModules] = useState<CommunityModule[]>(getStoredModules);
    const [isLoading, setIsLoading] = useState(() => !localStorage.getItem('community_modules_cache'));

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await apiClient.get('/community-view/data');
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setModules(response.data);
                    localStorage.setItem('community_modules_cache', JSON.stringify(response.data));
                }
            } catch (error) {
                console.error("Failed to fetch community modules, using fallback data.", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchModules();
    }, []);

    const getModuleById = (id: string) => {
        const clean = (id || '').toLowerCase().trim();
        const found = modules.find(m => m.id?.toLowerCase() === clean);
        if (found) return found;
        if (clean === 'mentorship') return modules.find(m => m.id?.toLowerCase() === 'youth');
        if (clean === 'youth') return modules.find(m => m.id?.toLowerCase() === 'mentorship');
        return undefined;
    };

    return (
        <CommunityContext.Provider value={{ modules, getModuleById, isLoading }}>
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunityData = () => {
    const context = useContext(CommunityContext);
    if (context === undefined) {
        throw new Error('useCommunityData must be used within a CommunityProvider');
    }
    return context;
};
