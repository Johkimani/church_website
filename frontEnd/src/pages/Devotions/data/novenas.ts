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

// Import all prayers from the 15 batch files
import { NOVENA_PRAYERS } from "./novenaPrayers";
import { NOVENA_PRAYERS_2 } from "./novenaPrayers2";
import { NOVENA_PRAYERS_3 } from "./novenaPrayers3";
import { NOVENA_PRAYERS_4 } from "./novenaPrayers4";
import { NOVENA_PRAYERS_5 } from "./novenaPrayers5";
import { NOVENA_PRAYERS_6 } from "./novenaPrayers6";
import { NOVENA_PRAYERS_7 } from "./novenaPrayers7";
import { NOVENA_PRAYERS_8 } from "./novenaPrayers8";
import { NOVENA_PRAYERS_9 } from "./novenaPrayers9";
import { NOVENA_PRAYERS_10 } from "./novenaPrayers10";
import { NOVENA_PRAYERS_11 } from "./novenaPrayers11";
import { NOVENA_PRAYERS_12 } from "./novenaPrayers12";
import { NOVENA_PRAYERS_13 } from "./novenaPrayers13";
import { NOVENA_PRAYERS_14 } from "./novenaPrayers14";
import { NOVENA_PRAYERS_15 } from "./novenaPrayers15";

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
    ...NOVENA_PRAYERS_8,
    ...NOVENA_PRAYERS_9,
    ...NOVENA_PRAYERS_10,
    ...NOVENA_PRAYERS_11,
    ...NOVENA_PRAYERS_12,
    ...NOVENA_PRAYERS_13,
    ...NOVENA_PRAYERS_14,
    ...NOVENA_PRAYERS_15,
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

  // ═══════════════════════════════════════════════════════════════
  // BATCH 8 — Patron Saint novenas from novenaPrayers8.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-augustine",
    "Novena to Saint Augustine",
    "Nine days with the great Doctor of Grace — for conversion, wisdom, detachment from worldly things, and the love of Sacred Scripture.",
    "from-yellow-500 to-amber-600",
    getPrayers("novenas-saint-augustine")
  ),
  buildNovena(
    "novenas-saint-catherine-siena",
    "Novena to Saint Catherine of Siena",
    "Nine days with the mystic and Doctor of the Church — for courage in faith, holy dialogue, Church unity, and the grace of complete self-offering to God.",
    "from-red-500 to-rose-600",
    getPrayers("novenas-saint-catherine-siena")
  ),
  buildNovena(
    "novenas-saint-dominic",
    "Novena to Saint Dominic",
    "Nine days with the founder of the Order of Preachers — for the grace of preaching truth, devotion to the Holy Rosary, study, and the conversion of sinners.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-saint-dominic")
  ),
  buildNovena(
    "novenas-saint-elizabeth",
    "Novena to Saint Elizabeth of Hungary",
    "Nine days with the princess of charity — for love of the poor, humility in service, patience in affliction, and trust in divine providence.",
    "from-emerald-500 to-teal-600",
    getPrayers("novenas-saint-elizabeth")
  ),
  buildNovena(
    "novenas-saint-mary-goretti",
    "Novena to Saint Mary Goretti",
    "Nine days with the lily of purity — for purity of heart, forgiveness of enemies, courage in trials, and the conversion of sinners through the power of mercy.",
    "from-pink-500 to-rose-600",
    getPrayers("novenas-saint-mary-goretti")
  ),
  // ═══════════════════════════════════════════════════════════════
  // BATCH 9 — novenaPrayers9.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-our-lady-of-guadalupe",
    "Novena to Our Lady of Guadalupe",
    "Nine days with the Mother of the Americas — for conversion, healing, and the intercession of Our Lady who appeared to Juan Diego on Tepeyac Hill.",
    "from-emerald-500 to-green-600",
    getPrayers("novenas-our-lady-of-guadalupe")
  ),
  buildNovena(
    "novenas-holy-cross",
    "Novena to the Holy Cross",
    "Nine days venerating the instrument of our redemption — for faith, courage, reverence for the Cross, and the grace to embrace our own crosses with love.",
    "from-red-500 to-rose-600",
    getPrayers("novenas-holy-cross")
  ),
  buildNovena(
    "novenas-saint-patrick",
    "Novena to Saint Patrick",
    "Nine days with the Apostle of Ireland — for faith, evangelization, protection from evil, and the grace to trust in God's providence in all circumstances.",
    "from-green-500 to-emerald-600",
    getPrayers("novenas-saint-patrick")
  ),
  buildNovena(
    "novenas-saint-raphael",
    "Novena to Saint Raphael",
    "Nine days with the archangel of healing — for physical and spiritual healing, safe travels, finding a spouse, and protection in times of trial.",
    "from-cyan-500 to-blue-600",
    getPrayers("novenas-saint-raphael")
  ),
  // ═══════════════════════════════════════════════════════════════
  // BATCH 10 — novenaPrayers10.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-clare",
    "Novena to Saint Clare of Assisi",
    "Nine days with the luminous daughter of Saint Francis — for evangelical poverty, fidelity in religious life, Eucharistic devotion, and protection against evil.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-clare")
  ),
  buildNovena(
    "novenas-immaculate-conception",
    "Novena to the Immaculate Conception",
    "Nine days preparing for the Solemnity of the Immaculate Conception — for purity of heart, the grace to avoid sin, and devotion to Mary's sinless nature.",
    "from-blue-500 to-sky-600",
    getPrayers("novenas-immaculate-conception")
  ),
  buildNovena(
    "novenas-precious-blood",
    "Novena to the Precious Blood of Jesus",
    "Nine days venerating the Most Precious Blood — for the remission of sins, spiritual healing, deeper devotion to the Eucharist, and the grace of repentance.",
    "from-red-600 to-rose-700",
    getPrayers("novenas-precious-blood")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 11 — novenaPrayers11.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-michael-archangel",
    "Novena to Saint Michael the Archangel",
    "Nine days with the great archangel — for protection, spiritual warfare, defense against evil, courage, intercession, and the grace to fight under his banner.",
    "from-blue-600 to-indigo-700",
    getPrayers("novenas-saint-michael-archangel")
  ),
  buildNovena(
    "novenas-saint-gabriel",
    "Novena to Saint Gabriel the Archangel",
    "Nine days with the archangel of communication — for fidelity in delivering God's messages, purity of speech, intercession for families, and the grace of holy announcements.",
    "from-cyan-500 to-blue-600",
    getPrayers("novenas-saint-gabriel")
  ),
  buildNovena(
    "novenas-saint-ursula",
    "Novena to Saint Ursula",
    "Nine days with the princess and martyr — for courage in faith, protection of youth, purity, fidelity to Christ, and the grace to persevere to the end.",
    "from-violet-500 to-purple-600",
    getPrayers("novenas-saint-ursula")
  ),
  buildNovena(
    "novenas-saint-anthony-patron",
    "Novena to Saint Anthony, Patron of the Poor",
    "Nine days with the patron of the poor — for charity, humility, justice for the oppressed, and the grace to serve Christ in the least of our brothers.",
    "from-emerald-500 to-teal-600",
    getPrayers("novenas-saint-anthony-patron")
  ),
  buildNovena(
    "novenas-saint-clement",
    "Novena to Saint Clement",
    "Nine days with the early pope and martyr — for unity in the Church, fidelity to apostolic teaching, humility, and the grace to endure persecution for the faith.",
    "from-sky-500 to-blue-600",
    getPrayers("novenas-saint-clement")
  ),
  buildNovena(
    "novenas-saint-lucy",
    "Novena to Saint Lucy",
    "Nine days with the patroness of sight — for physical and spiritual eyesight, faith in darkness, courage under persecution, and the light of Christ in our lives.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-lucy")
  ),
  buildNovena(
    "novenas-saint-barbara",
    "Novena to Saint Barbara",
    "Nine days with the patroness of miners and artillerymen — for protection from sudden death, faith in trials, fortitude, and the grace to die in God's friendship.",
    "from-red-500 to-orange-600",
    getPrayers("novenas-saint-barbara")
  ),
  buildNovena(
    "novenas-saint-ambrose",
    "Novena to Saint Ambrose",
    "Nine days with the great Doctor of the Church — for eloquence in preaching, defense of orthodoxy, pastoral wisdom, and the grace to bring souls to Christ.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-saint-ambrose")
  ),
  buildNovena(
    "novenas-saint-nicholas",
    "Novena to Saint Nicholas",
    "Nine days with the wonder-working bishop — for generosity, protection of children, intercession for the poor, and the grace to give secretly for God's glory.",
    "from-sky-500 to-cyan-600",
    getPrayers("novenas-saint-nicholas")
  ),
  buildNovena(
    "novenas-saint-elizabeth-ann-seton",
    "Novena to Saint Elizabeth Ann Seton",
    "Nine days with the first American-born saint — for conversion, trust in providence, education, family life, and the grace to serve God faithfully in daily work.",
    "from-rose-500 to-pink-600",
    getPrayers("novenas-saint-elizabeth-ann-seton")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 12 — novenaPrayers12.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-benedict",
    "Novena to Saint Benedict",
    "Nine days with the father of Western monasticism — for purity, obedience, humility, protection from evil, and the grace to seek God alone in silence and prayer.",
    "from-emerald-500 to-green-600",
    getPrayers("novenas-saint-benedict")
  ),
  buildNovena(
    "novenas-saint-hildegard",
    "Novena to Saint Hildegard of Bingen",
    "Nine days with the mystic and polymath — for divine wisdom, creativity, healing, prophetic insight, and the grace to glorify God through every gift of mind and heart.",
    "from-violet-500 to-purple-600",
    getPrayers("novenas-saint-hildegard")
  ),
  buildNovena(
    "novenas-all-angels",
    "Novena to All Holy Angels",
    "Nine days with the nine choirs of angels — for celestial protection, spiritual combat, guidance, praise, intercession, and the grace to live as citizens of heaven.",
    "from-indigo-500 to-blue-600",
    getPrayers("novenas-all-angels")
  ),
  buildNovena(
    "novenas-saint-mary-of-egypt",
    "Novena to Saint Mary of Egypt",
    "Nine days with the great penitent — for deep conversion, freedom from sin, purity, mortification, trust in God's mercy, and the grace to persevere in repentance.",
    "from-rose-500 to-red-600",
    getPrayers("novenas-saint-mary-of-egypt")
  ),
  buildNovena(
    "novenas-jesus-christ",
    "Novena to Jesus Christ",
    "Nine days with our Lord and Savior — for deeper union with Christ, faith, love, mercy, wisdom, and the grace to follow Him faithfully every day of our lives.",
    "from-red-500 to-amber-600",
    getPrayers("novenas-jesus-christ")
  ),
  buildNovena(
    "novenas-holy-rosary",
    "Novena of the Holy Rosary",
    "Nine days meditating on the mysteries of the Rosary through Mary's intercession — for contemplation, peace, conversion, and the grace to pray without ceasing.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-holy-rosary")
  ),
  buildNovena(
    "novenas-saint-rita",
    "Novena to Saint Rita of Cascia",
    "Nine days with the patroness of impossible cases — for impossible causes, peace in families, forgiveness, perseverance, and the grace to accept God's will.",
    "from-rose-500 to-red-600",
    getPrayers("novenas-saint-rita")
  ),
  buildNovena(
    "novenas-saint-charles-borromeo",
    "Novena to Saint Charles Borromeo",
    "Nine days with the patron of catechists — for the reform of the Church, pastoral zeal, purity, humility, and the grace to serve God's people with fidelity.",
    "from-sky-500 to-blue-600",
    getPrayers("novenas-saint-charles-borromeo")
  ),
  buildNovena(
    "novenas-saint-cyril-alexandria",
    "Novena to Saint Cyril of Alexandria",
    "Nine days with the Doctor of the Incarnation — for orthodoxy, defense of the faith, wisdom, unity in the Church, and the grace to proclaim Christ truly God and man.",
    "from-indigo-500 to-violet-600",
    getPrayers("novenas-saint-cyril-alexandria")
  ),
  buildNovena(
    "novenas-saint-bonaventure",
    "Novena to Saint Bonaventure",
    "Nine days with the Seraphic Doctor — for mystical theology, charity, humility, devotion to the Cross, and the grace to seek God with burning love.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-bonaventure")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 13 — novenaPrayers13.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-francis-xavier",
    "Novena to Saint Francis Xavier",
    "Nine days with the great missionary — for evangelization, zeal for souls, missionary vocations, conversion of nations, and the grace to bring Christ to all lands.",
    "from-cyan-500 to-blue-600",
    getPrayers("novenas-saint-francis-xavier")
  ),
  buildNovena(
    "novenas-saint-ignatius-loyola",
    "Novena to Saint Ignatius of Loyola",
    "Nine days with the founder of the Jesuits — for discernment, the spiritual exercises, generosity, apostolic zeal, and the grace to find God in all things.",
    "from-violet-500 to-purple-600",
    getPrayers("novenas-saint-ignatius-loyola")
  ),
  buildNovena(
    "novenas-saint-teresa-avila",
    "Novena to Saint Teresa of Avila",
    "Nine days with the great Carmelite reformer — for deep prayer, humility, inner peace, mystical union, and the grace to persevere in the journey to God.",
    "from-rose-500 to-pink-600",
    getPrayers("novenas-saint-teresa-avila")
  ),
  buildNovena(
    "novenas-saint-john-cross",
    "Novena to Saint John of the Cross",
    "Nine days with the Doctor of the Dark Night — for purification of soul, detachment, mystical prayer, patience in suffering, and the grace to love God above all.",
    "from-slate-500 to-indigo-600",
    getPrayers("novenas-saint-john-cross")
  ),
  buildNovena(
    "novenas-holy-martyrs",
    "Novena to the Holy Martyrs",
    "Nine days with all the holy martyrs — for courage, fidelity to Christ unto death, fortitude, intercession, and the grace to bear witness to the faith.",
    "from-red-500 to-orange-600",
    getPrayers("novenas-holy-martyrs")
  ),
  buildNovena(
    "novenas-saint-helen",
    "Novena to Saint Helena",
    "Nine days with the mother of Constantine — for the discovery of the True Cross, faith, pilgrimage, devotion to the Cross, and the grace to seek holy things.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-helen")
  ),
  buildNovena(
    "novenas-saint-joachim-anne",
    "Novena to Saints Joachim and Anne",
    "Nine days with the parents of Mary — for family life, intercession for grandchildren, purity, patience, and the grace to raise children in the faith.",
    "from-emerald-500 to-teal-600",
    getPrayers("novenas-saint-joachim-anne")
  ),
  buildNovena(
    "novenas-saint-matthew",
    "Novena to Saint Matthew",
    "Nine days with the evangelist and tax collector — for conversion, detachment from wealth, fidelity to the Gospel, and the grace to follow Christ immediately.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-saint-matthew")
  ),
  buildNovena(
    "novenas-saint-thomas-apostle",
    "Novena to Saint Thomas the Apostle",
    "Nine days with the doubting apostle — for faith, courage to witness, missionary zeal, and the grace to confess Christ truly present in the Eucharist.",
    "from-cyan-500 to-sky-600",
    getPrayers("novenas-saint-thomas-apostle")
  ),
  buildNovena(
    "novenas-saint-luke",
    "Novena to Saint Luke",
    "Nine days with the beloved physician and evangelist — for healing, art, the Holy Rosary, fidelity to the Gospel, and the grace to serve Christ through mercy.",
    "from-emerald-500 to-green-600",
    getPrayers("novenas-saint-luke")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 14 — novenaPrayers14.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-peter-apostle",
    "Novena to Saint Peter the Apostle",
    "Nine days with the prince of the apostles — for faith, courage, pastoral zeal, the keys of the kingdom, and the grace to remain faithful to Christ.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-peter-apostle")
  ),
  buildNovena(
    "novenas-saint-paul-apostle",
    "Novena to Saint Paul the Apostle",
    "Nine days with the apostle to the Gentiles — for evangelization, missionary zeal, conversion, doctrinal fidelity, and the grace to suffer for Christ's name.",
    "from-red-500 to-rose-600",
    getPrayers("novenas-saint-paul-apostle")
  ),
  buildNovena(
    "novenas-saint-james-apostle",
    "Novena to Saint James the Apostle",
    "Nine days with the son of thunder — for courage, the spirit of pilgrimage, zeal, protection of travelers, and the grace to be a pillar of the Church.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-saint-james-apostle")
  ),
  buildNovena(
    "novenas-saint-andrew-apostle",
    "Novena to Saint Andrew the Apostle",
    "Nine days with the first-called apostle — for humility, readiness to follow Christ, intercession for Scotland and Greece, and the grace to bring others to Jesus.",
    "from-cyan-500 to-blue-600",
    getPrayers("novenas-saint-andrew-apostle")
  ),
  buildNovena(
    "novenas-saint-philip-apostle",
    "Novena to Saint Philip the Apostle",
    "Nine days with the apostle of Bethsaida — for discernment, pastoral zeal, courage, simplicity, and the grace to bring souls to Christ with enthusiasm.",
    "from-sky-500 to-cyan-600",
    getPrayers("novenas-saint-philip-apostle")
  ),
  buildNovena(
    "novenas-saint-simon-apostle",
    "Novena to Saint Simon the Apostle",
    "Nine days with the Zealot — for zeal for God's glory, courage in persecution, fidelity to the Gospel, and the grace to be consumed with love for Christ.",
    "from-violet-500 to-purple-600",
    getPrayers("novenas-saint-simon-apostle")
  ),
  buildNovena(
    "novenas-saint-jude-apostle",
    "Novena to Saint Jude Thaddeus",
    "Nine days with the patron of desperate causes — for hope in impossible situations, intercession in need, courage, and the grace to trust God's power.",
    "from-amber-500 to-orange-600",
    getPrayers("novenas-saint-jude-apostle")
  ),
  buildNovena(
    "novenas-our-lady-star-evangelization",
    "Novena to Our Lady, Star of Evangelization",
    "Nine days invoking Mary as star of the new evangelization — for missionary courage, proclamation of the Gospel, renewal of the Church, and the grace to lead souls to Christ.",
    "from-blue-500 to-cyan-600",
    getPrayers("novenas-our-lady-star-evangelization")
  ),
  buildNovena(
    "novenas-saint-rose-lima",
    "Novena to Saint Rose of Lima",
    "Nine days with the first canonized saint of the Americas — for purity, humility, mortification, devotion to the Eucharist, and the grace to live hidden with Christ.",
    "from-pink-500 to-rose-600",
    getPrayers("novenas-saint-rose-lima")
  ),
  buildNovena(
    "novenas-saint-martin-de-porres",
    "Novena to Saint Martin de Porres",
    "Nine days with the patron of social justice — for charity, humility, healing, service to the poor, racial harmony, and the grace to see Christ in every person.",
    "from-emerald-500 to-teal-600",
    getPrayers("novenas-saint-martin-de-porres")
  ),

  // ═══════════════════════════════════════════════════════════════
  // BATCH 15 — novenaPrayers15.ts
  // ═══════════════════════════════════════════════════════════════
  buildNovena(
    "novenas-saint-anne",
    "Novena to Saint Anne",
    "Nine days with the mother of the Blessed Virgin Mary — for mothers, grandmothers, families, patience, and the grace to nurture faith in the next generation.",
    "from-amber-500 to-yellow-600",
    getPrayers("novenas-saint-anne")
  ),
  buildNovena(
    "novenas-saint-celestine",
    "Novena to Saint Celestine V",
    "Nine days with the holy pope who chose humility over power — for simplicity, prayer, the courage to renounce worldly ambition, and freedom in God.",
    "from-violet-500 to-purple-600",
    getPrayers("novenas-saint-celestine")
  ),
  buildNovena(
    "novenas-saint-brendan",
    "Novena to Saint Brendan the Navigator",
    "Nine days with the great Irish explorer — for adventure in faith, trust in God's providence, evangelization, and the courage to sail into the unknown.",
    "from-cyan-500 to-blue-600",
    getPrayers("novenas-saint-brendan")
  ),
  buildNovena(
    "novenas-saint-kateri",
    "Novena to Saint Kateri Tekakwitha",
    "Nine days with the Lily of the Mohawks — for purity, conversion of loved ones, love of nature, prayer, charity, and courage in faith.",
    "from-emerald-500 to-green-600",
    getPrayers("novenas-saint-kateri")
  ),
  buildNovena(
    "novenas-saint-oscar-romero",
    "Novena to Saint Oscar Romero",
    "Nine days with the martyred archbishop — for justice, courage, solidarity with the poor, truth, peace, and the grace to stand with the suffering.",
    "from-red-500 to-rose-600",
    getPrayers("novenas-saint-oscar-romero")
  ),
  buildNovena(
    "novenas-all-saints-africa",
    "Novena to All Holy Martyrs of Africa",
    "Nine days honoring the blood of the African martyrs — for faith, courage, forgiveness, unity, hope, and the triumph of the Church in Africa.",
    "from-amber-500 to-orange-600",
    getPrayers("novenas-all-saints-africa")
  ),
  buildNovena(
    "novenas-jesus-nazareth",
    "Novena to Jesus of Nazareth",
    "Nine days walking with Jesus through His earthly life — from His hidden years to His glorious Resurrection, deepening our love for the Word made Flesh.",
    "from-blue-500 to-indigo-600",
    getPrayers("novenas-jesus-nazareth")
  ),
  buildNovena(
    "novenas-sacrament-reconciliation",
    "Novena for the Sacrament of Reconciliation",
    "Nine days preparing for Confession — for contrition, trust in God's mercy, frequency, healing, and the peace that comes through absolution.",
    "from-sky-500 to-cyan-600",
    getPrayers("novenas-sacrament-reconciliation")
  ),
  buildNovena(
    "novenas-sacrament-eucharist",
    "Novena to the Sacrament of the Eucharist",
    "Nine days adoring the Real Presence — for deeper faith in the Eucharist, reverence, adoration, unity, and the grace of Holy Communion.",
    "from-yellow-500 to-amber-600",
    getPrayers("novenas-sacrament-eucharist")
  ),
  buildNovena(
    "novenas-holy-cross-passion",
    "Novena to the Holy Cross and the Passion",
    "Nine days meditating on the Passion — for the grace to embrace our crosses, the love that redeems, and the victory of Christ over death.",
    "from-red-600 to-rose-700",
    getPrayers("novenas-holy-cross-passion")
  ),
];
