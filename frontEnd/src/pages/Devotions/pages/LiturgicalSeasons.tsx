import { useState } from "react";

const SEASONS = [
  {
    id: "advent",
    name: "Advent",
    duration: "4 weeks before Christmas",
    color: "#8B5CF6",
    textColor: "#E5E7EB",
    liturgicalFocus: "Preparation and Hope",
    description: "A time of anticipation for Christ's coming, both at Christmas and His Second Coming.",
    keyPrayers: ["O Come, O Come, Emmanuel", "Prepare the Way", "Gift of Hope"],
    typicalThemes: ["Hope", "Expectation", "Repentance", "Penitence"],
    practices: [
      "Advent Wreath with 4 candles (3 violet + 1 rose on Gaudete Sunday)",
      "Daily Advent devotions and Scripture readings focusing on prophecy and preparation",
      "Less festive decorations, more contemplative atmosphere in the home and church",
      "O Antiphons prayed at Evening Prayer (December 17\u201323)",
      "Fasting on Ember Days (Wednesday, Friday, Saturday before December 13)",
      "Confession and spiritual preparation for Christmas"
    ],
    scriptureFocus: [
      "Isaiah 40:1-11 (Comfort, comfort my people)",
      "Matthew 24:36-44 (Watch and pray)",
      "Philippians 4:4-7 (Rejoice in the Lord)"
    ],
    history: "Advent observance began in the 4th century in the Western Church, originally lasting 6 weeks until the Christmas season was shortened. The 4-candle Advent wreath tradition developed in the 19th century in Germany.",
    prayers: [
      {
        title: "Veni, Redemptor Familiae",
        text: "Come, Redeemer of the nations, come to reign among us. Remember, O faithful, the blessed procession of the years. Grant unto every heart the grace to know Christ, the Son of Mary. From the Father born, our Lord in all His glory",
        author: "Anonymous, 4th century"
      },
      {
        title: "O Antiphons",
        text: "O Wisdom, which camest out of the mouth of the Most High, and reachest from end to end mightily: come and teach us the way of understanding.",
        author: "Attributed to Saint Bede the Venerable"
      }
    ],
    icons: [
      { name: "Advent Wreath", description: "Traditional four-candle wreath symbolizing the four weeks of preparation" },
      { name: "Prophet Isaiah", description: "Prophesied the coming of the Messiah" },
      { name: "O Antiphons", description: "Seven ancient invocations sung before Christmas" }
    ]
  },
  {
    id: "christmas",
    name: "Christmas",
    duration: "12 days (Dec 25 - Jan 6)",
    color: "#FBBF24",
    textColor: "#1F2937",
    liturgicalFocus: "Incarnation and Revelation",
    description: "The celebration of God's radical act of becoming human in Jesus Christ, emphasizing the mystery of the Incarnation.",
    keyPrayers: ["Silent Night", "Gloria", "Noël"],
    typicalThemes: ["Joy", "Peace", "Generosity", "Family"],
    practices: [
      "Christmas Novena (December 16\u201324)",
      "Misa de Gallo (Midnight Mass) on Christmas Eve",
      "Epiphany celebrations and the Blessing of Homes (January 6)",
      "Nativity scene display and veneration",
      "Fasting from Christmas until the Baptism of the Lord",
      "Joyful hymns and the singing of the Gloria at every Mass"
    ],
    scriptureFocus: [
      "John 1:14 (The Word became flesh)",
      "Colossians 1:15-20 (Christ, the image of invisible God)",
      "Luke 2:1-20 (The nativity story)"
    ],
    history: "Christmas celebrations date back to the 4th century when the Western Church adopted December 25th to coincide with pagan solstice festivals. The 12 Days of Christmas originated in medieval Europe as a period of feasting and religious observance.",
    prayers: [
      {
        title: "Puer Natus Est",
        text: "A Child is born to us, a Son is given to us. The government rests on His shoulders, and His name shall be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
        author: "From Isaiah 9:5"
      },
      {
        title: "Gloria in Excelsis Deo",
        text: "Glory to God in the highest, and on earth peace to people of good will. We praise you, we bless you, we adore you, we glorify you, we give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father.",
        author: "From Luke 2:14"
      },
      {
        title: "Hail, Holy Queen (Salve Regina)",
        text: "Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope. To you do we cry, poor banished children of Eve. To you do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, your eyes of mercy toward us. And after this our exile, show unto us the blessed fruit of your womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
        author: "Traditional Marian antiphon, 11th century"
      }
    ],
    icons: [
      { name: "Nativity Scene", description: "Traditional manger scene depicting the Holy Family" },
      { name: "Saint Joseph", description: "Patron of the Universal Church and protector of families" },
      { name: "Star of Bethlehem", description: "The star that guided the Magi to the Christ Child" }
    ]
  },
  {
    id: "lent",
    name: "Lent",
    duration: "40 days (excluding Sundays)",
    color: "#DC2626",
    textColor: "#FEF2F2",
    liturgicalFocus: "Penitence, Prayer, Almsgiving",
    description: "A 40-day journey of spiritual renewal, mirroring Jesus' 40 days in the desert, focusing on conversion and preparation for Easter.",
    keyPrayers: ["Litany of the Saints", "Jesus Prayer", "Miserere"],
    typicalThemes: ["Repentance", "Fasting", "Prayer", "Charity"],
    practices: [
      "Fasting and abstinence on Ash Wednesday and Good Friday",
      "Abstinence from meat on all Fridays of Lent",
      "Daily Stations of the Cross meditation",
      "Prayer of the Faithful with special Lenten intentions",
      "Almsgiving and charitable works",
      "Sacramental Reconciliation (Confession)",
      "Lenten fast from distractions (media, entertainment)"
    ],
    scriptureFocus: [
      "Matthew 4:1-11 (Jesus' temptation)",
      "2 Corinthians 12:7-9 (Paul's thorn)",
      "Hebrews 12:1-2 (running the race)"
    ],
    history: "Lent developed from early Christian practices of preparing catechumens for baptism during the Easter Vigil. The 40-day period symbolizes Jesus' 40 days in the desert. The word 'Lent' comes from the old English 'lencten' meaning 'spring'.",
    prayers: [
      {
        title: "Veni Creator Spiritus",
        text: "Come, Holy Spirit, Creator of all, fill the hearts of your faithful. By the light of your wisdom, guide our steps today. By the warmth of your love, sustain our efforts. By the power of your mercy, heal our wounds.",
        author: "Attributed to Saint Ambrose, 9th century"
      },
      {
        title: "Miserere",
        text: "Have mercy on me, O God, according to your steadfast love; according to your abundant mercy, blot out my transgressions. Wash me thoroughly from my iniquity, and cleanse me from my sin.",
        author: "Psalm 51:1\u20132"
      },
      {
        title: "Stabat Mater",
        text: "At the cross her station keeping, stood the mournful Mother weeping, close to Jesus to the last. Through her heart, His sorrow sharing, now His bitter grief she bares. O most sorrowful Mother, pray for us to God.",
        author: "Jacopone da Todi, 13th century"
      }
    ],
    icons: [
      { name: "Jesus in the Desert", description: "Jesus praying during his 40 days of temptation" },
      { name: "Cross", description: "Symbol of sacrifice and redemption" },
      { name: "Lentern Fast", description: "The discipline of fasting and abstinence during Lent" }
    ]
  },
  {
    id: "easter",
    name: "Easter",
    duration: "50 days (until Pentecost)",
    color: "#10B981",
    textColor: "#1F2937",
    liturgicalFocus: "Resurrection and New Life",
    description: "The greatest celebration of the Christian faith, commemorating Christ's resurrection from the dead and the promise of new life in Him.",
    keyPrayers: ["Exultet", "Veni Creator Spiritus", "Sanctus"],
    typicalThemes: ["Victory", "Renewal", "Hope", "Life"],
    practices: [
      "Easter Vigil with the blessing of the new fire and Paschal Candle",
      "Baptismal renewal and reception of the Sacraments of Initiation",
      "Resurrection meditations and the Easter Proclamation (Exultet)",
      "Easter food traditions: lamb, bread, and festive meals",
      "The 50-day Easter season: Alleluia is sung at every Mass",
      "Visiting the Blessed Sacrament in repose"
    ],
    scriptureFocus: [
      "Romans 6:4-11 (Buried with Christ in baptism)",
      "1 Peter 1:3 (Living hope through resurrection)",
      "Acts 1:8 (Receiving the Holy Spirit)"
    ],
    history: "Easter Sunday celebrations date back to the earliest Christian communities, commemorating Christ's resurrection. The 50-day period continues until Pentecost, completing the Easter season.",
    prayers: [
      {
        title: "Exultet",
        text: "Rejoice, O mother Church, in the splendor of this night! For this is the night when Christ broke the bonds of death and rose victorious from the grave. O truly blessed night, when things of heaven are wed to those of earth, and the divine to the human.",
        author: "From the Easter Vigil liturgy"
      },
      {
        title: "Veni Sancte Spiritus",
        text: "Come, Holy Spirit, fill the hearts of your faithful. By the light of your wisdom, guide our steps today. By the warmth of your love, sustain our efforts. By the power of your mercy, heal our wounds.",
        author: "Ancient Latin sequence, 13th century"
      },
      {
        title: "Regina Caeli",
        text: "Queen of Heaven, rejoice, Alleluia! For He whom you merited to bear, Alleluia! Has risen as He said, Alleluia! Pray for us to God, Alleluia!",
        author: "Traditional Marian antiphon, 13th century"
      }
    ],
    icons: [
      { name: "Resurrection", description: "Christ rising from the tomb, triumph over death" },
      { name: "Paschal Candle", description: "The great candle lit from the new fire at the Easter Vigil" },
      { name: "Empty Tomb", description: "The tomb found empty, confirming the resurrection" }
    ]
  },
  {
    id: "ascension",
    name: "Ascension",
    duration: "1 day (40 days after Easter)",
    color: "#3B82F6",
    textColor: "#F9FAFB",
    liturgicalFocus: "Christ's Glorification",
    description: "Celebrates Jesus' ascension into heaven, 40 days after Easter, affirming His divine nature and our call to heaven.",
    keyPrayers: ["Miserere", "Veni Creator Spiritus"],
    typicalThemes: ["Glory", "Mission", "Hope", "Vocation"],
    practices: [
      "Reading of the Gospel of John 21 (post-resurrection appearance at the Sea of Tiberias)",
      "Meditation on Christ's words: 'I am going to prepare a place for you' (John 14:2)",
      "Praying for missionaries and evangelists",
      "Looking forward to the coming of the Holy Spirit at Pentecost",
      "The 40 days: counting the days from Easter to Ascension as a period of preparation"
    ],
    scriptureFocus: [
      "Acts 1:9-11 (Jesus taken up into heaven)",
      "Ephesians 4:10 (Christ ascended above all)",
      "Luke 24:50-53 (Jesus blessing his disciples)"
    ],
    history: "Ascension observance dates back to the early 4th century when the Church in Jerusalem celebrated the feast at the site believed to be the Ascension, now the Church of the Ascension on the Mount of Olives.",
    prayers: [
      {
        title: "Veni, Creator Spiritus",
        text: "Come, Holy Spirit, Creator of all, fill the hearts of your faithful. By the light of your wisdom, guide our steps today. By the warmth of your love, sustain our efforts. By the power of your mercy, heal our wounds.",
        author: "Attributed to Saint Ambrose, 9th century"
      },
      {
        title: "Prayer for the Ascension",
        text: "Lord Jesus Christ, you ascended into heaven and sat at the right hand of the Father. Send your Holy Spirit upon us so that we may always be firm in the faith, constant in hope, and burning with love. You live and reign with the Father and the Holy Spirit, one God, for ever and ever. Amen.",
        author: "From the Roman Missal"
      }
    ],
    icons: [
      { name: "Christ Ascending", description: "Jesus ascending into heaven, taken up by a cloud" },
      { name: "Mount of Olives", description: "The traditional site of the Ascension" },
      { name: "Cloud of Witnesses", description: "Reference to Hebrews 12:1" }
    ]
  },
  {
    id: "pentecost",
    name: "Pentecost",
    duration: "1 day (50 days after Easter)",
    color: "#FCD34D",
    textColor: "#1F2937",
    liturgicalFocus: "Birth of the Church",
    description: "Celebrates the coming of the Holy Spirit upon the apostles, marking the birth of the Christian Church and the beginning of evangelization.",
    keyPrayers: ["Veni Sancte Spiritus", "Omnipotens", "Deus"],
    typicalThemes: ["Fire", "Wind", "Unity", "Mission"],
    practices: [
      "Reading of Acts 2 (the coming of the Holy Spirit)",
      "Blessing with Holy Oil (Oil of Catechumens and Sick)",
      "Veneration of the tongues of fire and the descent of the Spirit",
      "Renewal of baptismal promises",
      "Praying for the gifts of the Holy Spirit: wisdom, understanding, counsel, fortitude, knowledge, piety, and fear of the Lord",
      "Fire ceremonies or candles representing the tongues of fire"
    ],
    scriptureFocus: [
      "Acts 2:1-13 (the coming of the Holy Spirit)",
      "John 14:16-17 (the Advocate)",
      "Romans 8:11 (the Spirit of life)"
    ],
    history: "Pentecost observance dates back to the earliest Christian communities, celebrating the fulfillment of Jesus' promise to send the Holy Spirit. The Greek word 'pentecostē' means 'fiftieth' referring to 50 days after Easter.",
    prayers: [
      {
        title: "Veni Sancte Spiritus",
        text: "Come, Holy Spirit, fill the hearts of your faithful and kindle in them the fire of your love. Send forth your Spirit and they shall be created. And you shall renew the face of the earth.",
        author: "Veni Sancte Spiritus, 13th century sequence"
      },
      {
        title: "Omnipotens Deus",
        text: "Almighty and eternal God, who by the outpouring of the Holy Spirit enlightened the hearts of the faithful, grant that by the same Holy Spirit we may be enlightened and made wise, and ever rejoice in His consolation. Through Christ our Lord. Amen.",
        author: "From the Roman Missal"
      },
      {
        title: "Come, Holy Ghost",
        text: "Come, Holy Ghost, our souls inspire, and lighten with celestial fire. Thou the anointing Spirit art, who dost thy sevenfold gifts impart. Thy blessed unction from above, teaches us to know the Father's love. O most gracious Paraclete, to the poor and needy sweet, teach us to pray and intercede, and pour thy graces on our way.",
        author: "Traditional Veni Creator, 9th century"
      }
    ],
    icons: [
      { name: "Tongues of Fire", description: "The Holy Spirit descending as flames of fire upon the apostles" },
      { name: "Dove", description: "The Holy Spirit in the form of a dove, symbolizing peace and purity" },
      { name: "Wind", description: "The mighty wind of the Holy Spirit filling the Upper Room" }
    ]
  },
  {
    id: "ordinary_time",
    name: "Ordinary Time",
    duration: "Several periods throughout the year",
    color: "#6B7280",
    textColor: "#F9FAFB",
    liturgicalFocus: "Growth in Holiness",
    description: "The remaining portions of the liturgical year, focusing on the ongoing mission of the Church and spiritual growth in everyday life.",
    keyPrayers: ["Our Father", "Hail Mary", "Glory Be"],
    typicalThemes: ["Growth", "Mission", "Sanctification", "Holiness"],
    practices: [
      "Celebrating Sundays and Solemnities",
      "Living out the Gospel in daily life",
      "Participating in the sacraments regularly",
      "Serving others and building community"
    ],
    scriptureFocus: [
      "Matthew 5:3-12 (The Beatitudes)",
      "Ephesians 4:1-16 (Building up the body of Christ)",
      "Romans 12:1-2 (Being transformed by renewal of mind)"
    ],
    history: "The term 'Ordinary Time' comes from the Latin 'tempus per annum' meaning 'time during the year.' These periods were originally called 'before Easter' (præcēna) and 'after Easter' (postcēna) but later became known as 'Ordinary Time' referring to their ordinal position in the liturgical calendar.",
    prayers: [
      {
        title: "Our Father",
        text: "Our Father who art in heaven, hallowed be thy name, thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us, and lead us not into temptation, but deliver us from evil.",
        author: "From Matthew 6:9\u201313"
      },
      {
        title: "Hail Mary",
        text: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
        author: "From Luke 1:28, 42"
      },
      {
        title: "Prayer for Growth in Holiness",
        text: "Lord Jesus Christ, you said: 'I am the vine, you are the branches. Whoever remains in me and I in him will bear much fruit, for without me you can do nothing.' Increase our faith, strengthen our hope, and kindle in us the fire of your love. May we abide in you and bear much fruit for the glory of the Father. Amen.",
        author: "Inspired by John 15:5"
      }
    ],
    icons: [
      { name: "Cross of Ordinary Time", description: "The simple wooden cross, symbol of Christ's victory over death in the midst of daily life" },
      { name: "Alpha and Omega", description: "Christ as the beginning and the end, the Alpha and Omega of the liturgical year" },
      { name: "Dove and Flame", description: "The Holy Spirit dwelling in the ordinary moments of our lives" }
    ]
  }
];

