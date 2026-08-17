export type LiturgicalSeasonName =
  | "Advent"
  | "Christmas"
  | "Lent"
  | "Triduum"
  | "Easter"
  | "Ordinary Time";

export interface LiturgicalDay {
  season: LiturgicalSeasonName;
  color: string;
  colorHex: string;
  seasonStart: Date;
  seasonEnd: Date;
  seasonWeek: number;
  celebration?: string;
  isSunday: boolean;
  isHolyDay: boolean;
}

export interface SeasonInfo {
  name: LiturgicalSeasonName;
  label: string;
  color: string;
  colorHex: string;
  description: string;
  icon: string;
  start: Date;
  end: Date;
}

const SEASONS: Record<LiturgicalSeasonName, { color: string; colorHex: string; description: string; icon: string }> = {
  Advent: { color: "purple", colorHex: "#7B2D8E", description: "A season of expectant waiting and preparation for the coming of Christ", icon: "" },
  Christmas: { color: "white", colorHex: "#F5E6CC", description: "Celebrating the birth of our Lord Jesus Christ", icon: "" },
  Lent: { color: "purple", colorHex: "#6B3A5A", description: "A season of repentance, fasting, and preparation for Easter", icon: "" },
  Triduum: { color: "white", colorHex: "#FFF5E6", description: "The sacred three days: Holy Thursday, Good Friday, Holy Saturday", icon: "" },
  Easter: { color: "white", colorHex: "#FFF8E7", description: "Celebrating the Resurrection of Jesus Christ", icon: "" },
  "Ordinary Time": { color: "green", colorHex: "#2D8E5A", description: "The season of growth in the life and teachings of Christ", icon: "" },
};

export function calculateEaster(year: number): Date {
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

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getLiturgicalKeyDates(year: number) {
  const easter = calculateEaster(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const pentecost = addDays(easter, 49);
  const trinitySunday = addDays(easter, 56);
  const corpusChristi = addDays(easter, 60);
  const firstSundayAdvent = (() => {
    const christmas = new Date(year, 11, 25);
    const dayOfWeek = christmas.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 35 : 36 - dayOfWeek;
    return addDays(christmas, -daysToSubtract);
  })();
  const epiphany = new Date(year, 0, 6);
  const baptismLord = epiphany.getDay() === 0 ? addDays(epiphany, 7) : addDays(epiphany, 7 - epiphany.getDay() + 7);

  return {
    ashWednesday,
    palmSunday,
    holyThursday,
    goodFriday,
    holySaturday,
    easter,
    pentecost,
    trinitySunday,
    corpusChristi,
    firstSundayAdvent,
    epiphany,
    baptismLord,
  };
}

export function getLiturgicalSeason(date: Date): SeasonInfo {
  const year = date.getFullYear();
  const dates = getLiturgicalKeyDates(year);
  const prevDates = getLiturgicalKeyDates(year - 1);

  const endOfChristmas = addDays(year === dates.epiphany.getFullYear() ? dates.baptismLord : new Date(year, 0, 13), 0);
  const startOfOrdinary1 = addDays(endOfChristmas, 1);
  const endOfOrdinary1 = addDays(dates.ashWednesday, -1);
  const endOfAdvent = addDays(dates.firstSundayAdvent, -1);

  const inRange = (d: Date, start: Date, end: Date) => {
    const t = d.getTime();
    return t >= start.getTime() && t <= end.getTime();
  };

  if (date.getMonth() === 11 && date >= dates.firstSundayAdvent) {
    return wrap("Advent", dates.firstSundayAdvent, new Date(year, 11, 24));
  }
  if (date.getMonth() === 0 && date < startOfOrdinary1 && date <= new Date(year, 0, 12)) {
    if (prevDates.firstSundayAdvent.getFullYear() === year || date <= new Date(year, 0, 6)) {
      return wrap("Advent", prevDates.firstSundayAdvent, endOfAdvent);
    }
    return wrap("Christmas", new Date(year, 11, 25), endOfChristmas, date);
  }

  if (date.getMonth() === 11 && date < dates.firstSundayAdvent) {
    return wrap("Ordinary Time", startOfOrdinary1 || new Date(year, 0, 14), endOfAdvent);
  }

  if (inRange(date, new Date(year, 0, 25), addDays(dates.ashWednesday, -1))) {
    return wrap("Ordinary Time", new Date(year, 0, 14), endOfOrdinary1);
  }

  if (inRange(date, dates.ashWednesday, addDays(dates.holyThursday, -1))) {
    return wrap("Lent", dates.ashWednesday, addDays(dates.holySaturday, -1));
  }

  if (inRange(date, dates.holyThursday, dates.holySaturday)) {
    return wrap("Triduum", dates.holyThursday, dates.holySaturday);
  }

  if (inRange(date, dates.easter, addDays(dates.pentecost, -1))) {
    return wrap("Easter", dates.easter, addDays(dates.pentecost, -1));
  }

  return wrap("Ordinary Time", addDays(dates.pentecost, 1), addDays(dates.firstSundayAdvent, -1));

  function wrap(season: LiturgicalSeasonName, start: Date, end: Date, _check?: Date): SeasonInfo {
    const info = SEASONS[season];
    return {
      name: season,
      label: season,
      color: info.color,
      colorHex: info.colorHex,
      description: info.description,
      icon: info.icon,
      start,
      end,
    };
  }
}

export function getLiturgicalColorHex(season: LiturgicalSeasonName): string {
  return SEASONS[season].colorHex;
}

export function getSeasonWeek(date: Date, season: SeasonInfo): number {
  const diff = date.getTime() - season.start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function getLiturgicalYear(date: Date): string {
  const year = date.getFullYear();
  const cycle = (year - 2014) % 3;
  return cycle === 0 ? "A" : cycle === 1 ? "B" : "C";
}

export function getDaysUntil(date: Date, target: Date): number {
  return Math.ceil((target.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUpcomingFeasts(date: Date): { name: string; date: Date; daysUntil: number }[] {
  const year = date.getFullYear();
  const d = getLiturgicalKeyDates(year);
  const nd = getLiturgicalKeyDates(year + 1);

  const feasts: { name: string; date: Date }[] = [
    { name: "Ash Wednesday", date: d.ashWednesday },
    { name: "Palm Sunday", date: d.palmSunday },
    { name: "Holy Thursday", date: d.holyThursday },
    { name: "Good Friday", date: d.goodFriday },
    { name: "Easter Sunday", date: d.easter },
    { name: "Ascension", date: addDays(d.easter, 39) },
    { name: "Pentecost", date: d.pentecost },
    { name: "Trinity Sunday", date: d.trinitySunday },
    { name: "Corpus Christi", date: d.corpusChristi },
    { name: "1st Sunday of Advent", date: d.firstSundayAdvent },
    { name: "Christmas", date: new Date(year, 11, 25) },
    { name: "Ash Wednesday (next)", date: nd.ashWednesday },
    { name: "Easter (next)", date: nd.easter },
  ];

  return feasts
    .map((f) => ({ ...f, daysUntil: getDaysUntil(date, f.date) }))
    .filter((f) => f.daysUntil >= 0 && f.daysUntil < 365)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);
}
