import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { JobListing } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Briefcase, Plus, Building, MapPin, Archive } from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Job Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [empType, setEmpType] = useState('Full-time');
  const [desc, setDesc] = useState('');
  const [skillsRaw, setSkillsRaw] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [sourceName, setSourceName] = useState('Official Company Portal');
  const [isDemo, setIsDemo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await api.jobs.list();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const skillsArray = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      await api.admin.createJob({
        title,
        company,
        location,
        work_mode: workMode,
        employment_type: empType,
        description: desc,
        required_skills: skillsArray,
        application_url: appUrl,
        source_name: sourceName,
        is_demo: isDemo,
      });
      setCreateOpen(false);
      // Reset
      setTitle('');
      setCompany('');
      setLocation('');
      setDesc('');
      setSkillsRaw('');
      setAppUrl('');
      await fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to create job.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    if (!confirm('Archive this job listing? It will no longer appear in student searches.')) return;
    try {
      await api.admin.updateJob(jobId, { status: 'archived' });
      await fetchJobs();
    } catch (err) {
      console.error('Failed to archive job:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Manage Verified Job & Internship Listings</h2>
          <p className="text-xs text-text-muted">Maintain verified application links and source dates.</p>
        </div>

        <Button size="sm" onClick={() => setCreateOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Verified Opening
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <LoadingSkeleton className="h-8 w-full" />
              <LoadingSkeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted/50 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/60">
                  <tr>
                    <th className="py-3 px-6">Role / Company</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Work Mode</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-surface-muted/30">
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-text block">{job.title}</span>
                        <span className="text-[11px] text-text-muted">{job.company}</span>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">{job.location}</td>
                      <td className="py-3.5 px-4 text-text-muted">{job.work_mode}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px]">{job.employment_type}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">{job.source_name}</td>
                      <td className="py-3.5 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchiveJob(job.id)}
                          className="text-text-muted hover:text-danger text-xs"
                          leftIcon={<Archive className="w-3.5 h-3.5" />}
                        >
                          Archive
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Job Dialog */}
      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Verified Opening"
        description="Listings must contain verifiable company career URLs."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="jTitle">Role Title</Label>
              <Input
                id="jTitle"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Associate Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="jCompany">Company</Label>
              <Input
                id="jCompany"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Infosys, Razorpay"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="jLoc">Location</Label>
              <Input
                id="jLoc"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, India"
              />
            </div>

            <div>
              <Label htmlFor="jMode">Work Mode</Label>
              <Select id="jMode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="Onsite">Onsite</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="jType">Employment</Label>
              <Select id="jType" value={empType} onChange={(e) => setEmpType(e.target.value)}>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="jDesc">Job Description & Responsibilities</Label>
            <Textarea
              id="jDesc"
              required
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe core engineering duties and team objectives..."
            />
          </div>

          <div>
            <Label htmlFor="jSkills">Required Skills (comma separated)</Label>
            <Input
              id="jSkills"
              required
              value={skillsRaw}
              onChange={(e) => setSkillsRaw(e.target.value)}
              placeholder="e.g. Python, FastAPI, React, PostgreSQL"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="jUrl">Application URL</Label>
              <Input
                id="jUrl"
                required
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://company.com/careers/job-123"
              />
            </div>

            <div>
              <Label htmlFor="jSource">Verification Source</Label>
              <Input
                id="jSource"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Official Careers Portal"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="demoCheck"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="demoCheck" className="text-xs normal-case font-normal mb-0 cursor-pointer">
              Mark as sample demo listing
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={submitting}>
              Publish Opening
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
