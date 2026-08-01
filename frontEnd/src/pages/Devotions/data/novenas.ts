import type { Prayer } from "./prayerCategories";

export interface PrayerDay {
  day: number;
  prayer: Prayer;
}

export interface Novena {
  id: string;
  title: string;
  description: string;
  category: "novenas";
  color: string;
  days: PrayerDay[];
}

function buildNovena(
  id: string,
  title: string,
  description: string,
  color: string,
  prayers: Prayer[]
): Novena {
  return {
    id,
    title,
    description,
    category: "novenas",
    color,
    days: prayers.map((p) => ({ day: p.day || 1, prayer: p })),
  };
}

// Import all prayers from the 7 batch files
import { NOVENA_PRAYERS } from "./novenaPrayers";
import { NOVENA_PRAYERS_2 } from "./novenaPrayers2";
import { NOVENA_PRAYERS_3 } from "./novenaPrayers3";
import { NOVENA_PRAYERS_4 } from "./novenaPrayers4";
import { NOVENA_PRAYERS_5 } from "./novenaPrayers5";
import { NOVENA_PRAYERS_6 } from "./novenaPrayers6";
import { NOVENA_PRAYERS_7 } from "./novenaPrayers7";

// Helper to filter prayers by novenaId
function getPrayers(novenaId: string): Prayer[] {
  return [
    ...NOVENA_PRAYERS,
    ...NOVENA_PRAYERS_2,
    ...NOVENA_PRAYERS_3,
    ...NOVENA_PRAYERS_4,
    ...NOVENA_PRAYERS_5,
    ...NOVENA_PRAYERS_6,
    ...NOVENA_PRAYERS_7,
  ].filter((p) => p.novenaId === novenaId);
}

