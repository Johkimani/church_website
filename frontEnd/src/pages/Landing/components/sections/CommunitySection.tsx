import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Activity, Layers, Users, ArrowUpRight } from 'lucide-react';

const CommunitySection: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Jumuiya',
      kicker: 'Fellowship',
      description: 'Small parish families where students meet in faith, prayer, and friendship week after week.',
      icon: <Grid size={22} />,
      accent: '#b45309',
      link: '/jumuiya',
    },
    {
      title: 'Activities',
      kicker: 'Engagement',
      description: 'Prayer meetings, retreats, and the events that fill our year with living faith.',
      icon: <Activity size={22} />,
      accent: '#9a3412',
      link: '/activities',
    },
    {
      title: 'Projects',
      kicker: 'Growth',
      description: 'Outreach and development work that carries our care beyond the church walls.',
      icon: <Layers size={22} />,
      accent: '#7c2d12',
      link: '/projects',
    },
    {
      title: 'Officials',
      kicker: 'Leadership',
      description: 'The steady hands — elected and appointed — who guide and serve the parish family.',
      icon: <Users size={22} />,
      accent: '#854d0e',
      link: '/officials',
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#faf8f5] relative overflow-hidden" id="explore">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#faf6f0,white_72%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mb-14 md:mb-20">
          <span className="text-amber-700 text-[11px] font-bold uppercase tracking-[0.3em]">
            The Parish, Up Close
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 mt-4 leading-[1.08] tracking-tight">
            More than Sunday.
            <br />
            <span className="italic text-amber-800">A life together.</span>
          </h2>
          <p className="mt-5 text-stone-600 text-base md:text-lg leading-relaxed">
            However you hope to take part — a small group, an event, a project, or
            simply knowing who leads — this is where you begin.
          </p>
          <div className="mt-7 flex items-center gap-3 text-stone-400">
            <span className="h-px w-10 bg-stone-300" />
            <span className="text-xs italic font-serif">Four ways to belong</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {categories.map((c, i) => (
            <button
              key={c.title}
              onClick={() => navigate(c.link)}
              className={`group relative text-left bg-white rounded-sm border border-stone-200/70 shadow-[0_10px_40px_-20px_rgba(60,40,20,0.25)] p-7 sm:p-8 transition-all duration-400 hover:shadow-[0_24px_60px_-24px_rgba(60,40,20,0.4)] hover:-translate-y-1 overflow-hidden ${
                i % 2 === 1 ? 'sm:translate-y-6' : ''
              }`}
            >
              <span className="absolute -top-2 left-10 w-14 h-4 bg-amber-200/40 border border-amber-200/30 rotate-1 pointer-events-none" />
              <div className="flex items-start justify-between gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: c.accent }}
                >
                  {c.icon}
                </div>
                <span
                  className="inline-flex items-center gap-1 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: c.accent }}
                >
                  Open
                  <ArrowUpRight size={15} />
                </span>
              </div>

              <span
                className="block mt-6 text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: c.accent }}
              >
                {c.kicker}
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1.5">{c.title}</h3>
              <p className="mt-2.5 text-stone-600 text-[15px] leading-relaxed">{c.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
