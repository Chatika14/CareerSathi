import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text py-12 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-text-muted">Effective Date: November 2026</p>

        <div className="space-y-4 text-xs text-text leading-relaxed bg-surface p-6 rounded-lg border border-border">
          <section>
            <h3 className="font-semibold text-sm mb-1">1. Information We Collect</h3>
            <p className="text-text-muted">
              CareerSaathi AI collects information provided directly by students during registration and onboarding, including name, educational background, technical skills, resume PDF files, and self-assessment responses.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-sm mb-1">2. How Your Data Is Used</h3>
            <p className="text-text-muted">
              Your data is utilized strictly to provide personalized career roadmaps, resume analysis, mock interview rubrics, and skill-gap comparisons. We do not sell your personal data or provide it to third-party advertisers.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-sm mb-1">3. Private Resume Storage</h3>
            <p className="text-text-muted">
              Uploaded resumes are stored in private storage accessible only through authenticated server-side sessions. Resumes and associated text extractions can be permanently deleted by the student at any time.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-sm mb-1">4. AI Processing Safety</h3>
            <p className="text-text-muted">
              Model interactions are conducted through encrypted backend service adapters. We do not transmit personally identifiable credentials or sensitive financial identifiers to AI providers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text py-12 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">Terms of Use</h1>
        <p className="text-xs text-text-muted">Effective Date: November 2026</p>

        <div className="space-y-4 text-xs text-text leading-relaxed bg-surface p-6 rounded-lg border border-border">
          <section>
            <h3 className="font-semibold text-sm mb-1">1. Educational & Preparation Scope</h3>
            <p className="text-text-muted">
              CareerSaathi AI is an educational guidance tool designed to assist with placement preparation. The platform does not guarantee hiring outcomes, interview shortlists, or minimum compensation packages.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-sm mb-1">2. Non-Adversarial Use & Code Execution</h3>
            <p className="text-text-muted">
              Users agree not to submit malicious scripts, exploit server environments, or attempt to bypass role-based access boundaries. Coding questions are provided for algorithmic study and review.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-sm mb-1">3. Accuracy of Student Submissions</h3>
            <p className="text-text-muted">
              Students are responsible for the factual accuracy of their resumes and skill self-reports. CareerSaathi AI reviews documents for structural clarity and keyword coverage but does not independently verify external employment history.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
