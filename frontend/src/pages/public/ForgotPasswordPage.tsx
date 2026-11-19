import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your account email to receive recovery instructions</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-success-50 text-success-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-text font-medium">Recovery instructions sent</p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                If an account exists for <span className="font-semibold text-text">{email}</span>, a secure password reset link has been dispatched.
              </p>
              <Link to="/login" className="inline-block mt-3">
                <Button variant="outline" size="sm">Return to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="student@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center mt-2">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
