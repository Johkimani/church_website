import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional class for the outer wrapper */
  className?: string;
}

export default function ProjectPageLayout({ children, className = '' }: Props) {
  return (
    <div className={`w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans ${className}`}>
      {children}
    </div>
  );
}
