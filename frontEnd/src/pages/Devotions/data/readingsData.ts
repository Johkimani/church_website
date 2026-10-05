export interface Reading {
  type: "first-reading" | "responsorial-psalm" | "second-reading" | "gospel";
  title: string;
  citation: string;
  text: string;
  response?: string;
}

export interface DailyReadings {
  date: string;
  weekday: string;
  celebration: string;
  season: string;
  liturgicalYear: string;
  readings: Reading[];
  source: string;
}

export interface ReadingsCache {
  data: DailyReadings;
  timestamp: number;
}

const FIRST_READING_COMMON: Record<string, { citation: string; text: string }> = {
  advent: {
    citation: "Isaiah 7:10-14",
    text: "Again the Lord spoke to Ahaz: 'Ask the Lord your God for a sign, whether in the deepest depths or in the highest heights.' But Ahaz said, 'I will not ask; I will not put the Lord to the test.' Then Isaiah said, 'Hear now, you house of David! Is it not enough to try the patience of humans? Will you try the patience of my God also? Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son, and will call him Immanuel.'"
  },
  christmas: {
    citation: "Isaiah 9:1-6",
    text: "The people walking in darkness have seen a great light; on those living in the land of deep darkness a light has dawned. You have enlarged the nation and increased their joy; they rejoice before you as people rejoice at the harvest, as warriors rejoice when dividing the plunder. For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace."
  },
  lent: {
    citation: "Isaiah 1:10-17",
    text: "Hear the word of the Lord, you rulers of Sodom, and bring the instruction of your God to the people of Egypt. What to me is the multitude of your sacrifices? says the Lord; I have had enough of burnt offerings of rams and the fat of fed beasts; I do not delight in the blood of bulls, or of lambs, or of he-goats. Bring no more vain offerings; incense is an abomination to me. New moon and sabbath and the calling of assemblies — I cannot endure iniquity and solemn assembly. Your new moons and your appointed feasts my soul hates; they have become a burden to me; I am weary of bearing them. When you spread forth your hands, I will hide my eyes from you; even though you make many prayers, I will not listen; your hands are full of blood. Wash yourselves; make yourselves clean; remove the evil of your doings from before my eyes; cease to do evil, learn to do good; seek justice, correct oppression; bring justice to the fatherless, plead for the widow."
  },
  easter: {
    citation: "Acts 10:34, 37-43",
    text: "Then Peter began to speak: 'I now realize how true it is that God does not show favoritism but accepts from every nation the one who fears him and does what is right. You know what has happened throughout the province of Judea, beginning in Galilee after the baptism that John preached — how God anointed Jesus of Nazareth with the Holy Spirit and power, and how he went around doing good and healing all who were under the power of the devil, because God was with him.'"
  },
  ordinary: {
    citation: "1 Samuel 16:1b, 6-7, 10-13a",
    text: "The Lord said to Samuel, 'Fill your horn with oil, and set out. I will send you to Jesse the Bethlehemite, for I have provided for myself a king among his sons.' When they came, he looked on Eliab and thought, 'Surely the Lord's anointed is before him.' But the Lord said to Samuel, 'Do not look on his appearance or on the height of his stature, because I have rejected him; for the Lord sees not as man sees; man looks on the outward appearance, but the Lord looks on the heart.'"
  }
};

