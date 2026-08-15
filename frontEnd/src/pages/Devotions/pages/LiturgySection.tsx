import { useState } from "react";
import MarianImage from "../components/MarianImage";

/* ═══════════════════════════════════════════════════════════════
   CATHOLIC LITURGY — EDUCATIONAL DATA
   Based on USCCB, General Instruction of the Roman Missal (GIRM),
   and Sacred Congregation of Rites documents
   ═══════════════════════════════════════════════════════════════ */

const MASS_PARTS = [
  {
    section: "Introductory Rites",
    subtitle: "Ritus Introitus",
    color: "#8B5CF6",
    icon: "\u271D",
    purpose: "The faithful are gathered into one body. The Entrance Song sets the tone; the Sign of the Cross recalls our baptism; the Act of Penitence purifies our hearts; the Kyrie calls upon God's mercy; the Gloria glorifies God; the Collect gathers the prayers of the faithful.",
    parts: [
      { name: "Entrance Procession", latin: "Processio Introitoria", desc: "The priest, deacon, and ministers process from the back of the church to the altar. The cross-bearer leads with candles. An Entrance Antiphon is sung or recited from the Roman Missal. The faithful stand.", posture: "Stand" },
      { name: "Sign of the Cross", latin: "Signum Crucis", desc: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen. This recalls our Baptism and invokes the Most Holy Trinity.", posture: "Stand" },
      { name: "Greeting", latin: "Salutatio", desc: "The priest greets the people: 'The grace of our Lord Jesus Christ, and the love of God, and the communion of the Holy Spirit be with you all.' The people respond: 'And with your spirit.'", posture: "Stand" },
      { name: "Act of Penitence", latin: "Actus Paenitentiae", desc: "We acknowledge our sins and ask for God's mercy. The Confiteor ('I confess') is recited: 'I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned...' The priest then pronounces the absolution.", posture: "Stand" },
      { name: "Kyrie Eleison", latin: "Kyrie Eleison", desc: "Kyrie Eleison = Lord, have mercy. Christe Eleison = Christ, have mercy. This ancient Greek prayer calls upon God's mercy. It is always said, even when the Act of Penitence is replaced by another form.", posture: "Stand" },
      { name: "Gloria in Excelsis Deo", latin: "Gloria in Excelsis Deo", desc: "Glory to God in the highest. This ancient hymn of praise is omitted during Advent and Lent. It begins with the angels' song at Christ's birth (Luke 2:14) and continues with a doxology to the Trinity.", posture: "Stand" },
      { name: "Collect", latin: "Collecta", desc: "The priest collects the prayers of all present into one prayer, which he recites aloud. The people respond: 'Amen.' This prayer changes daily and is specific to the liturgical celebration.", posture: "Stand" },
    ],
  },
  {
    section: "Liturgy of the Word",
    subtitle: "Liturgia Verbi",
    color: "#2563EB",
    icon: "\u270D",
    purpose: "God speaks to His people through Sacred Scripture. On Sundays and Holy Days, there are three readings: First Reading (Old Testament), Responsorial Psalm, Second Reading (New Testament Epistle), Gospel Acclamation, and Gospel. The Homily connects the readings to daily life. The Creed professes our faith. The Universal Prayer intercedes for all.",
    parts: [
      { name: "First Reading", latin: "Lectio Prima", desc: "A reading from the Old Testament (or from the Acts of the Apostles during Easter Time). The lector proclaims from the Lectionary at the ambo. The reading is chosen to correspond thematically with the Gospel.", posture: "Sit" },
      { name: "Responsorial Psalm", latin: "Psalmus Responsorius", desc: "A psalm or canticle is sung or recited in response to the First Reading. The congregation responds with a refrain (the response). This is God's word set to music, meant to help us meditate on the reading.", posture: "Sit" },
      { name: "Second Reading", latin: "Lectio Secunda", desc: "A reading from one of the New Testament Epistles (Paul, James, Peter, John, etc.). On weekdays there are only two readings; the second reading is omitted.", posture: "Sit" },
      { name: "Gospel Acclamation", latin: "Acclamatio Evangelii", desc: "Alleluia (or during Lent: 'Praise to you, Lord Jesus Christ'). The Gospel Book is processed to the ambo. All stand and sing. This acclamation expresses joy at hearing Christ's words.", posture: "Stand" },
      { name: "Gospel", latin: "Evangelium", desc: "The deacon (or priest) proclaims the Gospel from the Lectionary. Before reading, he may incense the Book of the Gospels. The congregation stands and makes the Sign of the Cross on forehead, lips, and heart before the reading.", posture: "Stand" },
      { name: "Homily", latin: "Homilia", desc: "The priest (or deacon) explains the Word of God, connecting the readings to the liturgy and to the daily life of the faithful. The homily is obligatory on Sundays and Holy Days.", posture: "Sit" },
      { name: "Profession of Faith (Credo)", latin: "Symbolum Nicaenum", desc: "The Nicene Creed is recited on Sundays and Solemnities. The Apostles' Creed may be used at other times. This is the Church's profession of faith, summarizing the core doctrines of Christianity.", posture: "Stand" },
      { name: "Universal Prayer", latin: "Prex Universalis", desc: "Also called the Prayer of the Faithful. The deacon (or lector) introduces the intentions. The faithful pray for the Church, civil authorities, the sick, the local community, and all people of good will.", posture: "Stand" },
    ],
  },
  {
    section: "Liturgy of the Eucharist",
    subtitle: "Liturgia Eucharistica",
    color: "#DC2626",
    icon: "\u2726",
    purpose: "The heart of the Mass. The bread and wine are offered to God. Through the words of institution and the power of the Holy Spirit, they become the Body and Blood of Christ. The faithful unite their own offerings to Christ's perfect sacrifice on the Cross.",
    parts: [
      { name: "Preparation of the Gifts", latin: "Praeparatio Donorum", desc: "The faithful bring forward the bread and wine. The priest offers them to God: 'Blessed are you, Lord God of all creation, for through your goodness we have received the wine we offer you.' The people respond: 'Blessed be God forever.'", posture: "Stand" },
      { name: "Prayer over the Offerings", latin: "Super Oblata", desc: "A prayer recited over the prepared gifts. This changes daily and is proper to the specific celebration.", posture: "Stand" },
      { name: "Preface Dialogue", latin: "Dialogus Praefationis", desc: "The priest: 'The Lord be with you.' People: 'And with your spirit.' Priest: 'Lift up your hearts.' People: 'We lift them up to the Lord.' Priest: 'Let us give thanks to the Lord our God.' People: 'It is right and just.'", posture: "Stand" },
      { name: "Preface", latin: "Praefatio", desc: "A hymn of thanksgiving that recounts God's saving deeds. There are different Prefaces for different seasons and feasts. It ends with the Sanctus.", posture: "Stand" },
      { name: "Sanctus", latin: "Sanctus", desc: "Holy, Holy, Holy Lord God of hosts! Heaven and earth are full of your glory. Hosanna in the highest! Blessed is he who comes in the name of the Lord. Hosanna in the highest! This is the song of the Seraphim (Isaiah 6:3) and the crowd at Christ's entry into Jerusalem.", posture: "Stand" },
      { name: "Eucharistic Prayer", latin: "Prex Eucharistica", desc: "The central prayer of the Mass. It contains: the Preface, the Epiclesis (invocation of the Holy Spirit), the Institution Narrative and Consecration ('This is my Body... This is my Blood'), the Memorial Acclamation, the Anamnesis (memorial of Christ's saving work), the Intercessions, and the Final Doxology.", posture: "Stand" },
      { name: "Epiclesis", latin: "Epiclesis", desc: "The priest extends his hands over the gifts and invokes the Holy Spirit: 'Make holy, therefore, these gifts, we pray, by sending down your Spirit upon them like the dewfall.' Through the epiclesis, the bread and wine become the Body and Blood of Christ.", posture: "Stand" },
      { name: "Institution Narrative", latin: "Narratio Institutionis", desc: "'Take this, all of you, and eat of it: for this is my Body, which will be given up for you.' 'Take this, all of you, and drink from it: for this is the chalice of my Blood, the Blood of the new and eternal covenant... Do this in memory of me.' These are the words of Christ at the Last Supper.", posture: "Stand" },
      { name: "Memorial Acclamation", latin: "Acclamatio Memorialis", desc: "The people proclaim: 'We proclaim your Death, O Lord, and profess your Resurrection until you come again.' (or another approved form). This is the Church's response to the consecration.", posture: "Stand" },
      { name: "Great Amen", latin: "Amen Magnum", desc: "After the Final Doxology ('Through him, and with him, and in him, O God, almighty Father, in the unity of the Holy Spirit, all glory and honor is yours, for ever and ever'), the people sing or say a great 'Amen.' This is the longest 'Amen' of the liturgy.", posture: "Stand" },
    ],
  },
  {
    section: "Communion Rite",
    subtitle: "Ritus Communionis",
    color: "#059669",
    icon: "\u2727",
    purpose: "The faithful receive the Body and Blood of Christ. The Lord's Prayer is recited. The Sign of Peace is exchanged. The Lamb of God is sung. The faithful approach the altar to receive Holy Communion. Sacred silence follows for personal prayer.",
    parts: [
      { name: "Lord's Prayer (Pater Noster)", latin: "Oratio Dominica", desc: "The priest invites the faithful to pray the prayer that Christ himself taught us: 'Our Father, who art in heaven, hallowed be thy name...' This prayer contains all the petitions of the New Testament.", posture: "Stand" },
      { name: "Embolism", latin: "Embolismus", desc: "After the Lord's Prayer, the priest prays: 'Deliver us, Lord, we pray, from every evil, graciously grant peace in our days...' The people respond: 'For the kingdom, the power and the glory are yours now and for ever.'", posture: "Stand" },
      { name: "Sign of Peace", latin: "Signum Pacis", desc: "The priest (or deacon) says: 'The peace of the Lord be with you always.' The people: 'And with your spirit.' Then: 'Let us offer each other the sign of peace.' The faithful exchange a sign of peace with those near them.", posture: "Stand" },
      { name: "Breaking of the Bread", latin: "Fractio Panis", desc: "The priest breaks the consecrated Host while the Lamb of God is sung. The fraction rite recalls Christ breaking bread at the Last Supper and the early Church's practice.", posture: "Stand" },
      { name: "Agnus Dei", latin: "Agnus Dei", desc: "Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, have mercy on us. Lamb of God, you take away the sins of the world, grant us peace. This prayer echoes John the Baptist's words: 'Behold the Lamb of God' (John 1:29).", posture: "Stand" },
      { name: "Holy Communion", latin: "Communio", desc: "The priest shows the consecrated Host to the congregation: 'Behold the Lamb of God, behold him who takes away the sins of the world. Blessed are those called to the supper of the Lamb.' The faithful approach in a procession. Those receiving may bow, extend hands, and say 'Amen.' Those not receiving may cross arms over chest for a blessing.", posture: "Approach the altar" },
      { name: "Prayer after Communion", latin: "Oratio post Communionem", desc: "After all have received, the priest prays a prayer of thanksgiving. The people respond: 'Amen.' This prayer is proper to the day's celebration.", posture: "Stand" },
    ],
  },
  {
    section: "Concluding Rites",
    subtitle: "Ritus Conclusionis",
    color: "#B45309",
    icon: "\u2728",
    purpose: "The Mass is concluded. The priest sends the faithful forth to glorify God by their lives. A final blessing is given. The priest and ministers process out.",
    parts: [
      { name: "Announcements", latin: "Annuntiationes", desc: "If any announcements are necessary, they are made at this time. These should be brief and relevant to the parish community.", posture: "Stand" },
      { name: "Final Blessing", latin: "Benedictio Finalis", desc: "The priest gives the Trinitarian blessing: 'May almighty God bless you, the Father, and the Son, and the Holy Spirit.' The people respond: 'Amen.' On special occasions, a more solemn form of blessing may be given.", posture: "Stand" },
      { name: "Dismissal", latin: "Dismissio", desc: "The deacon (or priest) says: 'Go in peace, glorifying the Lord by your life.' or 'Go forth, the Mass is ended.' or another approved formula. The people respond: 'Thanks be to God.' This sends the faithful to be Christ's presence in the world.", posture: "Stand" },
      { name: "Recessional", latin: "Recessus", desc: "The priest and ministers process down the main aisle to the church entrance. A Recessional Hymn is sung. The faithful are encouraged to remain in prayer until the priest has departed.", posture: "Stand / Kneel briefly" },
    ],
  },
];

const LITURGICAL_SEASONS = [
  {
    name: "Advent",
    latin: "Adventus",
    color: "#7C3AED",
    colorName: "Violet (Purple)",
    duration: "4 Sundays before Christmas",
    dates: "Late November \u2013 December 24",
    meaning: "A time of joyful expectation and preparation for the coming of Christ. The word 'Advent' comes from the Latin 'adventus,' meaning 'coming.' We prepare for both Christ's first coming at Christmas and His Second Coming at the end of time.",
    symbols: ["Advent Wreath (4 candles, 3 violet + 1 rose)", "O Antiphons (Dec 17\u201323)", "Rose candle on Gaudete Sunday (3rd Sunday)", "Violet vestments (more subdued than Lent)"],
    readings: "Isaiah's prophecies of the Messiah (Isaiah 7:14, 9:6, 11:1\u201310), John the Baptist preparing the way (Matthew 3:1\u201312), the Annunciation (Luke 1:26\u201338).",
    disciplines: "Increased prayer, fasting on Ember Days, Advent Wreath at home, O Antiphons at Evening Prayer, daily examination of conscience.",
    specialDays: [
      { day: "First Sunday of Advent", note: "New liturgical year begins. The Liturgical Year begins not on January 1, but on the First Sunday of Advent." },
      { day: "December 8 \u2013 Immaculate Conception", note: "Holy Day of Obligation. Celebrates Mary being conceived without original sin." },
      { day: "Third Sunday \u2013 Gaudete Sunday", note: "Rose vestments. 'Gaudete' means 'Rejoice' (Philippians 4:4). The rose candle is lit on the Advent wreath." },
      { day: "December 17\u201323 \u2013 O Antiphons", note: "Seven ancient Marian antiphons: O Sapientia, O Adonai, O Radix Jesse, O Clavis David, O Oriens, O Rex Gentium, O Emmanuel." },
    ],
  },
  {
    name: "Christmas",
    latin: "Nativitas",
    color: "#FFFFFF",
    colorName: "White",
    duration: "Christmas Day to Baptism of the Lord",
    dates: "December 25 \u2013 January",
    meaning: "We celebrate the Incarnation \u2013 God becoming man. The joy of salvation history fulfilled. The Word became flesh and dwelt among us (John 1:14).",
    symbols: ["Manger/Crib scene", "Star of Bethlehem", "White vestments of joy", "Paschal candle (until Epiphany)"],
    readings: "The Infancy Narratives: Luke 2:1\u201320 (Nativity), Matthew 2:1\u201312 (Epiphany), John 1:1\u201318 (Prologue of John).",
    disciplines: "Christmas caroling, visiting the manger, charitable works, exchange of gifts as a sign of God's greatest Gift.",
    specialDays: [
      { day: "December 24 \u2013 Christmas Eve", note: "Vigil Mass of Christmas. The four 'Midnight' Masses." },
      { day: "December 25 \u2013 Christmas Day", note: "Holy Day of Obligation. Nativity of the Lord." },
      { day: "December 26 \u2013 St. Stephen", note: "First Martyr. Red vestments." },
      { day: "December 27 \u2013 St. John", note: "Evangelist and Apostle. White vestments." },
      { day: "December 28 \u2013 Holy Innocents", note: "The children killed by Herod (Matthew 2:16\u201318). Red vestments." },
      { day: "January 1 \u2013 Solemnity of Mary", note: "Holy Day of Obligation. The Blessed Virgin Mary as Mother of God." },
      { day: "Sunday after Jan 1 \u2013 Epiphany", note: "The Magi visit the Christ child. 'Epiphany' means 'manifestation' \u2013 God revealed to the Gentiles." },
      { day: "Sunday after Epiphany \u2013 Baptism of the Lord", note: "End of the Christmas season. Jesus' baptism in the Jordan by John." },
    ],
  },
  {
    name: "Ordinary Time",
    latin: "Tempus Per Annum",
    color: "#16A34A",
    colorName: "Green",
    duration: "Two periods in the year",
    dates: "After Epiphany \u2013 Ash Wednesday; after Pentecost \u2013 Christ the King",
    meaning: "The word 'ordinary' comes from 'ordinal' (numbered weeks), not 'boring.' During Ordinary Time, we meditate on the full mystery of Christ \u2013 His life, teachings, death, and resurrection. Green symbolizes hope and growth in faith.",
    symbols: ["Green vestments of hope", "Growth and life", "The Sunday readings carry us through Matthew (Year A), Mark (Year B), Luke (Year C).", "Ordinary Time is the longest season of the liturgical year."],
    readings: "The Gospel cycle rotates: Year A \u2013 Matthew, Year B \u2013 Mark, Year C \u2013 Luke. John's Gospel is read at key feasts in all three years. The first readings follow a semi-continuous reading from the Old Testament.",
    disciplines: "Living out the faith in daily life. The Christian life is a journey of growth in holiness.",
    specialDays: [
      { day: "Corpus Christi (Thursday after Trinity Sunday)", note: "Solemnity of the Most Holy Body and Blood of Christ. Eucharistic procession." },
      { day: "Sacred Heart (Friday after Corpus Christi)", note: "Devotion to the Sacred Heart of Jesus." },
      { day: "All Saints (November 1)", note: "Holy Day of Obligation. Celebrates all the saints, known and unknown." },
      { day: "Christ the King (Last Sunday)", note: "The last Sunday of the liturgical year. Christ reigns over all creation." },
    ],
  },
  {
    name: "Lent",
    latin: "Quadragesima",
    color: "#7C3AED",
    colorName: "Violet (Purple)",
    duration: "Ash Wednesday to Holy Thursday",
    dates: "February \u2013 March/April (40 days, not counting Sundays)",
    meaning: "A 40-day period of prayer, fasting, and almsgiving in preparation for Easter. Jesus fasted 40 days in the desert (Matthew 4:1\u20132). We unite ourselves to Christ's sacrifice through penance.",
    symbols: ["Ash Wednesday ashes (from blessed palm branches)", "Violet vestments of penance", "Laetare Sunday (4th Sunday) \u2013 rose vestments of joy", "Stations of the Cross", "Crown of thorns", "Vestments and altar cloths stripped on Holy Thursday"],
    readings: "The Temptation of Jesus (Matthew 4:1\u201311), the Transfiguration (Matthew 17:1\u20138), the Prodigal Son (Luke 15:11\u201332), the woman at the well (John 4:1\u201342).",
    disciplines: "Fasting (Ash Wednesday & Good Friday \u2013 one full meal, two smaller meals), abstinence from meat on Fridays, increased prayer (Stations of the Cross, Lenten devotions), almsgiving (charitable works), Confession.",
    specialDays: [
      { day: "Ash Wednesday", note: "Beginning of Lent. Ashes imposed on foreheads: 'Remember that you are dust, and to dust you shall return' (Genesis 3:19)." },
      { day: "Fourth Sunday \u2013 Laetare Sunday", note: "Rose vestments. 'Laetare' means 'Rejoice' (Isaiah 66:10). A brief respite of joy in the midst of Lent." },
      { day: "Annunciation (March 25)", note: "The angel Gabriel announces to Mary that she will conceive the Son of God (Luke 1:26\u201338)." },
    ],
  },
  {
    name: "Easter",
    latin: "Pascha",
    color: "#FFFFFF",
    colorName: "White",
    duration: "Easter Vigil to Pentecost (50 days)",
    dates: "March \u2013 April \u2013 May (date varies with the moon)",
    meaning: "The greatest feast of the Church year. We celebrate the Resurrection of Jesus Christ \u2013 the foundation of our faith. 'If Christ has not been raised, your faith is futile' (1 Corinthians 15:17). The 50 days of Easter are a single great feast.",
    symbols: ["Paschal Candle (lit from new fire at Easter Vigil)", "White vestments of triumph", "Alleluia returns after Lenten absence", "Easter Water (blessed at the Vigil)", "Baptismal symbols"],
    readings: "The Resurrection narratives in all four Gospels, the Acts of the Apostles (daily readings), John 14\u201317 (Farewell Discourse).",
    disciplines: "Joy and celebration! The Easter fast is replaced by feasting. The faithful are encouraged to receive the Sacraments of Initiation at the Easter Vigil. The Alleluia is sung at every Mass.",
    specialDays: [
      { day: "Holy Thursday (Mass of the Lord's Supper)", note: "Commemorates the Last Supper and the institution of the Eucharist. The washing of the feet (John 13:1\u201317). The Blessed Sacrament is carried to the Altar of Repose. The altar is stripped." },
      { day: "Good Friday", note: "The Passion of the Lord. The only day of the year without a Mass. The Liturgy of the Word, Veneration of the Cross, and Holy Communion (from hosts consecrated on Holy Thursday). Fasting and abstinence are obligatory." },
      { day: "Holy Saturday (Easter Vigil)", note: "The greatest liturgy of the year. The Liturgy of Light (new fire, Paschal Candle), Liturgy of the Word (7 Old Testament readings), Liturgy of Baptism (baptisms and confirmations), Liturgy of the Eucharist." },
      { day: "Easter Sunday", note: "The Resurrection of the Lord. The greatest day in the liturgical year. 'This is the day the Lord has made; let us rejoice and be glad in it' (Psalm 118:24)." },
      { day: "Divine Mercy Sunday (2nd Sunday of Easter)", note: "Celebrates the infinite mercy of God, revealed to St. Faustina Kowalska." },
      { day: "Ascension (40 days after Easter)", note: "Holy Day of Obligation. Christ ascends to heaven (Acts 1:1\u201311, Luke 24:46\u201353)." },
      { day: "Pentecost Sunday (50 days after Easter)", note: "The descent of the Holy Spirit upon the Apostles (Acts 2:1\u201313). The birthday of the Church. Red vestments. The Alleluia is sung for the last time until the following Easter." },
    ],
  },
];

const LITURGICAL_COLORS = [
  { color: "#FFFFFF", name: "White", hex: "#FFFFFF", meaning: "Light, innocence, purity, joy, triumph, glory. Used for Christmas and Easter seasons, feasts of the Lord (except His Passion), of Mary, of Angels, and of non-martyr Saints.", occasions: "Christmas, Easter, Epiphany, Ascension, Pentecost, All Saints, feasts of non-martyr saints, Baptisms, Weddings." },
  { color: "#DC2626", name: "Red", hex: "#DC2626", meaning: "The Passion, blood, fire, God's love, martyrdom. The color of the Holy Spirit's fire and of the blood shed by martyrs.", occasions: "Palm Sunday, Good Friday, Pentecost, feasts of Apostles and Evangelists, feasts of Martyrs." },
  { color: "#16A34A", name: "Green", hex: "#16A34A", meaning: "The Holy Spirit, life eternal, hope. Green is the color of living things and symbolizes the growth of the Church and of the individual soul in grace.", occasions: "Ordinary Time (most of the liturgical year)." },
  { color: "#7C3AED", name: "Violet", hex: "#7C3AED", meaning: "Penance, humility, melancholy, preparation. The violet flower bows its head in humility. Purple dye was precious in the ancient world.", occasions: "Advent, Lent, Masses for the Dead, Rogation Days, Ember Days, vigils." },
  { color: "#F472B6", name: "Rose", hex: "#F472B6", meaning: "Joy and rejoicing in the midst of penitential seasons. A lighter shade of violet.", occasions: "Gaudete Sunday (3rd Sunday of Advent), Laetare Sunday (4th Sunday of Lent)." },
  { color: "#000000", name: "Black", hex: "#000000", meaning: "Mourning, sorrow, penitence. The color of death and of hope in the Resurrection.", occasions: "All Souls Day, Requiem Masses (Masses for the Dead)." },
  { color: "#D4AF37", name: "Gold", hex: "#D4AF37", meaning: "May replace white, red, or green for greater solemnity (but not violet or black). Gold symbolizes the highest glory and celebration.", occasions: "Christmas Day, Easter Sunday, solemn occasions at the discretion of the celebrant." },
];

const MASS_OBJECTS = [
  { category: "Sacred Vessels", items: [
    { name: "Chalice", desc: "The cup used to hold the Precious Blood of Christ. Usually made of precious metal (gold or silver-lined). The paten rests on top." },
    { name: "Paten", desc: "The shallow plate used to hold the bread (hosts) for the celebration of the Eucharist." },
    { name: "Ciborium", desc: "A covered vessel used to hold the consecrated hosts for Holy Communion." },
    { name: "Cruets", desc: "Two small vessels containing water and wine, used during the Preparation of the Gifts." },
    { name: "Pall", desc: "A stiff square of cloth placed over the chalice to keep it pure and protected." },
  ]},
  { category: "Altar & Sanctuary", items: [
    { name: "Altar", desc: "The table on which the Eucharist is celebrated. It represents Christ, the living stone. It is oriented toward the people (versus populum) or toward the east (ad orientem)." },
    { name: "Ambo", desc: "The lectern or pulpit from which the Scriptures are proclaimed and the homily is delivered." },
    { name: "Tabernacle", desc: "The locked receptacle where the consecrated hosts are reserved for Communion to the sick and for adoration. The sanctuary lamp burns nearby." },
    { name: "Baptistery", desc: "The area containing the baptismal font, where the Sacrament of Baptism is celebrated." },
  ]},
  { category: "Liturgical Books", items: [
    { name: "Roman Missal", desc: "The liturgical book containing the prayers, readings, and rubrics for the celebration of Mass." },
    { name: "Lectionary", desc: "The liturgical book containing the Scripture readings for the Mass, arranged according to the three-year cycle." },
    { name: "Book of the Gospels", desc: "A specially bound book containing the four Gospels, used during the proclamation of the Gospel at Mass." },
  ]},
  { category: "Vestments", items: [
    { name: "Chasuble", desc: "The outer vestment worn by the priest during the celebration of Mass. It symbolizes the charity and love of Christ." },
    { name: "Stole", desc: "A long strip of cloth worn around the neck, signifying priestly authority and dignity." },
    { name: "Alb", desc: "The white linen garment worn by the priest, symbolizing the baptismal garment and purity." },
    { name: "Dalmatic", desc: "The vestment worn by the deacon, similar to the chaluble but with sleeves." },
  ]},
];

const READING_CYCLE = [
  { year: "Year A", gospel: "Matthew", description: "The Gospel of Matthew is proclaimed. Focuses on Jesus as the fulfillment of Old Testament prophecy and the new Moses.", yearRange: "2023, 2026, 2029..." },
  { year: "Year B", gospel: "Mark", description: "The Gospel of Mark is proclaimed. The shortest Gospel, emphasizing Jesus' suffering, death, and resurrection.", yearRange: "2024, 2027, 2030..." },
  { year: "Year C", gospel: "Luke", description: "The Gospel of Luke is proclaimed. Emphasizes Jesus' compassion, mercy, and concern for the poor and outcast.", yearRange: "2025, 2028, 2031..." },
];

const KYRIE = {
  greek: "Kyrie eleison \u2014 Christe eleison \u2014 Kyrie eleison",
  english: "Lord, have mercy \u2014 Christ, have mercy \u2014 Lord, have mercy",
  explanation: "This is the oldest surviving prayer in the Roman Rite. It is the only part of the Mass that has remained in Greek (the language of the early Church) rather than Latin. The threefold repetition recalls the Holy Trinity.",
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
  english: "Holy, Holy, Holy Lord God of hosts! Heaven and earth are full of your glory. Hosanna in the highest. Blessed is he who comes in the name of the Lord. Hosanna in the highest!",
  explanation: "The Sanctus draws from Isaiah 6:3 (the Seraphim's cry) and Matthew 21:9 (the crowd's acclamation at Christ's entry into Jerusalem). It is sung at the climax of the Preface, leading into the Eucharistic Prayer.",
};

const AGNUS_DEI = {
  text: "Lamb of God, you take away the sins of the world, have mercy on us.\nLamb of God, you take away the sins of the world, have mercy on us.\nLamb of God, you take away the sins of the world, grant us peace.",
  explanation: "The Agnus Dei echoes John the Baptist's words upon seeing Jesus: 'Behold the Lamb of God, who takes away the sin of the world' (John 1:29). It is sung during the Breaking of the Bread, recalling the Passover Lamb whose sacrifice freed Israel.",
};

const LITURGY_OF_HOURS = [
  { name: "Office of Readings", latin: "Lectio Divina", time: "Any time of day (traditionally before dawn)", description: "The most substantial of the Hours. Includes two readings (one from Scripture, one from the Church Fathers or spiritual writers) and a prayer." },
  { name: "Morning Prayer (Lauds)", latin: "Laudes", time: "Upon rising in the morning", description: "The prayer of praise and thanksgiving for the new day. Includes an opening dialogue, a hymn, three psalms with antiphons, a short reading, the Benedictus (Canticle of Zechariah), intercessions, and the concluding prayer." },
  { name: "Daytime Prayer", latin: "Hora Media", time: "Midday (main prayer) or morning/afternoon", description: "The simplest of the Hours. Includes a hymn, three psalms with antiphons, a short reading, and the concluding prayer." },
  { name: "Evening Prayer (Vespers)", latin: "Vesperae", time: "At the close of day", description: "The prayer of thanksgiving for the day's gifts. Includes an opening dialogue, a hymn, two psalms with antiphons, a short reading, the Magnificat (Canticle of Mary), intercessions, and the concluding prayer." },
  { name: "Night Prayer (Compline)", latin: "Completorium", time: "Before retiring to bed", description: "The simplest and most intimate of the Hours. Includes an examination of conscience, a hymn, psalms, the Nunc Dimittis (Canticle of Simeon), and a final Marian antiphon." },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

type LiturgyTab = "mass" | "seasons" | "objects" | "hours";
const TABS: { key: LiturgyTab; label: string; icon: string }[] = [
  { key: "mass",    label: "The Holy Mass",    icon: "\u271D" },
  { key: "seasons", label: "Liturgical Year",   icon: "\u2600" },
  { key: "objects", label: "Sacred Objects",    icon: "\u2726" },
  { key: "hours",   label: "Liturgy of the Hours", icon: "\u231A" },
];

/* ═══════════════════════════════════════════════════════════════
   ADDITIONAL LITURGY DATA
   ═══════════════════════════════════════════════════════════════ */

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
    text: "The priest blesses the water and sprinkles the people while an antiphon is sung (e.g., 'I saw water flowing from the temple' \u2013 Ezekiel 47:1-2, 5-9, 12 or Psalm 51). The assembly is reminded of their baptismal promises.",
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

const HOLY_DAYS_OF_OBLIGATION = [
  { date: "January 1", name: "Solemnity of Mary, Mother of God", note: "The first solemnity of the liturgical year." },
  { date: "Ascension Thursday", name: "Ascension of the Lord", note: "40 days after Easter. Celebrates Christ's ascent to heaven." },
  { date: "Corpus Christi (or following Sunday)", name: "Corpus Christi", note: "Celebrates the Body and Blood of Christ." },
  { date: "August 15", name: "Assumption of the Blessed Virgin Mary", note: "Mary was assumed body and soul into heaven." },
  { date: "November 1", name: "All Saints", note: "Celebrates all the saints in heaven, known and unknown." },
  { date: "November (varies)", name: "Christ the King", note: "Last Sunday of the liturgical year." },
  { date: "December 8", name: "Immaculate Conception", note: "Mary was conceived without original sin." },
  { date: "December 25", name: "Christmas", note: "Nativity of the Lord." },
];

const RANKS_OF_CELEBRATIONS = [
  { rank: "Solemnity", latin: "Solemnia", description: "The highest rank. Celebrations of the Lord, the Blessed Virgin Mary, and Saints of special importance. Gloria and Creed are always said. Proper readings and prayers. White, Red, or Green vestments.", examples: "Christmas, Easter, Pentecost, Trinity Sunday, All Saints, Immaculate Conception, Assumption, Christ the King, Dedication of a Church." },
  { rank: "Feast", latin: "Festum", description: "Celebrations of significant importance, though lesser than Solemnities. Gloria is said (except in Lent and Advent). Creed is said on Sundays and Holy Days. Proper readings. The vestment color is proper to the saint or feast.", examples: "Birth of St. John the Baptist, Saints Peter and Paul, Conversion of St. Paul, Chair of St. Peter, St. Joseph, Dedication of Sts. Peter and Paul." },
  { rank: "Memorial", latin: "Memoria", description: "Celebrations of Saints. Gloria is omitted. The prayers are proper to the saint (from the Commons). The vestment color is proper to the saint (Red for martyrs, White for others).", examples: "St. Ignatius of Loyola, St. Teresa of Avila, St. Francis de Sales, St. Vincent de Paul." },
  { rank: "Optional Memorial", latin: "Memoria ad libitum", description: "Similar to Memorial but at the discretion of the celebrant. The priest may use the prayers of the saint or the Mass of the day. A second collect may be added from an Optional Memorial.", examples: "St. Blaise, St. Scholastica, St. Claude de la Colombiere." },
];

const O_ANTIPHONS = [
  { date: "December 17", antiphon: "O Sapientia", english: "O Wisdom", text: "O Wisdom, who came from the mouth of the Most High, reaching from end to end and ordering all things mightily and sweetly: come and teach us the way of prudence." },
  { date: "December 18", antiphon: "O Adonai", english: "O Lord of the House of Israel", text: "O Adonai, and Leader of the House of Israel, who appeared to Moses in the flame of the burning bush and gave him the Law on Sinai: come and redeem us with an outstretched arm." },
  { date: "December 19", antiphon: "O Radix Jesse", english: "O Root of Jesse", text: "O Root of Jesse, who stands for a sign of the people; before you kings shall bow down and nations shall cry out: come and deliver us, and do not delay." },
  { date: "December 20", antiphon: "O Clavis David", english: "O Key of David", text: "O Key of David, Scepter of the House of Israel; who opens and no one can shut, who shuts and no one can open: come and liberate the prisoner who sits in darkness and in the shadow of death." },
  { date: "December 21", antiphon: "O Oriens", english: "O Rising Dawn", text: "O Rising Dawn, splendor of eternal Light, Sun of Justice: come and shine upon those who sit in darkness and in the shadow of death." },
  { date: "December 22", antiphon: "O Rex Gentium", english: "O King of the Nations", text: "O King of the Nations, and their Cornerstone, who unites the separated into one: come and save mankind, whom you formed from the dust of the earth." },
  { date: "December 23", antiphon: "O Emmanuel", english: "O Emmanuel", text: "O Emmanuel, our King and Lawgiver, the hope and salvation of the nations: come and save us, O Lord our God." },
];

const SEQUENCES = [
  { feast: "Easter Sunday", name: "Victimae Paschali Laudes", english: "To the Paschal Victim", note: "Sung after the Alleluia on Easter Sunday and throughout the Easter octave. The most ancient Easter sequence." },
  { feast: "Pentecost Sunday", name: "Veni Sancte Spiritus", english: "Come, Holy Spirit", note: "Attributed to Pope Innocent III (1200). The most widely known sequence in the Roman Rite." },
  { feast: "Corpus Christi", name: "Lauda Sion Salvatorem", english: "Praise, O Zion", text: "Praise, O Zion, your Savior, praise your Shepherd and Leader with hymns and canticles...", note: "Composed by St. Thomas Aquinas (1264) for the Feast of Corpus Christi." },
  { feast: "Sacred Heart", name: "Laudes crucis attollamus", english: "Let Us Raise the Praises of the Cross", note: "Sung on the Feast of the Exaltation of the Holy Cross (September 14)." },
  { feast: "Requiem Mass (Funeral)", name: "Dies Irae", english: "Day of Wrath", note: "The ancient sequence for Requiem Masses. Describes the Day of Judgment. One of the most famous pieces of medieval Latin poetry (by Thomas of Celano, c. 1250)." },
];

const SPECIAL_MASSES = [
  {
    name: "Nuptial Mass (Wedding)",
    description: "A Mass celebrated at the time of the marriage ceremony. It includes special prayers for the couple, the exchange of consent, the blessing of rings, and the nuptial blessing. The readings are chosen from those for the celebration of marriage or the day's readings.",
    elements: ["Exchange of Consent", "Blessing of Rings", "Nuptial Blessing", "Preface of Marriage", "Solemn Blessing for Marriage", "White vestments (joy and purity)"],
  },
  {
    name: "Funeral Mass (Requiem)",
    description: "The Mass offered for the repose of the soul of the deceased. It is the most important funeral rite. The body is sprinkled with holy water and draped with a white pall. Incense is used. The coffin is placed before the altar.",
    elements: ["Sprinkling with Holy Water", "White Pall on the Coffin", "Incense", "Entrance Antiphon for the Dead", "Proper Readings for the Dead", "Prayer over the Offerings for the Dead", "Preface for the Dead", "Final Commendation and Farewell"],
    note: "Black vestments may be used (permitted in the US). White is more common. The Dies Irae sequence was traditionally sung but is now optional.",
  },
  {
    name: "Anointing of the Sick",
    description: "The sacrament of the sick is celebrated within Mass or separately. The anointing is given by the priest to the sick using the Oil of the Sick, blessed by the Bishop at the Chrism Mass on Holy Thursday.",
    elements: ["Laying on of Hands", "Anointing with Oil of the Sick on the forehead and hands", "Prayer for healing", "Proper prayers and readings"],
  },
  {
    name: "Mass of Christian Burial for a Child",
    description: "The funeral Mass for a child who died before the age of reason. White vestments are used (not black), reflecting the hope of eternal life and the purity of the child.",
    elements: ["White vestments and pall", "The coffin is carried by the parents or family", "Proper readings and prayers", "No penitential rite (child is innocent)"],
  },
  {
    name: "Votive Masses",
    description: "Masses offered for a particular intention, outside the required celebration of the day. They may be celebrated on weekdays that are not Feasts or Memorials. The faithful may request a Votive Mass for a special intention (e.g., for peace, for the sick, for vocations).",
    elements: ["Proper prayers for the intention", "White, Red, or Violet vestments (depending on the intention)", "Cannot replace a Sunday, Feast, or Holy Day celebration"],
  },
  {
    name: "Masses with Children",
    description: "Adapted form of Mass for children, with simplified readings, language, and gestures. The Eucharistic Prayers for Masses with Children (I-III) are approved for use.",
    elements: ["Simplified readings and homily", "Shorter Eucharistic Prayers", "Active participation encouraged", "Age-appropriate language"],
  },
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
    description: "The parts of the Mass that change according to the day's celebration \u2013 the liturgical season, feast, memorial, or memorial of a saint. These texts are specific to each day and give the Mass its unique character.",
    parts: ["Entrance Antiphon (Introit)", "Responsorial Psalm", "Gospel Acclamation (Alleluia)", "Offertory Antiphon", "Communion Antiphon", "Collect (Opening Prayer)", "Prayer over the Offerings", "Prayer after Communion", "Proper Preface"],
  },
};

export default function LiturgySection() {
  const [activeTab, setActiveTab] = useState<LiturgyTab>("mass");
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [expandedObject, setExpandedObject] = useState<string | null>(null);

  const togglePart = (key: string) => setExpandedPart(expandedPart === key ? null : key);
  const toggleSeason = (key: string) => setExpandedSeason(expandedSeason === key ? null : key);
  const toggleObject = (key: string) => setExpandedObject(expandedObject === key ? null : key);

  return (
    <div style={{ position: "relative", zIndex: 5 }}>
      {/* ═══════════ MARIAN HEADER ═══════════ */}
      <div style={{
        display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
        background: "linear-gradient(135deg, #FFFFFF, #FDF6EC)",
        border: "1px solid rgba(217,119,6,0.18)",
        borderRadius: 16, padding: "16px 20px", marginBottom: 24,
      }}>
        <MarianImage
          src="/images/mary-rosary.jpg"
          caption="Our Lady of the Rosary"
          size={76}
          href="/devotions/rosary"
        />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B45309" }}>The Liturgy & The Blessed Mother</div>
          <p style={{ fontSize: 13, color: "#78716C", margin: "4px 0 0", lineHeight: 1.5 }}>
            In every liturgical season the Church honours Mary, the first disciple, whose fiat echoes through the sacred mysteries we celebrate.
          </p>
        </div>
      </div>

      {/* ═══════════ TAB BAR ═══════════ */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap",
        background: "#FFFFFF", borderRadius: 14, padding: 5,
        border: "1px solid rgba(28,25,23,0.08)", backdropFilter: "blur(12px)",
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: isActive ? 700 : 500, flex: "1 1 0", minWidth: 120,
              background: isActive ? "#1C1917" : "transparent",
              color: isActive ? "#FFFFFF" : "#78716C", transition: "all 0.25s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isActive ? "0 2px 12px rgba(28,25,23,0.06)" : "none",
            }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

       {/* ═══════════ HOW TO PARTICIPATE ═══════════ */}
       {activeTab === "mass" && (
         <div>
           {/* Intro card */}
           <div style={{
             background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
             borderRadius: 16, padding: "28px 32px", marginBottom: 24,
             backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
           }}>
             <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(124,58,237,0.07) 0%, transparent 50%)" }} />
             <div style={{ position: "relative", zIndex: 1 }}>
               <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1C1917", margin: 0, marginBottom: 8 }}>
                 Structure of the Holy Mass
               </h2>
               <p style={{ fontSize: 14, color: "#57534E", margin: 0, lineHeight: 1.7, maxWidth: 800 }}>
                 The Mass is the source and summit of the Christian life (<em>Lumen Gentium</em>, 11).
                 It is divided into two main parts: the <strong style={{ color: "#7C3AED" }}>Liturgy of the Word</strong> and the
                 {" "}<strong style={{ color: "#E11D48" }}>Liturgy of the Eucharist</strong>, joined by the Introductory Rites
                 and concluded by the Concluding Rites. Each part contains specific elements that have been celebrated
                 since the earliest centuries of the Church.
               </p>
            </div>
          </div>

           {/* Mass sections */}

          {/* Mass sections */}
          {MASS_PARTS.map((section) => (
            <div key={section.section} style={{ marginBottom: 24 }}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
                padding: "14px 20px", borderRadius: 14,
                background: `linear-gradient(135deg, ${section.color}10 0%, ${section.color}10 100%)`,
                border: `1px solid ${section.color}25`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, ${section.color}, ${section.color}CC)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 16px rgba(28,25,23,0.06)`,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 20, filter: "brightness(10)" }}>{section.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: 0 }}>{section.section}</h3>
                  <p style={{ fontSize: 12, color: "#78716C", margin: "2px 0 0", fontStyle: "italic" }}>{section.latin}</p>
                </div>
              </div>

              {/* Purpose */}
              <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 12px 58px", lineHeight: 1.7 }}>
                {section.purpose}
              </p>

              {/* Parts list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: 58 }}>
                {section.parts.map((part) => {
                  const isOpen = expandedPart === `${section.section}-${part.name}`;
                  return (
                    <div key={part.name} style={{
                      borderRadius: 10, overflow: "hidden",
                      background: isOpen ? "#FFFFFF" : "transparent",
                      border: isOpen ? "1px solid rgba(28,25,23,0.08)" : "1px solid transparent",
                      transition: "all 0.2s",
                    }}>
                      <button onClick={() => togglePart(`${section.section}-${part.name}`)} style={{
                        display: "flex", alignItems: "center", width: "100%", padding: "12px 16px",
                        border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                        textAlign: "left", gap: 12,
                        background: isOpen ? "#FFFFFF" : "transparent",
                        color: isOpen ? "#1C1917" : "#57534E",
                        transition: "all 0.2s",
                      }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: section.color,
                          background: `${section.color}10`,
                        }}>
                          {part.posture === "Stand" ? "\u2191" : part.posture === "Sit" ? "\u2193" : part.posture === "Kneel" ? "\u2197" : "\u271D"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <span style={{ display: "block" }}>{part.name}</span>
                          <span style={{ fontSize: 11, color: "#78716C", fontWeight: 400, fontStyle: "italic" }}>{part.latin}</span>
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                          background: "#F5F5F4", color: "#78716C", flexShrink: 0,
                        }}>
                          {part.posture}
                        </span>
                        <span style={{ fontSize: 12, color: "#78716C", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>&#9662;</span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: "0 16px 14px 56px", fontSize: 13, color: "#57534E", lineHeight: 1.8 }}>
                          {part.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ═══════════ ORDINARY VS PROPER (Mass tab) ═══════════ */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px" }}>Ordinary vs. Proper of the Mass</h3>
            <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 16px", lineHeight: 1.7 }}>
              Every Mass contains both fixed and changing elements. Understanding this distinction helps the faithful participate more fully.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
              <div style={{ padding: "18px 20px", borderRadius: 14, background: "#FFFFFF", border: "1px solid rgba(2,132,199,0.30)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0284C7", marginBottom: 4 }}>{ORDINARY_VS_PROPER.ordinary.title}</div>
                <div style={{ fontSize: 11, color: "#78716C", fontStyle: "italic", marginBottom: 8 }}>{ORDINARY_VS_PROPER.ordinary.latin}</div>
                <p style={{ fontSize: 12, color: "#57534E", margin: "0 0 10px", lineHeight: 1.6 }}>{ORDINARY_VS_PROPER.ordinary.description}</p>
                {ORDINARY_VS_PROPER.ordinary.parts.map((p) => (
                  <div key={p} style={{ fontSize: 12, color: "#57534E", padding: "3px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "#0284C7", flexShrink: 0 }}>&#8226;</span> {p}
                  </div>
                ))}
              </div>
              <div style={{ padding: "18px 20px", borderRadius: 14, background: "#FFFFFF", border: "1px solid rgba(217,119,6,0.30)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#D97706", marginBottom: 4 }}>{ORDINARY_VS_PROPER.proper.title}</div>
                <div style={{ fontSize: 11, color: "#78716C", fontStyle: "italic", marginBottom: 8 }}>{ORDINARY_VS_PROPER.proper.latin}</div>
                <p style={{ fontSize: 12, color: "#57534E", margin: "0 0 10px", lineHeight: 1.6 }}>{ORDINARY_VS_PROPER.proper.description}</p>
                {ORDINARY_VS_PROPER.proper.parts.map((p) => (
                  <div key={p} style={{ fontSize: 12, color: "#57534E", padding: "3px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "#D97706", flexShrink: 0 }}>&#8226;</span> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════ RANKS OF CELEBRATIONS ═══════════ */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px" }}>Ranks of Liturgical Celebrations</h3>
            <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 16px", lineHeight: 1.7 }}>
              The Church classifies celebrations by rank, which determines the prayers, readings, and solemnity of the liturgy.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {RANKS_OF_CELEBRATIONS.map((r) => (
                <div key={r.rank} style={{ padding: "18px 20px", borderRadius: 14, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "#F5F5F4", color: "#1C1917" }}>{r.rank}</span>
                    <span style={{ fontSize: 11, color: "#78716C", fontStyle: "italic" }}>{r.latin}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#57534E", margin: "0 0 8px", lineHeight: 1.6 }}>{r.description}</p>
                  <p style={{ fontSize: 11, color: "#78716C", margin: 0 }}><strong style={{ color: "#57534E" }}>Examples:</strong> {r.examples}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ HOLY DAYS OF OBLIGATION ═══════════ */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px" }}>Holy Days of Obligation</h3>
            <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 16px", lineHeight: 1.7 }}>
              The faithful are <strong style={{ color: "#E11D48" }}>obliged</strong> to attend Mass on these days. There are 10 Holy Days of Obligation in the universal Church (though some are transferred to Sundays in certain countries).
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
              {HOLY_DAYS_OF_OBLIGATION.map((hd) => (
                <div key={hd.name} style={{ padding: "14px 18px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#E11D48", marginBottom: 4 }}>{hd.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", marginBottom: 4 }}>{hd.name}</div>
                  <p style={{ fontSize: 11, color: "#78716C", margin: 0, lineHeight: 1.5 }}>{hd.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ SEQUENCES ═══════════ */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px" }}>Sequences</h3>
            <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 16px", lineHeight: 1.7 }}>
              A Sequence is a hymn sung between the Gospel Acclamation (Alleluia) and the Gospel on certain major feasts. It is optional on most feasts but required on Easter, Pentecost, Corpus Christi, and (optionally) the Requiem Mass.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SEQUENCES.map((sq) => (
                <div key={sq.name} style={{ padding: "16px 20px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1917" }}>{sq.name}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "#F5F5F4", color: "#78716C" }}>{sq.feast}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#57534E", margin: 0, lineHeight: 1.6 }}>{sq.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ SPECIAL MASSES ═══════════ */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px" }}>Special Masses & Rites</h3>
            <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 16px", lineHeight: 1.7 }}>
              The Church celebrates the Eucharist in various contexts beyond the daily and Sunday Mass, each with its own proper prayers and rites.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {SPECIAL_MASSES.map((sm) => (
                <div key={sm.name} style={{ padding: "18px 20px", borderRadius: 14, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1917", marginBottom: 6 }}>{sm.name}</div>
                  <p style={{ fontSize: 12, color: "#57534E", margin: "0 0 10px", lineHeight: 1.6 }}>{sm.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {sm.elements.map((e) => (
                      <span key={e} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 500, background: "#F5F5F4", color: "#57534E" }}>{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ LITURGICAL YEAR ═══════════ */}
      {activeTab === "seasons" && (
        <div>
          {/* Intro card */}
          <div style={{
            background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,150,105,0.07) 0%, transparent 50%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1C1917", margin: 0, marginBottom: 8 }}>
                The Liturgical Year
              </h2>
              <p style={{ fontSize: 14, color: "#57534E", margin: 0, lineHeight: 1.7, maxWidth: 800 }}>
                The liturgical year is the Church's way of living out the mystery of Christ throughout the year.
                It begins on the <strong style={{ color: "#7C3AED" }}>First Sunday of Advent</strong> and flows through the great seasons
                of preparation, celebration, and growth. Each season has its own <strong style={{ color: "#059669" }}>liturgical color</strong>,
                readings, and spiritual disciplines that help us enter more deeply into the saving events of our faith.
              </p>
            </div>
          </div>

          {/* Seasons */}
          {LITURGICAL_SEASONS.map((season) => {
            const isOpen = expandedSeason === season.name;
            return (
              <div key={season.name} style={{
                marginBottom: 16, borderRadius: 16, overflow: "hidden",
                background: "#FFFFFF",
                border: `1px solid ${isOpen ? season.color + "30" : "rgba(28,25,23,0.08)"}`,
                transition: "all 0.3s",
              }}>
                <button onClick={() => toggleSeason(season.name)} style={{
                  display: "flex", alignItems: "center", width: "100%", padding: "18px 24px",
                  border: "none", cursor: "pointer", gap: 16, textAlign: "left",
                  background: "transparent", transition: "all 0.2s",
                }}>
                  {/* Color swatch */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: season.color, border: `2px solid ${season.color}60`,
                    boxShadow: `0 4px 16px rgba(28,25,23,0.06)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: season.color === "#FFFFFF" || season.color === "#D4AF37" ? "#1a1040" : "#FFFFFF" }}>
                      {season.colorName.split(" ")[0].substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917" }}>{season.name}</div>
                    <div style={{ fontSize: 12, color: "#78716C", fontStyle: "italic" }}>{season.latin} &middot; {season.dates}</div>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 8, fontSize: 10, fontWeight: 600,
                    background: season.color === "#FFFFFF" ? "#F5F5F4" : `${season.color}10`,
                    color: season.color === "#FFFFFF" ? "#1C1917" : season.color,
                    border: season.color === "#FFFFFF" ? "1px solid rgba(28,25,23,0.12)" : `1px solid ${season.color}25`,
                    flexShrink: 0,
                  }}>
                    {season.colorName}
                  </span>
                  <span style={{ fontSize: 14, color: "#78716C", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>&#9662;</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 24px 24px 88px" }}>
                    <p style={{ fontSize: 14, color: "#57534E", lineHeight: 1.8, margin: "0 0 16px" }}>{season.meaning}</p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
                      <div style={{ padding: "14px 18px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#78716C", marginBottom: 8 }}>Symbols</div>
                        {season.symbols.map((s, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#57534E", padding: "3px 0", display: "flex", gap: 6 }}>
                            <span style={{ color: season.color, flexShrink: 0 }}>&#8226;</span> {s}
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "14px 18px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#78716C", marginBottom: 8 }}>Typical Readings</div>
                        <p style={{ fontSize: 12, color: "#57534E", margin: 0, lineHeight: 1.7 }}>{season.readings}</p>
                      </div>
                    </div>

                    <div style={{ padding: "14px 18px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#78716C", marginBottom: 8 }}>Spiritual Disciplines</div>
                      <p style={{ fontSize: 12, color: "#57534E", margin: 0, lineHeight: 1.7 }}>{season.disciplines}</p>
                    </div>

                    {season.specialDays.length > 0 && (
                      <div style={{ padding: "14px 18px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#78716C", marginBottom: 10 }}>Key Feasts & Celebrations</div>
                        {season.specialDays.map((sd, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderTop: i > 0 ? "1px solid rgba(28,25,23,0.06)" : "none" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917" }}>{sd.day}</div>
                              <div style={{ fontSize: 12, color: "#57534E", marginTop: 2, lineHeight: 1.6 }}>{sd.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Reading cycle */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 16px" }}>The Three-Year Reading Cycle</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {READING_CYCLE.map((cycle) => (
                <div key={cycle.year} style={{
                  padding: "20px 24px", borderRadius: 14,
                  background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
                  backdropFilter: "blur(8px)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: cycle.year === "Year A" ? "#3B82F610" : cycle.year === "Year B" ? "#F59E0B10" : "#8B5CF610",
                      color: cycle.year === "Year A" ? "#2563EB" : cycle.year === "Year B" ? "#D97706" : "#7C3AED",
                    }}>{cycle.year}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1C1917" }}>{cycle.gospel}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#57534E", margin: "0 0 8px", lineHeight: 1.6 }}>{cycle.description}</p>
                  <p style={{ fontSize: 11, color: "#78716C", margin: 0 }}>{cycle.yearRange}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Liturgical colors */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 16px" }}>Liturgical Colors</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {LITURGICAL_COLORS.map((lc) => (
                <div key={lc.name} style={{
                  padding: "16px 18px", borderRadius: 12,
                  background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: lc.hex, border: `2px solid ${lc.hex}50`,
                      boxShadow: `0 2px 8px rgba(28,25,23,0.06)`,
                    }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1C1917" }}>{lc.name}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#57534E", margin: "0 0 6px", lineHeight: 1.5 }}>{lc.meaning}</p>
                  <p style={{ fontSize: 10, color: "#78716C", margin: 0, lineHeight: 1.4 }}>{lc.occasions}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ O ANTIPHONS ═══════════ */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px" }}>The Great O Antiphons</h3>
            <p style={{ fontSize: 13, color: "#57534E", margin: "0 0 16px", lineHeight: 1.7 }}>
              The O Antiphons are seven ancient Marian antiphons sung at Evening Prayer (Vespers) during the last week before Christmas (December 17\u201323). Each begins with "O" and invokes Christ using an Old Testament title from Isaiah. They are the "jewels" of the Roman Liturgy. The acrostic of the first letters in Latin reads: <strong style={{ color: "#7C3AED" }}>ERO CRAS</strong> (\u201CI will be [here] tomorrow\u2013\u2013the coming of Christ).
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {O_ANTIPHONS.map((o) => (
                <div key={o.date} style={{ padding: "14px 18px", borderRadius: 12, background: "#FFFFFF", border: "1px solid rgba(124,58,237,0.30)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED" }}>{o.date}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1917" }}>{o.antiphon}</span>
                    <span style={{ fontSize: 11, color: "#78716C", fontStyle: "italic" }}>({o.english})</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#57534E", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{o.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

       {/* ═══════════ SACRED OBJECTS ═══════════ */}
      {activeTab === "objects" && (
        <div>
          <div style={{
            background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, transparent 50%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1C1917", margin: 0, marginBottom: 8 }}>
                Sacred Objects & Vestments
              </h2>
              <p style={{ fontSize: 14, color: "#57534E", margin: 0, lineHeight: 1.7, maxWidth: 800 }}>
                The Church uses sacred objects and vestments to express the dignity and beauty of the liturgy.
                Each object has a specific purpose and deep theological meaning rooted in Scripture and Tradition.
              </p>
            </div>
          </div>

          {MASS_OBJECTS.map((cat) => (
            <div key={cat.category} style={{ marginBottom: 24 }}>
              <h3 style={{
                fontSize: "1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 12px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 999, flexShrink: 0,
                  background: "#D4AF37",
                }} />
                {cat.category}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {cat.items.map((item) => {
                  const isOpen = expandedObject === `${cat.category}-${item.name}`;
                  return (
                    <div key={item.name} onClick={() => toggleObject(`${cat.category}-${item.name}`)} style={{
                      padding: "16px 18px", borderRadius: 12, cursor: "pointer",
                      background: "#FFFFFF",
                      border: `1px solid ${isOpen ? "rgba(212,175,55,0.35)" : "rgba(28,25,23,0.08)"}`,
                      transition: "all 0.2s",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1917", marginBottom: isOpen ? 8 : 0 }}>{item.name}</div>
                      {isOpen && (
                        <p style={{ fontSize: 12, color: "#57534E", margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ LITURGY OF THE HOURS ═══════════ */}
      {activeTab === "hours" && (
        <div>
          <div style={{
            background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(8,145,178,0.07) 0%, transparent 50%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1C1917", margin: 0, marginBottom: 8 }}>
                Liturgy of the Hours
              </h2>
              <p style={{ fontSize: 14, color: "#57534E", margin: 0, lineHeight: 1.7, maxWidth: 800 }}>
                Also known as the <strong style={{ color: "#0891B2" }}>Divine Office</strong> or <strong style={{ color: "#0891B2" }}>Breviary</strong>,
                the Liturgy of the Hours is the daily prayer of the universal Church. It sanctifies the hours of the day
                with praise, psalms, Scripture readings, and prayers. Priests, deacons, and religious are bound to pray it;
                the faithful are warmly encouraged to do so. It is based primarily on the <strong style={{ color: "#0891B2" }}>Psalms</strong>
                and incorporates other biblical canticles, hymns, readings, and prayers.
              </p>
            </div>
          </div>

          {LITURGY_OF_HOURS.map((hour) => (
            <div key={hour.name} style={{
              padding: "20px 24px", borderRadius: 14, marginBottom: 12,
              background: "#FFFFFF", border: "1px solid rgba(28,25,23,0.08)",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 999, flexShrink: 0,
                  background: hour.name.includes("Morning") ? "#D97706" :
                              hour.name.includes("Evening") ? "#7C3AED" :
                              hour.name.includes("Night") ? "#78716C" :
                              hour.name.includes("Office") ? "#2563EB" : "#0891B2",
                }} />
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1C1917" }}>{hour.name}</span>
                  <span style={{ fontSize: 12, color: "#78716C", marginLeft: 10, fontStyle: "italic" }}>{hour.latin}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "rgba(8,145,178,0.10)", color: "#0891B2" }}>
                  {hour.time}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#57534E", margin: 0, lineHeight: 1.7 }}>{hour.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PENITENTIAL ACT CARD
   ═══════════════════════════════════════════════════════════════ */

