import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional extra classes for the hero wrapper */
  className?: string;
}

export default function ProjectHero({ children, className = '' }: Props) {
  return (
    <div className={`bg-slate-950 text-white relative overflow-hidden shadow-2xl ${className}`}>
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Subtle grid texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
