import type { Prayer } from '../data/prayerCategories';

interface PrayerReaderProps {
  prayer: Prayer;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  litanies: 'from-blue-600 to-indigo-600',
  saints: 'from-amber-500 to-yellow-600',
  healing: 'from-emerald-600 to-teal-600',
  daily: 'from-amber-500 to-orange-500',
  novenas: 'from-purple-600 to-indigo-600',
};

// ─── Litany Parser ─────────────────────────────────────────────
// Litanies store text as "Holy Mary, pray for us. Holy Mother of God, pray for us."
// with \n\n separating sections. We parse into structured invocation/response pairs.

const RESPONSE_PHRASES = [
  'pray for us',
  'have mercy on us',
  'graciously hear us',
  'spare us, O Lord',
  'spare us O Lord',
];

function splitSentences(text: string): string[] {
  // Split on ". " but keep the period attached to the sentence
  const raw = text.split(/\.\s+/);
  return raw.map((s) => s.trim()).filter(Boolean);
}

function parseInvocation(sentence: string): { name: string; response: string } | null {
  // Find where the response phrase starts
  for (const phrase of RESPONSE_PHRASES) {
    const idx = sentence.toLowerCase().lastIndexOf(phrase);
    if (idx > 0) {
      const name = sentence.substring(0, idx).replace(/,\s*$/, '').trim();
      const response = sentence.substring(idx).trim();
      // Capitalize first letter of response
      return { name, response: response.charAt(0).toUpperCase() + response.slice(1) };
    }
  }
  return null;
}

type LitanyBlock =
  | { type: 'heading'; text: string }
  | { type: 'prayers'; items: { name: string; response: string }[] }
  | { type: 'closing'; text: string };

function parseLitany(text: string): LitanyBlock[] {
  const blocks: LitanyBlock[] = [];

  // Split by double newline into sections
  const sections = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  for (const section of sections) {
    // Closing prayer: starts with "Let us pray:" or "Pray for us,"
    if (section.startsWith('Let us pray:') || section.startsWith('Pray for us,')) {
      blocks.push({ type: 'closing', text: section });
      continue;
    }

    // Opening section (Lord have mercy etc.) or Invocation section
    const sentences = splitSentences(section);
    const items: { name: string; response: string }[] = [];
    let allParsed = true;

    for (const sentence of sentences) {
      const parsed = parseInvocation(sentence);
      if (parsed) {
        items.push(parsed);
      } else {
        allParsed = false;
      }
    }

    if (items.length > 0) {
      // Determine if this is opening (Lord/Christ have mercy) or main invocations
      const firstLower = items[0].name.toLowerCase();
      if (firstLower.includes('lord') || firstLower.includes('christ')) {
        blocks.push({ type: 'heading', text: 'Opening' });
      }
      blocks.push({ type: 'prayers', items });
    } else if (!allParsed) {
      // Couldn't parse — treat as closing text
      blocks.push({ type: 'closing', text: section });
    }
  }

  return blocks;
}

// ─── Litany Body Component ─────────────────────────────────────

function LitanyBody({ prayer }: { prayer: Prayer }) {
  const blocks = parseLitany(prayer.text);

  return (
    <div className="space-y-5">
      {blocks.map((block, bi) => {
        if (block.type === 'heading') {
          return (
            <div key={bi} className="pt-2 pb-1 border-b border-slate-800/50">
              <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">{block.text}</h3>
            </div>
          );
        }

        if (block.type === 'prayers') {
          return (
            <div key={bi} className="space-y-0.5">
              {block.items.map((item, ii) => (
                <div
                  key={ii}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/40 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40 group-hover:bg-amber-400 flex-shrink-0 transition-colors" />
                  <span className="text-[13px] text-slate-200 font-medium leading-snug flex-1">
                    {item.name}
                  </span>
                  <span className="text-[13px] text-emerald-400 font-semibold italic whitespace-nowrap">
                    {item.response}
                  </span>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === 'closing') {
          return (
            <div key={bi} className="bg-slate-800/40 rounded-xl px-5 py-4 border border-slate-800/50">
              <p className="text-[13px] text-slate-300 leading-relaxed italic">{block.text}</p>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

// ─── Generic Body ──────────────────────────────────────────────

function GenericBody({ prayer }: { prayer: Prayer }) {
  return (
    <div className="space-y-3">
      {prayer.text.split('\n').map((paragraph, i) => {
        if (!paragraph.trim()) return <div key={i} className="h-3" />;
        return (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function PrayerReader({ prayer, onClose }: PrayerReaderProps) {
  const gradient = CATEGORY_COLORS[prayer.category] || 'from-indigo-600 to-purple-600';
  const isLitany = prayer.category === 'litanies';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-[#0a0f1c] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white flex items-start justify-between`}>
          <div className="min-w-0 pr-4">
            <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold mb-2">
              {isLitany ? 'Litany' : prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
            </span>
            <h2 className="text-xl font-bold leading-tight">{prayer.title}</h2>
            {prayer.intention && (
              <p className="text-sm text-white/75 mt-1">{prayer.intention}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLitany ? <LitanyBody prayer={prayer} /> : <GenericBody prayer={prayer} />}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/50 p-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
