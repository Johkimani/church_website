import { useState } from "react";

const KYRIE = {
  greek: "Kyrie eleison — Christe eleison — Kyrie eleison",
  english: "Lord, have mercy — Christ, have mercy — Lord, have mercy",
  explanation: "This is the oldest surviving prayer in the Roman Rite. It is the only part of the Mass that has remained in Greek rather than Latin. The threefold repetition recalls the Holy Trinity.",
};

const GLORIA = {
  text: "Glory to God in the highest, and on earth peace to people of good will. We praise you, we bless you, we adore you, we glorify you, we give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father.\n\nLord Jesus Christ, Only Begotten Son, Lord God, Lamb of God, Son of the Father, you take away the sins of the world, have mercy on us; you take away the sins of the world, receive our prayer; you are seated at the right hand of the Father, have mercy on us.\n\nFor you alone are the Holy One, you alone are the Lord, you alone are the Most High, Jesus Christ, with the Holy Spirit, in the glory of God the Father. Amen.",
  explanation: "The Gloria is a hymn of praise with roots in the angelic song at Christ's birth (Luke 2:14). It is omitted during Advent and Lent as a penitential discipline, returning on Christmas Eve and at the Easter Vigil.",
};

const NICENE_CREED = {
  text: "I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible.\n\nI believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made.\n\nFor us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man.\n\nFor our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end.\n\nI believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets.\n\nI believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.",
  explanation: "The Nicene Creed was formulated at the Councils of Nicaea (325 AD) and Constantinople (381 AD). It is the Church's most authoritative profession of faith, summarizing the core doctrines of the Trinity, the Incarnation, the Passion, the Resurrection, and the Church.",
};

const SANCTUS = {
  latin: "Sanctus, Sanctus, Sanctus Dominus Deus Sabaoth. Pleni sunt caeli et gloria tua. Hosanna in excelsis. Benedictus qui venit in nomine Domini. Hosanna in excelsis.",
  english: "Holy, Holy, Holy Lord God of hosts! Heaven and earth are full of your glory. Hosanna in the highest! Blessed is he who comes in the name of the Lord. Hosanna in the highest!",
  explanation: "The Sanctus draws from Isaiah 6:3 (the Seraphim's cry) and Matthew 21:9 (the crowd's acclamation at Christ's entry into Jerusalem). It is sung at the climax of the Preface, leading into the Eucharistic Prayer.",
};

const AGNUS_DEI = {
  text: "Lamb of God, you take away the sins of the world, have mercy on us.\nLamb of God, you take away the sins of the world, have mercy on us.\nLamb of God, you take away the sins of the world, grant us peace.",
  explanation: "The Agnus Dei echoes John the Baptist's words upon seeing Jesus: 'Behold the Lamb of God, who takes away the sin of the world' (John 1:29). It is sung during the Breaking of the Bread, recalling the Passover Lamb whose sacrifice freed Israel.",
};

const CONFITEOR = {
  text: "I confess to almighty God\nand to you, my brothers and sisters,\nthat I have greatly sinned,\nin my thoughts and in my words,\nin what I have done\nand in what I have failed to do,\nthrough my fault, through my fault,\nthrough my most grievous fault;\ntherefore I ask blessed Mary ever-Virgin,\nall the Angels and Saints,\nand you, my brothers and sisters,\nto pray for me to the Lord our God.",
  latin: "Confiteor Deo omnipotenti\net vobis, fratres,\nquia peccavi\ncogitatione, verbo, opere et omissione:\nmea culpa, mea culpa,\nmea maxima culpa.\nIdeo precor beatam Mariam semper Virginem,\nOmnes Angelos et Sanctos,\net vos, fratres,\norare pro me ad Dominum Deum nostrum.",
  explanation: "The Confiteor ('I confess') is the primary form of the Penitential Act. The threefold 'mea culpa, mea culpa, mea maxima culpa' (through my fault, through my fault, through my most grievous fault) is accompanied by striking the breast. It acknowledges sin of commission ('what I have done') and omission ('what I have failed to do').",
};

