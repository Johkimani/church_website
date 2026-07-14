import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  badge: string;
  title: ReactNode;
  subtitle?: string;
  /** Extra content shown after the subtitle (e.g. trust strip) */
  children?: ReactNode;
}

export default function ProjectPageHeader({ badge, title, subtitle, children }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center relative z-10">
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-[0.32em] text-blue-400 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-500/20 mb-4"
      >
        {badge}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight"
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
