import React from 'react';

interface ExplicitBadgeProps {
  className?: string;
}

export const ExplicitBadge: React.FC<ExplicitBadgeProps> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center bg-zinc-700/80 text-zinc-300 font-bold text-[9px] px-1 py-0.5 rounded leading-none select-none tracking-tighter ${className}`}
      title="Explicit Content"
    >
      E
    </span>
  );
};

export default ExplicitBadge;
