# CareerSaathi AI — Database Schema & Data Dictionary

## 1. Relational Entity Overview

| Table | Primary Key | Description |
|---|---|---|
| `users` | `id` (UUID) | Core credentials, email, password hash, role (`student` or `admin`). |
| `profiles` | `id` (FK `users.id`) | Academic details, graduation year, target role, weekly commitment. |
| `skills` | `id` (UUID) | Master catalog of technical and soft skills grouped by category. |
| `student_skills` | `id` (UUID) | Student skill proficiency (`Beginner`, `Intermediate`, `Advanced`), evidence basis. |
| `career_paths` | `id` (UUID) | Curated career paths (overview, responsibilities, sequences, project ideas). |
| `career_competencies` | `id` (UUID) | Competency requirements mapping career paths to required skills and target levels. |
| `career_assessments` | `id` (UUID) | Self-assessment submissions and structured career recommendations. |
| `roadmaps` | `id` (UUID) | Active and archived milestone roadmaps. |
| `roadmap_phases` | `id` (UUID) | Sequential milestones/phases for a roadmap. |
| `roadmap_tasks` | `id` (UUID) | Actionable tasks, estimated hours, status (`todo`, `in_progress`, `completed`), notes. |
| `resumes` | `id` (UUID) | Uploaded resume files, file size, storage paths, extracted text. |
| `resume_analyses` | `id` (UUID) | CareerSaathi review scores (0-100), metric breakdowns, rewrite suggestions. |
| `chat_conversations` | `id` (UUID) | Context-aware AI assistant conversation sessions. |
| `chat_messages` | `id` (UUID) | Individual user and assistant messages. |
| `interview_sessions` | `id` (UUID) | Mock interview rounds (role, type, difficulty, summary scores). |
| `interview_questions` | `id` (UUID) | Questions assigned to an interview round. |
| `interview_answers` | `id` (UUID) | Student answers and structured rubric evaluations. |
| `practice_questions` | `id` (UUID) | Curated question bank for aptitude MCQs and coding problem statements. |
| `practice_attempts` | `id` (UUID) | Student answer submissions and accuracy verification records. |
| `job_listings` | `id` (UUID) | Verified job & internship listings with source URLs and verification dates. |
| `saved_jobs` | `id` (UUID) | Bookmarked job openings per student. |
| `job_applications` | `id` (UUID) | Application pipeline tracking across stages (`saved` to `offer`). |
| `notifications` | `id` (UUID) | In-app notification alerts for milestones and reviews. |
| `ai_usage_logs` | `id` (UUID) | Token metrics, latencies, provider names, and execution statuses. |

## 2. Row Level Security & Isolation Rules
- Student endpoints enforce `user_id == current_user.id` on all queries.
- Admin endpoints enforce `current_user.role == 'admin'` through FastAPI dependency injection (`get_current_admin`).
- Resume files are stored in a non-public storage directory accessible only through authenticated API routes.
