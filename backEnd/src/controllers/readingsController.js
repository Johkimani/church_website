import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { get as httpGet } from "node:http";
import logger from "../logger/winston.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCAL_DATA_DIR = join(__dirname, "..", "data");

const CATHOLIC_READINGS_API =
  "https://cpbjr.github.io/catholic-readings-api";
const BIBLE_TEXT_API = "https://bible-api.com";
const CALENDAR_API = "http://calapi.inadiutorium.cz/api/v0/en/calendars/default/today";

const REF_TYPES = {
  firstReading: "first-reading",
  psalm: "responsorial-psalm",
  secondReading: "second-reading",
  gospel: "gospel",
};

const TITLES = {
  "first-reading": "First Reading",
  "responsorial-psalm": "Responsorial Psalm",
  "second-reading": "Second Reading",
  gospel: "Gospel",
};

const PSALM_RESPONSES = {
  1: "The Lord will guard the way of the just.",
  2: "You are my Son; this day I have begotten you.",
  3: "The Lord upholds me.",
  4: "Let your face shine on us, O Lord.",
  5: "I will sing of your salvation.",
  6: "Lord, heal my body and save my soul.",
  7: "The Lord is my shield; my God is my rock of refuge.",
  8: "O Lord, our God, how majestic is your name!",
  9: "I will praise your name, Lord, for it is good.",
  10: "You will not abandon the soul of the just.",
  11: "The Lord is my light and my salvation.",
  12: "The Lord will guard you from all evil.",
  13: "Let your face shine on us, O Lord.",
  14: "The Lord has looked upon the lowly.",
  15: "Who shall climb the mountain of the Lord?",
  16: "Keep me safe, O God, for in you I take refuge.",
  17: "I am just and innocent, O Lord.",
  18: "The Lord is my rock, my fortress, my deliverer.",
  19: "The heavens declare the glory of God.",
  20: "The Lord answer you in your hour of need.",
  21: "The king rejoices in your strength, O Lord.",
  22: "The Lord is my shepherd; there is nothing I shall want.",
  23: "The Lord is my shepherd; there is nothing I shall want.",
  24: "The earth is the Lord's and all that fills it.",
  25: "To you, O Lord, I lift my soul.",
  26: "Lord, I love your house.",
  27: "The Lord is my light and my salvation.",
  28: "The Lord is my strength and my song.",
  29: "The Lord will bless his people with peace.",
  30: "I will praise you, Lord, for you have rescued me.",
  31: "In you, O Lord, I take refuge.",
  32: "Blessed is the one whose offense is forgiven.",
  33: "The earth is full of the goodness of the Lord.",
  34: "The angel of the Lord encamps around those who fear him.",
  35: "Plead my cause, O Lord.",
  36: "How precious is your mercy, O God!",
  37: "The Lord will not abandon the just.",
  38: "Do not forsake me, O Lord.",
  39: "Our days are like grass; we bloom like a flower.",
  40: "Here I am, Lord; I come to do your will.",
  41: "Blessed is the one who cares for the poor.",
  42: "As the deer pants for streams of water, so my soul pants for you.",
  43: "Vindicate me, O God.",
  44: "We have heard with our own ears, O God.",
  45: "My heart overflows with a good theme.",
  46: "God is our refuge and strength.",
  47: "Clap your hands, all you nations.",
  48: "The LORD Most High is to be feared.",
  49: "Hear this, all you peoples.",
  50: "The God of gods, the Lord, has spoken.",
  51: "Have mercy on me, O God.",
  52: "I will trust in the mercy of God forever.",
  53: "The fool has said in his heart: There is no God.",
  54: "O God, save me by your name.",
  55: "Hear my prayer, O God.",
  56: "Have pity on me, O God, for men trample on me.",
  57: "Be merciful to me, O God.",
  58: "God judges the peoples.",
  59: "Deliver me from my enemies, O God.",
  60: "With God we shall do valiantly.",
  61: "Hear my cry, O God.",
  62: "Truly God is my salvation.",
  63: "O God, you are my God, for you I long.",
  64: "To you we owe praise, O God.",
  65: "To you silence is praise, O God.",
  66: "Shout joyfully to God, all the earth.",
  67: "Let all the peoples praise you, God.",
  68: "God is our refuge and strength.",
  69: "Save me, O God.",
  70: "Come to my assistance, O Lord.",
  71: "In you, O Lord, I take refuge.",
  72: "Justice shall flourish in his time.",
  73: "How good God is to Israel.",
  74: "Why have you cast us off, O God?",
  75: "We give thanks to you, O God.",
  76: "In Judah God is known.",
  77: "I will recall all you have done, O Lord.",
  78: "My people, hear my teaching.",
  79: "O God, the nations have inherited your land.",
  80: "Hear us, O Shepherd of Israel.",
  81: "Sing joyfully to God our strength.",
  82: "O God, do not keep silence.",
  83: "O God, who can be compared to you?",
  84: "How lovely is your dwelling place.",
  85: "You favored, O Lord, your land.",
  86: "Bend your ear, O Lord, and answer me.",
  87: "Founded on the holy mountains.",
  88: "O Lord, my God, I cry out by day.",
  89: "I will sing of the Lord's eternal love.",
  90: "Lord, you have been our refuge.",
  91: "He who dwells in the shelter of the Most High.",
  92: "It is good to praise the Lord.",
  93: "The Lord reigns; he is robed in majesty.",
  94: "O Lord, God of vengeance.",
  95: "Come, let us sing joyfully to the Lord.",
  96: "The Lord is king; let the earth rejoice.",
  97: "The Lord is king; let the earth be glad.",
  98: "Sing a new song to the Lord.",
  99: "The Lord is king; let the peoples tremble.",
  100: "We are his people: the sheep of his flock.",
  101: "I will sing of your love and justice.",
  102: "O Lord, hear my prayer.",
  103: "The Lord is kind and merciful.",
  104: "Bless the Lord, my soul.",
  105: "Give thanks to the Lord, for he is good.",
  106: "Give thanks to the Lord, for he is good.",
  107: "The Lord gathered them from the lands.",
  108: "My heart is steadfast, O God.",
  109: "O God, do not stay silent.",
  110: "The Lord says to my Lord: Sit at my right hand.",
  111: "I will praise the Lord with all my heart.",
  112: "Blessed is the one who fears the Lord.",
  113: "Praise, you servants of the Lord.",
  114: "When Israel came out of Egypt.",
  115: "Not to us, O Lord, not to us.",
  116: "I love the Lord for he heard my voice.",
  117: "Praise the Lord, all you nations.",
  118: "Give thanks to the Lord, for he is good.",
  119: "Blessed are the blameless in the way.",
  120: "I lift my eyes to the mountains.",
  121: "I rejoiced with those who said to me.",
  122: "Let us go to the house of the Lord.",
  123: "To you I lift my eyes.",
  124: "If the Lord had not been on our side.",
  125: "Those who trust in the Lord are like Mount Zion.",
  126: "The Lord has done great things for us.",
  127: "Unless the Lord builds the house.",
  128: "Blessed are all who fear the Lord.",
  129: "Often have they attacked me.",
  130: "Out of the depths I cry to you, Lord.",
  131: "Lord, my heart is not proud.",
  132: "Remember, O Lord, David.",
  133: "How good and pleasant it is.",
  134: "Come, bless the Lord.",
  135: "Praise the name of the Lord.",
  136: "His love endures forever.",
  137: "By the rivers of Babylon we sat and wept.",
  138: "I will praise you, Lord, with all my heart.",
  139: "O Lord, you have probed me and you know me.",
  140: "Rescue me, Lord, from evil men.",
  141: "I have called to you, Lord; hasten to answer me.",
  142: "I cry aloud to the Lord.",
  143: "Lord, hear my prayer.",
  144: "Blessed be the Lord, my rock.",
  145: "I will extol you, my God and king.",
  146: "Praise the Lord, my soul.",
  147: "Praise the Lord, for he is good.",
  148: "Praise the Lord from the heavens.",
  149: "Sing a new song to the Lord.",
  150: "Praise the Lord in his sanctuary.",
};

