export interface CoordinatorPageContent {
  pageNumber: number;
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

export const coordinatorConstitutionPages: CoordinatorPageContent[] = [
  {
    pageNumber: 1,
    title: "Cover & Title Page",
    category: "Cover",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-1.jpg",
    sections: [
      {
        type: "cover",
        heading: "KIRINYAGA UNIVERSITY CATHOLIC STUDENTS' ASSOCIATION",
        subheading: "SMALL CHRISTIAN COMMUNITIES",
        paragraphs: [
          "BOOKLET",
          "BETTER TO ILLUMINATE THAN MERELY TO SHINE, TO DELIVER TO OTHERS CONTEMPLATED TRUTHS THAN MERELY TO CONTEMPLATE",
          "“ST THOMAS AQUINAS”",
          "JUMUIA COORDINATORS",
        ],
      },
    ],
  },
  {
    pageNumber: 2,
    title: "Acknowledgement",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-2.jpg",
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
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-3.jpg",
    sections: [
      {
        heading: "NOTE",
        type: "alert",
        items: [
          "This booklet should be under the custody of the chairperson.",
          "No informal alteration on this booklet. In case of any changes the committee should inform the Jumuiya coordinators to organize for the ammendments.",
          "Any changes to this booklet must be in line with the Catholic Student's Association constitution.",
        ],
      },
    ],
  },
  {
    pageNumber: 4,
    title: "Table of Contents",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-4.jpg",
    sections: [
      {
        heading: "Table of Contents",
        type: "toc",
        items: [
          "ACKNOWLEDGEMENT — Page 2",
          "NOTE — Page 3",
          "INTRODUCTION — Page 5",
          "i. MISSION, VISION, OBJECTIVES — Page 6",
          "ROLES AND RENSPOSIBILITIES — Page 7",
          "ACTIVITIES — Page 8",
          "LEADERSHIP — Page 9",
          "i. Requirements — Page 9",
          "ii. Roles and responsibilities of leaders — Page 10",
          "ELECTIONS — Page 11",
          "SIGNATURES — Page 12",
        ],
      },
    ],
  },
  {
    pageNumber: 5,
    title: "Introduction",
    category: "Introduction",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-5.jpg",
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
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-6.jpg",
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
          "To help the church reach out to it members.",
          "To help the church achieve its missions and visions.",
        ],
      },
    ],
  },
  {
    pageNumber: 7,
    title: "Roles and Responsibilities of the Jumuiyas",
    category: "Statutes",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-7.jpg",
    sections: [
      {
        heading: "ROLES AND RESPONSIBILITIES OF THE JUMUIYAS",
        type: "rules",
        items: [
          "1. Portray a good image of the Catholic Students Association.",
          "2. Register with the Catholic Students Association.",
          "3. Participate in all the activities organized by the Catholic Students Association.",
          "4. Safeguard the interests and the property of the Catholic Students Association.",
          "5. Promote and support the objectives of the Catholic Students Association.",
        ],
      },
    ],
  },
  {
    pageNumber: 8,
    title: "Activities & Directives",
    category: "Activities",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-8.jpg",
    sections: [
      {
        heading: "ACTIVITIES",
        paragraphs: [
          "❖ The Small Christian Communities should have their activities as they please provided they do not collide with the church activities. However these activities should be in line with the following guidelines:",
        ],
        items: [
          "1. The committee through the chairperson must inform the catholic student association chairperson of their outdoor activities at least one week prior to the activity.",
          "2. Where money is a requirement there should be an agreement between the committee of the small Christian community and it’s members on how to fund the activity.",
          "3. The committee should organize for inter-jumuiya activities to encourage social and spiritual growth across the church.",
        ],
      },
    ],
  },
  {
    pageNumber: 9,
    title: "Leadership & Requirements",
    category: "Governance",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-9.jpg",
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
          "8. Assistance Liturgist",
        ],
      },
      {
        subheading: "Eligibility Exclusions",
        paragraphs: [
          "➤ Members in their first years are not eligible for the following posts :",
        ],
        items: [
          "1. Chairman",
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
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-10.jpg",
    sections: [
      {
        heading: "ROLES AND RESPONSIBILITIES OF JUMUIYA LEADERS",
        type: "rules",
        items: [
          "1. The jumuiya chairperson should inform the Catholic Student’s Association committee on sensitive issues that require their attention.",
          "2. To ensure there is unity among members.",
          "3. Planning for the jumuiya activities.",
          "4. To portray a good image of the jumuiya.",
          "5. Solving conflicts among it’s members.",
          "6. To inform the Catholic Student’s Association committee on their general progress.",
          "7. Creating awareness and mobilizing their members on the church activities.",
          "8. Linking the members with the Catholic Student’s Association office.",
        ],
      },
    ],
  },
  {
    pageNumber: 11,
    title: "Elections Protocol",
    category: "Elections",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-11.jpg",
    sections: [
      {
        heading: "ELECTIONS",
        type: "standard",
        items: [
          "Elections should be conducted after the Catholic Student’s Association elections.",
          "An elected member is allowed to serve for at most two terms.",
          "Elections should be done by balloting.",
        ],
      },
    ],
  },
  {
    pageNumber: 12,
    title: "Official Signatures & Ratification",
    category: "Ratification",
    scanImageUrl: "/images/constitution/coordinators/coordinators-page-12.jpg",
    sections: [
      {
        heading: "SIGNATURES",
        type: "signatures",
        paragraphs: [
          "In witness whereof, the executive leadership and Small Christian Community coordinators of the Kirinyaga University Catholic Students' Association have signed and promulgated this official booklet.",
        ],
      },
    ],
    signatories: [
      {
        title: "Catholic Student's Association Chairperson",
        name: "John Collins Oluta",
        signed: true,
        hasStamp: true,
        stampText: "K.Y.U. CATHOLIC STUDENTS ASSOCIATION * DATE: 06 FEB 2022 * P.O. BOX 143 - 10300, KERUGOYA",
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
