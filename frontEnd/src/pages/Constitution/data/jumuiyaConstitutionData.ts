export interface JumuiyaPageContent {
  pageNumber: number; // 1 to 15
  title: string;
  category?: string;
  scanImageUrl?: string;
  sections: Array<{
    heading?: string;
    subheading?: string;
    items?: string[];
    paragraphs?: string[];
    type?: "standard" | "quote" | "alert" | "toc" | "signatures" | "rules" | "cover";
    badge?: string;
  }>;
  signatories?: Array<{
    title: string;
    name: string;
    signed: boolean;
    hasStamp?: boolean;
    stampText?: string;
  }>;
}

export interface JumuiyaMetadata {
  id: string;
  name: string;
  patron: string;
  motto: string;
  feastDay: string;
  color: string;
  verse: string;
  meetingDay: string;
  description: string;
  portraitUrl?: string;
  coverScan?: string;
  /** Slug prefix used to build scan image paths: /images/constitution/jumuiya/{slug}-page-N.jpg */
  scanSlug?: string;
  /** Path to the downloadable official PDF booklet */
  pdfUrl?: string;
}

export const jumuiyaList: JumuiyaMetadata[] = [
  {
    id: "st-augustine",
    name: "Saint Augustine",
    patron: "St. Augustine of Hippo",
    motto: "OUR HEARTS ARE RESTLESS UNTIL THEY FIND REST IN CHRIST",
    feastDay: "August 28",
    color: "#2563EB",
    verse: "You have made us for yourself, O Lord, and our hearts are restless until they rest in you.",
    meetingDay: "Thursdays 5:00 PM - 6:50 PM",
    description: "Grounded in deep theological contemplation, spiritual study, and vibrant communal fraternity.",
    coverScan: "/images/Augustine.png",
    portraitUrl: "/images/Augustine.png",
    scanSlug: "st-augustine",
    pdfUrl: "/documents/st-augustine-jumuiya-booklet.pdf",
  },
  {
    id: "st-anthony",
    name: "Saint Anthony of Padua",
    patron: "St. Anthony of Padua",
    motto: "THE SPIRIT OF HUMILITY IS SWEETER THAN HONEY",
    feastDay: "June 13",
    color: "#D97706",
    verse: "Actions speak louder than words; let your words teach and your actions speak.",
    meetingDay: "Sundays 2:00 PM - 4:00 PM",
    description: "Dedicated to fervent prayer, solidarity with the poor, and living the Gospel in humility.",
    coverScan: "/images/Anthony.png",
    portraitUrl: "/images/Anthony.png",
    scanSlug: "st-anthony",
    pdfUrl: "/documents/st-anthony-jumuiya-booklet.pdf",
  },
  {
    id: "st-catherine",
    name: "Saint Catherine of Siena",
    patron: "St. Catherine of Siena",
    motto: "BE WHO GOD MEANT YOU TO BE AND YOU WILL SET THE WORLD ON FIRE",
    feastDay: "April 29",
    color: "#DC2626",
    verse: "Start being brave about everything. Drive out darkness and spread light.",
    meetingDay: "Wednesdays 5:00 PM - 6:50 PM",
    description: "Characterized by burning love for Christ, intercessory prayer, and bold service in faith.",
    coverScan: "/images/Catherine.jpg",
    portraitUrl: "/images/Catherine.jpg",
    scanSlug: "st-catherine",
    pdfUrl: "/documents/st-catherine-jumuiya-booklet.pdf",
  },
  {
    id: "st-dominic",
    name: "Saint Dominic",
    patron: "St. Dominic",
    motto: "CONTEMPLARE ET CONTEMPLATA ALIIS TRADERE (VERITAS)",
    feastDay: "August 8",
    color: "#059669",
    verse: "Contemplate and share the fruits of contemplation with others.",
    meetingDay: "Sundays 3:00 PM - 5:00 PM",
    description: "Focused on preaching truth (Veritas), ardent Holy Rosary devotion, and fraternal solidarity.",
    coverScan: "/images/Dominic.png",
    portraitUrl: "/images/Dominic.png",
    scanSlug: "st-dominic",
    pdfUrl: "/documents/st-dominic-jumuiya-booklet.pdf",
  },
  {
    id: "st-elizabeth",
    name: "Saint Elizabeth of Hungary",
    patron: "St. Elizabeth of Hungary",
    motto: "SERVE CHRIST IN THE POOR AND SUFFERING",
    feastDay: "November 17",
    color: "#7C3AED",
    verse: "We must give gladly what we can, and love with our whole soul.",
    meetingDay: "Wednesdays 5:00 PM - 6:50 PM",
    description: "Emphasizing merciful outreach to the vulnerable, gentle hospitality, and sacrificial love.",
    coverScan: "/images/Elizabeth.png",
    portraitUrl: "/images/Elizabeth.png",
    scanSlug: "st-elizabeth",
    pdfUrl: "/documents/st-elizabeth-jumuiya-booklet.pdf",
  },
  {
    id: "st-maria-goretti",
    name: "Saint Maria Goretti",
    patron: "St. Maria Goretti",
    motto: "FORGIVENESS, PURITY, AND DEVOTION TO CHRIST",
    feastDay: "July 6",
    color: "#DB2777",
    verse: "He who fears the Lord does all things with uprightness of heart.",
    meetingDay: "Sundays 2:00 PM - 4:00 PM",
    description: "Inspiring youth purity, steadfast moral conviction, forgiveness, and Christ-like integrity.",
    coverScan: "/images/MariaGoretti.png",
    portraitUrl: "/images/MariaGoretti.png",
    scanSlug: "st-maria-goretti",
    pdfUrl: "/documents/st-maria-goretti-jumuiya-booklet.pdf",
  },
  {
    id: "st-monica",
    name: "Saint Monica",
    patron: "St. Monica",
    motto: "PERSEVERANCE IN PRAYER AND MATERNAL FAITH",
    feastDay: "August 27",
    color: "#0D9488",
    verse: "Nothing is far from God.",
    meetingDay: "Sundays 2:00 PM - 4:00 PM",
    description: "Exemplifying persevering prayer, maternal care, spiritual patience, and steadfast encouragement.",
    coverScan: "/images/Monica.png",
    portraitUrl: "/images/Monica.png",
    scanSlug: "st-monica",
    pdfUrl: "/documents/st-monica-jumuiya-booklet.pdf",
  },
];

