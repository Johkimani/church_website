import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function ContentSection({ children, className = '' }: Props) {
  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