const SEASON_COLORS = {
  advent: { bg: "#312e81", border: "#6366f1" },
  christmas: { bg: "#991b1b", border: "#ef4444" },
  lent: { bg: "#7f1d1d", border: "#dc2626" },
  easter: { bg: "#166534", border: "#22c55e" },
  ascension: { bg: "#1e40af", border: "#3b82f6" },
  pentecost: { bg: "#854d0e", border: "#facc15" },
  ordinary_time: { bg: "#374151", border: "#6b7280" }
};

function SeasonCard({ season }: { season: typeof SEASONS[0] }) {
  const color = SEASON_COLORS[season.id as keyof typeof SEASON_COLORS];
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="rounded-2xl transition-all duration-500 border backdrop-blur-xl overflow-hidden"
         style={{
           background: `linear-gradient(135deg, ${color.bg}dd, ${color.bg}aa)`,
           border: `2px solid ${color.border}`,
           boxShadow: isExpanded ? `0 20px 40px ${color.border}40` : "none"
         }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-8 text-left group-hover:bg-white/5 transition-all duration-300"
      >
        <div className="flex items-center gap-6">
          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300
            ${isExpanded 
              ? "bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/30 rotate-3" 
              : "bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 group-hover:scale-105"
            }`}
          >
            {SEASONS.indexOf(season) + 1}
          </div>
          <div className="flex-1">
            <h3 className={`font-black text-xl uppercase tracking-wider transition-colors ${isExpanded ? "text-yellow-300" : "text-white group-hover:text-yellow-200"}`}
            >
              {season.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1 font-medium leading-relaxed">
              {season.duration} • {season.liturgicalFocus}
            </p>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded
          ? "bg-yellow-500/20 text-yellow-300 rotate-180"
          : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50"
        }`}
        >
          {isExpanded ? "▼" : "▶"}
        </div>
      </button>

      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="p-8 pt-0 space-y-8">
            {/* Season Overview */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-bold text-yellow-300 mb-3">Season Overview</h4>
              <p className="text-slate-300 leading-relaxed mb-4">{season.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {season.keyPrayers.map((prayer, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-900/30 rounded-full text-yellow-200 text-sm font-medium">
                    {prayer}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Themes */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 rounded-xl p-5 border border-purple-800/30">
                <h5 className="text-base font-bold text-purple-300 mb-3">🌟 Key Themes</h5>
                <ul className="space-y-2">
                  {season.typicalThemes.map((theme, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {theme}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-950/30 to-indigo-950/30 rounded-xl p-5 border border-blue-800/30">
                <h5 className="text-base font-bold text-blue-300 mb-3">📖 Scripture Focus</h5>
                <ul className="space-y-2">
                  {season.scriptureFocus.map((scripture, idx) => (
                    <li key={idx} className="text-sm text-slate-300 italic">
                      {scripture}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Practices */}
            <div className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 rounded-xl p-5 border border-green-800/30">
              <h5 className="text-base font-bold text-green-300 mb-3">🙏 Common Practices</h5>
              <div className="grid md:grid-cols-2 gap-3">
                {season.practices.map((practice, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{practice}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="bg-gradient-to-br from-amber-950/30 to-orange-950/30 rounded-xl p-5 border border-amber-800/30">
              <h5 className="text-base font-bold text-amber-300 mb-3">📚 Historical Context</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{season.history}</p>
            </div>

            {/* Prayers */}
            <div className="space-y-4">
              {season.prayers.map((prayer, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h5 className="text-base font-bold text-white mb-2">{prayer.title}</h5>
                  <p className="text-sm text-slate-300 italic mb-2">{prayer.text}</p>
                  <p className="text-xs text-slate-500">— {prayer.author}</p>
                </div>
              ))}
            </div>

            {/* Icons/Symbols */}
            <div className="bg-gradient-to-br from-red-950/30 to-rose-950/30 rounded-xl p-5 border border-red-800/30">
              <h5 className="text-base font-bold text-red-300 mb-3">🎯 Seasonal Symbols</h5>
              <div className="grid md:grid-cols-3 gap-3">
                {season.icons.map((icon, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-300 text-xl">📖</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{icon.name}</p>
                    <p className="text-xs text-slate-500">{icon.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiturgicalSeasons() {
  return (
    <div className="w-full min-h-screen bg-[#050810] relative flex flex-col overflow-hidden">
      {/* Spiritual Header */}
      <div className="flex flex-col items-center pt-16 pb-8 bg-gradient-to-b from-[#0a0f1c] to-[#050810] shadow-lg shrink-0">
        <div className="relative mb-6">
          <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-blue-500/10 blur-2xl" />
          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl text-center">
            Holy Liturgical Seasons
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap px-4 text-center">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-sm sm:text-base text-amber-300 font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] italic">
            Journey Through the Christian Year
          </p>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
        <p className="text-sm text-slate-400 mt-4 max-w-3xl text-center font-light leading-relaxed">
          The Liturgical Year is the heart of Catholic worship, guiding the faithful through the mysteries of salvation history from Advent to Ordinary Time. Each season carries unique spiritual gifts, practices, and sacred traditions that prepare us to encounter Christ more deeply.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto px-6 py-8 space-y-8">
        {SEASONS.map((season) => (
          <SeasonCard key={season.id} season={season} />
        ))}
      </div>

      <style>
        {`
          .font-serif {
            font-family: 'Noto Serif', 'serif';
          }
        `}
      </style>
    </div>
  );
}
