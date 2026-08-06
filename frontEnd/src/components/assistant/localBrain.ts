import type { JumuiyaFact, SaintFact } from "./siteKnowledge";

export type AssistantLink = { label: string; href: string };
export type LocalAnswer = { text: string; links?: AssistantLink[] };

export type AssistantContext = {
  name?: string;
  roles: string[];
  path: string;
  jumuiya?: JumuiyaFact[];
  saints?: SaintFact[];
};

const LEADER_ROLES = [
  "CSA_CHAIR",
  "CSA_VICE_CHAIR",
  "CSA_SECRETARY",
  "CSA_LEADER",
  "TREASURER",
  "LITURGIST",
  "JUMUIYA_COORDINATOR",
  "JUMUIYA_OS",
  "OS",
  "PROJECT_MANAGER",
  "INSTRUMENT_MANAGER",
  "JUMUIYA_CHAIRPERSON",
  "JUMUIYA_SECRETARY",
  "CHOIR_CHAIRPERSON",
  "CHOIR_SECRETARY",
  "CHOIR_PROJECT_COORDINATOR",
  "ST_FRANCIS_CHAIR",
  "CHARISMATIC_CHAIR",
  "DANCE_CHAIR",
  "MENTORSHIP_CHAIR",
];

export const getGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const who = name ? ` ${name}` : "";
  return `${part}${who}! I'm Rafiki, your church companion. Ask me about prayers, activities, the shop, officials, or anything else on this site, and I'll point you to the right place.`;
};

export const SUGGESTIONS: string[] = [
  "Help me navigate the site",
  "Daily devotions and prayers",
  "Book an activity",
  "Meet our officials",
  "Buy a t-shirt or sacramentals",
  "Who can access the admin panel?",
];

const L = (text: string, links?: AssistantLink[]): LocalAnswer => ({ text, links });

const hasAny = (input: string, words: string[]) => words.some((w) => input.includes(w));

const FALLBACK: LocalAnswer = {
  text: "I can help you navigate the site. Try asking about devotions and prayers, activities and booking, the shop, officials, or the community hub. What would you like to do?",
  links: [
    { label: "Devotions", href: "/devotions" },
    { label: "Activities", href: "/activities" },
    { label: "Shop & projects", href: "/projects" },
  ],
};

const JUMUIYA: { id: string; label: string; names: string[] }[] = [
  {
    id: "st-anthony",
    label: "St. Anthony of Padua",
    names: ["st antony", "st anthony", "saint antony", "saint anthony", "anthony of padua", "antony of padua", "padua"],
  },
  {
    id: "st-augustine",
    label: "St. Augustine of Hippo",
    names: ["st augustine", "saint augustine", "augustine of hippo"],
  },
  {
    id: "st-catherine",
    label: "St. Catherine of Alexandria",
    names: ["st catherine", "saint catherine", "catherine of alexandria"],
  },
  {
    id: "st-dominic",
    label: "St. Dominic",
    names: ["st dominic", "saint dominic", "dominic de guzman"],
  },
  {
    id: "st-elizabeth",
    label: "St. Elizabeth of Hungary",
    names: ["st elizabeth", "saint elizabeth", "elizabeth of hungary"],
  },
  {
    id: "st-maria-goretti",
    label: "St. Maria Goretti",
    names: ["st maria goretti", "saint maria goretti", "maria goretti", "goretti"],
  },
  {
    id: "st-monica",
    label: "St. Monica",
    names: ["st monica", "saint monica"],
  },
];

const matchJumuiya = (norm: string): { id: string; label: string } | null => {
  for (const j of JUMUIYA) {
    if (j.names.some((n) => norm.includes(n))) {
      return { id: j.id, label: j.label };
    }
  }
  return null;
};

