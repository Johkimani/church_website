import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityData } from './context/CommunityDataContext';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Music, 
  Users, 
  Compass, 
  Flame, 
  HeartHandshake 
} from 'lucide-react';

// Theme configuration for each community module to create visual excellence
interface MinistryTheme {
  image: string;
  tag: string;
  icon: React.ReactNode;
}

const MINISTRY_THEMES: Record<string, MinistryTheme> = {
  choir: {
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    tag: "Praise & Worship",
    icon: <Music className="w-5 h-5 text-white" />
  },
  dancers: {
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600",
    tag: "Liturgical Movement",
    icon: <Compass className="w-5 h-5 text-white" />
  },
  charismatic: {
    image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=600",
    tag: "Prayer & Healing",
    icon: <Flame className="w-5 h-5 text-white" />
  },
  "st-francis": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600",
    tag: "Simplicity & Charity",
    icon: <HeartHandshake className="w-5 h-5 text-white" />
  },
  youth: {
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600",
    tag: "Youth Fellowship",
    icon: <Users className="w-5 h-5 text-white" />
  }
};

const DEFAULT_THEME: MinistryTheme = {
  image: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=600",
  tag: "Parish Ministry",
  icon: <Users className="w-5 h-5 text-white" />
};

// Framer motion animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 70, 
      damping: 15 
    } 
  }
};

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { modules, isLoading } = useCommunityData();

  // Filter out the 'general' module and keep the 5 main ministries
  const activeModules = modules.filter(mod => mod.id !== 'general');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-wide">Loading ministries...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 text-slate-800 font-sans">
      
      {/* ══════════ Hero Header Section (Premium Dark Grid Design) ══════════ */}
      <div className="bg-slate-950 text-white py-24 px-6 md:px-12 relative overflow-hidden shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm font-black uppercase tracking-[0.32em] text-blue-400 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-500/20 mb-6 inline-block"
          >
            CSA Groups & Communities
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none"
          >
            Vibrant Ministries
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Discover and connect with our dedicated parish ministries. Grow in faith, share your unique gifts, and find your spiritual family.
          </motion.p>
        </div>
      </div>

      {/* ══════════ Ministries Cards Grid ══════════ */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-10 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center gap-8"
        >
          {activeModules.map((mod) => {
            const theme = MINISTRY_THEMES[mod.id] || DEFAULT_THEME;

            return (
              <motion.div
                key={mod.id}
                variants={cardVariants}
                onClick={() => navigate(`/community/${mod.id}`)}
                className="group relative flex flex-col h-full w-full max-w-[360px] md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] bg-white rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden cursor-pointer hover:-translate-y-3"
              >
                {/* Image & Gradient Header */}
                <div className="h-56 relative overflow-hidden shrink-0">
                  {/* Image with zoom on card hover */}
                  <img 
                    src={theme.image} 
                    alt={mod.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  
                  {/* Shadow Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                    {theme.tag}
                  </span>

                  {/* Floating Icon Bubble */}
                  <div className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                    {theme.icon}
                  </div>

                  {/* Ministry Title */}
                  <div className="absolute bottom-4 left-6 right-6">
                    <h3 className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-blue-300 transition-colors">
                      {mod.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow font-medium">
                    {mod.description}
                  </p>

                  {/* Action Link Footer */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black uppercase tracking-wider text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span>Explore Community</span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-blue-600">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {activeModules.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
            <i className="fas fa-folder-open text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-2xl font-bold text-gray-500 mb-2">No ministries found</h3>
            <p className="text-gray-400">We couldn't find any active ministry modules at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
