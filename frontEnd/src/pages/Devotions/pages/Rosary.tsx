import { useState, useRef, type CSSProperties } from "react";
import { marianMysteries } from "../data/mysteries/marian";
import { sevenSorrows } from "../data/mysteries/sevenSorrows";
import { reparationMysteries } from "../data/mysteries/reparation";
import { archangelMichaelMysteries } from "../data/mysteries/archangelMichael";
import { divineMercyMysteries } from "../data/mysteries/divineMercyMysteries ";

type Mystery = {
  title: string;
  scripture?: string;
  fruit?: string;
  english?: string;
  kiswahili?: string;
};

type RosaryPrayer = {
  title: string;
  scripture?: string;
  note?: string;
  lines: string[];
};

type MarianKey = "joyful" | "sorrowful" | "glorious" | "luminous";
type View = "overview" | "prayers" | "mysteries" | "beads" | "pray";

const GOLD = "#D97706";
const AMBER = "#FBBF24";

const CARD_STYLE = {
  background: "#FFFFFF",
  border: "1px solid rgba(28, 25, 23, 0.08)",
} as const;

const TAB_STYLE = (active: boolean): CSSProperties =>
  active
    ? {
        background: "linear-gradient(135deg, rgba(217,119,6,0.16), rgba(217,119,6,0.06))",
        color: "#B45309",
        border: "1px solid rgba(217,119,6,0.35)",
        boxShadow: "0 2px 10px rgba(217,119,6,0.1)",
      }
    : {
        background: "#FFFFFF",
        color: "#78716C",
        border: "1px solid rgba(28, 25, 23, 0.08)",
      };