const PENITENTIAL_ACTS = [
  {
    name: "Form A: The Confiteor",
    description: "The most common form. A general confession of sins before the community, invoking the intercession of Mary and the Saints. Used on Sundays and Holy Days.",
    text: "I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.",
    absolution: "May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life.",
  },
  {
    name: "Form B: Brief Dialogue",
    description: "A shorter form, often used during Advent as a sign of penitential preparation.",
    text: "Priest: Have mercy on us, O Lord.\nPeople: For we have sinned against you.\nPriest: Show us, O Lord, your mercy.\nPeople: And grant us your salvation.",
    absolution: "May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life.",
  },
  {
    name: "Form C: Invocations with Kyrie",
    description: "A deacon-led form with various invocations followed by Kyrie eleison. Common on Sundays outside Lent and Advent.",
    text: "Deacon: Lord, have mercy.\nPeople: Lord, have mercy.\nDeacon: Christ, have mercy.\nPeople: Christ, have mercy.\nDeacon: Lord, have mercy.\nPeople: Lord, have mercy.",
    absolution: "May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life.",
  },
  {
    name: "Rite of Blessing and Sprinkling of Water",
    description: "An alternative to the three forms above. Holy water is blessed and sprinkled on the assembly, recalling our Baptism. Used on Sundays in the Easter season, at the Baptism of the Lord, and at the discretion of the celebrant.",
    text: "The priest blesses the water and sprinkles the people while an antiphon is sung (e.g., 'I saw water flowing from the temple' — Ezekiel 47:1-2, 5-9, 12 or Psalm 51). The assembly is reminded of their baptismal promises.",
    absolution: "May almighty God cleanse us of our sins, and through the celebration of this Eucharist make us worthy to share at the table of his kingdom.",
  },
];

const EUCHARISTIC_PRAYERS = [
  {
    name: "Eucharistic Prayer I (Roman Canon)",
    description: "The oldest Eucharistic Prayer, dating back to at least the 4th century. It is the only Eucharistic Prayer used in the Roman Rite from the time of Pope Gregory the Great (c. 600 AD) until 1969. It contains the most saints' names and is especially suited for Sundays, Feasts of the Apostles and Saints, and Masses with a proper Communicantes.",
    keyElements: ["Te Igitur (Therefore, Lord, we pray)", "Communicantes (In communion with...)", "Hanc Igitur (Therefore, Lord, we pray...)", "In memory of the sacrifices of Abel, Abraham, and Melchizedek"],
    whenToUse: "Sundays, great feasts, Masses of Saints, celebrations with a proper Communicantes.",
  },
  {
    name: "Eucharistic Prayer II",
    description: "Based on an ancient anaphora attributed to Hippolytus of Rome (c. 215 AD), one of the earliest known Eucharistic Prayers. It is the shortest of the four and was originally intended for weekday use.",
    keyElements: ["Shorter structure", "Based on the tradition of Hippolytus", "Strong Trinitarian focus"],
    whenToUse: "Weekdays, simpler celebrations, when a shorter Eucharistic Prayer is desired.",
  },
  {
    name: "Eucharistic Prayer III",
    description: "A new composition by Cipriano Vagaggini, designed to be a general Sunday alternative to the Roman Canon. It is the most commonly used Eucharistic Prayer today. It contains a beautiful account of the entire history of salvation.",
    keyElements: ["Salvation history narrative", "Beautiful theological language", "Extended memorial acclamation", "Optional texts for Masses for the Dead"],
    whenToUse: "Sundays, Feasts, and when a richly theological Eucharistic Prayer is desired. The GIRM recommends it for Sundays unless EP I is preferred.",
  },
  {
    name: "Eucharistic Prayer IV",
    description: "Based on the East Syrian Anaphora of Addai and Mari, one of the oldest known Eucharistic Prayers. It has a fixed Preface (unlike EP I-III which have dozens of options) that traces creation through Christ.",
    keyElements: ["Fixed Preface (cannot be changed)", "Creation-to-Christ salvation narrative", "Eastern liturgical tradition"],
    whenToUse: "When the celebrant wishes to use a prayer that traces the entire sweep of salvation history from creation.",
  },
];

