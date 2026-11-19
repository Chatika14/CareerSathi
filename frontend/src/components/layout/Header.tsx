import React from 'react';
import { Menu, Bell, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname.includes('/app/dashboard')) return 'Dashboard';
    if (pathname.includes('/app/onboarding')) return 'Profile';
    if (pathname.includes('/app/assessment')) return 'Assessment';
    if (pathname.includes('/app/careers')) return 'Career Paths';
    if (pathname.includes('/app/roadmap')) return 'Roadmap';
    if (pathname.includes('/app/skills')) return 'Skills & Gaps';
    if (pathname.includes('/app/resume')) return 'Resume Review';
    if (pathname.includes('/app/assistant')) return 'Career Assistant';
    if (pathname.includes('/app/interviews')) return 'Mock Interviews';
    if (pathname.includes('/app/practice/aptitude')) return 'Aptitude Practice';
    if (pathname.includes('/app/practice/coding')) return 'Coding Bank';
    if (pathname.includes('/app/jobs')) return 'Verified Openings';
    if (pathname.includes('/app/applications')) return 'Application Pipeline';
    if (pathname.includes('/app/notifications')) return 'Notifications';
    if (pathname.includes('/app/settings')) return 'Settings';
    if (pathname.includes('/admin')) return 'Admin Console';
    return 'CareerSaathi';
  };

  return (
    <header className="h-16 bg-surface border-b border-border px-4 lg:px-8 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-text-muted hover:text-text rounded-md hover:bg-surface-muted"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-text tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted bg-surface-muted px-3 py-1 rounded-full border border-border">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">Active Rubrics</span>
        </div>

        {user?.role === 'admin' && (
          <Badge variant="danger" className="text-[10px]">
            Admin
          </Badge>
        )}

        <Link
          to="/app/notifications"
          className="p-2 text-text-muted hover:text-text rounded-md hover:bg-surface-muted relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Link>
      </div>
    </header>
  );
};
