export interface Official {
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    image?: string;
}

export interface MeetingSchedule {
    day: string;
    time: string;
    venue: string;
}

export interface SocialMedia {
    platform: string;
    url: string;
}

export interface GalleryImage {
    id: string;
    url: string;
    caption: string;
    images?: string[]; // Array of images for the album
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'urgent';
    date: string; // ISO date string
    postedBy: string;
}

export interface TshirtOrder {
    id: string;
    holderName: string;
    payerName: string;
    phone: string;
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    quantity: number;
    submittedAt: string;
}

export interface FormerOfficial {
    id: string;
    name: string;
    position: string;
    image?: string;
    yearsServed: string; // e.g. "2022–2023"
}

export interface TermOfOffice {
    startYear: string;
    endYear: string;
}

export interface Member {
    id: string;
    name: string;
    year: string;
    email: string;
    phone: string;
    isRegistered: boolean;
}

export interface JumuiyaData {
    id: string; // Slug for URLs
    group_id: string; // UUID for database operations
    name: string;
    fullName: string;
    description: string;
    about: string;
    meetingSchedule: MeetingSchedule;
    officials: Official[];
    termOfOffice?: TermOfOffice;
    formerOfficials?: FormerOfficial[];
    socialMedia: SocialMedia[];
    gallery: GalleryImage[];
    color: string;
    saintImage: string;
    historyPdf: string;
    category?: string;
    notifications: Notification[];
    tshirtOrders: TshirtOrder[];
    members: Member[];
}


export const jumuiyaList: JumuiyaData[] = [];