const PSALM_COMMON: Record<string, { citation: string; text: string; response: string }> = {
  advent: {
    citation: "Psalm 25:4-5, 8-9, 10, 14",
    text: "Show me your ways, Lord, teach me your paths. Guide me in your truth and teach me, for you are God my Savior, and my hope is in you all day long.\nGood and upright is the Lord; therefore he instructs sinners in his ways. He guides the humble in what is right and teaches them his way.\nAll the ways of the Lord are loving and faithful toward those who keep the demands of his covenant. The Lord confides in those who fear him; he makes his covenant known to them.",
    response: "Lord, make me know your ways."
  },
  christmas: {
    citation: "Psalm 98:1, 2-3, 3-4, 5-6",
    text: "Sing to the Lord a new song, for he has done marvelous things; his right hand and his holy arm have worked salvation for him.\nThe Lord has made his salvation known and revealed his righteousness to the nations. He has remembered his love and his faithfulness to Israel; all the ends of the earth have seen the salvation of our God.\nShout for joy to the Lord, all the earth, burst into jubilant song with music; make music to the Lord with the harp, with the harp and the sound of singing.",
    response: "The Lord has made his salvation known."
  },
  lent: {
    citation: "Psalm 51:3-4, 5-6, 12-13, 17",
    text: "Have mercy on me, O God, according to your unfailing love; according to your great compassion blot out my transgressions. Wash away all my iniquity and cleanse me from my sin.\nFor I know my transgressions, and my sin is always before me. Against you, you only, have I sinned and done what is evil in your sight; so you are right in your verdict and justified when you judge.\nCreate in me a pure heart, O God, and renew a steadfast spirit within me. Do not cast me from your presence or take your Holy Spirit from me. Restore to me the joy of your salvation and grant me a willing spirit, to sustain me.",
    response: "Create in me a clean heart, O God."
  },
  easter: {
    citation: "Psalm 118:1-2, 16-17, 22-23",
    text: "Give thanks to the Lord, for he is good; his love endures forever. Let Israel say: 'His love endures forever.'\nThe right hand of the Lord is lifted high; the right hand of the Lord has done mighty things! I will not die but live, and will proclaim what the Lord has done.\nThe stone the builders rejected has become the cornerstone; the Lord has done this, and it is marvelous in our eyes.",
    response: "This is the day the Lord has made; let us rejoice and be glad."
  },
  ordinary: {
    citation: "Psalm 19:8, 9, 10, 11",
    text: "The precepts of the Lord are right, giving joy to the heart. The commands of the Lord are radiant, giving light to the eyes.\nThe fear of the Lord is pure, enduring forever. The decrees of the Lord are firm, and all of them are righteous.\nThey are more precious than gold, than much pure gold; they are sweeter than honey, than honey from the honeycomb. By them your servant is warned; in keeping them there is great reward.",
    response: "Your words, Lord, are spirit and life."
  }
};

const GOSPEL_COMMON: Record<string, { citation: string; text: string }> = {
  advent: {
    citation: "Matthew 1:18-24",
    text: "This is how the birth of Jesus the Messiah came about: His mother Mary was pledged to be married to Joseph, but before they came together, she was found to be pregnant through the Holy Spirit. Because Joseph her husband was faithful to the law, and yet did not want to expose her to public disgrace, he had in mind to divorce her quietly. But after he had considered this, an angel of the Lord appeared to him in a dream and said, 'Joseph son of David, do not be afraid to take Mary home as your wife, because what is conceived in her is from the Holy Spirit. She will give birth to a son, and you are to give him the name Jesus, because he will save his people from their sins.'"
  },
  christmas: {
    citation: "John 1:1-18",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made. In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it. The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth."
  },
  lent: {
    citation: "Matthew 6:1-6, 16-18",
    text: "Jesus said to his disciples: 'Be careful not to practice your righteousness in front of others to be seen by them. If you do, you will have no reward from your Father in heaven. So when you give to the needy, do not announce it with trumpets, as the hypocrites do in the synagogues and on the streets, to be honored by others. Truly I tell you, they have received their reward in full. But when you give to the needy, do not let your left hand know what your right hand is doing, so that your giving may be in secret. Then your Father, who sees what is done in secret, will reward you.'"
  },
  easter: {
    citation: "John 20:1-9",
    text: "Early on the first day of the week, while it was still dark, Mary Magdalene went to the tomb and saw that the stone had been removed from the entrance. So she came running to Simon Peter and the other disciple, the one Jesus loved, and said, 'They have taken the Lord out of the tomb, and we don't know where they have put him!' So Peter and the other disciple started for the tomb. Both were running, but the other disciple outran Peter and reached the tomb first. He bent over and looked in at the strips of linen lying there but did not go in."
  },
  ordinary: {
    citation: "Matthew 5:1-12",
    text: "Now when Jesus saw the crowds, he went up on a mountainside and sat down. His disciples came to him, and he began to teach them. He said: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they will be comforted. Blessed are the meek, for they will inherit the earth. Blessed are those who hunger and thirst for righteousness, for they will be filled. Blessed are the merciful, for they will be shown mercy. Blessed are the pure in heart, for they will see God. Blessed are the peacemakers, for they will be called children of God.'"
  }
};

