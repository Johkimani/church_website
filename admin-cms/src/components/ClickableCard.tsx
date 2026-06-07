import React from 'react';
import { useNavigate } from 'react-router-dom';

type ClickableCardProps = React.PropsWithChildren<{
  to?: string;
  className?: string;
  ariaLabel?: string;
  onActivate?: () => void;
}>;

export default function ClickableCard({
  to,
  className = '',
  ariaLabel,
  onActivate,
  children,
}: ClickableCardProps) {
  const navigate = useNavigate();

  const handleActivate = () => {
    onActivate?.();
    if (to) {
      navigate(to);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || 'Open details'}
      className={`group ${className} cursor-pointer transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:-translate-y-0.5 hover:shadow-xl`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
