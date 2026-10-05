/**
 * Comprehensive Catholic Prayer Book
 * 99 prayers across 13 categories
 * Sources: USCCB, Vatican, EWTN, Blessed Be God, Raccolta
 */

export interface CatholicPrayer {
  id: string;
  title: string;
  category: PrayerCategory;
  subcategory?: string;
  text: string;
  snippet: string;
  readTime: number;
  tags: string[];
}

export type PrayerCategory =
  | "morning"
  | "daytime"
  | "evening"
  | "night"
  | "mass"
  | "rosary"
  | "essential"
  | "acts"
  | "litanies"
  | "saints"
  | "devotions"
  | "fasting"
  | "special";

export const CATEGORY_META: Record<PrayerCategory, { label: string; description: string; icon: string; color: string; gradient: string }> = {
  morning: { label: "Morning Prayers", description: "Begin your day with God", icon: "\u2600", color: "text-amber-600", gradient: "from-amber-400 to-orange-500" },
  daytime: { label: "Daytime Prayers", description: "Pause and pray through the day", icon: "\u2605", color: "text-sky-600", gradient: "from-sky-400 to-blue-500" },
  evening: { label: "Evening Prayers", description: "Give thanks as day turns to night", icon: "\u263D", color: "text-indigo-600", gradient: "from-indigo-400 to-purple-500" },
  night: { label: "Night Prayers", description: "Rest in God's peace", icon: "\u2606", color: "text-slate-600", gradient: "from-slate-400 to-indigo-500" },
  mass: { label: "Mass Prayers", description: "Prayers for the Holy Sacrifice of the Mass", icon: "\u271D", color: "text-rose-600", gradient: "from-rose-400 to-red-500" },
  rosary: { label: "The Rosary", description: "Meditate on the mysteries of faith", icon: "\u262C", color: "text-purple-600", gradient: "from-purple-400 to-violet-500" },
  essential: { label: "Essential Prayers", description: "The foundation of Catholic prayer", icon: "\u2720", color: "text-blue-600", gradient: "from-blue-400 to-indigo-500" },
  acts: { label: "Acts of Virtue", description: "Acts of Faith, Hope, Love, and Contrition", icon: "\u2764", color: "text-pink-600", gradient: "from-pink-400 to-rose-500" },
  litanies: { label: "Litanies", description: "Solemn prayers of invocation and response", icon: "\u2726", color: "text-emerald-600", gradient: "from-emerald-400 to-teal-500" },
  saints: { label: "Prayers to Saints", description: "Ask the saints to intercede for us", icon: "\u2606", color: "text-amber-600", gradient: "from-amber-400 to-yellow-500" },
  devotions: { label: "Devotions", description: "Popular Catholic devotional prayers", icon: "\u262F", color: "text-violet-600", gradient: "from-violet-400 to-purple-500" },
  fasting: { label: "Fasting Prayers", description: "Prayers for days of fasting and penance", icon: "\u2020", color: "text-stone-600", gradient: "from-stone-400 to-stone-600" },
  special: { label: "Special Prayers", description: "For particular needs and occasions", icon: "\u2736", color: "text-teal-600", gradient: "from-teal-400 to-cyan-500" },
};

