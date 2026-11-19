import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PracticeQuestion } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const AptitudePage: React.FC = () => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [attemptResults, setAttemptResults] = useState<Record<string, any>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      const data = await api.practice.getQuestions({ question_type: 'aptitude' });
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load aptitude questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSelectOption = (qId: string, opt: string) => {
    if (attemptResults[qId]) return; // already evaluated
    setSelectedAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleCheckAnswer = async (qId: string) => {
    const ans = selectedAnswers[qId];
    if (!ans) return;

    setSubmittingId(qId);
    try {
      const res = await api.practice.submitAttempt(qId, ans);
      setAttemptResults((prev) => ({ ...prev, [qId]: res }));
    } catch (err: any) {
      alert(err.message || 'Failed to submit attempt.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-56 w-full" />
        <LoadingSkeleton className="h-56 w-full" />
      </div>
    );
  }

  const solvedCount = Object.keys(attemptResults).length;
  const correctCount = Object.values(attemptResults).filter((r: any) => r.is_correct).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Calculator className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text">Quantitative & Logical Practice</h2>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Curated problem sets commonly featured in on-campus placement tests and company screening assessments.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-muted/60 p-3 rounded-md border border-border shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-text-muted block uppercase font-medium">Session Score</span>
            <span className="text-base font-bold text-text">
              {correctCount} / {questions.length} Correct
            </span>
          </div>
          <Badge variant={correctCount > 0 ? 'success' : 'default'}>
            {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
          </Badge>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const result = attemptResults[q.id];
          const chosen = selectedAnswers[q.id];

          return (
            <Card key={q.id}>
              <CardHeader className="py-3 px-5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-[10px]">{q.topic}</Badge>
                    <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                  </div>
                  <span className="text-[10px] text-text-muted font-medium">Question {idx + 1} of {questions.length}</span>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 leading-relaxed">{q.prompt}</CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-2">
                {q.options?.map((opt, oIdx) => {
                  const isSelected = chosen === opt;
                  let optStyle = 'border-border bg-surface text-text-muted hover:bg-surface-muted';

                  if (result) {
                    if (opt === result.correct_answer) {
                      optStyle = 'border-success bg-success-50 text-success-600 font-semibold';
                    } else if (isSelected && !result.is_correct) {
                      optStyle = 'border-danger bg-danger-50 text-danger font-semibold';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-primary bg-primary-50 text-text font-medium';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`w-full p-3 rounded-md border text-left text-xs transition-colors flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {result && opt === result.correct_answer && (
                        <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0 ml-2" />
                      )}
                      {result && isSelected && !result.is_correct && (
                        <XCircle className="w-4 h-4 text-danger shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}

                {/* Explanation Box when answered */}
                {result && (
                  <div className="mt-4 p-4 bg-surface-muted/60 rounded-md border border-border/70 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-text">
                      <Lightbulb className="w-3.5 h-3.5 text-primary" />
                      <span>Explanation:</span>
                    </div>
                    <p className="text-text-muted leading-relaxed pl-1">{result.explanation}</p>
                  </div>
                )}
              </CardContent>

              {!result && (
                <CardFooter className="py-2.5 px-5 border-t border-border/60 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!chosen}
                    isLoading={submittingId === q.id}
                    onClick={() => handleCheckAnswer(q.id)}
                  >
                    Check Answer
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
