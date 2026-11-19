import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { SignupPage } from '@/pages/public/SignupPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { PrivacyPage, TermsPage } from '@/pages/public/LegalPages';

// Student App Pages
import { DashboardPage } from '@/pages/app/DashboardPage';
import { OnboardingPage } from '@/pages/app/OnboardingPage';
import { AssessmentPage } from '@/pages/app/AssessmentPage';
import { CareersPage } from '@/pages/app/CareersPage';
import { CareerDetailPage } from '@/pages/app/CareerDetailPage';
import { RoadmapPage } from '@/pages/app/RoadmapPage';
import { SkillsPage } from '@/pages/app/SkillsPage';
import { ResumePage } from '@/pages/app/ResumePage';
import { AssistantPage } from '@/pages/app/AssistantPage';
import { InterviewsPage } from '@/pages/app/InterviewsPage';
import { AptitudePage } from '@/pages/app/AptitudePage';
import { CodingPage } from '@/pages/app/CodingPage';
import { JobsPage } from '@/pages/app/JobsPage';
import { ApplicationsPage } from '@/pages/app/ApplicationsPage';
import { NotificationsPage } from '@/pages/app/NotificationsPage';
import { SettingsPage } from '@/pages/app/SettingsPage';

// Admin Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage';
import { AdminQuestionsPage } from '@/pages/admin/AdminQuestionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Student App Protected Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="profile" element={<OnboardingPage />} />
              <Route path="assessment" element={<AssessmentPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="careers/:careerId" element={<CareerDetailPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="roadmap/:roadmapId" element={<RoadmapPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="interviews/:sessionId" element={<InterviewsPage />} />
              <Route path="practice/aptitude" element={<AptitudePage />} />
              <Route path="practice/coding" element={<CodingPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/:jobId" element={<JobsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Console Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="questions" element={<AdminQuestionsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
