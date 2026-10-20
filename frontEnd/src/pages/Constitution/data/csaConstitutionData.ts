export interface ConstitutionSection {
  heading?: string;
  subheading?: string;
  paragraphs?: string[];
  bullets?: string[];
  numberedList?: { num: string; text: string }[];
}

export interface ConstitutionPageContent {
  pageNumber: number;
  title: string;
  chapter?: string;
  scannedImageUrl?: string;
  sections: ConstitutionSection[];
}

export interface ConstitutionSignatory {
  name: string;
  position: string;
}

export interface ConstitutionMetadata {
  title: string;
  association: string;
  promulgationDate: string;
  stampDetails: {
    authority: string;
    date: string;
    postalAddress: string;
    verified: boolean;
  };
  totalPages: number;
  signatories: ConstitutionSignatory[];
  description: string;
}

export const csaConstitutionMeta: ConstitutionMetadata = {
  title: "Constitution of Kirinyaga University Catholic Students' Association",
  association: "Kirinyaga University Catholic Students' Association (C.S.A)",
  promulgationDate: "06 February 2022",
  stampDetails: {
    authority: "K.Y.U. Catholic Students Association",
    date: "06 FEB 2022",
    postalAddress: "P.O. Box 143-10300, Kerugoya",
    verified: true,
  },
  totalPages: 22,
  signatories: [
    { name: "OLUTA JOHNCOLLINS", position: "CHAIRPERSON" },
    { name: "FIDELIS NYAMAI", position: "SECRETARY" },
    { name: "OKUMU JOB", position: "ORGANISING SECRETARY" },
  ],
  description:
    "The official constitution and governing statutes of Kirinyaga University Catholic Students' Association (C.S.A), approved by the Dean of Students and promulgated under the seal of the association.",
};

// Exact Table of Contents matching the physical document
export const tableOfContents = [
  { page: 0, title: "Cover Page & Official Seal", chapter: "Front Matter" },
  { page: 1, title: "Table of Contents (Part 1)", chapter: "Index" },
  { page: 2, title: "Table of Contents (Part 2)", chapter: "Index" },
  { page: 3, title: "Article 1: Name • Article 2: Brief History • Article 3: Vision & Mission", chapter: "General Provisions" },
  { page: 4, title: "Article 4: Objectives • Article 5: Membership (Registration & Rights)", chapter: "Membership" },
  { page: 5, title: "Article 5: Responsibility & Certificates • Article 6: Finance (Sources & Minimum Balance)", chapter: "Membership & Finance" },
  { page: 6, title: "Article 6: Lending & Needy Kit • Article 7: Officials and Office", chapter: "Finance & Leadership" },
  { page: 7, title: "Article 7: Officials (Cont.), Terms of Office & Requirements", chapter: "Leadership" },
  { page: 8, title: "Article 8: Duties of Officials (Chairperson & Vice-Chairperson)", chapter: "Duties of Officials" },
  { page: 9, title: "Article 8: Duties of Officials (Secretary, Vice Secretary & Treasurer)", chapter: "Duties of Officials" },
  { page: 10, title: "Article 8: Duties of Officials (Organising Secretary, Choir Chair & Equipment Mgr)", chapter: "Duties of Officials" },
  { page: 11, title: "Article 8: Duties of Officials (Liturgist, Dancing Group & Project Manager)", chapter: "Duties of Officials" },
  { page: 12, title: "Article 8: Duties of Officials (Rosary, Bible Study, SCC & Pamphlet)", chapter: "Duties of Officials" },
  { page: 13, title: "Article 9: Office Vacancies (Withdrawals & Replacement Procedures)", chapter: "Vacancies" },
  { page: 14, title: "Article 10: Meetings (Time, Venue, Quorum & Rules)", chapter: "Assemblies" },
  { page: 15, title: "Article 10: Procedure & Conduct at Meetings, Other Meetings", chapter: "Assemblies" },
  { page: 16, title: "Article 10: Disciplinary Action • Article 11: Committee (Elected & Standing)", chapter: "Committees" },
  { page: 17, title: "Article 12: Activities of CSA (Daily & General Church Activities)", chapter: "Activities" },
  { page: 18, title: "Article 12: Patronal Feast & Party • Article 13: SCCs (7 Jumuiyas)", chapter: "Activities & Jumuiya" },
  { page: 19, title: "Article 13: Small Christian Communities (Objectives & 8 Leadership Posts)", chapter: "Jumuiya" },
  { page: 20, title: "Article 14: Election & Article 15: Handing Over", chapter: "Elections & Transitions" },
  { page: 21, title: "Article 16: Amendments", chapter: "Amendments" },
  { page: 22, title: "Official Promulgation, Signatures & Stamp", chapter: "Enactment & Seal" },
];

/**
 * All 22 Pages of the Constitution.
 * 100% complete and fully verified from authentic physical document pages.
 */
