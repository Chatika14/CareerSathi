import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { AlertCircle, User, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail('student@careersaathi.ai');
    setPassword('StudentPass123!');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@careersaathi.ai');
    setPassword('AdminPass123!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="font-bold text-base text-text">CareerSaathi</span>
          <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">AI</span>
        </Link>
      </div>

      <Card className="w-full max-w-sm shadow-sm rounded-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-base font-bold">Sign In</CardTitle>
          <CardDescription className="text-xs">Enter your student or admin credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-md text-xs text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="student@careersaathi.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={loading} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-border">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2 text-center">
              1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-surface-muted hover:bg-border/60 text-text rounded-md text-xs font-semibold border border-border transition-colors"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-surface-muted hover:bg-border/60 text-text rounded-md text-xs font-semibold border border-border transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-danger" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-text-muted">
        No account yet?{' '}
        <Link to="/signup" className="text-primary font-bold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};
