import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ReadinessOverview } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Compass,
  Map,
  FileCheck2,
  Mic,
  Calculator,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Award,
  Layers,
  Target,
  Clock,
  TrendingUp,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [readiness, setReadiness] = useState<ReadinessOverview | null>(null);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.dashboard.getOverview();
        setReadiness(data.readiness);
        setSavedJobsCount(data.saved_jobs_count || 0);
        setAppsCount(data.applications_count || 0);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-28 w-full" />
          <LoadingSkeleton className="h-28 w-full" />
          <LoadingSkeleton className="h-28 w-full" />
          <LoadingSkeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  const overallScore = readiness?.overall_readiness_score ?? 0;

  const metricIcons: Record<string, React.ReactNode> = {
    'Profile & Goal Definition': <UserCheck className="w-4 h-4 text-primary" />,
    'Technical Skill Competencies': <Award className="w-4 h-4 text-primary" />,
    'Roadmap Milestone Progress': <Map className="w-4 h-4 text-primary" />,
    'Resume Review Score': <FileCheck2 className="w-4 h-4 text-primary" />,
    'Practice & Interview Drills': <Mic className="w-4 h-4 text-primary" />,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text">
                {profile?.full_name || 'Candidate'}
              </h2>
              <Badge variant="primary" className="text-[10px]">
                {profile?.target_role || 'Target Role Pending'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {profile?.weekly_hours || 10}h / week
              </span>
              <span>·</span>
              <span>Graduation: {profile?.graduation_year || 2026}</span>
            </div>
          </div>
        </div>

        {/* Big Preparation Gauge */}
        <div className="flex items-center gap-4 bg-surface-muted/60 px-5 py-3 rounded-lg border border-border shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Preparation</div>
            <div className="text-2xl font-extrabold text-text tracking-tight">{overallScore}%</div>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Quick Launch Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/app/roadmap"
          className="p-4 bg-surface hover:border-primary/50 rounded-xl border border-border shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-text block">Roadmap</span>
              <span className="text-[10px] text-text-muted">Milestones</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </Link>

        <Link
          to="/app/resume"
          className="p-4 bg-surface hover:border-primary/50 rounded-xl border border-border shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-text block">Resume</span>
              <span className="text-[10px] text-text-muted">Score & Tips</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </Link>

        <Link
          to="/app/interviews"
          className="p-4 bg-surface hover:border-primary/50 rounded-xl border border-border shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-text block">Interviews</span>
              <span className="text-[10px] text-text-muted">Mock Rounds</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </Link>

        <Link
          to="/app/practice/aptitude"
          className="p-4 bg-surface hover:border-primary/50 rounded-xl border border-border shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-text block">Practice</span>
              <span className="text-[10px] text-text-muted">Aptitude & DSA</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </Link>
      </div>

      {/* Recommended Actions Chips */}
      {readiness && readiness.next_actions && readiness.next_actions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Recommended Next Steps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {readiness.next_actions.map((action, i) => (
              <Link
                key={i}
                to={action.link}
                className="p-3 bg-surface hover:bg-surface-muted/60 border border-border rounded-lg transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-text truncate group-hover:text-primary">
                    {action.title}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Readiness Breakdown
          </span>
          <span className="text-xs font-semibold text-primary">
            {readiness?.rating_label || 'In Progress'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {readiness?.metrics.map((m, i) => (
            <Card key={i} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metricIcons[m.label] || <Award className="w-4 h-4 text-primary" />}
                  <span className="text-xs font-bold text-text truncate">{m.label}</span>
                </div>
                <span className="text-xs font-extrabold text-primary">{m.score}%</span>
              </div>
              <Progress value={m.score} size="sm" />
              <div className="text-[11px] text-text-muted truncate">
                {m.action_item}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Stats: Pipeline & Saved */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/app/jobs"
          className="p-5 bg-surface hover:border-primary/40 rounded-xl border border-border shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-surface-muted flex items-center justify-center text-text">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-text">{savedJobsCount}</div>
              <div className="text-xs text-text-muted">Saved Opportunities</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </Link>

        <Link
          to="/app/applications"
          className="p-5 bg-surface hover:border-primary/40 rounded-xl border border-border shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-surface-muted flex items-center justify-center text-text">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-text">{appsCount}</div>
              <div className="text-xs text-text-muted">Active Pipeline Applications</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
};
