import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  indicatorClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName,
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div
      className={clsx(
        'w-full bg-surface-muted overflow-hidden rounded-full border border-border/40',
        heights[size],
        className
      )}
    >
      <div
        className={clsx(
          'h-full bg-primary transition-all duration-300 ease-out rounded-full',
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
