import React from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Grid, Activity, Layers, Users, ArrowRight } from 'lucide-react';
=======
import { Grid, Activity, Layers, Users, ArrowUpRight } from 'lucide-react';
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab

const CommunitySection: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Jumuiya',
<<<<<<< HEAD
      label: 'Fellowship',
      description: 'Local parish small groups that meet in faith, prayer, and friendship.',
      icon: <Grid size={22} />,
      accent: '#2563eb',
=======
      kicker: 'Fellowship',
      description: 'Small parish families where students meet in faith, prayer, and friendship week after week.',
      icon: <Grid size={22} />,
      accent: '#b45309',
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
      link: '/jumuiya',
    },
    {
      title: 'Activities',
<<<<<<< HEAD
      label: 'Engagement',
      description: 'Prayer meetings, retreats, and community events throughout the year.',
      icon: <Activity size={22} />,
      accent: '#059669',
=======
      kicker: 'Engagement',
      description: 'Prayer meetings, retreats, and the events that fill our year with living faith.',
      icon: <Activity size={22} />,
      accent: '#9a3412',
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
      link: '/activities',
    },
    {
      title: 'Projects',
<<<<<<< HEAD
      label: 'Growth',
      description: 'Development and outreach initiatives that serve our wider community.',
      icon: <Layers size={22} />,
      accent: '#d97706',
=======
      kicker: 'Growth',
      description: 'Outreach and development work that carries our care beyond the church walls.',
      icon: <Layers size={22} />,
      accent: '#7c2d12',
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
      link: '/projects',
    },
    {
      title: 'Officials',
<<<<<<< HEAD
      label: 'Leadership',
      description: 'The dedicated leaders who guide and serve the parish family.',
      icon: <Users size={22} />,
      accent: '#7c3aed',
=======
      kicker: 'Leadership',
      description: 'The steady hands — elected and appointed — who guide and serve the parish family.',
      icon: <Users size={22} />,
      accent: '#854d0e',
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
      link: '/officials',
    },
  ];

  return (
<<<<<<< HEAD
    <section className="py-20 md:py-28 bg-stone-50 relative overflow-hidden" id="explore">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold tracking-[0.22em] uppercase mb-5">
            Vibrant Community
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-5 tracking-tight">
            Explore Our Community
          </h2>
          <p className="text-stone-500 font-medium text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Faith, service, and friendship come together through the groups and
            ministries that make our parish home.
=======
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
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
          </p>
          <div className="mt-7 flex items-center gap-3 text-stone-400">
            <span className="h-px w-10 bg-stone-300" />
            <span className="text-xs italic font-serif">Four ways to belong</span>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.link)}
              className="group relative text-left bg-white rounded-3xl p-7 border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: item.accent }}
              >
                {item.icon}
              </div>

              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase mb-3"
                style={{ backgroundColor: `${item.accent}14`, color: item.accent }}
              >
                {item.label}
              </span>

              <h3 className="text-xl font-bold text-stone-800 mb-2 tracking-tight">
                {item.title}
              </h3>
              <p className="text-stone-500 font-medium text-sm leading-relaxed">
                {item.description}
              </p>

              <div
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: item.accent }}
              >
                View Details
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
=======
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
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