const ROSARY_PRAYERS: RosaryPrayer[] = [
  {
    title: "The Sign of the Cross",
    scripture: "Matthew 28:19",
    note: "Every prayer of the Rosary begins and ends with the Sign of the Cross.",
    lines: ["In the name of the Father, and of the Son, and of the Holy Spirit. Amen."],
  },
  {
    title: "The Apostles' Creed",
    scripture: "Romans 10:9",
    note: "Recited on the Crucifix. It proclaims the central truths of our faith.",
    lines: [
      "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead.",
      "I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
    ],
  },
  {
    title: "The Our Father",
    scripture: "Matthew 6:9-13",
    note: "Prayed on the large beads before each decade.",
    lines: [
      "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
    ],
  },
  {
    title: "The Hail Mary",
    scripture: "Luke 1:28, 42",
    note: "Prayed on each small bead, ten times for every decade.",
    lines: [
      "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
    ],
  },
  {
    title: "The Glory Be",
    scripture: "Romans 11:36",
    note: "The Doxology, prayed after each decade.",
    lines: [
      "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
    ],
  },
  {
    title: "The Fatima Prayer",
    scripture: "Fatima, 13 July 1917",
    note: "Given by Our Lady of Fatima. Prayed after the Glory Be of each decade.",
    lines: [
      "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those most in need of thy mercy. Amen.",
    ],
  },
  {
    title: "The Hail Holy Queen",
    scripture: "Salve Regina",
    note: "Recited at the close of the Rosary.",
    lines: [
      "Hail, holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn, then, most gracious Advocate, thine eyes of mercy toward us; and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
      "V. Pray for us, O holy Mother of God.",
      "R. That we may be made worthy of the promises of Christ.",
    ],
  },
  {
    title: "The Concluding Prayer",
    scripture: "Traditional",
    note: "The closing collect of the Rosary.",
    lines: [
      "O God, whose Only-begotten Son, by his life, death and resurrection, has purchased for us the rewards of eternal life, grant, we beseech thee, that meditating on these mysteries of the most holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.",
    ],
  },
  {
    title: "The Prayer to St. Michael",
    scripture: "Composed by Pope Leo XIII",
    note: "Traditionally prayed at the end of the Rosary for the protection of the Church.",
    lines: [
      "Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, thrust into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.",
    ],
  },
  {
    title: "The Memorare",
    scripture: "St. Bernard of Clairvaux",
    note: "A beloved prayer of confidence in the intercession of Mary.",
    lines: [
      "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession, was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come; before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
    ],
  },
  {
    title: "The Litany of the Blessed Virgin Mary",
    scripture: "Litany of Loreto",
    note: "Often prayed after the Rosary, especially in May and October, months of Mary.",
    lines: [
      "Lord, have mercy. Christ, have mercy. Lord, have mercy.",
      "Christ, hear us. Christ, graciously hear us.",
      "God the Father of heaven, have mercy on us.",
      "God the Son, Redeemer of the world, have mercy on us.",
      "God the Holy Spirit, have mercy on us.",
      "Holy Trinity, one God, have mercy on us.",
      "Holy Mary, pray for us.",
      "Holy Mother of God, pray for us.",
      "Holy Virgin of virgins, pray for us.",
      "Mother of Christ, pray for us.",
      "Mother of the Church, pray for us.",
      "Mother of divine grace, pray for us.",
      "Mother most pure, pray for us.",
      "Mother most chaste, pray for us.",
      "Mother inviolate, pray for us.",
      "Mother undefiled, pray for us.",
      "Mother most amiable, pray for us.",
      "Mother most admirable, pray for us.",
      "Mother of good counsel, pray for us.",
      "Mother of our Creator, pray for us.",
      "Mother of our Savior, pray for us.",
      "Virgin most prudent, pray for us.",
      "Virgin most venerable, pray for us.",
      "Virgin most renowned, pray for us.",
      "Virgin most powerful, pray for us.",
      "Virgin most merciful, pray for us.",
      "Virgin most faithful, pray for us.",
      "Mirror of justice, pray for us.",
      "Seat of wisdom, pray for us.",
      "Cause of our joy, pray for us.",
      "Spiritual vessel, pray for us.",
      "Vessel of honor, pray for us.",
      "Singular vessel of devotion, pray for us.",
      "Mystical rose, pray for us.",
      "Tower of David, pray for us.",
      "Tower of ivory, pray for us.",
      "House of gold, pray for us.",
      "Ark of the covenant, pray for us.",
      "Gate of heaven, pray for us.",
      "Morning star, pray for us.",
      "Health of the sick, pray for us.",
      "Refuge of sinners, pray for us.",
      "Comforter of the afflicted, pray for us.",
      "Help of Christians, pray for us.",
      "Queen of Angels, pray for us.",
      "Queen of Patriarchs, pray for us.",
      "Queen of Prophets, pray for us.",
      "Queen of Apostles, pray for us.",
      "Queen of Martyrs, pray for us.",
      "Queen of Confessors, pray for us.",
      "Queen of Virgins, pray for us.",
      "Queen of all Saints, pray for us.",
      "Queen conceived without original sin, pray for us.",
      "Queen assumed into heaven, pray for us.",
      "Queen of the most holy Rosary, pray for us.",
      "Queen of families, pray for us.",
      "Queen of peace, pray for us.",
      "Lamb of God, who takest away the sins of the world, spare us, O Lord.",
      "Lamb of God, who takest away the sins of the world, graciously hear us, O Lord.",
      "Lamb of God, who takest away the sins of the world, have mercy on us.",
      "Pray for us, O holy Mother of God.",
      "That we may be made worthy of the promises of Christ.",
    ],
  },
];

const MYSTERY_SETS: {
  key: MarianKey;
  label: string;
  days: string;
  color: string;
  theme: string;
}[] = [
  {
    key: "joyful",
    label: "Joyful Mysteries",
    days: "Monday & Saturday",
    color: "#22C55E",
    theme: "Contemplating the Incarnation — the wonder of the Word made flesh.",
  },
  {
    key: "sorrowful",
    label: "Sorrowful Mysteries",
    days: "Tuesday & Friday",
    color: "#EF4444",
    theme: "Walking with Christ through his Passion and Death for our salvation.",
  },
  {
    key: "glorious",
    label: "Glorious Mysteries",
    days: "Wednesday & Sunday",
    color: "#D97706",
    theme: "From the Resurrection to the Coronation of Mary — our hope of glory.",
  },
  {
    key: "luminous",
    label: "Luminous Mysteries",
    days: "Thursday",
    color: "#8B5CF6",
    theme: "Given by Pope St. John Paul II, revealing the public ministry of Jesus.",
  },
];

