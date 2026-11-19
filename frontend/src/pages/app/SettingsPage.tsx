import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Settings, ShieldCheck, Sparkles, CheckCircle2, User } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Full-Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours || 10);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        target_role: targetRole,
        weekly_hours: Number(weeklyHours),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface p-6 rounded-lg border border-border shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-text">Account & Preparation Settings</h2>
        </div>
        <p className="text-xs text-text-muted">
          Manage your student profile preferences, preparation schedule, and AI service integration details.
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Student Account Credentials</CardTitle>
          <CardDescription>Authentication details registered with CareerSaathi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-muted block font-medium">Registered Email</span>
              <span className="font-semibold text-text mt-0.5 block">{user?.email}</span>
            </div>
            <div>
              <span className="text-text-muted block font-medium">Platform Role</span>
              <Badge variant={user?.role === 'admin' ? 'danger' : 'primary'} className="mt-0.5 capitalize text-[10px]">
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Preferences */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Preparation Preferences</CardTitle>
            <CardDescription>Adjust your primary target role and study commitment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {savedSuccess && (
              <div className="p-2.5 bg-success-50 border border-success/20 rounded-md text-xs text-success-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Preferences updated successfully.</span>
              </div>
            )}

            <div>
              <Label htmlFor="prefName">Full Name</Label>
              <Input
                id="prefName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prefRole">Target Role</Label>
                <Input
                  id="prefRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="prefHours">Weekly Hours Commitment</Label>
                <Select
                  id="prefHours"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                >
                  <option value={6}>6 hours/week</option>
                  <option value={10}>10 hours/week</option>
                  <option value={15}>15 hours/week</option>
                  <option value={20}>20+ hours/week</option>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-3 px-6 border-t border-border/60 flex justify-end">
            <Button size="sm" type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* AI Integration Diagnostic */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">AI Integration & Provider Status</CardTitle>
          </div>
          <CardDescription>Status of the backend intelligent evaluation pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-text-muted leading-relaxed">
          <div className="flex items-center justify-between p-3 bg-surface-muted/50 rounded-md border border-border">
            <span>Provider Engine:</span>
            <Badge variant="primary" className="text-[10px]">Google Gemini / OpenAI / Offline Heuristics</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-muted/50 rounded-md border border-border">
            <span>Safety Guardrails:</span>
            <span className="text-success-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Enforced
            </span>
          </div>
          <p className="text-[11px] text-text-muted pt-2">
            To configure live Gemini or OpenAI API keys, set <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> in your backend <code>.env</code> file. When running without external keys, CareerSaathi operates using deterministic, safe offline evaluation rubrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
