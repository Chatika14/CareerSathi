import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Roadmap, RoadmapTask } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Map,
  CheckCircle2,
  Circle,
  ExternalLink,
  Edit3,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronRight,
  Target
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { profile } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  const [generateOpen, setGenerateOpen] = useState(false);
  const [genRole, setGenRole] = useState(profile?.target_role || 'Full-Stack Developer');
  const [genHours, setGenHours] = useState(profile?.weekly_hours || 10);
  const [generating, setGenerating] = useState(false);

  const [activeTask, setActiveTask] = useState<RoadmapTask | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const data = await api.roadmaps.getActive();
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleToggleTaskStatus = async (task: RoadmapTask) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      if (roadmap) {
        const updatedPhases = roadmap.phases.map((p) => {
          if (p.id !== task.phase_id) return p;
          return {
            ...p,
            tasks: p.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus as any } : t)),
          };
        });

        let total = 0;
        let completed = 0;
        updatedPhases.forEach((p) => {
          p.tasks.forEach((t) => {
            total++;
            if (t.status === 'completed') completed++;
          });
        });

        setRoadmap({
          ...roadmap,
          phases: updatedPhases,
          total_tasks: total,
          completed_tasks: completed,
          progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }

      await api.roadmaps.updateTask(task.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchRoadmap();
    }
  };

  const handleSaveNotes = async () => {
    if (!activeTask) return;
    setSavingNotes(true);
    try {
      await api.roadmaps.updateTask(activeTask.id, { notes: taskNotes });
      if (roadmap) {
        const updatedPhases = roadmap.phases.map((p) => {
          if (p.id !== activeTask.phase_id) return p;
          return {
            ...p,
            tasks: p.tasks.map((t) => (t.id === activeTask.id ? { ...t, notes: taskNotes } : t)),
          };
        });
        setRoadmap({ ...roadmap, phases: updatedPhases });
      }
      setActiveTask(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      const newRoadmap = await api.roadmaps.generate({
        target_role: genRole,
        weekly_hours: Number(genHours),
        preferred_learning_style: profile?.preferred_learning_style || 'Hands-on projects',
      });
      setRoadmap(newRoadmap);
      setGenerateOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          icon={Map}
          title="No Active Roadmap"
          description="Build your structured learning milestones based on your target role."
          actionLabel="Generate Roadmap"
          onAction={() => setGenerateOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text">{roadmap.title}</h2>
              <Badge variant="outline" className="text-[10px]">
                {roadmap.completed_tasks} / {roadmap.total_tasks}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{roadmap.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-muted/60 p-2.5 px-4 rounded-lg border border-border shrink-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-text-muted uppercase font-bold mb-1">
              <span>Progress</span>
              <span className="font-extrabold text-primary">{roadmap.progress_percentage}%</span>
            </div>
            <Progress value={roadmap.progress_percentage} className="w-32" size="sm" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGenerateOpen(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Revise
          </Button>
        </div>
      </div>

      {/* Phases Accordion */}
      <div className="space-y-3">
        {roadmap.phases.map((phase) => {
          const isCollapsed = collapsedPhases[phase.id];
          const phaseCompleted = phase.tasks.filter((t) => t.status === 'completed').length;

          return (
            <Card key={phase.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="w-full p-4 bg-surface-muted/40 hover:bg-surface-muted/70 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-text block">{phase.title}</span>
                    <span className="text-[11px] text-text-muted">{phase.description}</span>
                  </div>
                </div>

                <Badge variant={phaseCompleted === phase.tasks.length ? 'success' : 'default'} className="text-[10px]">
                  {phaseCompleted} / {phase.tasks.length}
                </Badge>
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-border/60">
                  {phase.tasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 px-4 flex items-start justify-between gap-3 transition-colors ${
                          isDone ? 'bg-surface/50' : 'bg-surface'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(task)}
                            className="mt-0.5 text-text-muted hover:text-primary transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <span
                              className={`text-xs font-semibold block ${
                                isDone ? 'line-through text-text-muted' : 'text-text'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {task.notes && (
                              <div className="mt-1.5 p-2 bg-surface-muted rounded text-[11px] text-text border border-border/50">
                                <span className="font-bold text-[10px] text-text-muted block">Notes:</span>
                                {task.notes}
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimated_hours}h
                              </span>
                              {task.resource_url && (
                                <a
                                  href={task.resource_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline font-medium"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Docs
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveTask(task);
                            setTaskNotes(task.notes || '');
                          }}
                          className="shrink-0 p-1.5 text-text-muted hover:text-text"
                          title="Notes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Revise Dialog */}
      <Dialog
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Revise Roadmap"
        description="Re-generate milestones matching your weekly schedule."
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="regenRole">Role</Label>
            <Input
              id="regenRole"
              value={genRole}
              onChange={(e) => setGenRole(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="regenHours">Hours / Week</Label>
            <Select id="regenHours" value={genHours} onChange={(e) => setGenHours(Number(e.target.value))}>
              <option value={6}>6 hours</option>
              <option value={10}>10 hours (Standard)</option>
              <option value={15}>15 hours</option>
              <option value={20}>20+ hours</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleGenerateRoadmap} isLoading={generating}>
              Generate
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog
        isOpen={!!activeTask}
        onClose={() => setActiveTask(null)}
        title="Personal Study Notes"
        description={activeTask?.title || ''}
      >
        <div className="space-y-3">
          <Textarea
            rows={4}
            value={taskNotes}
            onChange={(e) => setTaskNotes(e.target.value)}
            placeholder="Key concepts or repos..."
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setActiveTask(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNotes} isLoading={savingNotes}>
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
