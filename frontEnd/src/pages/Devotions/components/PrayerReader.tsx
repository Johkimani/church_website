import type { Prayer } from '../data/prayerCategories';
import { useParchmentTheme } from '../parchmentTheme';
import '../parchment.css';

interface PrayerReaderProps {
  prayer: Prayer;
  onClose: () => void;
}

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
  const raw = text.split(/\.\s+/);
  return raw.map((s) => s.trim()).filter(Boolean);
}

function parseInvocation(sentence: string): { name: string; response: string } | null {
  for (const phrase of RESPONSE_PHRASES) {
    const idx = sentence.toLowerCase().lastIndexOf(phrase);
    if (idx > 0) {
      const name = sentence.substring(0, idx).replace(/,\s*$/, '').trim();
      const response = sentence.substring(idx).trim();
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
  const sections = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  for (const section of sections) {
    if (section.startsWith('Let us pray:') || section.startsWith('Pray for us,')) {
      blocks.push({ type: 'closing', text: section });
      continue;
    }

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
      const firstLower = items[0].name.toLowerCase();
      if (firstLower.includes('lord') || firstLower.includes('christ')) {
        blocks.push({ type: 'heading', text: 'Opening' });
      }
      blocks.push({ type: 'prayers', items });
    } else if (!allParsed) {
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
            <div key={bi} className="pt-2 pb-1 border-b rule">
              <h3 className="small-caps gold">{block.text}</h3>
            </div>
          );
        }

        if (block.type === 'prayers') {
          return (
            <div key={bi} className="space-y-0.5">
              {block.items.map((item, ii) => (
                <div
                  key={ii}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover-soft transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full gold flex-shrink-0 transition-colors" />
                  <span className="text-[13px] ink font-medium leading-snug flex-1 font-body-book">
                    {item.name}
                  </span>
                  <span className="text-[13px] gold-deep font-semibold italic whitespace-nowrap">
                    {item.response}
                  </span>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === 'closing') {
          return (
            <div key={bi} className="paper-2 rounded-xl px-5 py-4">
              <p className="text-[13px] muted leading-relaxed italic font-body-book">{block.text}</p>
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
  const paragraphs = prayer.text.split('\n').filter((p) => p.trim().length > 0);
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={`ink leading-[1.9] text-[15px] font-body-book ${i === 0 ? 'dropcap' : ''}`}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function PrayerReader({ prayer, onClose }: PrayerReaderProps) {
  const { theme } = useParchmentTheme();
  const isLitany = prayer.category === 'litanies';

  return (
    <div
      className="parchment parchment-bg fixed inset-0 z-[60] flex items-center justify-center p-4"
      data-theme={theme}
      style={{ backgroundColor: 'var(--p-overlay)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="page-sheen paper relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ boxShadow: '0 30px 80px var(--p-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b rule">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <span className="w-8 h-8 rounded-full border gold-rule flex items-center justify-center font-serif-book text-sm gold flex-shrink-0">
              {isLitany ? 'L' : prayer.category.charAt(0).toUpperCase()}
            </span>
            <span className="small-caps muted truncate">
              {isLitany ? 'Litany' : prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close prayer"
            className="btn-ghost p-2 rounded-lg flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="px-6 sm:px-10 pt-7 pb-5 text-center border-b rule">
          <div className="flex items-center justify-center gap-3 mb-3 max-w-xs mx-auto">
            <span className="gold-rule-fill h-px flex-1" />
            <span className="gold text-base leading-none">{'\u2766'}</span>
            <span className="gold-rule-fill h-px flex-1" />
          </div>
          <h2 className="font-serif-book text-3xl ink font-semibold leading-tight">{prayer.title}</h2>
          {prayer.intention && (
            <p className="muted italic font-body-book text-sm mt-2">{prayer.intention}</p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-7">
          <div className="max-w-xl mx-auto">
            {isLitany ? <LitanyBody prayer={prayer} /> : <GenericBody prayer={prayer} />}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t rule px-6 py-3.5 flex justify-center">
          <button
            onClick={onClose}
            className="small-caps gold px-6 py-2 rounded-lg gold-soft hover-rule transition-colors"
          >
            {isLitany ? 'Close' : 'Amen · Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
