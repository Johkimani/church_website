export interface Prayer {
  id: string;
  title: string;
  category: "novenas" | "litanies" | "saints" | "healing" | "daily";
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
import { NOVENA_PRAYERS_8 } from "./novenaPrayers8";
import { NOVENA_PRAYERS_9 } from "./novenaPrayers9";
import { NOVENA_PRAYERS_10 } from "./novenaPrayers10";
import { NOVENA_PRAYERS_11 } from "./novenaPrayers11";
import { NOVENA_PRAYERS_12 } from "./novenaPrayers12";
import { NOVENA_PRAYERS_13 } from "./novenaPrayers13";
import { NOVENA_PRAYERS_14 } from "./novenaPrayers14";
import { NOVENA_PRAYERS_15 } from "./novenaPrayers15";

export const PRAYERS: Prayer[] = [
  // Merge all detailed novena prayers (59 novenas × 9 days = 531 prayers)
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

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL LITANIES
  // ═══════════════════════════════════════════════════════════════

  { id: "lit-humility", title: "Litany of Humility", category: "litanies", intention: "Humility",
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
From the fear of being rebuked, deliver me, O Jesus.
From the fear of being calumniated, deliver me, O Jesus.
From the fear of being forgotten, deliver me, O Jesus.
From the fear of being ridiculed, deliver me, O Jesus.
From the fear of being wronged, deliver me, O Jesus.
From the fear of being suspected, deliver me, O Jesus.

That others may be loved more than I, Jesus, grant me the grace to desire it.
That others may be esteemed more than I, Jesus, grant me the grace to desire it.
That others may increase and I may decrease, Jesus, grant me the grace to desire it.
That others may be chosen and I set aside, Jesus, grant me the grace to desire it.
That others may be praised and I unnoticed, Jesus, grant me the grace to desire it.
That others may be preferred to me in everything, Jesus, grant me the grace to desire it.
That others may become holier than I, provided I may become as holy as I should, Jesus, grant me the grace to desire it.` },

  { id: "lit-precious-blood", title: "Litany of the Precious Blood", category: "litanies", intention: "Redemption",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Blood of Christ, only-begotten Son of the Eternal Father, save us. Blood of Christ, incarnate Word of God, save us. Blood of Christ, of the New and Eternal Testament, save us. Blood of Christ, falling upon the earth in the Agony, save us. Blood of Christ, shed profusely in the Scourging, save us. Blood of Christ, flowing forth in the Crowning with Thorns, save us. Blood of Christ, poured out on the Cross, save us. Blood of Christ, price of our salvation, save us. Blood of Christ, without which there is no forgiveness, save us. Blood of Christ, Eucharistic drink and refreshment of souls, save us. Blood of Christ, stream of mercy, save us. Blood of Christ, victor over demons, save us. Blood of Christ, courage of Martyrs, save us. Blood of Christ, strength of Confessors, save us. Blood of Christ, bringing forth Virgins, save us. Blood of Christ, help of those in peril, save us. Blood of Christ, relief of the burdened, save us. Blood of Christ, solace of the sorrowing, save us. Blood of Christ, hope of the repentant, save us. Blood of Christ, consolation of the dying, save us. Blood of Christ, peace and tenderness of hearts, save us. Blood of Christ, pledge of eternal life, save us. Blood of Christ, freeing souls from purgatory, save us. Blood of Christ, worthy of all praise and glory, save us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

V. You have redeemed us, O Lord, in Your Blood.
R. And made us, for our God, a kingdom.

Let us pray: Almighty and eternal God, You have appointed Your only-begotten Son the Redeemer of the world and willed to be appeased by His Blood. Grant, we beg of You, that we may worthily adore this price of our salvation and through its power be safeguarded from the evils of the present life, so that we may enjoy its fruits forever in heaven. Through the same Christ our Lord. Amen.` },

  { id: "lit-saints", title: "Litany of the Saints", category: "litanies", intention: "Universal intercession",
    text: `Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us.

God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us.

Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of Virgins, pray for us. Saint Michael, pray for us. Saint Gabriel, pray for us. Saint Raphael, pray for us. All Holy Angels and Archangels, pray for us. Saint John the Baptist, pray for us. Saint Joseph, pray for us. All Holy Patriarchs and Prophets, pray for us. Saint Peter, pray for us. Saint Paul, pray for us. Saint Andrew, pray for us. Saint James, pray for us. Saint John, pray for us. Saint Thomas, pray for us. Saint James, pray for us. Saint Philip, pray for us. Saint Bartholomew, pray for us. Saint Matthew, pray for us. Saint Simon, pray for us. Saint Thaddeus, pray for us. Saint Matthias, pray for us. Saint Barnabas, pray for us. Saint Luke, pray for us. Saint Mark, pray for us. All Holy Apostles and Evangelists, pray for us. All Holy Disciples of the Lord, pray for us. All Holy Innocents, pray for us. Saint Stephen, pray for us. Saint Lawrence, pray for us. Saint Vincent, pray for us. Saints Fabian and Sebastian, pray for us. Saints John and Paul, pray for us. Saints Cosmas and Damian, pray for us. All Holy Martyrs, pray for us. Saint Sylvester, pray for us. Saint Gregory, pray for us. Saint Ambrose, pray for us. Saint Augustine, pray for us. Saint Jerome, pray for us. Saint Martin, pray for us. Saint Nicholas, pray for us. All Holy Bishops and Confessors, pray for us. All Holy Doctors, pray for us. Saint Anthony, pray for us. Saint Benedict, pray for us. Saint Bernard, pray for us. Saint Dominic, pray for us. Saint Francis, pray for us. Saint Ignatius, pray for us. Saint Xavier, pray for us. Saint John Baptist de la Salle, pray for us. Saint Patrick, pray for us. Saint Catherine, pray for us. Saint Teresa, pray for us. All Holy Religious, pray for us. All Holy Men and Women of God, pray for us.

Lamb of God, who takes away the sins of the world, spare us, O Lord. Lamb of God, who takes away the sins of the world, graciously hear us, O Lord. Lamb of God, who takes away the sins of the world, have mercy on us.

V. Lord, deliver us, we pray, from all evil.
R. Past, present, and to come.

Let us pray: O God, who give relief to your suppliants through the intercession of your saints, grant us your servants the grace of being helped by them in all our necessities, through Jesus Christ our Lord. Amen.` },

  // ═══════════════════════════════════════════════════════════════
  // PRAYERS TO SAINTS
  // ═══════════════════════════════════════════════════════════════

  { id: "saint-joseph-workers", title: "Prayer to St. Joseph for Workers", category: "saints", intention: "Work and labor",
    text: "Glorious Saint Joseph, model of all those who labor, obtain for me the grace to do my work in a spirit of penance, to do it with fidelity and joy, and to offer it to the Blessed Trinity as a sacrifice of reparation for my sins and for the needs of all my brothers and sisters. Help me to find employment and to do my work faithfully. Through your intercession, may God bless my efforts and grant me what I need to support myself and those who depend on me. Saint Joseph, pray for us. Amen." },

  { id: "saint-anthony", title: "Prayer to St. Anthony for Lost Things", category: "saints", intention: "Finding lost things",
    text: "Dear Saint Anthony, your love of God, your eloquence, and your zeal for the salvation of souls made you so powerful in obtaining help from God. I turn to you with confidence and ask your help in finding what I have lost. If it is God's will, I pray that I may recover what I have lost, or find something even better. Guide me to discover what truly matters — the lost souls who need God's mercy. Saint Anthony, pray for us. Amen." },

  { id: "saint-jude", title: "Prayer to St. Jude for Desperate Cases", category: "saints", intention: "Hopeless causes",
    text: "Most holy Apostle, Saint Jude, faithful servant and friend of Jesus, the Church honors and invokes you universally as the patron of hope. Please intercede on my behalf. Make use of that particular privilege given to you to bring hope, comfort, and help where they are needed most. Come to my assistance in this time of need. In my difficult situation, I pray that God will place in your hands what is needed to resolve the problems I face. I praise God with you and all the saints forever. Saint Jude, pray for us. Amen." },

  { id: "saint-therese", title: "Prayer to St. Thérèse of Lisieux", category: "saints", intention: "Little Way of spiritual childhood",
    text: "O Little Flower of Jesus, you whose heart overflowed with love for God and neighbor, I place my trust in your powerful intercession. Teach me the Little Way — to do small things with great love. Help me to trust in God's mercy, to seek holiness in the ordinary moments of life, and to never miss an opportunity to show kindness. Saint Thérèse, you promised to spend your heaven doing good on earth. Intercede for me before the throne of God and obtain for me the graces I need. Amen." },

  { id: "saint-benedict", title: "Prayer to St. Benedict for Protection", category: "saints", intention: "Spiritual protection",
    text: "O glorious Saint Benedict, you who by your holy life and miracles have glorified God, intercede for us sinners. Protect me from all spiritual and physical dangers. By the power of the Holy Cross, which you carried as your shield, ward off every evil from my path. Keep me safe in body and soul, in health and in sickness, in life and in death. O Holy Father Benedict, pray for us, that by your intercession we may be delivered from all evil and may arrive at eternal happiness. Amen." },
];