export const jumuiyaBookletPages: JumuiyaPageContent[] = [
  {
    pageNumber: 1,
    title: "Cover Letter & Title Page",
    category: "Cover",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-1.jpg",
    sections: [
      {
        type: "cover",
        heading: "KIRINYAGA UNIVERSITY CATHOLIC STUDENTS' ASSOCIATION",
        subheading: "SMALL CHRISTIAN COMMUNITIES",
        paragraphs: [
          "BOOKLET",
          "OUR HEARTS ARE RESTLESS UNTIL THEY FIND REST IN CHRIST",
          "SAINT AUGUSTINE",
        ],
      },
    ],
  },
  {
    pageNumber: 2,
    title: "Acknowledgement",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-2.jpg",
    sections: [
      {
        heading: "ACKNOWLEDGEMENT",
        type: "standard",
        paragraphs: [
          "We give thanks to our Heavenly Father, who has guided us and given us strength in the process of writing this booklet.",
          "Our appreciation goes to the entire CSA office led by our chairperson, Mr. Oluta Johncollins, for their relentless efforts and assistance given to us during the entire processing of this booklet.",
          "We owe a special gratitude to our Organizing Secretary, Mr. Job Okumu and our Treasurer, Mr. John Maina, for their intellectual guidance during the writing of this book.",
          "We also thank the entire association together with the small Christian communities at large for being in support of this book.",
          "May God bless you all.",
        ],
      },
    ],
  },
  {
    pageNumber: 3,
    title: "Official Note & Custody",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-3.jpg",
    sections: [
      {
        heading: "NOTE",
        type: "alert",
        items: [
          "This booklet should be under the custody of the chairperson.",
          "No informal alteration on this booklet. In case of any changes the committee should inform the Jumuiya coordinators to organize for the amendments.",
          "Any changes to this booklet must be in line with the Catholic Student's Association constitution.",
        ],
      },
    ],
  },
  {
    pageNumber: 4,
    title: "Table of Contents",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-4.jpg",
    sections: [
      {
        heading: "Table of Contents",
        type: "toc",
        items: [
          "ACKNOWLEDGEMENT — Page 2",
          "NOTE — Page 3",
          "INTRODUCTION — Page 5",
          "i. MISSION, VISION, OBJECTIVES — Page 6",
          "ROLES AND RESPONSIBILITIES OF THE JUMUIYAS — Page 7",
          "ACTIVITIES — Page 8",
          "LEADERSHIP — Page 9",
          "i. Requirements — Page 9",
          "ii. Roles and responsibilities of leaders — Page 10",
          "ROLES OF JUMUIYA OFFICIALS — Page 11",
          "LITURGIST / ASS. LITURGIST — Page 12",
          "CSA CHAIRS & JUMUIYA ACTIVITIES — Page 13",
          "ELECTIONS — Page 14",
          "SIGNATURES — Page 15",
        ],
      },
    ],
  },
  {
    pageNumber: 5,
    title: "Introduction",
    category: "Introduction",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-5.jpg",
    sections: [
      {
        heading: "INTRODUCTION",
        type: "standard",
        paragraphs: [
          "❖ This booklet consists of guidelines to the Small Christian Communities on how to coordinate their activities and help the Catholic Students Association achieve its missions and visions.",
        ],
      },
    ],
  },
  {
    pageNumber: 6,
    title: "Mission, Vision & Objectives",
    category: "Identity",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-6.jpg",
    sections: [
      {
        heading: "1. MISSION, VISION, OBJECTIVES",
        subheading: "❖ MISSION",
        paragraphs: [
          "➤ Achieving greater heights spiritually in catholic faith through prayers as an instrument of hope to human.",
        ],
      },
      {
        subheading: "❖ VISION",
        paragraphs: [
          "➤ To produce spiritually and morally upright Christians who will spread the gospel throughout the world.",
        ],
      },
      {
        subheading: "❖ OBJECTIVES",
        items: [
          "To ensure social and spiritual growth to their members.",
          "To help the church reach out to its members.",
          "To help the church achieve its missions and visions.",
        ],
      },
    ],
  },
  {
    pageNumber: 7,
    title: "Roles and Responsibilities of the Jumuiyas",
    category: "Statutes",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-7.jpg",
    sections: [
      {
        heading: "ROLES AND RESPONSIBILITIES OF THE JUMUIYAS",
        type: "rules",
        items: [
          "Portray a good image of the Catholic Students Association.",
          "Register with the Catholic Students Association.",
          "Participate in all the activities organized by the Catholic Students Association.",
          "Safeguard the interests and the property of the Catholic Students Association.",
          "Promote and support the objectives of the Catholic Students Association.",
        ],
      },
    ],
  },
  {
    pageNumber: 8,
    title: "Activities & Guidelines",
    category: "Activities",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-8.jpg",
    sections: [
      {
        heading: "ACTIVITIES",
        paragraphs: [
          "❖ The Small Christian Communities should have their activities as they please provided they do not collide with the church activities. However these activities should be in line with the following guidelines:",
        ],
        items: [
          "The committee through the chairperson must inform the catholic student association chairperson of their outdoor activities at least one week prior to the activity.",
          "Where money is a requirement there should be an agreement between the committee of the small Christian community and its members on how to fund the activity.",
          "The committee should organize for inter-jumuiya activities to encourage social and spiritual growth across the church.",
        ],
      },
    ],
  },
  {
    pageNumber: 9,
    title: "Leadership Structure & Eligibility",
    category: "Governance",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-9.jpg",
    sections: [
      {
        heading: "LEADERSHIP",
        subheading: "(a) Requirements",
        paragraphs: [
          "➤ The Small Christian communities should have eight elected members:",
        ],
        items: [
          "1. Chairperson.",
          "2. Vice Chairperson.",
          "3. Secretary.",
          "4. Vice Secretary.",
          "5. Treasurer.",
          "6. Organizing Secretary.",
          "7. Liturgist.",
          "8. Assistance Liturgist.",
        ],
      },
      {
        subheading: "Eligibility Exclusions",
        paragraphs: [
          "➤ Members in their first years are not eligible for the following posts:",
        ],
        items: [
          "1. Chairperson",
          "2. Secretary",
          "3. Treasurer",
          "4. Organizing secretary",
        ],
      },
      {
        type: "alert",
        paragraphs: [
          "➤ Members in their final year are not eligible for any position but their participation and advices are of great help.",
        ],
      },
    ],
  },
  {
    pageNumber: 10,
    title: "Roles and Responsibilities of Jumuiya Leaders",
    category: "Governance",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-10.jpg",
    sections: [
      {
        heading: "ROLES AND RESPONSIBILITIES OF JUMUIYA LEADERS",
        type: "rules",
        items: [
          "The jumuiya chairperson should inform the Catholic Student's Association committee on sensitive issues that require their attention.",
          "To ensure there is unity among members.",
          "Planning for the jumuiya activities.",
          "To portray a good image of the jumuiya.",
          "Solving conflicts among its members.",
          "To inform the Catholic Student's Association committee on their general progress.",
          "Creating awareness and mobilizing their members on the church activities.",
          "Linking the members with the Catholic Student's Association office.",
        ],
      },
    ],
  },
  {
    pageNumber: 11,
    title: "Roles of Jumuiya Officials",
    category: "Executive",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-11.jpg",
    sections: [
      {
        heading: "ROLES OF JUMUIYA OFFICIALS",
        subheading: "CHAIRPERSON",
        items: [
          "To be the overall Jumuiya leader.",
          "To chair Jumuiya meetings.",
          "To chair Jumuiya officials meetings.",
          "To present Jumuiya interests to the CSA office through the Jumuiya coordinator.",
          "To oversee duties performed by the other Jumuiya officials.",
          "To pass information from the CSA office to the Jumuiya members.",
          "To link Jumuiya members and the Jumuiya associates.",
          "Should be aware of any Jumuiya expenditures.",
        ],
      },
      {
        subheading: "VICE CHAIRPERSON",
        items: [
          "To assume the roles of the chairperson in absentia leader but not expenditure related roles.",
          "To be in charge of the discipline of the Jumuiya members.",
          "To chair all the disciplinary meetings.",
        ],
      },
      {
        subheading: "ORGANIZING SECRETARY",
        items: [
          "To assume the roles of the vice chairperson in absentia of both vice chairperson and the chairperson.",
          "To organize meeting venues for Jumuiya meetings and Jumuiya officials meetings.",
          "To coordinate Jumuiya activities in partnership with the Jumuiya officials.",
          "To send daily reminders on daily CSA activities and Jumuiya activities.",
          "To write minutes in the secretary's absentia.",
        ],
      },
      {
        subheading: "TREASURER",
        items: [
          "To keep and manage Jumuiya funds.",
          "To update financial records.",
          "To prepare and present financial reports to the committee members.",
          "To present the financial report at the end of every spiritual year to the members.",
          "To inform the chairperson on every Jumuiya expenditure.",
        ],
      },
      {
        subheading: "SECRETARY / VICE SECRETARY",
        items: [
          "To write and read Jumuiya meetings minutes and officials meetings minutes.",
          "To help in the CSA registration (Receive cards from members and issue back after the process).",
          "To keep all the Jumuiya records.",
        ],
      },
    ],
  },
  {
    pageNumber: 12,
    title: "Liturgist & Assistant Liturgist",
    category: "Liturgy",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-12.jpg",
    sections: [
      {
        heading: "LITURGIST / ASS. LITURGIST",
        items: [
          "To issue prayer partners.",
          "To lead in the liturgical part of the Jumuiya meeting.",
          "To assign liturgical roles.",
          "To provide readings to the members when the Jumuiya is on duty.",
          "To be the custodian of Jumuiya sacramentals.",
        ],
      },
    ],
  },
  {
    pageNumber: 13,
    title: "CSA Chairs & Jumuiya Activities Guidelines",
    category: "Logistics",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-13.jpg",
    sections: [
      {
        heading: "CSA CHAIRS",
        items: [
          "Should be divided equally among the jumuiyas which need the seats on the same day.",
          "There is a Bailing fee of Ksh. 1,500, with Ksh. 1,000 refundable after return of the seats if in good condition after inspections by the jumuiya coordinators.",
          "Gate pass should be requested through the jumuiya coordinator one week before the activity.",
          "Latest time to return CSA chairs to the school premises is at 7:00 PM on the same day.",
        ],
      },
      {
        type: "alert",
        paragraphs: [
          "NB/ A JUMUIYA MUST TAKE CHAIRS FROM THE INSTITUTION AND RETURN THEM ON THE SAME DATE. NO EXCHANGE OF CHAIRS AFTER ACTIVITY.",
        ],
      },
      {
        heading: "JUMUIYA ACTIVITIES",
        items: [
          "No jumuiya should plan activities before CSA calendar is planned.",
          "All jumuiya activities / calendar should be submitted / forwarded to jumuiya coordinator immediately after planning.",
          "NO jumuiya activities should be planned on Saturdays (To give CSA and choir room to have their activities).",
          "ALL JUMUIYAS SHOULD DO THEIR ELECTIONS LATEST 1 WEEK AFTER CSA ELECTIONS.",
        ],
      },
    ],
  },
  {
    pageNumber: 14,
    title: "Elections Protocol",
    category: "Elections",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-14.jpg",
    sections: [
      {
        heading: "ELECTIONS",
        items: [
          "Elections should be conducted after the Catholic Student's Association elections.",
          "An elected member is allowed to serve for at most two terms.",
          "Elections should be done by balloting.",
        ],
      },
    ],
  },
  {
    pageNumber: 15,
    title: "Official Signatures & Seal",
    category: "Ratification",
    scanImageUrl: "/images/constitution/jumuiya/st-augustine-page-15.jpg",
    sections: [
      {
        heading: "SIGNATURES",
        type: "signatures",
        paragraphs: [
          "In witness whereof, the executive leadership and Small Christian Community coordinators of the Kirinyaga University Catholic Students' Association have signed and sealed this booklet.",
        ],
      },
    ],
    signatories: [
      {
        title: "Catholic Student's Association Chairperson",
        name: "John Collins Oluta",
        signed: true,
        hasStamp: true,
        stampText: "C.S.A CATHOLIC STUDENTS ASSOCIATION * DATE: 06 FEB 2022 * P.O. BOX 303 - 10300, KERUGOYA",
      },
      {
        title: "Jumuiya Coordinator",
        name: "Kelvin Kimani Githuku",
        signed: true,
      },
      {
        title: "Assistant Jumuiya Coordinator",
        name: "Patricia Achieng Obiero",
        signed: true,
      },
    ],
  },
];
