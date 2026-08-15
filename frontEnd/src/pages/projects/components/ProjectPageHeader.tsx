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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center relative z-10">
      <motion.span
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full"
      >
        {badge}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="mt-5 text-3xl sm:text-4xl md:text-[2.6rem] font-bold tracking-tight text-slate-900"
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
