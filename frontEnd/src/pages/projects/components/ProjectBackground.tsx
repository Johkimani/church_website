import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const GOLD_CROSS_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpath d='M28 8v40M8 28h40' stroke='%23f59e0b' stroke-width='0.5' opacity='0.06' fill='none' /%3E%3C/svg%3E`;

const GOLD_STAR_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M32 6 L35 24 L52 24 L38 35 L43 54 L32 42 L21 54 L26 35 L12 24 L29 24 Z' fill='%23f59e0b' opacity='0.04' /%3E%3C/svg%3E`;

export default function ProjectBackground({ children }: Props) {
  return (
    <div className="relative bg-gradient-to-b from-white via-blue-50/20 to-white">
      {/* Golden crosses pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url('${GOLD_CROSS_SVG}')`, backgroundSize: '56px 56px' }}
      />

      {/* Golden stars pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('${GOLD_STAR_SVG}')`,
          backgroundSize: '64px 64px',
          backgroundPosition: '28px 28px',
        }}
      />

      {/* Elegant top border accent */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

      {/* Faint warm center glow */}
      <div className="absolute top-[15%] left-[25%] w-[50%] h-[30%] rounded-full bg-amber-400/3 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
