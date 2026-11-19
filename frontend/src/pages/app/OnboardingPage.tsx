import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states initialized from existing profile
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [collegeName, setCollegeName] = useState(profile?.college_name || '');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science & Engineering');
  const [currentYear, setCurrentYear] = useState<number>(profile?.current_year || 3);
  const [graduationYear, setGraduationYear] = useState<number>(profile?.graduation_year || 2026);
  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Full-Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_hours || 10);
  const [learningStyle, setLearningStyle] = useState(profile?.preferred_learning_style || 'Hands-on projects');

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.college_name) setCollegeName(profile.college_name);
      if (profile.degree) setDegree(profile.degree);
      if (profile.branch) setBranch(profile.branch);
      if (profile.current_year) setCurrentYear(profile.current_year);
      if (profile.graduation_year) setGraduationYear(profile.graduation_year);
      if (profile.target_role) setTargetRole(profile.target_role);
      if (profile.weekly_hours) setWeeklyHours(profile.weekly_hours);
      if (profile.preferred_learning_style) setLearningStyle(profile.preferred_learning_style);
    }
  }, [profile]);

  const saveCurrentProgress = async (completed = false) => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName,
        college_name: collegeName,
        degree,
        branch,
        current_year: Number(currentYear),
        graduation_year: Number(graduationYear),
        target_role: targetRole,
        weekly_hours: Number(weeklyHours),
        preferred_learning_style: learningStyle,
        onboarding_completed: completed,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      if (completed) {
        navigate('/app/dashboard');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    await saveCurrentProgress(false);
    setStep((prev) => Math.min(3, prev + 1));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const finishOnboarding = async () => {
    await saveCurrentProgress(true);
  };

  const targetRolesList = [
    'Full-Stack Developer',
    'Backend Developer',
    'Frontend Developer',
    'AI / Machine Learning Engineer',
    'Cloud & DevOps Engineer',
    'Data Analyst',
    'Cybersecurity Analyst',
    'QA / Test Automation Engineer'
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? 'Academic Information' : step === 2 ? 'Target Career Goal' : 'Preparation Preferences'}</span>
        </div>
        <Progress value={(step / 3) * 100} size="sm" />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Academic Profile'}
            {step === 2 && 'Target Role & Direction'}
            {step === 3 && 'Schedule & Preparation Style'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Help CareerSaathi tailor roadmap timelines and eligibility notices to your batch.'}
            {step === 2 && 'Select your intended career path to generate relevant competency milestones.'}
            {step === 3 && 'Set a sustainable preparation commitment that fits with your coursework.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {savedSuccess && (
            <div className="p-2.5 bg-success-50 border border-success/20 rounded-md text-xs text-success-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Details saved successfully.</span>
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                />
              </div>

              <div>
                <Label htmlFor="college">College / University Name</Label>
                <Input
                  id="college"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Select id="degree" value={degree} onChange={(e) => setDegree(e.target.value)}>
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="BCA">BCA / MCA</option>
                    <option value="B.Sc">B.Sc / M.Sc Computer Science</option>
                    <option value="Other">Other Undergraduate Degree</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="branch">Branch / Major</Label>
                  <Input
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science & Engineering"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Current Year</Label>
                  <Select id="year" value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}>
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year (Pre-final)</option>
                    <option value={4}>4th Year (Final Year)</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gradYear">Graduation Year</Label>
                  <Select id="gradYear" value={graduationYear} onChange={(e) => setGraduationYear(Number(e.target.value))}>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="targetRole">Primary Target Role</Label>
                <Select
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  {targetRolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] text-text-muted mt-1">
                  You can explore other career paths or change your focus anytime.
                </p>
              </div>

              <div className="p-4 bg-surface-muted/60 rounded-md border border-border">
                <span className="text-xs font-semibold text-text block mb-1">
                  Not sure which role fits best?
                </span>
                <p className="text-xs text-text-muted leading-relaxed mb-3">
                  You can complete the self-guided Career Assessment after onboarding to compare your strengths across multiple career options.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="weeklyHours">Weekly Preparation Time Commitment</Label>
                <Select
                  id="weeklyHours"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                >
                  <option value={6}>6 hours/week (Light maintenance)</option>
                  <option value={10}>10 hours/week (Recommended standard)</option>
                  <option value={15}>15 hours/week (Intensive preparation)</option>
                  <option value={20}>20+ hours/week (Placement season focus)</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="learningStyle">Preferred Learning Style</Label>
                <Select
                  id="learningStyle"
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                >
                  <option value="Hands-on projects">Hands-on project building</option>
                  <option value="Structured problem solving">Algorithmic & question drills</option>
                  <option value="Documentation & deep reading">Official docs & conceptual theory</option>
                  <option value="Video-led tutorials">Video courses with mini-exercises</option>
                </Select>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t border-border/60">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={prevStep} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button size="sm" onClick={nextStep} isLoading={loading} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Next Step
            </Button>
          ) : (
            <Button size="sm" onClick={finishOnboarding} isLoading={loading} rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Complete & Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
