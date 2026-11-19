import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  ShieldAlert,
  Users,
  Briefcase,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Clock
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.admin.overview();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-28 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const logs = data?.recent_ai_activity || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-danger" />
            <h2 className="text-xl font-bold text-text">Platform Administration & Diagnostics</h2>
          </div>
          <p className="text-xs text-text-muted">
            Manage curated content, review system usage logs, and monitor student accounts.
          </p>
        </div>

        <Badge variant="danger" className="text-xs">
          Role-Enforced Endpoint
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase">Total Users</span>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-text">{stats.total_users || 0}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Registered accounts</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase">Active Jobs</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-text">{stats.total_jobs || 0}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Verified listings</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase">Question Bank</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-text">{stats.total_questions || 0}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Aptitude & Coding</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase">AI Workflows</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-primary">{stats.total_ai_calls || 0}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">Execution runs logged</span>
        </Card>
      </div>

      {/* Recent AI Usage Logs */}
      <Card>
        <CardHeader className="py-4 px-6 border-b border-border/60">
          <CardTitle className="text-sm font-semibold">Recent AI & Heuristic Service Executions</CardTitle>
          <CardDescription>
            Audit log of resume analysis, chat requests, roadmap generation, and mock rubric evaluations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">No AI usage recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted/50 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/60">
                  <tr>
                    <th className="py-3 px-6">Feature</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-surface-muted/30">
                      <td className="py-3 px-6 font-semibold text-text">{log.feature}</td>
                      <td className="py-3 px-4 text-text-muted">{log.provider}</td>
                      <td className="py-3 px-4 text-text-muted">{log.latency_ms} ms</td>
                      <td className="py-3 px-4">
                        <Badge variant={log.status === 'success' ? 'success' : 'danger'} className="text-[10px]">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-right text-text-muted">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