// Swahili psalm responses
const PSALM_RESPONSES_SW = {
  1: "Bwana atalinda njia ya wenye haki.",
  2: "Wewe ni Mwanangu; leo nimekuzaa.",
  3: "Bwana anaunidhisha.",
  4: "Nuru ya uso wako, Ee Bwana, juu yetu.",
  5: "Nitaimba wokovu wako.",
  6: "Ee Bwana,ponyesha mwili wangu, uokoe nafsi yangu.",
  7: "Bwana ngao yangu; Mungu mwamba wangu ni tumaini langu.",
  8: "Ee Bwana, Mungu wetu, jina lako ni zuri!",
  9: "Nitakuimbia jina lako, Ee Bwana, kwa maana ni zuri.",
  10: "Usimwache mtu mwenye haki.",
  11: "Bwana ni mwanga wangu na wokovu wangu.",
  12: "Bwana atakulinda.",
  13: "Nuru ya uso wako, Ee Bwana, juu yetu.",
  14: "Bwana ameangalia maskini.",
  15: "Nani atapanda mlima wa Bwana?",
  16: "Nikilinde, Ee Mungu, maana wewe ni tumaini langu.",
  17: "Mimi ni mwenye haki na mwenye ukweli.",
  18: "Bwana ni mwamba wangu, ngao yangu, mwokozi wangu.",
  19: "Mbingu zinasifu utukufu wa Mungu.",
  20: "Bwana akujibu siku ya shida.",
  21: "Mfalme atafurahia nguvu yako, Ee Bwana.",
  22: "Bwana ni mchungaji wangu; sitakosa chochote.",
  23: "Bwana ni mchungaji wangu; sitakosa chochote.",
  24: "Dunia ni ya Bwana na vyote vilivyo ndani yake.",
  25: "Kwako, Ee Bwana, nainua nafsi yangu.",
  26: "Bwana, ninapenda nyumba yako.",
  27: "Bwana ni mwanga wangu na wokovu wangu.",
  28: "Bwana nguvu zangu na ngoma yangu.",
  29: "Bwana atabariki watu wake kwa amani.",
  30: "Nitakusifu, Ee Bwana, kwa maana umeniokoa.",
  31: "Kwako, Ee Bwana, najificha.",
  32: "Heri mtu ambaye dhambi yamepewa msamaha.",
  33: "Dunia imejaa wema wa Bwana.",
  34: "Malaika wa Bwana ana kambi yake karibu na wale wamchao.",
  35: "Hukumu kwa ajili yangu, Ee Bwana.",
  36: "Thamani ya huruma yako, Ee Mungu, ni kuu!",
  37: "Bwana hataki mtu mwenye haki.",
  38: "Usinilaumu, Ee Bwana.",
  39: "Siku zetu kama nyasi; tunachipua kama ua.",
  40: "Hapa mimi, Bwana; nimekuja kufanya mapenzi yako.",
  41: "Heri mtu anayemsaidia maskini.",
  42: "Kama mnyama anavyotamani maji, nafsi yangu inakutamani.",
  43: "Nifanye haki, Ee Mungu.",
  44: "Tumesikia kwa masikio yetu, Ee Mungu.",
  45: "Moyo wangu unafurahia kwa njia njema.",
  46: "Mungu ni hifadhi yetu na nguvu yetu.",
  47: "Pigeni makofi, nchi zote.",
  48: "Bwana Mwenyezi ndiye wa kumheshimu.",
  49: "Sikieni hii, nchi zote.",
  50: "Mungu wa miungu, Bwana amezungumza.",
  51: "Niwe na huruma, Ee Mungu.",
  52: "Nitatumaini katika huruma ya Mungu milele.",
  53: "Mpumbavu amesema moyoni: Hakuna Mungu.",
  54: "Ee Mungu, niokoe kwa jina lako.",
  55: "Sikia ombi langu, Ee Mungu.",
  56: "Niwe na huruma, Ee Mungu, kwa maana watu wanunyima.",
  57: "Niwe na huruma, Ee Mungu.",
  58: "Mungu anahukumu watu.",
  59: "Niokoe na adui zangu, Ee Mungu.",
  60: "Pamoja na Mungu tutafanya jahazi.",
  61: "Sikia kilio changu, Ee Mungu.",
  62: "Kweli Mungu ndiye wokovu wangu.",
  63: "Ee Mungu, wewe ndiye Mungu wangu, nikutamani.",
  64: "Kwako tunastahili sifa, Ee Mungu.",
  65: "Umyamizi ni sifa, Ee Mungu.",
  66: "Furahini kwa Mungu, nchi zote.",
  67: "Watu wote waisifu, Ee Mungu.",
  68: "Mungu ni hifadhi yetu na nguvu yetu.",
  69: "Niokoe, Ee Mungu.",
  70: "Nisaidie, Ee Bwana.",
  71: "Kwako, Ee Bwana, najificha.",
  72: "Haki itachipua katika zamu yake.",
  73: "Jinsi Mungu aliye wema kwa Israeli.",
  74: "Kwa nini umetuondoa, Ee Mungu?",
  75: "Tunakushukuru, Ee Mungu.",
  76: "Katika Yuda Mungu anajulikana.",
  77: "Nitakumbuka ulivyofanya, Ee Bwana.",
  78: "Watangu, sikieni mafundisho yangu.",
  79: "Ee Mungu, mataifa yameurithi nchi yako.",
  80: "Sikia, Ee Mchungaji wa Israeli.",
  81: "Furahini kwa Mungu nguvu zetu.",
  82: "Ee Mungu, usinyamaze.",
  83: "Ee Mungu, nani anaweza kulinganishwa nawe?",
  84: "Jinsi nyumba yako ilivyo nzuri!",
  85: "Umetunza nchi yako, Ee Bwana.",
  86: "Sinikilize, Ee Bwana, nijibu.",
  87: "Imejengwa katika milima takatifu.",
  88: "Ee Bwana, Mungu wangu, nalia mchana.",
  89: "Nitaimba upendo wa Bwana wa milele.",
  90: "Bwana, umekuwa hifadhi yetu.",
  91: "Anayeishi katika hifadhi ya Mwenyezi.",
  92: "Ni vizuri kumsifu Bwana.",
  93: "Bwana anatawala; amevaa ukubwa.",
  94: "Ee Bwana, Mungu wa kulipiza kisasi.",
  95: "Njoni tuitikie Bwana kwa furaha.",
  96: "Bwana anatawala; nchi ifurahie.",
  97: "Bwana anatawala; nchi iwe na furaha.",
  98: "Imbimbo jipya kwa Bwana.",
  99: "Bwana anatawala; watu wote wotrembe.",
  100: "Sisi ni watu wake: kondoo wa kundi lake.",
  101: "Nitaimba upendo na haki yako.",
  102: "Ee Bwana, sikia ombi langu.",
  103: "Bwana ni mwenye upendo na rehema.",
  104: "Msifu Bwana, nafsi yangu.",
  105: "Mshukuru Bwana, kwa maana ni mwema.",
  106: "Mshukuru Bwana, kwa maana ni mwema.",
  107: "Bwana aliwakusanya kutoka nchi zote.",
  108: "Moyo wangu thabiti, Ee Mungu.",
  109: "Ee Mungu, usinyamaze.",
  110: "Bwana amwaambia Bwana wangu: Ketuli mkono wa kulia.",
  111: "Nitamsifu Bwana kwa moyo wangu wote.",
  112: "Heri mtu amchao Bwana.",
  113: "Msifu, nje mwango wa Bwana.",
  114: "Israeli alipoondoka Misri.",
  115: "Si kwetu, Ee Bwana, si kwetu.",
  116: "Ninampenda Bwana kwa maana alisikia sauti yangu.",
  117: "Mtuimbueni Bwana, nchi zote.",
  118: "Mshukuru Bwana, kwa maana ni mwema.",
  119: "Heri wale wasio na uovu njiani.",
  120: "Nainua macho yangu kuelekea milima.",
  121: "Nilifurahia pale waliponiambia.",
  122: "Nenda tukazidi nyumba ya Bwana.",
  123: "Kwako nainua macho yangu.",
  124: "Kama Bwana asingekuwa pamoja nasi.",
  125: "Wale wamtumainio Bwana ni kama Mlima Sioni.",
  126: "Bwana amefanya makuu kwa ajili yetu.",
  127: "Isipokuwa Bwana ajenga nyumba.",
  128: "Heri wote wamchao Bwana.",
  129: "Mara nyingi wamenivamia.",
  130: "Kutoka mittleni nali kwako, Ee Bwana.",
  131: "Ee Bwana, moyo wangu hauni kiburi.",
  132: "Kumbuka, Ee Bwana, Daudi.",
  133: "Jinsi nzuri na ya kufurahisha ilivyo.",
  134: "Njoni mbarikieni Bwana.",
  135: "Msifu jina la Bwana.",
  136: "Upendo wake hudumu milele.",
  137: "Kwa mito ya Bbiloni tuliketi tukilia.",
  138: "Nitakusifu, Ee Bwana, kwa moyo wangu wote.",
  139: "Ee Bwana, umenichunguza na unijua.",
  140: "Niokoe, Ee Bwana, kutoka kwa watu wabaya.",
  141: "Nilikuita, Ee Bwana; njia haraka kunijibu.",
  142: "Nalia kwa sauti kwa Bwana.",
  143: "Ee Bwana, sikia ombi langu.",
  144: "Heri Bwana, mwamba wangu.",
  145: "Nitakuita, Ee Mungu wangu na mfalme wangu.",
  146: "Msifu Bwana, nafsi yangu.",
  147: "Msifu Bwana, kwa maana ni mwema.",
  148: "Msifu Bwana kutoka mbinguni.",
  149: "Mwimbieni Bwana wimbo mpya.",
  150: "Mtuimbueni Bwana katika mahali patakatifu.",
};

