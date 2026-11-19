import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Compass, CheckCircle2, ArrowRight, Sparkles, AlertCircle, Info, RefreshCw } from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
}

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const qList = await api.assessments.getQuestions();
        setQuestions(qList);
        // Pre-select first options for easy test flow
        const initial: Record<string, string> = {};
        qList.forEach((q: Question) => {
          if (q.options.length > 0) initial[q.id] = q.options[0];
        });
        setSelectedAnswers(initial);
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleSelect = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.assessments.submit(selectedAnswers);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Guidance Notice */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text">Career Guidance Assessment</h2>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          This self-assessment evaluates your work activity preferences, current tech comfort, and project interests to suggest curated technical career directions.
        </p>
        <div className="mt-3 p-2.5 bg-surface-muted rounded-md text-[11px] text-text-muted flex items-center gap-2 border border-border/60">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Label: Guidance Assessment. Recommendations are exploratory suggestions based on self-reported inputs.</span>
        </div>
      </div>

      {/* Results View */}
      {result ? (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary-50/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <CardTitle>Recommended Career Directions</CardTitle>
              </div>
              <CardDescription>{result.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendations?.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-surface rounded-md border border-border flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-text">{rec.title}</span>
                        <Badge variant="success">{rec.alignment_score}% Alignment</Badge>
                      </div>
                      <Badge variant="primary" className="text-[10px] mb-2">{rec.confidence_label}</Badge>

                      <div className="text-[11px] text-text-muted space-y-1">
                        <p className="font-semibold text-text">Why this fits:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {rec.reasoning?.map((r: string, rIdx: number) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      {rec.skills_to_develop && rec.skills_to_develop.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/60 text-[11px]">
                          <span className="text-text-muted block font-medium mb-1">Key skills to develop:</span>
                          <div className="flex flex-wrap gap-1">
                            {rec.skills_to_develop.map((sk: string, sIdx: number) => (
                              <Badge key={sIdx} variant="default" className="text-[10px]">{sk}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => navigate(`/app/careers/${rec.career_slug}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Explore Career Path
                    </Button>
                  </div>
                ))}
              </div>

              {result.limitations && (
                <div className="p-3 bg-surface rounded border border-border/60 text-[11px] text-text-muted">
                  <p className="font-semibold text-text mb-1">Assessment Limitations:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.limitations.map((lim: string, lIdx: number) => (
                      <li key={lIdx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={() => setResult(null)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retake Assessment
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        /* Questions Questionnaire */
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader className="py-3 px-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {q.category} · Question {idx + 1} of {questions.length}
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold mt-1">{q.question}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[q.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelect(q.id, opt)}
                      className={`w-full p-3 rounded-md border text-left text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary-50 text-text font-medium'
                          : 'border-border bg-surface hover:bg-surface-muted text-text-muted'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-2">
            <Button size="lg" onClick={handleSubmit} isLoading={submitting} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Submit & Generate Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