const HOW_TO_PRAY = [
  { title: "Sign of the Cross & Creed", detail: "Make the Sign of the Cross and, holding the Crucifix, recite the Apostles' Creed." },
  { title: "The Our Father", detail: "On the first large bead, pray the Our Father." },
  { title: "Three Hail Marys", detail: "On the next three small beads, pray three Hail Marys for the virtues of faith, hope, and charity." },
  { title: "The Glory Be", detail: "Before the centerpiece, pray the Glory Be." },
  { title: "Announce the Mystery", detail: "Announce the First Mystery. On the large bead, pray the Our Father while meditating on the mystery." },
  { title: "Ten Hail Marys", detail: "On each of the ten following small beads, pray a Hail Mary while meditating on the mystery." },
  { title: "Glory Be & Fatima Prayer", detail: "After the ten Hail Marys, pray the Glory Be and, if desired, the Fatima Prayer." },
  { title: "Close the Rosary", detail: "Repeat through the remaining four decades, then conclude with the Hail Holy Queen, the Concluding Prayer, and the Sign of the Cross." },
];

const OTHER_DEVOTIONS: { title: string; description: string; color: string; data: Mystery[] }[] = [
  {
    title: "The Seven Sorrows of Mary",
    description: "The Servite Rosary walks with the Mother of God through seven moments of her suffering, meditating on the sword that pierced her heart.",
    color: "#94A3B8",
    data: sevenSorrows,
  },
  {
    title: "The Divine Mercy Chaplet",
    description: "Revealed to St. Faustina, offering the Eternal Father the Body, Blood, Soul and Divinity of his dearly beloved Son for the mercy of the whole world.",
    color: "#EF4444",
    data: divineMercyMysteries,
  },
  {
    title: "The Chaplet of St. Michael",
    description: "A nine-decade chaplet honoring St. Michael the Archangel and the nine choirs of angels, prayed in confidence of their protection.",
    color: "#B45309",
    data: archangelMichaelMysteries,
  },
  {
    title: "The Rosary of Reparation",
    description: "Prayers offered in reparation for sins, uniting our sacrifices to the all-sufficient offering of Christ.",
    color: "#8B5CF6",
    data: reparationMysteries,
  },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-[2px]" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
        <h2
          className="text-sm font-bold tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", color: "#57534E" }}
        >
          {title}
        </h2>
        <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.08), transparent)" }} />
      </div>
      {subtitle && <p className="text-sm text-stone-500 ml-9 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

function BeadDiagram() {
  const loopCount = 55;
  const loopCenterX = 210;
  const loopCenterY = 415;
  const loopRadius = 150;
  const bigBeads = new Set([1, 12, 23, 34, 45]);
  const loopBeads = Array.from({ length: loopCount }, (_, i) => {
    const n = i + 1;
    const angle = (n - 1) * ((2 * Math.PI) / loopCount) - Math.PI / 2;
    return {
      x: loopCenterX + loopRadius * Math.cos(angle),
      y: loopCenterY + loopRadius * Math.sin(angle),
      big: bigBeads.has(n),
      label: bigBeads.has(n) ? "Our Father" : "Hail Mary",
    };
  });

  const tail = [
    { y: 118, r: 10, label: "Our Father" },
    { y: 150, r: 7, label: "Hail Mary" },
    { y: 180, r: 7, label: "Hail Mary" },
    { y: 210, r: 7, label: "Hail Mary" },
    { y: 242, r: 10, label: "Glory Be" },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
      <svg viewBox="0 0 420 640" className="w-full max-w-md h-auto" style={{ filter: "drop-shadow(0 4px 12px rgba(28,25,23,0.15))" }}>
        {/* Cross */}
        <g style={{ transform: "translate(200px, 40px)" }}>
          <rect x="-4" y="-14" width="8" height="52" rx="3" fill={AMBER} />
          <rect x="-18" y="-4" width="36" height="8" rx="3" fill={AMBER} />
        </g>
        {/* Tail line */}
        <line x1="210" y1="60" x2="210" y2="252" stroke="rgba(217,119,6,0.3)" strokeWidth="2" />
        {/* Tail beads */}
        {tail.map((b) => (
          <circle key={b.y} cx="210" cy={b.y} r={b.r} fill={b.r === 10 ? AMBER : "#D6D3D1"} stroke="rgba(28,25,23,0.15)" strokeWidth="1">
            <title>{b.label}</title>
          </circle>
        ))}
        {/* Centerpiece */}
        <circle cx="210" cy="270" r="7" fill={GOLD} />
        {/* Loop line */}
        <circle cx={loopCenterX} cy={loopCenterY} r={loopRadius} fill="none" stroke="rgba(217,119,6,0.3)" strokeWidth="2" strokeDasharray="3,5" />
        {/* Loop beads */}
        {loopBeads.map((b) => (
          <circle
            key={`${b.x}-${b.y}`}
            cx={b.x}
            cy={b.y}
            r={b.big ? 10 : 7}
            fill={b.big ? AMBER : "#D6D3D1"}
            stroke="rgba(28,25,23,0.15)"
            strokeWidth="1"
            style={{ cursor: "pointer" }}
          >
            <title>{b.label}</title>
          </circle>
        ))}
      </svg>

      <div className="w-full lg:w-80 space-y-3">
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-700 mb-2">Parts of the Rosary</p>
          <ul className="space-y-2 text-sm text-stone-700">
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: AMBER }} /> Large beads — Our Father</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "#D6D3D1" }} /> Small beads — Hail Mary</li>
            <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: GOLD }} /> Centerpiece — Glory Be</li>
            <li className="flex items-center gap-2"><span className="text-amber-700">✝</span> Crucifix — Sign of the Cross & Creed</li>
          </ul>
        </div>
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-700 mb-2">One Decade</p>
          <p className="text-sm text-stone-700 leading-relaxed">
            1 Our Father · 10 Hail Marys · 1 Glory Be · 1 Fatima Prayer
            <span className="block mt-2 text-xs text-stone-500">Five decades make one full Rosary of the twenty mysteries.</span>
          </p>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">Hover any bead above to see which prayer is prayed on it.</p>
      </div>
    </div>
  );
}

