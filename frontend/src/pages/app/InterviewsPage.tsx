import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { InterviewSession, InterviewQuestion } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Mic,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Award,
  Clock
} from 'lucide-react';

export const InterviewsPage: React.FC = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  // New session modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Full-Stack Developer');
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(3);
  const [creating, setCreating] = useState(false);

  // Active question answering
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any | null>(null);

  const fetchSessions = async () => {
    try {
      const data = await api.interviews.list();
      setSessions(data);
      if (data.length > 0 && !activeSession) {
        // Find in_progress or latest
        const inProg = data.find((s: InterviewSession) => s.status === 'in_progress');
        setActiveSession(inProg || data[0]);
      }
    } catch (err) {
      console.error('Failed to load interview sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await api.interviews.create({
        target_role: targetRole,
        interview_type: interviewType,
        difficulty,
        question_count: questionCount,
      });
      setActiveSession(created);
      setCurrentQuestionIndex(0);
      setCurrentFeedback(null);
      setStudentAnswer('');
      setNewModalOpen(false);
      await fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to start interview session.');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectSession = async (id: string) => {
    try {
      const s = await api.interviews.get(id);
      setActiveSession(s);
      // Find first unanswered question
      const unansIdx = s.questions.findIndex((q: InterviewQuestion) => !q.answer);
      setCurrentQuestionIndex(unansIdx !== -1 ? unansIdx : 0);
      setCurrentFeedback(s.questions[unansIdx !== -1 ? unansIdx : 0]?.answer?.feedback || null);
      setStudentAnswer('');
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeSession || !studentAnswer.trim()) return;
    const currentQ = activeSession.questions[currentQuestionIndex];
    if (!currentQ) return;

    setSubmittingAnswer(true);
    try {
      const res = await api.interviews.submitAnswer(activeSession.id, currentQ.id, studentAnswer);
      setCurrentFeedback(res.feedback);

      // Refresh session
      const refreshed = await api.interviews.get(activeSession.id);
      setActiveSession(refreshed);
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!activeSession) return;
    try {
      const completed = await api.interviews.complete(activeSession.id);
      setActiveSession(completed);
      await fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to complete session.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-28 w-full" />
        <LoadingSkeleton className="h-72 w-full" />
      </div>
    );
  }

  const currentQ = activeSession?.questions[currentQuestionIndex];
  const hasAnswered = !!currentQ?.answer || !!currentFeedback;
  const isLastQuestion = currentQuestionIndex === (activeSession?.questions.length || 1) - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Mic className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text">Structured Mock Interviews</h2>
          </div>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed">
            Practice technical, behavioral, and HR questions evaluated with strict rubric standards (correctness, clarity, and completeness).
          </p>
        </div>

        <Button size="md" onClick={() => setNewModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          New Interview Session
        </Button>
      </div>

      {activeSession ? (
        <div className="space-y-6">
          {/* Active Session Status Bar */}
          <Card className="border-primary/20 bg-primary-50/10">
            <CardHeader className="py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Badge variant="primary">{activeSession.target_role}</Badge>
                <Badge variant="outline" className="capitalize">{activeSession.interview_type} Round</Badge>
                <Badge variant="default">{activeSession.difficulty}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">
                  Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
                {activeSession.status === 'completed' && (
                  <Badge variant="success">Completed</Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Question Stepper Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {activeSession.questions.map((q, idx) => {
              const isAnswered = !!q.answer;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setCurrentFeedback(q.answer?.feedback || null);
                    setStudentAnswer(q.answer?.answer_text || '');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-white border-primary'
                      : isAnswered
                      ? 'bg-success-50 text-success-600 border-success/30'
                      : 'bg-surface text-text-muted border-border hover:bg-surface-muted'
                  }`}
                >
                  {isAnswered && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Question {idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Current Question & Answer Area */}
          {currentQ && (
            <Card>
              <CardHeader className="py-4 px-6 border-b border-border/60">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                  {currentQ.category || 'Technical Prompt'}
                </span>
                <CardTitle className="text-base font-semibold leading-relaxed">
                  {currentQ.question_text}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Answer Input or Submitted Answer */}
                <div>
                  <Label htmlFor="answerText">Your Response</Label>
                  <Textarea
                    id="answerText"
                    rows={5}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    disabled={hasAnswered && activeSession.status === 'completed'}
                    placeholder="Type your structured answer here. State your assumptions, trade-offs, and reasoning clearly..."
                  />
                </div>

                {!hasAnswered && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSubmitAnswer}
                      isLoading={submittingAnswer}
                      disabled={!studentAnswer.trim()}
                      rightIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Submit for Rubric Evaluation
                    </Button>
                  </div>
                )}

                {/* Structured Rubric Feedback Display */}
                {currentFeedback && (
                  <div className="mt-4 p-5 bg-surface-muted/50 rounded-lg border border-border space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-text">Rubric Evaluation Scores</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-primary">Correctness: {currentFeedback.correctness_score}/10</span>
                        <span className="text-text">Clarity: {currentFeedback.clarity_score}/10</span>
                        <span className="text-text-muted">Completeness: {currentFeedback.completeness_score}/10</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-success-600 block mb-1">Observed Strengths:</span>
                        <ul className="list-disc pl-4 space-y-1 text-text-muted">
                          {currentFeedback.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-semibold text-warning-600 block mb-1">Areas for Improvement:</span>
                        <ul className="list-disc pl-4 space-y-1 text-text-muted">
                          {currentFeedback.improvements?.map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {currentFeedback.sample_better_answer && (
                      <div className="p-3 bg-surface rounded-md border border-border/80 text-xs">
                        <div className="flex items-center gap-1.5 text-primary font-semibold mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Model Answer Structure</span>
                        </div>
                        <p className="text-text-muted leading-relaxed">
                          {currentFeedback.sample_better_answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="py-3 px-6 border-t border-border/60 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    const prevIdx = currentQuestionIndex - 1;
                    setCurrentQuestionIndex(prevIdx);
                    const prevQ = activeSession.questions[prevIdx];
                    setCurrentFeedback(prevQ?.answer?.feedback || null);
                    setStudentAnswer(prevQ?.answer?.answer_text || '');
                  }}
                >
                  Previous Question
                </Button>

                {!isLastQuestion ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      const nextIdx = currentQuestionIndex + 1;
                      setCurrentQuestionIndex(nextIdx);
                      const nextQ = activeSession.questions[nextIdx];
                      setCurrentFeedback(nextQ?.answer?.feedback || null);
                      setStudentAnswer(nextQ?.answer?.answer_text || '');
                    }}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Next Question
                  </Button>
                ) : activeSession.status !== 'completed' ? (
                  <Button size="sm" onClick={handleCompleteSession} rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Finish Session & View Summary
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          )}

          {/* Session Summary if completed */}
          {activeSession.status === 'completed' && activeSession.summary && (
            <Card className="border-success/20 bg-success-50/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                  <CardTitle className="text-sm">Session Complete Summary</CardTitle>
                </div>
                <CardDescription>
                  {activeSession.summary.overall_evaluation}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-surface rounded-md border border-border">
                  <span className="text-[10px] text-text-muted uppercase block">Avg Correctness</span>
                  <span className="text-lg font-bold text-primary">{activeSession.summary.average_correctness} / 10</span>
                </div>
                <div className="p-3 bg-surface rounded-md border border-border">
                  <span className="text-[10px] text-text-muted uppercase block">Avg Clarity</span>
                  <span className="text-lg font-bold text-text">{activeSession.summary.average_clarity} / 10</span>
                </div>
                <div className="p-3 bg-surface rounded-md border border-border">
                  <span className="text-[10px] text-text-muted uppercase block">Avg Completeness</span>
                  <span className="text-lg font-bold text-text">{activeSession.summary.average_completeness} / 10</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Mic}
          title="No Mock Interview Sessions Yet"
          description="Start a timed technical, behavioral, or HR interview round with automated rubric feedback."
          actionLabel="Start Mock Interview"
          onAction={() => setNewModalOpen(true)}
        />
      )}

      {/* History List */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-5">
            <CardTitle className="text-xs uppercase tracking-wider text-text-muted">
              Past Interview Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className="p-4 hover:bg-surface-muted/40 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-text block">{s.target_role} ({s.interview_type})</span>
                  <span className="text-[11px] text-text-muted">
                    {s.questions.length} Questions · {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant={s.status === 'completed' ? 'success' : 'default'} className="text-[10px]">
                  {s.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* New Interview Dialog */}
      <Dialog
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Configure Mock Interview Round"
        description="Select the focus, format, and difficulty for this drill."
      >
        <form onSubmit={handleStartSession} className="space-y-4">
          <div>
            <Label htmlFor="intRole">Target Role</Label>
            <Input
              id="intRole"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full-Stack Developer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="intType">Interview Type</Label>
              <Select id="intType" value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                <option value="technical">Technical Round</option>
                <option value="hr">HR & Culture Fit</option>
                <option value="behavioral">Behavioral (STAR Method)</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="intDiff">Difficulty Level</Label>
              <Select id="intDiff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy (Campus Screening)</option>
                <option value="Medium">Medium (Standard Technical)</option>
                <option value="Hard">Hard (Deep Dive)</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="intCount">Number of Questions</Label>
            <Select id="intCount" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
              <option value={3}>3 Questions (Quick Drill)</option>
              <option value={4}>4 Questions (Standard)</option>
              <option value={5}>5 Questions (Comprehensive)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setNewModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={creating}>
              Begin Mock Interview
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