const saintAliases = (name: string): string[] => {
  const base = name
    .toLowerCase()
    .replace(/^saint[s]?\s+/, "")
    .replace(/^blessed\s+/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const first = base.split(" ")[0] ?? "";
  return [`st ${first}`, `saint ${first}`, base];
};

const matchSaint = (norm: string, saints?: SaintFact[]): SaintFact | null => {
  if (!saints) return null;
  for (const s of saints) {
    if (saintAliases(s.name).some((alias) => alias.length >= 3 && norm.includes(alias))) {
      return s;
    }
  }
  return null;
};

type Intent = { id: string; words: string[]; run: (c: AssistantContext) => LocalAnswer };

const INTENTS: Intent[] = [
  {
    id: "greeting",
    words: ["hello", "hey", "jambo", "habari", "hujambo", "mambo", "good morning", "good afternoon", "good evening"],
    run: (c) =>
      L(
        `Hello${c.name ? ` ${c.name}` : ""}! How can I help you today? You can ask about prayers, activities, the shop, officials or how to get around.`,
      ),
  },
  {
    id: "thanks",
    words: ["thank", "thanks", "asante", "shukran", "appreciate"],
    run: () => L("You're most welcome! Feel free to ask me anything else whenever you need a hand."),
  },
  {
    id: "goodbye",
    words: ["bye", "goodbye", "good night", "goodnight", "farewell", "later"],
    run: () => L("Take care and God bless! Come back any time you need help finding your way around."),
  },
  {
    id: "who",
    words: ["who are you", "what are you", "your name", "who made you", "who built you", "are you ai", "what is rafiki"],
    run: () =>
      L(
        "I'm Rafiki (Swahili for 'friend') - the virtual assistant of the CSA Kirinyaga website. My job is to help members and visitors use the site: find pages, learn about features, and get quick answers. I'm always happy to help!",
      ),
  },
  {
    id: "rosary",
    words: ["rosary", "mysteries", "beads", "our lady", "mary"],
    run: () =>
      L(
        "The Holy Rosary tracker lets you pray and track the mysteries. You'll find it under Devotions.",
        [{ label: "Holy Rosary", href: "/devotions/rosary" }],
      ),
  },
  {
    id: "bible",
    words: ["bible", "scripture", "gospel", "verses", "chapter", "book of "],
    run: () =>
      L("The built-in Bible reader lets you read any book of the Bible by chapter, search, bookmark verses and change font size.",
        [{ label: "Holy Bible", href: "/devotions/bible" }]),
  },
  {
    id: "missal",
    words: ["missal", "daily mass", "mass readings", "liturgy of the day", "liturgy", "readings today", "order of mass", "sacra liturgia"],
    run: () =>
      L(
        "You can follow the daily missal and liturgy of the day, plus guides to the seasons and the order of the Mass.",
        [
          { label: "Daily Missal", href: "/devotions/daily-liturgy" },
          { label: "Liturgy guide", href: "/devotions/liturgy" },
        ],
      ),
  },
  {
    id: "novena",
    words: ["novena", "novenas", "litany", "litanies", "nine day"],
    run: () =>
      L("Novenas and litanies are collected in the Prayer Module under Devotions.",
        [{ label: "Novenas & litanies", href: "/devotions/prayer-module" }]),
  },
  {
    id: "challenge",
    words: ["challenge", "quiz", "daily question", "questions", "test my faith"],
    run: () =>
      L("The Daily Challenge gives you faith-based questions to test and grow your knowledge.",
        [{ label: "Daily Challenge", href: "/devotions/challenge" }]),
  },
  {
    id: "progress",
    words: ["progress", "my progress", "points", "score", "my stats", "how am i doing", "achievement"],
    run: () =>
      L("You can track your own progress, and each jumuiya can see its standing in the comparison dashboard.",
        [
          { label: "My Progress", href: "/devotions/progress" },
          { label: "Jumuiya comparison", href: "/devotions/comparison" },
        ]),
  },
  {
    id: "devotions",
    words: ["devotion", "devotions", "prayer", "prayers", "pray", "praying", "spiritual", "faith", "readings"],
    run: () =>
      L(
        "The Devotions section has a prayer book, all prayers, the Bible, rosary, daily missal, novenas, a daily challenge and progress tracking.",
        [
          { label: "Devotions home", href: "/devotions" },
          { label: "Prayer book", href: "/devotions/readings" },
          { label: "All prayers", href: "/devotions/all-prayers" },
        ],
      ),
  },
  {
    id: "community",
    words: ["community", "choir", "charismatic", "st francis", "dance group", "mentorship", "sodal", "groups and ministries", "ministry"],
    run: () =>
      L("The Community hub brings together the choir, St. Francis, Charismatic, dance and mentorship groups.",
        [{ label: "Community hub", href: "/community" }]),
  },
  {
    id: "jumuiya",
    words: ["jumuiya", "small christian community", "neighbourhood", "neighborhood group", "scc"],
    run: () =>
      L(
        "Jumuiya are our small Christian communities. Browse them to see members, leaders and details of each group.",
        [{ label: "Jumuiya", href: "/jumuiya" }],
      ),
  },
  {
    id: "officials",
    words: ["official", "officials", "leader", "leadership", "executive", "committee", "chairperson", "secretary", "treasurer", "office bearer", "who is the"],
    run: () =>
      L(
        "You can browse the full directory of CSA officials and also see the leadership history of the association.",
        [
          { label: "Officials directory", href: "/officials" },
          { label: "Leadership history", href: "/officials/history" },
        ],
      ),
  },
  {
    id: "gallery",
    words: ["gallery", "photo", "photos", "picture", "pictures", "images", "album", "video"],
    run: () => L("The gallery holds photos and memories from CSA Kirinyaga events.", [{ label: "Gallery", href: "/gallery" }]),
  },
  {
    id: "shop",
    words: ["shop", "buy", "purchase", "t-shirt", "tshirt", "shirt", "sacramental", "scapular", "crucifix", "medal", "holy water", "chair", "hire", "rent", "instrument", "project", "product", "price", "order", "cost", "checkout"],
    run: () =>
      L(
        "The Projects and Shop section lets you buy sacramentals, t-shirts and more, and also hire chairs and instruments. You can order online.",
        [
          { label: "Projects & shop", href: "/projects" },
          { label: "Sacramentals", href: "/sacramentals" },
          { label: "T-shirts", href: "/t-shirts" },
        ],
      ),
  },
  {
    id: "activities",
    words: ["activity", "activities", "book an", "booking", "register for", "sign up", "event", "weekly", "semester", "attend", "participate"],
    run: () =>
      L(
        "Weekly and semester activities are listed with online booking. You can also see your own bookings.",
        [
          { label: "Activities & booking", href: "/activities" },
          { label: "My bookings", href: "/my-bookings" },
        ],
      ),
  },
  {
    id: "notifications",
    words: ["notification", "notifications", "announcement", "announcements", "notice", "alert", "broadcast", "news"],
    run: () => L("Notifications and announcements from the association appear in your notification feed.", [{ label: "Notifications", href: "/Notification" }]),
  },
  {
    id: "login",
    words: ["login", "log in", "sign in", "signin", "create account", "register", "account", "password", "forgot", "reset my", "verify email"],
    run: () =>
      L(
        "Head to the login page to sign in or create your account. If you've forgotten your password you can reset it right there.",
        [{ label: "Login / register", href: "/login" }],
      ),
  },
  {
    id: "admin",
    words: ["admin", "administrator", "manage the site", "manage site", "dashboard", "permission", "who can access", "leadership access"],
    run: (c) => {
      const isLeader = c.roles.some((r) => LEADER_ROLES.includes(r));
      return isLeader
        ? L(
            "You have leadership access, so you can manage the site from the admin dashboard. Would you like to open it?",
            [{ label: "Admin dashboard", href: "/admin" }],
          )
        : L(
            "The admin panel is restricted to authorized CSA leaders (chairpersons, secretaries, coordinators and similar office bearers). If you believe you should have access, please contact the association leadership.",
            [{ label: "Login", href: "/login" }],
          );
    },
  },
  {
    id: "contact",
    words: ["developer", "developers", "who built", "who made", "contact the chair", "chairperson contact", "phone number", "reach us", "support", "report a problem"],
    run: () =>
      L(
        "The developer team and the chairperson's contact details are shown on the footer of every page. You can call or message the chairperson directly for any association matters.",
      ),
  },
  {
    id: "privacy",
    words: ["privacy", "terms", "policy", "legal"],
    run: () =>
      L("You can read our privacy policy and terms of service on those pages.", [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ]),
  },
  {
    id: "capabilities",
    words: ["help", "what can you do", "how do i", "how to", "what do you do", "guide", "navigate", "navigation", "menu", "where do i", "where is", "take me to", "find a", "find the", "go to", "direct me"],
    run: () => ({
      text: "I can help you get around the whole site. Just tell me what you're looking for - for example: 'how do I book an activity?', 'where are the daily prayers?' or 'show me the officials'. You can also pick a topic below:",
      links: [
        { label: "Devotions & prayers", href: "/devotions" },
        { label: "Activities & booking", href: "/activities" },
        { label: "Shop & projects", href: "/projects" },
        { label: "Officials", href: "/officials" },
        { label: "Community", href: "/community" },
      ],
    }),
  },
];

export function localRespond(input: string, ctx: AssistantContext): LocalAnswer {
  const norm = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!norm) return FALLBACK;

  if (["hi", "hie", "sasa", "nipo", "morning", "evening"].includes(norm)) {
    return INTENTS[0].run(ctx);
  }

  const jumuiya = matchJumuiya(norm);
  if (jumuiya) {
    const detail = ctx.jumuiya?.find((j) => j.id === jumuiya.id);
    const schedule =
      detail && detail.day
        ? ` ${detail.name} meets ${detail.day.toLowerCase()}${detail.time ? `, ${detail.time}` : ""}${detail.venue ? ` at ${detail.venue}` : ""}.`
        : "";
    return L(
      `${jumuiya.label} is one of our jumuiya (small Christian communities).${schedule} Here's the group's page with its leaders, news, photos and full details.`,
      [
        { label: jumuiya.label, href: `/jumuiya/${jumuiya.id}` },
        { label: "All jumuiya", href: "/jumuiya" },
      ],
    );
  }

  const saint = matchSaint(norm, ctx.saints);
  if (saint) {
    return L(
      `${saint.name} - ${saint.feastName} (${saint.feastDay}).${saint.patronage ? ` Patron of ${saint.patronage}.` : ""} You can explore the saints and liturgical seasons in Devotions.`,
      [{ label: "Saints & seasons", href: "/devotions/liturgical-seasons" }],
    );
  }

  for (const intent of INTENTS) {
    if (hasAny(norm, intent.words)) return intent.run(ctx);
  }
  return FALLBACK;
}
