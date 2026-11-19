import React from 'react';
import { Outlet, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import {
  ShieldAlert,
  Users,
  Briefcase,
  HelpCircle,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
  LogOut
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const adminLinks = [
    { label: 'Overview & Metrics', to: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', to: '/admin/users', icon: Users },
    { label: 'Manage Jobs', to: '/admin/jobs', icon: Briefcase },
    { label: 'Question Bank', to: '/admin/questions', icon: HelpCircle },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-surface border-r border-border h-full flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger" />
              <span className="font-semibold text-sm text-text">Admin Console</span>
            </div>
          </div>

          <div className="p-3">
            <Link
              to="/app/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-muted rounded-md mb-4 border border-border"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student App</span>
            </Link>

            <div className="space-y-1">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-danger-50 text-danger font-semibold'
                          : 'text-text-muted hover:text-text hover:bg-surface-muted'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border bg-surface-muted/30 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text truncate">{user.email}</p>
            <p className="text-[10px] text-danger font-medium uppercase">Admin Mode</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-text-muted hover:text-danger rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
