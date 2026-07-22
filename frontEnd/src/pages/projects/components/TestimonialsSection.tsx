<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
=======
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import InlineLoader from '../../../assets/Layouts/InlineLoader';
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
import apiService from '../../Landing/services/api';
import { useProjectsData } from '../context/ProjectsProvider';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  created_at: string;
}

interface Props {
  variant?: 'blue' | 'emerald';
  title?: string;
}

const THEMES = {
  blue: { badge: 'text-blue-600 bg-blue-100', border: 'border-blue-50', btn: 'bg-blue-600 hover:bg-blue-700' },
  emerald: { badge: 'text-emerald-600 bg-emerald-100', border: 'border-emerald-50', btn: 'bg-emerald-600 hover:bg-emerald-700' },
};

export default function TestimonialsSection({ variant = 'blue', title = 'Trusted by Our Community' }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = THEMES[variant];
  const ctx = useProjectsData();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (ctx.testimonials.length > 0) {
      setTestimonials(ctx.testimonials);
      setLoading(false);
      return;
    }
    apiService.getTestimonials(true)
      .then(data => { setTestimonials(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ctx.testimonials]);

  if (!loading && testimonials.length === 0) return null;

  return (
    <div className="py-10 sm:py-14 px-4">
      <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-10">
        <span className={`inline-block text-[10px] sm:text-xs font-black ${theme.badge} px-4 py-1.5 rounded-full uppercase tracking-widest mb-3`}>
          What Our Customers Say
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{title}</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
        {loading
<<<<<<< HEAD
          ? [1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto mb-3" />
                <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto mb-4" />
                <div className="h-3 bg-slate-200 rounded w-1/4 mx-auto" />
              </div>
            ))
=======
          ? (
              <div className="col-span-full py-8">
                <InlineLoader message="Loading testimonials" size="medium" />
              </div>
            )
>>>>>>> ac9b14a9307aa0a86e676c714744493cd735ebab
          : testimonials.map(t => (
              <div key={t.id} className={`bg-white rounded-2xl p-5 sm:p-6 shadow hover:shadow-lg transition-all duration-300 border ${theme.border} hover:-translate-y-1 text-center`}>
                <div className="flex justify-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FaStar key={i} size={12} className="text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  {t.role && <p className="text-xs text-slate-400">{t.role}</p>}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
