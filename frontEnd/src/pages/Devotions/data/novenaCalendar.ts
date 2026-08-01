/**
 * Catholic Novena Calendar — Full Year
 * Fixed-date novenas use month/day. Movable-date novenas compute from Easter.
 * The calendar is generated dynamically for any given year.
 */
import { calculateEaster, addDays } from "./liturgicalCalendar";

export interface NovenaEvent {
  id: string;
  title: string;
  novenaId: string;          // links to NOVENAS array in novenas.ts
  intention: string;
  startMonth: number;        // 0-indexed
  startDay: number;
  endMonth: number;
  endDay: number;
  movable: boolean;          // true = computed from Easter
  offsetFromEaster?: number; // negative = before Easter, positive = after
  color: string;
  feastDay?: string;         // e.g., "Feast of St. Lawrence"
}

// Helper to create date from month (1-12) and day
function md(month: number, day: number): { startMonth: number; startDay: number } {
  return { startMonth: month - 1, startDay: day };
}

/**
 * All Catholic novenas through the liturgical year.
 * Movable ones are marked with movable:true and offsetFromEaster.
 * offsetFromEaster is the START day offset from Easter Sunday.
 * End is always start + 8 (9 days total).
 */
export const NOVENA_CALENDAR: NovenaEvent[] = [
  // ── JANUARY ──
  {
    id: "cal-christ-unity",
    title: "Novena for Christian Unity",
    novenaId: "novenas-christian-unity", intention: "Unity among all Christians",
    ...md(1, 18), movable: false,
    color: "from-slate-500 to-blue-600",
    feastDay: "Week of Prayer for Christian Unity",
  },
  {
    id: "cal-holy-name",
    title: "Novena to the Holy Name of Jesus",
    novenaId: "novenas-holy-name-jesus", intention: "Reverence for the name of Jesus",
    ...md(1, 1), movable: false,
    color: "from-yellow-500 to-amber-600",
    feastDay: "Feast of the Holy Name of Jesus",
  },

  // ── FEBRUARY ──
  {
    id: "cal-lourdes",
    title: "Novena to Our Lady of Lourdes",
    novenaId: "novenas-lady-of-lourdes", intention: "Healing and Marian devotion",
    ...md(2, 2), movable: false,
    color: "from-sky-500 to-blue-600",
    feastDay: "Feast of Our Lady of Lourdes",
  },

  // ── MARCH ──
  {
    id: "cal-joseph",
    title: "Novena to Saint Joseph",
    novenaId: "novenas-saint-joseph", intention: "Family protection and work",
    ...md(3, 10), movable: false,
    color: "from-emerald-500 to-teal-600",
    feastDay: "Solemnity of Saint Joseph",
  },
  {
    id: "cal-annunciation",
    title: "Novena before the Annunciation",
    novenaId: "novenas-annunciation", intention: "Mary's yes to God",
    ...md(3, 11), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of the Annunciation",
  },

  // ── HOLY WEEK / EASTER (movable) ──
  {
    id: "cal-divine-mercy",
    title: "Novena to Divine Mercy",
    novenaId: "novenas-divine-mercy", intention: "God's mercy for all souls",
    offsetFromEaster: -2, movable: true,
    color: "from-sky-500 to-cyan-600",
    feastDay: "Divine Mercy Sunday",
  },
  {
    id: "cal-holy-spirit",
    title: "Novena to the Holy Spirit",
    novenaId: "novenas-holy-spirit", intention: "Outpouring of the Holy Spirit",
    offsetFromEaster: 43, movable: true,
    color: "from-indigo-500 to-blue-600",
    feastDay: "Pentecost Sunday",
  },

  // ── MAY ──
  {
    id: "cal-joseph-worker",
    title: "Novena to Saint Joseph the Worker",
    novenaId: "novenas-saint-joseph", intention: "Dignity of work",
    ...md(5, 1), movable: false,
    color: "from-amber-500 to-orange-600",
    feastDay: "Feast of Saint Joseph the Worker",
  },
  {
    id: "cal-fatima",
    title: "Novena to Our Lady of Fatima",
    novenaId: "novenas-our-lady-of-fatima", intention: "Peace, conversion, and the Rosary",
    ...md(5, 4), movable: false,
    color: "from-green-500 to-yellow-500",
    feastDay: "Feast of Our Lady of Fatima",
  },

  // ── JUNE ──
  {
    id: "cal-sacred-heart",
    title: "Novena to the Sacred Heart",
    novenaId: "novenas-sacred-heart", intention: "Love and reparation",
    offsetFromEaster: 57, movable: true,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of the Sacred Heart",
  },
  {
    id: "cal-anthony",
    title: "Novena to Saint Anthony",
    novenaId: "novenas-saint-antonius", intention: "Lost items and special needs",
    ...md(6, 4), movable: false,
    color: "from-amber-500 to-orange-500",
    feastDay: "Feast of Saint Anthony of Padua",
  },
  {
    id: "cal-perpetual-help",
    title: "Novena to Our Lady of Perpetual Help",
    novenaId: "novenas-our-lady-perpetual-help", intention: "Constant assistance in all necessities",
    ...md(6, 18), movable: false,
    color: "from-red-500 to-pink-500",
    feastDay: "Feast of Our Lady of Perpetual Help",
  },

  // ── JULY ──
  {
    id: "cal-mary-mountain",
    title: "Novena to Our Lady of Mount Carmel",
    novenaId: "novenas-lady-mount-carmel", intention: "Scapular devotion and protection",
    ...md(7, 7), movable: false,
    color: "from-amber-500 to-brown-600",
    feastDay: "Feast of Our Lady of Mount Carmel",
  },
  {
    id: "cal-magdalene",
    title: "Novena to Saint Mary Magdalene",
    novenaId: "novenas-mary-magdalene", intention: "Conversion and repentance",
    ...md(7, 15), movable: false,
    color: "from-rose-500 to-pink-600",
    feastDay: "Feast of Saint Mary Magdalene",
  },

  // ── AUGUST ──
  {
    id: "cal-assumption",
    title: "Novena to the Assumption of Mary",
    novenaId: "novenas-assumption", intention: "Marian devotion",
    ...md(8, 7), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Solemnity of the Assumption",
  },
  {
    id: "cal-monica",
    title: "Novena to Saint Monica",
    novenaId: "novenas-saint-monica", intention: "Conversion of family members",
    ...md(8, 19), movable: false,
    color: "from-purple-500 to-violet-600",
    feastDay: "Feast of Saint Monica",
  },

  // ── SEPTEMBER ──
  {
    id: "cal-sorrows",
    title: "Novena to Our Lady of Sorrows",
    novenaId: "novenas-lady-sorrows", intention: "Compassion and healing through Mary's sorrows",
    ...md(9, 7), movable: false,
    color: "from-purple-500 to-indigo-600",
    feastDay: "Feast of Our Lady of Sorrows",
  },
  {
    id: "cal-padre-pio",
    title: "Novena to Saint Padre Pio",
    novenaId: "novenas-saint-padre-pio", intention: "Healing and spiritual warfare",
    ...md(9, 14), movable: false,
    color: "from-amber-600 to-yellow-600",
    feastDay: "Feast of Saint Padre Pio",
  },
  {
    id: "cal-holy-angels",
    title: "Novena to the Holy Guardian Angels",
    novenaId: "novenas-holy-angels", intention: "Angel protection and guidance",
    ...md(9, 23), movable: false,
    color: "from-sky-500 to-indigo-500",
    feastDay: "Feast of the Guardian Angels",
  },
  {
    id: "cal-michael",
    title: "Novena to Saint Michael the Archangel",
    novenaId: "novenas-saint-michael", intention: "Protection from evil",
    ...md(9, 20), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saints Michael, Gabriel, and Raphael",
  },
  {
    id: "cal-therese",
    title: "Novena to Saint Thérèse of Lisieux",
    novenaId: "novenas-saint-therese", intention: "The Little Way of spiritual childhood",
    ...md(9, 22), movable: false,
    color: "from-pink-500 to-rose-600",
    feastDay: "Feast of Saint Thérèse of Lisieux",
  },

  // ── OCTOBER ──
  {
    id: "cal-rosary",
    title: "Rosary Novena",
    novenaId: "novenas-rosary", intention: "Marian devotion through the Rosary",
    ...md(10, 1), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of the Holy Rosary",
  },
  {
    id: "cal-francis",
    title: "Novena to Saint Francis of Assisi",
    novenaId: "novenas-saint-francis", intention: "Peace, poverty, and care for creation",
    ...md(9, 25), movable: false,
    color: "from-amber-500 to-emerald-600",
    feastDay: "Feast of Saint Francis of Assisi",
  },
  {
    id: "cal-teresa",
    title: "Novena to Saint Teresa of Avila",
    novenaId: "novenas-saint-teresa", intention: "Prayer and contemplation",
    ...md(10, 6), movable: false,
    color: "from-rose-500 to-red-600",
    feastDay: "Feast of Saint Teresa of Avila",
  },
  {
    id: "cal-jude",
    title: "Novena to Saint Jude (Hopeless Causes)",
    novenaId: "novenas-saint-jude", intention: "Desperate and impossible causes",
    ...md(10, 19), movable: false,
    color: "from-amber-500 to-orange-600",
    feastDay: "Feast of Saints Simon and Jude",
  },
  {
    id: "cal-all-saints",
    title: "Novena to All Saints",
    novenaId: "novenas-all-saints", intention: "Intercession of all the saints",
    ...md(10, 23), movable: false,
    color: "from-rose-500 to-amber-600",
    feastDay: "Solemnity of All Saints",
  },
  {
    id: "cal-christ-king",
    title: "Novena to Christ the King",
    novenaId: "novenas-christ-the-king", intention: "Christ's sovereignty over all",
    offsetFromEaster: 270, movable: true,
    color: "from-red-500 to-purple-600",
    feastDay: "Solemnity of Christ the King",
  },

  // ── NOVEMBER ──
  {
    id: "cal-all-souls",
    title: "Novena for the Holy Souls in Purgatory",
    novenaId: "novenas-holy-souls", intention: "Prayers for the faithful departed",
    ...md(10, 24), movable: false,
    color: "from-slate-600 to-purple-700",
    feastDay: "All Souls' Day",
  },
  {
    id: "cal-martin",
    title: "Novena to Saint Martin de Porres",
    novenaId: "novenas-saint-martin", intention: "Racial justice and healing",
    ...md(11, 3), movable: false,
    color: "from-emerald-500 to-teal-600",
    feastDay: "Feast of Saint Martin de Porres",
  },
  {
    id: "cal-cecilia",
    title: "Novena to Saint Cecilia",
    novenaId: "novenas-saint-cecilia", intention: "Musicians and sacred music",
    ...md(11, 13), movable: false,
    color: "from-violet-500 to-purple-500",
    feastDay: "Feast of Saint Cecilia",
  },
  {
    id: "cal-victory",
    title: "Novena to Our Lady of Victory",
    novenaId: "novenas-our-lady-of-victory", intention: "Victory over evil and spiritual bondage",
    ...md(11, 18), movable: false,
    color: "from-red-500 to-indigo-600",
    feastDay: "Feast of the Dedication of the Basilicas",
  },

  // ── DECEMBER ──
  {
    id: "cal-advent",
    title: "Advent Novena",
    novenaId: "novenas-advent", intention: "Preparation for Christmas",
    ...md(12, 16), movable: false,
    color: "from-purple-500 to-indigo-600",
    feastDay: "Christmas Day",
  },
  {
    id: "cal-holy-family",
    title: "Novena to the Holy Family",
    novenaId: "novenas-holy-family", intention: "Family unity and harmony",
    ...md(12, 17), movable: false,
    color: "from-amber-500 to-yellow-600",
    feastDay: "Feast of the Holy Family",
  },
  {
    id: "cal-holy-infant",
    title: "Novena to the Holy Infant of Prague",
    novenaId: "novenas-holy-infant", intention: "Childlike trust in God",
    ...md(12, 16), movable: false,
    color: "from-yellow-500 to-amber-600",
    feastDay: "Feast of the Holy Name of Jesus",
  },
];