function extractPsalmNumber(citation) {
  const m = citation.match(/Psalm(?:s)?\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function getPsalmResponse(citation, lang) {
  const num = extractPsalmNumber(citation);
  if (!num) return null;
  const map = lang === "sw" ? PSALM_RESPONSES_SW : PSALM_RESPONSES;
  return map[num] || PSALM_RESPONSES[num] || null;
}

const localCache = {};

function loadLocalDB(year, version) {
  const cacheKey = version ? `${year}-${version}` : year;
  if (localCache[cacheKey] !== undefined) return localCache[cacheKey];

  // Determine which file to load based on version
  let filePath;
  if (version === "web") {
    filePath = join(LOCAL_DATA_DIR, `readings-${year}.json`);
  } else if (version === "sw" || version === "swahili") {
    filePath = join(LOCAL_DATA_DIR, `readings-${year}-sw.json`);
  } else {
    // Default: prefer Douay-Rheims Catholic Bible (DRB) over WEB
    const drbPath = join(LOCAL_DATA_DIR, `readings-${year}-dr.json`);
    const webPath = join(LOCAL_DATA_DIR, `readings-${year}.json`);
    filePath = existsSync(drbPath) ? drbPath : webPath;
  }

  if (!existsSync(filePath)) {
    localCache[cacheKey] = null;
    return null;
  }

  try {
    const raw = readFileSync(filePath, "utf8");
    localCache[cacheKey] = JSON.parse(raw);
    const count = Object.keys(localCache[cacheKey]).length;
    const source = filePath.includes("-dr") ? "DRB" : filePath.includes("-sw") ? "Swahili" : "WEB";
    logger.info(`Loaded local readings DB for ${year}: ${count} entries (${source})`);
    return localCache[cacheKey];
  } catch (err) {
    logger.warn(`Failed to load local readings for ${year}: ${err.message}`);
    localCache[cacheKey] = null;
    return null;
  }
}

function getLocalReading(dateKey, version) {
  const year = parseInt(dateKey.split("-")[0], 10);
  const db = loadLocalDB(year, version);
  if (db && db[dateKey]) {
    return db[dateKey];
  }
  return null;
}

function getYear(date) {
  return date.getFullYear();
}

function getMonthDay(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getLiturgicalYear(date) {
  const year = date.getFullYear();
  const cycle = (year - 2014) % 3;
  return cycle === 0 ? "A" : cycle === 1 ? "B" : "C";
}

function getLiturgicalKeyDates(year) {
  const easter = calculateEaster(year);
  const baptismLord = addDays(easter, 40);
  const ashWednesday = addDays(easter, -46);
  const firstSundayAdvent = new Date(year, 11, 24);
  while (firstSundayAdvent.getDay() !== 0) {
    firstSundayAdvent.setDate(firstSundayAdvent.getDate() - 1);
  }
  return { easter, baptismLord, ashWednesday, firstSundayAdvent };
}

function getLiturgicalSeason(date) {
  const year = date.getFullYear();
  const keyDates = getLiturgicalKeyDates(year);
  const d = new Date(date);
  if (
    d >= keyDates.firstSundayAdvent &&
    d <= new Date(year, 11, 24)
  ) {
    return { label: "Advent", color: "purple" };
  }
  if (
    d >= new Date(year, 11, 25) &&
    d <= keyDates.baptismLord &&
    year === d.getFullYear()
  ) {
    return { label: "Christmas", color: "white" };
  }
  if (d >= addDays(keyDates.easter, 1) && d <= addDays(keyDates.baptismLord, -1)) {
    if (new Date(year, 0, 6).getTime() > keyDates.baptismLord.getTime()) {
      return { label: "Ordinary Time", color: "green" };
    }
    return { label: "Easter", color: "white" };
  }
  if (d >= keyDates.ashWednesday && d < keyDates.easter) {
    return { label: "Lent", color: "purple" };
  }
  return { label: "Ordinary Time", color: "green" };
}

async function fetchJSON(url, timeout = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CSAKirinyaga/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

const calendarCache = { date: null, data: null, fetchedAt: 0 };
const CALENDAR_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function fetchCalendarJSON(timeout = 10000) {
  return new Promise((resolve) => {
    const req = httpGet(
      CALENDAR_API,
      {
        family: 4,
        headers: {
          "User-Agent": "CSAKirinyaga/1.0",
          Accept: "application/json",
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ ok: res.statusCode === 200, data: JSON.parse(body) });
          } catch {
            resolve({ ok: false, data: null });
          }
        });
      }
    );
    req.setTimeout(timeout, () => req.destroy(new Error("timeout")));
    req.on("error", () => resolve({ ok: false, data: null }));
  });
}

