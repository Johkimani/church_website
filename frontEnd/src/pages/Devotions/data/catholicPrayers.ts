/**
 * Comprehensive Catholic Prayer Book
 * All traditional prayers organized by time of day and category
 * Sources: USCCB, Vatican, EWTN, Blessed Be God, Raccolta
 */

export interface CatholicPrayer {
  id: string;
  title: string;
  category: PrayerCategory;
  subcategory?: string;
  text: string;
  readTime: number; // minutes estimated
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
  | "confession"
  | "litanies"
  | "saints"
  | "devotions"
  | "meals"
  | "fasting"
  | "special";

export const CATEGORY_META: Record<PrayerCategory, { label: string; description: string }> = {
  morning: { label: "Morning Prayers", description: "Begin your day with God" },
  daytime: { label: "Daytime Prayers", description: "Pause and pray through the day" },
  evening: { label: "Evening Prayers", description: "Give thanks as day turns to night" },
  night: { label: "Night Prayers", description: "Rest in God's peace" },
  mass: { label: "Mass Prayers", description: "Prayers for the Holy Sacrifice of the Mass" },
  rosary: { label: "The Rosary", description: "Meditate on the mysteries of faith" },
  essential: { label: "Essential Prayers", description: "The foundation of Catholic prayer" },
  acts: { label: "Acts of Virtue", description: "Acts of Faith, Hope, Love, and Contrition" },
  confession: { label: "Confession Prayers", description: "Prepare your heart for the Sacrament of Penance" },
  litanies: { label: "Litanies", description: "Solemn prayers of invocation" },
  saints: { label: "Prayers to Saints", description: "Ask the saints to intercede for us" },
  devotions: { label: "Devotions", description: "Popular Catholic devotional prayers" },
  meals: { label: "Meal Prayers", description: "Give thanks at table — before and after meals" },
  fasting: { label: "Fasting Prayers", description: "Prayers for days of fasting and penance" },
  special: { label: "Special Prayers", description: "For particular needs and occasions" },
};

function w(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export const CATHOLIC_PRAYERS: CatholicPrayer[] = [
  // ═══════════════════════════════════════════════════════
  // MORNING PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "morning-offering",
    title: "Morning Offering",
    category: "morning",
    text: `O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day, for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all my associates, and in particular for the intentions of the Holy Father. Amen.`,
    tags: ["daily", "offering", "jesus", "mary"],
    readTime: 0,
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
    tags: ["lauds", "psalm", "morning", "liturgy of the hours"],
    readTime: 0,
  },
  {
    id: "invitatory",
    title: "Invitatory Prayer",
    category: "morning",
    text: `Lord, open my lips, and my mouth shall declare your praise. The Lord is my light and my help; whom shall I fear? The Lord is the stronghold of my life; before whom shall I shrink? Come, let us worship Christ, the King who is to come.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    tags: ["invitatory", "morning", "liturgy of the hours"],
    readTime: 0,
  },
  {
    id: "psalm-63",
    title: "Psalm 63 — O God, You Are My God",
    category: "morning",
    text: `O God, you are my God, for you I long; for you my soul is thirsting. My body pines for you like a dry, weary land without water.

So I gaze on you in the sanctuary to see your strength and your glory. Your loving mercy is better than life, my lips shall praise you.

I will bless you as long as I live, I will lift up my hands, calling on your name. My soul shall be filled as with a banquet, my mouth shall praise you with joy.

On my bed I remember you, on you I muse through the night; for you have been my help; in the shadow of your wings I rejoice. My soul clings to you, your right hand holds me fast.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    tags: ["psalm", "morning", "praise"],
    readTime: 0,
  },
  {
    id: "act-of-adoration",
    title: "Act of Adoration",
    category: "morning",
    text: `I adore You, O God, my Creator and Redeemer, with all the powers of my soul. I adore You as my supreme Good, for You alone am infinite, eternal, unchangeable, and incomprehensible. I adore You as my God and my Lord, though I am but dust and ashes. I offer You the homage of my heart. Grant that I may adore You more worthily this day, and all the days of my life. Amen.`,
    tags: ["adoration", "morning", "creator"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ESSENTIAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "our-father",
    title: "Our Father (Pater Noster)",
    category: "essential",
    text: `Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.`,
    tags: ["essential", "our father", "lord's prayer", "daily"],
    readTime: 0,
  },
  {
    id: "hail-mary",
    title: "Hail Mary (Ave Maria)",
    category: "essential",
    text: `Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,
    tags: ["essential", "hail mary", "mary", "daily"],
    readTime: 0,
  },
  {
    id: "glory-be",
    title: "Glory Be (Gloria Patri)",
    category: "essential",
    text: `Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.`,
    tags: ["essential", "glory be", "trinity", "daily"],
    readTime: 0,
  },
  {
    id: "apostles-creed",
    title: "Apostles' Creed",
    category: "essential",
    text: `I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead.

I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.`,
    tags: ["essential", "creed", "belief", "daily"],
    readTime: 0,
  },
  {
    id: "nicene-creed",
    title: "Nicene Creed",
    category: "essential",
    text: `I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible.

I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages, God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through Him all things were made. For us men and for our salvation He came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man.

For our sake He was crucified under Pontius Pilate, He suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and His kingdom will have no end.

I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets.

I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.`,
    tags: ["essential", "creed", "nicene", "belief", "mass"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ACTS OF VIRTUE
  // ═══════════════════════════════════════════════════════
  {
    id: "act-of-faith",
    title: "Act of Faith",
    category: "acts",
    text: `O my God, I firmly believe that You are one God in three divine Persons, Father, Son, and Holy Spirit. I believe that Your divine Son became man and died for our sins, and that He will come to judge the living and the dead. I believe these and all the truths which the holy Catholic Church teaches, because You have revealed them, who can neither deceive nor be deceived. Amen.`,
    tags: ["act", "faith", "belief"],
    readTime: 0,
  },
  {
    id: "act-of-hope",
    title: "Act of Hope",
    category: "acts",
    text: `O my God, relying on Your infinite goodness and promises, I hope to obtain pardon of my sins, the help of Your grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen.`,
    tags: ["act", "hope"],
    readTime: 0,
  },
  {
    id: "act-of-charity",
    title: "Act of Charity (Love)",
    category: "acts",
    text: `O my God, I love You above all things, with my whole heart and soul, because You are all-good and worthy of all love. I love my neighbor as myself for the love of You. I forgive all who have injured me, and I ask pardon of all whom I have injured. Amen.`,
    tags: ["act", "charity", "love"],
    readTime: 0,
  },
  {
    id: "act-of-contrition-traditional",
    title: "Act of Contrition (Traditional)",
    category: "acts",
    text: `O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasion of sin. Amen.`,
    tags: ["act", "contrition", "confession", "daily"],
    readTime: 0,
  },
  {
    id: "act-of-contrition-modern",
    title: "Act of Contrition (Rite of Penance)",
    category: "acts",
    text: `My God, I am sorry for my sins with all my heart. In choosing to do wrong and failing to do good, I have sinned against You whom I should love above all things. I firmly intend, with Your help, to do penance, to sin no more, and to avoid whatever leads me to sin. Our Savior Jesus Christ suffered and died for us. In His name, my God, have mercy. Amen.`,
    tags: ["act", "contrition", "confession", "penance"],
    readTime: 0,
  },
  {
    id: "act-of-sorrow",
    title: "Act of Sorrow",
    category: "acts",
    text: `O my God, I am sorry for my sins; in choosing to sin I have offended You and deserve to be punished. I am firmly resolved, with the help of Your grace, to sin no more and to avoid the near occasion of sin. Amen.`,
    tags: ["act", "sorrow", "contrition"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // MASS PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "spiritual-communion",
    title: "Spiritual Communion",
    category: "mass",
    text: `My Jesus, I believe that You are present in the Most Blessed Sacrament. I love You above all things, and I desire to receive You into my soul. Since I cannot now receive You sacramentally, come at least spiritually into my heart. I embrace You as if You were already there, and unite myself wholly to You. Never permit me to be separated from You. Amen.`,
    tags: ["mass", "communion", "jesus", "daily"],
    readTime: 0,
  },
  {
    id: "anima-christi",
    title: "Anima Christi",
    category: "mass",
    text: `Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within Your wounds, hide me. Permit me not to be separated from You. From the malignant enemy, defend me. In the hour of my death, call me. And bid me come unto You, that with Your saints I may praise You for ever and ever. Amen.`,
    tags: ["mass", "communion", "jesus", "passion"],
    readTime: 0,
  },
  {
    id: "prayer-before-mass",
    title: "Prayer Before Mass",
    category: "mass",
    text: `Almighty and ever-living God, I approach the mystery of Your Son's Body and Blood with humility and reverence. Prepare my heart to receive You worthily. Open my ears to hear Your Word. Fill me with Your Holy Spirit, that I may worship You in spirit and truth. Grant me the grace to unite my sacrifices to the perfect sacrifice of Your Son on the Cross. Through Christ our Lord. Amen.`,
    tags: ["mass", "before mass", "preparation"],
    readTime: 0,
  },
  {
    id: "prayer-after-mass",
    title: "Prayer After Mass",
    category: "mass",
    text: `Lord, I thank You for this sacred meal, the Body and Blood of Your Son Jesus Christ. May this Holy Communion strengthen my faith, increase my love for You, and bring me closer to unity with my brothers and sisters. Help me to carry Your presence into the world and to live as Your faithful disciple today and always. Through Christ our Lord. Amen.`,
    tags: ["mass", "after mass", "thanksgiving", "communion"],
    readTime: 0,
  },
  {
    id: "prayer-offertory",
    title: "Prayer at the Offertory",
    category: "mass",
    text: `Blessed are You, Lord God of all creation, for through Your goodness we have this bread to offer, fruit of the earth and work of human hands. It will become for us the bread of life. Blessed be God forever.

Blessed are You, Lord God of all creation, for through Your goodness we have this wine to offer, fruit of the vine and work of human hands. It will become our spiritual drink. Blessed be God forever.`,
    tags: ["mass", "offertory", "bread", "wine"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ROSARY PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "rosary-opening",
    title: "Rosary Opening Prayers",
    category: "rosary",
    text: `The Apostles' Creed (on the crucifix):
I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead.

I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.

Our Father (on the first large bead):
Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.

Three Hail Marys (on the next three small beads):
Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Glory Be (after each Hail Mary):
Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.

O My Jesus (Fatima Prayer):
O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of Thy mercy. Amen.`,
    tags: ["rosary", "opening", "apostles creed", "fatima"],
    readTime: 0,
  },
  {
    id: "rosary-closing",
    title: "Rosary Closing Prayers",
    category: "rosary",
    text: `Hail Holy Queen (Salve Regina):
Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.

Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ.

O God, whose Only Begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that by meditating on these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.

O God, come to my assistance; Lord, make haste to help me. Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    tags: ["rosary", "closing", "salve regina", "hail holy queen"],
    readTime: 0,
  },
  {
    id: "rosary-joyful",
    title: "Joyful Mysteries (Monday & Saturday)",
    category: "rosary",
    text: `The Joyful Mysteries of the Holy Rosary:

1. The Annunciation — The Angel Gabriel announces to Mary that she will conceive the Son of God. (Luke 1:26-38)

2. The Visitation — Mary visits Elizabeth, who recognizes her as the Mother of the Lord. (Luke 1:39-56)

3. The Nativity — Jesus is born in Bethlehem and laid in a manger. (Luke 2:1-20)

4. The Presentation — Mary and Joseph present the infant Jesus in the Temple. (Luke 2:22-35)

5. The Finding in the Temple — The twelve-year-old Jesus is found teaching in the Temple. (Luke 2:41-52)

For each mystery, pray one Our Father, ten Hail Marys, and one Glory Be.`,
    tags: ["rosary", "joyful", "mysteries", "monday", "saturday"],
    readTime: 0,
  },
  {
    id: "rosary-sorrowful",
    title: "Sorrowful Mysteries (Tuesday & Friday)",
    category: "rosary",
    text: `The Sorrowful Mysteries of the Holy Rosary:

1. The Agony in the Garden — Jesus prays in the Garden of Gethsemane. (Matthew 26:36-46)

2. The Scourging at the Pillar — Jesus is scourged by the Roman soldiers. (Matthew 27:26, John 19:1)

3. The Crowning with Thorns — Jesus is crowned with thorns and mocked. (Matthew 27:29-30)

4. The Carrying of the Cross — Jesus carries His Cross to Calvary. (John 19:17)

5. The Crucifixion — Jesus is nailed to the Cross and dies. (Luke 23:33-46)

For each mystery, pray one Our Father, ten Hail Marys, and one Glory Be.`,
    tags: ["rosary", "sorrowful", "mysteries", "tuesday", "friday"],
    readTime: 0,
  },
  {
    id: "rosary-glorious",
    title: "Glorious Mysteries (Wednesday & Sunday)",
    category: "rosary",
    text: `The Glorious Mysteries of the Holy Rosary:

1. The Resurrection — Jesus rises from the dead on the third day. (Matthew 28:1-10)

2. The Ascension — Jesus ascends into heaven forty days after His Resurrection. (Acts 1:1-11)

3. The Descent of the Holy Spirit — The Holy Spirit descends upon the apostles at Pentecost. (Acts 2:1-11)

4. The Assumption — The Blessed Virgin Mary is assumed body and soul into heaven.

5. The Coronation — Mary is crowned Queen of Heaven and Earth.

For each mystery, pray one Our Father, ten Hail Marys, and one Glory Be.`,
    tags: ["rosary", "glorious", "mysteries", "wednesday", "sunday"],
    readTime: 0,
  },
  {
    id: "rosary-luminous",
    title: "Luminous Mysteries (Thursday)",
    category: "rosary",
    text: `The Luminous Mysteries of the Holy Rosary:

1. The Baptism of the Lord — Jesus is baptized by John in the Jordan River. (Matthew 3:13-17)

2. The Wedding at Cana — Jesus performs His first miracle, changing water into wine. (John 2:1-11)

3. The Proclamation of the Kingdom — Jesus proclaims the Kingdom of God and calls to conversion. (Mark 1:15)

4. The Transfiguration — Jesus is transfigured on Mount Tabor, revealing His divine glory. (Matthew 17:1-8)

5. The Institution of the Eucharist — Jesus institutes the Eucharist at the Last Supper. (Luke 22:19-20)

For each mystery, pray one Our Father, ten Hail Marys, and one Glory Be.`,
    tags: ["rosary", "luminous", "mysteries", "thursday"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // EVENING PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "evening-prayer-vespers",
    title: "Evening Prayer (Vespers)",
    category: "evening",
    text: `O God, come to my assistance; Lord, make haste to help me.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Psalm 63: O God, you are my God, for you I long; for you my soul is thirsting. My body pines for you like a dry, weary land without water.

Your loving mercy is better than life, my lips shall praise you. I will bless you as long as I live, I will lift up my hands, calling on your name.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

The Magnificat:
My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for He has looked with favor on His lowly servant. From this day all generations will call me blessed: the Almighty has done great things for me, and holy is His name.

He has mercy on those who fear Him in every generation. He has shown the strength of His arm, He has scattered the proud in their conceit.

He has cast down the mighty from their thrones, and has lifted up the lowly. He has filled the hungry with good things, and the rich He has sent away empty.

He has come to the help of His servant Israel for He has remembered His promise of mercy, the promise He made to our fathers, to Abraham and his children forever.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    tags: ["vespers", "evening", "magnificat", "liturgy of the hours"],
    readTime: 0,
  },
  {
    id: "evening-examen",
    title: "The Ignatian Examen",
    category: "evening",
    text: `1. Become aware of God's presence. Look back on the events of the day with gratitude.

2. Review the day with gratitude. Recall the events of the day, from morning to evening. Notice the moments of joy, peace, sorrow, and struggle.

3. Pay attention to your emotions. Reflect on the feelings you experienced throughout the day. Where did you feel closest to God? Where did you feel distant?

4. Choose one feature of the day and pray from it. Pick one moment, good or bad, and bring it before God. Ask for His guidance and healing.

5. Look toward tomorrow. Ask God for grace and strength for the challenges ahead. Commit yourself to following Him more closely.

O God, I thank You for this day. Forgive me where I have fallen short, and strengthen me to do better tomorrow. Through Christ our Lord. Amen.`,
    tags: ["examen", "evening", "ignatian", "review"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // NIGHT PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "night-prayer-compline",
    title: "Night Prayer (Compline)",
    category: "night",
    text: `Brothers and sisters, let us humbly ask God our Father that He may grant us a peaceful night and the grace to complete it well.

O God, come to my assistance; Lord, make haste to help me.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Psalm 90: He who dwells in the shelter of the Most High, who abides in the shadow of the Almighty, will say to the Lord, "My refuge and my fortress; my God, in whom I trust."

For He will deliver you from the snare of the fowler and from the deadly pestilence. He will cover you with His pinions, and under His wings you will find refuge.

You will not fear the terror of night, nor the arrow that flies by day. A thousand may fall at your side, ten thousand at your right hand, but it will not come near you.

Because you have made the Lord your dwelling, the Most High, no harm will befall you. No disaster will come near your tent.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Nunc Dimittis (Simeon's Canticle):
Lord, now You let Your servant go in peace; Your word has been fulfilled: my own eyes have seen the salvation which You have prepared in the sight of every people, a light to reveal You to the nations and the glory of Your people Israel.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Salve Regina:
Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.

Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.`,
    tags: ["compline", "night", "psalm 90", "nunc dimittis", "liturgy of the hours"],
    readTime: 0,
  },
  {
    id: "act-of-surrender-night",
    title: "Act of Surrender to God's Will",
    category: "night",
    text: `Into Your hands, Lord, I commend my spirit. Guard me this night and grant me Your peace. If I should die before I wake, I pray the Lord my soul to take. May Your holy angels watch over me and keep me safe from all harm. I place my trust in You alone. Amen.`,
    tags: ["night", "surrender", "sleep", "trust"],
    readTime: 0,
  },
  {
    id: "bedtime-prayer",
    title: "Bedtime Prayer",
    category: "night",
    text: `Angel of God, my guardian dear, to whom God's love commits me here, ever this night be at my side, to light and guard, to rule and guide. Amen.

Bless me, O Lord, this night, and keep me from all harm. Watch over my family and loved ones. Grant us all a peaceful rest, and wake us refreshed to serve You another day. Through Christ our Lord. Amen.`,
    tags: ["night", "bedtime", "guardian angel", "sleep"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // DAYTIME PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "angelus",
    title: "The Angelus",
    category: "daytime",
    text: `The Angel of the Lord declared unto Mary.
And she conceived of the Holy Spirit.

Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Behold the handmaid of the Lord; be it done to me according to Your word.

Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

And the Word was made flesh and dwelt among us.

Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ.

Let us pray: Pour forth, we beseech You, O Lord, Your grace into our hearts, that we, to whom the incarnation of Christ, Your Son, was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection, through the same Christ our Lord. Amen.`,
    tags: ["angelus", "daytime", "mary", "incarnation", "daily"],
    readTime: 0,
  },
  {
    id: "regina-caeli",
    title: "Regina Caeli (Queen of Heaven)",
    category: "daytime",
    text: `Queen of Heaven, rejoice, alleluia! For He whom you merited to bear in your womb, alleluia, has risen as He promised, alleluia. Pray for us to God, alleluia.

Let us pray: O God, who gave joy to the world through the Resurrection of Your Son, our Lord Jesus Christ, grant we beseech You, that through the intercession of the Virgin Mary, His Mother, we may obtain the joys of everlasting life. Through the same Christ our Lord. Amen.`,
    tags: ["regina caeli", "easter", "mary", "daytime"],
    readTime: 0,
  },
  {
    id: "come-holy-spirit",
    title: "Come, Holy Spirit (Veni Creator)",
    category: "daytime",
    text: `Come, Holy Spirit, fill the hearts of Your faithful and enkindle in them the fire of Your love.

Send forth Your Spirit and they shall be created, and You shall renew the face of the earth.

Let us pray: O God, who did instruct the hearts of the faithful by the light of the Holy Spirit, grant that by the same Spirit we may be truly wise and ever rejoice in His consolation. Through Christ our Lord. Amen.`,
    tags: ["holy spirit", "veni creator", "daytime", "pentecost"],
    readTime: 0,
  },
  {
    id: "daytime-prayer-sext",
    title: "Daytime Prayer (Sext)",
    category: "daytime",
    text: `O God, come to my assistance; Lord, make haste to help me.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.

Psalm 121: I lift up my eyes toward the mountains; whence shall help come to me? My help is from the Lord, who made heaven and earth.

May He not suffer your foot to slip; may He slumber not who guards you: indeed He neither slumbers nor sleeps, the Guardian of Israel.

The Lord is your guardian; the Lord is your shade; He is beside you at your right hand. The sun shall not harm you by day, nor the moon by night.

The Lord will guard you from all evil; He will guard your life. The Lord will guard your coming and your going, both now and forever.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    tags: ["sext", "daytime", "psalm 121", "liturgy of the hours"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // DEVOTIONS
  // ═══════════════════════════════════════════════════════
  {
    id: "guardian-angel",
    title: "Guardian Angel Prayer",
    category: "devotions",
    text: `Angel of God, my guardian dear, to whom God's love commits me here, ever this night be at my side, to light and guard, to rule and guide. Amen.`,
    tags: ["guardian angel", "protection", "night", "daily"],
    readTime: 0,
  },
  {
    id: "grace-before-meals",
    title: "Grace Before Meals",
    category: "meals",
    text: `Bless us, O Lord, and these Your gifts, which we are about to receive from Your bounty, through Christ our Lord. Amen.`,
    tags: ["grace", "meals", "food", "daily"],
    readTime: 0,
  },
  {
    id: "grace-after-meals",
    title: "Grace After Meals",
    category: "meals",
    text: `We give You thanks, Almighty God, for all Your benefits, who live and reign now and forever. Amen.`,
    tags: ["grace", "meals", "thanksgiving", "daily"],
    readTime: 0,
  },
  {
    id: "memorare",
    title: "The Memorare",
    category: "devotions",
    text: `Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to your protection, implored your help, or sought your intercession, was left unaided. Inspired by this confidence, I fly unto you, O Virgin of Virgins, my mother. To you do I come, before you I stand, sinful and sorrowful. O Mother of the Word, despise not my petitions, but in your mercy hear and answer me. Amen.`,
    tags: ["memorare", "mary", "intercession", "devotion"],
    readTime: 0,
  },
  {
    id: "sub-tuum",
    title: "Sub Tuum Praesidium",
    category: "devotions",
    text: `We fly to your protection, O Holy Mother of God. Do not despise our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.`,
    tags: ["sub tuum", "mary", "protection", "ancient"],
    readTime: 0,
  },
  {
    id: "peace-prayer-francis",
    title: "Peace Prayer of St. Francis",
    category: "devotions",
    text: `Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; where there is sadness, joy.

O Divine Master, grant that I may not so much seek to be consoled as to console, to be understood as to understand, to be loved as to love. For it is in giving that we receive, it is in pardoning that we are pardoned, and it is in dying that we are born to eternal life. Amen.`,
    tags: ["francis", "peace", "devotion", "instrument"],
    readTime: 0,
  },
  {
    id: "magnificat",
    title: "The Magnificat",
    category: "devotions",
    text: `My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for He has looked with favor on His lowly servant. From this day all generations will call me blessed: the Almighty has done great things for me, and holy is His name.

He has mercy on those who fear Him in every generation. He has shown the strength of His arm, He has scattered the proud in their conceit. He has cast down the mighty from their thrones, and has lifted up the lowly. He has filled the hungry with good things, and the rich He has sent away empty.

He has come to the help of His servant Israel for He has remembered His promise of mercy, the promise He made to our fathers, to Abraham and his children forever.`,
    tags: ["magnificat", "mary", "evening", "vespers"],
    readTime: 0,
  },
  {
    id: "benedictus",
    title: "The Benedictus (Canticle of Zechariah)",
    category: "devotions",
    text: `Blessed be the Lord God of Israel, for He has visited and redeemed His people, and has raised up a horn of salvation for us in the house of His servant David.

As He spoke by the mouth of His holy prophets, who from of old, that we should be saved from our enemies and from the hand of all who hate us.

To perform the mercy promised to our fathers, and to remember His holy covenant, the oath which He swore to our father Abraham.

To grant us that we, being delivered from the hand of our enemies, might serve Him without fear, in holiness and righteousness before Him all the days of our life.

And you, child, will be called the prophet of the Most High; for you will go before the Lord to prepare His ways, to give knowledge of salvation to His people in the forgiveness of their sins.

Through the tender mercy of our God, when the day shall dawn upon us from on high, to give light to those who sit in darkness and in the shadow of death, to guide our feet into the way of peace.

Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.`,
    tags: ["benedictus", "zechariah", "morning", "lauds"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // SAINTS PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "prayer-st-michael",
    title: "Prayer to Saint Michael",
    category: "saints",
    text: `Saint Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the Devil. May God rebuke him, we humbly pray, and do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.`,
    tags: ["saint michael", "protection", "spiritual warfare", "archangel"],
    readTime: 0,
  },
  {
    id: "prayer-st-joseph",
    title: "Prayer to Saint Joseph",
    category: "saints",
    text: `O glorious Saint Joseph, faithful follower of Jesus Christ, to you do we raise our hearts and hands to implore your powerful intercession. Please obtain for us from the gentle Heart of Jesus the help and graces necessary for our spiritual and temporal welfare. In particular, we ask through the intercession of Saint Joseph:

For the Church: that she may be preserved from error and persecution.
For our families: that unity, peace, and love may reign in our homes.
For the dying: that they may have the grace of a happy death.
For workers: that they may find dignity and purpose in their labor.

O Saint Joseph, patron of workers and protector of families, pray for us. Amen.`,
    tags: ["saint joseph", "intercession", "families", "workers"],
    readTime: 0,
  },
  {
    id: "prayer-st-joseph-short",
    title: "Short Prayer to Saint Joseph",
    category: "saints",
    text: `O Saint Joseph, whose protection is so great, so strong, so prompt before the throne of God, I place in you all my interests and desires. O Saint Joseph, do assist me by your powerful intercession and obtain for me from your divine Son all spiritual blessings through Jesus Christ, our Lord. Amen.`,
    tags: ["saint joseph", "intercession", "short"],
    readTime: 0,
  },
  {
    id: "prayer-st-anthony",
    title: "Prayer to Saint Anthony",
    category: "saints",
    text: `O blessed Saint Anthony, gentlest of saints, your charity for all who call upon you, your love of Christ, your humility, gave you such power with God. Your prayers were never refused. We humbly ask you to assist us now. Help us find what we have lost, and lead us to what God wills for our lives. O Saint Anthony, wonder-worker, pray for us. Amen.`,
    tags: ["saint anthony", "lost things", "intercession"],
    readTime: 0,
  },
  {
    id: "prayer-st-therese",
    title: "Prayer to Saint Thérèse of Lisieux",
    category: "saints",
    text: `O Saint Thérèse, the Little Flower of Jesus, you who said you would spend your heaven doing good upon earth, send me a rose from the garden of paradise. If it be God's holy will, let me know your presence by obtaining for me the grace I ask with confidence. O Saint Thérèse, pray for me. Amen.`,
    tags: ["saint therese", "little flower", "intercession", "roses"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // SPECIAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "prayer-for-the-dead",
    title: "Prayer for the Dead",
    category: "special",
    text: `Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May the souls of the faithful departed, through the mercy of God, rest in peace. Amen.

O God, the Creator and Redeemer of all the faithful, grant to Your servants departed the remission of all their sins, that through our pious supplications they may obtain that pardon which they have always desired. Through Christ our Lord. Amen.`,
    tags: ["dead", "rest", "purgatory", "eternal"],
    readTime: 0,
  },
  {
    id: "eternal-rest-latin",
    title: "Eternal Rest (Latin/English)",
    category: "special",
    text: `Requiem aeternam dona eis, Domine, et lux perpetua luceat eis.

Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May the souls of the faithful departed, through the mercy of God, rest in peace. Amen.`,
    tags: ["dead", "requiem", "latin", "eternal rest"],
    readTime: 0,
  },
  {
    id: "act-of-reparation",
    title: "Act of Reparation to the Sacred Heart",
    category: "special",
    text: `O Sacred Heart of Jesus, animated with a desire to repair the profanations and sacrileges by which You are offended, we offer You, in union with the Holy Sacrifice of the Mass, all the good works, prayers, and sufferings of our lives, in reparation for the sins of the world. We offer especially the infinite merits of the Sacred Heart of Jesus and the Immaculate Heart of Mary. Through the Sacred Heart of Jesus, have mercy on us and on the whole world. Amen.`,
    tags: ["reparation", "sacred heart", "sacrilege", "offering"],
    readTime: 0,
  },
  {
    id: "prayer-for-healing",
    title: "Prayer for Healing",
    category: "special",
    text: `Lord Jesus Christ, You suffered for our sake and by Your wounds we are healed. Look with compassion on Your servant who is in need of healing. Grant that Your healing power may flow through them, body, mind, and spirit. Restore them to full health and strength. If it be Your holy will, grant them complete healing. Give them patience in their suffering and trust in Your providence. We place our confidence in Your Sacred Heart. Amen.`,
    tags: ["healing", "jesus", "health", "suffering"],
    readTime: 0,
  },
  {
    id: "prayer-for-protection",
    title: "Prayer for Protection",
    category: "special",
    text: `O God, You are our refuge and our strength. We place ourselves under Your protection this day. Guard us from all danger, visible and invisible. Defend us from the snares of the enemy. Shield our families, our homes, and all that we hold dear. May Your holy angels watch over us, and may Your Sacred Heart be our safe refuge. Through Christ our Lord. Amen.`,
    tags: ["protection", "safety", "angels", "refuge"],
    readTime: 0,
  },
  {
    id: "prayer-for-vocations",
    title: "Prayer for Vocations",
    category: "special",
    text: `O God, You have called us to serve Your Church. We ask You to send forth laborers into Your harvest. Grant to those You call the grace of perseverance, fidelity, and holiness. Bless our seminarians, our religious, and all who serve Your people. May Your Church never lack for priests, deacons, and religious who will lead Your faithful to heaven. Through Christ our Lord. Amen.`,
    tags: ["vocations", "priests", "religious", "church"],
    readTime: 0,
  },
  {
    id: "prayer-for-peace",
    title: "Prayer for Peace",
    category: "special",
    text: `Lord Jesus Christ, You said: "Peace I leave you; my peace I give you." Look not on our sins, but on the faith of Your Church, and grant us peace and unity according to Your will. You who live and reign with God the Father, in the unity of the Holy Spirit, one God, forever and ever. Amen.`,
    tags: ["peace", "jesus", "unity", "world"],
    readTime: 0,
  },
  {
    id: "st-patricks-breastplate",
    title: "St. Patrick's Breastplate",
    category: "special",
    text: `I arise today through a mighty strength, the invocation of the Trinity, through belief in the Threeness, through confession of the Oneness of the Creator of creation.

I arise today through the strength of heaven, the light of the sun, the radiance of the moon, the splendor of fire, the speed of lightning, the swiftness of wind, the depth of the sea, the stability of the earth, the firmness of rock.

I arise today through God's strength to pilot me, God's might to uphold me, God's wisdom to guide me, God's eye to look before me, God's ear to hear me, God's word to speak for me, God's hand to guard me, God's way to lie before me, God's shield to protect me, God's host to save me from snares of devils, from temptation of vices, from everyone who shall wish me ill, afar and anear, alone and in a crowd.

Christ to shield me today against poisoning, against burning, against drowning, against wounding, so that there may come abundance of merit. Christ with me, Christ before me, Christ behind me, Christ in me, Christ beneath me, Christ above me, Christ on my right, Christ on my left, Christ where I lie down, Christ where I sit, Christ where I arise, Christ in the heart of every man who thinks of me, Christ in the mouth of every man who speaks of me, Christ in every eye that sees me, Christ in every ear that hears me.

I arise today through a mighty strength, the invocation of the Trinity, through belief in the Threeness, through confession of the Oneness of the Creator of creation. Amen.`,
    tags: ["patrick", "breastplate", "protection", "celtic"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // LITANIES
  // ═══════════════════════════════════════════════════════
  {
    id: "litany-holy-name",
    title: "Litany of the Holy Name of Jesus",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Jesus, hear us. Jesus, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Jesus, Son of the Living God, have mercy on us. Jesus, splendor of the Father, have mercy on us. Jesus, brightness of eternal Light, have mercy on us. Jesus, King of Glory, have mercy on us. Jesus, Sun of Justice, have mercy on us. Jesus, Son of the Virgin Mary, have mercy on us. Jesus, most amiable, have mercy on us. Jesus, most admirable, have mercy on us. Jesus, mighty God, have mercy on us. Jesus, Father of the world to come, have mercy on us. Jesus, Angel of great counsel, have mercy on us. Jesus, most powerful, have mercy on us. Jesus, most patient, have mercy on us. Jesus, most obedient, have mercy on us. Jesus, meek and humble of heart, have mercy on us. Jesus, lover of chastity, have mercy on us. Jesus, lover of us, have mercy on us. Jesus, God of peace, have mercy on us. Jesus, author of life, have mercy on us. Jesus, model of virtues, have mercy on us. Jesus, zealous lover of souls, have mercy on us. Jesus, our God, have mercy on us. Jesus, our refuge, have mercy on us. Jesus, our hope, have mercy on us. Jesus, our Father, have mercy on us. Jesus, our Brother, have mercy on us. Jesus, our Savior, have mercy on us.

Jesus, have mercy on us. Jesus, hear us. Jesus, graciously hear us.

That You would pardon us, we beseech You, Jesus. That You would govern and preserve us, we beseech You, Jesus. That You would illuminate our hearts, we beseech You, Jesus. That You would inflame us with the fire of Your love, we beseech You, Jesus.

From all evil, deliver us, O Jesus. From all sin, deliver us, O Jesus. From Thy wrath, deliver us, O Jesus. From the snares of the devil, deliver us, O Jesus. From the spirit of fornication, deliver us, O Jesus. From everlasting death, deliver us, O Jesus. From the neglect of Thy inspirations, deliver us, O Jesus. Through the mystery of Thy holy Incarnation, deliver us, O Jesus. Through Thy Nativity, deliver us, O Jesus. Through Thy Infancy, deliver us, O Jesus. Through Thy most divine Life, deliver us, O Jesus. Through Thy Labors, deliver us, O Jesus. Through Thy agony and Passion, deliver us, O Jesus. Through Thy Cross and Dereliction, deliver us, O Jesus. Through Thy sufferings, deliver us, O Jesus. Through Thy Death and Burial, deliver us, O Jesus. Through Thy Resurrection, deliver us, O Jesus. Through Thy Ascension, deliver us, O Jesus. Through Thy institution of the Most Holy Eucharist, deliver us, O Jesus. Through Thy Joys, deliver us, O Jesus. Through Thy Glory, deliver us, O Jesus.

Lamb of God, who takest away the sins of the world, spare us, O Jesus. Lamb of God, who takest away the sins of the world, graciously hear us, O Jesus. Lamb of God, who takest away the sins of the world, have mercy on us, O Jesus.

Jesus, hear us. Jesus, graciously hear us.

Let us pray: O Lord Jesus Christ, who said: "Ask and you shall receive; seek and you shall find; knock and it shall be opened to you," grant we beseech You, to us who ask it, the gift of Your divine love, that we may love You with all our hearts, in all our words and actions, and never cease from praising You. Who with the Father and the Holy Spirit lives and reigns, one God, forever and ever. Amen.`,
    tags: ["litany", "holy name", "jesus", "invocation"],
    readTime: 0,
  },
  {
    id: "litany-loreto",
    title: "Litany of Loreto (Blessed Virgin Mary)",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of virgins, pray for us. Mother of Christ, pray for us. Mother of divine grace, pray for us. Mother most pure, pray for us. Mother most chaste, pray for us. Mother inviolate, pray for us. Mother undefiled, pray for us. Mother most amiable, pray for us. Mother most admirable, pray for us. Mother of good counsel, pray for us. Mother of our Creator, pray for us. Mother of our Savior, pray for us. Virgin most prudent, pray for us. Virgin most venerable, pray for us. Virgin most renowned, pray for us. Virgin most powerful, pray for us. Virgin most merciful, pray for us. Virgin most faithful, pray for us. Mirror of justice, pray for us. Seat of wisdom, pray for us. Cause of our joy, pray for us. Spiritual vessel, pray for us. Vessel of honor, pray for us. Singular vessel of devotion, pray for us. Mystical rose, pray for us. Tower of David, pray for us. Tower of ivory, pray for us. House of gold, pray for us. Ark of the covenant, pray for us. Gate of heaven, pray for us. Morning star, pray for us. Health of the sick, pray for us. Refuge of sinners, pray for us. Comforter of the afflicted, pray for us. Help of Christians, pray for us. Queen of angels, pray for us. Queen of patriarchs, pray for us. Queen of prophets, pray for us. Queen of apostles, pray for us. Queen of martyrs, pray for us. Queen of confessors, pray for us. Queen of virgins, pray for us. Queen of all saints, pray for us. Queen conceived without original sin, pray for us. Queen assumed into heaven, pray for us. Queen of the most holy Rosary, pray for us. Queen of families, pray for us. Queen of peace, pray for us.

Lamb of God, who takest away the sins of the world, spare us, O Lord. Lamb of God, who takest away the sins of the world, graciously hear us, O Lord. Lamb of God, who takest away the sins of the world, have mercy on us.

V. Pray for us, O holy Mother of God. R. That we may be made worthy of the promises of Christ.

Let us pray: Grant, we beseech You, O Lord God, that we, Your servants, may enjoy perpetual health of mind and body, and by the glorious intercession of the Blessed Virgin Mary, ever Virgin, may be delivered from present sorrow and obtain eternal joy. Through Christ our Lord. Amen.`,
    tags: ["litany", "mary", "loreto", "virgin"],
    readTime: 0,
  },
  {
    id: "litany-sacred-heart",
    title: "Litany of the Sacred Heart of Jesus",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Heart of Jesus, Son of the Eternal Father, have mercy on us. Heart of Jesus, formed by the Holy Spirit in the womb of the Virgin Mary, have mercy on us. Heart of Jesus, substantially united to the Word of God, have mercy on us. Heart of Jesus, of infinite majesty, have mercy on us. Heart of Jesus, holy Temple of God, have mercy on us. Heart of Jesus, tabernacle of the Most High, have mercy on us. Heart of Jesus, house of God and gate of heaven, have mercy on us. Heart of Jesus, glowing furnace of charity, have mercy on us. Heart of Jesus, vessel of justice and love, have mercy on us. Heart of Jesus, full of goodness and love, have mercy on us. Heart of Jesus, abyss of all virtues, have mercy on us. Heart of Jesus, most worthy of all praise, have mercy on us. Heart of Jesus, King and Center of all hearts, have mercy on us. Heart of Jesus, in Whom are all the treasures of wisdom and knowledge, have mercy on us. Heart of Jesus, in Whom dwells all the fullness of the Divinity, have mercy on us. Heart of Jesus, in Whom the Father was well pleased, have mercy on us. Heart of Jesus, of Whom all fullness resides, have mercy on us. Heart of Jesus, desire of the everlasting hills, have mercy on us. Heart of Jesus, Patient and most merciful, have mercy on us. Heart of Jesus, enriching all who invoke Thee, have mercy on us. Heart of Jesus, fountain of life and holiness, have mercy on us. Heart of Jesus, propitiation for our sins, have mercy on us. Heart of Jesus, loaded down with opprobrium, have mercy on us. Heart of Jesus, bruised for our offenses, have mercy on us. Heart of Jesus, obedient unto death, have mercy on us. Heart of Jesus, pierced with a lance, have mercy on us. Heart of Jesus, source of all consolation, have mercy on us. Heart of Jesus, our life and resurrection, have mercy on us. Heart of Jesus, our peace and reconciliation, have mercy on us. Heart of Jesus, victim for our sins, have mercy on us. Heart of Jesus, salvation of those who hope in Thee, have mercy on us. Heart of Jesus, hope of those who die in Thee, have mercy on us. Heart of Jesus, delight of all the Saints, have mercy on us.

Lamb of God, who takest away the sins of the world, spare us, O Lord. Lamb of God, who takest away the sins of the world, graciously hear us, O Lord. Lamb of God, who takest away the sins of the world, have mercy on us.

V. Jesus, meek and humble of heart. R. Make our hearts like unto Thine.

Let us pray: Almighty and everlasting God, look upon the Heart of Thy dearly beloved Son, and upon the praise and satisfaction which He offers Thee for us who are sinners. Through His mercy, grant us pardon and peace. Through the same Christ our Lord. Amen.`,
    tags: ["litany", "sacred heart", "jesus", "devotion"],
    readTime: 0,
  },
  {
    id: "litany-holy-spirit",
    title: "Litany of the Holy Spirit",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

Holy Spirit, proceeding from the Father and the Son, have mercy on us. Holy Spirit, sent by the Lord Jesus from heaven, have mercy on us. Holy Spirit, our Advocate and Consoler, have mercy on us. Holy Spirit, the Lord and Giver of Life, have mercy on us. Holy Spirit, You who brooded over the waters at creation, have mercy on us. Holy Spirit, You who spoke through the prophets, have mercy on us. Holy Spirit, You who descended upon the apostles at Pentecost, have mercy on us.

Spirit of wisdom and understanding, have mercy on us. Spirit of counsel and fortitude, have mercy on us. Spirit of knowledge and piety, have mercy on us. Spirit of the fear of the Lord, have mercy on us. Spirit of charity and peace, have mercy on us. Spirit of patience and long-suffering, have mercy on us. Spirit of gentleness and goodness, have mercy on us. Spirit of faith and meekness, have mercy on us. Spirit of chastity and self-control, have mercy on us.

Spirit of holiness and divine love, have mercy on us. Spirit of grace and prayer, have mercy on us. Spirit of power and obedience, have mercy on us. Spirit of joy and hope, have mercy on us. Spirit of light and truth, have mercy on us.

Lamb of God, who takest away the sins of the world, spare us, O Lord. Lamb of God, who takest away the sins of the world, graciously hear us, O Lord. Lamb of God, who takest away the sins of the world, have mercy on us.

Let us pray: O God, who did instruct the hearts of the faithful by the light of the Holy Spirit, grant that by the same Spirit we may be truly wise and ever rejoice in His consolation. Through Christ our Lord. Amen.`,
    tags: ["litany", "holy spirit", "pentecost", "advocate"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // FASTING PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "prayer-before-fast",
    title: "Prayer Before Fasting",
    category: "fasting",
    text: `Lord Jesus Christ, You fasted forty days and forty nights in the desert for our sake. Grant me the grace to unite my fasting with Your sacrifice. Strengthen my resolve when temptation comes, and let this fast be pleasing in Your sight. May my hunger remind me of my deep need for You alone. Through Christ our Lord. Amen.`,
    tags: ["fasting", "before fast", "jesus", "sacrifice"],
    readTime: 0,
  },
  {
    id: "prayer-during-fast",
    title: "Prayer During Fasting",
    category: "fasting",
    text: `O God, You alone are my hope. When my body is weak and my spirit struggles, I turn to You. Feed me with the bread of Your Word. Fill the emptiness of my stomach with the fullness of Your presence. May this hunger unite me to Christ who suffered for love of me. I offer this discomfort for the forgiveness of my sins and the conversion of sinners. Amen.`,
    tags: ["fasting", "during fast", "strength", "penance"],
    readTime: 0,
  },
  {
    id: "prayer-breaking-fast",
    title: "Prayer for Breaking the Fast",
    category: "fasting",
    text: `Blessed are You, Lord God of all creation, for through Your goodness we receive this food after our fast. We thank You for the discipline of abstinence and ask that the graces of this fast may remain with us. May we who have hungered for righteousness be filled with Your peace. Through Christ our Lord. Amen.`,
    tags: ["fasting", "breaking fast", "thanksgiving", "food"],
    readTime: 0,
  },
  {
    id: "prayer-ash-wednesday",
    title: "Prayer for Ash Wednesday",
    category: "fasting",
    text: `Lord, You call us to remember that we are dust, and to dust we shall return. As I receive these ashes, I acknowledge my mortality and my need for Your mercy. Grant me a fruitful Lenten journey of prayer, fasting, and almsgiving. Convert my heart, that I may turn from sin and live for You alone. Through Christ our Lord. Amen.`,
    tags: ["fasting", "ash wednesday", "lent", "mortality"],
    readTime: 0,
  },
  {
    id: "prayer-good-friday",
    title: "Prayer for Good Friday",
    category: "fasting",
    text: `O Lord Jesus Christ, Son of the living God, who on this day hung upon the Cross for our redemption: Grant that I may worthily observe this day of fast and penance. As I recall Your passion and death, fill my heart with gratitude and sorrow for my sins. May this day draw me closer to Your Sacred Heart. Who live and reign with the Father and the Holy Spirit, one God, forever and ever. Amen.`,
    tags: ["fasting", "good friday", "passion", "cross"],
    readTime: 0,
  },
  {
    id: "prayer-temperance",
    title: "Prayer for Temperance",
    category: "fasting",
    text: `O Lord, grant me the virtue of temperance. Help me to master my desires and to use the gifts of creation with moderation. May I always remember that man does not live on bread alone, but on every word that comes from the mouth of God. Through Christ our Lord. Amen.`,
    tags: ["fasting", "temperance", "moderation", "virtue"],
    readTime: 0,
  },
  {
    id: "offering-of-fast",
    title: "Offering of a Fast",
    category: "fasting",
    text: `O God, I offer this fast in union with the sacrifice of Your Son on the Cross. I offer it for the Holy Souls in Purgatory, for the conversion of sinners, for the intentions of the Holy Father, and for my own spiritual growth. May this small sacrifice, united to the infinite merits of Christ, bear abundant fruit for Your glory. Through the Immaculate Heart of Mary. Amen.`,
    tags: ["fasting", "offering", "penance", "intercession"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL DEVOTIONS
  // ═══════════════════════════════════════════════════════
  {
    id: "hail-holy-queen",
    title: "Hail Holy Queen (Salve Regina)",
    category: "devotions",
    text: `Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen.`,
    tags: ["hail holy queen", "salve regina", "mary", "rosary"],
    readTime: 0,
  },
  {
    id: "prayer-before-sleep",
    title: "Prayer Before Sleep",
    category: "night",
    text: `In the name of the Father, and of the Son, and of the Holy Spirit. Amen. Visit, we beseech You, O Lord, this dwelling, and drive far from it all snares of the enemy. Let Your holy angels dwell within to preserve us in peace; and let Your blessing be upon us, through Jesus Christ our Lord. Amen.`,
    tags: ["sleep", "night", "protection", "blessing"],
    readTime: 0,
  },
  {
    id: "prayer-for-sinners",
    title: "Prayer for Sinners",
    category: "special",
    text: `O Jesus, source of all mercy, I beg of You through the merits of Your Sacred Passion, show mercy to sinners. Bring back those who have strayed from the fold. Comfort those who are in anguish of soul. Grant repentance to the hardened, peace to the dying, and salvation to all. Have mercy on us and on the whole world. Amen.`,
    tags: ["sinners", "mercy", "conversion", "jesus"],
    readTime: 0,
  },
  {
    id: "prayer-for-family",
    title: "Prayer for the Family",
    category: "special",
    text: `Lord Jesus Christ, You who sanctified the home of Nazareth by Your presence, bless our family. Grant us unity, love, and peace. Help us to forgive one another as You forgive us. Protect us from all harm, guide us in truth, and keep us faithful to Your Gospel. May our home be a place of prayer, learning, and joy. Through Christ our Lord. Amen.`,
    tags: ["family", "home", "nazareth", "unity"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // TE DEUM & HYMNS
  // ═══════════════════════════════════════════════════════
  {
    id: "te-deum",
    title: "Te Deum (Hymn of Praise)",
    category: "special",
    text: `We praise You, O God, we acknowledge You to be the Lord. All the earth doth worship You, the Father everlasting. To You all Angels cry aloud, the Heavens and all the Powers therein. To You Cherubim and Seraphim continually do cry: Holy, Holy, Holy, Lord God of Sabaoth. Heaven and earth are full of the majesty of Your glory.

The glorious company of Apostles praise You. The goodly fellowship of the Prophets praise You. The noble army of Martyrs praise You. The holy Church throughout all the world does acknowledge You, the Father of an infinite majesty; Your adorable, true, and only Son; also the Holy Spirit, the Comforter.

You are the King of Glory, O Christ. You are the everlasting Son of the Father. When You took upon Yourself to deliver man, You did not abhor the Virgin's womb. When You had overcome the sharpness of death, You did open the kingdom of Heaven to all believers. You sit at the right hand of God, in the glory of the Father. We believe that You will come to be our Judge.

We therefore beseech You, help Your servants, whom You have redeemed with Your precious blood. Make them to be numbered with Your Saints, in everlasting glory. O Lord, save Your people and bless Your heritage. Govern them and lift them up forever. Day by day we bless You. And we praise Your name forever, yes, and forever and ever.

V. O Lord, deliver us from all evil, now and at the hour of our death.
R. We humbly beseech You.

V. Let our prayer come before You, O Lord.
R. And let our cry come unto You.

Let us pray: O God, whose mercy is endless and the treasury of goodness infinite, we beseech You, look upon us and increase Your mercy in us, that in adversity and tribulation we may not despair nor perish, but with the help of heaven may always persevere in obedience to Your will. Through Christ our Lord. Amen.`,
    tags: ["te deum", "hymn", "praise", "office of readings", "morning"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // COMPLETE COMPLINE
  // ═══════════════════════════════════════════════════════
  {
    id: "compline-complete",
    title: "Compline (Night Prayer — Complete)",
    category: "night",
    text: `O God, come to my assistance. O Lord, make haste to help me. Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

EXAMINATION OF CONSCIENCE: I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault. Therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.

PSALM 4: Answer me when I call, O God of my justice! You freed me when I was in distress; have mercy on me and hear my prayer. Sons of men, how long will you be dull of heart? Why do you love vanity and seek after falsehood? And know that the Lord has made His holy One wonderful; the Lord will hear me when I call upon Him. Be angry and do not sin; meditate within your hearts upon your beds and be still. Offer the sacrifice of justice and trust in the Lord. Many say: Who will show us prosperity? O Lord, the light of Your countenance has been lifted upon us. You have put gladness in my heart; more than when their grain and wine abounded. In peace I will both sleep and rest, for You alone, O Lord, make me dwell in safety.

PSALM 90: He who dwells in the shelter of the Most High and abides in the shadow of the Almighty, says to the Lord: "My refuge and my fortress, my God in whom I trust." For He will deliver you from the snare of the fowler and from the deadly pestilence. Under His wings you will find refuge; His faithfulness is a shield and buckler. You will not fear the terror of night, nor the arrow that flies by day, nor the pestilence that lurks in darkness, nor the destruction that wastes at noonday.

A thousand may fall at your side, ten thousand at your right hand, but it will not come near you. You will only look with your eyes and see the recompense of the wicked. Because you have made the Lord your refuge, the Most High your dwelling place, no evil shall befall you, no scourge come near your tent. For He will command His angels concerning you, to guard you in all your ways. On their hands they will bear you up, lest you dash your foot against a stone. You will tread upon the lion and the cobra, you will trample the great lion and the serpent.

"Because he holds fast to Me in love, I will deliver him; I will protect him, because he knows My name. When he calls to Me, I will answer him; I will be with him in trouble. I will rescue him and honor him. With long life I will satisfy him and show him My salvation."

GLORY BE: Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

PSALM 134: Praise the name of the Lord, O you servants of the Lord, who stand in the house of the Lord, in the courts of the house of our God. Praise the Lord, for the Lord is good; sing to His name, for it is gracious. For the Lord has chosen Jacob for Himself, Israel as His own possession. For I know that the Lord is great, and that our Lord is above all gods. Whatever the Lord pleases, He does, in heaven and on earth, in the seas and all deep waters. He it is who makes the clouds rise at the end of the earth, who makes lightning for the rain and brings forth the wind from His storehouses.

He it was who smote the first-born of Egypt, both of man and beast; who sent signs and wonders into the midst of you, O Egypt, upon Pharaoh and all his servants. Who smote many nations and slew mighty kings, Sihon king of the Amorites, and Og king of Bashan, and all the kingdoms of Canaan, and gave their land as a heritage, a heritage to His people Israel.

Your name, O Lord, endures forever, Your renown, O Lord, throughout all ages. For the Lord will vindicate His people and have compassion on His servants. The idols of the nations are silver and gold, the work of men's hands. They have mouths, but they speak not; they have eyes, but they see not; they have ears, but they hear not; there is no breath in their mouths. Those who make them become like them, so do all who trust in them.

Bless the Lord, O house of Israel! Bless the Lord, O house of Aaron! Bless the Lord, O house of Levi! You who fear the Lord, bless the Lord! Blessed be the Lord from Zion, He who dwells in Jerusalem! Praise the Lord!

NUNC DIMITTIS: Now You dismiss Your servant, O Lord, according to Your word in peace. Because my eyes have seen Your salvation, which You have prepared before the face of all peoples: a light for revelation to the Gentiles, and the glory of Your people Israel.

GLORY BE: Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

COMPLINE BLESSING: The Lord Almighty grant us a peaceful night and a perfect end. Amen.`,
    tags: ["compline", "night prayer", "psalms", "office", "bedtime"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // SEASONAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "advent-collect",
    title: "Advent — Collect (Opening Prayer)",
    category: "devotions",
    text: `Pour forth, we beseech You, O Lord, Your grace into our hearts, that we, to whom the Incarnation of Christ Your Son was made known by the message of an Angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen.`,
    tags: ["advent", "seasonal", "incarnation", "roman missal"],
    readTime: 0,
  },
  {
    id: "o-antiphons",
    title: "O Antiphons (December 17–23)",
    category: "devotions",
    text: `December 17: O Wisdom, proceeding from the mouth of the Most High, pervading all creation, reaching mightily from end to end, and ordering all things sweetly and with strength: come and teach us the way of prudence.

December 18: O Lord of Israel, of the house of Jesse, who stand as a sign for the peoples, before whom kings will keep silent, to whom the nations will pray: come to save us, and do not delay.

December 19: O Root of Jesse, who stand as a sign for the peoples, before whom kings will keep silent, to whom the nations will pray: come to deliver us, and do not delay.

December 20: O Key of David, scepter of the house of Israel, who open and none can shut, who shut and none can open: come and loosen the bonds of the captive who sits in darkness and the shadow of death.

December 21: O Dawn of the East, brightness of light eternal, sun of justice: come and enlighten those who sit in darkness and in the shadow of death.

December 22: O King of the Gentiles and their Desire, cornerstone who make both one: come and deliver man, whom You formed from the dust of the earth.

December 23: O Emmanuel, our King and Lawgiver, hope and salvation of all peoples: come and save us, O Lord our God.`,
    tags: ["advent", "o antiphons", "seasonal", "december"],
    readTime: 0,
  },
  {
    id: "christmas-collect",
    title: "Christmas — Collect (Opening Prayer)",
    category: "devotions",
    text: `O God, who wonderfully created the dignity of human nature and still more wonderfully restored it, grant that we may share in the divinity of Christ, who humbled Himself to share in our humanity. Who lives and reigns with You in the unity of the Holy Spirit, God, forever and ever. Amen.`,
    tags: ["christmas", "seasonal", "incarnation"],
    readTime: 0,
  },
  {
    id: "lenten-collect",
    title: "Lent — Collect (Opening Prayer)",
    category: "devotions",
    text: `O Lord, who for our sake fasted forty days and forty nights, grant us the grace to mortify our sinful desires, to overcome our passions, and to worthily celebrate the holy season of Lent by prayer, fasting, and almsgiving. Through Christ our Lord. Amen.`,
    tags: ["lent", "seasonal", "fasting", "penance"],
    readTime: 0,
  },
  {
    id: "easter-collect",
    title: "Easter — Collect (Opening Prayer)",
    category: "devotions",
    text: `O God, who on this day, through Your only-begotten Son, have conquered death and unlocked for us the path to eternity, grant that we, who keep the solemnity of the Lord's Resurrection, may rise with Him to newness of life. Through the same Christ our Lord. Amen.`,
    tags: ["easter", "seasonal", "resurrection"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // SACRAMENTAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "baptism-promises",
    title: "Baptismal Promises",
    category: "special",
    text: `Do you renounce Satan? And all his works? And all his empty promises?

R. I do renounce them.

Do you believe in God, the Father almighty, Creator of heaven and earth?

R. I do believe.

Do you believe in Jesus Christ, His only Son, our Lord, who was born of the Virgin Mary, suffered death and was buried, rose again from the dead, and is seated at the right hand of the Father?

R. I do believe.

Do you believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting?

R. I do believe.

This is our faith. This is the faith of the Church. We are proud to profess it, in Christ Jesus our Lord.`,
    tags: ["baptism", "sacrament", "creed", "renunciation"],
    readTime: 0,
  },
  {
    id: "confirmation-prayer",
    title: "Prayer for Confirmation",
    category: "special",
    text: `Almighty God, Father of our Lord Jesus Christ, who brought these Your servants to new birth by water and the Holy Spirit, freeing them from sin, send upon them, O Lord, the Holy Spirit, the Paraclete; give them the spirit of wisdom and understanding, the spirit of counsel and fortitude, the spirit of knowledge and piety; fill them with the spirit of the fear of the Lord. Through Christ our Lord. Amen.`,
    tags: ["confirmation", "sacrament", "holy spirit"],
    readTime: 0,
  },
  {
    id: "marriage-vows",
    title: "Matrimony — Exchange of Vows",
    category: "special",
    text: `I, [name], take you, [name], to be my wife/husband. I promise to be faithful to you in good times and in bad, in sickness and in health, to love you and to honor you all the days of my life.`,
    tags: ["marriage", "wedding", "sacrament", "vows"],
    readTime: 0,
  },
  {
    id: "anointing-sick",
    title: "Anointing of the Sick",
    category: "special",
    text: `Lord Jesus Christ, who suffered and died for us, poured out Your sacred blood for the redemption of the world, and willed that Your priests should offer the sacrifice of the Mass for the salvation of souls: grant that through this holy anointing and through the prayers of the Blessed Virgin Mary, Your Mother, this Your servant may be restored to health. If it be Your will, deliver him/her from all illness and from every danger. Strengthen him/her in body and spirit, that he/she may live to do Your will. Amen.`,
    tags: ["anointing", "sick", "sacrament", "healing"],
    readTime: 0,
  },
  {
    id: "confiteor-complete",
    title: "Confiteor (I Confess — Complete)",
    category: "mass",
    text: `I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.`,
    tags: ["confiteor", "penance", "mass", "confession"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // COMPLETE ACT OF REPARATION (PIUS XI)
  // ═══════════════════════════════════════════════════════
  {
    id: "act-of-reparation-pius",
    title: "Act of Reparation to the Sacred Heart (Pius XI)",
    category: "devotions",
    text: `O Jesus, Divine Savior, deign to cast a look of mercy upon Your children who assemble in spirit before the sacred image of Your loving Heart, and who desire to make reparation to You for all the outrages which You receive from the impious and the sinners, and especially for the insults, blasphemies, and desecration You endure in the sacrament of Your love.

O Sacred Heart of Jesus, animated with a burning love for men, and no less grieved that so many repay Your love with ingratitude, we earnestly desire to make up to You for all the coldness and innumerable sins of men by uniting ourselves in spirit to Your sacred Heart.

O Jesus, we long to repair the many sacrileges and outrages against You, by our acts of adoration, by our prayers, and by the offering of our whole life in Your service. We wish to make reparation for the sins of the world, for the outrages against the Blessed Virgin Mary, against the Holy Eucharist, against the Church, and against the Holy Father.

O Divine Savior, accept our humble efforts to console Your loving Heart. Grant that we may share in Your sufferings, and that through our faithfulness to You, we may make some small return for the love which You bear for each of us. We place all our trust in You, and we consecrate ourselves wholly to Your service. Through Your sacred Heart, O Lord. Amen.`,
    tags: ["reparation", "sacred heart", "pius xi", "adoration"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL LITANIES
  // ═══════════════════════════════════════════════════════
  {
    id: "litany-blessed-sacrament",
    title: "Litany of the Blessed Sacrament",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God, Creator of heaven and earth, have mercy on us. God, Creator of all things visible and invisible, have mercy on us. God, Creator of the visible sun and the invisible fire, have mercy on us.

Most High God, who created man from the slime of the earth, have mercy on us. Most High God, who breathed into his nostrils the breath of life, have mercy on us. Most High God, who breathed into man an immortal soul, have mercy on us.

Bread of angels, have mercy on us. Bread of heaven, have mercy on us. Bread most sweet, have mercy on us. Bread most powerful, have mercy on us. Bread most precious, have mercy on us. Bread most life-giving, have mercy on us. Bread most pure, have mercy on us. Bread most holy, have mercy on us. Bread most sacred, have mercy on us. Bread most adorable, have mercy on us. Bread most divine, have mercy on us. Bread most mysterious, have mercy on us.

O Living Bread from heaven, have mercy on us. O true Bread of God, have mercy on us. O Bread of the strong, have mercy on us. O Bread of the weary, have mercy on us. O Bread of the poor, have mercy on us. O Bread of pilgrims, have mercy on us. O Bread of the dying, have mercy on us. O Bread of the blessed, have mercy on us. O Bread of the angels, have mercy on us. O heavenly Bread, have mercy on us. O mystical Bread, have mercy on us. O sacramental Bread, have mercy on us.

Lamb of God, who takest away the sins of the world, spare us, O Lord. Lamb of God, who takest away the sins of the world, graciously hear us, O Lord. Lamb of God, who takest away the sins of the world, have mercy on us.

V. O Lord, save Your people. R. Whom You have redeemed with Your most precious blood. Let us pray: O Lord Jesus Christ, who in a wonderful sacrament have left us a memorial of Your Passion, grant us, we beseech You, so to venerate the sacred mysteries of Your Body and Blood, that we may continually feel within us the fruits of Your Redemption. Who lives and reigns forever and ever. Amen.`,
    tags: ["litany", "blessed sacrament", "eucharist", "adoration"],
    readTime: 0,
  },
  {
    id: "litany-precious-blood",
    title: "Litany of the Precious Blood",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

Father of mercies, have mercy on us. Son of the living God, have mercy on us. Son of the Virgin Mary, have mercy on us. Son of Joseph, have mercy on us. Son of David, have mercy on us. Son of Abraham, have mercy on us. Son of Mary, have mercy on us.

Precious Blood of the New Covenant, have mercy on us. Precious Blood shed for us in the Cenacle, have mercy on us. Precious Blood shed for us in the Garden of Gethsemane, have mercy on us. Precious Blood shed for us at the pillar, have mercy on us. Precious Blood shed for us in the praetorium, have mercy on us. Precious Blood shed for us upon the cross, have mercy on us. Precious Blood shed for us unto the remission of sins, have mercy on us. Precious Blood shed for us upon the altar, have mercy on us. Precious Blood shed for us in the Eucharist, have mercy on us. Precious Blood shed for us in the chalice, have mercy on us. Precious Blood poured out for us, have mercy on us.

Blood of Christ, calling louder than the blood of Abel, have mercy on us. Blood of Christ, our redemption, have mercy on us. Blood of Christ, cleansing us from sin, have mercy on us. Blood of Christ, saving us from death, have mercy on us. Blood of Christ, giving us life, have mercy on us. Blood of Christ, restoring us to health, have mercy on us. Blood of Christ, giving us courage, have mercy on us. Blood of Christ, refreshing us with peace, have mercy on us. Blood of Christ, bringing us consolation, have mercy on us. Blood of Christ, giving us strength, have mercy on us. Blood of Christ, making us strong, have mercy on us. Blood of Christ, protecting us from evil, have mercy on us. Blood of Christ, preserving us in grace, have mercy on us. Blood of Christ, uniting us in love, have mercy on us. Blood of Christ, making us one with You, have mercy on us.

Lamb of God, who takest away the sins of the world, spare us, O Lord. Lamb of God, who takest away the sins of the world, graciously hear us, O Lord. Lamb of God, who takest away the sins of the world, have mercy on us.

V. You have redeemed us, O Lord, in Your blood. R. And have made of us a kingdom for our God.

Let us pray: Almighty and eternal God, who appointed Your only-begotten Son to be the Redeemer of the world, and willed to be appeased by His blood, grant that we may worthily adore this price of our salvation, and through it may be freed from all the ills of this present life. Through the same Christ our Lord. Amen.`,
    tags: ["litany", "precious blood", "redemption", "passion"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL DEVOTIONAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "suscipe-domine",
    title: "Suscipe Domine (Prayer of St. Ignatius)",
    category: "devotions",
    text: `Take, Lord, and receive all my liberty, my memory, my understanding, and my entire will. Whatever I have or hold, You have given me. I return it all to You and surrender it wholly to be governed by Your will. Give me only Your love and Your grace; that is enough for me. Amen.`,
    tags: ["ignatius", "jesuits", "surrender", "devotion"],
    readTime: 0,
  },
  {
    id: "act-of-abandonment",
    title: "Act of Abandonment (Charles de Foucauld)",
    category: "devotions",
    text: `Father, I abandon myself into Your hands; do with me what You will. Whatever You may do, I thank You. I am ready for all, I accept all. Let only Your will be done in me, and in all Your creatures. I wish no more than this, O Lord. Into Your hands I commend my soul; I offer it to You with all the love of my heart, for I love You, Lord, and so need to give myself, to surrender myself into Your hands without reserve, and with boundless confidence, for You are my Father. Amen.`,
    tags: ["foucauld", "abandonment", "trust", "surrender"],
    readTime: 0,
  },
  {
    id: "fatima-angels-prayer",
    title: "Angel's Prayer at Fatima (O Most Holy Trinity)",
    category: "rosary",
    text: `O Most Holy Trinity, Father, Son, and Holy Spirit, I adore You profoundly. I offer You the most precious Body, Blood, Soul, and Divinity of Jesus Christ, present in all the tabernacles of the world, in reparation for the outrages, sacrileges, and indifferences by which He is offended. By the infinite merits of the Sacred Heart of Jesus and the Immaculate Heart of Mary, I beg the conversion of poor sinners. Amen.`,
    tags: ["fatima", "angel", "trinity", "reparation", "eucharist"],
    readTime: 0,
  },
  {
    id: "vespers-evening",
    title: "Vespers (Evening Prayer — Complete)",
    category: "evening",
    text: `O God, come to my assistance. O Lord, make haste to help me. Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

PSALM 112: Praise, O servants of the Lord, praise the name of the Lord. Blessed be the name of the Lord, from this time forth and forevermore. From the rising of the sun to its setting, the name of the Lord is to be praised. The Lord is high above all nations, His glory above the heavens.

Who is like the Lord our God, who is seated on high, who looks far down upon the heavens and the earth? He raises the poor from the dust, and lifts the needy from the ash heap, to make them sit with princes, with the princes of His people. He gives the barren woman a home, making her the joy of motherhood. Praise the Lord!

PSALM 120: I lift up my eyes to the hills. From where shall my help come? My help comes from the Lord, who made heaven and earth. He will not let your foot be moved; He who keeps you will not slumber. Behold, He who keeps Israel will neither slumber nor sleep. The Lord is your keeper; the Lord is your shade on your right hand. The sun shall not smite you by day, nor the moon by night. The Lord will keep you from all evil; He will keep your life. The Lord will keep your going out and your coming in, from this time forth and forevermore.

PSALM 129: Out of the depths I cry to You, O Lord! Lord, hear my voice! Let Your ears be attentive to the voice of my supplications. If You, O Lord, should mark iniquities, Lord, who could stand? But there is forgiveness with You, that You may be feared. I wait for the Lord, my soul waits, and in His word I hope; my soul waits for the Lord more than watchmen for the morning, more than watchmen for the morning. O Israel, hope in the Lord! For with the Lord there is steadfast love, and with Him is plenteous redemption. And He will redeem Israel from all his iniquities.

PSALM 137: By the waters of Babylon, there we sat down and wept, when we remembered Zion. On the willows there we hung up our lyres. For there our captors asked us for songs, and our tormentors asked for mirth, saying, "Sing us one of the songs of Zion!" How shall we sing the Lord's song in a foreign land? If I forget you, O Jerusalem, let my right hand forget its skill! Let my tongue stick to the roof of my mouth, if I do not remember you, if I do not set Jerusalem above my highest joy!

PSALM 147: Praise the Lord! For it is good to sing praises to our God; for He is gracious, and a song of praise is seemly. The Lord builds up Jerusalem; He gathers the outcasts of Israel. He heals the brokenhearted, and binds up their wounds. He determines the number of the stars; He gives to all of them their names. Great is our Lord, and abundant in power; His understanding is beyond measure. The Lord lifts up the humble; He casts the wicked to the ground.

MAGNIFICAT: My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for He has looked upon His handmaid's lowliness. Behold, from now on will all ages call me blessed. The Mighty One has done great things for me, and holy is His name. His mercy is from age to age on those who fear Him. He has shown might with His arm, confused the proud of heart. He has put down the mighty from their thrones and has exalted the lowly. He has filled the hungry with good things and has sent the rich away empty. He has helped Israel, His servant, mindful of His mercy, as He promised to our fathers, to Abraham and to his seed forever. Amen.

GLORY BE: Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

Antiphon: The Lord has set His throne in heaven, and His kingdom rules over all. Alleluia.

V. The Lord watch over your coming and your going. R. Both now and forevermore.

Let us pray: O God, from whom all good things come, grant that we, who call on You in our need, may at Your prompting discern what is right, and by Your guidance do it. Through Christ our Lord. Amen.`,
    tags: ["vespers", "evening prayer", "office", "magnificat", "psalms"],
    readTime: 0,
  },
  {
    id: "lauds-morning",
    title: "Lauds (Morning Prayer — Complete)",
    category: "morning",
    text: `O God, come to my assistance. O Lord, make haste to help me. Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

PSALM 63: O God, You are my God, for You I long; for You my soul is thirsting. My body pines for You like a dry, weary land without water. So I gaze on You in the sanctuary to see Your strength and Your glory. For Your love is better than life, my lips will speak Your praise. So I will bless You all my life, in Your name I will lift up my hands. My soul shall be filled as with a banquet; my mouth shall praise You with joy.

PSALM 50: Have mercy on me, O God, in Your goodness; in the greatness of Your compassion wipe out my offense. Thoroughly wash me from my guilt and of my sin cleanse me. For I acknowledge my offense, and my sin is before me always. Against You only have I sinned, and done what is evil in Your sight. That You may be justified when You give sentence and be without reproach when You judge.

A clean heart create for me, O God, and a steadfast spirit renew within me. Cast me not out from Your presence, and Your holy spirit take not from me. Give me back the joy of Your salvation, and a willing spirit sustain in me. O Lord, open my lips, and my mouth shall declare Your praise.

My sacrifice is a contrite spirit; a contrite, humbled heart, O God, You will not spurn. In Your goodness to Zion, rebuild the walls of Jerusalem; then You will be pleased with proper sacrifice, with sacrifices and burnt offerings. Then they will offer bullocks on Your altar.

PSALM 148: Praise the Lord from the heavens, praise Him in the heights. Praise Him, all you His angels, praise Him, all you His hosts. Praise Him, sun and moon, praise Him, all you shining stars. Praise Him, you highest heavens, and you waters above the heavens.

Let them praise the name of the Lord, for He commanded and they were created. He established them forever and ever; He gave a decree which shall not pass away.

PSALM 149: Sing to the Lord a new song; sing to the Lord, all you lands. Sing to the Lord, bless His name; announce His salvation day after day. Tell His glory among the nations; among all peoples, His wondrous deeds. For great is the Lord and highly to be praised; awesome is He, above all gods.

PSALM 150: Praise the Lord in His sanctuary, praise Him in His mighty firmament. Praise Him for His powerful deeds, praise His surpassing greatness. Oh, praise Him with blast of trumpet, praise Him with lyre and harp. Praise Him with timbrel and dance, praise Him with strings and pipe. Oh, praise Him with clanging cymbals, praise Him with clashing cymbals. Let everything that has breath praise the Lord! Praise the Lord!

BENEDICTUS: Blessed be the Lord, the God of Israel, because He has visited and redeemed His people. He has raised up a mighty Savior for us, in the house of David His servant, as He promised by the mouth of His holy prophets from of old: salvation from our enemies and from the hands of all who hate us. Thus He has shown mercy to our fathers, and has remembered His holy covenant, the oath He swore to our father Abraham, to grant us that, freed from the hands of our enemies, we might serve Him without fear in holiness and righteousness before Him all our days.

And you, child, shall be called the prophet of the Most High; for you will go before the Lord to prepare His ways, to give His people knowledge of salvation by the forgiveness of their sins. In the tender compassion of our God the dawn from on high shall break upon us, to shine upon those who sit in darkness and the shadow of death, and to guide our feet into the way of peace.

GLORY BE: Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

Antiphon: The Lord has risen and has enlightened His people. Alleluia.

V. The Lord watch over your coming and your going. R. Both now and forevermore.

Let us pray: As we thank You, almighty God, for all Your benefits, we beg You to listen to our prayers and through Your grace, to keep us from sin and from every danger. Through Christ our Lord. Amen.`,
    tags: ["lauds", "morning prayer", "office", "benedictus", "psalms"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ROSARY OPENING PRAYERS (COMPLETE)
  // ═══════════════════════════════════════════════════════
  {
    id: "rosary-complete-opening",
    title: "Rosary — Complete Opening Prayers",
    category: "rosary",
    text: `Sign of the Cross. I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.

OUR FATHER: Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.

HAIL MARY: Hail Mary, full of grace; the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

GLORY BE: Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.

OH MY JESUS: O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of Thy mercy. Amen.

HAIL HOLY QUEEN: Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope. To you we cry, poor banished children of Eve. To you we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, your eyes of mercy toward us, and after this exile, show unto us the blessed fruit of your womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen.

PRAYER AFTER ROSARY: O God, whose only-begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant that we beseech You, while meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may both imitate what they contain and obtain what they promise. We ask this through the same Christ our Lord. Amen.`,
    tags: ["rosary", "opening prayers", "fatima", "holy queen", "full rosary"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // OFFICE OF THE DEAD
  // ═══════════════════════════════════════════════════════
  {
    id: "office-of-dead",
    title: "Office of the Dead — Opening",
    category: "special",
    text: `V. Eternal rest grant unto them, O Lord. R. And let perpetual light shine upon them.

V. May the souls of the faithful departed, through the mercy of God, rest in peace. R. Amen.

ETERNAL REST: Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May the souls of the faithful departed, through the mercy of God, rest in peace. Amen.

LET US PRAY: O God, the Creator and Redeemer of all the faithful, grant to the souls of Your departed servants remission of all their sins, that through our pious supplications they may obtain the mercy they always desired. Who lives and reigns with You and the Holy Spirit, God, forever and ever. Amen.`,
    tags: ["dead", "funeral", "office of dead", "rest in peace"],
    readTime: 0,
  },
  {
    id: "commendation-dying",
    title: "Commendation of the Dying",
    category: "special",
    text: `Go forth, Christian soul, from this world, in the name of God the almighty Father who created you, in the name of Jesus Christ, Son of the living God, who suffered for you, in the name of the Holy Spirit, who was poured out upon you. Go forth, faithful Christian.

May you live in peace this day, may your home be with God, in Zion, with Mary the virgin Mother of God, with Joseph, and all the Angels and Saints.

As you delivered Noah from the flood, Abraham from the land of Ur, Moses from the hand of Pharaoh, Daniel from the lion's den, the three young men from the fiery furnace, so deliver this your servant from every evil, and set him/her in the heavenly paradise.

May your true and faithful God, who created you, fashioned you, and has tried you through this life, now receive you in His heavenly mercy, and grant you eternal peace.

Let us pray: Into Your hands, O Lord, we commend the spirit of Your servant N. A sheep of Your own fold, a lamb of Your own flock, a sinner of Your own redeeming. Receive him/her into the arms of Your mercy, into the blessed rest of everlasting peace, and into the company of the saints in light. Amen.`,
    tags: ["dying", "commendation", "death", "last rites"],
    readTime: 0,
  },
  {
    id: "dies-irae",
    title: "Dies Irae (Sequence for the Dead)",
    category: "special",
    text: `Dies irae, dies illa, Solvet saeclum in favilla, Teste David cum Sibylla.

Quantus tremor est futurus, Quando Judex est venturus, Cuncta stricte discussurus!

Tuba mirum spargens sonum Per sepulchra regionum, Coget omnes ante thronum.

Mors stupebit et natura, Cum resurget creatura, Judicanti responsura.

Liber scriptus proferetur, In quo totum continetur, Unde mundus judicetur.

Judex ergo cum sedebit, Quidquid latet apparebit: Nil inultum remanebit.

Quid sum miser tunc dicturus? Quem patronum rogaturus, Cum vix justus sit securus?

Tuba mirum spargens sonum Per sepulchra regionum, Coget omnes ante thronum.

Rex tremendae majestatis, Qui salvandos salvas gratis, Salva me, fons pietatis.

Recordare, Jesu pie, Quod sum causa tuae viae; Ne me perdas illa die.

Quaerens me, sedisti lassus: Redemisti crucem passus: Tantus labor non sit cassus.

Juste judex ultionis, Donum fac remissionis Ante diem rationis.

Ingemisco, tamquam reus: Culpa rubet vultus meus: Supplicanti parce, Deus.

Qui Mariam absolvisti, Et latronem exaudisti, Mihi quoque spem dedisti.

Preces meae non sunt dignae: Sed Tu bonus fac benigne, Ne perenni cremer igne.

Inter oves locum praesta, Et ab haedis me sequestra, Statuens in parte dextra.

Confutatis maledictis, Flammis acribus addictis, Voca me cum benedictis.

Oro supplex et acclinis, Cor contritum quasi cinis: Gere curam mei finis.

Lacrymosa dies illa, Qua resurget ex favilla, Judicandus homo reus.

Huic ergo parce, Deus: Pie Jesu Domine, Dona eis requiem. Amen.`,
    tags: ["dies irae", "dead", "funeral", "sequence", "latin"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // CONFESSION PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "examination-of-conscience",
    title: "Examination of Conscience",
    category: "confession",
    text: `Come, Holy Spirit, enlighten my mind to know my sins, and move my heart to be truly sorry for them.

Have I placed God first in my life, or have I put other things before Him? Have I prayed faithfully, or have I been careless and distracted? Have I used God's name with love and reverence, or carelessly or in anger? Have I kept Sundays and holy days holy, attending Mass and avoiding unnecessary work? Have I been obedient and respectful to my parents and lawful superiors? Have I loved my neighbor, or have I given way to anger, hatred, or revenge? Have I been honest in word and deed, or have I lied, cheated, or stolen? Have I been pure in thought, word, and action? Have I been faithful and chaste in my thoughts and desires? Have I been content with what I have, or envious and greedy?

O my God, I am sorry for my sins with all my heart. In choosing to do wrong and failing to do good, I have sinned against You, whom I should love above all things. I firmly intend, with Your help, to do penance, to sin no more, and to avoid whatever leads me to sin. Amen.`,
    tags: ["confession", "penance", "examination", "conscience"],
    readTime: 0,
  },
  {
    id: "prayer-before-confession",
    title: "Prayer Before Confession",
    category: "confession",
    text: `Lord Jesus Christ, You are the Good Shepherd who came to seek the lost sheep. Give me the grace to know my sins, to be truly sorry for them, and to confess them humbly. Do not look on my sins, but on the faith of Your Church, and grant me the grace of Your mercy. Cleanse me by Your healing forgiveness, that I may serve You with a pure heart. You who live and reign, one God, forever and ever. Amen.`,
    tags: ["confession", "penance", "before", "mercy"],
    readTime: 0,
  },
  {
    id: "prayer-after-confession",
    title: "Prayer of Thanksgiving After Confession",
    category: "confession",
    text: `My God, I thank You with all my heart for Your wonderful forgiveness. You have washed away my sins and called me Your child again. Strengthen me by Your grace, keep me from my past sins, and help me to amend my life and serve You faithfully, that I may one day praise You forever in heaven. Amen.`,
    tags: ["confession", "penance", "thanksgiving", "after"],
    readTime: 0,
  },
  {
    id: "prayer-of-the-penitent",
    title: "Prayer of the Penitent (In the Confessional)",
    category: "confession",
    text: `Bless me, Father, for I have sinned. It has been some time since my last confession, and these are my sins: ... I am sorry for these and all the sins of my past life, especially for ...

O my God, I am heartily sorry for having offended You, and I detest all my sins because of Your just punishments, but most of all because they offend You, my God, who are all good and deserving of all my love. I firmly resolve, with the help of Your grace, to sin no more and to avoid the near occasions of sin. Amen.`,
    tags: ["confession", "penance", "penitent", "absolution"],
    readTime: 0,
  },
  {
    id: "psalm-51",
    title: "Psalm 51 — Have Mercy on Me, O God",
    category: "confession",
    text: `Have mercy on me, O God, in your goodness; in your great compassion wipe out my offense. Thoroughly wash away my guilt, and from my sin cleanse me. For I acknowledge my offense, and my sin is before me always: against you only have I sinned, and done what is evil in your sight.

Cleanse me with hyssop, that I may be pure; wash me, and I shall be whiter than snow. A clean heart create for me, O God, and a steadfast spirit renew within me. Cast me not out from your presence, and your holy spirit take not from me. Give me back the joy of your salvation, and a willing spirit sustain in me.

For you do not desire sacrifice, a burnt offering you would not accept; my sacrifice, O God, is a contrite spirit; a heart contrite and humbled, O God, you will not spurn. Amen.`,
    tags: ["confession", "psalm", "miserere", "penance", "mercy"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // MEAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "short-grace-before-meals",
    title: "Short Grace Before Meals",
    category: "meals",
    text: `Bless us, O Lord, and these Your gifts, which we are about to receive from Your bounty, through Christ our Lord. Amen. Lord, make us truly grateful for all we have received. Amen.`,
    tags: ["grace", "meals", "food", "short"],
    readTime: 0,
  },
  {
    id: "grace-before-family-meal",
    title: "Grace Before a Family Meal",
    category: "meals",
    text: `Heavenly Father, we thank You for bringing our family together at this table. Bless this food which Your goodness provides, bless those who prepared it, and grant that as we share this meal we may grow in love for You and for one another. Through Christ our Lord. Amen.`,
    tags: ["grace", "meals", "family", "blessing"],
    readTime: 0,
  },
  {
    id: "grace-after-family-meal",
    title: "Thanksgiving After a Family Meal",
    category: "meals",
    text: `We give You thanks, Almighty God, for all Your benefits. Bless our family, and keep us united in Your love. May the souls of the faithful departed, through the mercy of God, rest in peace. Amen.`,
    tags: ["grace", "meals", "family", "thanksgiving"],
    readTime: 0,
  },
  {
    id: "grace-before-meals-children",
    title: "Grace Before Meals for Children",
    category: "meals",
    text: `God is great, God is good, let us thank Him for our food. By His hands we all are fed; give us, Lord, our daily bread. Amen.`,
    tags: ["grace", "meals", "children", "simple"],
    readTime: 0,
  },
  {
    id: "prayer-for-the-hungry",
    title: "Prayer for Those Who Are Hungry",
    category: "meals",
    text: `Lord Jesus, You fed the hungry crowds and taught us to hunger for holiness. Bless all who hunger today, in body or in spirit. Give us generous hearts to share our bread with those in need, that no one may lack what You so freely give. Amen.`,
    tags: ["hunger", "charity", "poor", "meals"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL ESSENTIAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "sign-of-the-cross",
    title: "The Sign of the Cross",
    category: "essential",
    text: `By the sign of the cross, deliver us from our enemies, O Lord our God. In the name of the Father, and of the Son, and of the Holy Spirit. Amen.`,
    tags: ["sign of the cross", "trinity", "essential"],
    readTime: 0,
  },
  {
    id: "de-profundis",
    title: "De Profundis (Psalm 130)",
    category: "essential",
    text: `Out of the depths I cry to you, O Lord; Lord, hear my voice! Let your ears be attentive to my voice in supplication. If you, O Lord, mark iniquities, Lord, who can stand? But with you is forgiveness, that you may be revered.

I trust in the Lord; my soul trusts in his word. My soul waits for the Lord more than sentinels wait for the dawn. For with the Lord is kindness and with him is plenteous redemption; and he will redeem Israel from all their iniquities. Amen.`,
    tags: ["psalm", "mercy", "trust", "essential"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL DEVOTIONS
  // ═══════════════════════════════════════════════════════
  {
    id: "divine-mercy-chaplet",
    title: "The Divine Mercy Chaplet",
    category: "devotions",
    text: `Begin with the Sign of the Cross, then on the ordinary rosary beads pray the Our Father, the Hail Mary, and the Apostles' Creed.

On each large bead, pray: Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world.

On each of the ten small beads, pray: For the sake of His sorrowful Passion, have mercy on us and on the whole world.

To conclude, pray three times: Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.

O Blood and Water, which gushed forth from the Heart of Jesus as a fount of mercy for us, I trust in You. Amen.`,
    tags: ["divine mercy", "chaplet", "mercy", "faustina"],
    readTime: 0,
  },
  {
    id: "o-salutaris-hostia",
    title: "O Salutaris Hostia",
    category: "devotions",
    text: `O Salutaris Hostia, quae caeli pandis ostium, bella premunt hostilia, da robur, fer auxilium.

(O saving Victim, opening wide the gate of heaven to man below! Our foes press on from every side; Your aid supply, Your strength bestow.)

Uni trinoque Domino sit sempiterna gloria, qui vitam sine termino nobis donet in patria. Amen.

(To Your great name be endless praise, immortal Godhead, One in Three; O grant us endless length of days, in our true native land with Thee. Amen.)`,
    tags: ["eucharist", "benediction", "latin", "adoration"],
    readTime: 0,
  },
  {
    id: "tantum-ergo",
    title: "Tantum Ergo",
    category: "devotions",
    text: `Tantum ergo Sacramentum veneremur cernui, et antiquum documentum novo cedat ritui; praestet fides supplementum sensuum defectui.

(Down in adoration falling, this great Sacrament we hail; over ancient forms of worship new and nobler rites prevail; faith will tell us Christ is present when our human senses fail.)

Genitori, Genitoque laus et jubilatio, salus, honor, virtus quoque sit et benedictio; procedenti ab utroque compar sit laudatio. Amen.

(To the everlasting Father, and the Son who reigns on high, with the Holy Ghost proceeding forth from Each eternally, be salvation, honor, blessing, might and endless majesty. Amen.)`,
    tags: ["eucharist", "benediction", "latin", "adoration"],
    readTime: 0,
  },
  {
    id: "adoro-te-devote",
    title: "Adoro Te Devote",
    category: "devotions",
    text: `Adoro te devote, latens Deitas, quae sub his figuris vere latitas; tibi se cor meum totum subiicit, quia te contemplans totum deficit.

(Godhead here in hiding, whom I do adore, masked by these bare shadows, shape and nothing more; see, Lord, at Your service low lies here a heart lost, all lost in wonder at the God You are.)

Jesu, quem velatum nunc aspicio, oro fiat illud quod tam sitio, ut te revelata cernens facie, visu sim beatus tuae gloriae. Amen.

(Jesu, whom I look at shrouded here below, I beseech You send me what I thirst for so, that I may behold You, unveiled, and forever gaze in bliss upon Your glory. Amen.)`,
    tags: ["eucharist", "adoration", "thomas aquinas", "latin"],
    readTime: 0,
  },
  {
    id: "divine-praises",
    title: "The Divine Praises",
    category: "devotions",
    text: `Blessed be God. Blessed be His Holy Name. Blessed be Jesus Christ, true God and true Man. Blessed be the Name of Jesus. Blessed be His Most Sacred Heart. Blessed be His Most Precious Blood. Blessed be Jesus in the Most Holy Sacrament of the Altar. Blessed be the Holy Spirit, the Paraclete. Blessed be the great Mother of God, Mary most holy. Blessed be her holy and Immaculate Conception. Blessed be her glorious Assumption. Blessed be the name of Mary, Virgin and Mother. Blessed be Saint Joseph, her most chaste spouse. Blessed be God in His angels and in His saints. Amen.`,
    tags: ["benediction", "praise", "sacrament"],
    readTime: 0,
  },
  {
    id: "consecration-sacred-heart",
    title: "Consecration to the Sacred Heart of Jesus",
    category: "devotions",
    text: `Most sweet Jesus, humbly kneeling at Your feet, we consecrate to You our hearts, our lives, and all that we have. Accept this offering, O Sacred Heart, and make us faithful to You in all things. Grant that we may never separate ourselves from Your love, and may we spend our lives in making You known and loved. Take us into Your Sacred Heart and keep us there forever. Amen.`,
    tags: ["sacred heart", "consecration", "jesus", "devotion"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL LITANIES
  // ═══════════════════════════════════════════════════════
  {
    id: "litany-of-humility",
    title: "Litany of Humility",
    category: "litanies",
    text: `O Jesus! meek and humble of heart, hear me.

From the desire of being esteemed, deliver me, Jesus.
From the desire of being loved, deliver me, Jesus.
From the desire of being extolled, deliver me, Jesus.
From the desire of being honored, deliver me, Jesus.
From the desire of being praised, deliver me, Jesus.
From the desire of being preferred to others, deliver me, Jesus.
From the desire of being consulted, deliver me, Jesus.
From the desire of being approved, deliver me, Jesus.
From the fear of being humiliated, deliver me, Jesus.
From the fear of being despised, deliver me, Jesus.
From the fear of suffering rebukes, deliver me, Jesus.
From the fear of being calumniated, deliver me, Jesus.
From the fear of being forgotten, deliver me, Jesus.
From the fear of being ridiculed, deliver me, Jesus.
From the fear of being wronged, deliver me, Jesus.
From the fear of being suspected, deliver me, Jesus.

That others may be loved more than I, Jesus, grant me the grace to desire it.
That others may be esteemed more than I, Jesus, grant me the grace to desire it.
That in the opinion of the world others may increase and I may decrease, Jesus, grant me the grace to desire it.
That others may be chosen and I set aside, Jesus, grant me the grace to desire it.
That others may be praised and I unnoticed, Jesus, grant me the grace to desire it.
That others may be preferred to me in everything, Jesus, grant me the grace to desire it.
That others may become holier than I, provided that I may become as holy as I should, Jesus, grant me the grace to desire it.

Jesus, meek and humble of heart, make my heart like unto Thine. Amen.`,
    tags: ["humility", "litany", "virtue"],
    readTime: 0,
  },
  {
    id: "litany-of-st-joseph",
    title: "Litany of Saint Joseph",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us. Saint Joseph, pray for us. Renowned offspring of David, pray for us. Light of Patriarchs, pray for us. Spouse of the Mother of God, pray for us. Guardian of the Virgin, pray for us. Foster father of the Son of God, pray for us. Faithful guardian of Christ, pray for us. Head of the Holy Family, pray for us. Joseph most just, pray for us. Joseph most chaste, pray for us. Joseph most prudent, pray for us. Joseph most valiant, pray for us. Joseph most obedient, pray for us. Joseph most faithful, pray for us. Mirror of patience, pray for us. Lover of poverty, pray for us. Model of workmen, pray for us. Glory of domestic life, pray for us. Guardian of virgins, pray for us. Pillar of families, pray for us. Comfort of the afflicted, pray for us. Hope of the sick, pray for us. Patron of the dying, pray for us. Terror of demons, pray for us. Protector of Holy Church, pray for us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

O God, who in Your inexpressible providence were pleased to choose Saint Joseph to be the spouse of Your most holy Mother, grant that we may be worthy to have him for our intercessor in heaven, whom on earth we venerate as our protector. You who live and reign forever and ever. Amen.`,
    tags: ["st. joseph", "litany", "family", "worker"],
    readTime: 0,
  },
  {
    id: "litany-of-the-saints",
    title: "Litany of the Saints",
    category: "litanies",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of virgins, pray for us. Saint Michael, pray for us. Saint Gabriel, pray for us. Saint Raphael, pray for us. All you holy Angels and Archangels, pray for us. All you holy ranks of blessed Spirits, pray for us.

Saint John the Baptist, pray for us. Saint Joseph, pray for us. All you holy Patriarchs and Prophets, pray for us. Saint Peter, pray for us. Saint Paul, pray for us. Saint Andrew, pray for us. Saint James, pray for us. Saint John, pray for us. Saint Thomas, pray for us. Saint James, pray for us. Saint Philip, pray for us. Saint Bartholomew, pray for us. Saint Matthew, pray for us. Saint Simon, pray for us. Saint Thaddeus, pray for us. Saint Matthias, pray for us. Saint Barnabas, pray for us. Saint Luke, pray for us. Saint Mark, pray for us. All you holy Apostles and Evangelists, pray for us. All you holy Disciples of the Lord, pray for us.

All you holy Innocents, pray for us. Saint Stephen, pray for us. Saint Lawrence, pray for us. Saint Vincent, pray for us. Saints Fabian and Sebastian, pray for us. Saints John and Paul, pray for us. Saints Cosmas and Damian, pray for us. All you holy Martyrs, pray for us.

Saint Sylvester, pray for us. Saint Gregory, pray for us. Saint Ambrose, pray for us. Saint Augustine, pray for us. Saint Jerome, pray for us. Saint Martin, pray for us. Saint Nicholas, pray for us. All you holy Bishops and Confessors, pray for us. All you holy Doctors, pray for us. Saint Anthony, pray for us. Saint Benedict, pray for us. Saint Bernard, pray for us. Saint Dominic, pray for us. Saint Francis, pray for us. All you holy Priests and Levites, pray for us. All you holy Monks and Hermits, pray for us.

Saint Mary Magdalene, pray for us. Saint Agatha, pray for us. Saint Lucy, pray for us. Saint Agnes, pray for us. Saint Cecilia, pray for us. Saint Catherine, pray for us. Saint Anastasia, pray for us. All you holy Virgins and Widows, pray for us. All you holy Saints of God, intercede for us.

Be merciful, spare us, O Lord. Be merciful, graciously hear us, O Lord. From all evil, deliver us, O Lord. From all sin, deliver us, O Lord. From everlasting death, deliver us, O Lord. We sinners, we beseech You, hear us. That You would spare us, we beseech You, hear us. That You would pardon us, we beseech You, hear us. That You would lead all people to the light of the Gospel, we beseech You, hear us. That You would grant eternal rest to all the faithful departed, we beseech You, hear us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

O Christ, hear us. Christ, graciously hear us. Amen.`,
    tags: ["litany", "saints", "all saints", "intercession"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL SAINTS
  // ═══════════════════════════════════════════════════════
  {
    id: "prayer-to-st-jude",
    title: "Prayer to Saint Jude (Impossible Causes)",
    category: "saints",
    text: `Most holy Apostle, Saint Jude, faithful servant and friend of Jesus, the Church honors and invokes you universally as the patron of hopeless cases, of things despaired of. Pray for me, who am so miserable. Make use, I implore you, of that particular privilege given to you, to bring visible and speedy help where help is almost despaired of. Come to my assistance in this great need, that I may receive the consolation and succor of heaven in all my necessities, tribulations, and sufferings. I promise you, O blessed Jude, to be ever mindful of this great favor, and never to cease honoring you as my special and powerful patron. Amen.`,
    tags: ["st. jude", "hopeless", "desperate", "intercession"],
    readTime: 0,
  },
  {
    id: "prayer-to-st-peregrine",
    title: "Prayer to Saint Peregrine (Against Cancer)",
    category: "saints",
    text: `O great Saint Peregrine, called the Mighty and the Wonder-Worker, because of the powerful intercession you have obtained from God for those who call upon you in serious need: you know well that our loving God has given you the power to help those who, like you, are afflicted with cancer and other diseases. I come to you with great confidence, begging you to plead my cause before God, the healer of all ills. I beg you, by the merits of the graces granted to you, to obtain for me a perfect cure, if it is God's will. If I must suffer, grant me the grace to bear my cross with patience and love. Amen.`,
    tags: ["st. peregrine", "cancer", "sickness", "healing"],
    readTime: 0,
  },

  // ═══════════════════════════════════════════════════════
  // ADDITIONAL SPECIAL PRAYERS
  // ═══════════════════════════════════════════════════════
  {
    id: "prayer-for-a-happy-death",
    title: "Prayer for a Happy Death",
    category: "special",
    text: `O God, whose mercy is infinite and whose goodness is without limit, in Your tender love look upon me in my final hour. Jesus, Mary, and Joseph, I give you my heart and my soul. Jesus, Mary, and Joseph, assist me in my last agony. Jesus, Mary, and Joseph, may I breathe forth my soul in peace with you. Grant that I may die in Your friendship, strengthened by the sacraments, and come to share eternal life with all the saints. Amen.`,
    tags: ["death", "happy death", "final hour", "last rites"],
    readTime: 0,
  },
  {
    id: "prayer-for-the-unborn",
    title: "Prayer for the Unborn",
    category: "special",
    text: `Heavenly Father, You are the Author of life, and every person is made in Your image. Protect the lives of the unborn, and touch the hearts of all who doubt the sacred gift of life. Grant wisdom to those who counsel, courage to those who are afraid, and compassion to all who serve the unborn and their families. Through Christ our Lord. Amen.`,
    tags: ["unborn", "life", "pro-life", "protection"],
    readTime: 0,
  },
];

// Compute read times
CATHOLIC_PRAYERS.forEach((p) => {
  p.readTime = w(p.text);
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
