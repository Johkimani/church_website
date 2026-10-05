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
  payerName?: string;
  phone: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  mpesaCode?: string;
  status?: 'pending_confirmation' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  rejectionReason?: string;
  confirmedAt?: string;
  completedAt?: string;
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
  group_id?: string;
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
    id: "st-anthony",
    name: "St. Anthony",
    fullName: "St. Anthony of Padua",
    description: "Empowered By Grace",
    color: "#b00adab4",
    saintImage: "/images/Anthony.png",
    historyPdf: "/assets/files/SAINT_ANTHONY.pdf",
    tshirtOrders: [],
    about: "St. Anthony of Padua began life as Fernando, born into wealth in Lisbon. He joined a monastery, devoting himself to Scripture and prayer. His desire for radical service awakened after encountering martyred missionaries, leading him to join the Franciscans as Anthony. Though illness prevented him from becoming a missionary, an unexpected opportunity to preach revealed his extraordinary gift. Combining deep biblical wisdom with compelling speech, he became one of the era’s most powerful preachers, drawing vast crowds and calling people to justice, mercy, and authentic faith. His legacy is marked by reported miracles, including the famous story of fish listening to his sermon. After his early death at 36, devotion to him grew, especially as the patron saint of lost items. Yet his deeper gift is helping people rediscover not just objects, but hope, faith, and divine direction. His life poses a timeless question: when one path closes, might God be quietly opening another, greater one?",
    meetingSchedule: {
      day: "Every Sunday",
      time: "2:00 PM - 4:00 PM",
      venue: "LH 24"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "Anthony Maina",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/14.jpg"
      },
      {
        id: "f2",
        name: "Beatrice Njoki",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/15.jpg"
      },
      {
        id: "f3",
        name: "Charles Gitau",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/16.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-anthony"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/stanthonyjumuiya"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@stanthonyjumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
        caption: "Sunday Mass Celebration",
        images: [
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
          "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800",
          "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400",
        caption: "Community Outreach",
        images: [
          "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800",
          "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800",
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400",
        caption: "Prayer Meeting",
        images: [
          "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800",
          "https://images.unsplash.com/photo-1490129374955-fac698e469b2?w=800",
          "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800"
        ]
      }
    ]
  },
  {
    id: "st-augustine",
    name: "St. Augustine",
    fullName: "St. Augustine of Hippo",
    description: "Our Hearts Are Restless",
    color: "#1d21edd6",
    saintImage: "/images/Augustine.png",
    tshirtOrders: [],
    about: "Born in North Africa to a devout Christian mother, Monica, and a pagan father, Augustine was brilliant but rebellious. He pursued pleasure, ambition, and philosophical truth while resisting the faith his mother prayed he would embrace. Despite becoming a celebrated teacher, he remained internally restless and unsatisfied. Monica's relentless prayers followed him for decades. Augustine explored various belief systems but couldn't shake his longing for something more. His famous confession captures this universal struggle: 'Our hearts are restless until they rest in You.' The turning point came in a Milan garden. Overwhelmed by internal conflict, he heard a child's voice chant, 'Take and read.' Opening Scripture nearby, he read a passage calling him to abandon his old ways. In that moment, his resistance broke. He surrendered and was baptized. Augustine went on to become a bishop and one of Christianity's most influential theologians, writing works like Confessions and City of God that still shape Western thought. His intellectual legacy is immense, but his lasting power lies in his story—proof that holiness doesn't require perfection from the start. His life testifies that God meets us in our wandering, that grace outlasts our mistakes, and that it's never too late to come home.",
    meetingSchedule: {
      day: "Every Thursday",
      time: "5:00 PM - 6:50 PM",
      venue: "Lower Dias"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "Daniel Odhiambo",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/24.jpg"
      },
      {
        id: "f2",
        name: "Esther Wambui",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/25.jpg"
      },
      {
        id: "f3",
        name: "Francis Otieno",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/26.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-augustine"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/staugustinejumuiya"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@staugustinejumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        caption: "Bible Study Session",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
          "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800",
          "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400",
        caption: "Fellowship Time",
        images: [
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400",
        caption: "Community Service",
        images: [
          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
          "https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800",
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800"
        ]
      }
    ]
  },
  {
    id: "st-catherine",
    name: "St. Catherine",
    fullName: "St. Catherine of Alexandria",
    description: "St. Catherine The Great Family",
    color: "#fc1f5a88",
    saintImage: "/images/Catherine.jpg",
    historyPdf: "/assets/files/SAINT_CATHERINE.pdf",
    tshirtOrders: [],
    about: "St. Catherine of Alexandria was a Christian princess and scholar in the early 4th century, renowned for her intelligence, eloquence, and unwavering faith. According to tradition, she was born into a noble family in Alexandria, Egypt. From a young age, she devoted herself to learning and the Christian faith. When Emperor Maxentius persecuted Christians, Catherine courageously confronted him, defending Christianity with such wisdom that many scholars sent to debate her converted instead. Infuriated, the emperor tried to persuade her to renounce her faith, but Catherine remained steadfast. She endured imprisonment and was subjected to torture, including the infamous breaking wheel, which miraculously shattered at her touch. Despite her suffering, she continued to pray and inspire others, converting many through her courage and faith. Eventually, Catherine was beheaded, becoming a martyr for her beliefs. Her life symbolized the triumph of faith, intellect, and virtue over tyranny. She became one of the most venerated saints in both Eastern and Western Christianity, often depicted with a wheel, a symbol of her torture, and a crown, representing her nobility. St. Catherine’s story inspired generations to uphold faith and wisdom, showing that courage and intellect can coexist with deep spiritual devotion. Her feast day is celebrated on November 25.",
    meetingSchedule: {
      day: "Every Wednesday",
      time: "5:00 PM - 6:50 PM",
      venue: "Church Hall"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "George Murithi",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/34.jpg"
      },
      {
        id: "f2",
        name: "Hilda Njeri",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/35.jpg"
      },
      {
        id: "f3",
        name: "Isaac Kariuki",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/36.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-catherine"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/stcatherinejumuiya"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@stcatherinejumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400",
        caption: "Peace Prayer Service",
        images: [
          "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800",
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
          "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        caption: "Women's Fellowship",
        images: [
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400",
        caption: "Retreat Weekend",
        images: [
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
          "https://images.unsplash.com/photo-1490129374955-fac698e469b2?w=800",
          "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800"
        ]
      }
    ]
  },
  {
    id: "st-dominic",
    name: "St. Dominic",
    fullName: "St. Dominic Jumuiya",
    description: "God Is Good, I'm A Witness",
    color: "#9ea1a0d1",
    saintImage: "/images/Dominic.png",
    historyPdf: "/assets/files/SAINT_DOMINIC.pdf",
    tshirtOrders: [],
    about: "St. Dominic responded to widespread confusion about faith not with anger, but with truth spoken in kindness. Born in Spain, his compassion was evident early—during a famine, he sold even his cherished books to feed the hungry, saying, ‘How can I study while people are starving?’ As he encountered those drawn away from the Church by persuasive but incorrect teachings, Dominic recognized a deeper problem: no one had taken time to genuinely explain the truth. Rather than condemn, he began walking from place to place, speaking gently, listening carefully, and reasoning patiently. He lived austerely—traveling on foot, eating little, spending nights in prayer—convinced that truth must be carried by love to truly reach hearts. His approach gave birth to the Dominican Order, a community dedicated to preaching, study, and teaching. His followers became renowned for deep learning paired with clear, compassionate communication. Dominic is also traditionally linked to the Rosary, encouraging meditation on Christ’s life as a path to reflection and peace. He never sought fame. He sought clarity. His quiet conviction proved that patience and humility could accomplish what force could not. Dominic’s legacy endures not in grand gestures, but in the simple, stubborn belief that truth, lovingly shared, still changes hearts.",
    meetingSchedule: {
      day: "Every Sunday",
      time: "3:00 PM - 5:00 PM",
      venue: "LH 20"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "Jane Achieng",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        id: "f2",
        name: "Kevin Mwangi",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/45.jpg"
      },
      {
        id: "f3",
        name: "Lydia Chebet",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/46.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-dominic"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/stdominicjumuiya"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@stdominicjumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400",
        caption: "Evangelization Seminar",
        images: [
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800",
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
          "https://images.unsplash.com/photo-1475721027767-f4213d505889?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1519741497674-611481663929?w=400",
        caption: "Scripture Study",
        images: [
          "https://images.unsplash.com/photo-1519741497674-611481663929?w=800",
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
          "https://images.unsplash.com/photo-1507434972699-a653b752378c?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400",
        caption: "Youth Outreach",
        images: [
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
          "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800"
        ]
      }
    ]
  },
  {
    id: "st-elizabeth",
    name: "St. Elizabeth",
    fullName: "St. Elizabeth of Hungary",
    description: "Brothers and Sisters",
    color: "#136b1ac9",
    saintImage: "/images/Elizabeth.png",
    historyPdf: "/assets/files/SAINT_ELIZABETH.pdf",
    tshirtOrders: [],
    about: "Elizabeth was born into royalty. She grew up in castles, surrounded by wealth, comfort, and power. But her heart leaned toward something very different. From a young age, she was deeply moved by the suffering of the poor. As she grew older and became a queen, she had access to great riches. But instead of using them for luxury, she used them to help others. She often snuck food out of the castle to give to the hungry. She visited the sick personally, cared for the dying, and treated everyone with kindness. Some people admired her. Others thought she was foolish. One famous story tells of her carrying bread in her cloak to the poor. When someone stopped her and demanded to see what she was hiding, the bread turned into roses. Whether symbolic or real, the story reflects how people saw her generosity. After her husband died, Elizabeth lost much of her protection. She was pushed out of the palace and left with little. But instead of growing bitter, she chose a life of service. She worked in a hospital she founded, caring for the sick with her own hands. Elizabeth’s life reminds us that kindness is more powerful than status. She had everything — and gave it away for love.",
    meetingSchedule: {
      day: "Every Wednesday",
      time: "5:00 PM - 6:50 PM",
      venue: "Upper Dias"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "Mark Njoroge",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/54.jpg"
      },
      {
        id: "f2",
        name: "Nancy Wanjiru",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/55.jpg"
      },
      {
        id: "f3",
        name: "Oliver Kibet",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/56.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-elizabeth"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/stelizabethjumuiya"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@stelizabethjumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400",
        caption: "Charity Drive",
        images: [
          "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
          "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
        caption: "Visiting the Sick",
        images: [
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
          "https://images.unsplash.com/photo-1551846206-55e8bd20de8d?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=400",
        caption: "Food Distribution",
        images: [
          "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800",
          "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800",
          "https://images.unsplash.com/photo-1534330207526-9e44f4d2050f?w=800"
        ]
      }
    ]
  },
  {
    id: "st-maria-goretti",
    name: "St. Maria Goretti",
    fullName: "St. Maria Goretti Jumuiya",
    description: "With God's Grace",
    color: "#27b8f6ff",
    saintImage: "/images/MariaGoretti.png",
    historyPdf: "/assets/files/SAINT_MARIA_GORETTI.pdf",
    tshirtOrders: [],
    about: "Maria Goretti’s life was short, but its impact has lasted over a century. She was born into a poor farming family in Italy. Life was hard. Her father died when she was young, and her mother worked long hours. Maria helped take care of her siblings and managed the home. Despite the struggles, she was known for her gentle spirit and strong faith. At just 11 years old, her life took a tragic turn. A young man who lived nearby tried to harm her. She resisted, determined to protect her dignity. In anger, he attacked her. She was badly injured and taken to the hospital. Before she died, she did something extraordinary. She forgave him. She told those around her that she hoped he would one day be in heaven with her. Years later, that same man changed. He repented, turned his life around, and even attended her canonization. Maria’s story is painful, yet deeply powerful. It speaks of courage beyond her years and forgiveness that seems almost impossible. She reminds the world that even in darkness, light can still be chosen.",
    meetingSchedule: {
      day: "Every Sunday",
      time: "2:00 PM - 4:00 PM",
      venue: "LH 19"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "Patricia Auma",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/64.jpg"
      },
      {
        id: "f2",
        name: "Quentin Ochieng",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/65.jpg"
      },
      {
        id: "f3",
        name: "Rosemary Njoki",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/66.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-maria-goretti"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/stmariagoretti"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@stmariagorettijumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400",
        caption: "Youth Prayer Night",
        images: [
          "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800",
          "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800",
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
        caption: "Formation Session",
        images: [
          "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400",
        caption: "Community Retreat",
        images: [
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800",
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
        ]
      }
    ]
  },
  {
    id: "st-monica",
    name: "St. Monica",
    fullName: "St. Monica Jumuiya",
    description: "Tusimame Imara",
    color: "#f6080894",
    saintImage: "/images/Monica.png",
    historyPdf: "/assets/files/SAINT_MONICAH.pdf",
    tshirtOrders: [],
    about: "Monica is known as the mother who never gave up. She lived in North Africa and was married to a man who did not share her faith. He had a difficult temper. Her greatest sorrow, though, was her son Augustine. He was intelligent but stubborn, chasing pleasure and rejecting the faith she had taught him. For years, she prayed. Not for days. Not for months. For decades. She cried, pleaded, and trusted that one day he would change. People told her to stop worrying. But she refused. She followed him across cities, always hoping, always praying. Finally, her prayers were answered. Augustine converted and became one of the greatest thinkers in Christian history. Monica didn’t preach loudly. She didn’t argue constantly. She waited, trusted, and loved. Her story speaks to anyone who has ever hoped for someone to change. She reminds us that sometimes the greatest strength is simply refusing to give up.",
    meetingSchedule: {
      day: "Every Sunday",
      time: "2:00 PM - 4:00 PM",
      venue: "LH 17"
    },
    officials: [],
    termOfOffice: {
      startYear: 2024,
      endYear: 2026
    },
    formerOfficials: [
      {
        id: "f1",
        name: "Simon Kamau",
        position: "Chairperson",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/74.jpg"
      },
      {
        id: "f2",
        name: "Teresa Wangari",
        position: "Secretary",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/women/75.jpg"
      },
      {
        id: "f3",
        name: "Victor Gitau",
        position: "Treasurer",
        yearsServed: "2022–2024",
        image: "https://randomuser.me/api/portraits/men/76.jpg"
      }
    ],
    socialMedia: [
      {
        platform: "WhatsApp",
        url: "https://chat.whatsapp.com/st-monica"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/stmonicajumuiya"
      },
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@stmonicajumuiya"
      }
    ],
    gallery: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400",
        caption: "Family Prayer Meeting",
        images: [
          "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800",
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
          "https://images.unsplash.com/photo-1490129374955-fac698e469b2?w=800"
        ]
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        caption: "Events",
        images: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
          "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
        ]
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        caption: "Trips",
        images: [
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800",
          "https://images.unsplash.com/photo-1551846206-55e8bd20de8d?w=800",
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800"
        ]
      }
    ]
  }
];

export default jumuiyaList;