/**
 * Compute actual dates for a given year.
 * Returns the calendar with real Date objects.
 */
export function getNovenaCalendar(year: number): (NovenaEvent & { startDate: Date; endDate: Date })[] {
  const easter = calculateEaster(year);

  return NOVENA_CALENDAR.map((event) => {
    let startDate: Date;
    if (event.movable && event.offsetFromEaster !== undefined) {
      startDate = addDays(easter, event.offsetFromEaster);
    } else {
      startDate = new Date(year, event.startMonth, event.startDay);
    }
    const endDate = addDays(startDate, 8); // 9 days total
    return { ...event, startDate, endDate };
  });
}

/**
 * Get novenas happening around a specific date (within ±15 days).
 */
export function getUpcomingNovenas(year: number, date: Date): (NovenaEvent & { startDate: Date; endDate: Date; isActive: boolean; daysUntilStart: number })[] {
  const calendar = getNovenaCalendar(year);
  const target = date.getTime();
  const range = 15 * 24 * 60 * 60 * 1000; // 15 days in ms

  return calendar
    .map((event) => {
      const startMs = event.startDate.getTime();
      const endMs = event.endDate.getTime();
      const daysUntilStart = Math.ceil((startMs - target) / (24 * 60 * 60 * 1000));
      const isActive = target >= startMs && target <= endMs;
      return { ...event, isActive, daysUntilStart };
    })
    .filter((event) => {
      const dist = Math.abs(event.startDate.getTime() - target);
      return dist <= range || event.isActive;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Get novenas for a specific month (0-indexed).
 */
export function getNovenasForMonth(year: number, month: number): (NovenaEvent & { startDate: Date; endDate: Date })[] {
  return getNovenaCalendar(year).filter((event) => {
    return event.startDate.getMonth() === month || event.endDate.getMonth() === month;
  });
}

/**
 * Format a novena date range.
 */
export function formatNovenaDates(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}
