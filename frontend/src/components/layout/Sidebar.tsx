import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Compass,
  Map,
  FileText,
  MessageSquare,
  Mic,
  Calculator,
  Code2,
  Briefcase,
  Layers,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  UserCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, profile, logout } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
        { label: 'Profile', to: '/app/onboarding', icon: UserCheck },
      ],
    },
    {
      group: 'Guidance',
      items: [
        { label: 'Assessment', to: '/app/assessment', icon: Compass },
        { label: 'Career Paths', to: '/app/careers', icon: Layers },
        { label: 'Roadmap', to: '/app/roadmap', icon: Map },
        { label: 'Skills Gap', to: '/app/skills', icon: Award },
      ],
    },
    {
      group: 'Practice',
      items: [
        { label: 'Resume AI', to: '/app/resume', icon: FileText },
        { label: 'Assistant', to: '/app/assistant', icon: MessageSquare },
        { label: 'Interviews', to: '/app/interviews', icon: Mic },
        { label: 'Aptitude', to: '/app/practice/aptitude', icon: Calculator },
        { label: 'Coding', to: '/app/practice/coding', icon: Code2 },
      ],
    },
    {
      group: 'Jobs',
      items: [
        { label: 'Openings', to: '/app/jobs', icon: Briefcase },
        { label: 'Pipeline', to: '/app/applications', icon: Layers },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-full flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-tight text-text">CareerSaathi</span>
              <span className="text-[10px] text-primary font-bold ml-1.5 bg-primary/10 px-1.5 py-0.5 rounded">AI</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="p-3 overflow-y-auto max-h-[calc(100vh-140px)] space-y-4">
          {navGroups.map((grp) => (
            <div key={grp.group}>
              <div className="text-[10px] uppercase font-bold text-text-muted/70 tracking-widest px-3 mb-1">
                {grp.group}
              </div>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all group',
                          isActive
                            ? 'bg-primary text-white font-semibold shadow-xs'
                            : 'text-text-muted hover:text-text hover:bg-surface-muted font-medium'
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {user?.role === 'admin' && (
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] uppercase font-bold text-danger/80 tracking-widest px-3 mb-1">
                Admin
              </div>
              <NavLink
                to="/admin"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 px-3 py-2 text-xs rounded-md font-medium transition-all',
                    isActive
                      ? 'bg-danger text-white font-semibold'
                      : 'text-text-muted hover:text-danger hover:bg-danger/10'
                  )
                }
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Console</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-border bg-surface-muted/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {(profile?.full_name || user?.email || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text truncate">
                {profile?.full_name || 'Student'}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {profile?.target_role || 'Candidate'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NavLink
              to="/app/settings"
              title="Settings"
              className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-muted transition-colors"
            >
              <Settings className="w-4 h-4" />
            </NavLink>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