async function fetchBibleText(reference) {
  let urlRef = reference;
  const psalmMatch = reference.match(/^Psalm\s+(\d+)/i);
  if (psalmMatch) {
    urlRef = `Psalm ${psalmMatch[1]}`;
  }
  const url = `${BIBLE_TEXT_API}/${encodeURIComponent(urlRef)}`;
  const data = await fetchJSON(url, 12000);
  return data?.text || null;
}

async function fetchFromCatholicReadingsAPI(date) {
  try {
    const year = getYear(date);
    const md = getMonthDay(date);
    const url = `${CATHOLIC_READINGS_API}/readings/${year}/${md}.json`;
    const data = await fetchJSON(url);
    if (!data?.readings) return null;

    const readings = [];
    for (const [key, type] of Object.entries(REF_TYPES)) {
      if (data.readings[key]) {
        const text = await fetchBibleText(data.readings[key]);
        const reading = {
          type,
          title: TITLES[type],
          citation: data.readings[key],
          text: text || data.readings[key],
        };
        if (type === "responsorial-psalm") {
          const resp = getPsalmResponse(data.readings[key], "en");
          if (resp) reading.response = resp;
        }
        readings.push(reading);
      }
    }

    if (readings.length === 0) return null;

    return {
      date: date.toISOString().split("T")[0],
      weekday: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      celebration: data.season || "Daily Mass",
      season: data.season || "",
      liturgicalYear: getLiturgicalYear(date),
      readings,
      source: "catholic-readings-api",
      usccbLink: data.usccbLink || "",
    };
  } catch (err) {
    logger.warn(`Catholic Readings API fetch failed: ${err.message}`);
    return null;
  }
}

