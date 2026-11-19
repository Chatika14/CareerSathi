import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Resume, ResumeAnalysis } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  FileText,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const ResumePage: React.FC = () => {
  const { profile } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    try {
      const list = await api.resumes.list();
      setResumes(list);
      if (list.length > 0 && !activeResume) {
        setActiveResume(list[0]);
      } else if (list.length === 0) {
        setActiveResume(null);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF resume files are supported.');
      return;
    }

    setUploading(true);
    try {
      const created = await api.resumes.upload(file, profile?.target_role || 'Software Engineer');
      setActiveResume(created);
      await fetchResumes();
    } catch (err: any) {
      alert(err.message || 'Failed to upload and analyze resume.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this resume and its analysis?')) return;
    try {
      await api.resumes.delete(id);
      if (activeResume?.id === id) {
        setActiveResume(null);
      }
      await fetchResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-28 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  const analysis: ResumeAnalysis | undefined = activeResume?.latest_analysis;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload & Overview Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text">AI Resume Review & Diagnostic</h2>
          </div>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed">
            Private, secure PDF resume analysis evaluating structural clarity, metric quantification, technical keyword relevance, and actionable rewrite recommendations.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          <Button
            size="md"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Resume PDF
          </Button>
        </div>
      </div>

      {/* Disclaimers & Security */}
      <div className="p-3 bg-surface-muted/60 rounded-md border border-border text-[11px] text-text-muted flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Data Privacy:</strong> Your resume is encrypted and stored in private storage. It is processed solely to generate your feedback report.
        </span>
      </div>

      {/* Main Analysis Display */}
      {activeResume && analysis ? (
        <div className="space-y-6">
          {/* Score Header Card */}
          <Card className="border-primary/20 bg-primary-50/10">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary" className="text-[10px]">
                      {activeResume.original_filename}
                    </Badge>
                    <span className="text-[11px] text-text-muted">
                      Target Role: {analysis.target_role || 'General Software Engineering'}
                    </span>
                  </div>
                  <CardTitle className="text-lg">CareerSaathi Resume Review Score</CardTitle>
                  <CardDescription className="text-xs">
                    Evaluated against placement industry rubrics (Not an ATS result or hiring prediction)
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3 bg-surface p-3 rounded-md border border-border shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted block uppercase font-medium">Review Score</span>
                    <span className="text-2xl font-bold text-primary">{Math.round(analysis.review_score)} / 100</span>
                  </div>
                  <button
                    onClick={() => handleDeleteResume(activeResume.id)}
                    className="p-2 text-text-muted hover:text-danger rounded hover:bg-danger-50 transition-colors"
                    title="Delete resume file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardHeader>

            {/* Score Breakdown Bar Items */}
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {Object.entries(analysis.score_breakdown || {}).map(([metric, score]) => (
                  <div key={metric} className="p-3 bg-surface rounded-md border border-border/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="capitalize text-text-muted">{metric.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-text">{Math.round(score)}%</span>
                    </div>
                    <Progress value={score} size="sm" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Missing Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                  <CardTitle className="text-xs uppercase tracking-wider text-success-600">
                    Demonstrated Strengths
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <ul className="space-y-2 text-xs text-text-muted">
                  {analysis.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-success-50/40 p-2.5 rounded border border-success/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-600 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning-600" />
                  <CardTitle className="text-xs uppercase tracking-wider text-warning-600">
                    Missing Elements & Weaknesses
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <ul className="space-y-2 text-xs text-text-muted">
                  {analysis.missing_elements?.map((elem, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-warning-50/40 p-2.5 rounded border border-warning/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning-600 mt-1.5 shrink-0" />
                      <span>{elem}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Actionable Rewrite Suggestions */}
          <Card>
            <CardHeader className="py-4 px-6 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Actionable Rewrite Recommendations</CardTitle>
              </div>
              <CardDescription>
                Specific structural and bullet-point optimizations to strengthen placement appeal
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {analysis.actionable_suggestions?.map((item, idx) => (
                <div key={idx} className="p-4 bg-surface-muted/40 rounded-md border border-border space-y-1.5">
                  <div className="flex items-center gap-2">
                    {item.section && <Badge variant="primary" className="text-[10px]">{item.section}</Badge>}
                    <span className="text-xs font-semibold text-text">{item.issue || 'Optimization Area'}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed pl-1">
                    <strong>Suggestion:</strong> {item.suggestion}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="py-12 bg-surface rounded-lg border border-dashed border-border text-center p-8 space-y-3">
          <UploadCloud className="w-10 h-10 text-primary mx-auto" />
          <h3 className="text-sm font-semibold text-text">No Resume Uploaded Yet</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
            Upload your resume PDF (maximum 5MB) to receive instant section parsing, bullet-point impact diagnostics, and actionable rewrite recommendations.
          </p>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
          >
            Select PDF File
          </Button>
        </div>
      )}
    </div>
  );
};
