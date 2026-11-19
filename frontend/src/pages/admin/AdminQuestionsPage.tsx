import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PracticeQuestion } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { HelpCircle, Plus } from 'lucide-react';

export const AdminQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Question Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [qType, setQType] = useState('aptitude');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [optionsRaw, setOptionsRaw] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topic, setTopic] = useState('Quantitative Aptitude');
  const [constraints, setConstraints] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    try {
      const data = await api.practice.getQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const optionsArray = qType === 'aptitude'
        ? optionsRaw.split('\n').map((o) => o.trim()).filter(Boolean)
        : null;

      await api.admin.createQuestion({
        question_type: qType,
        title,
        prompt,
        options: optionsArray,
        correct_answer: correctAnswer,
        explanation,
        difficulty,
        topic,
        constraints: constraints || null,
      });

      setCreateOpen(false);
      // Reset
      setTitle('');
      setPrompt('');
      setOptionsRaw('');
      setCorrectAnswer('');
      setExplanation('');
      setConstraints('');
      await fetchQuestions();
    } catch (err: any) {
      alert(err.message || 'Failed to create question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Practice Question Bank</h2>
          <p className="text-xs text-text-muted">Manage quantitative, logical, and coding challenge questions.</p>
        </div>

        <Button size="sm" onClick={() => setCreateOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Question
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
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-6 text-right">Correct Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-surface-muted/30">
                      <td className="py-3.5 px-6 font-semibold text-text max-w-xs truncate">{q.title}</td>
                      <td className="py-3.5 px-4 capitalize">
                        <Badge variant={q.question_type === 'coding' ? 'primary' : 'default'} className="text-[10px]">
                          {q.question_type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">{q.topic}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={q.difficulty === 'Easy' ? 'success' : 'warning'} className="text-[10px]">
                          {q.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right text-text-muted max-w-xs truncate">
                        {q.correct_answer || 'Editorial'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Question Dialog */}
      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Practice Question"
        description="Add a new problem to the curated student repository."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qType">Question Type</Label>
              <Select id="qType" value={qType} onChange={(e) => setQType(e.target.value)}>
                <option value="aptitude">Aptitude / Logical (MCQ)</option>
                <option value="coding">Coding Challenge (DSA)</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="qDiff">Difficulty</Label>
              <Select id="qDiff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qTitle">Question Title</Label>
              <Input
                id="qTitle"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Work and Time Problem"
              />
            </div>

            <div>
              <Label htmlFor="qTopic">Topic</Label>
              <Input
                id="qTopic"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Quantitative, Arrays, Sliding Window..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="qPrompt">Problem Statement / Prompt</Label>
            <Textarea
              id="qPrompt"
              required
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Full text of the question or algorithmic problem..."
            />
          </div>

          {qType === 'aptitude' ? (
            <>
              <div>
                <Label htmlFor="qOptions">Options (One per line)</Label>
                <Textarea
                  id="qOptions"
                  required
                  rows={4}
                  value={optionsRaw}
                  onChange={(e) => setOptionsRaw(e.target.value)}
                  placeholder="6 days&#10;8 days&#10;10 days&#10;12 days"
                />
              </div>

              <div>
                <Label htmlFor="qAns">Correct Option String (Exact Match)</Label>
                <Input
                  id="qAns"
                  required
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="8 days"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="qConstraints">Constraints & Input/Output Specs</Label>
                <Textarea
                  id="qConstraints"
                  rows={2}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="1 <= nums.length <= 10^4"
                />
              </div>

              <div>
                <Label htmlFor="qCodeAns">Optimal Approach Summary</Label>
                <Input
                  id="qCodeAns"
                  required
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Hash map single-pass in O(n) time."
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="qExp">Detailed Explanation / Editorial</Label>
            <Textarea
              id="qExp"
              required
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Step-by-step formula or algorithm walkthrough..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={submitting}>
              Save Question
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
