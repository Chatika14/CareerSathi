import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide';

  const variants = {
    default: 'bg-surface-muted text-text-muted border border-border/80',
    primary: 'bg-primary-50 text-primary border border-primary/20',
    success: 'bg-success-50 text-success-600 border border-success/20',
    warning: 'bg-warning-50 text-warning-600 border border-warning/20',
    danger: 'bg-danger-50 text-danger-600 border border-danger/20',
    outline: 'bg-transparent text-text-muted border border-border',
  };

  return (
    <span className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
