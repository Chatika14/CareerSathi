import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { StudentSkill, SkillGapAnalysis } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Label, Select } from '@/components/ui/Input';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Sparkles
} from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const { profile } = useAuth();
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newCategory, setNewCategory] = useState('Frontend');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newEvidence, setNewEvidence] = useState('Self-reported');
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    try {
      const [skillsData, gapData] = await Promise.all([
        api.skills.getMy(),
        api.skills.gapAnalysis(),
      ]);
      setSkills(skillsData);
      setGapAnalysis(gapData);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setAdding(true);
    try {
      await api.skills.add({
        skill_name: newSkillName.trim(),
        category: newCategory,
        proficiency: newProficiency,
        evidence_type: newEvidence,
      });
      setNewSkillName('');
      setAddOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.skills.delete(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete skill:', err);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text">Skills Gap Diagnostic</h2>
              <Badge variant="primary" className="text-[10px]">
                {gapAnalysis?.target_role || profile?.target_role || 'Target'}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live competency benchmark against market expectations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-muted/60 p-2.5 px-4 rounded-lg border border-border shrink-0">
          <div>
            <div className="flex items-center justify-between text-[10px] text-text-muted uppercase font-bold mb-1">
              <span>Match</span>
              <span className="font-extrabold text-primary">{gapAnalysis?.readiness_percentage || 0}%</span>
            </div>
            <Progress value={gapAnalysis?.readiness_percentage || 0} className="w-32" size="sm" />
          </div>

          <Button size="sm" onClick={() => setAddOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Log Skill
          </Button>
        </div>
      </div>

      {/* Competency Gap Analysis Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Framework Alignment ({gapAnalysis?.matching_skills_count || 0}/{gapAnalysis?.total_competencies || 0})
          </span>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Done
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" /> Strengthen
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-danger" /> Missing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {gapAnalysis?.skills.map((item, i) => {
            const isAcquired = item.status === 'acquired';
            const isStrengthen = item.status === 'to_strengthen';
            return (
              <Card key={i} className="p-3.5 space-y-2 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-text block">{item.skill_name}</span>
                    <span className="text-[10px] text-text-muted">{item.category}</span>
                  </div>

                  {isAcquired && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                  {isStrengthen && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
                  {!isAcquired && !isStrengthen && <XCircle className="w-4 h-4 text-danger shrink-0" />}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                  <span className="text-text-muted">Target: <strong className="text-text">{item.target_level}</strong></span>
                  <Badge variant={item.priority === 'High' ? 'danger' : 'default'} className="text-[9px]">
                    {item.priority}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Logged Skills Inventory */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-border/60 flex items-center justify-between">
          <CardTitle className="text-xs uppercase font-bold text-text-muted">
            Logged Skills Inventory ({skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {skills.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">No skills logged yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {skills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-2.5 bg-surface-muted/40 rounded-lg border border-border flex items-center justify-between group hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0 pr-1">
                    <span className="text-xs font-bold text-text block truncate">{sk.skill.name}</span>
                    <span className="text-[10px] text-primary font-medium">{sk.proficiency}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="p-1 text-text-muted hover:text-danger rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Skill Dialog */}
      <Dialog
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Log Skill"
        description="Add a competency to your profile."
      >
        <form onSubmit={handleAddSkill} className="space-y-3">
          <div>
            <Label htmlFor="skillName">Skill Name</Label>
            <Input
              id="skillName"
              required
              placeholder="e.g. React, Docker, Python"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cat">Category</Label>
              <Select id="cat" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="AI/ML">AI / ML</option>
                <option value="DevOps">Cloud / DevOps</option>
                <option value="Core">Core / DSA</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="prof">Level</Label>
              <Select
                id="prof"
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value as any)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={adding}>
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
