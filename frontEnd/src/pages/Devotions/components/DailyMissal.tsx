import { useState, useEffect } from "react";
import type { DailyReadings, Reading } from "../data/readingsData";
import { getDailyReadings, getNextSunday, getTomorrow } from "../services/dailyReadingsApi";

type DateTab = "today" | "tomorrow" | "next-sunday";

interface DailyMissalProps {
  initialReadings?: DailyReadings;
}



function sanitizeDivineNames(text: string): string {
  let out = text;
  out = out.replace(/\bPraise\s+Yah\b/g, "Praise the Lord");
  out = out.replace(/\bYahweh\b/g, "the LORD");
  out = out.replace(/\bYah\b(?!\s*s)/g, "the Lord");
  out = out.replace(/\bLORD\b/g, "the LORD");
  out = out.replace(/\bGOD\b/g, "God");
  return out;
}



const RESPONSE_PATTERNS = [
  /^R\.\s*/i,
  /^Response:\s*/i,
  /^R:\s*/i,
  /^\(R\.\)\s*/i,
  /^R$/i,
];

function extractResponse(line: string): { isResponse: boolean; text: string } {
  for (const pat of RESPONSE_PATTERNS) {
    if (pat.test(line)) {
      const cleaned = line.replace(pat, "").trim();
      return { isResponse: true, text: cleaned };
    }
  }
  return { isResponse: false, text: line };
}

function groupPsalmIntoStanzas(rawText: string, defaultResponse?: string): { stanzas: string[][]; response: string | null } {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let response: string | null = null;
  const verses: string[] = [];

  for (const line of lines) {
    const { isResponse, text } = extractResponse(line);
    if (isResponse) {
      if (text && !response) response = text;
    } else {
      verses.push(text);
    }
  }

  if (!response) {
    response = defaultResponse || "I will praise you, Lord, with all my heart";
  }

  const stanzaSize = 3;
  const stanzas: string[][] = [];
  for (let i = 0; i < verses.length; i += stanzaSize) {
    stanzas.push(verses.slice(i, i + stanzaSize));
  }

  return { stanzas, response };
}



const T = {
  en: {
    tabs: { today: "Today", tomorrow: "Tomorrow", nextSunday: "Next Sunday" },
    labels: {
      "first-reading": "First Reading",
      "responsorial-psalm": "Responsorial Psalm",
      "second-reading": "Second Reading",
      gospel: "Gospel",
    },
    alleluia: "Alleluia",
    response: "Response",
    defaultPsalmResponse: "I will praise you, Lord, with all my heart",
    conclusions: {
      "first-reading": { proclamation: "The word of the Lord.", response: "Thanks be to God." },
      "second-reading": { proclamation: "The word of the Lord.", response: "Thanks be to God." },
      gospel: { proclamation: "The Gospel of the Lord.", response: "Praise to you, Lord Jesus Christ." },
    },
    error: { title: "Unable to load readings", subtitle: "Please check your connection and try again", retry: "Retry" },
    empty: "No readings available for this date",
    attribution1: "Scripture text from the Douay-Rheims Catholic Bible (public domain). Liturgical citations follow the Roman Lectionary.",
    attribution2: "Psalms with proper liturgical responses. Source:",
  },
  sw: {
    tabs: { today: "Leo", tomorrow: "Kesho", nextSunday: "Jumapili Ijayo" },
    labels: {
      "first-reading": "Somo la Kwanza",
      "responsorial-psalm": "Zaburi ya Jibu",
      "second-reading": "Somo la Pili",
      gospel: "Injili",
    },
    alleluia: "Haleluya",
    response: "Jibu",
    defaultPsalmResponse: "Nitakushukuru, Ee Bwana, kwa moyo wangu wote",
    conclusions: {
      "first-reading": { proclamation: "Neno la Bwana.", response: "Asanteni Mungu." },
      "second-reading": { proclamation: "Neno la Bwana.", response: "Asanteni Mungu." },
      gospel: { proclamation: "Injili ya Bwana.", response: "Tukushukuru Bwana Yesu Kristo." },
    },
    error: { title: "Hawezi kupata masomo", subtitle: "Tafadhali angalia muunganisho wako na ujaribu tena", retry: "Jaribu Tena" },
    empty: "Hakuna masomo kwa tarehe hii",
    attribution1: "Maandiko kutoka Biblia Takatifu ya Douay-Rhemes (hadharani). Viashiria vya kitume vinafuata Waraka wa Roma.",
    attribution2: "Zaburi zenye majibu sahihi ya kitume. Chanzo:",
  },
} as const;