export const NOVENAS: Novena[] = [
  // ═══════════════════════════════════════════════════════════════
  // BATCH 1 — Core novenas from novenaPrayers.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-holy-spirit",
    "Novena to the Holy Spirit",
    "Nine days invoking the seven gifts of the Holy Spirit — wisdom, understanding, counsel, fortitude, knowledge, piety, and fear of the Lord — for personal and Church renewal.",
    "from-indigo-500 to-blue-600",
    getPrayers("novenas-holy-spirit")
  ),
  buildNovena(
    "novenas-our-lady-perpetual-help",
    "Novena to Our Lady of Perpetual Help",
    "A beloved Marian novena seeking the powerful intercession of the Blessed Virgin Mary under her title of Perpetual Help in every necessity.",
    "from-rose-500 to-pink-600",
    getPrayers("novenas-our-lady-perpetual-help")
  ),
  buildNovena(
    "novenas-sacred-heart",
    "Novena to the Sacred Heart of Jesus",
    "Nine days consecrating ourselves to the burning, merciful love of the Sacred Heart of Jesus, King of all hearts.",
    "from-red-500 to-rose-600",
    getPrayers("novenas-sacred-heart")
  ),
  buildNovena(
    "novenas-saint-jude",
    "Novena to Saint Jude (Hopeless Causes)",
    "Invoke the powerful intercession of Saint Jude, patron of desperate and hopeless causes, for impossible situations.",
    "from-amber-500 to-orange-600",
    getPrayers("novenas-saint-jude")
  ),
  buildNovena(
    "novenas-saint-joseph",
    "Novena to Saint Joseph",
    "Nine days with Saint Joseph — protector of families, model of workers, patron of the dying — for all our temporal and spiritual needs.",
    "from-emerald-500 to-teal-600",
    getPrayers("novenas-saint-joseph")
  ),
  buildNovena(
    "novenas-divine-mercy",
    "Novena to Divine Mercy",
    "The nine-day novena dictated by Jesus to Saint Faustina, offering His mercy to every class of soul in the world.",
    "from-sky-500 to-cyan-600",
    getPrayers("novenas-divine-mercy")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 2 — Marian & Saint novenas from novenaPrayers2.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-lady-of-lourdes",
    "Novena to Our Lady of Lourdes",
    "Nine days of healing grace through the intercession of Our Lady of Lourdes, who appeared at the grotto of Massabielle to bring forth waters of healing.",
    "from-sky-500 to-blue-600",
    getPrayers("novenas-lady-of-lourdes")
  ),
  buildNovena(
    "novenas-holy-family",
    "Novena to the Holy Family",
    "Nine days with Jesus, Mary, and Joseph — seeking unity, purity, forgiveness, and protection for our families through the example of the Holy Family of Nazareth.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-holy-family")
  ),
  buildNovena(
    "novenas-our-lady-of-fatima",
    "Novena to Our Lady of Fatima",
    "Nine days with the Lady of the Rosary who appeared at Fatima, urging prayer, penance, and consecration to her Immaculate Heart for the conversion of sinners and world peace.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-our-lady-of-fatima")
  ),
  buildNovena(
    "novenas-saint-teresa",
    "Novena to Saint Teresa of Avila",
    "Nine days with the great Carmelite reformer and Doctor of the Church, seeking the grace of deep prayer, humility, inner peace, and mystical union with God.",
    "from-rose-500 to-red-600",
    getPrayers("novenas-saint-teresa")
  ),
  buildNovena(
    "novenas-saint-antonius",
    "Novena to Saint Anthony of Padua",
    "Nine days with the Wonder Worker — for lost things, Scripture wisdom, miracles, urgent needs, broken relationships, and the restoration of spiritual blessings.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-antonius")
  ),
  buildNovena(
    "novenas-saint-padre-pio",
    "Novena to Saint Padre Pio",
    "Nine days with the beloved stigmatist priest — for the grace to unite suffering to Christ, deep prayer life, frequent Confession, and miraculous intervention.",
    "from-violet-500 to-purple-600",
    getPrayers("novenas-saint-padre-pio")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 3 — Devotion novenas from novenaPrayers3.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-immaculate-heart",
    "Novena to the Immaculate Heart of Mary",
    "Nine days consecrating ourselves to the Immaculate Heart of Mary — for purity, consolation in suffering, trust in her intercession, and the triumph of her heart.",
    "from-pink-500 to-rose-600",
    getPrayers("novenas-immaculate-heart")
  ),
  buildNovena(
    "novenas-saint-francis",
    "Novena to Saint Francis of Assisi",
    "Nine days with the Poverello of Assisi — for holy poverty, deep prayer, charity to the poor, joy, care for creation, simplicity, peace, and Christlike living.",
    "from-amber-500 to-emerald-600",
    getPrayers("novenas-saint-francis")
  ),
  buildNovena(
    "novenas-holy-angels",
    "Novena to the Holy Guardian Angels",
    "Nine days honoring our guardian angels — for protection, guidance, comfort, warning, prayer companionship, intercession, praise, thanksgiving, and lifelong dedication.",
    "from-sky-500 to-indigo-600",
    getPrayers("novenas-holy-angels")
  ),
  buildNovena(
    "novenas-all-saints",
    "Novena to All Saints",
    "Nine days with the Communion of Saints — honoring the martyrs, doctors, confessors, virgins, holy innocents, and all men and women of God who intercede for us.",
    "from-rose-500 to-amber-600",
    getPrayers("novenas-all-saints")
  ),
  buildNovena(
    "novenas-our-lady-of-victory",
    "Novena to Our Lady of Victory",
    "Nine days invoking Mary's power to conquer evil — for freedom from spiritual bondage, liberation of captives, overcoming sin, and the victory of eternal life.",
    "from-red-500 to-indigo-600",
    getPrayers("novenas-our-lady-of-victory")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 4 — Liturgical & Devotion novenas from novenaPrayers4.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-christ-the-king",
    "Novena to Christ the King",
    "Nine days acknowledging the sovereign kingship of Jesus Christ — His authority, justice, peace, truth, glory, and mercy — and consecrating ourselves to His divine rule.",
    "from-red-500 to-purple-600",
    getPrayers("novenas-christ-the-king")
  ),
  buildNovena(
    "novenas-saint-cecilia",
    "Novena to Saint Cecilia",
    "Nine days with the patroness of musicians — for sacred music, purity of heart, courage under persecution, harmony through music, and the consecration of art to God.",
    "from-rose-500 to-violet-600",
    getPrayers("novenas-saint-cecilia")
  ),
  buildNovena(
    "novenas-saint-michael",
    "Novena to Saint Michael the Archangel",
    "Nine days with the prince of the heavenly host — for protection, spiritual warfare, defense of the Church, help for the dying, intercession for the holy souls, and victory over evil.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-saint-michael")
  ),
  buildNovena(
    "novenas-assumption",
    "Novena to the Assumption of Mary",
    "Nine days contemplating the Assumption of Our Lady — her coronation as Queen of Heaven, intercession for the faithful, protection of the Church, and our hope of resurrection.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-assumption")
  ),
  buildNovena(
    "novenas-pentecost",
    "Novena to the Holy Spirit (Pentecost)",
    "Nine days invoking the outpouring of the Holy Spirit — for divine love, the gifts and fruits of the Spirit, wisdom, boldness in witness, Church renewal, and a new Pentecost.",
    "from-red-500 to-orange-600",
    getPrayers("novenas-pentecost")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 5 — Marian novenas from novenaPrayers5.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-holy-name-jesus",
    "Novena to the Holy Name of Jesus",
    "Nine days venerating the Most Holy Name of Jesus — for adoration, power, confidence, healing, protection, salvation, and consecration to the Name above all names.",
    "from-yellow-500 to-amber-600",
    getPrayers("novenas-holy-name-jesus")
  ),
  buildNovena(
    "novenas-annunciation",
    "Novena before the Annunciation",
    "Nine days preparing to celebrate the Incarnation — reflecting on Mary's faith, Gabriel's message, God's power, and the mystery of the Word made Flesh.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-annunciation")
  ),
  buildNovena(
    "novenas-lady-mount-carmel",
    "Novena to Our Lady of Mount Carmel",
    "Nine days with the Queen of Carmel — for scapular devotion, protection, intercession, purity, perseverance, salvation, grace in trials, and Marian consecration.",
    "from-amber-500 to-emerald-600",
    getPrayers("novenas-lady-mount-carmel")
  ),
  buildNovena(
    "novenas-mary-magdalene",
    "Novena to Saint Mary Magdalene",
    "Nine days with the apostle to the apostles — for conversion, repentance, forgiveness, love for Christ, devotion, faithfulness, proclamation, holy life, and intercession.",
    "from-rose-500 to-pink-600",
    getPrayers("novenas-mary-magdalene")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 6 — Saint novenas from novenaPrayers6.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-monica",
    "Novena to Saint Monica",
    "Nine days with the mother of Saint Augustine — for conversion of family, perseverance in prayer, holy tears, patience, maternal love, faith, intercession for children, and holy death.",
    "from-purple-500 to-violet-600",
    getPrayers("novenas-saint-monica")
  ),
  buildNovena(
    "novenas-saint-therese",
    "Novena to Saint Thérèse of Lisieux",
    "Nine days with the Little Flower — for the Little Way of spiritual childhood, trust in God's love, joy in suffering, missionary spirit, and throwing roses of grace from heaven.",
    "from-pink-500 to-rose-600",
    getPrayers("novenas-saint-therese")
  ),
  buildNovena(
    "novenas-rosary",
    "Rosary Novena",
    "Nine days meditating on the mysteries of the Rosary — Joyful, Luminous, Sorrowful, and Glorious — through Mary's intercession for conversion, peace, and consecration.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-rosary")
  ),
  buildNovena(
    "novenas-holy-souls",
    "Novena for the Holy Souls in Purgatory",
    "Nine days praying for the faithful departed — for compassion, release, intercession, Holy Sacrifice, indulgences, comfort, remembrance, and eternal rest for the suffering souls.",
    "from-slate-600 to-purple-700",
    getPrayers("novenas-holy-souls")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 7 — Devotion novenas from novenaPrayers7.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-martin",
    "Novena to Saint Martin de Porres",
    "Nine days with the patron of racial justice — for charity, humility, healing, service, justice, prayer, unity, works of mercy, and consecration to charity.",
    "from-emerald-500 to-teal-600",
    getPrayers("novenas-saint-martin")
  ),
  buildNovena(
    "novenas-advent",
    "Advent Novena",
    "Nine days preparing for the coming of Christ — for watchfulness, repentance, hope, longing for the Savior, following John the Baptist, and opening our hearts to the Word made Flesh.",
    "from-purple-500 to-indigo-600",
    getPrayers("novenas-advent")
  ),
  buildNovena(
    "novenas-holy-infant",
    "Novena to the Holy Infant of Prague",
    "Nine days with the Infant Jesus of Prague — for childlike trust, divine providence, help in poverty, faith in trials, dependence on God, and blessing through the Holy Infant.",
    "from-yellow-500 to-amber-600",
    getPrayers("novenas-holy-infant")
  ),
  buildNovena(
    "novenas-christian-unity",
    "Novena for Christian Unity",
    "Nine days praying for the unity of all Christians — for one Lord one faith, overcoming divisions, dialogue, charity, returning to truth, and visible unity under one fold and one Shepherd.",
    "from-slate-500 to-blue-600",
    getPrayers("novenas-christian-unity")
  ),

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL NOVENAS
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-lady-sorrows",
    "Novena to Our Lady of Sorrows",
    "Nine days meditating on the seven sorrows of the Blessed Virgin Mary, from the prophecy of Simeon to the burial of Jesus.",
    "from-purple-600 to-indigo-700",
    getPrayers("novenas-lady-sorrows")
  ),
];