// ─── PRAYER GUIDE WITH AUDIO ─────────────────────────────────────────────

const FULL_ROSARY_STEPS: { title: string; prayer: string; isOurFather: boolean; isHailMary: boolean; isGloryBe: boolean; isFatima: boolean; isCreed: boolean; isSignOfCross: boolean; isHailHolyQueen: boolean; isConcluding: boolean; isMysteryAnnouncement: boolean; mysteryTitle?: string }[] = [
  { title: "Sign of the Cross", prayer: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.", isSignOfCross: true },
  { title: "Apostles' Creed", prayer: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.", isCreed: true },
  { title: "Our Father", prayer: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.", isOurFather: true },
  { title: "Hail Mary 1", prayer: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.", isHailMary: true },
  { title: "Hail Mary 2", prayer: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.", isHailMary: true },
  { title: "Hail Mary 3", prayer: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.", isHailMary: true },
  { title: "Glory Be", prayer: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.", isGloryBe: true },
];

function buildFullRosarySteps(mysteries: Mystery[]) {
  const steps: typeof FULL_ROSARY_STEPS = [];
  mysteries.forEach((m, idx) => {
    steps.push({ title: `Mystery ${idx + 1}: ${m.title}`, prayer: m.english, isMysteryAnnouncement: true, mysteryTitle: m.title });
    steps.push({ title: "Our Father", prayer: FULL_ROSARY_STEPS[2].prayer, isOurFather: true });
    for (let i = 1; i <= 10; i++) {
      steps.push({ title: `Hail Mary ${i}`, prayer: FULL_ROSARY_STEPS[3].prayer, isHailMary: true });
    }
    steps.push({ title: "Glory Be & Fatima Prayer", prayer: `${FULL_ROSARY_STEPS[6].prayer}\n\nO my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those most in need of thy mercy. Amen.`, isGloryBe: true, isFatima: true });
  });
  steps.push({ title: "Hail Holy Queen", prayer: FULL_ROSARY_STEPS[9].prayer, isHailHolyQueen: true });
  steps.push({ title: "Concluding Prayer", prayer: FULL_ROSARY_STEPS[10].prayer, isConcluding: true });
  steps.push({ title: "Sign of the Cross", prayer: FULL_ROSARY_STEPS[0].prayer, isSignOfCross: true });
  return steps;
}

function PrayGuide() {
  const [activeSet, setActiveSet] = useState<MarianKey>("joyful");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const steps = buildFullRosarySteps(marianMysteries[activeSet]);
  const setColor = MYSTERY_SETS.find((s) => s.key === activeSet)?.color || GOLD;

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 1;
    u.lang = "en-US";
    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    u.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleNext = () => {
    stopSpeaking();
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setProgress(((next + 1) / steps.length) * 100);
      setTimeout(() => speak(steps[next].prayer), 300);
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setProgress(((prev + 1) / steps.length) * 100);
      setTimeout(() => speak(steps[prev].prayer), 300);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else if (isPaused) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } else {
      speak(steps[currentStep].prayer);
    }
  };

  const handleSet = (key: MarianKey) => {
    setActiveSet(key);
    setCurrentStep(0);
    setProgress(0);
    stopSpeaking();
  };

  const handleReset = () => {
    stopSpeaking();
    setCurrentStep(0);
    setProgress(0);
  };

  return (
    <div className="space-y-10">
      <SectionHeader title="Guided Rosary Prayer" subtitle="Bead by bead, step by step. Audio guidance walks you through the entire Rosary." />

       {/* Beginner Guide */}
       <div className="rounded-2xl p-5" style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.15)" }}>
         <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">How to Use This Guide</p>
         <div className="grid sm:grid-cols-2 gap-3 text-xs text-stone-700 leading-relaxed">
           <div className="flex items-start gap-2">
             <span className="text-amber-700 mt-0.5">1.</span>
             <span>Hold the rosary in your left hand, draped over your fingers.</span>
           </div>
           <div className="flex items-start gap-2">
             <span className="text-amber-700 mt-0.5">2.</span>
             <span>Start at the crucifix. Make the Sign of the Cross.</span>
           </div>
           <div className="flex items-start gap-2">
             <span className="text-amber-700 mt-0.5">3.</span>
             <span>Move to the next large bead for the Our Father.</span>
           </div>
           <div className="flex items-start gap-2">
             <span className="text-amber-700 mt-0.5">4.</span>
             <span>Move to each small bead for a Hail Mary. Touch each bead.</span>
           </div>
           <div className="flex items-start gap-2">
             <span className="text-amber-700 mt-0.5">5.</span>
             <span>At the centerpiece, pray the Glory Be and Fatima Prayer.</span>
           </div>
           <div className="flex items-start gap-2">
             <span className="text-amber-700 mt-0.5">6.</span>
             <span>Repeat for each decade. Move to the next large bead for the next Our Father.</span>
           </div>
         </div>
       </div>

       {/* Mystery Set Selector */}
       <div className="flex flex-wrap gap-2">
         {MYSTERY_SETS.map((s) => (
           <button
             key={s.key}
             onClick={() => handleSet(s.key)}
            className="px-4 py-2 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all"
            style={{
              ...TAB_STYLE(activeSet === s.key),
              ...(activeSet === s.key ? { color: s.color, border: `1px solid ${s.color}55` } : {}),
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl p-5" style={CARD_STYLE}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-[11px] font-bold text-amber-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${setColor}, ${GOLD})` }}
          />
        </div>
      </div>

       {/* Current Step */}
       <div className="rounded-2xl p-6" style={{ ...CARD_STYLE, border: `1px solid ${setColor}30` }}>
         <div className="flex items-center gap-3 mb-4">
           <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${setColor}22`, color: setColor }}>
             {currentStep + 1}
           </span>
            <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
              {steps[currentStep]?.title}
            </h3>
         </div>

         {/* Instruction */}
         {steps[currentStep]?.instruction && (
           <div className="rounded-xl p-3 mb-3 flex items-start gap-3" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.15)" }}>
<span className="text-amber-700 text-lg flex-shrink-0">✋</span>
              <p className="text-xs text-stone-700 leading-relaxed">{steps[currentStep].instruction}</p>
           </div>
         )}

         {steps[currentStep]?.isMysteryAnnouncement && (
           <div className="rounded-xl p-4 mb-4" style={{ background: `${setColor}11`, border: `1px solid ${setColor}30` }}>
             <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: setColor }}>Mystery</p>
             <p className="text-sm text-stone-700 leading-relaxed">{steps[currentStep].prayer}</p>
             {steps[currentStep].contemplation && (
               <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(217,119,6,0.15)" }}>
<p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Contemplate</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{steps[currentStep].contemplation}</p>
               </div>
             )}
           </div>
         )}

         {!steps[currentStep]?.isMysteryAnnouncement && (
<div className="rounded-xl p-5 mb-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "16px" }}>
               {steps[currentStep]?.prayer}
             </p>
           </div>
         )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ background: "#FFFFFF", color: "#57534E", border: "1px solid rgba(28,25,23,0.15)" }}
          >
            ← Previous
          </button>
          <button
            onClick={handlePlayPause}
            className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: `linear-gradient(135deg, ${setColor}, ${GOLD})`,
              color: "#FFFFFF",
              boxShadow: `0 4px 16px ${setColor}22`,
            }}
          >
            {isPlaying && !isPaused ? "⏸ Pause" : isPaused ? "▶ Resume" : "▶ Play"}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ background: "#FFFFFF", color: "#57534E", border: "1px solid rgba(28,25,23,0.15)" }}
          >
            Next →
          </button>
          <button
            onClick={stopSpeaking}
            className="px-3 py-2 rounded-xl text-sm transition-all"
            style={{ background: "#FFFFFF", color: "#78716C", border: "1px solid rgba(28,25,23,0.15)" }}
            title="Stop"
          >
            ⏹
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-sm transition-all"
            style={{ background: "#FFFFFF", color: "#78716C", border: "1px solid rgba(28,25,23,0.15)" }}
            title="Reset"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Step List */}
      <div className="rounded-2xl p-5" style={CARD_STYLE}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-4">All Steps</p>
        <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-hide">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            return (
              <button
                key={i}
                onClick={() => {
                  stopSpeaking();
                  setCurrentStep(i);
                  setProgress(((i + 1) / steps.length) * 100);
                  setTimeout(() => speak(step.prayer), 300);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                  isActive ? "bg-amber-500/10 border border-amber-500/30" : isPast ? "opacity-50" : "hover:bg-stone-100"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  isActive ? "bg-amber-500 text-white" : isPast ? "bg-amber-500/30 text-amber-700" : "bg-stone-100 text-stone-500"
                }`}>
                  {isPast ? "✓" : i + 1}
                </span>
                <span className={`text-xs ${isActive ? "text-amber-700" : "text-stone-500"}`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Rosary() {
  const [view, setView] = useState<View>("overview");
  const [mysterySet, setMysterySet] = useState<MarianKey>("joyful");
  const [mysteryOpen, setMysteryOpen] = useState<string | null>(null);
  const [devotionOpen, setDevotionOpen] = useState<string | null>(null);
  const [lang, setLang] = useState<"english" | "kiswahili">("english");

  const activeSet = MYSTERY_SETS.find((s) => s.key === mysterySet)!;
  const activeMysteries = marianMysteries[mysterySet];

  const tabs: { key: View; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "prayers", label: "All Prayers" },
    { key: "mysteries", label: "The Mysteries" },
    { key: "beads", label: "Bead Guide" },
    { key: "pray", label: "Pray" },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8 max-w-6xl mx-auto min-h-screen">
      {/* ═══════════════ HERO ═══════════════ */}
      <div
        className="rounded-3xl relative overflow-hidden mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(217,119,6,0.1), rgba(217,119,6,0.03))",
          border: "1px solid rgba(217,119,6,0.2)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(217,119,6,0.12), transparent 70%)" }} />
        <div className="absolute right-8 bottom-2 text-[120px] leading-none select-none" style={{ color: "rgba(28,25,23,0.05)", fontFamily: "'Cinzel', serif" }}>✝</div>
        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 hidden md:block w-44 lg:w-52" style={{ filter: "drop-shadow(0 12px 24px rgba(217,119,6,0.35))" }}>
          <div className="rounded-2xl overflow-hidden relative" style={{ border: "4px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 24px rgba(28,25,23,0.2)" }}>
            <img
              src="/images/mary-rosary.jpg"
              alt="The Blessed Virgin Mary with the Child Jesus, holding a rosary"
              loading="lazy"
              className="w-full h-auto object-cover block"
              style={{ aspectRatio: "3 / 4" }}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(217,119,6,0.18), transparent 45%)" }} />
          </div>
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase mt-2" style={{ color: "#B45309" }}>
            Mater Dei · Mother of God
          </p>
        </div>
        <div className="relative z-10 p-8 sm:p-10 md:pr-64 lg:pr-72">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.15em] text-amber-700 uppercase">Marian Devotion</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 mb-4" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
            The Holy Rosary
          </h1>
          <p className="max-w-2xl text-stone-600 leading-relaxed">
            The Rosary is a school of prayer. Beholding the face of Christ through the eyes of his Mother, we meditate upon the mysteries of our redemption — and learn to pray with Mary's faith, hope, and love.
          </p>
        </div>
      </div>

      {/* ═══════════════ TABS ═══════════════ */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setView(t.key)} className="px-5 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase transition-all duration-200" style={TAB_STYLE(view === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      {view === "overview" && (
        <div className="space-y-10">
          <section>
            <SectionHeader title="What is the Rosary" subtitle="A meditation on the life of Christ, prayed with Mary." />
            <div className="rounded-2xl p-6" style={CARD_STYLE}>
              <p className="text-sm text-stone-700 leading-relaxed">
                The word <em className="text-amber-700">rosary</em> means "a crown of roses," for every Hail Mary offered is a spiritual rose laid before our Lady. Praying the Rosary is not mere repetition: with each decade we contemplate a mystery of the life, death, and resurrection of Jesus Christ, while reciting the Our Father, the Hail Mary, and the Glory Be.
              </p>
              <p className="text-sm text-stone-700 leading-relaxed mt-3">
                In his apostolic letter <em className="text-amber-700">Rosarium Virginis Mariae</em> (2002), Pope St. John Paul II called the Rosary "a compendium of the Gospel." With the addition of the Luminous Mysteries, the Church presents twenty mysteries for our meditation — Joyful, Sorrowful, Glorious, and Luminous — that together tell the whole story of our salvation.
              </p>
            </div>
          </section>

          <section>
            <SectionHeader title="How to Pray the Rosary" subtitle="Eight simple steps, from the Crucifix to the concluding prayers." />
            <div className="grid sm:grid-cols-2 gap-4">
              {HOW_TO_PRAY.map((step, i) => (
                <div key={step.title} className="rounded-2xl p-5 flex gap-4 transition-all duration-300 hover:-translate-y-0.5" style={CARD_STYLE}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.3), rgba(217,119,6,0.1))", color: "#B45309", fontFamily: "'Cinzel', serif" }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 mb-1">{step.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="More Rosary Devotions" />
            <div className="grid sm:grid-cols-2 gap-4">
              {OTHER_DEVOTIONS.map((d) => (
                <div key={d.title} className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5" style={CARD_STYLE}>
                  <span className="inline-block w-2 h-2 rounded-full mb-3" style={{ background: d.color }} />
                  <h3 className="text-sm font-bold text-stone-900 mb-1">{d.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════ ALL PRAYERS ═══════════════ */}
      {view === "prayers" && (
        <div className="space-y-10">
          <SectionHeader title="The Prayers of the Holy Rosary" subtitle="All the prayers in their traditional, approved form, in the order you pray them." />
          <div className="grid md:grid-cols-2 gap-5">
            {ROSARY_PRAYERS.map((p, i) => (
              <div key={p.title} className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 md:col-span-1" style={CARD_STYLE}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-bold tracking-widest text-amber-700" style={{ fontFamily: "'Cinzel', serif" }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-base font-bold text-stone-900" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>{p.title}</h3>
                </div>
                {p.scripture && <p className="text-[11px] text-stone-500 mb-3 tracking-wide uppercase">— {p.scripture}</p>}
                <div className="space-y-3 mb-3">
                  {p.lines.map((line) => (
                    <p key={line.slice(0, 24)} className="text-sm text-stone-600 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                      {line}
                    </p>
                  ))}
                </div>
                {p.note && (
                  <p className="text-xs text-stone-500 border-t pt-3" style={{ borderColor: "rgba(217,119,6,0.15)" }}>
                    <span className="text-amber-700/80 font-semibold">Note · </span>{p.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ MYSTERIES ═══════════════ */}
      {view === "mysteries" && (
        <div className="space-y-10">
          <SectionHeader title="The Mysteries of the Rosary" subtitle="Twenty mysteries — Joyful, Luminous, Sorrowful, and Glorious — a compendium of the Gospel." />

          <div className="flex flex-wrap gap-2">
            {MYSTERY_SETS.map((s) => (
              <button
                key={s.key}
                onClick={() => { setMysterySet(s.key); setMysteryOpen(null); }}
                className="px-5 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase transition-all duration-200"
                style={{
                  ...TAB_STYLE(mysterySet === s.key),
                  ...(mysterySet === s.key ? { color: s.color, border: `1px solid ${s.color}55` } : {}),
                }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ ...CARD_STYLE, border: `1px solid ${activeSet.color}30` }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>{activeSet.label}</h3>
                <p className="text-xs text-stone-500 mt-1">{activeSet.theme}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Traditionally prayed:</span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${activeSet.color}1a`, color: activeSet.color }}>{activeSet.days}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Language:</span>
              <button onClick={() => setLang("english")} className="text-[11px] font-bold px-3 py-1 rounded-full transition-all" style={{ background: lang === "english" ? "rgba(217,119,6,0.15)" : "#F5F5F4", color: lang === "english" ? "#B45309" : "#78716C", border: `1px solid ${lang === "english" ? "rgba(217,119,6,0.35)" : "rgba(28,25,23,0.08)"}` }}>English</button>
              <button onClick={() => setLang("kiswahili")} className="text-[11px] font-bold px-3 py-1 rounded-full transition-all" style={{ background: lang === "kiswahili" ? "rgba(217,119,6,0.15)" : "#F5F5F4", color: lang === "kiswahili" ? "#B45309" : "#78716C", border: `1px solid ${lang === "kiswahili" ? "rgba(217,119,6,0.35)" : "rgba(28,25,23,0.08)"}` }}>Kiswahili</button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {activeMysteries.map((m, i) => {
                const open = mysteryOpen === m.title;
                return (
                  <button
                    key={m.title}
                    onClick={() => setMysteryOpen(open ? null : m.title)}
                    className="rounded-2xl p-4 text-left transition-all duration-300 text-center sm:text-left"
                    style={{
                      background: open ? `linear-gradient(135deg, ${activeSet.color}14, rgba(250,248,245,0.02))` : "#F5F5F4",
                      border: `1px solid ${open ? `${activeSet.color}50` : "rgba(28,25,23,0.08)"}`,
                    }}
                  >
                    <div className="text-[10px] tracking-widest uppercase font-bold mb-2" style={{ color: activeSet.color }}>Mystery {i + 1}</div>
                    <h4 className="text-sm font-bold text-stone-900 leading-snug mb-2">{m.title}</h4>
                    <div className="flex flex-col items-center sm:items-start gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${activeSet.color}1a`, color: activeSet.color }}>Fruit: {m.fruit}</span>
                    </div>
                    {open && (
                      <div className="mt-3 pt-3 border-t text-left" style={{ borderColor: "rgba(28,25,23,0.08)" }}>
                        {m.scripture && <p className="text-[11px] text-stone-500 italic mb-2">Scripture — {m.scripture}</p>}
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {lang === "english" ? m.english : m.kiswahili}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ PRAY ═══════════════ */}
      {view === "pray" && <PrayGuide />}

      {/* ═══════════════ BEAD GUIDE ═══════════════ */}
      {view === "beads" && (
        <div className="space-y-10">
          <SectionHeader title="The Rosary Beads" subtitle="A visual guide to the sacred beads and the prayers prayed upon them." />
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            <BeadDiagram />
          </div>

          <section>
            <SectionHeader title="More Rosary Devotions" />
            <div className="space-y-3">
              {OTHER_DEVOTIONS.map((d) => {
                const open = devotionOpen === d.title;
                return (
                  <div key={d.title} className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
                    <button onClick={() => setDevotionOpen(open ? null : d.title)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                      <div className="flex items-center gap-3">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <div>
                          <h3 className="text-sm font-bold text-stone-900">{d.title}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">{d.description}</p>
                        </div>
                      </div>
                      <span className="text-amber-700 text-lg flex-shrink-0" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
                    </button>
                    {open && (
                      <div className="px-5 pb-5">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {d.data.map((m, i) => (
                            <div key={m.title} className="rounded-xl p-4" style={{ background: "#F5F5F4", border: "1px solid rgba(28,25,23,0.08)" }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] tracking-widest font-bold" style={{ color: d.color }}>{String(i + 1).padStart(2, "0")}</span>
                                <h4 className="text-xs font-bold text-stone-900">{m.title}</h4>
                              </div>
                              {m.fruit && <p className="text-[10px] text-stone-500 mb-2">Fruit: {m.fruit}</p>}
                              <p className="text-xs text-stone-600 leading-relaxed">{lang === "english" ? m.english : m.kiswahili}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