export const initialCsaPages: ConstitutionPageContent[] = [
  // Page 1: Table of Contents - Part 1
  {
    pageNumber: 1,
    title: "Table of Contents (Part 1)",
    chapter: "Official Document Index",
    scannedImageUrl: "/images/constitution/page-1.jpg",
    sections: [
      {
        heading: "Table of Contents",
        paragraphs: [
          "Official directory of Articles and Sections contained within the Kirinyaga University Catholic Students' Association Constitution.",
        ],
        numberedList: [
          { num: "ARTICLE 1", text: "NAME — Page 3" },
          { num: "ARTICLE 2", text: "BRIEF HISTORY — Page 3" },
          { num: "ARTICLE 3", text: "VISION AND MISSION (Section i: Vision, Section ii: Mission) — Page 3" },
          { num: "ARTICLE 4", text: "OBJECTIVES — Page 4" },
          { num: "ARTICLE 5", text: "MEMBERSHIP (Section i: Registration, Section ii: Rights of Members) — Page 4" },
          { num: "ARTICLE 5", text: "MEMBERSHIP (Section iii: Responsibility, Section iv: Certificates) — Page 5" },
          { num: "ARTICLE 6", text: "FINANCE (Section i: Sources) — Page 5" },
          { num: "ARTICLE 6", text: "FINANCE (Section ii: Minimum Amount in Account, Section iii: Lending) — Page 6" },
          { num: "ARTICLE 7", text: "OFFICIALS AND OFFICE (Section i: Elected and Appointed Officials) — Page 6" },
        ],
      },
    ],
  },

  // Page 2: Table of Contents - Part 2
  {
    pageNumber: 2,
    title: "Table of Contents (Part 2)",
    chapter: "Official Document Index",
    scannedImageUrl: "/images/constitution/page-2.jpg",
    sections: [
      {
        heading: "Table of Contents (Continued)",
        numberedList: [
          { num: "ARTICLE 7", text: "OFFICIALS AND OFFICE (Section ii: Terms of Office, Section iii: Requirements of Officials) — Page 7" },
          { num: "ARTICLE 8", text: "DUTIES OF OFFICIALS — Page 8" },
          { num: "ARTICLE 9", text: "OFFICE VACANCIES (Section i: Withdrawals from Office, Section ii: Replacement Procedures) — Page 13" },
          { num: "ARTICLE 10", text: "MEETINGS (Section i: Time and Venue, Section ii: Quorum, Section iii: Rules of Meetings) — Page 14" },
          { num: "ARTICLE 10", text: "MEETINGS (Section iv: Procedure and Conduct at Meetings, Section v: Other Meetings) — Page 15" },
          { num: "ARTICLE 11", text: "COMMITTEE (Section i: Elected Officials, Section ii: Standing Committee) — Page 16" },
          { num: "ARTICLE 12", text: "ACTIVITIES OF CATHOLIC STUDENT ASSOCIATION (Section 1: Daily Activities, Section 2: General Church Activities) — Page 17" },
          { num: "ARTICLE 13", text: "SMALL CHRISTIAN COMMUNITIES (S.C.C) (Section 1: Names) — Page 18" },
          { num: "ARTICLE 13", text: "SMALL CHRISTIAN COMMUNITIES (S.C.C) (Section 2: Objectives, Section 3: Leadership) — Page 19" },
          { num: "ARTICLE 14", text: "ELECTION — Page 20" },
          { num: "ARTICLE 15", text: "HANDING OVER — Page 20" },
          { num: "ARTICLE 16", text: "AMENDMENTS — Page 21" },
        ],
      },
    ],
  },

  // Page 3: Articles 1, 2, 3
  {
    pageNumber: 3,
    title: "Article 1: Name • Article 2: History • Article 3: Vision & Mission",
    chapter: "General Provisions",
    scannedImageUrl: "/images/constitution/page-3.jpg",
    sections: [
      {
        heading: "ARTICLE 1: NAME",
        numberedList: [
          {
            num: "1",
            text: "The official name of this movement is Kirinyaga University Catholic Students Association.",
          },
          {
            num: "2",
            text: "This movement will use the name or its acronym, C.S.A in all publicity materials and correspondence.",
          },
        ],
      },
      {
        heading: "ARTICLE 2: BRIEF HISTORY",
        paragraphs: [
          "It was founded by Kirinyaga Technical Institute students as Catholic Action (CA) and amended to be Catholic Students Association (C.S.A) by members of the movement and its existence is approved by the Dean of Students.",
        ],
      },
      {
        heading: "ARTICLE 3: VISION AND MISSION",
        subheading: "SECTION i: VISION",
        paragraphs: [
          "To produce spiritually and morally upright Christians who will spread the gospel throughout the world.",
        ],
      },
      {
        subheading: "SECTION ii: MISSION",
        paragraphs: [
          "Achieving greater heights spiritually in catholic faith through prayers as an instrument of hope to humans.",
        ],
      },
    ],
  },

  // Page 4: Article 4, Article 5 (Sections i, ii)
  {
    pageNumber: 4,
    title: "Article 4: Objectives • Article 5: Membership",
    chapter: "Aims & Membership",
    scannedImageUrl: "/images/constitution/page-4.jpg",
    sections: [
      {
        heading: "ARTICLE 4: OBJECTIVES",
        numberedList: [
          { num: "1", text: "To foster spiritual growth and development." },
          { num: "2", text: "To strengthen and enforce the catholic faith." },
          { num: "3", text: "To expose members to religious practices and social beliefs." },
          { num: "4", text: "To encourage religious principles and practices." },
          { num: "5", text: "To demonstrate through teaching and example the duty and privilege of every Christian." },
          { num: "6", text: "To provide an avenue to members for active participation in the spreading of the gospel." },
        ],
      },
      {
        heading: "ARTICLE 5: MEMBERSHIP",
        subheading: "SECTION i: REGISTRATION",
        numberedList: [
          {
            num: "1",
            text: "Registration of new members shall be done at an amount of ksh.100 each, after which a member is issued a Membership Card.",
          },
          {
            num: "2",
            text: "Renewal of registration shall be done at the beginning of each semester at a fee of Ksh.50.",
          },
        ],
      },
      {
        subheading: "SECTION ii: RIGHTS OF MEMBERS",
        paragraphs: ["Every member should have the right to:"],
        numberedList: [
          { num: "1", text: "Vote." },
          { num: "2", text: "Be voted into office." },
          { num: "3", text: "Access the constitution." },
          { num: "4 (a)", text: "Be informed about matters of the C.S.A." },
          { num: "4 (b)", text: "Air views about C.S.A." },
          { num: "5", text: "Be informed about the financial status of the C.S.A at the end of every academic semester." },
        ],
      },
    ],
  },

  // Page 5: Article 5 (Sections iii, iv) • Article 6: Finance
  {
    pageNumber: 5,
    title: "Article 5: Responsibilities & Certificates • Article 6: Finance",
    chapter: "Responsibilities, Awards & Finances",
    scannedImageUrl: "/images/constitution/page-5.jpg",
    sections: [
      {
        heading: "ARTICLE 5: MEMBERSHIP (Continued)",
        subheading: "SECTION iii: RESPONSIBILITY",
        paragraphs: ["Every member has the duty and responsibility to:"],
        numberedList: [
          { num: "6", text: "Portray a good image of C.S.A." },
          { num: "7", text: "Register with the C.S.A." },
          { num: "8", text: "Participate in all the activities organized by the C.S.A." },
          { num: "9", text: "Safeguard the interests and the property of the C.S.A." },
          { num: "10", text: "Promote and support the objectives of the C.S.A." },
          { num: "11", text: "Join a small Christian community." },
        ],
      },
      {
        subheading: "SECTION iv: CERTIFICATES",
        numberedList: [
          {
            num: "1",
            text: "Members of the C.S.A are to be issued with certificates at the end of their final year.",
          },
          {
            num: "2",
            text: "The C.S.A, CHOIR, and JUMUIYA officials shall be issued certificates of appreciation at the end of their term of service.",
          },
        ],
      },
      {
        heading: "ARTICLE 6: FINANCE",
        subheading: "SECTION i: SOURCES",
        paragraphs: ["The C.S.A shall source its finances from:"],
        numberedList: [
          { num: "1", text: "Members' registration." },
          { num: "2", text: "Fundraisings, donations, gifts, and grants." },
          { num: "3", text: "Income-generating projects will be determined from time to time." },
        ],
      },
      {
        subheading: "SECTION ii: MINIMUM AMOUNT IN ACCOUNT",
        paragraphs: [
          "The minimum amount set for the account of the movement has to be maintained at sh.20,000.",
        ],
      },
    ],
  },

  // Page 6: Article 6 (Section iii, iv) • Article 7 (Section i: Elected and Appointed Officials 1-11)
  {
    pageNumber: 6,
    title: "Article 6: Lending & Needy Kit • Article 7: Officials and Office",
    chapter: "Finance & Leadership",
    scannedImageUrl: "/images/constitution/page-6.jpg",
    sections: [
      {
        heading: "ARTICLE 6: FINANCE (Continued)",
        subheading: "SECTION iii: LENDING",
        numberedList: [
          {
            num: "1",
            text: "The funds of the C.S.A shall only be used for the activities of the movement as approved by the committee.",
          },
          {
            num: "2",
            text: "The cash belonging to C.S.A should not be lent.",
          },
        ],
      },
      {
        subheading: "SECTION iv: NEEDY KIT",
        paragraphs: [
          "Members within the C.S.A may be given financial assistance from the needy kit if deemed necessary and such assistance shall depend on the need.",
          "Such a member in need of assistance shall meet a committee that will approve or deny the request.",
        ],
      },
      {
        heading: "ARTICLE 7: OFFICIALS AND OFFICE",
        subheading: "SECTION i: ELECTED AND APPOINTED OFFICIALS",
        numberedList: [
          { num: "1", text: "Chairperson" },
          { num: "2", text: "Vice-chairperson" },
          { num: "3", text: "Secretary" },
          { num: "4", text: "Vice secretary" },
          { num: "5", text: "Treasurer" },
          { num: "6", text: "Organizing secretary" },
          { num: "7", text: "Choir chairperson" },
          { num: "8", text: "Choir vice-chairperson" },
          { num: "9", text: "Equipment manager" },
          { num: "10", text: "Assistant equipment manager" },
          { num: "11", text: "Liturgical coordinator" },
        ],
      },
    ],
  },

  // Page 7: Article 7 (Section i: Cont. 12-24, Section ii: Terms of Office, Section iii: Requirements)
  {
    pageNumber: 7,
    title: "Article 7: Officials (Cont.), Terms of Office & Requirements",
    chapter: "Leadership & Qualifications",
    scannedImageUrl: "/images/constitution/page-7.jpg",
    sections: [
      {
        heading: "ARTICLE 7: OFFICIALS AND OFFICE (Continued)",
        subheading: "SECTION i: ELECTED AND APPOINTED OFFICIALS (Continued)",
        numberedList: [
          { num: "12", text: "Assistant liturgical coordinator" },
          { num: "13", text: "Dancing coordinator" },
          { num: "14", text: "Assistant dancing coordinator" },
          { num: "15", text: "Project manager" },
          { num: "16", text: "Assistant project manager" },
          { num: "17", text: "Rosary coordinator" },
          { num: "18", text: "Assistant rosary coordinator" },
          { num: "19", text: "Bible study coordinator" },
          { num: "20", text: "Assistant bible study coordinator" },
          { num: "21", text: "Small Christian community coordinator" },
          { num: "22", text: "Assistant small Christian community coordinator" },
          { num: "23", text: "Pamphlet manager" },
          { num: "24", text: "Assistant pamphlet manager" },
        ],
      },
      {
        subheading: "SECTION ii: TERMS OF OFFICE",
        numberedList: [
          {
            num: "1",
            text: "An elected member is allowed to serve for utmost 2(TWO) terms.",
          },
        ],
      },
      {
        subheading: "SECTION iii: REQUIREMENTS OF OFFICIALS",
        paragraphs: ["As an official one is required to:"],
        numberedList: [
          { num: "1", text: "Attend meetings." },
          { num: "2", text: "Safeguard the movement's resources." },
          { num: "3", text: "Participate in church activities." },
          { num: "4", text: "Be a good role model." },
        ],
      },
    ],
  },

  // Page 8: Article 8 (1. Chairperson, 2. Vice-Chairperson)
  {
    pageNumber: 8,
    title: "Article 8: Duties of Officials (Chairperson & Vice-Chairperson)",
    chapter: "Duties of Officials",
    scannedImageUrl: "/images/constitution/page-8.jpg",
    sections: [
      {
        heading: "ARTICLE 8: DUTIES OF OFFICIALS",
        subheading: "1. CHAIRPERSON",
        numberedList: [
          { num: "1", text: "Chairing the meeting." },
          { num: "2", text: "Attending external seminars and meetings." },
          { num: "3", text: "Receiving and acting upon complaints and suggestions." },
          { num: "4", text: "Present proposals to the relevant authority." },
          { num: "5", text: "Signing the minutes of the previous meeting." },
          { num: "6", text: "Is one of the bank signatories." },
          { num: "7", text: "Resolving conflicts both individual and those of groups." },
          { num: "8", text: "Informing the members and current issues of the church." },
        ],
      },
      {
        subheading: "2. VICE-CHAIRPERSON",
        numberedList: [
          { num: "1", text: "Assume the chairperson role in absentia EXCEPT being a bank signatory." },
          { num: "2", text: "Discipline members." },
          { num: "3", text: "Ensuring implementation of rules made and agreed upon." },
        ],
      },
    ],
  },

  // Page 9: Article 8 (3. Secretary, 3. Vice Secretary, 4. Treasurer)
  {
    pageNumber: 9,
    title: "Article 8: Duties of Officials (Secretary, Vice Secretary & Treasurer)",
    chapter: "Duties of Officials",
    scannedImageUrl: "/images/constitution/page-9.jpg",
    sections: [
      {
        heading: "ARTICLE 8: DUTIES OF OFFICIALS (Continued)",
        subheading: "3. SECRETARY",
        numberedList: [
          { num: "1", text: "Keeping duplicate records of finance in line with the treasurer." },
          { num: "2", text: "Making announcements." },
          { num: "3", text: "Is one of the bank signatories." },
          { num: "4", text: "Writing clear and understandable minutes." },
          { num: "5", text: "Should liaise with the chairperson before actually meeting to make arrangements on the agenda." },
          { num: "6", text: "Keeping all records related to CSA." },
        ],
      },
      {
        subheading: "3. VICE SECRETARY",
        numberedList: [
          { num: "1", text: "Assume the role of secretary in absentia EXCEPT being a signatory." },
        ],
      },
      {
        subheading: "4. TREASURER",
        numberedList: [
          { num: "1", text: "Announcing financial reports, recording any financial transaction and keeping the records." },
          { num: "2", text: "Is one of the bank signatories." },
          { num: "3", text: "Making a transparent financial statement." },
          { num: "4", text: "Counting and recording collections reports." },
        ],
      },
    ],
  },

  // Page 10: Article 8 (5. Organising Secretary, 6. Choir Chairperson, 7. Equipment Manager)
  {
    pageNumber: 10,
    title: "Article 8: Duties of Officials (Organising Secretary, Choir & Equipment)",
    chapter: "Duties of Officials",
    scannedImageUrl: "/images/constitution/page-10.jpg",
    sections: [
      {
        heading: "ARTICLE 8: DUTIES OF OFFICIALS (Continued)",
        subheading: "5. ORGANISING SECRETARY",
        numberedList: [
          { num: "1", text: "Writing minutes when both secretary and vice secretary are absent." },
          { num: "2", text: "Assume the role of chairperson and vice-chairperson in absentia EXCEPT being a bank signatory." },
          { num: "3", text: "Organizing venue for meetings." },
          { num: "4", text: "Together with the chairperson should liaise with the patron with the activities happening." },
          { num: "5", text: "Oversees the projects alongside the project manager." },
          { num: "6", text: "Making external announcements." },
          { num: "7", text: "With the assistance of the chairperson should organize the venue for holding mass/service." },
        ],
      },
      {
        subheading: "6. CHOIR CHAIRPERSON",
        numberedList: [
          { num: "1", text: "Representing the choir department in the church committee." },
          { num: "2", text: "Updating the choir members on issues relating to them." },
        ],
      },
      {
        subheading: "7. EQUIPMENT MANAGER",
        numberedList: [
          { num: "1", text: "Checking the condition of the instrument before and after issuing and giving a report to the church committee." },
          { num: "2", text: "Making sure that instruments are in good condition." },
          { num: "3", text: "Availing the equipment in time during CSA functions and when hired." },
        ],
      },
    ],
  },

  // Page 11: Article 8 (8. Liturgist, 9. Head of Dancing, 10. Vice Dancing, 11. Project Manager)
  {
    pageNumber: 11,
    title: "Article 8: Duties of Officials (Liturgist, Dancing & Project Manager)",
    chapter: "Duties of Officials",
    scannedImageUrl: "/images/constitution/page-11.jpg",
    sections: [
      {
        heading: "ARTICLE 8: DUTIES OF OFFICIALS (Continued)",
        subheading: "8. LITURGIST",
        numberedList: [
          { num: "1", text: "Preparing the altar." },
          { num: "2", text: "Ensuring that liturgical calendar is followed." },
          { num: "3", text: "Assigning readings." },
          { num: "4", text: "Making the church members conversant with any change in the responses during mass and services." },
          { num: "5", text: "Ensuring that the liturgical clothes are clean." },
          { num: "6", text: "Organize for catechism classes." },
        ],
      },
      {
        subheading: "9. HEAD OF DANCING GROUP",
        numberedList: [
          { num: "1", text: "Representing the dancing group in the church committee." },
          { num: "2", text: "Organizing for dancing practice." },
          { num: "3", text: "Coordinating the dancers." },
        ],
      },
      {
        subheading: "10. VICE OF THE DANCING GROUP",
        numberedList: [
          { num: "1", text: "Assisting the head in coordinating the group." },
          { num: "2", text: "Performing the role of head in absentia." },
        ],
      },
      {
        subheading: "11. PROJECT MANAGER / ASSISTANT PROJECT MANAGER",
        numberedList: [
          { num: "1", text: "Overseeing the CSA income-generating projects." },
          { num: "2", text: "Giving reports on the progress on the projects to the church committee." },
          { num: "3", text: "Delegating duty to any other member on a specific project." },
        ],
      },
    ],
  },

  // Page 12: Article 8 (12. Rosary, 13. Bible Study, 14. SCC, 15. Pamphlet)
  {
    pageNumber: 12,
    title: "Article 8: Duties of Officials (Rosary, Bible Study, SCC & Pamphlet)",
    chapter: "Duties of Officials",
    scannedImageUrl: "/images/constitution/page-12.jpg",
    sections: [
      {
        heading: "ARTICLE 8: DUTIES OF OFFICIALS (Continued)",
        subheading: "12. ROSARY COORDINATOR AND ASSISTANT ROSARY COORDINATOR",
        numberedList: [
          { num: "1", text: "Coordinating rosary sessions." },
          { num: "2", text: "In charge of rosaries and prayer books." },
          { num: "3", text: "Organizing the venue for prayers." },
        ],
      },
      {
        subheading: "13. BIBLE STUDY COORDINATOR / ASSISTANT BIBLE STUDY COORDINATOR",
        numberedList: [
          { num: "1", text: "Coordinating bible study sessions." },
          { num: "2", text: "In charge of Bible and guide books." },
          { num: "3", text: "Organizing the venue for Bible study." },
        ],
      },
      {
        subheading: "14. SMALL CHRISTIAN COMMUNITY (SCC) COORDINATOR AND ASSISTANT",
        numberedList: [
          { num: "1", text: "Keeping and updating SCC records." },
          { num: "2", text: "Allocating new members to their respective jumuiya." },
          { num: "3", text: "Communicating to SCC chairpersons." },
          { num: "4", text: "Organizing inter_jumuiya activities." },
        ],
      },
      {
        subheading: "15. PAMPHLET MANAGER / ASSISTANT",
        numberedList: [
          { num: "1", text: "Type the readings and produce the pamphlets on time." },
          { num: "2", text: "Present the pamphlets to the jumuiya on duty on time." },
          { num: "3", text: "Oversee the sale of pamphlets." },
        ],
      },
    ],
  },

  // Page 13: Article 9: Office Vacancies (Section i & Section ii)
  {
    pageNumber: 13,
    title: "Article 9: Office Vacancies (Withdrawals & Replacements)",
    chapter: "Governance & Vacancies",
    scannedImageUrl: "/images/constitution/page-13.jpg",
    sections: [
      {
        heading: "ARTICLE 9: OFFICE VACANCIES",
        subheading: "SECTION i: WITHDRAWALS FROM OFFICE",
        numberedList: [
          {
            num: "1",
            text: "Vote of no confidence by more than 75% of the church committee when:\n  I. Using the position for personal interest\n  II. One fails to undertake their duties fully.",
          },
          {
            num: "2",
            text: "Resignation by the official with a valid reason on why to do so in formal writing.",
          },
          {
            num: "3",
            text: "Failure to attend three consecutive meetings without an apology.",
          },
          {
            num: "4",
            text: "Discontinuation from the University.",
          },
        ],
      },
      {
        subheading: "SECTION ii: REPLACEMENT PROCEDURES",
        numberedList: [
          {
            num: "1",
            text: "The rest of the officials are charged with the duty of nominating a member to fill the vacancy.",
          },
          {
            num: "2",
            text: "In case nomination fails, a by-election is conducted to fill the vacancy.",
          },
        ],
      },
    ],
  },

  // Page 14: Article 10: Meetings (Section i, ii, iii)
  {
    pageNumber: 14,
    title: "Article 10: Meetings (Time, Venue, Quorum & Rules)",
    chapter: "Assemblies & Meetings",
    scannedImageUrl: "/images/constitution/page-14.jpg",
    sections: [
      {
        heading: "ARTICLE 10: MEETINGS",
        subheading: "SECTION i: TIME AND VENUE",
        paragraphs: [
          "The time and venue of meetings are communicated to officials by the Organizing Secretary in consultancy with the chairperson and the secretary.",
        ],
      },
      {
        subheading: "SECTION ii: QUORUM",
        paragraphs: [
          "A minimum of two-thirds of officials should be present for the meeting to commence.",
        ],
      },
      {
        subheading: "SECTION iii: RULES OF MEETINGS",
        numberedList: [
          { num: "1", text: "No unnecessary movements." },
          { num: "2", text: "No use of phones. Phones should be in silent or vibration mode." },
          { num: "3", text: "No unnecessary communication." },
          { num: "4", text: "No direct attacks on colleagues." },
          { num: "5", text: "Committee members should actively participate in the meetings." },
        ],
      },
    ],
  },

  // Page 15: Article 10: Meetings (Section iv, Section v)
  {
    pageNumber: 15,
    title: "Article 10: Meetings (Procedure, Conduct & Other Meetings)",
    chapter: "Assemblies & Meetings",
    scannedImageUrl: "/images/constitution/page-15.jpg",
    sections: [
      {
        heading: "ARTICLE 10: MEETINGS (Continued)",
        subheading: "SECTION IV: PROCEDURE AND CONDUCT AT MEETINGS",
        numberedList: [
          {
            num: "i",
            text: "The chairperson shall call the meetings to order and lead the members systematically through the items of the agenda.",
          },
          {
            num: "ii",
            text: "Minutes of the previous meetings shall be confirmed after reading and shall be signed by the chairperson and the secretary.",
          },
          {
            num: "iii",
            text: "Any matter arising from the minutes shall be received and reports given.",
          },
          {
            num: "iv",
            text: "The chairperson shall use his discretion to limit the time and number of speakers on any debate.",
          },
          {
            num: "v",
            text: "Any matters shall be discussed with the permission of the chairperson.",
          },
          {
            num: "vi",
            text: "The chairperson shall close or adjourn the meetings as appropriate.",
          },
        ],
      },
      {
        subheading: "SECTION V: OTHER MEETINGS",
        paragraphs: [
          "In case of urgent issues, the chairperson can call for an impromptu meeting.",
          "In case of urgent issues, the chairperson can call an executive meeting.",
        ],
      },
    ],
  },

  // Page 16: Article 10 (Section vi: Absence and Disciplinary Action) • Article 11: Committee
  {
    pageNumber: 16,
    title: "Article 10: Disciplinary Action • Article 11: Committee",
    chapter: "Committees & Discipline",
    scannedImageUrl: "/images/constitution/page-16.jpg",
    sections: [
      {
        heading: "ARTICLE 10: MEETINGS (Continued)",
        subheading: "SECTION VI: ABSENCE AND DISCIPLINARY ACTION",
        paragraphs: [
          "An official who is absent for 3(three) consecutive meetings without an apology will be summoned by the disciplinary committee and impeached if he/she lacks valid reasons.",
          "An official who sends five consecutive apologies will have special seating with the vice-chairperson to make a follow-up.",
        ],
      },
      {
        heading: "ARTICLE 11: COMMITTEE",
        subheading: "SECTION i: ELECTED OFFICIALS",
        paragraphs: ["All elected officials shall form a church committee."],
      },
      {
        subheading: "SECTION ii: STANDING COMMITTEE",
        numberedList: [
          {
            num: "1",
            text: "Small Christian community committee which is headed by the head of small Christian community.",
          },
          {
            num: "2",
            text: "Constitutional committee comprising of at least 6 members for amendment purposes.",
          },
          {
            num: "3",
            text: "Disciplinary committee comprising of the vice-chairperson and 3 other members.",
          },
          {
            num: "4",
            text: "Needy kit committee comprising of the chairperson, the treasurer, and 3 other members.",
          },
          {
            num: "5",
            text: "Games captain committee headed by small Christian community coordinators.",
          },
        ],
      },
    ],
  },

  // Page 17: Article 12: Activities of Catholic Student Association
  {
    pageNumber: 17,
    title: "Article 12: Activities of Catholic Student Association",
    chapter: "Association Activities",
    scannedImageUrl: "/images/constitution/page-17.jpg",
    sections: [
      {
        heading: "ARTICLE 12: ACTIVITIES OF CATHOLIC STUDENT ASSOCIATION",
        subheading: "SECTION 1: DAILY ACTIVITIES",
        paragraphs: ["The CSA daily activities shall be as follows:"],
        numberedList: [
          { num: "1", text: "Monday from 7:30 pm to 8:00 pm: there shall be a Rosary session." },
          { num: "2", text: "Tuesday from 6:00 pm to 8:00 pm: there shall be Choir practice." },
          { num: "3", text: "Wednesday from 7:00 pm to 8:30 pm: there shall be a Bible study session." },
          { num: "4", text: "Thursday from 7:30 pm to 8:00 pm: there shall be a Rosary session." },
          { num: "5", text: "Friday from 7:00 pm to 8:30 pm: there shall be Mass/Service." },
          { num: "6", text: "Saturday from 1:00 pm to 4:00 pm: there shall be Choir practice." },
        ],
      },
      {
        subheading: "SECTION 2: GENERAL CHURCH ACTIVITIES",
        numberedList: [
          {
            num: "1",
            text: "RETREAT / SEMINAR: There should be either a retreat or a seminar each semester.",
          },
          {
            num: "2",
            text: "CHARITY WORK: There should be charity work each semester.",
          },
          {
            num: "3",
            text: "TRIP: There may be a trip in a semester.",
          },
          {
            num: "4",
            text: "FAREWELL PARTY: There shall be a farewell party at the end of every academic year for the final year students.",
          },
        ],
      },
    ],
  },

  // Page 18: Article 12 (Cont.) • Article 13: Small Christian Communities (S.C.C)
  {
    pageNumber: 18,
    title: "Article 12: Feast & Parties • Article 13: SCCs (7 Jumuiyas)",
    chapter: "General Activities & Jumuiyas",
    scannedImageUrl: "/images/constitution/page-18.jpg",
    sections: [
      {
        heading: "ARTICLE 12: ACTIVITIES (Continued)",
        subheading: "SECTION 2: GENERAL CHURCH ACTIVITIES (Continued)",
        numberedList: [
          {
            num: "5",
            text: "FEAST OF ST. THOMAS AQUINAS: On 28th January each year, there shall be a feast to celebrate our patron saint, Thomas Aquinas.",
          },
          {
            num: "6",
            text: "WELCOMING PARTY: There shall be First years welcoming party at the start of every academic year.",
          },
          {
            num: "7",
            text: "SPORTS / FUNDAY: There may be sports or Funday.",
          },
        ],
      },
      {
        heading: "ARTICLE 13: SMALL CHRISTIAN COMMUNITIES (S.C.C)",
        subheading: "SECTION 1: NAMES",
        paragraphs: ["There are 7 Small Christian Communities:"],
        numberedList: [
          { num: "I", text: "St. Antony" },
          { num: "II", text: "St. Augustine" },
          { num: "III", text: "St. Catherine" },
          { num: "IV", text: "St. Dominic" },
          { num: "V", text: "St. Elizabeth" },
          { num: "VI", text: "St. Maria Goretti" },
          { num: "VII", text: "St. Monica" },
        ],
      },
    ],
  },

  // Page 19: Article 13: Small Christian Communities (Objectives & Leadership)
  {
    pageNumber: 19,
    title: "Article 13: Small Christian Communities (Objectives & Leadership)",
    chapter: "Small Christian Communities",
    scannedImageUrl: "/images/constitution/page-19.jpg",
    sections: [
      {
        heading: "ARTICLE 13: SMALL CHRISTIAN COMMUNITIES (Continued)",
        subheading: "SECTION 2: OBJECTIVES",
        numberedList: [
          { num: "1", text: "To ensure social and spiritual growth of the members." },
          { num: "2", text: "Help the Church reach out to its members to achieve its mission and Vision." },
        ],
      },
      {
        subheading: "SECTION 3: LEADERSHIP",
        paragraphs: ["1. There shall be 8 elected officials in each SCC:"],
        numberedList: [
          { num: "I", text: "Chairperson" },
          { num: "II", text: "Vice-chairperson" },
          { num: "III", text: "Treasurer" },
          { num: "IV", text: "Org. secretary" },
          { num: "V", text: "Secretary" },
          { num: "VI", text: "Vice secretary" },
          { num: "VII", text: "Liturgist" },
          { num: "VIII", text: "Assistant Liturgist" },
        ],
      },
      {
        subheading: "ELIGIBILITY RESTRICTIONS",
        paragraphs: ["2. CSA members in their first year are not eligible for the following positions:"],
        numberedList: [
          { num: "i", text: "Chairperson" },
          { num: "ii", text: "Treasurer" },
          { num: "iii", text: "Organizing secretary" },
          { num: "iv", text: "Secretary" },
        ],
      },
    ],
  },

  // Page 20: Article 13 (Cont.) • Article 14: Election • Article 15: Handing Over
  {
    pageNumber: 20,
    title: "Article 14: Election • Article 15: Handing Over",
    chapter: "Elections & Transitions",
    scannedImageUrl: "/images/constitution/page-20.jpg",
    sections: [
      {
        heading: "ARTICLE 13: LEADERSHIP & ELECTIONS (Continued)",
        numberedList: [
          { num: "3", text: "Elections shall be conducted through balloting." },
          { num: "4", text: "SCC elections shall be conducted after the CSA elections." },
          { num: "5", text: "Members of CSA in the Fourth year are not eligible but their advice and participation shall be of great help." },
        ],
      },
      {
        heading: "ARTICLE 14: ELECTION",
        numberedList: [
          {
            num: "I",
            text: "Members of the Catholic Student Association in the 1st academic year are not eligible for executive positions.",
          },
          {
            num: "II",
            text: "The election committee to oversee the election will be formed by the outgoing officials who will not be vying.",
          },
          {
            num: "III",
            text: "Members of the Catholic Student Association in the Final year shall not be eligible for elections but their participation and advice shall be of great help.",
          },
        ],
      },
      {
        heading: "ARTICLE 15: HANDING OVER",
        numberedList: [
          {
            num: "I",
            text: "The former officials and the newly elected officials hold a joint meeting organized by the former officials, at a minimum time of one week after the election.",
          },
          {
            num: "II",
            text: "The outgoing officials are required to hand over any property belonging to the Catholic Student Association in their possession.",
          },
        ],
      },
    ],
  },

  // Page 21: Article 16: Amendments
  {
    pageNumber: 21,
    title: "Article 16: Amendments",
    chapter: "Constitutional Amendments",
    scannedImageUrl: "/images/constitution/page-21.jpg",
    sections: [
      {
        heading: "ARTICLE 16: AMENDMENTS",
        numberedList: [
          {
            num: "i",
            text: "Any member of the C.S.A. can move a motion of amendment to any section of this constitution or the entire constitution provided that he/she shall do so in writing to the C.S.A. Secretary who shall then notify the council of this intention.",
          },
          {
            num: "ii",
            text: "Any amendment of this constitution shall require two-thirds (2/3) majority support of the total C.S.A. council.",
          },
          {
            num: "iii",
            text: "Upon receiving this intention, the executive shall constitute a committee to look into the necessity of this amendment. The committee shall make recommendations to the council. The council shall communicate the recommendations to the C.S.A. membership. The council shall publish the amended constitution.",
          },
          {
            num: "iv",
            text: "This constitution shall be subject to review after every three years(3). However, amendments may be made from time to time as dictated by circumstances as provided in part ii.",
          },
        ],
      },
    ],
  },

  // Page 22: Promulgation, Signatures & Official Stamp
  {
    pageNumber: 22,
    title: "Official Promulgation, Signatures & Stamp",
    chapter: "Enactment & Certification",
    scannedImageUrl: "/images/constitution/page-22.jpg",
    sections: [
      {
        heading: "PROMULGATION & SIGNING",
        paragraphs: [
          "This Constitution of the Kirinyaga University Catholic Students' Association was duly enacted, adopted, and signed into supreme law by the authorized executive officers of the association on this 6th day of February, 2022.",
        ],
      },
      {
        heading: "Signed by:",
        numberedList: [
          {
            num: "1",
            text: "OLUTA JOHNCOLLINS — CHAIRPERSON [Signed ✍️]",
          },
          {
            num: "2",
            text: "FIDELIS NYAMAI — SECRETARY [Signed ✍️]",
          },
          {
            num: "3",
            text: "OKUMU JOB — ORGANISING SECRETARY [Signed ✍️]",
          },
        ],
      },
    ],
  },
];