type Lang = keyof typeof T;



function ReadingCard({ reading, lang }: { reading: Reading; lang: Lang }) {
  const t = T[lang];
  const typeConfig: Record<string, { color: string; bgLight: string; border: string; verseColor: string }> = {
    "first-reading": { color: "text-indigo-700", bgLight: "bg-indigo-50", border: "border-indigo-200", verseColor: "text-indigo-600" },
    "responsorial-psalm": { color: "text-emerald-700", bgLight: "bg-emerald-50", border: "border-emerald-200", verseColor: "text-emerald-600" },
    "second-reading": { color: "text-purple-700", bgLight: "bg-purple-50", border: "border-purple-200", verseColor: "text-purple-600" },
    gospel: { color: "text-rose-700", bgLight: "bg-rose-50", border: "border-rose-200", verseColor: "text-rose-600" },
  };

  const cfg = typeConfig[reading.type] || typeConfig["first-reading"];
  const isPsalm = reading.type === "responsorial-psalm";
  const isGospel = reading.type === "gospel";
  const conclusion = t.conclusions[reading.type as keyof typeof t.conclusions];
  const label = t.labels[reading.type as keyof typeof t.labels] || reading.type;

  const sanitizedText = sanitizeDivineNames(reading.text);
  const wordCount = sanitizedText.split(/\s+/).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className={`rounded-[16px] bg-white overflow-hidden transition-all duration-200 hover:scale-[1.01] ${
        isGospel ? 'ring-2 ring-rose-200 ring-offset-1' : ''
      }`}
      style={{
        boxShadow: isGospel
          ? "0 4px 12px -2px rgba(244,63,94,0.15), 0 8px 24px -4px rgba(244,63,94,0.1)"
          : "0 2px 4px -1px rgba(0,0,0,0.05), 0 4px 12px -2px rgba(0,0,0,0.08)",
      }}
    >
      <div className={`px-5 py-3 ${cfg.bgLight} border-b ${cfg.border} flex flex-wrap items-center justify-between gap-2`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bgLight} px-2 py-0.5 rounded-full border ${cfg.border}`}>
            {label}
          </span>
          {isGospel && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 px-2 py-0.5 rounded-full bg-rose-100 border border-rose-200">
              {t.alleluia}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">~{readMin} min</span>
          <span className="text-xs font-medium text-slate-500 truncate">{reading.citation}</span>
        </div>
      </div>

      <div className="px-5 py-4">
        {isPsalm ? (
          <PsalmBody rawText={sanitizedText} citation={reading.citation} serverResponse={reading.response} lang={lang} />
        ) : (
          <ReadingBody rawText={sanitizedText} />
        )}

        {conclusion && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-800 italic">{conclusion.proclamation}</p>
            <p className="text-sm text-slate-600 mt-1">{conclusion.response}</p>
          </div>
        )}
      </div>
    </div>
  );
}



function PsalmBody({ rawText, citation, serverResponse, lang }: { rawText: string; citation: string; serverResponse?: string; lang: Lang }) {
  const t = T[lang];
  const { stanzas, response: extractedResponse } = groupPsalmIntoStanzas(rawText, t.defaultPsalmResponse);

  // Use server-provided response if available, otherwise use extracted response
  const response = serverResponse || extractedResponse;

  const isBroken =
    stanzas.length === 1 && stanzas[0].length === 1 && stanzas[0][0] === citation;

  if (isBroken) {
    return <p className="text-sm text-slate-500 italic">{citation}</p>;
  }

  return (
    <div>
      {/* Response header */}
      {response && (
        <div className="mb-4 bg-emerald-50 rounded-lg px-4 py-2.5 border border-emerald-200">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">{t.response}</p>
          <p className="text-[13px] font-bold text-emerald-800">{response}</p>
        </div>
      )}

      {/* Stanzas */}
      {stanzas.map((stanza, si) => (
        <div key={si} className={si > 0 ? "mt-4 pt-4 border-t border-slate-100" : ""}>
          {stanza.map((verse, vi) => (
            <p key={vi} className="text-[13px] text-slate-700 leading-relaxed mb-1">
              {verse}
            </p>
          ))}
          {response && (
            <p className="text-[13px] font-bold text-emerald-700 mt-2">R. {response}</p>
          )}
        </div>
      ))}
    </div>
  );
}



function ReadingBody({ rawText }: { rawText: string }) {
  const paragraphs = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-slate-700 leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}



function ReadingSkeleton() {
  return (
    <div className="rounded-[16px] bg-white overflow-hidden animate-pulse" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.05), 0 4px 12px -2px rgba(0,0,0,0.08)" }}>
      <div className="px-5 py-3 bg-slate-100 border-b border-slate-200">
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
      <div className="px-5 py-4 space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-4/6" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
      </div>
    </div>
  );
}



export default function DailyMissal({ initialReadings }: DailyMissalProps) {
  const [activeTab, setActiveTab] = useState<DateTab>("today");
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [readings, setReadings] = useState<DailyReadings | null>(initialReadings || null);
  const [loading, setLoading] = useState(!initialReadings);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialReadings) {
      setReadings(initialReadings);
      setLoading(false);
      return;
    }
    loadReadings("today", lang);
  }, [initialReadings]);

  async function loadReadings(tab: DateTab, language: "en" | "sw" = lang) {
    setLoading(true);
    setError(false);
    try {
      let targetDate: Date;
      if (tab === "today") targetDate = new Date();
      else if (tab === "tomorrow") targetDate = getTomorrow(new Date());
      else targetDate = getNextSunday(new Date());

      const data = await getDailyReadings(targetDate, language);
      setReadings(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: DateTab) {
    setActiveTab(tab);
    loadReadings(tab, lang);
  }

  function handleLangChange(newLang: "en" | "sw") {
    setLang(newLang);
    loadReadings(activeTab, newLang);
  }

  const t = T[lang];

  const tabs: { key: DateTab; label: string }[] = [
    { key: "today", label: t.tabs.today },
    { key: "tomorrow", label: t.tabs.tomorrow },
    { key: "next-sunday", label: t.tabs.nextSunday },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white rounded-[16px] p-1.5 w-fit" style={{
          boxShadow: "0 2px 4px -1px rgba(0,0,0,0.05), 0 4px 12px -2px rgba(0,0,0,0.08)",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-2 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white rounded-[16px] p-1.5" style={{
          boxShadow: "0 2px 4px -1px rgba(0,0,0,0.05), 0 4px 12px -2px rgba(0,0,0,0.08)",
        }}>
          <button
            onClick={() => handleLangChange("en")}
            className={`px-4 py-2 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
              lang === "en"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLangChange("sw")}
            className={`px-4 py-2 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
              lang === "sw"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            Kiswahili
          </button>
        </div>
      </div>

      {readings && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">{readings.weekday}</p>
          {readings.celebration && (
            <p className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {readings.celebration}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <ReadingSkeleton />
          <ReadingSkeleton />
          <ReadingSkeleton />
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-[16px] p-6 text-center">
          <p className="text-sm font-medium text-rose-700">{t.error.title}</p>
          <p className="text-xs text-rose-500 mt-1">{t.error.subtitle}</p>
          <button
            onClick={() => loadReadings(activeTab)}
            className="mt-3 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-[12px] hover:bg-rose-700 transition-colors"
          >
            {t.error.retry}
          </button>
        </div>
      )}

      {readings && !loading && readings.readings.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-6 text-center">
          <p className="text-sm font-medium text-amber-700">{t.empty}</p>
        </div>
      )}

      {readings && !loading && readings.readings.length > 0 && (
        <div className="space-y-4">
          {/* Reading progress dots */}
          <div className="flex items-center justify-center gap-2 py-1">
            {readings.readings.map((r, i) => {
              const cfg = {
                "first-reading": "bg-indigo-400",
                "responsorial-psalm": "bg-emerald-400",
                "second-reading": "bg-purple-400",
                "gospel": "bg-rose-400",
              }[r.type] || "bg-slate-300";
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cfg}`} title={r.type} />
                  {i < readings.readings.length - 1 && <div className="w-4 h-px bg-slate-200" />}
                </div>
              );
            })}
          </div>

          {readings.readings.map((reading, i) => (
            <ReadingCard key={i} reading={reading} lang={lang} />
          ))}
          <div className="text-center pt-2 space-y-1">
            <p className="text-[10px] text-slate-400">
              {t.attribution1}
            </p>
            <p className="text-[10px] text-slate-400">
              {t.attribution2} {readings.source}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
