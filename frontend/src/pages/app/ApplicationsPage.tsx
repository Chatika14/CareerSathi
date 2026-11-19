import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { JobApplication } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Select, Input, Label } from '@/components/ui/Input';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Layers,
  Building,
  MapPin,
  ExternalLink,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Edit status modal
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [editStatus, setEditStatus] = useState('applied');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchApplications = async () => {
    try {
      const data = await api.applications.list();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdate = async () => {
    if (!editingApp) return;
    setSaving(true);
    try {
      await api.applications.update(editingApp.id, {
        status: editStatus,
        notes: editNotes,
      });
      setEditingApp(null);
      await fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to update application.');
    } finally {
      setSaving(false);
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'offer': return 'success';
      case 'interview': return 'primary';
      case 'assessment': return 'warning';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text">Job & Internship Application Pipeline</h2>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Track and manage your recruiting pipeline across assessment, interview rounds, and offers in one organized dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs w-44"
          >
            <option value="all">All Stages ({applications.length})</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="assessment">Assessment</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Declined</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Applications Recorded in this Stage"
          description="Browse verified job openings and click 'Track' to log your application status here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id} className="hover:border-border transition-colors">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-text">{app.job.title}</span>
                    <Badge variant={statusBadgeVariant(app.status)} className="capitalize text-[10px]">
                      {app.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-medium text-text">
                      <Building className="w-3.5 h-3.5" />
                      {app.job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {app.job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>

                  {app.notes && (
                    <div className="mt-1 text-[11px] text-text-muted bg-surface-muted/50 p-2 rounded border border-border/40">
                      <strong>Notes:</strong> {app.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingApp(app);
                      setEditStatus(app.status);
                      setEditNotes(app.notes || '');
                    }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Update Stage
                  </Button>

                  <a href={app.job.application_url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost" title="Open Job Portal">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Stage Dialog */}
      <Dialog
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        title="Update Application Stage"
        description={editingApp ? `${editingApp.job.title} at ${editingApp.job.company}` : ''}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="stage">Current Stage</Label>
            <Select id="stage" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="saved">Saved / Bookmarked</option>
              <option value="applied">Application Submitted</option>
              <option value="assessment">Online Assessment Scheduled</option>
              <option value="interview">Interview Rounds Scheduled</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Application Declined</option>
              <option value="withdrawn">Withdrawn</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes / Next Steps</Label>
            <Input
              id="notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Cleared round 1 DSA. System design scheduled for Friday."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setEditingApp(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
