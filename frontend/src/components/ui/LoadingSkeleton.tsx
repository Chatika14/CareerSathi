import React from 'react';
import { clsx } from 'clsx';

export const LoadingSkeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={clsx('animate-pulse bg-surface-muted rounded-md', className)}
      {...props}
    />
  );
};