const PROPER_PREFACES = [
  { season: "Advent", text: "For he assumed at his first coming the lowliness of our flesh, and so fulfilled the design you formed long ago, and opened for us the way to eternal salvation...", note: "Used throughout Advent except the O Antiphons." },
  { season: "Christmas", text: "For through the mystery of the Word made flesh, the light of your glory has shone anew upon the eyes of our mind...", note: "Used throughout the Christmas season." },
  { season: "Epiphany", text: "For today you have revealed the mystery of our salvation in Christ as a light for the nations...", note: "Used on the Feast of the Epiphany." },
  { season: "Lent", text: "For you have given your faithful people the grace to persevere in penance with heartfelt sorrow for sin...", note: "Used throughout Lent." },
  { season: "Easter", text: "For with the Passover of your Son the destruction of the old bondage has been overcome, and the new creation has begun...", note: "Used throughout the Easter season." },
  { season: "Ascension", text: "For the Lord Jesus, the King of Glory, conqueror of sin and death, ascended to the highest heavens as the Angels gazed in wonder...", note: "Used on the Feast of the Ascension." },
  { season: "Pentecost", text: "For the overshadowing of the Holy Spirit, as once at the River Jordan, revealed your beloved Son to the world...", note: "Used on Pentecost Sunday." },
  { season: "Corpus Christi", text: "For he is the true and eternal Priest who established the memorial of his saving sacrifice...", note: "Used on the Solemnity of Corpus Christi." },
  { season: "Sacred Heart", text: "For Christ loved us beyond all telling and gave himself up for us as a fragrant offering to God...", note: "Used on the Feast of the Sacred Heart." },
  { season: "Ordinary Time (God the Father)", text: "For with your Son and the Holy Spirit you are one God, one Lord: not in the unity of a single person, but in a Trinity of one substance...", note: "Used on the Solemnity of the Most Holy Trinity." },
  { season: "Dedication of a Church", text: "For your Church is a holy temple built of living stones, upon the foundation of the Apostles, with Christ Jesus as the cornerstone...", note: "Used on the Anniversary of the Dedication of a Church." },
  { season: "For the Dead", text: "For it is your will that all your children should be one with you, and we pray that they may always be joined to your Son...", note: "Used at Masses for the Dead." },
];

const ORDINARY_VS_PROPER = {
  ordinary: {
    title: "The Ordinary of the Mass",
    latin: "Ordinarium Missae",
    description: "The parts of the Mass that remain essentially the same from day to day throughout the entire year. These are the fixed texts that the faithful can learn by heart.",
    parts: ["Kyrie Eleison", "Gloria in Excelsis Deo", "Profession of Faith (Credo)", "Sanctus", "Agnus Dei", "Lord's Prayer (Pater Noster)", "Rite of Peace", "Communion Rite"],
  },
  proper: {
    title: "The Proper of the Mass",
    latin: "Proprium Missae",
    description: "The parts of the Mass that change according to the day's celebration — the liturgical season, feast, memorial, or memorial of a saint. These texts are specific to each day and give the Mass its unique character.",
    parts: ["Entrance Antiphon (Introit)", "Responsorial Psalm", "Gospel Acclamation (Alleluia)", "Offertory Antiphon", "Communion Antiphon", "Collect (Opening Prayer)", "Prayer over the Offerings", "Prayer after Communion", "Proper Preface"],
  },
};

const MASS_INTENTIONS = {
  description: "A Mass intention is the specific intention for which a priest offers a Mass. The faithful may request that a Mass be offered for a particular intention — for the living, for the dead, for vocations, for peace, for the sick, etc. The priest offers the entire sacrifice of the Mass for that intention.",
  types: ["For the repose of a soul (Requiem)", "For the sick or dying", "For a special intention (healing, conversion, vocations)", "For world peace", "For the Church", "For a birthday or anniversary", "In thanksgiving"],
  practice: "A priest may say only one Mass per day (except on Christmas and All Souls' Day, when three are permitted). The faithful may request a Mass intention, and a stipend (offering) is customary but not required.",
};