const SECOND_READING_SUNDAYS: Record<string, { citation: string; text: string }> = {
  advent: {
    citation: "Romans 13:11-14",
    text: "And do this, understanding the present time: The hour has already come for you to wake up from your slumber, because our salvation is nearer now than when we first believed. The night is nearly over; the day is almost here. So let us put aside the deeds of darkness and put on the armor of light. Let us behave decently, as in the daytime, not in carousing and drunkenness, not in sexual immorality and debauchery, not in dissension and jealousy. Rather, clothe yourselves with the Lord Jesus Christ."
  },
  christmas: {
    citation: "Titus 2:11-14",
    text: "For the grace of God has appeared that offers salvation to all people. It teaches us to say 'No' to ungodliness and worldly passions, and to live self-controlled, upright and godly lives in this present age, while we wait for the blessed hope — the appearing of the glory of our great God and Savior, Jesus Christ, who gave himself for us to redeem us from all wickedness and to purify for himself a people that are his very own, eager to do what is good."
  },
  lent: {
    citation: "Romans 10:8-13",
    text: "But what does it say? 'The word is near you; it is in your mouth and in your heart,' that is, the message concerning faith that we proclaim: If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved. For it is with your heart that you believe and are justified, and it is with your mouth that you profess your faith and are saved."
  },
  easter: {
    citation: "Colossians 3:1-4",
    text: "Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God. Set your minds on things above, not on earthly things. For you died, and your life is now hidden with Christ in God. When Christ, who is your life, appears, then you also will appear with him in glory."
  },
  ordinary: {
    citation: "1 Corinthians 12:4-11",
    text: "There are different kinds of gifts, but the same Spirit distributes them. There are different kinds of service, but the same Lord. There are different kinds of working, but in all of them and in everyone it is the same God at work. Now to each one the manifestation of the Spirit is given for the common good. To one there is given through the Spirit a message of wisdom, to another a message of knowledge by means of the same Spirit, to another faith by the same Spirit, to another gifts of healing by that one Spirit."
  }
};

function getSeasonKey(season: string): string {
  const s = season.toLowerCase();
  if (s.includes("advent")) return "advent";
  if (s.includes("christmas")) return "christmas";
  if (s.includes("lent")) return "lent";
  if (s.includes("triduum")) return "lent";
  if (s.includes("easter")) return "easter";
  return "ordinary";
}

export function buildFallbackReadings(date: Date, season: string, celebration: string): DailyReadings {
  const key = getSeasonKey(season);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
  const isSunday = date.getDay() === 0;

  const readings: Reading[] = [
    {
      type: "first-reading",
      title: "First Reading",
      citation: FIRST_READING_COMMON[key].citation,
      text: FIRST_READING_COMMON[key].text,
    },
    {
      type: "responsorial-psalm",
      title: "Responsorial Psalm",
      citation: PSALM_COMMON[key].citation,
      text: PSALM_COMMON[key].text,
      response: PSALM_COMMON[key].response,
    },
  ];

  if (isSunday) {
    readings.push({
      type: "second-reading",
      title: "Second Reading",
      citation: SECOND_READING_SUNDAYS[key].citation,
      text: SECOND_READING_SUNDAYS[key].text,
    });
  }

  readings.push({
    type: "gospel",
    title: "Gospel",
    citation: GOSPEL_COMMON[key].citation,
    text: GOSPEL_COMMON[key].text,
  });

  return {
    date: date.toISOString().split("T")[0],
    weekday: `${dayOfWeek}, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    celebration,
    season,
    liturgicalYear: "",
    readings,
    source: "liturgical",
  };
}

const READINGS_CACHE_KEY = "daily-readings-cache";
const CACHE_TTL = 4 * 60 * 60 * 1000;

export function getCachedReadings(): DailyReadings | null {
  try {
    const raw = sessionStorage.getItem(READINGS_CACHE_KEY);
    if (!raw) return null;
    const cache: ReadingsCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(READINGS_CACHE_KEY);
      return null;
    }
    return cache.data;
  } catch {
    return null;
  }
}

export function cacheReadings(data: DailyReadings): void {
  try {
    const cache: ReadingsCache = { data, timestamp: Date.now() };
    sessionStorage.setItem(READINGS_CACHE_KEY, JSON.stringify(cache));
  } catch {
  }
}
