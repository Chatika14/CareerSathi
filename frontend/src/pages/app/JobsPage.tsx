import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { JobListing } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Briefcase,
  Search,
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Building,
  Plus
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // Track application modal
  const [trackOpen, setTrackOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [appStatus, setAppStatus] = useState('applied');
  const [appNotes, setAppNotes] = useState('');
  const [tracking, setTracking] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await api.jobs.list({
        search: search || undefined,
        work_mode: workMode || undefined,
        employment_type: employmentType || undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, workMode, employmentType]);

  const handleToggleSave = async (jobId: string) => {
    try {
      const res = await api.jobs.toggleSave(jobId);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_saved: res.saved } : j))
      );
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const handleTrackApplication = async () => {
    if (!selectedJob) return;
    setTracking(true);
    try {
      await api.applications.create({
        job_id: selectedJob.id,
        status: appStatus,
        notes: appNotes,
      });
      setTrackOpen(false);
      setAppNotes('');
      await fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to record application.');
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-text">Verified Opportunities & Openings</h2>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Open campus drives, early-career roles, and verified internships. Openings are mapped against your logged skills to display transparent Profile Alignment indicators.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface p-4 rounded-lg border border-border shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <Input
            placeholder="Search by role or company..."
            className="pl-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <Select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="text-xs"
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </Select>
        </div>

        <div>
          <Select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="text-xs"
          >
            <option value="">All Employment Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
          </Select>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-32 w-full" />
          <LoadingSkeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-text">{job.title}</span>
                    {job.is_demo && (
                      <Badge variant="warning" className="text-[10px]">Demo Listing</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">{job.employment_type}</Badge>
                    <Badge variant="default" className="text-[10px]">{job.work_mode}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-medium text-text">
                      <Building className="w-3.5 h-3.5" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="text-[11px]">
                      Source: {job.source_name}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.required_skills?.map((sk, i) => (
                      <Badge key={i} variant="primary" className="text-[10px]">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                  {/* Alignment Indicator */}
                  {job.profile_alignment !== undefined && (
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-text-muted block uppercase">Profile Alignment</span>
                      <span className="text-xs font-bold text-primary">
                        {job.profile_alignment}% Match
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSave(job.id)}
                      className={`p-2 rounded-md border transition-colors ${
                        job.is_saved
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-border text-text-muted hover:text-text hover:bg-surface-muted'
                      }`}
                      title={job.is_saved ? 'Saved' : 'Save job'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedJob(job);
                        setTrackOpen(true);
                      }}
                    >
                      {job.application_status ? `Status: ${job.application_status}` : 'Track'}
                    </Button>

                    <a href={job.application_url} target="_blank" rel="noreferrer">
                      <Button size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Apply
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Track Application Dialog */}
      <Dialog
        isOpen={trackOpen}
        onClose={() => setTrackOpen(false)}
        title="Record in Application Pipeline"
        description={selectedJob ? `${selectedJob.title} at ${selectedJob.company}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1">
              Application Stage
            </label>
            <Select value={appStatus} onChange={(e) => setAppStatus(e.target.value)}>
              <option value="saved">Saved / Bookmarked</option>
              <option value="applied">Application Submitted</option>
              <option value="assessment">Online Assessment Scheduled</option>
              <option value="interview">Interview Rounds Scheduled</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Application Declined</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1">
              Personal Notes
            </label>
            <Input
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              placeholder="e.g. Applied through portal with Referral ID #4812"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setTrackOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleTrackApplication} isLoading={tracking}>
              Save to Applications
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
