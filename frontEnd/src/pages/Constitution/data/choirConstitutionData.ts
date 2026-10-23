export interface ChoirPageContent {
  pageNumber: number; // 1 to 15
  title: string;
  category?: string;
  scanImageUrl?: string;
  headerImageUrl?: string;
  headerImageAlt?: string;
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

export interface ChoirConstitutionMeta {
  title: string;
  subtitle: string;
  association: string;
  choirName: string;
  patronSaint: string;
  datePromulgated: string;
  totalPages: number;
  pdfUrl: string;
  rehearsalSchedule: {
    tuesday: string;
    saturday: string;
    sundayWarmup: string;
  };
  executiveSignatories: Array<{
    name: string;
    position: string;
  }>;
}

export const choirConstitutionMeta: ChoirConstitutionMeta = {
  title: "The Constitution of St. Thomas Aquinas Choir",
  subtitle: "Kirinyaga University Catholic Students' Association Choir",
  association: "Kirinyaga University Catholic Students' Association (CSA)",
  choirName: "St. Thomas Aquinas Choir",
  patronSaint: "St. Thomas Aquinas & St. Cecilia",
  datePromulgated: "17th March 2022",
  totalPages: 15,
  pdfUrl: "/documents/choir-constitution.pdf",
  rehearsalSchedule: {
    tuesday: "Tuesdays 6:00 PM – 8:00 PM",
    saturday: "Saturdays 1:00 PM – 4:00 PM",
    sundayWarmup: "Sundays 7:05 AM (Pre-Mass Warmup)",
  },
  executiveSignatories: [
    { name: "Samuel Mwaura", position: "Chairperson" },
    { name: "Felistus Mueni", position: "Secretary" },
    { name: "Vincent Karanja", position: "Treasurer" },
  ],
};

export const choirConstitutionPages: ChoirPageContent[] = [
  {
    pageNumber: 1,
    title: "Front Cover",
    category: "Cover",
    scanImageUrl: "/images/constitution/choir/page-1.jpg",
    sections: [
      {
        type: "cover",
        heading: "KIRINYAGA UNIVERSITY ST. THOMAS AQUINAS CATHOLIC STUDENTS' ASSOCIATION CHOIR",
        subheading: "THE CONSTITUTION",
        paragraphs: [
          "KYU CSA — ST. THOMAS AQUINAS CHOIR",
          "“Sing to the Lord a new song; sing to the Lord, all the earth.” (Psalm 96:1)",
          "Promulgated & Ratified under the Sacred Statutes of Kirinyaga University Catholic Students' Association.",
        ],
      },
    ],
  },
  {
    pageNumber: 2,
    title: "Table of Contents (Part I)",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/choir/page-2.jpg",
    headerImageUrl: "/images/constitution/choir/toc-header.jpg",
    headerImageAlt: "Illustration from the original St. Thomas Aquinas Choir Constitution",
    sections: [
      {
        heading: "Table of Contents",
        subheading: "Chapters One Through Five",
        type: "toc",
        items: [
          "CHAPTER ONE: NAME, MISSION, VISION AND OBJECTIVES — Page 1",
          "• ARTICLE 1: Name — Page 1",
          "• ARTICLE 2: Mission and Vision — Page 1",
          "• ARTICLE 3: Objectives — Page 1",
          "    - Section I: Objectives Pedagogy — Page 1",
          "    - Section II: Methodology — Page 1",
          "CHAPTER TWO: MEMBERSHIP AND WITHDRAWALS FROM MEMBERSHIP — Page 2",
          "• ARTICLE 1: Membership and Withdrawal — Page 2",
          "CHAPTER THREE: FINANCE — Page 2",
          "• ARTICLE 1: Source of Funding — Page 2",
          "• ARTICLE 2: Account — Page 2",
          "    - Section 1: Account and Minimum Account Balance — Page 2",
          "CHAPTER FOUR: COMMITTEE MEMBERS — Page 3",
          "• ARTICLE 1: Elected Members — Page 3",
          "    - Section 1: Executive — Page 3",
          "    - Section 2: Members — Page 3",
          "• ARTICLE 2: Duties of Executive and Members — Page 3",
          "    - Section 1: Executive — Page 3",
          "    - Section 2: Duties of Committee Members — Page 4",
          "CHAPTER FIVE: ELECTION AND HANDING OVER — Page 6",
          "• ARTICLE 1: Elections to and Withdrawal from Office — Page 6",
          "• ARTICLE 2: Handing Over — Page 6",
        ],
      },
    ],
  },
  {
    pageNumber: 3,
    title: "Table of Contents (Part II)",
    category: "Preliminary",
    scanImageUrl: "/images/constitution/choir/page-3.jpg",
    sections: [
      {
        heading: "Table of Contents (Continued)",
        subheading: "Chapters Six Through Ten",
        type: "toc",
        items: [
          "CHAPTER SIX: PRACTICES, CODE OF CONDUCT AND CODE OF DRESSING — Page 7",
          "• ARTICLE 1: Practices — Page 7",
          "• ARTICLE 2: Code of Conduct — Page 8",
          "• ARTICLE 3: Code of Dressing — Page 9",
          "CHAPTER SEVEN: WELFARE — Page 10",
          "• Funeral Ceremonies and Family Bereavement Protocols — Page 10",
          "CHAPTER EIGHT: AMENDMENTS OF THE CONSTITUTION — Page 10",
          "• Constitutional Amendment Procedures — Page 10",
          "CHAPTER NINE: DISSOLUTION OF THE ASSOCIATION — Page 10",
          "• Conditions for Dissolution — Page 10",
          "CHAPTER TEN: APPROVAL — Page 11",
          "• Official Executive Assent and Signatures — Page 11",
        ],
      },
    ],
  },
  {
    pageNumber: 4,
    title: "Page 1: Name, Mission, Vision & Objectives",
    category: "Foundations",
    scanImageUrl: "/images/constitution/choir/page-4.jpg",
    sections: [
      {
        badge: "Chapter One",
        heading: "NAME, MISSION, VISION AND OBJECTIVES",
        type: "standard",
      },
      {
        subheading: "ARTICLE 1: NAME",
        type: "quote",
        paragraphs: [
          "This is a group under Kirinyaga University Catholic Church fraternity and therefore named as ST. THOMAS AQUINAS CHOIR.",
        ],
      },
      {
        subheading: "ARTICLE 2: MISSION AND VISION",
        type: "alert",
        paragraphs: [
          "MISSION: Achieving greater heights spiritually in catholic faith through prayer and singing as an instrument of hope to human.",
          "VISION: To enhance spiritual maturity among students in a bid to help them spread the gospel throughout the world.",
        ],
      },
      {
        subheading: "ARTICLE 3: OBJECTIVES",
        heading: "Section I: Objectives Pedagogy",
        type: "standard",
        items: [
          "1. To promote unity amongst the church members by coming together for a single purpose.",
          "2. To nurture the Christian faith and experience in one's commitment and try to communicate this faith to the congregation milieu by bearing witness to Jesus Christ through singing.",
          "3. To create a joyous environment, which helps members to integrate their efforts to serve Christ.",
          "4. To foster spiritual growth and development to strengthen catholic faith.",
        ],
      },
      {
        heading: "Section II: Methodology",
        subheading: "Strategic Avenues of Ministry",
        type: "rules",
        paragraphs: [
          "Under the above objectives, St. Thomas Aquinas choir will try to:",
        ],
        items: [
          "1. Participate in activities organized by the Catholic Church in Kenya.",
          "2. Join the entire congregation during prayers and portray a good example to the church members.",
          "3. Communicate effectively with other church choirs to reflect on joint action with a view of meeting objectives which are common for all.",
          "4. Promote guidelines for action to be carried out by members in solidarity with the church.",
          "5. Sing during mass with an aim of spreading the gospel.",
        ],
      },
    ],
  },
  {
    pageNumber: 5,
    title: "Page 2: Membership & Finance",
    category: "Governance & Finance",
    scanImageUrl: "/images/constitution/choir/page-5.jpg",
    sections: [
      {
        badge: "Chapter Two",
        heading: "MEMBERSHIP AND WITHDRAWALS FROM MEMBERSHIP",
        type: "standard",
      },
      {
        subheading: "ARTICLE 1: MEMBERSHIP AND WITHDRAWAL",
        type: "rules",
        items: [
          "1. St. Thomas Aquinas choir members will be drawn from the church members or congregation.",
          "2. One becomes a member on payment of a membership fee of Ksh. 20 and renewal fee of Ksh. 20 for every semester though liable to changes from time to time. This amount is non-refundable.",
          "3. Members should be of the same objectives and goals as stipulated in this constitution.",
          "4. Any choir member who defaults registration requirements will: (a) Not be recognized as a legitimate member; (b) Not be entitled to any benefits from the choir account.",
          "5. New members will be given a probation period of Two (2) months upon joining the choir.",
        ],
      },
      {
        badge: "Chapter Three",
        heading: "FINANCE",
        subheading: "ARTICLE 1: SOURCE OF FUNDING",
        type: "standard",
        items: [
          "1. Registration and renewal fee by members.",
          "2. Fund raising through Harambee.",
          "3. Donations by well-wishers.",
          "4. Project income.",
        ],
      },
      {
        subheading: "ARTICLE 2: ACCOUNT",
        heading: "SECTION 1: ACCOUNT AND MINIMUM ACCOUNT BALANCE",
        type: "alert",
        paragraphs: [
          "St. Thomas Aquinas choir has NO independent bank account, thus operates under Kirinyaga University Catholic Students' Association (CSA) bank account, maintaining independent books of account.",
          "This section provides that there should be a clear description of how finances have been spent against the due dates.",
          "The minimum amount set for the account of the movement is maintained at Ksh. 2,000.",
        ],
      },
    ],
  },
  {
    pageNumber: 6,
    title: "Page 3: Committee Members & Executive Duties",
    category: "Leadership",
    scanImageUrl: "/images/constitution/choir/page-6.jpg",
    sections: [
      {
        badge: "Chapter Four",
        heading: "COMMITTEE MEMBERS",
        subheading: "ARTICLE 1: ELECTED MEMBERS",
        type: "standard",
      },
      {
        heading: "SECTION 1. EXECUTIVE",
        type: "standard",
        paragraphs: [
          "These will be termed as the executive and they include:",
        ],
        items: [
          "• Chairperson",
          "• Vice chairperson",
          "• Secretary",
          "• Assistant secretary",
          "• Treasurer",
        ],
      },
      {
        heading: "SECTION 2: MEMBERS",
        type: "standard",
        paragraphs: [
          "These will be termed as members of the committee and they include:",
        ],
        items: [
          "• Choir master/mistress and their assistants",
          "• Instrument keepers",
          "• Gender representatives",
          "• Project manager",
          "• Patron",
        ],
      },
      {
        heading: "NB: Special Committee Provisions",
        type: "alert",
        items: [
          "1. Patron will not be elected. The Parish Priest will automatically be the Patron.",
          "2. There will be a sub-committee known as the Discipline Advisory Committee.",
        ],
      },
      {
        subheading: "ARTICLE 2: DUTIES OF EXECUTIVE AND MEMBERS",
        heading: "SECTION 1: EXECUTIVE — a) Chairperson",
        type: "rules",
        items: [
          "1. Chairs all the group meetings both executive and general.",
          "2. Together with members, he/she should strive to come up with new ideas to build and improve the organization.",
        ],
      },
    ],
  },
  {
    pageNumber: 7,
    title: "Page 4: Executive Duties & Choir Master",
    category: "Leadership Duties",
    scanImageUrl: "/images/constitution/choir/page-7.jpg",
    sections: [
      {
        heading: "Executive Officers' Duties (Continued)",
        type: "standard",
      },
      {
        subheading: "a) Chairperson (Continued)",
        type: "rules",
        items: [
          "3. Presenting the interest of the choir to the church committee / congregation.",
          "4. Will assign duties to members.",
        ],
      },
      {
        subheading: "b) Vice Chairperson",
        type: "rules",
        items: [
          "1. Will assist the chairperson in his/her duties and any other duties as may be assigned.",
          "2. Assuming the roles of chairperson in his/her absentia.",
          "3. Presenting the interest of the choir to the church committee.",
          "4. Ensuring implementation of rules made or agreed upon.",
          "5. He/she chairs all disciplinary committee meetings.",
        ],
      },
      {
        subheading: "c) Secretary",
        type: "rules",
        items: [
          "1. Will keep records of all choir assets and deal with all correspondence.",
          "2. Issuing notices and agenda of all executive and general meetings.",
          "3. Taking minutes during executive and general meetings.",
          "4. Will take roll calls.",
          "5. Will prepare a report before the end of the year elaborating various activities carried out during the year, challenges faced and general status of the office.",
          "6. He/she is the custodian of the group's constitution.",
        ],
      },
      {
        subheading: "d) Assistant Secretary",
        type: "rules",
        items: [
          "1. He/she will assist the secretary in the above stipulated duties.",
          "2. Assumes all roles of the secretary in absentia.",
        ],
      },
      {
        subheading: "e) Treasurer",
        type: "rules",
        items: [
          "1. Will keep the accounting records of St. Thomas Aquinas choir.",
          "2. Will give full financial statements of the choir at the end of the semester or on request by the members.",
          "3. Will prepare budget proposal for choir activities.",
          "4. Will conduct payments and receipts with approval from the executive committee.",
          "5. Will be responsible for any mismanagement of choir funds.",
        ],
      },
      {
        heading: "SECTION 2: DUTIES OF COMMITTEE MEMBERS",
        subheading: "i. Choir Master / Mistress",
        type: "standard",
        items: [
          "1. Will conduct the choir practices and lead the choir during mass.",
          "2. Will prepare the program of songs liturgically.",
        ],
      },
    ],
  },
  {
    pageNumber: 8,
    title: "Page 5: Committee Roles & Disciplinary Committee",
    category: "Committee Roles",
    scanImageUrl: "/images/constitution/choir/page-8.jpg",
    sections: [
      {
        heading: "Duties of Committee Members (Continued)",
        type: "standard",
      },
      {
        subheading: "i. Choir Master / Mistress (Continued)",
        type: "rules",
        items: [
          "3. Will co-ordinate with the priest in order to make the choir aware of the songs to be sung during mass or liturgical occasions.",
          "4. Will liaise with those in charge of all music festivals.",
          "5. Will be the choir representative to all music meetings.",
        ],
      },
      {
        subheading: "ii. Assistant Choir Master / Mistress",
        type: "rules",
        items: [
          "1. Will assist the choir master/mistress in all his/her duties.",
          "2. He/she will be the timekeeper in choir.",
          "3. Assume all the roles of choir master/mistress in absentia.",
        ],
      },
      {
        subheading: "iii. Instruments Keeper",
        type: "rules",
        items: [
          "1. Will keep the instruments and ensure good care of Kayambas, drums, hymn books and any other church choir instruments.",
          "2. Will avail instruments during choir practices and mass in time.",
          "3. Will give reports on the condition of the instruments to the committee on a regular basis.",
        ],
      },
      {
        subheading: "iv. Gender Representatives",
        type: "rules",
        items: [
          "1. Solving minor differences arising from the particular gender.",
          "2. Forwarding to the committee any voice problems or grievances which may need more attention.",
        ],
      },
      {
        subheading: "v. Project Manager",
        type: "rules",
        items: [
          "1. He/she will be in charge of choir projects.",
          "2. Giving reports on projects and assigning duties to members in respect to choir projects.",
        ],
      },
      {
        subheading: "vi. The Patron",
        type: "alert",
        items: [
          "1. He will advise the choir, give guidelines and be the symbol of solidarity.",
          "2. The patron will be contacted and made aware of any plans of action.",
        ],
      },
      {
        subheading: "vii. Disciplinary Advisory Committee",
        type: "standard",
        paragraphs: [
          "The committee will consist of:",
        ],
        items: [
          "a) Vice chairperson",
          "b) Chairperson",
          "c) Choir master",
        ],
      },
    ],
  },
  {
    pageNumber: 9,
    title: "Page 6: Elections & Handing Over",
    category: "Elections & Transitions",
    scanImageUrl: "/images/constitution/choir/page-9.jpg",
    sections: [
      {
        heading: "Disciplinary Advisory Committee (Continued)",
        type: "standard",
        items: [
          "d) Voice representatives",
          "e) Two (2) ordinary choir members",
        ],
        paragraphs: [
          "They will be responsible for ensuring that the code of conduct is adhered to, as stipulated in this constitution.",
          "NB: The committee must give equal attention to the matters affecting any members of the choir.",
        ],
      },
      {
        badge: "Chapter Five",
        heading: "ELECTION AND HANDING OVER",
        subheading: "ARTICLE 1: ELECTIONS TO AND WITHDRAWAL FROM OFFICE",
        type: "rules",
        items: [
          "1. On completion of the term of office i.e., 1 year, the officials decide and announce a date of elections and all seats are declared vacant. The elections are held democratically. This is done at the beginning of the 2nd semester of every academic year.",
          "2. The Chairperson, the Secretary, and the Project Manager positions shall not be filled by members who are in their first and last academic year.",
          "3. The position of Treasurer is not eligible to members who are in their last academic year EXCEPT when there are no active registered members who can take up the role, hence third years may be considered eligible for the position.",
          "4. Members will suggest nominees for various posts; if a nominee agrees to contest, whether present or absent, members will vote by show of hands. The returning officers will count the votes and announce the winners. Elections of each post are done in returns. No open campaign will be carried out.",
          "5. If complaints are raised by members or contestants and genuine irregularities are noted, the elections of that particular post will be nullified and fresh elections held.",
          "6. Only members are entitled to vote and hold positions in office or any other committee position.",
          "7. Members have the right to call for elections whenever they feel necessary even before the end of the year/term, but it must be approved by three-quarters (3/4) of the members.",
          "8. Resignation by an official must be accompanied with a valid reason on why to do so.",
          "9. Failure to attend four consecutive official meetings without an apology warrants withdrawal from office.",
          "10. Using the position that one holds for personal interest is strictly prohibited.",
        ],
      },
      {
        subheading: "ARTICLE 2: HANDING OVER",
        type: "alert",
        paragraphs: [
          "The former officials hold a joint meeting with the newly elected officials to enable the handing over of the books and any other property they were holding that belongs to the choir.",
          "Handing over is supposed to be done during the first meeting after election.",
        ],
      },
    ],
  },
  {
    pageNumber: 10,
    title: "Page 7: Practices & Rehearsal Guidelines",
    category: "Rehearsals & Practices",
    scanImageUrl: "/images/constitution/choir/page-10.jpg",
    sections: [
      {
        badge: "Chapter Six",
        heading: "PRACTICES, CODE OF CONDUCT AND CODE OF DRESSING",
        subheading: "ARTICLE 1: PRACTICES",
        type: "standard",
      },
      {
        subheading: "Practice Schedule & Time Management",
        type: "alert",
        items: [
          "1. The choir practices will be held on Tuesdays from 6:00 PM to 8:00 PM and on Saturdays from 1:00 PM to 4:00 PM. Other days of practice will be fixed within the next week when need arises.",
          "2. During practice sessions, the choir will practice for mass, learn new songs, and prepare for other occasions.",
          "3. All choir rehearsals for the respective days (i.e. Tuesdays and Saturdays) should end 5 minutes before the scheduled end time allocations.",
        ],
      },
      {
        subheading: "Rehearsal Structure & Warm-ups",
        type: "rules",
        items: [
          "4. The 1st one hour will strictly be used for common songs rehearsals and mass program preparations/warm ups.",
        ],
        paragraphs: [
          "NB: Voice separations will be determined by the turn up quorum and when the need to give attention to an occasion arises, voice separation won't hold.",
        ],
      },
      {
        subheading: "Voice Part Separation & Recombination",
        type: "rules",
        items: [
          "5. The choir parts/voices should [if they have to separate] separate for a maximum of 1 ½ hrs.",
          "   i. Each song should take a maximum of 30 minutes [per voice] i.e. simple, short liturgical songs with short sentence structures.",
          "   NOTE: Complex, meditating/reflective/educative/occasional and other related songs should not hold to this rule.",
          "   ii. The voices should recombine and perfect the newly trained songs for 30 minutes [maximum].",
          "   NOTE: Trainers shall choose who to conduct the joint training in accordance to their allocations [only one trainer at a time].",
          "6. Each trainer [regardless of whether you are training that piece or not] should have copies of the songs to be trained before the practice time.",
        ],
      },
    ],
  },
  {
    pageNumber: 11,
    title: "Page 8: Song Preparation & Trainer Protocol",
    category: "Rehearsals & Etiquette",
    scanImageUrl: "/images/constitution/choir/page-11.jpg",
    sections: [
      {
        heading: "Rehearsal Protocol & Trainer Discipline (Continued)",
        type: "rules",
        items: [
          "7. New songs to be trained will be sent 3 or 4 days prior to the practice day in the trainers group.",
          "8. Ignorance and common-sense mistakes which may also be associated with music notations, solfege will force a trainer to go for a 'rehearsal break'. i.e., No training the next rehearsal — [whole week break in that case].",
        ],
        paragraphs: [
          "NOTE: The rule applies heavily to anyone who encounters such difficulties and never seeks for assistance.",
        ],
      },
      {
        subheading: "Etiquette Among Trainers",
        type: "alert",
        items: [
          "9. For any trainer who is not training at that moment, they should join others in their respective voices and get trained with others.",
        ],
        paragraphs: [
          "NOTE: No pitching, no correcting of the trainer as he/she is training unless they call for assistance. [OPT FOR A SIDE MEETING WITH THE TRAINER FOR HUMBLE CORRECTION AND GENEROUS ACCEPTANCE].",
          "10. Any trainer found intimidating, condemning, isolating or discussing substandard issues with members/public will be summoned and forced for a break too.",
        ],
      },
      {
        subheading: "Liturgical Directors & Accompaniment",
        type: "standard",
        items: [
          "11. Every mass should have at least two directors and a maximum of three for an equal chance.",
          "12. Where piano accompaniment is required/used, a minimum of two pianists should be allocated programs and be prepared in advance.",
        ],
        paragraphs: [
          "NOTE: At most two songs [new] should be taught in a single practice session though this is subject to changes.",
        ],
      },
      {
        heading: "ARTICLE 2: CODE OF CONDUCT",
        type: "rules",
        items: [
          "1. Any member attending practice must be sober.",
          "2. All members will be required to attend practice frequently and in case of commitments seek permission from the choir master/mistress or send a message to choir members.",
        ],
      },
    ],
  },
  {
    pageNumber: 12,
    title: "Page 9: Code of Conduct & Dressing",
    category: "Discipline & Decorum",
    scanImageUrl: "/images/constitution/choir/page-12.jpg",
    sections: [
      {
        heading: "Code of Conduct (Continued)",
        type: "standard",
        items: [
          "3. Members will be kindly required to strive to know each other and grow in love as a family.",
          "4. The group will not be liable to members or individuals out of its jurisdiction.",
          "5. All members will be required to uphold high standards of discipline and responsibility.",
        ],
      },
      {
        subheading: "Strict Rehearsal Room Regulations",
        type: "alert",
        paragraphs: [
          "Under this code, the following is strictly prohibited/regulated in the practice room:",
        ],
        items: [
          "a) Chewing gums.",
          "b) Walking out without permission from choir master.",
          "c) Unnecessary movements.",
          "d) Reading articles.",
          "e) Unnecessary communication.",
          "f) Contradicting choir master/mistress on liturgical songs.",
          "g) All phones will be on silent mode or vibration during choir practice.",
        ],
      },
      {
        subheading: "Sunday Mass & Attendance Protocols",
        type: "rules",
        items: [
          "6. Members who fail to attend Sunday morning practice session at 7:05 AM unless stated otherwise will not join the rest during mass, though they may avail themselves after mass for practice if any.",
          "7. Ladies and gentlemen will alternate to arrange seats in the practice room.",
          "8. Any decision toward suspension/expulsion of a member will come from the committee.",
          "9. Members who need to leave for the day or briefly must strictly seek permission from the choir master.",
          "10. Members who fail to attend four (4) consecutive practices will be warned three times after which they will cease to be choir members.",
          "11. Only registered members and those who adhere to the above regulations will be recognized as choir members.",
          "12. Two (2) months' absenteeism from choir without prior apology will lead to disqualification from the choir. To rejoin the choir the member will apply through the committee.",
        ],
      },
      {
        subheading: "ARTICLE 3: CODE OF DRESSING",
        type: "standard",
        paragraphs: [
          "Uniforms will be worn on the 3rd Sunday and any member who doesn't wear the approved uniform will not be allowed to join the choir members in the church during mass but can join them later after mass.",
        ],
        items: [
          "a) All choir members will dress decently whenever they are in the precincts of the church to reflect a dignified presentation.",
          "b) Choir members will be in uniform whenever attending liturgical ceremonies or any other ceremonies as may be advised.",
          "c) Ladies will never wear miniskirts or revealing clothes on Sunday's worship and men will be smartly dressed, no sagging is allowed.",
        ],
      },
    ],
  },
  {
    pageNumber: 13,
    title: "Page 10: Welfare, Amendments & Dissolution",
    category: "Welfare & Governance",
    scanImageUrl: "/images/constitution/choir/page-13.jpg",
    sections: [
      {
        badge: "Chapter Seven",
        heading: "WELFARE",
        subheading: "Funeral Ceremonies & Bereavement Protocols",
        type: "standard",
        items: [
          "a) All choir members will attend the burial ceremony of a deceased choir member at their own transport cost.",
          "b) The bereaved family will be comforted with at least Ksh. 2,000.00.",
          "c) Every member will be required to contribute towards the above.",
          "d) Should a choir member lose a relative within immediate family: (i) A child; (ii) A parent; (iii) Wife/Husband; (iv) Brother/Sister — the choir will rally in solidarity.",
        ],
      },
      {
        badge: "Chapter Eight",
        heading: "AMENDMENTS OF THE CONSTITUTION",
        type: "rules",
        items: [
          "1. Any member of the choir can propose amendments to the constitution and a special committee will review the proposal and report to members who can either approve or reject the amendments by voting.",
          "2. Amendments will sail through with an approval vote of three-quarters (3/4) of total members.",
        ],
      },
      {
        badge: "Chapter Nine",
        heading: "DISSOLUTION OF THE ASSOCIATION",
        type: "alert",
        paragraphs: [
          "Dissolution of St. Thomas Aquinas choir can only be effective under two conditions namely:",
        ],
        items: [
          "i. The Kirinyaga University Catholic Students' Association decision not to have the group.",
          "ii. Non-existence of Kirinyaga University Catholic Students' Association.",
        ],
      },
    ],
  },
  {
    pageNumber: 14,
    title: "Page 11: Approval & Signatures",
    category: "Approval & Assent",
    scanImageUrl: "/images/constitution/choir/page-14.jpg",
    sections: [
      {
        badge: "Chapter Ten",
        heading: "APPROVAL",
        type: "standard",
        paragraphs: [
          "THESE TERMS AND CONDITIONS HAVE BEEN DISCUSSED AND APPROVED BY ALL MEMBERS IN THE COMMITTEE MEETING OF THE GROUP HELD ON 17/3/2022 BY PUTTING THEIR SIGNATURES ASSENT.",
        ],
      },
      {
        type: "signatures",
        heading: "Executive Committee Assent",
        subheading: "Ratified and Promulgated on 17th March 2022",
      },
    ],
    signatories: [
      {
        title: "CHAIRPERSON",
        name: "SAMUEL MWAURA",
        signed: true,
      },
      {
        title: "SECRETARY",
        name: "FELISTUS MUENI",
        signed: true,
      },
      {
        title: "TREASURER",
        name: "VINCENT KARANJA",
        signed: true,
      },
    ],
  },
  {
    pageNumber: 15,
    title: "Back Cover",
    category: "Cover",
    scanImageUrl: "/images/constitution/choir/page-15.jpg",
    sections: [
      {
        type: "cover",
        heading: "ST. THOMAS AQUINAS CHOIR",
        subheading: "KIRINYAGA UNIVERSITY CATHOLIC STUDENTS' ASSOCIATION",
        paragraphs: [
          "“Bis orat qui bene cantat” — He who sings well prays twice. (St. Augustine)",
          "KyU CSA St. Thomas Aquinas Choir Constitution Booklet.",
          "Certified and preserved in the official archives of Kirinyaga University CSA.",
        ],
      },
    ],
  },
];
