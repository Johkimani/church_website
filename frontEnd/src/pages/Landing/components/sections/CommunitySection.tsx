import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Activity, Layers, Users, ArrowRight } from 'lucide-react';

const CommunitySection: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Jumuiya',
      label: 'Fellowship',
      description: 'Local parish small groups that meet in faith, prayer, and friendship.',
      icon: <Grid size={22} />,
      accent: '#2563eb',
      link: '/jumuiya',
    },
    {
      title: 'Activities',
      label: 'Engagement',
      description: 'Prayer meetings, retreats, and community events throughout the year.',
      icon: <Activity size={22} />,
      accent: '#059669',
      link: '/activities',
    },
    {
      title: 'Projects',
      label: 'Growth',
      description: 'Development and outreach initiatives that serve our wider community.',
      icon: <Layers size={22} />,
      accent: '#d97706',
      link: '/projects',
    },
    {
      title: 'Officials',
      label: 'Leadership',
      description: 'The dedicated leaders who guide and serve the parish family.',
      icon: <Users size={22} />,
      accent: '#7c3aed',
      link: '/officials',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-stone-50 relative overflow-hidden" id="explore">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-5 tracking-tight">
            Explore Our Community
          </h2>
          <p className="text-stone-500 font-medium text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Faith, service, and friendship come together through the groups and
            ministries that make our parish home.
          </p>
          <div className="mt-7 flex items-center gap-3 text-stone-400">
            <span className="h-px w-10 bg-stone-300" />
            <span className="text-xs italic font-serif">Four ways to belong</span>
          </div>
        </div>

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
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