export default function PrayersOfTheMass() {
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [expandedPenitential, setExpandedPenitential] = useState<string | null>(null);
  const [expandedEucharistic, setExpandedEucharistic] = useState<string | null>(null);
  const [expandedProper, setExpandedProper] = useState<string | null>(null);

  const togglePrayer = (key: string) => setExpandedPrayer(expandedPrayer === key ? null : key);
  const togglePenitential = (key: string) => setExpandedPenitential(expandedPenitential === key ? null : key);
  const toggleEucharistic = (key: string) => setExpandedEucharistic(expandedEucharistic === key ? null : key);
  const toggleProper = (key: string) => setExpandedProper(expandedProper === key ? null : key);

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-xl">✝</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
            Prayers of the Mass
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            The Ordinary of the Mass consists of the parts that remain the same every day. The Propers change with each day's celebration. Below are the full texts of the principal prayers that every Catholic should know by heart.
          </p>
        </div>

        {/* Kyrie */}
        <PrayerCard
          title="Kyrie Eleison"
          subtitle="Lord, Have Mercy"
          color="#8B5CF6"
          latin={KYRIE.greek}
          text={KYRIE.english}
          explanation={KYRIE.explanation}
          expanded={expandedPrayer === "kyrie"}
          onToggle={() => togglePrayer("kyrie")}
        />

        {/* Gloria */}
        <PrayerCard
          title="Gloria in Excelsis Deo"
          subtitle="Glory to God in the Highest"
          color="#F59E0B"
          text={GLORIA.text}
          explanation={GLORIA.explanation}
          expanded={expandedPrayer === "gloria"}
          onToggle={() => togglePrayer("gloria")}
        />

        {/* Nicene Creed */}
        <PrayerCard
          title="Nicene Creed (Credo)"
          subtitle="I Believe in One God"
          color="#3B82F6"
          text={NICENE_CREED.text}
          explanation={NICENE_CREED.explanation}
          expanded={expandedPrayer === "creed"}
          onToggle={() => togglePrayer("creed")}
        />

        {/* Sanctus */}
        <PrayerCard
          title="Sanctus"
          subtitle="Holy, Holy, Holy"
          color="#DC2626"
          latin={SANCTUS.latin}
          text={SANCTUS.english}
          explanation={SANCTUS.explanation}
          expanded={expandedPrayer === "sanctus"}
          onToggle={() => togglePrayer("sanctus")}
        />

        {/* Agnus Dei */}
        <PrayerCard
          title="Agnus Dei"
          subtitle="Lamb of God"
          color="#059669"
          text={AGNUS_DEI.text}
          explanation={AGNUS_DEI.explanation}
          expanded={expandedPrayer === "agnus"}
          onToggle={() => togglePrayer("agnus")}
        />

        {/* Confiteor */}
        <PrayerCard
          title="Confiteor (I Confess)"
          subtitle="The Act of Penance"
          color="#64748B"
          latin={CONFITEOR.latin}
          text={CONFITEOR.text}
          explanation={CONFITEOR.explanation}
          expanded={expandedPrayer === "confiteor"}
          onToggle={() => togglePrayer("confiteor")}
        />

        {/* Penitential Acts */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm">§</span>
            The Four Forms of the Penitential Act
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The priest may choose from four forms at the beginning of Mass. The choice depends on the liturgical season and the type of celebration. All are followed by the absolution and the Kyrie.
          </p>
          <div className="space-y-3">
            {PENITENTIAL_ACTS.map((pa, i) => (
              <PenitentialActCard
                key={i}
                name={pa.name}
                description={pa.description}
                text={pa.text}
                absolution={pa.absolution}
                index={i + 1}
                expanded={expandedPenitential === String(i)}
                onToggle={() => togglePenitential(String(i))}
              />
            ))}
          </div>
        </div>

        {/* Eucharistic Prayers */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-300 font-bold text-sm">EP</span>
            The Four Eucharistic Prayers
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The Roman Missal provides four main Eucharistic Prayers, each with its own character and theological emphasis. All share the same structure: Preface Dialogue, Preface, Sanctus, Epiclesis, Institution Narrative, Memorial Acclamation, Anamnesis, Intercessions, and Final Doxology.
          </p>
          <div className="space-y-3">
            {EUCHARISTIC_PRAYERS.map((ep, i) => (
              <EucharisticPrayerCard
                key={i}
                name={ep.name}
                description={ep.description}
                keyElements={ep.keyElements}
                whenToUse={ep.whenToUse}
                index={i + 1}
                expanded={expandedEucharistic === String(i)}
                onToggle={() => toggleEucharistic(String(i))}
              />
            ))}
          </div>
        </div>

        {/* Proper Prefaces */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm">PF</span>
            Proper Prefaces
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Each liturgical season and major feast has its own Proper Preface, which is the opening part of the Eucharistic Prayer. The Preface gives thanks to God for the specific mystery being celebrated. The Preface always ends with the Sanctus.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROPER_PREFACES.map((pf) => (
              <div key={pf.season} className="p-4 rounded-xl bg-[#0a0f1c] border border-amber-500/20">
                <div className="text-sm font-bold text-amber-400 mb-2">{pf.season}</div>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed italic">"{pf.text}"</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{pf.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ordinary vs Proper */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-300 font-bold text-sm">OP</span>
            Ordinary vs. Proper of the Mass
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#0a0f1c] border border-sky-500/20">
              <div className="text-base font-bold text-sky-300 mb-1">{ORDINARY_VS_PROPER.ordinary.title}</div>
              <div className="text-[10px] text-slate-500 italic mb-3">{ORDINARY_VS_PROPER.ordinary.latin}</div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{ORDINARY_VS_PROPER.ordinary.description}</p>
              <div className="space-y-1">
                {ORDINARY_VS_PROPER.ordinary.parts.map((p) => (
                  <div key={p} className="text-xs text-slate-300 py-1 flex items-center gap-2">
                    <span className="text-sky-400 flex-shrink-0">•</span> {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#0a0f1c] border border-amber-500/20">
              <div className="text-base font-bold text-amber-400 mb-1">{ORDINARY_VS_PROPER.proper.title}</div>
              <div className="text-[10px] text-slate-500 italic mb-3">{ORDINARY_VS_PROPER.proper.latin}</div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{ORDINARY_VS_PROPER.proper.description}</p>
              <div className="space-y-1">
                {ORDINARY_VS_PROPER.proper.parts.map((p) => (
                  <div key={p} className="text-xs text-slate-300 py-1 flex items-center gap-2">
                    <span className="text-amber-400 flex-shrink-0">•</span> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mass Intentions */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-300 font-bold text-sm">MI</span>
            Mass Intentions
          </h2>
          <div className="p-5 rounded-xl bg-[#0a0f1c] border border-purple-500/20">
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">{MASS_INTENTIONS.description}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {MASS_INTENTIONS.types.map((t) => (
                <div key={t} className="text-xs text-slate-400 py-1 flex items-center gap-2">
                  <span className="text-purple-300 flex-shrink-0">•</span> {t}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic leading-relaxed">{MASS_INTENTIONS.practice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrayerCard({ title, subtitle, color, latin, text, explanation, expanded, onToggle }: {
  title: string; subtitle: string; color: string; latin: string; text: string; explanation: string; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div className="mb-4 rounded-2xl overflow-hidden bg-[#0a0f1c] border border-slate-800/50 shadow-sm transition-all duration-300">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow" style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}>
          <span className="text-white text-base font-bold" style={{ filter: "brightness(10)" }}>{title.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">{title}</div>
          <div className="text-xs text-slate-400 italic">{subtitle}</div>
        </div>
        <span className="text-slate-500 text-sm transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0 ml-[52px]">
          {latin && (
            <div className="p-4 rounded-xl mb-4 bg-amber-500/10 border border-amber-500/20 italic text-sm text-slate-300 leading-relaxed">{latin}</div>
          )}
          <div className="p-4 rounded-xl mb-4 bg-slate-800/40 border border-slate-800/50 text-sm text-slate-300 leading-relaxed whitespace-pre-line">{text}</div>
          <p className="text-xs text-slate-500 leading-relaxed pl-4 border-l-2" style={{ borderColor: `${color}40` }}>{explanation}</p>
        </div>
      )}
    </div>
  );
}

function PenitentialActCard({ name, description, text, absolution, index, expanded, onToggle }: {
  name: string; description: string; text: string; absolution: string; index: number; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0a0f1c] border border-slate-800/50 transition-all duration-300">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 text-left">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">{index}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-200">{name}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{description}</div>
        </div>
        <span className="text-slate-500 text-xs transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-12">
          <div className="p-3 rounded-lg mb-3 bg-slate-800/40 border border-slate-800/50 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{text}</div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
            <strong>Absolution:</strong> {absolution}
          </div>
        </div>
      )}
    </div>
  );
}

function EucharisticPrayerCard({ name, description, keyElements, whenToUse, index, expanded, onToggle }: {
  name: string; description: string; keyElements: string[]; whenToUse: string; index: number; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0a0f1c] border border-rose-500/20 transition-all duration-300">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 text-left">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-300">EP{index}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-200">{name}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{description}</div>
        </div>
        <span className="text-slate-500 text-xs transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-12">
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">{description}</p>
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key Elements</div>
            {keyElements.map((ke) => (
              <div key={ke} className="text-xs text-slate-300 py-1 flex items-center gap-2">
                <span className="text-rose-300 flex-shrink-0">•</span> {ke}
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
            <strong>When to use:</strong> {whenToUse}
          </div>
        </div>
      )}
    </div>
  );
}