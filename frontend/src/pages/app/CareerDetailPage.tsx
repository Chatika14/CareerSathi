import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { CareerPathDetail } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Layers,
  ArrowLeft,
  Map,
  CheckCircle2,
  FolderGit2,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CareerDetailPage: React.FC = () => {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();
  const [career, setCareer] = useState<CareerPathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!careerId) return;
      try {
        const data = await api.careers.get(careerId);
        setCareer(data);
      } catch (err) {
        console.error('Failed to load career detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [careerId]);

  const handleStartRoadmap = async () => {
    if (!career) return;
    setGenerating(true);
    try {
      await api.roadmaps.generate({
        target_role: career.title,
        weekly_hours: 10,
        preferred_learning_style: 'Hands-on projects',
      });
      navigate('/app/roadmap');
    } catch (err: any) {
      alert(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-10 w-48" />
        <LoadingSkeleton className="h-44 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-text-muted">Career path not found.</p>
        <Link to="/app/careers" className="inline-block mt-3">
          <Button variant="outline" size="sm">Back to Career Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/app/careers">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Career Paths
        </Button>
      </Link>

      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary">{career.category}</Badge>
            <Badge variant="outline">Curated Framework</Badge>
          </div>
          <h2 className="text-2xl font-bold text-text">{career.title}</h2>
          <p className="text-xs text-text-muted mt-2 max-w-2xl leading-relaxed">{career.overview}</p>
        </div>

        <Button
          size="md"
          onClick={handleStartRoadmap}
          isLoading={generating}
          leftIcon={<Map className="w-4 h-4" />}
          className="shrink-0"
        >
          Generate My Roadmap
        </Button>
      </div>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Typical Professional Responsibilities</CardTitle>
          <CardDescription>What an engineer in this role owns day to day</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-muted">
            {career.responsibilities?.map((resp, i) => (
              <li key={i} className="flex items-start gap-2 bg-surface-muted/40 p-2.5 rounded-md border border-border/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Competency Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Core Competency Framework</CardTitle>
          <CardDescription>Target proficiency levels expected for campus placements and junior hiring</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {career.competencies?.map((comp, i) => (
              <div key={i} className="p-3 bg-surface-muted/50 rounded-md border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text">{comp.skill_name}</span>
                  <Badge variant={comp.priority === 'High' ? 'danger' : 'default'} className="text-[10px]">
                    {comp.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
                  <span>Category: {comp.category}</span>
                  <Badge variant="primary" className="text-[10px]">{comp.target_level}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Sequence & Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sequence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Suggested Learning Sequence</CardTitle>
            <CardDescription>Foundations to production readiness</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {career.learning_sequence?.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-muted/30 rounded-md border border-border/60">
                <div className="w-6 h-6 rounded-full bg-primary-50 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div>
                  <span className="text-xs font-semibold text-text block">{step.phase}</span>
                  <span className="text-[11px] text-text-muted mt-0.5 block">{step.focus}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Portfolio Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Example Portfolio Projects</CardTitle>
            <CardDescription>Standout projects that demonstrate competencies</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {career.portfolio_projects?.map((proj, i) => (
              <div key={i} className="p-3 bg-surface-muted/30 rounded-md border border-border/60">
                <div className="flex items-center gap-2 mb-1">
                  <FolderGit2 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-text">{proj.title}</span>
                </div>
                <span className="text-[11px] text-text-muted block mt-1">Tech Stack: {proj.tech}</span>
              </div>
            ))}

            {career.interview_topics && career.interview_topics.length > 0 && (
              <div className="pt-3 border-t border-border/60">
                <span className="text-xs font-semibold text-text block mb-2">Common Interview Themes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {career.interview_topics.map((top, idx) => (
                    <Badge key={idx} variant="default" className="text-[10px]">
                      {top}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