function w(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function sn(text: string, len = 120): string {
  const clean = text.replace(/\n+/g, " ").trim();
  return clean.length > len ? clean.substring(0, len).replace(/\s+\S*$/, "") + "..." : clean;
}

export const CATHOLIC_PRAYERS: CatholicPrayer[] = [
  // 1. MORNING PRAYERS (6)
  {
    id: "morning-offering",
    title: "Morning Offering",
    category: "morning",
    text: `O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day, for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all my associates, and in particular for the intentions of the Holy Father. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["daily", "offering", "jesus", "mary"],
  },
  {
    id: "morning-prayer-lauds",
    title: "Morning Prayer (Lauds)",
    category: "morning",
    text: `Lord, open my lips, and my mouth shall declare your praise.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Psalm 63: You are my God, for you I long; for you my soul is thirsting. My body pines for you like a dry, weary land without water. So I gaze on you in the sanctuary to see your strength and your glory.

Your loving mercy is better than life, my lips shall praise you. I will bless you as long as I live, I will lift up my hands, calling on your name.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Blessed be the Lord God of Israel, for he has visited and redeemed his people, and has raised up a horn of salvation for us in the house of his servant David.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["lauds", "psalm", "morning", "liturgy of the hours"],
  },
  {
    id: "invitatory",
    title: "Invitatory Prayer",
    category: "morning",
    text: `Lord, open my lips, and my mouth shall declare your praise. The Lord is my light and my help; whom shall I fear? The Lord is the stronghold of my life; before whom shall I shrink? Come, let us worship Christ, the King who is to come.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["invitatory", "morning", "liturgy of the hours"],
  },
  {
    id: "psalm-63",
    title: "Psalm 63 — O God, You Are My God",
    category: "morning",
    text: `O God, you are my God, for you I long; for you my soul is thirsting. My body pines for you like a dry, weary land without water.

So I gaze on you in the sanctuary to see your strength and your glory. Your loving mercy is better than life, my lips shall praise you.

I will bless you as long as I live, I will lift up my hands, calling on your name. My soul shall be filled as with a banquet, my mouth shall praise you with joy.

On my bed I remember you, on you I muse through the night; for you have been my help; in the shadow of your wings I rejoice.

My soul clings to you, your right hand holds me fast.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["psalm", "morning", "thirst", "longing"],
  },
  {
    id: "act-of-adoration",
    title: "Act of Adoration",
    category: "morning",
    text: `I adore You, O God, my Creator and Redeemer, with all the powers of my soul. I adore You as my supreme Good, because You are infinite, perfect, and adorable. I adore You who are essentially the sovereign Good, infinitely perfect, and absolutely happy. I adore You, hidden in the depth of my being, and I unite myself wholly to Your adorable will.

O my God, I praise You, bless You, adore You, glorify You, and give You thanks for all the benefits You have bestowed upon me. I offer to You my heart this day, and I consecrate to You all my thoughts, words, actions, and sufferings. May everything I do be for Your greater glory. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["adoration", "morning", "praise", "consecration"],
  },
  {
    id: "lauds-complete",
    title: "Lauds (Complete)",
    category: "morning",
    text: `O God, come to my assistance; O Lord, make haste to help me.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Alleluia.

Psalm 62: O God, you are my God, at dawn I seek you; for you my soul is thirsting. For you my flesh is pining, like a dry, weary land without water.

Thus have I gazed toward you in the sanctuary, to see your power and your glory. For your kindness is a greater good than life; my lips shall glorify you.

Thus will I bless you while I live; lifting up my hands, I will call upon your name.

My soul shall be filled as with a banquet; with joyful lips my mouth shall praise you.

I will remember you upon my couch, and through the night watches I will meditate on you.

For you have been my help; and in the shadow of your wings I shout for joy.

My soul clings fast to you; your right hand upholds me.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Canticle of Zachary (Benedictus): Blessed be the Lord, the God of Israel; he has come to his people and set them free. He has raised up for us a mighty Savior, born of the house of his servant David. Through his holy prophets he promised of old that he would save us from our enemies, from the hands of all who hate us. He promised to show mercy to our fathers and to remember his holy covenant. This was the oath he swore to our father Abraham: to set us free from the hands of our enemies, free to worship him without fear, holy and righteous in his sight all the days of our life.

You, my child, shall be called the Prophet of the Most High, for you will go before the Lord to prepare his way, to give his people knowledge of salvation by the forgiveness of their sins. In the tender compassion of our God the dawn from on high shall break upon us, to shine on those who dwell in darkness and the shadow of death, and to guide our feet into the way of peace.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["lauds", "morning", "complete", "benedictus"],
  },

  // 2. DAYTIME PRAYERS (4)
  {
    id: "terce",
    title: "Midmorning Prayer (Terce)",
    category: "daytime",
    text: `Come, Holy Spirit, Creator blest, and in our souls take up your rest; come with your grace and heavenly aid to fill the hearts which you have made.

O Comforter, to you we cry, O gift of God, God's self most high; living font, fervent fire, sweet unction from on high.

You sevenfold gifts of grace bestow; the word of God in you shall flow; with faith the Father's strong right hand will give us all that he has planned.

Far from us drive the deadly foe; true peace unto us let there be; with you as pilot, may we pass through the storm of life at last.

Grant us, O Father, from above, the Son, who sent him from his love, and the Spirit of both God and Son, forevermore while ages run. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["terce", "daytime", "holy spirit", "veni creator"],
  },
  {
    id: "sext",
    title: "Midday Prayer (Sext)",
    category: "daytime",
    text: `O God of truth, O Lord of might, who ordered the sun at midday light, who kindled the flame of burning zeal, and set the ark of your covenant to seal:

We beg you, Lord, to give us light, and with your splendor make us bright; let not the dark of night come near, lest shadows stain our pathway clear.

Protect us from the world's deceit, from every snare the tempter sets; keep safe the fire you lit within, and let your truth forever win.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["sext", "midday", "daytime"],
  },
  {
    id: "none",
    title: "Midafternoon Prayer (None)",
    category: "daytime",
    text: `O God, creation's secret force and self-sustaining source, whose light the world adorns; who makes the changing day with constant light repay the faithful prayer of those who toil.

We pray to you, O Lord, that as the sun begins to fade, so may all vice within us fade away, and let your truth burn brightly in our hearts.

O Christ, who at the third hour descended with the fire of the Holy Spirit upon the apostles: inflame our hearts and lips with the fire of your love, that we may worthily praise you this day and always.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["none", "midafternoon", "daytime"],
  },
  {
    id: "angelus",
    title: "The Angelus",
    category: "daytime",
    text: `V. The Angel of the Lord declared unto Mary.
R. And she conceived of the Holy Spirit.

Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

V. Behold the handmaid of the Lord.
R. Be it done unto me according to thy word.

Hail Mary, full of grace...

V. And the Word was made Flesh.
R. And dwelt among us.

Hail Mary, full of grace...

V. Pray for us, O holy Mother of God.
R. That we may be made worthy of the promises of Christ.

Let us pray: Pour forth, we beseech Thee, O Lord, Thy grace into our hearts; that we, to whom the Incarnation of Christ, Thy Son, was made known by the message of an Angel, may by His Passion and Cross be brought to the glory of His Resurrection, through the same Christ Our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["angelus", "daytime", "mary", "incarnation"],
  },

  // 3. EVENING PRAYERS (3)
  {
    id: "evening-praise",
    title: "Evening Prayer Prelude (Phos Hilaron)",
    category: "evening",
    text: `O Gladsome Light, pure brightness of the everliving Father in heaven, O Jesus Christ, holy and blessed!

Now as we come to the setting of the sun, and our eyes behold the vesper light, we sing your praises, O God: Father, Son, and Holy Spirit.

You are worthy at all times to be praised by joyful voices, O Son of God, O Giver of Life; and to be glorified through all the worlds.`,
    snippet: "",
    readTime: 0,
    tags: ["evening", "phos hilaron", "vespers", "light"],
  },
  {
    id: "magnificat",
    title: "Magnificat (Canticle of Mary)",
    category: "evening",
    text: `My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for he has looked with favor on his lowly servant.

From this day all generations will call me blessed: the Almighty has done great things for me, and holy is his name.

He has mercy on those who fear him in every generation.

He has shown the strength of his arm, he has scattered the proud in their conceit.

He has cast down the mighty from their thrones, and has lifted up the lowly.

He has filled the hungry with good things, and the rich he has sent away empty.

He has come to the help of his servant Israel for he has remembered his promise of mercy, the promise he made to our fathers, to Abraham and his children for ever.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["magnificat", "evening", "mary", "vespers", "canticle"],
  },
  {
    id: "evening-thanksgiving",
    title: "Evening Thanksgiving",
    category: "evening",
    text: `Abide with us, Lord, for it is toward evening and the day is now far spent. Abide with us and with your whole Church. Abide with us at the end of the day, when the present life shall be ended. Abide with us in your mercy. Abide with us in your goodness. Abide with us in your divine love. Abide with us, and we shall abide with you, in the life that knows no end.

O God, who gave light to this day, we thank you for the gifts of life, love, and labor. Forgive us our failures and shortcomings this day, and grant that the remaining hours of this evening may be peaceful and restful. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["evening", "thanksgiving", "abide", "vespers"],
  },

  // 4. NIGHT PRAYERS (5)
  {
    id: "compline-intro",
    title: "Compline Intro",
    category: "night",
    text: `The Lord almighty grant us a quiet night and a perfect end.

O God, make speed to save us; O Lord, make haste to help us.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Before the ending of the day, Creator of the world, we pray that you, with steadfast love, would keep your watch around us while we sleep.

From evil dreams defend our sight, from fears and terrors of the night; tread underfoot our deadly foe, that no polluted soul may do.

We ask not for our earthly crown, but grant us your celestial one. Keep us this night without a sin, O Lord, our Father and our God.

In peace we now lie down to sleep: in peace we wake your name to keep. The sacred Trinity defend, and guard us through the night. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["compline", "night", "sleep", "vespers"],
  },
  {
    id: "nunc-dimittis",
    title: "Nunc Dimittis (Canticle of Simeon)",
    category: "night",
    text: `Now, Lord, you let your servant go in peace: your word has been fulfilled.

My own eyes have seen the salvation, which you have prepared in the sight of every people: a light to reveal you to the nations, and the glory of your people Israel.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["nunc dimittis", "night", "simeon", "vespers", "canticle"],
  },
  {
    id: "examination-of-conscience",
    title: "Nightly Examination of Conscience",
    category: "night",
    text: `Lord, help me see my sins with clarity, not with despair but with the hope of your mercy. I examine this day in your presence:

Where have I failed in charity toward others? Where have I been selfish or unkind? Where have I neglected prayer or the prompting of your Holy Spirit? Where have I given into temptation and sin?

I am sorry for all my sins. I resolve, with your grace, to do better tomorrow. I place myself in your hands this night, trusting in your infinite mercy. Cleanse my heart, Lord, and give me the grace of a holy death.

O my God, I am heartily sorry for having offended thee, and I detest all my sins because of thy just punishments, but most of all because they offend thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of thy grace, to sin no more and to avoid the near occasions of sin. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["examination", "night", "conscience", "contrition"],
  },
  {
    id: "act-of-contrition",
    title: "Act of Contrition",
    category: "night",
    text: `O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.

O my God, I am heartily sorry for having offended You. I detest all my sins, especially because they offend Your infinite goodness. I firmly intend, with the assistance of Your holy grace, to do penance and to sin no more. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["contrition", "night", "confession", "sorrow"],
  },
  {
    id: "guardian-angel",
    title: "Guardian Angel Night Prayer",
    category: "night",
    text: `Angel of God, my guardian dear, to whom God's love commits me here, ever this night be at my side, to light and guard, to rule and guide.

O angel guardian dear to me, always be near and watchful be; protect me through the hours of sleep, and guard my soul while I'm at rest.

Blessed Lord, who has given charge to your angels over me, let their presence go before me and accompany me through this night. May I awake refreshed and renewed, ready to serve you this coming day. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["guardian angel", "night", "sleep", "protection"],
  },

  // 5. MASS PRAYERS (6)
  {
    id: "confiteor",
    title: "Confiteor",
    category: "mass",
    text: `I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.

May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["confiteor", "mass", "confession", "mercy"],
  },
  {
    id: "gloria",
    title: "Gloria in Excelsis",
    category: "mass",
    text: `Glory to God in the highest, and on earth peace to people of good will.

We praise you, we bless you, we adore you, we glorify you, we give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father.

Lord Jesus Christ, Only Begotten Son, Lord God, Lamb of God, Son of the Father, you take away the sins of the world, have mercy on us; you take away the sins of the world, receive our prayer; you are seated at the right hand of the Father, have mercy on us.

For you alone are the Holy One, you alone are the Lord, you alone are the Most High, Jesus Christ, with the Holy Spirit, in the glory of God the Father. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["gloria", "mass", "praise", "angels"],
  },
  {
    id: "nicene-creed",
    title: "Nicene Creed",
    category: "mass",
    text: `I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible.

I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man.

For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead, and his kingdom will have no end.

I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets.

I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["creed", "nicene", "mass", "faith", "belief"],
  },
  {
    id: "sanctus",
    title: "Sanctus",
    category: "mass",
    text: `Holy, Holy, Holy Lord God of hosts. Heaven and earth are full of your glory.

Hosanna in the highest.

Blessed is he who comes in the name of the Lord.

Hosanna in the highest.`,
    snippet: "",
    readTime: 0,
    tags: ["sanctus", "mass", "holy", "eucharist"],
  },
  {
    id: "agnus-dei",
    title: "Agnus Dei",
    category: "mass",
    text: `Lamb of God, you take away the sins of the world, have mercy on us.

Lamb of God, you take away the sins of the world, have mercy on us.

Lamb of God, you take away the sins of the world, grant us peace.`,
    snippet: "",
    readTime: 0,
    tags: ["agnus dei", "mass", "lamb", "eucharist", "peace"],
  },
  {
    id: "prayer-before-communion",
    title: "Prayer Before Communion",
    category: "mass",
    text: `Almighty and eternal God, behold I come to the sacrament of your Only-begotten Son, our Lord Jesus Christ. I come as one who is sick to the physician of life, as one unclean to the fountain of mercy, as one blind to the light of eternal brightness, as one poor and needy to the Lord of heaven and earth.

I implore you, in your great goodness, grant me grace to eat reverently the flesh of your dearly beloved Son, to drink his precious blood, and to receive the gifts of the Holy Spirit. May your Body and Blood be for me not a cause of judgment but a saving remedy. May they be a defense of mind and body, a shield against all deadly enemies. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["communion", "mass", "eucharist", "preparation"],
  },

  // 6. THE ROSARY (8)
  {
    id: "apostles-creed",
    title: "Apostles' Creed",
    category: "rosary",
    text: `I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead.

I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["creed", "apostles", "rosary", "faith"],
  },
  {
    id: "rosary-our-father",
    title: "Our Father (for the Rosary)",
    category: "rosary",
    text: `Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["our father", "rosary", "lords prayer"],
  },
  {
    id: "rosary-hail-mary",
    title: "Hail Mary (for the Rosary)",
    category: "rosary",
    text: `Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["hail mary", "rosary", "mary"],
  },
  {
    id: "rosary-glory-be",
    title: "Glory Be (for the Rosary)",
    category: "rosary",
    text: `Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["glory be", "rosary", "doxology"],
  },
  {
    id: "fatima-prayer",
    title: "Fatima Prayer",
    category: "rosary",
    text: `O My Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fatima", "rosary", "jesus", "mercy"],
  },
  {
    id: "salve-regina",
    title: "Salve Regina (Hail, Holy Queen)",
    category: "rosary",
    text: `Hail, holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.

V. Pray for us, O holy Mother of God.
R. That we may be made worthy of the promises of Christ.

Let us pray: O God, whose only-begotten Son, by his life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["salve regina", "hail holy queen", "rosary", "mary"],
  },
  {
    id: "joyful-luminous-mysteries",
    title: "Joyful & Luminous Mysteries Guide",
    category: "rosary",
    text: `JOYFUL MYSTERIES (Monday & Saturday)
1. The Annunciation — The angel Gabriel announces to Mary that she will bear the Son of God.
2. The Visitation — Mary visits her cousin Elizabeth, who is pregnant with John the Baptist.
3. The Nativity — Jesus is born in a stable in Bethlehem.
4. The Presentation — Mary and Joseph present the infant Jesus in the Temple.
5. The Finding in the Temple — The twelve-year-old Jesus is found teaching in the Temple.

LUMINOUS MYSTERIES (Thursday)
1. The Baptism of the Lord — Jesus is baptized by John in the Jordan River.
2. The Wedding at Cana — Jesus performs his first miracle, turning water into wine.
3. The Proclamation of the Kingdom — Jesus calls all to conversion and the coming of God's reign.
4. The Transfiguration — Jesus is revealed in glory on Mount Tabor.
5. The Institution of the Eucharist — At the Last Supper, Jesus gives his Body and Blood.

After each decade, pray: O My Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["rosary", "mysteries", "joyful", "luminous", "meditation"],
  },
  {
    id: "sorrowful-glorious-mysteries",
    title: "Sorrowful & Glorious Mysteries Guide",
    category: "rosary",
    text: `SORROWFUL MYSTERIES (Tuesday & Friday)
1. The Agony in the Garden — Jesus prays in the Garden of Gethsemane before his arrest.
2. The Scourging at the Pillar — Jesus is scourged by the Roman soldiers.
3. The Crowning with Thorns — Jesus is mocked and crowned with thorns.
4. The Carrying of the Cross — Jesus carries his cross to Calvary.
5. The Crucifixion — Jesus is crucified and dies on the cross.

GLORIOUS MYSTERIES (Wednesday & Sunday)
1. The Resurrection — Jesus rises from the dead on the third day.
2. The Ascension — Jesus ascends into heaven forty days after his resurrection.
3. The Descent of the Holy Spirit — The Holy Spirit descends upon the apostles at Pentecost.
4. The Assumption — Mary is taken body and soul into heaven.
5. The Coronation — Mary is crowned Queen of heaven and earth.

After each decade, pray: O My Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["rosary", "mysteries", "sorrowful", "glorious", "meditation"],
  },

  // 7. ESSENTIAL PRAYERS (5)
  {
    id: "lords-prayer",
    title: "The Lord's Prayer",
    category: "essential",
    text: `Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["our father", "essential", "lords prayer", "daily"],
  },
  {
    id: "hail-mary-essential",
    title: "Hail Mary",
    category: "essential",
    text: `Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["hail mary", "essential", "mary", "daily"],
  },
  {
    id: "glory-be-essential",
    title: "Glory Be",
    category: "essential",
    text: `Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["glory be", "essential", "doxology", "daily"],
  },
  {
    id: "anima-christi",
    title: "Anima Christi",
    category: "essential",
    text: `Soul of Christ, sanctify me.
Body of Christ, save me.
Blood of Christ, inebriate me.
Water from the side of Christ, wash me.
Passion of Christ, strengthen me.
O good Jesus, hear me.
Within your wounds, hide me.
Permit me not to be separated from you.
From the wicked enemy, defend me.
In the hour of my death, call me.
And bid me come unto you,
that I may praise you with your saints
and with your angels
forever and ever. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["anima christi", "essential", "jesus", "communion"],
  },
  {
    id: "prayer-st-michael",
    title: "Prayer to Saint Michael",
    category: "essential",
    text: `Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray. And do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["st michael", "essential", "archangel", "protection", "spiritual warfare"],
  },

  // 8. ACTS OF VIRTUE (6)
  {
    id: "act-of-faith",
    title: "Act of Faith",
    category: "acts",
    text: `O my God, I firmly believe that you are one God in three Divine Persons, Father, Son, and Holy Spirit. I believe that your divine Son became man and died for our sins, and that he will come to judge the living and the dead. I believe all the articles of the Catholic Church. This is my firm and sincere belief. Help me, O God, to live up to it. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["faith", "acts", "belief", "trinity"],
  },
  {
    id: "act-of-hope",
    title: "Act of Hope",
    category: "acts",
    text: `O my God, relying on Thy infinite goodness and promises, I hope to obtain pardon of my sins, the help of Thy grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["hope", "acts", "trust", "mercy"],
  },
  {
    id: "act-of-love",
    title: "Act of Love / Charity",
    category: "acts",
    text: `O my God, I love Thee above all things, with my whole heart and soul, because Thou art all-good and worthy of all love. I love my neighbor as myself for the love of Thee. I forgive all who have injured me, and I ask pardon of all whom I have injured. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["love", "charity", "acts", "virtue"],
  },
  {
    id: "act-of-humility",
    title: "Act of Humility",
    category: "acts",
    text: `Jesus, meek and humble of heart, make my heart like unto Thine.

O Lord, I am not worthy that Thou shouldst enter under my roof, but only say the word and my soul shall be healed.

I am the least of all your servants, and the least deserving of your merciful kindness. Grant me the grace to grow in humility, to seek not my own glory but yours, and to serve others without seeking reward. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["humility", "acts", "jesus", "virtue"],
  },
  {
    id: "act-of-trust-divine-mercy",
    title: "Act of Trust in Divine Mercy",
    category: "acts",
    text: `Jesus, I trust in You.

O Jesus, I trust in Your infinite mercy. I place all my confidence in You. I am sorry for all my sins. I abandon myself to Your will. Let Your mercy be my guide. I offer everything to You — my joys, my sufferings, my work, and my prayers. Do with me as You will. I place my entire trust in You. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["trust", "divine mercy", "acts", "jesus"],
  },
  {
    id: "act-of-spiritual-communion",
    title: "Act of Spiritual Communion",
    category: "acts",
    text: `My Jesus, I believe that You are present in the Blessed Sacrament. I love You above all things, and I desire You in my soul. Since I cannot now receive You sacramentally, come at least spiritually into my heart. I embrace You as if You were already there, and unite myself wholly to You. Never permit me to be separated from You. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["spiritual communion", "acts", "eucharist", "jesus"],
  },

  // 9. LITANIES (6)
  {
    id: "litany-sacred-heart",
    title: "Litany of the Sacred Heart of Jesus",
    category: "litanies",
    text: `Lord, have mercy on us.
Christ, have mercy on us.
Lord, have mercy on us.
Christ, hear us.
Christ, graciously hear us.

God the Father of heaven, have mercy on us.
God the Son, Redeemer of the world, have mercy on us.
God the Holy Spirit, have mercy on us.
Holy Trinity, one God, have mercy on us.

Heart of Jesus, Son of the Eternal Father, have mercy on us.
Heart of Jesus, formed by the Holy Spirit in the womb of the Virgin Mary, have mercy on us.
Heart of Jesus, substantially united to the Word of God, have mercy on us.
Heart of Jesus, of infinite majesty, have mercy on us.
Heart of Jesus, holy temple of God, have mercy on us.
Heart of Jesus, tabernacle of the Most High, have mercy on us.
Heart of Jesus, house of God and gate of heaven, have mercy on us.
Heart of Jesus, burning furnace of charity, have mercy on us.
Heart of Jesus, abode of justice and love, have mercy on us.
Heart of Jesus, full of goodness and love, have mercy on us.
Heart of Jesus, abyss of all virtues, have mercy on us.
Heart of Jesus, most worthy of all praise, have mercy on us.
Heart of Jesus, king and center of all hearts, have mercy on us.
Heart of Jesus, in whom are all treasures of wisdom and knowledge, have mercy on us.
Heart of Jesus, in whom dwells the fullness of divinity, have mercy on us.
Heart of Jesus, in whom the Father was well pleased, have mercy on us.
Heart of Jesus, of whose fullness we have all received, have mercy on us.
Heart of Jesus, desire of the eternal hills, have mercy on us.
Heart of Jesus, patient and rich in mercy, have mercy on us.
Heart of Jesus, rich to all who invoke You, have mercy on us.
Heart of Jesus, fountain of life and holiness, have mercy on us.
Heart of Jesus, propitiation for our sins, have mercy on us.
Heart of Jesus, filled with reproaches, have mercy on us.
Heart of Jesus, bruised for our offenses, have mercy on us.
Heart of Jesus, obedient unto death, have mercy on us.
Heart of Jesus, pierced with a lance, have mercy on us.
Heart of Jesus, source of all consolation, have mercy on us.
Heart of Jesus, our life and resurrection, have mercy on us.
Heart of Jesus, our peace and reconciliation, have mercy on us.
Heart of Jesus, victim for our sins, have mercy on us.
Heart of Jesus, salvation of those who trust in You, have mercy on us.
Heart of Jesus, hope of those who die in You, have mercy on us.
Heart of Jesus, delight of all the Saints, have mercy on us.

Lamb of God, who takes away the sins of the world, spare us, O Lord.
Lamb of God, who takes away the sins of the world, graciously hear us, O Lord.
Lamb of God, who takes away the sins of the world, have mercy on us.

V. Jesus, meek and humble of heart,
R. Make our hearts like unto Thine.

Let us pray: Almighty and everlasting God, look upon the heart of Your most beloved Son, and upon the acts of praise and satisfaction which He renders to You on behalf of sinners. Appeased by worthy offerings, we beg Your mercy upon those who implore Your mercy, in the name of the same Jesus Christ, Your Son, who lives and reigns with You, world without end. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["litany", "sacred heart", "jesus", "mercy"],
  },
  {
    id: "litany-loreto",
    title: "Litany of the Blessed Virgin Mary (Loreto)",
    category: "litanies",
    text: `Lord, have mercy on us.
Christ, have mercy on us.
Lord, have mercy on us.
Christ, hear us.
Christ, graciously hear us.

God the Father of heaven, have mercy on us.
God the Son, Redeemer of the world, have mercy on us.
God the Holy Spirit, have mercy on us.
Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us.
Holy Mother of God, pray for us.
Holy Virgin of virgins, pray for us.
Mother of Christ, pray for us.
Mother of the Church, pray for us.
Mother of divine grace, pray for us.
Mother most pure, pray for us.
Mother most chaste, pray for us.
Mother inviolate, pray for us.
Mother undefiled, pray for us.
Mother most amiable, pray for us.
Mother most admirable, pray for us.
Mother of good counsel, pray for us.
Mother of our Creator, pray for us.
Mother of our Savior, pray for us.
Mother of the Church, pray for us.
Virgin most prudent, pray for us.
Virgin most venerable, pray for us.
Virgin most renowned, pray for us.
Virgin most powerful, pray for us.
Virgin most merciful, pray for us.
Virgin most faithful, pray for us.
Mirror of justice, pray for us.
Seat of wisdom, pray for us.
Cause of our joy, pray for us.
Spiritual vessel, pray for us.
Vessel of honor, pray for us.
Singular vessel of devotion, pray for us.
Mystical rose, pray for us.
Tower of David, pray for us.
Tower of ivory, pray for us.
House of gold, pray for us.
Ark of the covenant, pray for us.
Gate of heaven, pray for us.
Morning star, pray for us.
Health of the sick, pray for us.
Refuge of sinners, pray for us.
Comforter of the afflicted, pray for us.
Help of Christians, pray for us.
Queen of angels, pray for us.
Queen of patriarchs, pray for us.
Queen of prophets, pray for us.
Queen of apostles, pray for us.
Queen of martyrs, pray for us.
Queen of confessors, pray for us.
Queen of virgins, pray for us.
Queen of all saints, pray for us.
Queen conceived without original sin, pray for us.
Queen assumed into heaven, pray for us.
Queen of the most holy Rosary, pray for us.
Queen of families, pray for us.
Queen of peace, pray for us.

V. Pray for us, O holy Mother of God,
R. That we may be made worthy of the promises of Christ.

Let us pray: Grant, we beg You, O Lord God, that we, Your servants, may enjoy perpetual health of mind and body; and by the glorious intercession of the Blessed Mary, ever Virgin, be delivered from present sorrows and enjoy eternal happiness. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["litany", "loreto", "mary", "litanies"],
  },
  {
    id: "litany-st-joseph",
    title: "Litany of Saint Joseph",
    category: "litanies",
    text: `Lord, have mercy on us.
Christ, have mercy on us.
Lord, have mercy on us.
Christ, hear us.
Christ, graciously hear us.

God the Father of heaven, have mercy on us.
God the Son, Redeemer of the world, have mercy on us.
God the Holy Spirit, have mercy on us.
Holy Trinity, one God, have mercy on us.

Holy Joseph, pray for us.
Illustrious son of David, pray for us.
Light of the patriarchs, pray for us.
Spouse of the Mother of God, pray for us.
Chaste guardian of the Virgin, pray for us.
Foster father of the Son of God, pray for us.
Zealous defender of Christ, pray for us.
Head of the Holy Family, pray for us.
Joseph most just, pray for us.
Joseph most chaste, pray for us.
Joseph most prudent, pray for us.
Joseph most strong, pray for us.
Joseph most obedient, pray for us.
Joseph most faithful, pray for us.
Mirror of patience, pray for us.
Lover of poverty, pray for us.
Model of workmen, pray for us.
Glory of home life, pray for us.
Guardian of virgins, pray for us.
Pillar of families, pray for us.
Solace of the wretched, pray for us.
Hope of the sick, pray for us.
Patron of the dying, pray for us.
Terror of demons, pray for us.
Protector of Holy Church, pray for us.

Lamb of God, who takes away the sins of the world, spare us, O Lord.
Lamb of God, who takes away the sins of the world, graciously hear us, O Lord.
Lamb of God, who takes away the sins of the world, have mercy on us.

V. He made him the lord of his household,
R. And prince over all his possessions.

Let us pray: O God, who in your ineffable providence did choose blessed Joseph to be the spouse of your most holy Mother, grant that, as we venerate him as our protector on earth, we may deserve to have him as our intercessor in heaven. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["litany", "st joseph", "saints", "litanies"],
  },
  {
    id: "litany-humility",
    title: "Litany of Humility",
    category: "litanies",
    text: `O Jesus, meek and humble of heart, hear me.

From the desire of being esteemed, deliver me, O Jesus.
From the desire of being loved, deliver me, O Jesus.
From the desire of being extolled, deliver me, O Jesus.
From the desire of being honored, deliver me, O Jesus.
From the desire of being praised, deliver me, O Jesus.
From the desire of being preferred to others, deliver me, O Jesus.
From the desire of being consulted, deliver me, O Jesus.
From the desire of being approved, deliver me, O Jesus.

From the fear of being humiliated, deliver me, O Jesus.
From the fear of being despised, deliver me, O Jesus.
From the fear of being rejected, deliver me, O Jesus.
From the fear of being calumniated, deliver me, O Jesus.
From the fear of being forgotten, deliver me, O Jesus.
From the fear of being ridiculed, deliver me, O Jesus.
From the fear of being wronged, deliver me, O Jesus.
From the fear of being suspected, deliver me, O Jesus.

That others may be loved more than I, Jesus, grant me the grace to desire it.
That others may be esteemed more than I, Jesus, grant me the grace to desire it.
That others may increase and I may decrease, Jesus, grant me the grace to desire it.
That others may be preferred and ignored, Jesus, grant me the grace to desire it.
That others may be praised and I unnoticed, Jesus, grant me the grace to desire it.
That others may be holier than I, Jesus, grant me the grace to desire it, provided I may become as holy as I should.

Jesus, grant me the grace to desire it. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["litany", "humility", "virtue", "litanies"],
  },
  {
    id: "litany-precious-blood",
    title: "Litany of the Precious Blood",
    category: "litanies",
    text: `Lord, have mercy on us.
Christ, have mercy on us.
Lord, have mercy on us.
Christ, hear us.
Christ, graciously hear us.

God the Father of heaven, have mercy on us.
God the Son, Redeemer of the world, have mercy on us.
God the Holy Spirit, have mercy on us.
Holy Trinity, one God, have mercy on us.

Blood of Christ, only-begotten Son of the eternal Father, have mercy on us.
Blood of Christ, incarnate Word of God, have mercy on us.
Blood of Christ, of the New and Eternal Testament, have mercy on us.
Blood of Christ, falling upon the earth in the agony, have mercy on us.
Blood of Christ, shed profusely in the scourging, have mercy on us.
Blood of Christ, flowing forth in the crowning with thorns, have mercy on us.
Blood of Christ, poured out on the cross, have mercy on us.
Blood of Christ, price of our salvation, have mercy on us.
Blood of Christ, without which there is no forgiveness, have mercy on us.
Blood of Christ, Eucharistic drink and refreshment of souls, have mercy on us.
Blood of Christ, stream of mercy, have mercy on us.
Blood of Christ, victor over demons, have mercy on us.
Blood of Christ, courage of martyrs, have mercy on us.
Blood of Christ, strength of confessors, have mercy on us.
Blood of Christ, bringing forth virgins, have mercy on us.
Blood of Christ, help of those in peril, have mercy on us.
Blood of Christ, relief of the burdened, have mercy on us.
Blood of Christ, solace in sorrow, have mercy on us.
Blood of Christ, hope of the repentant, have mercy on us.
Blood of Christ, consolation of the dying, have mercy on us.
Blood of Christ, peace and serenity of hearts, have mercy on us.
Blood of Christ, pledge of eternal life, have mercy on us.
Blood of Christ, freeing souls from purgatory, have mercy on us.
Blood of Christ, most worthy of all glory and honor, have mercy on us.

Lamb of God, who takes away the sins of the world, spare us, O Lord.
Lamb of God, who takes away the sins of the world, graciously hear us, O Lord.
Lamb of God, who takes away the sins of the world, have mercy on us.

V. Thou hast redeemed us with Thy Blood, O Lord.
R. And made of us a kingdom for our God.

Let us pray: Almighty and eternal God, who appointed Thine only-begotten Son to be the Redeemer of the world, and willed to be appeased by His blood, grant that we may so honor this price of our salvation, that through its power we may be protected from the evils of this present life, so that we may enjoy its fruit forever in heaven. Through the same Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["litany", "precious blood", "jesus", "litanies"],
  },
  {
    id: "litany-saints",
    title: "Litany of the Saints",
    category: "litanies",
    text: `Lord, have mercy on us.
Christ, have mercy on us.
Lord, have mercy on us.
Christ, hear us.
Christ, graciously hear us.

God the Father of heaven, have mercy on us.
God the Son, Redeemer of the world, have mercy on us.
God the Holy Spirit, have mercy on us.
Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us.
Saint Michael, pray for us.
Saint Gabriel, pray for us.
Saint Raphael, pray for us.
All holy angels and archangels, pray for us.
All holy orders of blessed spirits, pray for us.

Saint John the Baptist, pray for us.
Saint Joseph, pray for us.
All holy patriarchs and prophets, pray for us.

Saint Peter, pray for us.
Saint Paul, pray for us.
Saint Andrew, pray for us.
Saint James, pray for us.
Saint John, pray for us.
All holy apostles and evangelists, pray for us.
All holy disciples of the Lord, pray for us.

Saint Stephen, pray for us.
Saint Lawrence, pray for us.
Saint Vincent, pray for us.
All holy martyrs, pray for us.

Saint Sylvester, pray for us.
Saint Gregory, pray for us.
Saint Ambrose, pray for us.
Saint Augustine, pray for us.
Saint Jerome, pray for us.
All holy doctors and bishops, pray for us.

Saint Anthony, pray for us.
Saint Benedict, pray for us.
Saint Bernard, pray for us.
Saint Dominic, pray for us.
Saint Francis, pray for us.
All holy priests and Levites, pray for us.

Saint Mary Magdalene, pray for us.
Saint Lucy, pray for us.
Saint Agnes, pray for us.
Saint Cecilia, pray for us.
Saint Agatha, pray for us.
All holy virgins and widows, pray for us.

All holy men and women, pray for us.

V. Lord, be merciful to us.
R. Save us, O Lord, for Thy mercy's sake.

V. Lord, hear our prayer.
R. And let our cry come unto Thee.

Let us pray: We beseech Thee, Lord, hear the prayers of Thy servants, that we who are sinners may be forgiven by the pardon of Thy mercy, and that what we ask for according to Thy will may be granted to us by Thy gracious bounty. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["litany", "saints", "litanies", "communion of saints"],
  },

  // 10. PRAYERS TO SAINTS (5)
  {
    id: "prayer-st-joseph-workers",
    title: "Prayer to St. Joseph for Workers",
    category: "saints",
    text: `O glorious St. Joseph, patron of workers, model of diligence, who spent your life in humble toil at the carpenter's bench in Nazareth, intercede for me in my work and my career.

Help me to see dignity in labor, to work with integrity and skill, to be honest and fair in all my dealings. Grant me the grace to offer my daily work as a sacrifice of love, united to the Sacred Heart of Jesus.

Protect me from idleness, dishonesty, and discontent. Inspire me to work not merely for earthly reward, but for the glory of God and the good of my neighbor. Through your powerful intercession, may I grow in virtue through my labor, and one day hear those blessed words: "Well done, good and faithful servant."

O St. Joseph, pray for us. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["st joseph", "workers", "labor", "saints"],
  },
  {
    id: "prayer-st-anthony",
    title: "Prayer to St. Anthony for Lost Things",
    category: "saints",
    text: `O blessed St. Anthony, the grace of God has made you a powerful advocate in all our necessities and a patron in the loss of things. I come to you in my distress. I have lost that which I greatly valued — [mention what is lost]. I pray earnestly that, by the help of God and through your intercession, I may recover what I have lost.

If it be God's holy will that I should not recover it, grant me the grace to resign myself to your divine providence. In all my trials and difficulties, be my help, O gentle and powerful saint. Pray for me that I may be preserved from all dangers of body and soul, and that I may always enjoy the blessing of God's peace.

O St. Anthony, miracle worker, pray for us. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["st anthony", "lost things", "intercession", "saints"],
  },
  {
    id: "prayer-st-jude",
    title: "Prayer to St. Jude for Desperate Cases",
    category: "saints",
    text: `O glorious St. Jude, apostle, martyr, and servant of Christ, I come before you in my hour of desperate need. You are the patron of hope impossible, of cases despaired of, of things almost given up. I have a special favor to ask, and I turn to you in confidence.

O St. Jude, worker of prodigies, glorious intercessor, help me in my present tribulation. If it is according to God's holy will, I pray that my petition may be granted. If it is not according to His will, grant me the grace to accept His will with trust and submission.

O St. Jude, pray that I may obtain the grace of perfect confidence in the power of God and the intercession of the saints. May I never lose faith in God's goodness and mercy, even when all hope seems lost.

St. Jude, apostle and martyr, helper of the desperate, pray for us. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["st jude", "desperate cases", "hope", "saints"],
  },
  {
    id: "prayer-st-therese",
    title: "Prayer to St. Therese of Lisieux",
    category: "saints",
    text: `O little St. Therese of the Child Jesus, who during your short life on earth became a pattern of humility, charity, and perfect love of God, I beseech you to hear my prayer. You who loved God so deeply and made Him loved by so many, obtain for me the grace to follow your "Little Way" of spiritual childhood.

Teach me to do small things with great love, to offer every little sacrifice with a smile, and to trust completely in God's mercy. I ask you to present my petition before the throne of God, if it is according to His holy will.

O St. Therese, you promised to spend your heaven doing good on earth. Shower down roses of graces upon me and all who call upon you. I trust your powerful intercession before our loving Father.

St. Therese of Lisieux, pray for us. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["st therese", "little way", "love", "saints"],
  },
  {
    id: "prayer-st-benedict",
    title: "Prayer to St. Benedict for Protection",
    category: "saints",
    text: `O glorious St. Benedict, model of obedience, prayer, and holy life, I beseech you to watch over me this day and always. You who received from God the grace to cast out demons, to heal the sick, and to raise the dead, protect me from the snares of the evil one.

By the power of the Holy Cross, which you carried always as your shield, defend me against all spiritual and physical dangers. May your holy example inspire me to seek God in silence, obedience, and humble service.

O St. Benedict, whose name means "blessed," bless me and my family. Intercede for us before the throne of God, that we may live holy lives and die in the grace of God.

By thy intercession, O blessed Patriarch, may we be delivered from the snares of the devil, and walksteadfastly in the way of salvation. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["st benedict", "protection", "monastic", "saints"],
  },

  // 11. DEVOTIONS (17)
  {
    id: "divine-mercy-chaplet",
    title: "Chaplet of Divine Mercy",
    category: "devotions",
    text: `Opening Prayer: You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us.

On the Our Father beads: Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world.

On the Hail Mary beads: For the sake of His sorrowful Passion, have mercy on us and on the whole world.

Concluding Prayer (repeat 3x): Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.

Optional Closing: Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase Your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to Your holy will, which is Love and Mercy itself. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["divine mercy", "chaplet", "devotion", "mercy"],
  },
  {
    id: "stations-cross",
    title: "Stations of the Cross (Short Version)",
    category: "devotions",
    text: `First Station: Jesus is condemned to death. We pray for all who are unjustly condemned.

Second Station: Jesus carries his cross. We pray for all who bear heavy burdens.

Third Station: Jesus falls the first time. We pray for all who have fallen and need strength to rise.

Fourth Station: Jesus meets his mother. We pray for all mothers who suffer with their children.

Fifth Station: Simon of Cyrene helps Jesus carry the cross. We pray for all who help others in their suffering.

Sixth Station: Veronica wipes the face of Jesus. We pray for all who show kindness to the afflicted.

Seventh Station: Jesus falls the second time. We pray for all who are tempted and fall.

Eighth Station: Jesus meets the women of Jerusalem. We pray for all who weep and mourn.

Ninth Station: Jesus falls the third time. We pray for all who are exhausted and discouraged.

Tenth Station: Jesus is stripped of his garments. We pray for all who are humiliated and shamed.

Eleventh Station: Jesus is nailed to the cross. We pray for all who endure great pain and suffering.

Twelfth Station: Jesus dies on the cross. We pray for the dying and the dead.

Thirteenth Station: Jesus is taken down from the cross. We pray for all who grieve the loss of a loved one.

Fourteenth Station: Jesus is laid in the tomb. We pray for all the faithful departed.

Closing: Lord Jesus Christ, your passion and death is the sacrifice that unites earth and heaven. Forgive us our sins, heal our wounds, and bring us to the glory of your resurrection. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["stations", "cross", "passion", "devotion", "lent"],
  },
  {
    id: "seven-sorrows",
    title: "Seven Sorrows of Mary Devotion",
    category: "devotions",
    text: `Introduction: O Mary, Mother of Sorrows, we contemplate your seven great sufferings. Grant us the grace to unite our own sorrows with yours, and to find comfort in your intercession.

First Sorrow: The Prophecy of Simeon. (Luke 2:34-35) — O Mary, your heart was pierced by the sword of sorrow when Simeon prophesied that a sword would pierce your soul.

Second Sorrow: The Flight into Egypt. (Matthew 2:13-15) — O Mary, you fled in terror to a foreign land, protecting the infant Jesus from Herod's murderous rage.

Third Sorrow: The Loss of the Child Jesus in the Temple. (Luke 2:41-43) — O Mary, your heart was torn with anguish during three days of searching for your beloved Son.

Fourth Sorrow: The Meeting of Jesus and Mary on the Way to Calvary. (John 19:17) — O Mary, your heart broke as you watched your Son carrying the cross to Golgotha.

Fifth Sorrow: The Crucifixion of Jesus. (John 19:25-27) — O Mary, you stood beneath the cross and watched your Son die in agony.

Sixth Sorrow: The Taking Down of Jesus from the Cross. (John 19:38-40) — O Mary, you received the lifeless body of your Son into your arms.

Seventh Sorrow: The Burial of Jesus. (John 19:41-42) — O Mary, your heart was sealed in the tomb with your only Son.

Closing: O Mother of Sorrows, we bring to you our own sufferings and ask for your intercession. Grant us the grace to unite our sorrows with yours, and the sorrow of your Son, for the redemption of the world. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["seven sorrows", "mary", "sorrows", "devotion"],
  },
  {
    id: "sacred-heart-first-friday",
    title: "Sacred Heart First Friday Devotion",
    category: "devotions",
    text: `O most holy Heart of Jesus, fountain of every blessing, I adore You, I love You, and with lively sorrow for my sins, I offer You this poor heart of mine. Make me humble, meek, and patient, docile, and obedient to Your will.

Grant, good Jesus, that I may live in You and for You. Protect me in the midst of danger; comfort me in all afflictions; give me health of body, assistance in my temporal needs, Your blessing on all that I do, and the grace of a holy death.

I unite my heart to Your Sacred Heart, offering You together with the Holy Sacrifice of the Mass all the prayers, works, and sufferings of this day. I promise to receive Holy Communion on the First Friday of each month, in reparation for the sins committed against Your Most Sacred Heart.

O Sacred Heart of Jesus, I place my trust in You. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["sacred heart", "first friday", "devotion", "jesus"],
  },
  {
    id: "immaculate-heart-first-saturday",
    title: "Immaculate Heart First Saturday Devotion",
    category: "devotions",
    text: `O Immaculate Heart of Mary, I consecrate myself entirely to you, placing under your maternal care all that I am, all that I have, and all that I do.

I offer this devotion in reparation for the sins committed against your Immaculate Heart, especially the sins of blasphemy, ingratitude, and those who wound your sorrowful and Immaculate Heart.

O Mary, conceived without sin, pray for us who have recourse to thee. I promise to offer you, on the first Saturday of each month, Holy Communion, the Rosary, and fifteen minutes of meditation on the mysteries of the Rosary, in reparation for the five principal blasphemies against your Immaculate Heart.

May your Immaculate Heart triumph in all hearts and in all the world. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["immaculate heart", "first saturday", "mary", "devotion"],
  },
  {
    id: "holy-hour-guide",
    title: "Holy Hour of Adoration Guide",
    category: "devotions",
    text: `Opening (5 minutes): O Jesus, present in the Blessed Sacrament, I adore You. I come before You with a heart full of love and gratitude. I believe You are truly present — Body, Blood, Soul, and Divinity — in this humble appearance of bread.

Blessing (5 minutes): Lord Jesus, bless me as I spend this hour in Your presence. Bless my family, my friends, my enemies, and all those for whom I have promised to pray.

Penitential Rite (10 minutes): Examine your conscience. Confess your sins. Ask for forgiveness and mercy.

Lectio Divina (15 minutes): Read a passage from Sacred Scripture slowly and reflectively. Let God speak to your heart through His Word.

Intercession (10 minutes): Pray for the Church, the Pope, your parish, your family, your community, and the world.

Silent Adoration (10 minutes): Simply rest in God's presence. Speak to Him from your heart. Listen for His still, small voice.

Closing (5 minutes): O Jesus, I thank You for this time of prayer and adoration. I take You with me as I leave this place. May Your presence remain in my heart always. I offer You this Holy Hour for [mention intention]. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["holy hour", "adoration", "eucharist", "devotion"],
  },
  {
    id: "holy-face-devotion",
    title: "Devotion to the Holy Face of Jesus",
    category: "devotions",
    text: `O Holy Face of Jesus, disfigured by sufferings and covered with blood, I come before You with a contrite heart. I adore Your sacred countenance, marred for my sins, and I offer You my reparation for the terrible blasphemies spoken against Your Holy Name.

O Jesus, who, in Your divine wisdom, permitted Your face to be disfigured so that Your divine beauty might be more perfectly revealed, give me the grace to look upon Your face in heaven with unending joy.

I offer You, O Lord, the faces of all who will suffer today: the faces of the innocent, the faces of the dying, the faces of the lonely. May the light of Your Holy Face shine upon them.

O God, we beseech You, crush the enemies of Holy Church and let Your Holy Face be glorified. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["holy face", "jesus", "reparation", "devotion"],
  },
  {
    id: "novena-holy-spirit",
    title: "Novena to the Holy Spirit",
    category: "devotions",
    text: `O Holy Spirit, Lord of light, from the celestial height descending, visit the minds of us Thy children; sprinkle Thy heavenly dew upon our hearts. Thou who art called the Paraclete, best gift of God above, the living font, the fire, love's unction, the anointing of the Spirit.

O Holy Spirit, come down upon us. Let the gift of Your sevenfold grace fill our hearts. Grant us wisdom and understanding, counsel and fortitude, knowledge and piety, and the fear of the Lord.

We pray for all the Church, that the fire of Your love may burn brightly in every heart. We pray for all ministers of God, that they may be filled with Your power. We pray for all the faithful, that they may grow in holiness and virtue.

Come, Holy Spirit, fill the hearts of Your faithful and enkindle in us the fire of Your love. Send forth Your Spirit and we shall be created, and You shall renew the face of the earth. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["holy spirit", "novena", "devotion", "pentecost"],
  },
  {
    id: "precious-blood-devotion",
    title: "Devotion to the Precious Blood",
    category: "devotions",
    text: `Most Precious Blood of Jesus Christ, I adore You. I offer You, with all the love of my heart, for the glory of God and the salvation of souls.

I plead Your Precious Blood upon myself, my family, my parish, and the whole world. Wash me clean from all my sins. Protect me from every evil. Heal my wounds and strengthen my soul.

O Precious Blood of Jesus, stream of mercy flowing from the heart of Christ, I place my trust in You. You have redeemed us not with perishable things like silver or gold, but with the Precious Blood of Christ, the unblemished lamb.

I unite this prayer to the infinite merits of the Most Precious Blood shed for us on Calvary. May it avail for the conversion of sinners, the release of souls in purgatory, and the glory of God. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["precious blood", "devotion", "jesus", "mercy"],
  },
  {
    id: "consecration-guide",
    title: "33-Day Total Consecration Guide",
    category: "devotions",
    text: `This devotion, popularized by St. Louis de Montfort, consists of 33 days of preparation followed by a total consecration to Jesus Christ through the Blessed Virgin Mary.

PREPARATION (Days 1-33):
During the first 12 days, pray for the gifts of the Holy Spirit and the grace to know your sins.
During the next 9 days, contemplate the virtues of the Blessed Virgin Mary.
During the final 12 days, contemplate the virtues of Jesus Christ and prepare for your consecration.

The Consecration Prayer:
O Eternal and incarnate Wisdom! O sweetest and most adorable Jesus! True God and true man, full humility, poverty, subjection, and obedience! I consecrate to You this day my whole being, body and soul. I give You all that I have, all that I am, all that I love.

Through the intercession of the Blessed Virgin Mary, I place myself entirely under Your most sweet dominion. I renounce Satan, all his works, and all his pomps. I choose You this day for my Lord, my Master, and my King.

I consecrate to You, O Mary, my body and soul, my goods, both interior and exterior, and even the value of all my good actions, past, present, and future. I give You the full right to dispose of me and all that belongs to me, as it shall please You.

Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["consecration", "mary", "montfort", "devotion", "33 days"],
  },
  {
    id: "perpetual-help-devotion",
    title: "Devotion to Our Lady of Perpetual Help",
    category: "devotions",
    text: `O Mother of Perpetual Help, grant that I may ever invoke Thy most powerful name, which is the safeguard of the living and the salvation of the dying. O Purest Mary, O sweetest Mary, let Thy name henceforth be always on my lips. Delay not, O blessed Lady, to help me whenever I call on Thee, for in all my needs I will never cease calling on Thee.

O Mother of Perpetual Help, Thou art my refuge, my hope, my mother. I place all my trust in Thee. Thou art the channel through which God's graces flow to us. Look upon me with Thy maternal eyes and intercede for me before the throne of God.

Grant me, O Mother of Perpetual Help, the grace to love God above all things, to practice the virtues of faith, hope, and charity, and to lead a holy life, that I may one day be united with Thee and all the saints in the kingdom of heaven. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["perpetual help", "mary", "devotion", "intercession"],
  },
  {
    id: "infant-prague-devotion",
    title: "Devotion to the Infant Jesus of Prague",
    category: "devotions",
    text: `O Infant Jesus of Prague, I come before Thy holy image with childlike trust. I believe Thou art truly God and truly man, and that Thou dost look upon me with a tender heart of love. I place all my confidence in Thee and ask Thee to bless me, my family, and all my undertakings.

O Infant Jesus of Prague, I surrender to Thee all my problems, my needs, and my desires. I trust that Thou wilt provide for me according to Thy holy will. Grant me the grace of a childlike faith and a humble heart.

Extend Thy little hand and bless me. Protect me from all harm and guide me on the path of salvation. I promise to honor Thee and spread devotion to Thy holy childhood.

O Infant Jesus of Prague, I love Thee and trust in Thee completely. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["infant prague", "jesus", "devotion", "trust"],
  },
  {
    id: "five-wounds-prayer",
    title: "Five Wounds of Christ Prayer",
    category: "devotions",
    text: `O loving Lord Jesus Christ, I kneel before You in reverent adoration, meditating upon the five most precious wounds of Your Sacred Body.

Your hands, O Lord, were pierced with nails for my salvation. May my hands be instruments of your love and mercy.

Your feet were nailed to the cross, that I might walk in the path of righteousness. May my feet carry me always toward you.

Your sacred side was opened by a lance, and from it flowed blood and water. From this fountain of mercy, pour out your grace upon me and all who call upon you.

I unite my sufferings to Your sacred Passion. I offer You my own wounds — of body and soul — as a small sacrifice for the glory of God and the salvation of souls.

O Lord Jesus, by Your five wounds, heal all my spiritual and physical wounds. By Your precious blood, wash away all my sins. By Your death upon the cross, give me the grace of a holy life and a peaceful death. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["five wounds", "jesus", "passion", "devotion"],
  },
  {
    id: "holy-angels-devotion",
    title: "Devotion to the Holy Angels",
    category: "devotions",
    text: `O Holy Angels of God, I greet you in the name of the Lord. You are the blessed guardians placed by God to watch over us. I thank you for your faithful service and constant protection.

O guardian angel, be at my side today and always. Lead me, guide me, and protect me from every danger of body and soul. Inspire me to do God's holy will. Comfort me in sorrow and strengthen me in temptation.

O angels of heaven, surround me with your holy presence. Pray for me, that I may be found worthy of the promises of Christ. May your holy intercession obtain for me the grace to live a holy life, and to die in the peace of Christ.

Angel of God, my guardian dear, to whom God's love commits me here, ever this night be at my side, to light and guard, to rule and guide. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["angels", "guardian angel", "protection", "devotion"],
  },
  {
    id: "chaplet-st-michael",
    title: "Chaplet of St. Michael",
    category: "devotions",
    text: `O God, come to my assistance. O Lord, make haste to help me.

Glory to the Father, and to the Son, and to the Holy Spirit.

IN HONOR OF SAINT MICHAEL: One Our Father and three Hail Marys.

FOR THE NINE ANGELIC CHOIRS:
Saint Michael, pray for us. (3x)
Saint Gabriel, pray for us. (3x)
Saint Raphael, pray for us. (3x)
Our Guardian Angels, pray for us. (3x)

FOR EACH CHOIR (9x):
In honor of Saint Michael: One Our Father, three Hail Marys, one Glory Be, one O Holy Michael.

O Holy Michael, Archangel, defend me in the day of battle. Be my safeguard against the wickedness and snares of the devil. May God rebuke him, I humbly pray. And do thou, O Prince of the heavenly host, by the power of God thrust into hell Satan and all evil spirits who wander through the world seeking the ruin of souls. Amen.

Closing: O God, whose only begotten Son has purchased for us the rewards of eternal life, grant that we beseech Thee, that through the intercession of Saint Michael the Archangel, and of all the holy angels, we may attain the heavenly kingdom through the merits of Jesus Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["chaplet", "st michael", "angels", "devotion"],
  },
  {
    id: "holy-cloak-st-joseph",
    title: "Holy Cloak of St. Joseph",
    category: "devotions",
    text: `O glorious Patriarch St. Joseph, you who were chosen by God to be the foster father of Jesus and the most chaste spouse of the Blessed Virgin Mary, I come before you to seek your powerful intercession.

O St. Joseph, who was clothed with the holy cloak of righteousness and virtue, I ask you to wrap me in your powerful protection. Shelter me from the storms of life, and cover me with the mantle of your fatherly care.

I invoke your holy name and place under your patronage all my needs — spiritual and temporal. You who held in your arms the Infant Jesus, hold me in your loving embrace. You who guided the Holy Family, guide me on the path of salvation.

O St. Joseph, I entrust to you this special intention: [mention your intention]. Through your powerful intercession, may it be granted to me according to God's holy will. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["holy cloak", "st joseph", "protection", "devotion"],
  },
  {
    id: "mary-undoer-knots",
    title: "Devotion to Mary, Undoer of Knots",
    category: "devotions",
    text: `O Blessed Virgin Mary, Mother of Undoer of Knots, I come before your holy image with a heart full of faith and love. I place before you all the knots in my life — the problems, the difficulties, the relationships that seem impossible to resolve.

O Mary, Untier of Knots, by your powerful intercession, untie the knots that bind me. You who untied the great knot of sin in the history of humanity by your humble obedience to God, untie the knots in my life.

O Blessed Mother, you who are full of grace, I ask you to untie the knot of [mention your specific intention]. Remove the obstacles, heal the wounds, and restore peace where there is turmoil.

O Mary, Undoer of Knots, pray for us who have recourse to thee. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["mary", "undoer of knots", "intercession", "devotion"],
  },

  // 12. FASTING PRAYERS (7)
  {
    id: "fasting-beginning",
    title: "Beginning of a Fast",
    category: "fasting",
    text: `Lord, accept this fast as a humble offering of my body, which is a temple of the Holy Spirit. I unite my hunger with the fasting of Your Son in the desert. May this small sacrifice draw me closer to You and deepen my reliance on Your grace alone.

O God, who in the fasting of Christ taught us to conquer temptation and master the flesh, grant me the strength to persevere in this fast. When I am weak, be my strength. When I am tempted, be my shield. When I falter, lift me up.

I offer this fast for [mention intention]. May it be acceptable to You, O Lord, and fruitful for the salvation of souls. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "beginning", "fast", "penance"],
  },
  {
    id: "fasting-strength",
    title: "Strength Against Temptation",
    category: "fasting",
    text: `Father, strengthen my spirit in this time of fasting. When the temptation to break my fast comes, remind me of Your Son's forty days in the desert. When the flesh is weak, let Your grace be sufficient.

O Lord, You know my weakness. I cannot fast without Your help. I cannot resist temptation without Your grace. Grant me the fortitude of spirit to persevere, and the humility to acknowledge that all my strength comes from You.

May this fast purify my heart, discipline my body, and unite my suffering with the cross of Christ. I trust in Your promise that You will never allow me to be tempted beyond my capacity. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "temptation", "strength", "perseverance"],
  },
  {
    id: "fasting-purity",
    title: "Purity of Intention in Fasting",
    category: "fasting",
    text: `Let my fast not be for the sight of men, but for Your eyes alone, O Lord. Purify my intention that I may fast not to be seen as holy, but to grow in holiness. Let not pride stain what I offer in humility.

O God, who sees what is hidden, examine my heart. If I fast to be praised by others, strip me of that vanity. If I fast to earn Your favor, teach me that Your love is already given freely.

I fast not as the Pharisees, who disfigured their faces to appear pious, but as a child who trusts in the goodness of the Father. Let my fast be an interior offering of love, hidden from the world but precious in Your sight.

Grant me, O Lord, a pure heart and right intention, that my fasting may truly honor You and draw me closer to Your sacred Heart. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "purity", "intention", "humility"],
  },
  {
    id: "fasting-midday",
    title: "Midday Fasting Prayer",
    category: "fasting",
    text: `Jesus, You are the true Bread of Life. As my body hungers, feed my soul with Your Word. As my stomach is empty, fill my heart with Your presence. Let this hunger remind me that man does not live by bread alone, but by every word that comes from the mouth of God.

O Lord, in this hour of midday, when the temptation to break my fast is strong, I turn to You. You fasted forty days and forty nights. You conquered the tempter not by bread, but by Your word and Your trust in the Father.

I unite my hunger with Yours, O Christ. I unite my thirst with Yours on the cross. Grant me the grace to persevere, and may this fast bring glory to Your name. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "midday", "bread of life", "jesus"],
  },
  {
    id: "fasting-offering",
    title: "Offering Fasting for Special Intentions",
    category: "fasting",
    text: `I unite this small sacrifice of fasting to the infinite merits of the Sacred Heart of Jesus. I offer it for the conversion of sinners, for the release of souls in purgatory, for the peace of the world, and for the intentions of the Holy Father.

O Lord, I offer You this fast not as a punishment, but as a gift. I give You the hunger, the thirst, the discomfort, and the discipline. May it be a sweet fragrance rising to Your throne.

I especially offer this fast for [mention your specific intention]. May Your mercy hear my prayer, and may Your grace accomplish what I cannot do by my own strength.

I unite my fast to the sacrifice of the Mass being offered today throughout the world. May the blood of Christ, poured out for many, bring healing and salvation to all. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "offering", "intercession", "mass"],
  },
  {
    id: "fasting-deliverance",
    title: "Prayer for Deliverance Through Fasting",
    category: "fasting",
    text: `Lord, break every chain that binds me. Through this fast, set me free from the bonds of sin, from the slavery of habitual vice, from the chains of addiction and attachment to worldly things.

O God, who in the fasting of Christ conquered the devil, grant me the same victory over my own temptations. By the power of this fast, I claim freedom from every spiritual bondage.

Jesus, who said that some demons can only be cast out by prayer and fasting, I humbly offer this fast as a weapon against the powers of darkness. Protect me, defend me, and grant me the grace of complete deliverance.

O Lord, let this fast loosen the chains of injustice, break the yoke of oppression, and set the captives free. May Your kingdom come and Your will be done in me and through me. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "deliverance", "freedom", "spiritual warfare"],
  },
  {
    id: "fasting-ending",
    title: "Prayer Ending a Fast",
    category: "fasting",
    text: `Thank You, Lord, for sustaining me through this fast. I offer You my gratitude for the grace to persevere. Let the discipline I have undergone bear fruit in my life — in patience, in charity, in holiness.

O God, I thank You for the strength You gave me when I was weak. I thank You for the grace that sustained me when I wanted to give up. I thank You for the spiritual gifts that this fast has produced in my soul.

May the effects of this fast remain in my heart long after I have broken it. Let the discipline become a habit of grace. Let the hunger become a deeper longing for You.

I break this fast now in Your name, offering this food to You as a gift. Bless it to my body and my body to Your service. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["fasting", "ending", "gratitude", "thanksgiving"],
  },

  // 13. SPECIAL PRAYERS (18)
  {
    id: "anxiety-fear",
    title: "In Times of Anxiety and Fear",
    category: "special",
    text: `O God, I come before You with a heart burdened by anxiety and fear. The troubles of this world weigh heavily upon me, and I feel overwhelmed by the unknown.

Lord, You said: "Be not anxious about tomorrow, for tomorrow will take care of itself." I choose to trust in Your word. I place my fears at the foot of Your cross.

Cast out, O Lord, every spirit of fear and anxiety. Fill me instead with Your perfect love, which casts out all fear. Grant me the peace that surpasses all understanding, and let my heart rest in the assurance that You are in control.

I surrender my worries to You, O Lord. Take my anxiety and give me Your peace. Take my fear and give me Your courage. Take my weakness and give me Your strength. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["anxiety", "fear", "peace", "trust", "worry"],
  },
  {
    id: "healing-restoration",
    title: "Healing & Restoration",
    category: "special",
    text: `Lord Jesus Christ, You went about doing good and healing all who were oppressed by the devil. I come to You now for healing — of body, mind, and spirit.

Touch me with Your healing hands, O Lord. Let Your grace flow through every cell, every fiber, every organ of my body. Drive out every illness, every disease, every infirmity that afflicts me.

Heal also the wounds of my soul — the sins, the hurts, the broken relationships. Restore to me the joy of Your salvation and renew a right spirit within me.

I trust in Your power to heal, and I believe that nothing is impossible for You. I place my healing in Your hands and accept Your will in all things. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["healing", "restoration", "health", "jesus"],
  },
  {
    id: "family-protection",
    title: "Family Protection",
    category: "special",
    text: `O God, Author of love and life, I place my family under Your protective care. Watch over my home and all who dwell within it.

Shield us from every danger, visible and invisible. Guard us from evil influences, from discord, from the snares of the devil. Unite us in love, in peace, and in faith.

Bless each member of my family with health of body, clarity of mind, and purity of heart. May our home be a place of prayer, of kindness, of joy. May it be a haven of peace in a troubled world.

O Holy Family — Jesus, Mary, and Joseph — model of every Christian family, intercede for us. Grant us the grace to love one another as you loved one another, and to grow together in holiness each day. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["family", "protection", "home", "safety"],
  },
  {
    id: "guidance-decision",
    title: "Guidance in Decision Making",
    category: "special",
    text: `Lord Jesus Christ, Light of the world, I come before You seeking guidance in this important decision. I do not know which path to take, and I fear making the wrong choice.

Send me Your Holy Spirit, O Lord. Illuminate my mind with the light of wisdom. Strengthen my will to choose what is right and good. Give me the clarity to see Your will, and the courage to follow it.

I offer You my indecision and my fear. I surrender my plans and my desires. Not my will, but Yours be done.

O Lord, speak to my heart in the silence of prayer. Guide me through the counsel of wise advisors. Confirm Your will through the circumstances of my life. I trust that You will direct my steps if I acknowledge You in all my ways.

Grant me, O Lord, the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["guidance", "decision", "wisdom", "holy spirit"],
  },
  {
    id: "students-exams",
    title: "For Students & Examinations",
    category: "special",
    text: `O God, Wisdom of all wisdom, Light of all light, I come before You in my need for studies and examinations. I offer You the work of my mind and the labor of my studies.

Grant me clarity of thought, retentive memory, and the ability to understand what I study. Remove all distraction and anxiety. Help me to be diligent in my preparations and humble in my results.

O Holy Spirit, Giver of wisdom, assist me in my examinations. Guide my hand as I write, and my mind as I recall. Let me do my best, and accept the results with faith and trust in Your providence.

I dedicate this effort to Your greater glory. Whether I succeed or fail, I trust that You are with me and that Your plan for my life is perfect. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["students", "examinations", "studies", "wisdom"],
  },
  {
    id: "travelers",
    title: "For Travelers",
    category: "special",
    text: `O God, who watches over all who travel by land, by sea, and by air, bless and protect me on this journey.

O guardian angel, go before me to prepare my way. Stay beside me to protect me from danger. Follow behind me to gather up anything I may leave behind.

O Lord, be my navigator and my shield. Grant me safe passage, good weather, and peaceful companions. Bring me safely to my destination and back again to my loved ones.

I place this journey in Your hands, knowing that no distance can separate me from Your love. Whether I travel near or far, You are with me always. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["travel", "journey", "safety", "protection"],
  },
  {
    id: "spiritual-warfare",
    title: "Spiritual Warfare",
    category: "special",
    text: `O Lord God, I put on Your full armor this day. I take up the shield of faith, the breastplate of righteousness, the helmet of salvation, and the sword of the Spirit, which is the word of God.

I stand firm against every attack of the evil one. I resist the devil and he flees from me. I claim the victory of the cross over every power of darkness.

O God, protect me from the snares of the enemy. Defend me from every assault of temptation. Guard my mind from evil thoughts, my heart from evil desires, my body from evil actions.

I plead the blood of Jesus Christ over myself, my family, and all that concerns me. No weapon formed against me shall prosper. The Lord is my light and my salvation — whom shall I fear? Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["spiritual warfare", "protection", "armor of god", "evil"],
  },
  {
    id: "financial-difficulties",
    title: "In Financial Difficulties",
    category: "special",
    text: `O God, my Provider, I come before You in my financial need. I trust that You know my needs before I even ask, and that You care for me as You care for the lilies of the field and the birds of the air.

Lord, I am worried about money. I am burdened by debts. I fear for the future. But I choose to trust in Your promise that You will never allow me to want.

Provide for me, O Lord, according to Your riches in glory. Open doors of opportunity. Give me the wisdom to manage well what You have given me. Deliver me from the love of money and the anxiety of material possessions.

I offer You my financial worries. I place my bills, my debts, my needs in Your sacred hands. I trust that You will provide — not always as I wish, but always as I need. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["financial", "money", "providence", "needs", "anxiety"],
  },
  {
    id: "sick-suffering",
    title: "For the Sick and Suffering",
    category: "special",
    text: `O Lord Jesus Christ, You bore our sicknesses and carried our sorrows. By Your stripes we are healed. I pray for all who are sick and suffering.

Grant relief to those in pain, strength to those who are weak, and hope to those who despair. Comfort the lonely, calm the anxious, and give peace to the dying.

I pray especially for [name the sick person]. Lord Jesus, stretch out Your healing hand upon them. If it is Your will, restore them to health. If it is not, grant them the grace to unite their suffering with Yours on the cross, for the salvation of souls.

O Mother of Sorrows, intercede for all who suffer. O St. Raphael, patron of the sick, pray for us. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["sick", "suffering", "healing", "illness"],
  },
  {
    id: "deceased-loved-ones",
    title: "For Deceased Loved Ones (Requiem)",
    category: "special",
    text: `Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May the souls of the faithful departed, through the mercy of God, rest in peace.

O God, in whose sight a thousand years are as yesterday, I commend to You the soul of my departed loved one. Forgive whatever sins they may have committed through human frailty.

O Lord Jesus Christ, King of glory, deliver the soul of Your servant from the power of darkness, and bring them into the light of Your eternal kingdom.

May they rest in the arms of the Blessed Virgin Mary, in the company of Saint Joseph, and with all the saints and angels forever.

I pray also for myself, that I may live a holy life, that when I die I may join my loved one in the eternal joy of heaven. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["deceased", "dead", "requiem", "rest in peace", "grief"],
  },
  {
    id: "pope-church-leaders",
    title: "For the Pope & Church Leaders",
    category: "special",
    text: `O God, Shepherd and Guide of all the faithful, look upon Your Church and bless our leaders.

We pray for the Holy Father, the successor of Saint Peter. Grant him wisdom, courage, and holiness. Protect him from all harm. May his pontificate bear abundant fruit for the salvation of souls.

We pray for all bishops, priests, and deacons. Fill them with the Holy Spirit. Make them faithful shepherds after Your own heart. Give them the grace to preach Your word with boldness and to serve Your people with love.

We pray for all religious and lay leaders in the Church. May they lead by example, serve with humility, and love with the heart of Christ.

O Lord, raise up holy leaders for Your Church, and let Your kingdom come in power and glory. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["pope", "bishops", "priests", "church leaders"],
  },
  {
    id: "peace-world",
    title: "For Peace in the World",
    category: "special",
    text: `O God, Author of peace and concord, we beseech You to look upon our troubled world. Wars rage, nations quarrel, and violence fills the streets.

Prince of Peace, calm the storms of conflict. Heal the wounds of war. Turn the hearts of leaders toward justice and mercy. Give wisdom to those who negotiate, courage to those who defend the innocent, and compassion to all who suffer.

We pray for an end to terrorism, persecution, and every form of violence. We pray for refugees, the displaced, and all victims of war. Grant them safety, shelter, and hope.

O Lord, let justice roll down like waters, and righteousness like an ever-flowing stream. Let Your peace, which surpasses all understanding, fill every heart and every nation. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["peace", "world", "war", "justice", "conflict"],
  },
  {
    id: "before-work",
    title: "Before Work",
    category: "special",
    text: `O God, I offer You the work of this day. Grant me the strength to labor well, the wisdom to work with skill, and the patience to persevere through difficulties.

Help me to work not merely for earthly wages, but for Your greater glory. Let my labor be a prayer, my effort a sacrifice, and my achievement a gift back to You.

O St. Joseph, patron of workers, intercede for me. Guide my hands in their task, my mind in its planning, and my heart in its dedication.

I unite my work to the Holy Sacrifice of the Mass, and I offer it for the intentions of the Sacred Heart of Jesus. May all I do this day bring honor to Your name. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["work", "before work", "labor", "st joseph"],
  },
  {
    id: "after-work",
    title: "After Work",
    category: "special",
    text: `I thank You, O God, for the work of this day. For the successes, I give You thanks. For the failures, I ask Your mercy. For the lessons learned, I offer You praise.

O Lord, I lay down the burdens of the day at Your feet. I release all worry, all frustration, all fatigue into Your hands. You have promised: "Come to me, all you who are weary and burdened, and I will give you rest."

Grant me a peaceful evening, O Lord. Let my rest be refreshing and my sleep be restful. Protect my loved ones through this night, and bring us safely to the dawn of a new day.

I offer You the work I have done today, imperfect as it may be. May it contribute to the building of Your kingdom. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["work", "after work", "rest", "thanksgiving"],
  },
  {
    id: "priests-vocations",
    title: "For Priests & Vocations",
    category: "special",
    text: `O Lord Jesus Christ, Good Shepherd of the Church, we pray for an increase of vocations to the priesthood and religious life.

Send workers into Your harvest, O Lord. Touch the hearts of young men and women and call them to serve You in the priesthood, diaconate, and consecrated life.

We pray for all priests and religious. Protect them from discouragement, from loneliness, from the temptations of the world. Surround them with holy companions and faithful parishioners who support them with prayer and love.

O Mary, Queen of the Clergy, intercede for our priests. May they be holy, faithful, and joyful in their vocation. May they lead many souls to Christ through their ministry.

We pray that every family may support and encourage vocations, and that our parishes may become schools of holiness where future priests and religious are formed. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["priests", "vocations", "religious life", "church"],
  },
  {
    id: "grief",
    title: "In Times of Grief",
    category: "special",
    text: `O God of all comfort, I come before You in the depths of my grief. My heart is broken. My soul is weary. I cannot see beyond my tears.

Lord Jesus, You wept at the tomb of Lazarus. You know the pain of loss. You understand the agony of separation. I cling to You in my sorrow.

Comfort me, O Lord, with Your presence. Wipe away my tears with Your tender mercy. Give me the strength to face each day without my loved one.

I trust that death is not the end, but a doorway to eternal life. I believe that my loved one is safe in Your arms. I look forward to the day when we shall be reunited in the joy of heaven.

Until that day, grant me the grace to carry my cross with faith and hope. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["grief", "loss", "mourning", "comfort", "death"],
  },
  {
    id: "forgiveness-mercy",
    title: "For Forgiveness and Mercy",
    category: "special",
    text: `O Lord, I come before You as a sinner. I have wronged others, and I have been wronged. I need Your mercy and the grace to forgive.

Forgive me, O Lord, for the sins I have committed — in thought, in word, in deed, and in what I have failed to do. Wash me clean in the blood of the Lamb.

Give me the grace to forgive those who have sinned against me. I release all bitterness, all anger, all desire for revenge. I place my hurts at the foot of Your cross.

O Divine Mercy, look upon me with kindness. O Sacred Heart, pour out Your love upon me. I trust in Your infinite mercy and I place my entire hope in Your forgiveness.

As I forgive, may I be forgiven. As I show mercy, may I receive mercy. Through Christ our Lord. Amen.`,
    snippet: "",
    readTime: 0,
    tags: ["forgiveness", "mercy", "reconciliation", "sin"],
  },
  {
    id: "te-deum",
    title: "Te Deum (Hymn of Praise)",
    category: "special",
    text: `We praise You, O God; we acclaim You as Lord.

All creation worships You, the Father everlasting.
To You all angels, all the powers of heaven,
Cherubim and Seraphim, sing endless praise:
Holy, holy, holy Lord, God of power and might,
heaven and earth are full of Your glory.

The glorious company of apostles praise You.
The noble fellowship of prophets praise You.
The white-robed army of martyrs praise You.

Throughout the world the holy Church acclaims You:
Father of majesty unbounded,
Your true and only Son, worthy of all worship,
and the Holy Spirit, Advocate and Guide.

You, Christ, are the King of glory,
the eternal Son of the Father.
When You became man to set us free,
You did not shun the Virgin's womb.

You overcame the sting of death,
and opened the kingdom of heaven to all believers.
You are seated at God's right hand in glory.
We believe that You will come and be our judge.

Come then, Lord, and help Your people,
bought with the price of Your own blood,
and bring us with Your saints
to glory everlasting.

Save Your people, Lord, and bless Your inheritance.
Govern and uphold them now and always.
Day by day we bless You.
We praise Your name forever.

Keep us today, Lord, from all sin.
Have mercy on us, Lord, have mercy.
Lord, show us Your love and mercy;
for we place our trust in You.

In You, Lord, is our hope:
and we shall never hope in vain.`,
    snippet: "",
    readTime: 0,
    tags: ["te deum", "praise", "hymn", "special"],
  },
];

// Compute read times and snippets
CATHOLIC_PRAYERS.forEach((p) => {
  p.readTime = w(p.text);
  if (!p.snippet) p.snippet = sn(p.text);
});

export function getPrayersByCategory(category: PrayerCategory): CatholicPrayer[] {
  return CATHOLIC_PRAYERS.filter((p) => p.category === category);
}

export function searchPrayers(query: string): CatholicPrayer[] {
  const q = query.toLowerCase();
  return CATHOLIC_PRAYERS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}

export function getCurrentTimeCategory(): PrayerCategory {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "daytime";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
