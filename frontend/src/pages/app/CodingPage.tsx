import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PracticeQuestion } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Code2,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileCode,
  Sparkles
} from 'lucide-react';

export const CodingPage: React.FC = () => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditorial, setShowEditorial] = useState(false);

  useEffect(() => {
    const fetchCoding = async () => {
      try {
        const data = await api.practice.getQuestions({ question_type: 'coding' });
        setQuestions(data);
        if (data.length > 0) {
          setSelectedQuestion(data[0]);
        }
      } catch (err) {
        console.error('Failed to load coding questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoding();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-text">Curated Coding Question Bank</h2>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          High-frequency data structure and algorithm problems asked during campus technical coding rounds. Review problem definitions, constraints, and algorithmic trade-offs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Question Selector List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block px-1">
            Problem Bank ({questions.length})
          </span>
          {questions.map((q) => {
            const isSelected = selectedQuestion?.id === q.id;
            return (
              <div
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setShowEditorial(false);
                }}
                className={`p-3.5 rounded-md border text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary-50 border-primary text-primary font-semibold'
                    : 'bg-surface border-border text-text hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={q.difficulty === 'Easy' ? 'success' : 'warning'} className="text-[10px]">
                    {q.difficulty}
                  </Badge>
                  <span className="text-[10px] text-text-muted">{q.topic}</span>
                </div>
                <span className="text-xs font-semibold block">{q.title}</span>
              </div>
            );
          })}
        </div>

        {/* Problem Detail & Editorial */}
        <div className="md:col-span-2">
          {selectedQuestion ? (
            <Card>
              <CardHeader className="py-4 px-6 border-b border-border/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{selectedQuestion.topic}</Badge>
                    <Badge variant="outline">{selectedQuestion.difficulty}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant={showEditorial ? 'primary' : 'outline'}
                    onClick={() => setShowEditorial(!showEditorial)}
                    leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                  >
                    {showEditorial ? 'Hide Editorial' : 'View Editorial & Solution'}
                  </Button>
                </div>
                <CardTitle className="text-base font-semibold">{selectedQuestion.title}</CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Problem Prompt */}
                <div>
                  <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-1">
                    Problem Statement
                  </span>
                  <div className="text-xs text-text leading-relaxed whitespace-pre-wrap bg-surface-muted/30 p-4 rounded-md border border-border/60">
                    {selectedQuestion.prompt}
                  </div>
                </div>

                {/* Constraints */}
                {selectedQuestion.constraints && (
                  <div>
                    <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-1">
                      Constraints
                    </span>
                    <pre className="text-[11px] font-mono text-text-muted bg-surface-muted/50 p-3 rounded-md border border-border/60 whitespace-pre-wrap">
                      {selectedQuestion.constraints}
                    </pre>
                  </div>
                )}

                {/* Editorial and Solution */}
                {showEditorial && (
                  <div className="p-4 bg-primary-50/20 rounded-md border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary">Editorial & Complexity Analysis</span>
                    </div>

                    <div className="text-xs text-text leading-relaxed space-y-2">
                      <p>
                        <strong>Optimal Approach:</strong> {selectedQuestion.correct_answer}
                      </p>
                      <p className="text-text-muted leading-relaxed">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <p className="text-xs text-text-muted text-center py-12">Select a question to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
