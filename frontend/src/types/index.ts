export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  full_name?: string;
  onboarding_completed?: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  college_name?: string;
  degree?: string;
  branch?: string;
  current_year?: number;
  current_semester?: number;
  graduation_year?: number;
  weekly_hours: number;
  target_role?: string;
  career_interests: string[];
  preferred_learning_style?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerPathSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  overview: string;
  active: boolean;
}

export interface CareerCompetency {
  skill_name: string;
  category: string;
  target_level: string;
  priority: string;
}

export interface CareerPathDetail extends CareerPathSummary {
  responsibilities: string[];
  learning_sequence: Array<{ phase: string; focus: string }>;
  portfolio_projects: Array<{ title: string; tech: string }>;
  interview_topics: string[];
  competencies: CareerCompetency[];
}

export interface RoadmapTask {
  id: string;
  phase_id: string;
  title: string;
  description?: string;
  estimated_hours: number;
  status: 'todo' | 'in_progress' | 'completed';
  resource_url?: string;
  notes?: string;
  sort_order: number;
  completed_at?: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  tasks: RoadmapTask[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  career_path_id?: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  phases: RoadmapPhase[];
}

export interface StudentSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill: {
    id: string;
    name: string;
    category: string;
    description?: string;
  };
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  evidence_type: string;
  last_assessed_at: string;
  updated_at: string;
}

export interface SkillGapItem {
  skill_name: string;
  category: string;
  target_level: string;
  current_level?: string;
  status: 'acquired' | 'to_strengthen' | 'missing';
  priority: string;
  related_roadmap_task?: string;
}

export interface SkillGapAnalysis {
  target_role: string;
  total_competencies: number;
  matching_skills_count: number;
  readiness_percentage: number;
  skills: SkillGapItem[];
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  target_role?: string;
  review_score: number;
  score_breakdown: Record<string, number>;
  parsed_sections: Record<string, any>;
  strengths: string[];
  missing_elements: string[];
  actionable_suggestions: Array<{ section?: string; issue?: string; suggestion: string }>;
  created_at: string;
}

export interface Resume {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  latest_analysis?: ResumeAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface InterviewQuestion {
  id: string;
  question_text: string;
  category?: string;
  sort_order: number;
  answer?: {
    answer_text: string;
    feedback: {
      correctness_score?: number;
      clarity_score?: number;
      completeness_score?: number;
      strengths?: string[];
      improvements?: string[];
      sample_better_answer?: string;
    };
  };
}

export interface InterviewSession {
  id: string;
  target_role: string;
  interview_type: string;
  difficulty: string;
  status: 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string;
  questions: InterviewQuestion[];
  summary?: {
    total_questions: number;
    answered_questions: number;
    average_correctness: number;
    average_clarity: number;
    average_completeness: number;
    overall_evaluation: string;
  };
}

export interface PracticeQuestion {
  id: string;
  question_type: 'aptitude' | 'coding';
  title: string;
  prompt: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty: string;
  topic: string;
  constraints?: string;
  input_output_examples?: Array<{ input: string; output: string }>;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  work_mode: string;
  employment_type: string;
  description: string;
  required_skills: string[];
  eligibility_text?: string;
  application_url: string;
  source_name: string;
  last_verified_at: string;
  deadline?: string;
  status: string;
  is_demo: boolean;
  is_saved: boolean;
  application_status?: string;
  profile_alignment?: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  notes?: string;
  updated_at: string;
  job: JobListing;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  link?: string;
  read_at?: string;
  created_at: string;
}

export interface ReadinessMetric {
  label: string;
  score: number;
  weight: number;
  description: string;
  action_item: string;
}

export interface ReadinessOverview {
  overall_readiness_score: number;
  rating_label: string;
  metrics: ReadinessMetric[];
  next_actions: Array<{ title: string; link: string; type: string }>;
  disclaimer: string;
}
