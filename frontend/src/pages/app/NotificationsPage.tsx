import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { NotificationItem } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell, CheckCheck, CheckCircle2, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <LoadingSkeleton className="h-20 w-full" />
        <LoadingSkeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text">Notifications & Milestones</h2>
          </div>
          <p className="text-xs text-text-muted">
            Updates regarding roadmap progress, assessments, and interview feedback.
          </p>
        </div>

        {notifications.some((n) => !n.read_at) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} leftIcon={<CheckCheck className="w-3.5 h-3.5" />}>
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Yet"
          description="You will receive alerts here when you achieve roadmap milestones or complete assessment reviews."
        />
      ) : (
        <Card className="divide-y divide-border/60">
          {notifications.map((item) => {
            const isRead = !!item.read_at;
            return (
              <div
                key={item.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  isRead ? 'bg-surface' : 'bg-primary-50/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text">{item.title}</span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{item.body}</p>
                  <span className="text-[10px] text-text-muted block pt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                {!isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(item.id)}
                    className="shrink-0 text-text-muted hover:text-text"
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};
