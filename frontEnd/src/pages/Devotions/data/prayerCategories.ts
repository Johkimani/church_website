export interface Prayer {
  id: string;
  title: string;
  category: "novenas" | "litanies" | "healing" | "daily";
  text: string;
  day?: number;
  intention?: string;
  novenaId?: string;
}

// Import all detailed novena prayers from the batch files
import { NOVENA_PRAYERS } from "./novenaPrayers";
import { NOVENA_PRAYERS_2 } from "./novenaPrayers2";
import { NOVENA_PRAYERS_3 } from "./novenaPrayers3";
import { NOVENA_PRAYERS_4 } from "./novenaPrayers4";
import { NOVENA_PRAYERS_5 } from "./novenaPrayers5";
import { NOVENA_PRAYERS_6 } from "./novenaPrayers6";
import { NOVENA_PRAYERS_7 } from "./novenaPrayers7";

export const PRAYERS: Prayer[] = [
  // Merge all detailed novena prayers (34 novenas × 9 days = 306 prayers)
  ...NOVENA_PRAYERS,
  ...NOVENA_PRAYERS_2,
  ...NOVENA_PRAYERS_3,
  ...NOVENA_PRAYERS_4,
  ...NOVENA_PRAYERS_5,
  ...NOVENA_PRAYERS_6,
  ...NOVENA_PRAYERS_7,

  // ═══════════════════════════════════════════════════════════════
  // LITANIES — Full prayers with proper invocation/response format
  // ═══════════════════════════════════════════════════════════════

  { id: "lit-loreto", title: "Litany of Loreto (Litany of the Blessed Virgin Mary)", category: "litanies",
    intention: "Marian devotion",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of Virgins, pray for us. Mother of Christ, pray for us. Mother of the Church, pray for us. Mother of Divine Grace, pray for us. Mother most pure, pray for us. Mother most chaste, pray for us. Mother inviolate, pray for us. Mother undefiled, pray for us. Mother most amiable, pray for us. Mother most admirable, pray for us. Mother of Good Counsel, pray for us. Mother of our Creator, pray for us. Mother of our Savior, pray for us. Mother of mercy, pray for us. Virgin most prudent, pray for us. Virgin most venerable, pray for us. Virgin most renowned, pray for us. Virgin most powerful, pray for us. Virgin most merciful, pray for us. Virgin most faithful, pray for us. Mirror of justice, pray for us. Seat of wisdom, pray for us. Cause of our joy, pray for us. Spiritual vessel, pray for us. Vessel of honor, pray for us. Singular vessel of devotion, pray for us. Mystical rose, pray for us. Tower of David, pray for us. Tower of ivory, pray for us. House of gold, pray for us. Ark of the covenant, pray for us. Gate of heaven, pray for us. Morning star, pray for us. Health of the sick, pray for us. Refuge of sinners, pray for us. Comfort of the afflicted, pray for us. Help of Christians, pray for us. Queen of angels, pray for us. Queen of patriarchs, pray for us. Queen of prophets, pray for us. Queen of apostles, pray for us. Queen of martyrs, pray for us. Queen of confessors, pray for us. Queen of virgins, pray for us. Queen of all saints, pray for us. Queen conceived without original sin, pray for us. Queen assumed into heaven, pray for us. Queen of the most holy Rosary, pray for us. Queen of families, pray for us. Queen of peace, pray for us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

Pray for us, O holy Mother of God. That we may be made worthy of the promises of Christ.

Let us pray: O God, whose only-begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal salvation; grant, we beseech You, that we, who meditate on these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.` },

  { id: "lit-sacred-heart", title: "Litany of the Sacred Heart of Jesus", category: "litanies",
    intention: "Love and reparation",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Heart of Jesus, Son of the Eternal Father, have mercy on us. Heart of Jesus, formed by the Holy Spirit in the womb of the Virgin Mother, have mercy on us. Heart of Jesus, substantially united to the Word of God, have mercy on us. Heart of Jesus, of infinite majesty, have mercy on us. Heart of Jesus, holy temple of God, have mercy on us. Heart of Jesus, tabernacle of the Most High, have mercy on us. Heart of Jesus, house of God and gate of heaven, have mercy on us. Heart of Jesus, burning furnace of charity, have mercy on us. Heart of Jesus, abode of justice and love, have mercy on us. Heart of Jesus, full of goodness and love, have mercy on us. Heart of Jesus, abyss of all virtues, have mercy on us. Heart of Jesus, most worthy of all praise, have mercy on us. Heart of Jesus, king and center of all hearts, have mercy on us. Heart of Jesus, in whom are all the treasures of wisdom and knowledge, have mercy on us. Heart of Jesus, in whom dwells all the fullness of the Godhead, have mercy on us. Heart of Jesus, in whom the Father was well pleased, have mercy on us. Heart of Jesus, of whose fullness we have all received, have mercy on us. Heart of Jesus, desire of the everlasting hills, have mercy on us. Heart of Jesus, patient and most merciful, have mercy on us. Heart of Jesus, enriched all who invoke You, have mercy on us. Heart of Jesus, fountain of life and holiness, have mercy on us. Heart of Jesus, propitiation for our sins, have mercy on us. Heart of Jesus, loaded down with opprobrium, have mercy on us. Heart of Jesus, bruised for our offenses, have mercy on us. Heart of Jesus, obedient unto death, have mercy on us. Heart of Jesus, pierced with a lance, have mercy on us. Heart of Jesus, source of all consolation, have mercy on us. Heart of Jesus, our life and resurrection, have mercy on us. Heart of Jesus, our peace and reconciliation, have mercy on us. Heart of Jesus, victim for our sins, have mercy on us. Heart of Jesus, salvation of those who hope in You, have mercy on us. Heart of Jesus, hope of those who die in You, have mercy on us. Heart of Jesus, delight of all the saints, have mercy on us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

Jesus, meek and humble of heart, make our hearts like unto Yours. Amen.` },

  { id: "lit-divine-mercy", title: "Litany of the Divine Mercy", category: "litanies",
    intention: "God's mercy",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Divine Mercy, gushing forth from the bosom of the Father, I trust in You. Divine Mercy, greatest attribute of God, I trust in You. Divine Mercy, incomprehensible mystery, I trust in You. Divine Mercy, foundfount of our redemption, I trust in You. Divine Mercy, beyond human understanding, I trust in You. Divine Mercy, from which all good things flow, I trust in You. Divine Mercy, crown of all God's works, I trust in You. Divine Mercy, inexhaustible spring of God's generosity, I trust in You. Divine Mercy, heaven for those who love You, I trust in You. Divine Mercy, hope for the desperate, I trust in You. Divine Mercy, relief for the burdened of heart, I trust in You. Divine Mercy, solace for those who suffer, I trust in You. Divine Mercy, strength of the weak, I trust in You. Divine Mercy, rescue of the lost, I trust in You. Divine Mercy, forgiveness for sinners, I trust in You. Divine Mercy, delight of holy souls, I trust in You. Divine Mercy, our only hope in body and soul, I trust in You. Divine Mercy, which flows from the open side of Christ, I trust in You. Divine Mercy, the ocean of grace, I trust in You. Divine Mercy, that renews the face of the earth, I trust in You.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase Your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to Your holy will, which is Love and Mercy itself. Amen.` },

  { id: "lit-saint-joseph", title: "Litany of Saint Joseph", category: "litanies",
    intention: "Family and work",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us. Saint Joseph, pray for us. Illustrious offspring of David, pray for us. Light of Patriarchs, pray for us. Spouse of the Mother of God, pray for us. Chaste guardian of the Virgin, pray for us. Foster father of the Son of God, pray for us. Zealous defender of Christ, pray for us. Head of the Holy Family, pray for us. Joseph most just, pray for us. Joseph most chaste, pray for us. Joseph most prudent, pray for us. Joseph most courageous, pray for us. Joseph most obedient, pray for us. Joseph most faithful, pray for us. Mirror of patience, pray for us. Lover of poverty, pray for us. Glory of domestic life, pray for us. Guardian of virgins, pray for us. Pillar of families, pray for us. Solace of the afflicted, pray for us. Hope of the sick, pray for us. Patron of the dying, pray for us. Terror of demons, pray for us. Protector of Holy Church, pray for us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

Let us pray: O God, in Your ineffable providence You chose blessed Joseph to be the spouse of Your most holy Mother; grant that we, who venerate him as our protector on earth, may be worthy of his heavenly intercession. Through Christ our Lord. Amen.` },

  { id: "lit-holy-spirit", title: "Litany of the Holy Spirit", category: "litanies",
    intention: "Spiritual renewal",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Spirit, Lord and Giver of Life, have mercy on us. Spirit of Wisdom and Understanding, have mercy on us. Spirit of Counsel and Fortitude, have mercy on us. Spirit of Knowledge and Piety, have mercy on us. Spirit of Fear of the Lord, have mercy on us. Spirit of burning love, have mercy on us. Spirit of grace and prayer, have mercy on us. Spirit of holiness and justice, have mercy on us. Spirit of truth and peace, have mercy on us. Spirit of joy and consolation, have mercy on us. Spirit of gentleness and goodness, have mercy on us. Spirit of patience and mildness, have mercy on us. Spirit of fidelity and mercy, have mercy on us. Spirit of modesty and self-control, have mercy on us. Spirit of purity and innocence, have mercy on us. Spirit of zeal and holy service, have mercy on us. Spirit of charity and detachment, have mercy on us. Spirit of humility and obedience, have mercy on us. Spirit of divine power and glory, have mercy on us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

Come, Holy Spirit, fill the hearts of Your faithful, and enkindle in them the fire of Your love. Send forth Your Spirit, and they shall be created. And You shall renew the face of the earth.

Let us pray: O God, who by the light of the Holy Spirit did instruct the hearts of the faithful, grant that by the same Holy Spirit we may be truly wise and ever rejoice in His consolation. Through Christ our Lord. Amen.` },

  // ═══════════════════════════════════════════════════════════════
  // HEALING PRAYERS
  // ═══════════════════════════════════════════════════════════════

  { id: "heal-1", title: "Prayer for Physical Healing", category: "healing", intention: "Healing of the body",
    text: "Lord Jesus Christ, You passed through Galilee healing the sick. Stretch out Your healing hand upon me (or upon ______). Restore health to the body, strength to the limbs, and peace to the mind. If it is Your will, grant complete healing. If not, grant the grace to bear this cross with patience and trust in Your loving providence. Through the intercession of Our Lady of Lourdes and Saint Raphael the Archangel, heal us, Lord. Amen." },
  { id: "heal-2", title: "Prayer for Emotional Healing", category: "healing", intention: "Healing of the heart",
    text: "Jesus, You who wept at the tomb of Lazarus, You know the depth of human sorrow. I bring before You the wounds of my heart — the grief, the loss, the disappointment, the loneliness. Heal me, Lord. Touch the broken places with Your gentle mercy. Replace my sorrow with joy, my despair with hope, and my fear with trust. Help me to forgive those who have hurt me and to receive Your healing love. Amen." },
  { id: "heal-3", title: "Anima Christi (Soul of Christ)", category: "healing", intention: "Sanctification and protection",
    text: "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within Your wounds, hide me. Permit me not to be separated from You. From the malicious enemy, defend me. In the hour of my death, call me and bid me come to You, that with Your saints I may praise You for ever and ever. Amen." },
  { id: "heal-4", title: "Prayer to Saint Raphael for Healing", category: "healing", intention: "Guidance to healing",
    text: "Glorious Archangel Saint Raphael, great prince of the heavenly court, you are illustrious for your gifts of wisdom and grace. You are a guide of those who journey by land or sea or air, consoler of the afflicted, and refuge of the sick. I beg you, assist me in all my needs and in all the sufferings of this life, as once you helped the young Tobias on his travels. Because you are the medicine of God, I humbly pray you to heal the many infirmities of my soul and the ills that afflict my body. Amen." },
  { id: "heal-5", title: "Prayer for Mental Peace", category: "healing", intention: "Peace of mind",
    text: "Come, O Holy Spirit, and bring peace to my troubled mind. Still my anxious thoughts, quiet my racing heart, and settle my restless spirit. You are the Spirit of Peace, the Comforter, the Consoler. Fill me with Your tranquility. Help me to cast all my anxieties upon You, for You care for me. Grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference. Amen." },

  // ═══════════════════════════════════════════════════════════════
  // DAILY CATHOLIC PRAYERS
  // ═══════════════════════════════════════════════════════════════

  { id: "daily-1", title: "Morning Offering", category: "daily", intention: "Start the day with God",
    text: "O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day, for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all my associates, and in particular for the intentions of the Holy Father. Amen." },
  { id: "daily-2", title: "Act of Contrition", category: "daily", intention: "Daily repentance",
    text: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all-good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid near occasions of sin. Amen." },
  { id: "daily-3", title: "The Angelus", category: "daily", intention: "Remembrance of the Incarnation",
    text: "The Angel of the Lord declared unto Mary. And she conceived of the Holy Spirit. Hail Mary…\n\nBehold the handmaid of the Lord. Be it done to me according to thy word. Hail Mary…\n\nAnd the Word was made Flesh. And dwelt among us. Hail Mary…\n\nPour forth, we beseech Thee, O Lord, Thy grace into our hearts, that we, to whom the Incarnation of Christ Thy Son was made known by the message of an Angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen." },
  { id: "daily-4", title: "Guardian Angel Prayer", category: "daily", intention: "Angel protection",
    text: "Angel of God, my guardian dear, to whom God's love commits me here. Ever this day be at my side, to light and guard, to rule and guide. Amen." },
  { id: "daily-5", title: "Grace Before Meals", category: "daily", intention: "Thanksgiving for food",
    text: "Bless us, O Lord, and these Thy gifts, which we are about to receive from Thy bounty, through Christ our Lord. Amen." },
  { id: "daily-6", title: "Hail Holy Queen (Salve Regina)", category: "daily", intention: "Marian consecration",
    text: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this, our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nPray for us, O holy Mother of God. That we may be made worthy of the promises of Christ. Amen." },
  { id: "daily-7", title: "Prayer Before Sleep", category: "daily", intention: "Night prayer",
    text: "Visit, we beseech You, O Lord, this dwelling, and drive far from it all snares of the enemy. Let Your holy angels dwell within to preserve us in peace; and let Your blessing be upon us, through Jesus Christ our Lord. Amen." },
  { id: "daily-8", title: "Glory Be (Doxology)", category: "daily", intention: "Praise of the Trinity",
    text: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen." },
  { id: "daily-9", title: "Fatima Prayer", category: "daily", intention: "Reparations",
    text: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy. Amen." },
];
