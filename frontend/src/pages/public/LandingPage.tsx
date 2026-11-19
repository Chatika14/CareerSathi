import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  Map,
  FileCheck2,
  Mic,
  Calculator,
  Briefcase,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Layers,
  Award,
  CheckCircle2,
  Target
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pillars = [
    { title: 'Assess', desc: 'Identify core strengths & target role alignment.', icon: Compass },
    { title: 'Learn', desc: 'Step-by-step technical roadmaps with hours estimate.', icon: Map },
    { title: 'Practice', desc: 'Mock interviews, aptitude drills & coding bank.', icon: Calculator },
    { title: 'Apply', desc: 'Resume scoring & verified opportunity pipeline.', icon: Briefcase },
  ];

  const faqs = [
    {
      q: 'Does CareerSaathi make false hiring guarantees?',
      a: 'No. We provide structured preparation tools, verified rubrics, and skill gap tracking. We never fabricate hiring probabilities or ATS scores.'
    },
    {
      q: 'How is the preparation score determined?',
      a: 'Through completed milestones, documented technical skills, resume diagnostic scores, and practice drill performance.'
    },
    {
      q: 'Are uploaded resumes private?',
      a: 'Yes. Resumes are stored in private storage with server-side authorization. Only you can view or delete your documents.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col font-sans select-none">
      {/* Navbar */}
      <nav className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="font-bold text-base text-text">CareerSaathi</span>
          <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">AI</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-16 pb-12 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-surface border border-border px-3.5 py-1 rounded-full text-xs text-text-muted shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Placement & Career Preparation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text leading-tight">
          Your Skills. Your Career.<br />
          <span className="text-primary">Your Future.</span>
        </h1>

        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
          Structured, calm, and genuine preparation. Assess competencies, follow roadmaps, polish your resume, and drill interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Free
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Demo
            </Button>
          </Link>
        </div>

        {/* Visual Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 text-left">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="p-4 bg-surface rounded-xl border border-border shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-text">{p.title}</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Visual Card */}
      <section className="max-w-4xl mx-auto px-6 pb-16 w-full">
        <div className="p-4 sm:p-6 bg-surface rounded-2xl border border-border shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-text block">Full-Stack Engineer</span>
                <span className="text-[10px] text-text-muted">Target Competency Framework</span>
              </div>
            </div>
            <Badge variant="success" className="text-xs">
              82% Prepared
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-surface-muted/50 rounded-lg border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Roadmap</span>
              <span className="text-sm font-bold text-text mt-0.5 block">12 / 16 Tasks Done</span>
            </div>
            <div className="p-3 bg-surface-muted/50 rounded-lg border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Resume Review</span>
              <span className="text-sm font-bold text-primary mt-0.5 block">85 / 100 Score</span>
            </div>
            <div className="p-3 bg-surface-muted/50 rounded-lg border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Mock Drills</span>
              <span className="text-sm font-bold text-text mt-0.5 block">4 Technical Rounds</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="max-w-2xl mx-auto px-6 space-y-4">
          <h3 className="text-base font-bold text-text text-center">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg bg-background overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-text"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-3.5 pt-0 text-xs text-text-muted border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface px-6 py-6 text-xs text-text-muted">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CareerSaathi AI · Your Skills. Your Career. Your Future.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-text">Privacy</Link>
            <Link to="/terms" className="hover:text-text">Terms</Link>
            <Link to="/login" className="hover:text-text">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
