import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional extra classes for the hero wrapper */
  className?: string;
}

export default function ProjectHero({ children, className = '' }: Props) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100 ${className}`}>
      {/* Soft warm glow accents */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[340px] rounded-full bg-blue-100/70 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[300px] h-[300px] rounded-full bg-amber-100/50 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