function buildGenericReadings(date, season, liturgicalYear) {
  const key = season.label.toLowerCase().includes("advent")
    ? "advent"
    : season.label.toLowerCase().includes("christmas")
    ? "christmas"
    : season.label.toLowerCase().includes("lent")
    ? "lent"
    : season.label.toLowerCase().includes("easter")
    ? "easter"
    : "ordinary";

  const FIRST_READING = {
    advent: { citation: "Isaiah 7:10-14", text: "The Lord himself will give you a sign: the virgin will conceive and bear a son, and call him Immanuel." },
    christmas: { citation: "Isaiah 9:1-6", text: "The people walking in darkness have seen a great light. A child is born to us, a son is given, and the government will be on his shoulders." },
    lent: { citation: "Isaiah 1:10-17", text: "Hear the word of the Lord, you rulers of Sodom. Bring no more vain offerings. Wash yourselves; make yourselves clean." },
    easter: { citation: "Acts 10:34-43", text: "God anointed Jesus of Nazareth with the Holy Spirit and power. He went around doing good and healing all who were under the power of the devil." },
    ordinary: { citation: "1 Samuel 16:1b, 6-7, 10-13a", text: "The Lord said to Samuel: Do not look on his appearance. The Lord sees not as man sees; man looks on the outward appearance, but the Lord looks on the heart." },
  };

  const PSALM = {
    advent: { citation: "Psalm 25:4-5, 8-9, 10, 14", text: "Show me your ways, Lord. All the ways of the Lord are loving and faithful." },
    christmas: { citation: "Psalm 98:1, 2-3", text: "Sing to the Lord a new song. The Lord has made his salvation known." },
    lent: { citation: "Psalm 51:3-4, 5-6", text: "Have mercy on me, O God. Create in me a clean heart." },
    easter: { citation: "Psalm 118:1-2, 16-17", text: "Give thanks to the Lord. I will not die but live." },
    ordinary: { citation: "Psalm 19:8-9, 10, 11", text: "The precepts of the Lord are right. They are more precious than gold." },
  };

  const GOSPEL = {
    advent: { citation: "Matthew 1:18-24", text: "Joseph son of David, do not be afraid to take Mary home. What is conceived in her is from the Holy Spirit." },
    christmas: { citation: "John 1:1-18", text: "In the beginning was the Word, and the Word was with God. The Word became flesh and made his dwelling among us." },
    lent: { citation: "Matthew 6:1-6, 16-18", text: "Be careful not to practice your righteousness in front of others. When you give to the needy, do not let your left hand know." },
    easter: { citation: "John 20:1-9", text: "Peter and the other disciple started for the tomb. The other disciple outran Peter and reached the tomb first." },
    ordinary: { citation: "Matthew 5:1-12", text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven." },
  };

  const readings = [
    { type: "first-reading", title: "First Reading", citation: FIRST_READING[key].citation, text: FIRST_READING[key].text },
    { type: "responsorial-psalm", title: "Responsorial Psalm", citation: PSALM[key].citation, text: PSALM[key].text },
    { type: "gospel", title: "Gospel", citation: GOSPEL[key].citation, text: GOSPEL[key].text },
  ];

  return {
    date: date.toISOString().split("T")[0],
    weekday: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    celebration: `${season.label} — Year ${liturgicalYear}`,
    season: season.label,
    liturgicalYear,
    readings,
    source: "seasonal-fallback",
    usccbLink: "",
  };
}

function getLocalReadingByLang(dateKey, lang, version) {
  const year = parseInt(dateKey.split("-")[0], 10);
  if (lang === "sw" || version === "sw" || version === "swahili") {
    // Use in-memory cache for Swahili DB too (avoid reading disk on every request)
    const swKey = `sw-${year}`;
    if (localCache[swKey] === undefined) {
      const filePath = join(LOCAL_DATA_DIR, `readings-${year}-sw.json`);
      if (!existsSync(filePath)) {
        localCache[swKey] = null;
      } else {
        try {
          localCache[swKey] = JSON.parse(readFileSync(filePath, "utf8"));
        } catch {
          localCache[swKey] = null;
        }
      }
    }
    return localCache[swKey]?.[dateKey] || getLocalReading(dateKey, version);
  }
  return getLocalReading(dateKey, version);
}

export const getReadings = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split("T")[0];
    const lang = req.query.lang || "en";
    const version = req.query.version || null; // drb, web, sw
    const date = new Date(dateStr + "T12:00:00");

    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date parameter" });
    }

    // 1. Try local database first (instant, no external calls)
    const localData = getLocalReadingByLang(dateStr, lang, version);
    if (localData) {
      // Add psalm responses if not already present
      if (localData.readings) {
        localData.readings = localData.readings.map((r) => {
          if (r.type === "responsorial-psalm") {
            // Always override psalm response with language-appropriate version
            const resp = getPsalmResponse(r.citation, lang === "sw" || version === "sw" || version === "swahili" ? "sw" : "en");
            if (resp) return { ...r, response: resp };
          }
          return r;
        });
      }
      const source = version === "web" ? "WEB" : version === "sw" || version === "swahili" ? "Swahili" : "DRB";
      logger.info(`Serving readings from local database (${source}): ${dateStr}`);
      return res.json(localData);
    }

    // 2. Try Catholic Readings API + Bible API
    const catholicData = await fetchFromCatholicReadingsAPI(date);
    if (catholicData) {
      return res.json(catholicData);
    }

    // 3. Generic seasonal fallback
    const season = getLiturgicalSeason(date);
    const liturgicalYear = getLiturgicalYear(date);
    const fallbackData = buildGenericReadings(date, season, liturgicalYear);
    logger.info(`Using seasonal fallback for ${dateStr}`);

    return res.json(fallbackData);
  } catch (err) {
    logger.error(`Readings controller error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLiturgicalCalendar = async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const now = Date.now();

    if (
      calendarCache.date === today &&
      now - calendarCache.fetchedAt < CALENDAR_CACHE_TTL_MS &&
      calendarCache.data
    ) {
      return res.json(calendarCache.data);
    }

    const result = await fetchCalendarJSON();
    if (result.ok) {
      calendarCache.date = today;
      calendarCache.data = result.data;
      calendarCache.fetchedAt = now;
      return res.json(result.data);
    }

    if (calendarCache.data) {
      logger.warn("Liturgical calendar upstream unreachable; serving stale cache");
      return res.json(calendarCache.data);
    }

    logger.error("Liturgical calendar upstream unreachable and no cache available");
    return res.status(502).json({ error: "Liturgical calendar unavailable" });
  } catch (err) {
    logger.error(`Liturgical calendar controller error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
