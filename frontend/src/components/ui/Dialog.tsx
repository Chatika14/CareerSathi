import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full bg-surface border border-border rounded-lg shadow-xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150',
          maxW[maxWidth]
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h3 className="text-base font-semibold text-text">{title}</h3>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1 rounded-sm hover:bg-surface-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};
