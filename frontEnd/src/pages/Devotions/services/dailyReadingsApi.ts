import type { DailyReadings } from "../data/readingsData";
import { buildFallbackReadings, getCachedReadings, cacheReadings } from "../data/readingsData";
import { getLiturgicalSeason, getLiturgicalYear } from "../data/liturgicalCalendar";

import { BASE_URL } from "../../../api/config";

const API_BASE = BASE_URL;
const FETCH_TIMEOUT = 8000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export type BibleVersion = "drb" | "web" | "sw";

export interface BibleVersionInfo {
  id: BibleVersion;
  name: string;
  fullName: string;
  description: string;
  lang: string;
}

export const BIBLE_VERSIONS: BibleVersionInfo[] = [
  {
    id: "drb",
    name: "Douay-Rheims",
    fullName: "Douay-Rheims Catholic Bible",
    description: "Traditional Catholic English translation (1582/1610). Classic, reverent, and widely used in Catholic devotion.",
    lang: "en",
  },
  {
    id: "web",
    name: "World English",
    fullName: "World English Bible (WEB)",
    description: "Modern public domain English translation. Easy to read with contemporary language while remaining faithful to the original texts.",
    lang: "en",
  },
  {
    id: "sw",
    name: "Kiswahili",
    fullName: "Biblia Takatifu — Kiswahili",
    description: "Full Kiswahili translation of the daily Mass readings. For our Kiswahili-speaking faithful.",
    lang: "sw",
  },
];

async function fetchFromBackend(date: Date, lang = "en", version?: BibleVersion): Promise<DailyReadings | null> {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const versionParam = version ? `&version=${version}` : "";
    const response = await fetchWithTimeout(`${API_BASE}/readings?date=${dateStr}&lang=${lang}${versionParam}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.readings?.length > 0) {
      return data as DailyReadings;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getDailyReadings(date?: Date, lang = "en", version?: BibleVersion): Promise<DailyReadings> {
  const targetDate = date || new Date();
  const versionKey = version || "drb";
  const dateKey = `${targetDate.toISOString().split("T")[0]}-${lang}-${versionKey}`;

  const cached = getCachedReadings();
  if (cached && cached.date === dateKey) {
    return cached;
  }

  const season = getLiturgicalSeason(targetDate);
  const liturgicalYear = getLiturgicalYear(targetDate);

  const backendData = await fetchFromBackend(targetDate, lang, version);
  if (backendData) {
    backendData.date = dateKey;
    cacheReadings(backendData);
    return backendData;
  }

  const celebration = `${targetDate.toLocaleDateString("en-US", { weekday: "long" })} — ${season.label}`;
  const fallback = buildFallbackReadings(targetDate, season.label, celebration);
  fallback.liturgicalYear = liturgicalYear;
  fallback.date = dateKey;
  cacheReadings(fallback);
  return fallback;
}

export function getNextSunday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 7 : 7 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getTomorrow(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export interface ReadingSource {
  name: string;
  url: string;
  type: "api" | "scrape" | "feed" | "manual";
  description: string;
}

export const READING_SOURCES: ReadingSource[] = [
  {
    name: "USCCB Daily Readings",
    url: "https://bible.usccb.org/bible/readings",
    type: "scrape",
    description: "Official daily Mass readings from the United States Conference of Catholic Bishops. The most authoritative source for the Roman Catholic liturgical readings in English.",
  },
  {
    name: "iBreviary",
    url: "https://www.ibreviary.com/m/messale.php",
    type: "api",
    description: "Online breviary and missal providing the full Liturgy of the Hours and daily Mass readings in multiple languages.",
  },
  {
    name: "Catholic.org Daily Readings",
    url: "https://www.catholic.org/bible/daily_reading/",
    type: "scrape",
    description: "Daily Mass readings with commentary and reflection.",
  },
  {
    name: "AELF (Association Épiscopale Liturgique)",
    url: "https://www.aelf.org/",
    type: "api",
    description: "Official liturgical service of the French bishops providing daily Mass readings in multiple languages (French, English, Spanish, Italian).",
  },
  {
    name: "Universalis",
    url: "https://www.universalis.com/",
    type: "api",
    description: "Daily Mass readings, Liturgy of the Hours, and saint of the day with calendar integration.",
  },
];
