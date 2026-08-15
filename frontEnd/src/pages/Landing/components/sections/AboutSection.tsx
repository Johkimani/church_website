import { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

function AboutSection() {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 py-12 md:px-6 md:py-20 lg:px-8 relative">
      {/* Catholic background - stained glass, clearly visible, keeps text readable */}
      <div className="absolute inset-0 -z-20 bg-[url('/images/about-section-bg.jpg')] bg-cover bg-center opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-white/50 to-white/90" aria-hidden="true" />

      {/* Background ambient light - Subtler near-white */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-slate-50/20 blur-[120px] -z-10 rounded-full hidden md:block" />

      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
        <h2 className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px] mb-4">Who We Are</h2>
        <div className="mb-6 flex justify-center">
          <a href="/devotions/rosary" className="inline-flex hover:scale-105 transition-transform duration-300" title="Pray the Rosary with Our Lady">
            <div className="rounded-full overflow-hidden p-1.5" style={{
              background: "linear-gradient(135deg, #FBBF24, #D97706)",
              boxShadow: "0 14px 30px rgba(217,119,6,0.35), 0 4px 12px rgba(28,25,23,0.15)",
            }}>
              <img
                src="/images/mary-immaculate.jpg"
                alt="The Blessed Virgin Mary"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
              />
            </div>
          </a>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Welcome to CSA Kirinyaga University
        </h1>
        <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium max-w-2xl mx-auto">
          St. Thomas Aquinas welcomes you to our Catholic movement which is
          aimed at spreading the Gospel and enriching the Catholic faith to members
          through prayers and upholding Catholic principles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 max-w-5xl mx-auto">
        {/* Mission */}
        <div id="mission" className="group relative bg-slate-50 hover:bg-white p-8 md:p-12 rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border border-transparent hover:border-slate-100 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] cursor-default overflow-hidden">
          {/* Faded Background Depth Accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl group-hover:bg-blue-100/30 transition-colors duration-1000"></div>
          
          {/* Intense Lightning Light Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] skew-x-12"></div>

          <div className="flex flex-col items-center text-center relative z-10">
            <button
              onClick={() => setActiveImage('/images/eucharist.jpg')}
              className="mb-8 p-2.5 bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#60a5fa] rounded-full shadow-lg shadow-blue-500/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 cursor-zoom-in relative"
              aria-label="View mission image full size"
            >
              <img src="/images/eucharist.jpg" alt="The Eucharist — our mission of prayer" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-md text-blue-600">
                <Maximize2 size={13} />
              </span>
            </button>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[9px] font-black tracking-[0.2em] uppercase mb-3">PURPOSE</span>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
              Our Mission
            </h3>
            <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-sm">
              Achieving greater heights spiritually in the Catholic faith through prayers as an instrument of hope to humanity.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div id="vision" className="group relative bg-slate-50 hover:bg-white p-8 md:p-12 rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border border-transparent hover:border-slate-100 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] cursor-default overflow-hidden">
          {/* Faded Background Depth Accent */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl group-hover:bg-emerald-100/30 transition-colors duration-1000"></div>
          
          {/* Intense Lightning Light Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] skew-x-12"></div>

          <div className="flex flex-col items-center text-center relative z-10">
            <button
              onClick={() => setActiveImage('/images/christ.jpg')}
              className="mb-8 p-2.5 bg-gradient-to-br from-[#059669] via-[#10b981] to-[#34d399] rounded-full shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 cursor-zoom-in relative"
              aria-label="View vision image full size"
            >
              <img src="/images/christ.jpg" alt="Christ — our vision of spreading the Gospel" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-md text-emerald-600">
                <Maximize2 size={13} />
              </span>
            </button>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black tracking-[0.2em] uppercase mb-3">FUTURE</span>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
              Our Vision
            </h3>
            <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-sm">
              To produce spiritually and morally upright Christians who will actively spread the Gospel throughout the world.
            </p>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
          onClick={() => setActiveImage(null)}
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Close image"
          >
            <X size={22} />
          </button>
          <img
            src={activeImage}
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-300"
          />
        </div>
      )}
    </section>
  );
}

export default AboutSection;
