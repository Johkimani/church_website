import { Link } from 'react-router-dom';
import { HeartHandshake, BookOpen } from 'lucide-react';

const MarianTeaser: React.FC = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[#FAF8F5]">
      {/* Warm glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-100/40 rounded-full blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div
          className="rounded-[2.5rem] overflow-hidden grid lg:grid-cols-2 border border-amber-200/60 shadow-[0_40px_90px_-40px_rgba(217,119,6,0.35)]"
          style={{ background: "linear-gradient(135deg, #FFFFFF, #FDF8F0)" }}
        >
          {/* Image side */}
          <div className="relative h-64 lg:h-auto min-h-[320px] overflow-hidden">
            <img
              src="/images/mary-annunciation.jpg"
              alt="The Annunciation — the Angel Gabriel greets the Blessed Virgin Mary"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white/70" />
            <div className="absolute bottom-4 left-5 right-5 lg:hidden">
              <p className="text-white text-xs font-bold tracking-[0.2em] uppercase drop-shadow">
                Luke 1:38 — "Be it done to me according to your word."
              </p>
            </div>
          </div>

          {/* Content side */}
          <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">
            <span className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.15em] text-amber-700 uppercase">Marian Devotion</span>
            </span>

            <h2
              className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              Walk with Mary
            </h2>

            <blockquote className="border-l-4 border-amber-500 pl-5 my-6">
              <p className="text-slate-600 text-base md:text-lg italic leading-relaxed">
                "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus."
              </p>
            </blockquote>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              From the Annunciation to the Cross, our Mother leads us ever closer to her Son.
              Journey with her through the Holy Rosary, novenas, and daily devotions.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/devotions/rosary"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #D97706, #B45309)",
                  boxShadow: "0 12px 28px rgba(217,119,6,0.35)",
                }}
              >
                <HeartHandshake size={16} />
                Pray the Rosary
              </Link>
              <Link
                to="/devotions/prayer-module"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-amber-700 bg-white border border-amber-300/70 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 active:scale-95"
              >
                <BookOpen size={16} />
                Marian Novenas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarianTeaser;
