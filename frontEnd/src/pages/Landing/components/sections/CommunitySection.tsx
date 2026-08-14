import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Activity, Layers, Users, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../../api/axiosInstance';

const EXPLORE_SETTING_KEYS: Record<string, string> = {
  jumuiya: 'explore_jumuiya_image',
  activities: 'explore_activities_image',
  projects: 'explore_projects_image',
  officials: 'explore_officials_image',
  background: 'explore_background_image',
};

const CommunitySection: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    apiClient
      .get('/settings')
      .then(({ data }) => {
        if (!active) return;
        const next: Record<string, string> = {};
        Object.entries(EXPLORE_SETTING_KEYS).forEach(([field, key]) => {
          if (data?.[key]) next[field] = data[key];
        });
        setImages(next);
      })
      .catch(() => {
        // keep defaults when settings are unavailable
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = [
    {
      title: 'Jumuiya',
      label: 'Fellowship',
      description: 'Local parish small groups that meet in faith, prayer, and friendship.',
      icon: <Grid size={22} />,
      accent: '#2563eb',
      link: '/jumuiya',
      image: images.jumuiya || '/images/biblestudy.webp',
    },
    {
      title: 'Activities',
      label: 'Engagement',
      description: 'Prayer meetings, retreats, and community events throughout the year.',
      icon: <Activity size={22} />,
      accent: '#059669',
      link: '/activities',
      image: images.activities || '/images/eucharist.jpg',
    },
    {
      title: 'Projects',
      label: 'Growth',
      description: 'Development and outreach initiatives that serve our wider community.',
      icon: <Layers size={22} />,
      accent: '#d97706',
      link: '/projects',
      image: images.projects || '/images/church.jpg',
    },
    {
      title: 'Officials',
      label: 'Leadership',
      description: 'The dedicated leaders who guide and serve the parish family.',
      icon: <Users size={22} />,
      accent: '#7c3aed',
      link: '/officials',
      image: images.officials || '/images/st-thomas-icon.jpg',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-stone-900 relative overflow-hidden" id="explore">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${images.background || '/images/christ.jpg'}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/85 via-stone-900/70 to-stone-900/85" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Explore Our Community
          </h2>
          <p className="text-stone-300 font-medium text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Faith, service, and friendship come together through the groups and
            ministries that make our parish home.
          </p>
          <div className="mt-7 flex items-center gap-3 text-stone-400">
            <span className="h-px w-10 bg-white/30" />
            <span className="text-xs italic font-serif text-stone-300">Four ways to belong</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.link)}
              className="group relative text-left bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Themed image header */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/10 to-transparent" />

                {/* Accent icon chip */}
                <div
                  className="absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: item.accent }}
                >
                  {item.icon}
                </div>
              </div>

              {/* Body */}
              <div className="p-7">
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
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
