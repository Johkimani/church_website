export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  images?: string[];
}

export interface Official {
  id: string;
  name: string;
  position?: string;
  role?: string;
  phone?: string;
  email?: string;
  image?: string;
}

export interface FormerOfficial {
  id: string;
  name: string;
  position?: string;
  yearsServed: string;
  image?: string;
}

export interface TermOfOffice {
  startYear: number;
  endYear: number;
}

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface MeetingSchedule {
  day: string;
  time: string;
  venue: string;
}

export interface TshirtOrder {
  id: string;
  holderName: string;
  payerName: string;
  phone: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  submittedAt?: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  postedBy: string;
  date: string;
}

export interface JumuiyaData {
  id: string;
  name: string;
  fullName?: string;
  description?: string;
  about?: string;
  historyPdf?: string;
  saintImage?: string;
  color?: string;
  meetingSchedule: MeetingSchedule;
  gallery: GalleryImage[];
  officials?: Official[];
  notifications?: Notification[];
  formerOfficials?: FormerOfficial[];
  termOfOffice?: TermOfOffice;
  socialMedia?: SocialMedia[];
  tshirtOrders?: TshirtOrder[];
}

export const jumuiyaList: JumuiyaData[] = [
  {
    id: 'choir',
    name: 'St. Thomas Aquinas Choir',
    fullName: 'St. Thomas Aquinas Choir',
    description: 'Join our liturgical choir and lead the congregation in sacred worship through music.',
    about: 'The Choir is dedicated to uplifting the spirits of the congregation through hymns and chants.',
    saintImage: '/assets/choir.jpg',
    color: '#2c3e50',
    meetingSchedule: { day: 'Tuesday & Saturday', time: '6:00 PM', venue: 'Parish Hall' },
    gallery: [
      {
        id: 'choir-gallery-1',
        url: '/assets/choir-event.jpg',
        caption: 'Choir worship night',
        images: ['/assets/choir-event-1.jpg', '/assets/choir-event-2.jpg', '/assets/choir-event-3.jpg']
      }
    ],
    officials: [
      { id: 'choir-1', name: 'Agnes Mwangi', position: 'Choir Director', phone: '+254712345678', email: 'agnes@church.org', image: '/assets/choir-director.jpg' },
      { id: 'choir-2', name: 'Samuel Otieno', position: 'Lead Cantor', phone: '+254798765432', email: 'samuel@church.org', image: '/assets/lead-cantor.jpg' }
    ],
    termOfOffice: { startYear: 2024, endYear: 2025 },
    formerOfficials: [
      { id: 'choir-former-1', name: 'Esther Njoroge', position: 'Former Choir Director', yearsServed: '2022 - 2024', image: '/assets/former-choir-director.jpg' }
    ],
    socialMedia: [
      { platform: 'Facebook', url: 'https://facebook.com/stthomasaquinaschoir' },
      { platform: 'Instagram', url: 'https://instagram.com/stthomasaquinaschoir' }
    ],
    notifications: [
      { id: 'choir-notif-1', title: 'Practice Tonight', message: 'Reminder: Choir practice is at 6pm in the Parish Hall.', type: 'info', postedBy: 'Choir Director', date: '2025-01-08T18:00:00Z' }
    ],
    tshirtOrders: []
  },
  {
    id: 'dancers',
    name: 'Liturgical Dancers',
    fullName: 'Liturgical Dancers',
    description: 'Express faith through graceful movements during Mass.',
    about: 'Our liturgical dancers add a profound layer of prayer through movement.',
    saintImage: '/assets/dancers.jpg',
    color: '#e67e22',
    meetingSchedule: { day: 'Saturday', time: '4:00 PM', venue: 'School Compound' },
    gallery: [
      {
        id: 'dancers-gallery-1',
        url: '/assets/dancers-event.jpg',
        caption: 'Dancers in worship',
        images: ['/assets/dancers-event-1.jpg', '/assets/dancers-event-2.jpg']
      }
    ],
    officials: [
      { id: 'dancers-1', name: 'Miriam Achieng', position: 'Dance Coordinator', phone: '+254701234567', email: 'miriam@church.org', image: '/assets/dance-coordinator.jpg' }
    ],
    termOfOffice: { startYear: 2024, endYear: 2025 },
    formerOfficials: [
      { id: 'dancers-former-1', name: 'Grace Wanjiru', position: 'Former Dance Lead', yearsServed: '2022 - 2024', image: '/assets/former-dancer.jpg' }
    ],
    socialMedia: [
      { platform: 'Facebook', url: 'https://facebook.com/liturgicaldancers' },
      { platform: 'WhatsApp', url: 'https://wa.me/254701234567' }
    ],
    notifications: [
      { id: 'dancers-notif-1', title: 'New Rehearsal Routine', message: 'The new routine will be rehearsed this Saturday at 4pm.', type: 'info', postedBy: 'Dance Coordinator', date: '2025-01-05T16:00:00Z' }
    ],
    tshirtOrders: []
  },
  {
    id: 'charismatic',
    name: 'Charismatic Prayer Group',
    fullName: 'Charismatic Prayer Group',
    description: 'Deepen your spiritual life through prayer and worship.',
    about: 'The Charismatic Prayer Group focuses on prayer, praise and healing.',
    saintImage: '/assets/charismatic.jpg',
    color: '#2ecc71',
    meetingSchedule: { day: 'Saturday', time: '5:00 PM', venue: 'Parish Hall' },
    gallery: [],
    socialMedia: [
      { platform: 'Facebook', url: 'https://facebook.com/charismaticprayergroup' }
    ],
    notifications: [
      { id: 'charismatic-notif-1', title: 'Prayer Night', message: 'Join us for a healing prayer evening.', type: 'urgent', postedBy: 'Prayer Leader', date: '2025-01-12T18:00:00Z' }
    ],
    tshirtOrders: []
  },
  {
    id: 'st-francis',
    name: 'St. Francis of Assisi',
    fullName: 'St. Francis of Assisi Community',
    description: 'Build bonds of love and support through simplicity and charity.',
    about: 'The St. Francis community serves the marginalized and cares for creation.',
    saintImage: '/assets/st-francis.jpg',
    color: '#2980b9',
    meetingSchedule: { day: 'Sunday', time: '5:00 PM', venue: 'LH 21' },
    gallery: [],
    socialMedia: [
      { platform: 'Instagram', url: 'https://instagram.com/stfranciscommunity' }
    ],
    notifications: [
      { id: 'st-francis-notif-1', title: 'Community Outreach', message: 'Volunteers needed for the weekend charity drive.', type: 'warning', postedBy: 'Community Lead', date: '2025-01-10T09:00:00Z' }
    ],
    tshirtOrders: []
  }
];

export default jumuiyaList;
