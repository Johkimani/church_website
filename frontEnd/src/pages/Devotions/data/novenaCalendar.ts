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

  // ── APRIL ──
  {
    id: "cal-catherine",
    title: "Novena to Saint Catherine of Siena",
    novenaId: "novenas-saint-catherine-siena", intention: "Courage and dialogue",
    ...md(4, 20), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of Saint Catherine of Siena (Apr 29)",
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
    feastDay: "Feast of Saint Anthony of Padua (Jun 13)",
  },
  {
    id: "cal-mary-goretti",
    title: "Novena to Saint Mary Goretti",
    novenaId: "novenas-saint-mary-goretti", intention: "Purity, forgiveness, and youth",
    ...md(6, 27), movable: false,
    color: "from-pink-500 to-rose-600",
    feastDay: "Feast of Saint Maria Goretti (Jul 6)",
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
  {
    id: "cal-dominic",
    title: "Novena to Saint Dominic",
    novenaId: "novenas-saint-dominic", intention: "Preaching and truth",
    ...md(7, 30), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saint Dominic (Aug 8)",
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
    feastDay: "Feast of Saint Monica (Aug 27)",
  },
  {
    id: "cal-augustine",
    title: "Novena to Saint Augustine",
    novenaId: "novenas-saint-augustine", intention: "Conversion and wisdom",
    ...md(8, 19), movable: false,
    color: "from-yellow-500 to-amber-600",
    feastDay: "Feast of Saint Augustine (Aug 28)",
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
    id: "cal-elizabeth",
    title: "Novena to Saint Elizabeth of Hungary",
    novenaId: "novenas-saint-elizabeth", intention: "Charity and service to the poor",
    ...md(11, 8), movable: false,
    color: "from-emerald-500 to-teal-600",
    feastDay: "Feast of Saint Elizabeth of Hungary (Nov 17)",
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
  // ═══════════════════════════════════════════════════════════════
  // BATCH 9 — novenaPrayers9.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-guadalupe",
    title: "Novena to Our Lady of Guadalupe",
    novenaId: "novenas-our-lady-of-guadalupe", intention: "Conversion and intercession of Our Lady",
    ...md(12, 4), movable: false,
    color: "from-emerald-500 to-green-600",
    feastDay: "Feast of Our Lady of Guadalupe (Dec 12)",
  },
  {
    id: "cal-holy-cross",
    title: "Novena to the Holy Cross",
    novenaId: "novenas-holy-cross", intention: "Faith, courage, and reverence for the Cross",
    ...md(9, 6), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of the Exaltation of the Holy Cross (Sep 14)",
  },
  {
    id: "cal-saint-patrick",
    title: "Novena to Saint Patrick",
    novenaId: "novenas-saint-patrick", intention: "Faith, evangelization, and protection",
    ...md(3, 10), movable: false,
    color: "from-green-500 to-emerald-600",
    feastDay: "Feast of Saint Patrick (Mar 17)",
  },
  {
    id: "cal-saint-raphael",
    title: "Novena to Saint Raphael",
    novenaId: "novenas-saint-raphael", intention: "Healing and safe travels",
    ...md(9, 23), movable: false,
    color: "from-cyan-500 to-blue-600",
    feastDay: "Feast of Saints Michael, Gabriel, and Raphael (Sep 29)",
  },
  // ═══════════════════════════════════════════════════════════════
  // BATCH 10 — novenaPrayers10.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-saint-clare",
    title: "Novena to Saint Clare of Assisi",
    novenaId: "novenas-saint-clare", intention: "Poverty, purity, and Eucharistic devotion",
    ...md(8, 3), movable: false,
    color: "from-amber-500 to-yellow-600",
    feastDay: "Feast of Saint Clare (Aug 11)",
  },
  {
    id: "cal-immaculate-conception",
    title: "Novena to the Immaculate Conception",
    novenaId: "novenas-immaculate-conception", intention: "Purity and Marian devotion",
    ...md(11, 29), movable: false,
    color: "from-blue-500 to-sky-600",
    feastDay: "Solemnity of the Immaculate Conception (Dec 8)",
  },
  {
    id: "cal-precious-blood",
    title: "Novena to the Precious Blood of Jesus",
    novenaId: "novenas-precious-blood", intention: "Remission of sins and spiritual healing",
    ...md(6, 25), movable: false,
    color: "from-red-600 to-rose-700",
    feastDay: "Feast of the Precious Blood (Jul 1)",
  },

  // ═══════════════════════════════════════════════════════════════
  // BATCH 11 — novenaPrayers11.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-michael-archangel",
    title: "Novena to Saint Michael the Archangel",
    novenaId: "novenas-saint-michael-archangel", intention: "Protection from evil and spiritual warfare",
    ...md(9, 21), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saint Michael the Archangel (Sep 29)",
  },
  {
    id: "cal-gabriel",
    title: "Novena to Saint Gabriel the Archangel",
    novenaId: "novenas-saint-gabriel", intention: "Communication and God's messages",
    ...md(3, 18), movable: false,
    color: "from-sky-500 to-cyan-600",
    feastDay: "Feast of Saint Gabriel the Archangel (Mar 27)",
  },
  {
    id: "cal-ursula",
    title: "Novena to Saint Ursula",
    novenaId: "novenas-saint-ursula", intention: "Youth, courage, and purity",
    ...md(10, 15), movable: false,
    color: "from-pink-500 to-rose-600",
    feastDay: "Feast of Saint Ursula (Oct 21)",
  },
  {
    id: "cal-anthony-patron",
    title: "Novena to Saint Anthony, Patron of the Poor",
    novenaId: "novenas-saint-anthony-patron", intention: "Charity and aid for the poor",
    ...md(6, 5), movable: false,
    color: "from-amber-500 to-orange-500",
    feastDay: "Feast of Saint Anthony of Padua (Jun 13)",
  },
  {
    id: "cal-clement",
    title: "Novena to Saint Clement",
    novenaId: "novenas-saint-clement", intention: "Unity and fidelity to the Church",
    ...md(11, 17), movable: false,
    color: "from-blue-500 to-indigo-500",
    feastDay: "Feast of Saint Clement (Nov 24)",
  },
  {
    id: "cal-lucy",
    title: "Novena to Saint Lucy",
    novenaId: "novenas-saint-lucy", intention: "Light of faith and protection of eyes",
    ...md(12, 4), movable: false,
    color: "from-yellow-500 to-amber-500",
    feastDay: "Feast of Saint Lucy (Dec 13)",
  },
  {
    id: "cal-barbara",
    title: "Novena to Saint Barbara",
    novenaId: "novenas-saint-barbara", intention: "Protection from storms and sudden death",
    ...md(11, 27), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of Saint Barbara (Dec 4)",
  },
  {
    id: "cal-ambrose",
    title: "Novena to Saint Ambrose",
    novenaId: "novenas-saint-ambrose", intention: "Preaching and pastoral care",
    ...md(11, 28), movable: false,
    color: "from-blue-500 to-sky-600",
    feastDay: "Feast of Saint Ambrose (Dec 7)",
  },
  {
    id: "cal-nicholas",
    title: "Novena to Saint Nicholas",
    novenaId: "novenas-saint-nicholas", intention: "Generosity and care for children",
    ...md(11, 29), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saint Nicholas (Dec 6)",
  },
  {
    id: "cal-elizabeth-ann-seton",
    title: "Novena to Saint Elizabeth Ann Seton",
    novenaId: "novenas-saint-elizabeth-ann-seton", intention: "Education and family life",
    ...md(1, 1), movable: false,
    color: "from-emerald-500 to-teal-600",
    feastDay: "Feast of Saint Elizabeth Ann Seton (Jan 4)",
  },

  // ═══════════════════════════════════════════════════════════════
  // BATCH 12 — novenaPrayers12.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-benedict",
    title: "Novena to Saint Benedict",
    novenaId: "novenas-saint-benedict", intention: "Monastic life and spiritual strength",
    ...md(3, 15), movable: false,
    color: "from-black to-slate-700",
    feastDay: "Feast of Saint Benedict (Mar 21)",
  },
  {
    id: "cal-hildegard",
    title: "Novena to Saint Hildegard of Bingen",
    novenaId: "novenas-saint-hildegard", intention: "Wisdom, healing, and creativity",
    ...md(9, 8), movable: false,
    color: "from-purple-500 to-violet-600",
    feastDay: "Feast of Saint Hildegard (Sep 17)",
  },
  {
    id: "cal-all-angels",
    title: "Novena to All Angels",
    novenaId: "novenas-all-angels", intention: "Angel intercession and heavenly guidance",
    ...md(9, 24), movable: false,
    color: "from-sky-500 to-indigo-500",
    feastDay: "Feast of the Guardian Angels (Oct 2)",
  },
  {
    id: "cal-mary-of-egypt",
    title: "Novena to Saint Mary of Egypt",
    novenaId: "novenas-saint-mary-of-egypt", intention: "Conversion and penance",
    ...md(3, 25), movable: false,
    color: "from-rose-500 to-red-600",
    feastDay: "Feast of Saint Mary of Egypt (Apr 3)",
  },
  {
    id: "cal-jesus-christ",
    title: "Novena to Jesus Christ",
    novenaId: "novenas-jesus-christ", intention: "From Ascension to Pentecost",
    offsetFromEaster: 39, movable: true,
    color: "from-red-500 to-rose-600",
    feastDay: "Ascension to Pentecost",
  },
  {
    id: "cal-holy-rosary",
    title: "Novena to the Holy Rosary",
    novenaId: "novenas-holy-rosary", intention: "Marian devotion through the Rosary",
    ...md(9, 29), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of the Holy Rosary (Oct 7)",
  },
  {
    id: "cal-rita",
    title: "Novena to Saint Rita of Cascia",
    novenaId: "novenas-saint-rita", intention: "Impossible causes and healing",
    ...md(5, 17), movable: false,
    color: "from-red-500 to-pink-600",
    feastDay: "Feast of Saint Rita (May 22)",
  },
  {
    id: "cal-charles-borromeo",
    title: "Novena to Saint Charles Borromeo",
    novenaId: "novenas-saint-charles-borromeo", intention: "Seminary life and pastoral care",
    ...md(10, 27), movable: false,
    color: "from-rose-500 to-red-600",
    feastDay: "Feast of Saint Charles Borromeo (Nov 4)",
  },
  {
    id: "cal-cyril-alexandria",
    title: "Novena to Saint Cyril of Alexandria",
    novenaId: "novenas-saint-cyril-alexandria", intention: "Christological truth and unity",
    ...md(1, 26), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saint Cyril of Alexandria (Jan 28)",
  },
  {
    id: "cal-bonaventure",
    title: "Novena to Saint Bonaventure",
    novenaId: "novenas-saint-bonaventure", intention: "Theology and Franciscan wisdom",
    ...md(7, 8), movable: false,
    color: "from-amber-500 to-yellow-600",
    feastDay: "Feast of Saint Bonaventure (Jul 15)",
  },

  // ═══════════════════════════════════════════════════════════════
  // BATCH 13 — novenaPrayers13.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-francis-xavier",
    title: "Novena to Saint Francis Xavier",
    novenaId: "novenas-saint-francis-xavier", intention: "Missions and evangelization",
    ...md(11, 27), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of Saint Francis Xavier (Dec 3)",
  },
  {
    id: "cal-ignatius-loyola",
    title: "Novena to Saint Ignatius of Loyola",
    novenaId: "novenas-saint-ignatius-loyola", intention: "Discernment and Jesuit spirituality",
    ...md(7, 24), movable: false,
    color: "from-indigo-500 to-purple-600",
    feastDay: "Feast of Saint Ignatius of Loyola (Jul 31)",
  },
  {
    id: "cal-teresa-avila",
    title: "Novena to Saint Teresa of Avila",
    novenaId: "novenas-saint-teresa-avila", intention: "Prayer and contemplation",
    ...md(9, 24), movable: false,
    color: "from-rose-500 to-red-600",
    feastDay: "Feast of Saint Teresa of Avila (Oct 15)",
  },
  {
    id: "cal-john-cross",
    title: "Novena to Saint John of the Cross",
    novenaId: "novenas-saint-john-cross", intention: "Mystical prayer and purification",
    ...md(11, 20), movable: false,
    color: "from-slate-600 to-black",
    feastDay: "Feast of Saint John of the Cross (Dec 14)",
  },
  {
    id: "cal-holy-martyrs",
    title: "Novena to the Holy Martyrs of Uganda",
    novenaId: "novenas-holy-martyrs", intention: "Courage and faith under persecution",
    ...md(5, 25), movable: false,
    color: "from-red-600 to-rose-700",
    feastDay: "Feast of the Ugandan Martyrs (Jun 3)",
  },
  {
    id: "cal-helen",
    title: "Novena to Saint Helen",
    novenaId: "novenas-saint-helen", intention: "Discovery of the True Cross",
    ...md(8, 6), movable: false,
    color: "from-purple-500 to-indigo-600",
    feastDay: "Feast of Saint Helen (Aug 18)",
  },
  {
    id: "cal-joachim-anne",
    title: "Novena to Saints Joachim and Anne",
    novenaId: "novenas-saint-joachim-anne", intention: "Parents of Mary and grandparents",
    ...md(7, 23), movable: false,
    color: "from-emerald-500 to-teal-600",
    feastDay: "Feast of Saints Joachim and Anne (Jul 26)",
  },
  {
    id: "cal-matthew",
    title: "Novena to Saint Matthew",
    novenaId: "novenas-saint-matthew", intention: "Evangelization and tax collectors' conversion",
    ...md(9, 17), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saint Matthew (Sep 21)",
  },
  {
    id: "cal-thomas-apostle",
    title: "Novena to Saint Thomas the Apostle",
    novenaId: "novenas-saint-thomas-apostle", intention: "Faith through doubt and missionary zeal",
    ...md(10, 28), movable: false,
    color: "from-sky-500 to-blue-600",
    feastDay: "Feast of Saint Thomas the Apostle (Dec 21)",
  },
  {
    id: "cal-luke",
    title: "Novena to Saint Luke the Evangelist",
    novenaId: "novenas-saint-luke", intention: "Art, medicine, and the Gospel",
    ...md(10, 12), movable: false,
    color: "from-emerald-500 to-green-600",
    feastDay: "Feast of Saint Luke (Oct 18)",
  },

  // ═══════════════════════════════════════════════════════════════
  // BATCH 14 — novenaPrayers14.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-peter-apostle",
    title: "Novena to Saint Peter the Apostle",
    novenaId: "novenas-saint-peter-apostle", intention: "Faith, keys of the Kingdom, and leadership",
    ...md(6, 21), movable: false,
    color: "from-yellow-500 to-amber-600",
    feastDay: "Feast of Saints Peter and Paul (Jun 29)",
  },
  {
    id: "cal-paul-apostle",
    title: "Novena to Saint Paul the Apostle",
    novenaId: "novenas-saint-paul-apostle", intention: "Missionary zeal and conversion",
    ...md(6, 21), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of Saints Peter and Paul (Jun 30)",
  },
  {
    id: "cal-james-apostle",
    title: "Novena to Saint James the Apostle",
    novenaId: "novenas-saint-james-apostle", intention: "Courage and pilgrimage",
    ...md(7, 20), movable: false,
    color: "from-amber-500 to-orange-600",
    feastDay: "Feast of Saint James (Jul 25)",
  },
  {
    id: "cal-andrew-apostle",
    title: "Novena to Saint Andrew the Apostle",
    novenaId: "novenas-saint-andrew-apostle", intention: "First-called and missionary zeal",
    ...md(11, 22), movable: false,
    color: "from-blue-500 to-indigo-600",
    feastDay: "Feast of Saint Andrew (Nov 30)",
  },
  {
    id: "cal-philip-apostle",
    title: "Novena to Saint Philip the Apostle",
    novenaId: "novenas-saint-philip-apostle", intention: "Witness and bringing others to Christ",
    ...md(5, 1), movable: false,
    color: "from-sky-500 to-blue-600",
    feastDay: "Feast of Saint Philip (May 3)",
  },
  {
    id: "cal-simon-apostle",
    title: "Novena to Saint Simon the Apostle",
    novenaId: "novenas-saint-simon-apostle", intention: "Zeal for the Gospel",
    ...md(10, 23), movable: false,
    color: "from-indigo-500 to-purple-600",
    feastDay: "Feast of Saints Simon and Jude (Oct 28)",
  },
  {
    id: "cal-jude-apostle",
    title: "Novena to Saint Jude the Apostle",
    novenaId: "novenas-saint-jude-apostle", intention: "Desperate and hopeless causes",
    ...md(10, 20), movable: false,
    color: "from-amber-500 to-orange-600",
    feastDay: "Feast of Saints Simon and Jude (Oct 28)",
  },
  {
    id: "cal-star-evangelization",
    title: "Novena to Our Lady, Star of Evangelization",
    novenaId: "novenas-our-lady-star-evangelization", intention: "Marian intercession for evangelization",
    ...md(11, 20), movable: false,
    color: "from-blue-500 to-sky-600",
    feastDay: "Feast of Our Lady, Star of Evangelization (Nov 29)",
  },
  {
    id: "cal-rose-lima",
    title: "Novena to Saint Rose of Lima",
    novenaId: "novenas-saint-rose-lima", intention: "Humility and prayer",
    ...md(8, 20), movable: false,
    color: "from-pink-500 to-rose-600",
    feastDay: "Feast of Saint Rose of Lima (Aug 30)",
  },
  {
    id: "cal-martin-de-porres",
    title: "Novena to Saint Martin de Porres",
    novenaId: "novenas-saint-martin-de-porres", intention: "Service to the poor and racial justice",
    ...md(11, 1), movable: false,
    color: "from-emerald-500 to-teal-600",
    feastDay: "Feast of Saint Martin de Porres (Nov 3)",
  },

  // ═══════════════════════════════════════════════════════════════
  // BATCH 15 — novenaPrayers15.ts
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cal-anne",
    title: "Novena to Saint Anne",
    novenaId: "novenas-saint-anne", intention: "Mother of Mary and grandmothers",
    ...md(7, 17), movable: false,
    color: "from-amber-500 to-yellow-600",
    feastDay: "Feast of Saint Anne (Jul 26)",
  },
  {
    id: "cal-celestine",
    title: "Novena to Saint Celestine",
    novenaId: "novenas-saint-celestine", intention: "Peace and contemplative life",
    ...md(5, 16), movable: false,
    color: "from-purple-500 to-violet-600",
    feastDay: "Feast of Saint Celestine (May 19)",
  },
  {
    id: "cal-brendan",
    title: "Novena to Saint Brendan the Navigator",
    novenaId: "novenas-saint-brendan", intention: "Courage in evangelization and exploration",
    ...md(5, 9), movable: false,
    color: "from-cyan-500 to-blue-600",
    feastDay: "Feast of Saint Brendan (May 16)",
  },
  {
    id: "cal-kateri",
    title: "Novena to Saint Kateri Tekakwitha",
    novenaId: "novenas-saint-kateri", intention: "Native American evangelization and purity",
    ...md(7, 8), movable: false,
    color: "from-green-500 to-emerald-600",
    feastDay: "Feast of Saint Kateri Tekakwitha (Jul 14)",
  },
  {
    id: "cal-oscar-romero",
    title: "Novena to Saint Oscar Romero",
    novenaId: "novenas-saint-oscar-romero", intention: "Justice, peace, and the marginalized",
    ...md(8, 10), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of Saint Oscar Romero (Aug 24)",
  },
  {
    id: "cal-all-saints-africa",
    title: "Novena to All Saints and Martyrs of Africa",
    novenaId: "novenas-all-saints-africa", intention: "African missions and martyrs' witness",
    ...md(2, 1), movable: false,
    color: "from-orange-500 to-amber-600",
    feastDay: "Martyrs of Uganda Memorial (Feb 6)",
  },
  {
    id: "cal-jesus-nazareth",
    title: "Novena to Jesus of Nazareth",
    novenaId: "novenas-jesus-nazareth", intention: "Deepening love for Christ's humanity",
    ...md(1, 1), movable: false,
    color: "from-amber-500 to-yellow-600",
    feastDay: "Feast of the Holy Name of Jesus (Jan 3)",
  },
  {
    id: "cal-reconciliation",
    title: "Novena to the Sacrament of Reconciliation",
    novenaId: "novenas-sacrament-reconciliation", intention: "Forgiveness and spiritual renewal",
    ...md(9, 14), movable: false,
    color: "from-purple-500 to-indigo-600",
    feastDay: "Feast of the Exaltation of the Holy Cross (Sep 14)",
  },
  {
    id: "cal-eucharist",
    title: "Novena to the Sacrament of the Eucharist",
    novenaId: "novenas-sacrament-eucharist", intention: "Eucharistic devotion and adoration",
    offsetFromEaster: 60, movable: true,
    color: "from-amber-500 to-yellow-600",
    feastDay: "Corpus Christi",
  },
  {
    id: "cal-holy-cross-passion",
    title: "Novena to the Holy Cross and Passion",
    novenaId: "novenas-holy-cross-passion", intention: "Reverence for the Cross and Christ's Passion",
    ...md(9, 22), movable: false,
    color: "from-red-500 to-rose-600",
    feastDay: "Feast of the Exaltation of the Holy Cross (Sep 14)",
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
